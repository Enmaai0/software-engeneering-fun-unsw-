/**
 * channel.js
 *
 * Contains the stub code functions of all channel* functions.
 */

import { getData, setData } from './dataStore';

const NO_MORE_MESSAGES = -1;
const FIFTY_MESSAGES = 50;

interface Error {
  error: string;
}

interface Users {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

interface DetailReturn {
  name: string;
  isPublic: boolean;
  ownerMembers: Users[];
  allMembers: Users[];
}

/**
 * channelDetailsV1
 *
 * Given a authUserId and channelId, returns details
 * about that channel if the authUserId is a member
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @return { channelObject }
 */
function channelDetailsV2(token: string, channelId: number): Error | DetailReturn {
  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isValidToken) {
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
function channelJoinV2(token, channelId): Error | Record<string, never> {
  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid token(No user with that token)' };
  }

  if (isMember(token, channelId)) {
    return { error: 'Error: User already a member' };
  }

  const data = getData();
  const channel = data.channels[channelId];
  const user = data.users[channelId];

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
 * Given a authUserId, channelId and uId, adds the uId
 * to become a member of the channel
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @param { number } uId
 * @return {  }
 */
function channelInviteV1(authUserId, channelId, uId) {
  if (!isUserId(authUserId)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isUserId(uId)) {
    return { error: 'Invalid uId (No user with that Id)' };
  }

  if (!isMember(authUserId, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  if (isMember(uId, channelId)) {
    return { error: 'Invalid User (User already in channel)' };
  }

  channelJoinV2(uId, channelId);

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
 * @return { messages }
 */
function channelMessagesV1(authUserId, channelId, start) {
  if (!isUserId(authUserId)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isMember(authUserId, channelId)) {
    return { error: 'Invalid authUserId (User does not have permission)' };
  }

  const data = getData();
  const messageArray = data.channels[channelId].messages;

  if (start > messageArray.length) {
    return { error: 'Invalid Start (Start is greater than total messages)' };
  }

  const returnMessages = [];
  let end;

  if (start + FIFTY_MESSAGES > messageArray.length) {
    end = NO_MORE_MESSAGES;
    for (let i = start; i < messageArray.length; i++) {
      returnMessages.push(messageArray[i]);
    }
  } else {
    end = start + FIFTY_MESSAGES;
    for (let i = start; i < FIFTY_MESSAGES; i++) {
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
 * @param { number } id
 * @param { number } channelId
 * @return { boolean } 
 */
function isMember(token: string, channelId: number): boolean {
  const members = getData().channels[channelId].allMembers;
  let users = getData().users;
  let the_id = findUId(token);

  for (const member of members) {
    if (member.uId === the_id) {
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
 * @returns boolean
 */
function isValidToken(token: string): boolean {
  let users = getData().users;
  for (const object of users) {
    for (const the_token of object.tokens) {
      if (the_token === token) {
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
  let users = getData().users;
  let the_id;

  for (const object of users) {
    for (const the_token of object.tokens) {
      if (the_token === token) {
        the_id = object.uId;
      }
    }
  }
  return the_id;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 }