/**
 * dm.ts
 *
 * Contains the functions of all dm* functions.
 */

import { getData, setData } from './dataStore';

interface Error {
  error: string;
}

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

/**
 * dmCreate
 *
 * Creates a new Id between the creator and all uIds
 * listed in the array passed through.
 *
 * @param {string} token
 * @param {number[]} uIds
 * @returns {{ DmId: number }}
 */
function dmCreate(token: string, uIds: number[]): DmId | Error {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
  }

  if (hasDuplicates(uIds)) {
    return { error: 'uId array cannot contain duplicates' };
  }

  for (let i = 0; i < uIds.length; i++) {
    if (!isUserId(uIds[i])) {
      return { error: 'A user Id given does not exist' };
    }
  }

  const data = getData();

  const dmId = data.dms.length as number;
  const ownerId = getIdFromToken(token);
  const memberIdandOwnerId = uIds;
  memberIdandOwnerId.push(ownerId);
  const dmName = generateDmName(memberIdandOwnerId);

  const dmObject: DmDataStoreObject = {
    dmId: dmId,
    name: dmName,
    owner: ownerId,
    members: uIds,
    messages: [],
  };

  data.dms.push(dmObject);

  return { dmId: dmId };
}

/**
 * isValidToken
 *
 * Given a token returns whether the token exists
 * within the dataStore or not.
 *
 * @param {string} token
 * @returns {boolean}
 */
function isValidToken(token: string): boolean {
  const data = getData();

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
      return true;
    }
  }
  return false;
}

/**
 * isUSerId
 *
 * Given a uId checks if that uId exists
 *
 * @param {number} id
 * @returns {boolean}
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
 * @param {array} array
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
 * @param {string} token
 * @returns {number}
 */
function getIdFromToken(token: string): number {
  const data = getData();

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
      return user.uId;
    }
  }
  return -1;
}

function generateDmName(idArray: number[]): string {
  const data = getData();

  const userHandleArray = [];

  for (const user of data.users) {
    if (idArray.includes(user.uId)) {
      userHandleArray.push(user.userHandle);
    }
  }

  // Sorts the array of all handles alphabetically (see .sort)
  userHandleArray.sort();

  let dmName = '';
  for (const handle of userHandleArray) {
    dmName.concat(handle + ', ');
  }

  // Removes the last uneeded ', ' from the end of the name
  dmName = dmName.slice(0, -2);

  return dmName;
}

/**
 * dmList
 *
 * Given a valid user token, lists of all the Dm's
 * that the user is a member of.
 *
 * @param {string} token
 * @returns { dms: [] }
 */
function dmList(token: string): Dms | Error {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
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
    if (uId === dm.owner) {
      dmArray.push(dm.dmId);
    }
  }

  const dmList = createDmList(dmArray);

  return { dms: dmList };
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
  return dms;
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
 * @param {string} token
 * @param {number} dmId
 * @returns {}
 */
function dmRemove(token: string, dmId: number): Record<string, never> | Error {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
  }

  if (!isValidDmId(dmId)) {
    return { error: 'Invalid dmId' };
  }

  const data = getData();
  const removerId = getIdFromToken(token);

  if (!data.dms[dmId].members.includes(removerId)) {
    return { error: 'User is not a member of the DM' };
  }

  if (removerId !== data.dms[dmId].owner) {
    return { error: 'User is not the original DM creator' };
  }

  // Removing all members and owner from the dm
  data.dms[dmId].owner = -123456789;
  data.dms[dmId].members = [];

  setData(data);

  return {};
}

/**
 * isValidDmId
 *
 * Given a dmId returns whether it exists or not
 *
 * @param {number} dmId
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
 * dmDetails
 *
 * Given a DM with ID dmId that the authorised user is a member of,
 * provide basic details about the DM.
 *
 * @param {string} token
 * @param {number} dmId
 * @returns {{ DmDetails }}
 */
function dmDetails(token: string, dmId: number): DmDetails | Error {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
  }

  if (!isValidDmId(dmId)) {
    return { error: 'Invalid dmId' };
  }

  const data = getData();
  const id = getIdFromToken(token);

  if (!data.dms[dmId].members.includes(id) && (data.dms[dmId].owner !== id)) {
    return { error: 'User is not a member of the DM' };
  }

  const usersArray = [];
  const membersArray = data.dms[dmId].members;
  membersArray.push(data.dms[dmId].owner);

  for (const member of membersArray) {
    const user = createUserObject(member);
    usersArray.push(user);
  }

  return {
    name: data.dms[dmId].name,
    members: usersArray
  };
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

/**
 * dmLeave
 *
 * Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist
 * if this happens. This does not update the name of the DM.
 *
 * @param {string} token
 * @param {number} dmId
 * @returns {}
 */
function dmLeave(token: string, dmId: number): Record<string, never> {
  return {};
}

/**
 * dmMessages
 *
 * Given a user Token, dmId, and start value, returns a
 * list of 50 messages from index start to start + 50.
 *
 * @param {string} token
 * @param {number} dmId
 * @param {number} start
 * @returns {{ DmMessages }}
 */
function dmMessages(token: string, dmId: number, start: number): DmMessages {
  return {
    messages: [],
    start: 0,
    end: 0
  };
}

export { dmCreate, dmLeave, dmMessages, dmDetails, dmRemove, dmList };
