/**
 * dm.ts
 *
 * Contains the functions of all dm* functions.
 */

import HTTPError from 'http-errors';
import { getData, getHashOf, setData } from './dataStore';

interface DmId {
  dmId: number;
}

interface Member {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

interface DmDataStoreObject {
  dmId: number,
  name: string,
  owner: number,
  members: number[],
  messages: Message[],
}

interface DmObject {
  dmId: number;
  name: string;
}

interface Dms {
  dms: DmObject[];
}

interface DmDetails {
  name: string;
  members: Member[];
}

interface DmMessages {
  messages: Message[];
  start: number;
  end: number;
}

const NO_MORE_MESSAGES = -1;
const FIFTY_MESSAGES = 50;

/**
 * dmCreate
 *
 * Creates a new Id between the creator and all uIds
 * listed in the array passed through.
 *
 * @param { string } token
 * @param { number[] } uIds
 * @returns {{ DmId: number }}
 */
function dmCreate(token: string, uIds: number[]): DmId {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (hasDuplicates(uIds)) {
    throw HTTPError(400, 'uId array cannot contain duplicates');
  }

  for (const user of uIds) {
    if (!isUserId(user)) {
      throw HTTPError(400, 'A user Id given does not exist');
    }
  }

  const data = getData();

  const dmId = data.dms.length as number;
  const ownerId = getIdFromToken(token);
  const memberIds = uIds;
  memberIds.push(ownerId);
  const dmName = generateDmName(memberIds);

  const dmObject: DmDataStoreObject = {
    dmId: dmId,
    name: dmName,
    owner: ownerId,
    members: memberIds,
    messages: [],
  };

  data.dms.push(dmObject);

  // Creates the notifications for all users in the uIds array
  dmInviteNotif(token, dmId, uIds);

  setData(data);

  return { dmId: dmId };
}

/**
 * dmInviteNotif
 *
 * Given a token, dmId, and array of uIds, generates and pushes
 * a notification to each person being added to the dm.
 *
 * @param { string } token
 * @param { number } dmId
 * @param { number[] } uIds
 */
function dmInviteNotif(token: string, dmId: number, uIds: number[]) {
  const data = getData();
  const addingId = getIdFromToken(token);

  const notification = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: `@${data.users[addingId].userHandle} added you to ${data.dms[dmId].name}`
  };

  for (const uId of uIds) {
    data.users[uId].notifications.push(notification);
  }
}

/**
 * dmList
 *
 * Given a valid user token, lists of all the Dm's
 * that the user is a member of.
 *
 * @param { string } token
 * @returns { dms: [] }
 */
function dmList(token: string): Dms {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const uId = getIdFromToken(token);
  const data = getData();
  const dmArray = [];

  for (const dm of data.dms) {
    for (const id of dm.members) {
      if (id === uId) {
        dmArray.push(dm.dmId);
      }
    }
  }

  const dmList = createDmList(dmArray);

  return { dms: dmList };
}

/**
 * dmRemove
 *
 * Remove an existing DM, so all members are no longer in the DM.
 * This can only be done by the original creator of the DM.
 *
 * Warning: This method leaves essentially useless empty dms inside
 * of the dataStore that contain no users, but the dm still exists
 * The dm at index dmId will be a 'ghost' dm
 *
 * @param { string } token
 * @param { number } dmId
 * @returns {{ }}
 */
function dmRemove(token: string, dmId: number): Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const data = getData();
  const removerId = getIdFromToken(token);

  if (!isMember(removerId, dmId)) {
    throw HTTPError(400, 'User is not a member of the DM');
  }

  if (!isOwner(removerId, dmId)) {
    throw HTTPError(400, 'User is not the owner of the DM');
  }

  data.dms[dmId].members = [];

  setData(data);

  return {};
}

/**
 * dmDetails
 *
 * Given a DM with ID dmId that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * @param { string } token
 * @param { number } dmId
 * @returns {{ DmDetails }}
 */
function dmDetails(token: string, dmId: number): DmDetails {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const dm = getData().dms[dmId];
  const id = getIdFromToken(token);

  if (!isMember(id, dmId)) {
    throw HTTPError(400, 'User is not a member of the DM');
  }

  const usersArray = [];
  const sortedDmMembers = dm.members.sort();

  for (const member of sortedDmMembers) {
    const user = createUserObject(member);
    usersArray.push(user);
  }

  const dmName = dm.name;

  return {
    name: dmName,
    members: usersArray
  };
}

/**
 * dmLeave
 *
 * Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist
 * if this happens. This does not update the name of the DM.
 *
 * @param { string } token
 * @param { number } dmId
 * @returns {{ }}
 */
function dmLeave(token: string, dmId: number): Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const data = getData();
  const id = getIdFromToken(token);

  if (!data.dms[dmId].members.includes(id)) {
    throw HTTPError(400, 'User is not a member of the DM');
  }

  const dmMembers = data.dms[dmId].members;
  const idIndex = dmMembers.indexOf(id);
  dmMembers.splice(idIndex, 1);

  setData(data);

  return {};
}

/**
 * dmMessages
 *
 * Given a user Token, dmId, and start value, returns a
 * list of 50 messages from index start to start + 50.
 *
 * @param { string } token
 * @param { number } dmId
 * @param { number } start
 * @returns {{ DmMessages }}
 */
function dmMessages(token: string, dmId: number, start: number): DmMessages {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dmId');
  }

  const data = getData();
  const dm = data.dms[dmId];
  const id = getIdFromToken(token);

  if (!data.dms[dmId].members.includes(id)) {
    throw HTTPError(400, 'User is not a member of the DM');
  }

  if (start > data.dms[dmId].messages.length) {
    throw HTTPError(400, 'Invalid Start (Start is greater than total messages)');
  }

  // If the messages array is empty, simply return empty messages
  if (dm.messages.length === 0) {
    return {
      messages: [],
      start: start,
      end: -1,
    };
  }

  const returnMessages: Message[] = [];
  const returnEnd = (start + FIFTY_MESSAGES > dm.messages.length) ? NO_MORE_MESSAGES : start + FIFTY_MESSAGES;

  // As messages are returned from most recent (greatest index) to least recent (lowest index)
  // the start and end of the messages returned are different to those stated in the returned object.
  let realStart: number, realEnd: number;

  // If there are less than 50 total messages sent, ensures the loop adding messages into the return
  // does not access negative array indexes.
  realEnd = (dm.messages.length - start - 50 < 0) ? 0 : dm.messages.length - start - 50;

  // Used to determine the index of the first message being added into the returned messages array.
  // Accounts for negative start indexes as well.
  realStart = (start < 0) ? realEnd + start + 50 : dm.messages.length - start - 1;
  realStart = (realStart >= dm.messages.length) ? dm.messages.length - 1 : realStart;

  if (start <= -50) {
    realStart = -1;
    realEnd = 0;
  }

  for (let i = realStart; i >= realEnd; i--) {
    const message = {
      messageId: dm.messages[i].messageId,
      uId: dm.messages[i].uId,
      message: dm.messages[i].message,
      timeSent: Number(dm.messages[i].timeSent)
    };
    returnMessages.push(message);
  }

  return {
    messages: returnMessages,
    start: start,
    end: returnEnd,
  };
}

export { dmCreate, dmLeave, dmMessages, dmDetails, dmRemove, dmList };

/** Helper Functions **/

/**
 * isValidToken
 *
 * Given a token returns whether the token exists
 * within the dataStore or not.
 *
 * @param { string } token
 * @returns { boolean }
 */
function isValidToken(token: string): boolean {
  const data = getData();
  const hashedToken = getHashOf(token);

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(hashedToken)) {
      return true;
    }
  }
  return false;
}

/**
 * isUserId
 *
 * Given a uId checks if that uId exists
 *
 * @param { number } id
 * @returns { boolean }
 */
function isUserId(id: number): boolean {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
}

/**
 * hasDuplicates
 *
 * Given an array checks if there a duplicates contained
 * with in. Utilises set theory to check.
 *
 * @param { array } array
 * @returns
 */
function hasDuplicates(array: any[]): boolean {
  const arraySet = new Set(array);
  if (array.length !== arraySet.size) {
    return true;
  } else {
    return false;
  }
}

/**
 * getIdFromToken
 *
 * Given a token extracts the uId of the person
 * associated with that token.
 * Errors should not occur due to previous error test
 *
 * @param { string } token
 * @returns { number }
 */
function getIdFromToken(token: string): number {
  const data = getData();
  const hashedToken = getHashOf(token);

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(hashedToken)) {
      return user.uId;
    }
  }
}

/**
 * generateDmName
 *
 * Generates a concated string of all userhandles
 * that are contained within the array passed in
 *
 * @param { number[] } idArray
 * @returns { string }
 */
function generateDmName(idArray: number[]): string {
  const data = getData();

  const handleArray = [];
  let dmName = '';

  for (const id of idArray) {
    handleArray.push(data.users[id].userHandle);
  }

  handleArray.sort();

  for (const handle of handleArray) {
    dmName += handle;
    dmName += ', ';
  }

  dmName = dmName.substring(0, dmName.length - 2);

  return dmName;
}

/**
 * createDmList
 *
 * Given an array of dmIds, creates an array of objects
 * containing the dmd dmId and names.
 *
 * @param { number[] } dmIdArray
 * @returns { dmObject[] }
 */
function createDmList(dmIdArray: number[]): DmObject[] {
  const data = getData();
  const dms = [];

  for (const dm of data.dms) {
    if (dmIdArray.includes(dm.dmId)) {
      const dmObject = {
        dmId: dm.dmId,
        name: dm.name
      };
      dms.push(dmObject);
    }
  }
  const sortedDms = dms.sort();

  return sortedDms;
}

/**
 * isValidDmId
 *
 * Given a dmId returns whether it exists or not
 *
 * @param { number } dmId
 * @returns { boolean }
 */
function isValidDmId(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
}

/**
 * isMember
 *
 * Given a userId and dmId, returns whether the user is
 * in the dm.
 *
 * @param { number } uId
 * @param { number } dmId
 * @returns { boolean }
 */
function isMember(uId: number, dmId: number): boolean {
  const dm = getData().dms[dmId];

  for (const member of dm.members) {
    if (member === uId) {
      return true;
    }
  }
  return false;
}

/**
 * isOwner
 *
 * Given a userId and dmId, returns whether the user is
 * the owner of the Dm.
 *
 * @param { number } uId
 * @param { number } dmId
 * @returns { boolean }
 */
function isOwner(uId: number, dmId: number): boolean {
  const dm = getData().dms[dmId];

  if (dm.owner === uId) {
    return true;
  }

  return false;
}

/**
 * createUserObject
 *
 * Given a valid uId, returns an a user object
 * containing information from the given uId
 *
 * @param { number } uId
 * @returns { user }
 */
function createUserObject(uId: number) {
  const data = getData();
  const user = data.users[uId];

  const userObject = {
    uId: uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  return userObject;
}
