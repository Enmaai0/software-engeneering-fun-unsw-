/**
 * channel.ts
 *
 * Contains the stub code functions of all channel* functions.
 */

import { getData, setData } from './dataStore';

const NO_MORE_MESSAGES = -1;
const FIFTY_MESSAGES = 50;
const GLOBALMEMBER = 2;

interface Error {
  error: string
}

interface Message {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number
}

interface FiftyMessages {
  messages: Message[],
  start: number,
  end: number
}

interface Member {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string
}

interface DetailReturn {
  name: string;
  isPublic: boolean;
  ownerMembers: Member[];
  allMembers: Member[];
}

interface Users {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

/**
 * channelDetailsV1
 *
 * Given a authUserId and channelId, returns details
 * about that channel if the authUserId is a member
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @return { DetailReturn }
 */
function channelDetailsV1(token: string, channelId: number): Error | DetailReturn {
  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid token(No user with that token)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Error: User is not a member' };
  }

  const channel = getData().channels[channelId];

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: channel.owners,
    allMembers: channel.allMembers
  };
}

/**
 * channelJoinV1
 *
 * Given a authUserId and channelId, adds the authUserId
 * as a member of the channelId entered
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @return {  }
 */
function channelJoinV1(token: string, channelId: number) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    return { error: 'Invalid token (No user with that token)' };
  }

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (isMember(token, channelId)) {
    return { error: 'Error: User already a member' };
  }

  const data = getData();
  const channel = data.channels[channelId];
  const authUserId = findUId(token);
  const user = data.users[authUserId];

  if (channel.isPublic === true || user.permissionId === 1) {
    const userObject = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.userHandle
    };

    channel.allMembers.push(userObject);
    setData(data);

    return {};
  }

  return { error: 'Error: No permission to join the channel' };
}

/**
 * channelInviteV1
 *
 * Given a authUserId, channelId and uId, adds the uId
 * to become a member of the channel
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @param { number } uId
 * @return {  }
 */
function channelInviteV1(token: string, channelId: number, uId: number) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    return { error: 'Invalid token (No user with that token)' };
  }

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isUserId(uId)) {
    return { error: 'Invalid uId (No user with that Id)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  if (isUIdMember(uId, channelId)) {
    return { error: 'Invalid User (User already in channel)' };
  }

  const uToken = findToken(uId);
  channelJoinV1(uToken[0], channelId);

  return {};
}

/**
 * channelMessagesV1
 *
 * Given a authUserId, channelId and start returns
 * a 'list' of messages in the channel starting from
 * start.
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @param { number } start
 * @return { FiftyMessages }
 */
function channelMessagesV1(token: string, channelId: number, start: number) : Error | FiftyMessages {
  if (!isValidToken(token)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  const data = getData();
  const messageArray = data.channels[channelId].messages;

  if (start > messageArray.length) {
    return { error: 'Invalid Start (Start is greater than total messages)' };
  }

  const returnMessages = [] as Message[];
  let end;

  if (start + FIFTY_MESSAGES > messageArray.length) {
    end = NO_MORE_MESSAGES;
    for (let i = start; i < messageArray.length; i++) {
      returnMessages.push(messageArray[i]);
    }
  } else {
    end = start + FIFTY_MESSAGES;
    for (let i = start; i < start + FIFTY_MESSAGES; i++) {
      returnMessages.push(messageArray[i]);
    }
  }

  return {
    messages: returnMessages,
    start: start,
    end: end,
  };
}

/**
  * channelLeaveV1
  *
  * Takes a token and channelId, find the user via the token
  * and delete the user in this channel.
  *
  * @param token
  * @param channelId
  * @returns {{}}
  */
function channelLeaveV1(token: string, channelId: number): Error | Record<string, never> {
  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  const channel = getData().channels[channelId];
  const id = findUId(token);
  let index;
  for (index = 0; index < channel.allMembers.length; index++) {
    if (channel.allMembers[index].uId === id) {
      break;
    }
  }
  channel.allMembers.splice(index, 1);

  return { };
}

/**
 * Takes a token, a channelId and a uId, add the user
 * to owner member if permitted.
 *
 * @param token
 * @param channelId
 * @param uId
 * @returns { }
 */
function channelAddOwnerV1(token: string, channelId: number, uId: number): Error | Record<string, never> {
  const data = getData();

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isUserId(uId)) {
    return { error: 'Invalid userId (No user with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  if (data.users[uId].permissionId === GLOBALMEMBER) {
    return { error: 'do not have owner permission' };
  }

  for (const owner of data.channels[channelId].owners) {
    if (owner.uId === uId) {
      return { error: 'user is already an owner in the channel' };
    }
  }
  const user = data.users[uId];
  const userObject: Users = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  data.channels[channelId].owners.push(userObject);
  return { };
}

/**
 * Takes a token, a channelId and a uId, to remove a
 * specific owner member
 *
 * @param token
 * @param channelId
 * @param uId
 * @returns
 */
function channelRemoveOwnerV1(token: string, channelId: number, uId: number): Error | Record<string, never> {
  const data = getData();
  let isowner = false;

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isUserId(uId)) {
    return { error: 'Invalid userId (No user with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  for (const owner of data.channels[channelId].owners) {
    if (owner.uId === uId) {
      isowner = true;
    }
  }
  if (!isowner) {
    return { error: 'The user is not an owner' };
  }

  if (data.channels[channelId].owners.length === 1) {
    return { error: 'The user is currently the only owner' };
  }

  const owners = data.channels[channelId].owners;
  let index;
  for (index = 0; index < data.channels[channelId].owners.length; index++) {
    if (owners[index].uId === uId) {
      break;
    }
  }
  owners.splice(index, 1);
  return { };
}

/**
 * isUserId
 *
 * Given a authUserId, checks if the authUserId
 * is valid (exists in the dataStore)
 *
 * @param { number } authUserId
 * @return { boolean }
 */
function isUserId(authUserId: number): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.uId === authUserId) {
      return true;
    }
  }

  return false;
}

/**
 * isChannelId
 *
 * Given a channelId, checks if the channel id
 * is valid (exists in the dataStore)
 *
 * @param { number } channelId
 * @return { boolean }
 */
function isChannelId(channelId: number): boolean {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }

  return false;
}

/**
 * isMember
 *
 * Given an token and channelId, checks if a user
 * with the token is a part of the channel
 *
 * @param { string } token
 * @param { number } channelId
 * @return { boolean }
 */
function isMember(token: string, channelId: number): boolean {
  const members = getData().channels[channelId].allMembers;
  const id = findUId(token);

  for (const member of members) {
    if (member.uId === id) {
      return true;
    }
  }

  return false;
}

/**
 * Given a token and to check if it is
 * a valid token owned by any user
 *
 * @param token
 * @returns {boolean}
 */
function isValidToken(token: string): boolean {
  const users = getData().users;
  for (const user of users) {
    for (const theToken of user.tokens) {
      if (theToken === token) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Given a token, find the corresponding uId
 *
 * @param token
 * @returns {number} uId
 */
function findUId(token: string): number {
  const users = getData().users;
  let id;

  for (const user of users) {
    for (const theToken of user.tokens) {
      if (theToken === token) {
        id = user.uId;
      }
    }
  }
  return id;
}

/**
 * isUIdMember
 *
 * Given an uId and channelId, checks if a user
 * with the uId is a part of the channel
 *
 * @param { number } id
 * @param { number } channelId
 * @return { boolean }
 */
function isUIdMember(uId: number, channelId: number): boolean {
  const members = getData().channels[channelId].allMembers;

  for (const member of members) {
    if (member.uId === uId) {
      return true;
    }
  }

  return false;
}

/**
 * Given an Id, find the corresponding tokens.
 *
 * This function should be call after check Id is valid.
 *
 * @param Id
 * @returns {string} token
 */
function findToken(Id: number): string | string[] {
  const users = getData().users;
  let userToken;
  for (const user of users) {
    if (user.uId === Id) {
      userToken = user.tokens;
    }
  }
  return userToken;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
