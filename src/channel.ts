/**
 * channel.ts
 *
 * Contains the stub code functions of all channel* functions.
 */

import { getData, setData } from './dataStore';

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

const NO_MORE_MESSAGES = -1;
const FIFTY_MESSAGES = 50;
const GLOBALMEMBER = 2;

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
    return { error: 'Invalid token (No user with that token)' };
  }

  if (!isMember(token, channelId)) {
    return { error: 'User is not a member' };
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
 * @return {{ }}
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
  const authUserId = getIdFromToken(token);
  const user = data.users[authUserId];

  if (channel.isPublic === false && user.permissionId === GLOBALMEMBER) {
    return { error: 'Error: No permission to join the channel' };
  }

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

/**
 * channelInviteV1
 *
 * Given a authUserId, channelId and uId, adds the uId
 * to become a member of the channel
 *
 * @param { number } authUserId
 * @param { number } channelId
 * @param { number } uId
 * @return {{ }}
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

  const data = getData();
  const user = data.users[uId];
  const channel = data.channels[channelId];

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
  const channel = data.channels[channelId];

  if (start > channel.messages.length) {
    return { error: 'Invalid Start (Start is greater than total messages)' };
  }

  // If the messages array is empty, simply return empty messages
  if (channel.messages.length === 0) {
    return {
      messages: [],
      start: start,
      end: -1,
    };
  }

  const returnMessages: Message[] = [];
  const returnEnd = (start + FIFTY_MESSAGES > channel.messages.length) ? NO_MORE_MESSAGES : start + FIFTY_MESSAGES;

  let realStart: number, realEnd: number;
  realEnd = (channel.messages.length - start - 50 < 0) ? 0 : channel.messages.length - start - 50;
  realStart = (start < 0) ? realEnd + start + 50 : channel.messages.length - start - 1;
  realStart = (realStart >= channel.messages.length) ? channel.messages.length - 1 : realStart;

  if (start < -50) {
    realStart = -1;
    realEnd = 0;
  }

  for (let i = realStart; i >= realEnd; i--) {
    const message = {
      messageId: channel.messages[i].messageId,
      uId: channel.messages[i].uId,
      message: channel.messages[i].message,
      timeSent: Number(channel.messages[i].timeSent)
    };
    returnMessages.push(message);
  }

  return {
    messages: returnMessages,
    start: start,
    end: returnEnd,
  };
}

/**
  * channelLeaveV1
  *
  * Takes a token and channelId, find the user via the token
  * and delete the user in this channel.
  *
  * @param { string } token
  * @param { number } channelId
  * @returns {{ }}
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

  const data = getData();
  const channel = data.channels[channelId];
  const id = getIdFromToken(token);

  // Removes member from the owner array if they are an owner
  for (const owner of channel.owners) {
    if (owner.uId === id) {
      const idIndex = channel.owners.indexOf(owner);
      channel.owners.splice(idIndex, 1);
    }
  }

  // Removes the member from the member array
  for (const member of channel.allMembers) {
    if (member.uId === id) {
      const idIndex = channel.allMembers.indexOf(member);
      channel.allMembers.splice(idIndex, 1);
    }
  }

  setData(data);

  return {};
}

/**
 * Takes a token, a channelId and a uId, add the user
 * to owner member if permitted.
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } uId
 * @returns {{ }}
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

  const ownerId = getIdFromToken(token);
  const owners = data.channels[channelId].owners;
  const members = data.channels[channelId].allMembers;

  if (owners.some(owner => owner.uId === uId)) {
    return { error: 'User is already an owner in the channel' };
  }

  if (!members.some(member => member.uId === uId)) {
    return { error: 'User is not a member of the channel' };
  }

  if (!owners.some(owner => owner.uId === ownerId)) {
    return { error: 'User does not have owner permissions' };
  }

  const user = data.users[uId];
  const userObject: Member = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  owners.push(userObject);

  setData(data);

  return {};
}

/**
 * Takes a token, a channelId and a uId, to remove a
 * specific owner member
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } uId
 * @returns {{ }}
 */
function channelRemoveOwnerV1(token: string, channelId: number, uId: number): Error | Record<string, never> {
  if (!isChannelId(channelId)) {
    return { error: 'Invalid channelId (No channel with that id)' };
  }

  if (!isUserId(uId)) {
    return { error: 'Invalid userId (No user with that id)' };
  }

  if (!isValidToken(token)) {
    return { error: 'Invalid authUserId (No user with that id)' };
  }

  const removerId = getIdFromToken(token);
  const data = getData();
  const owners = data.channels[channelId].owners;

  if (!owners.some(owner => owner.uId === removerId)) {
    return { error: 'User does not have owner permissions' };
  }

  if (!owners.some(owner => owner.uId === uId)) {
    return { error: 'User being removes is not an owner' };
  }

  if (data.channels[channelId].owners.length === 1) {
    return { error: 'The user is currently the only owner' };
  }

  for (const owner of owners) {
    if (owner.uId === uId) {
      const idIndex = owners.indexOf(owner);
      owners.splice(idIndex, 1);
    }
  }

  setData(data);

  return {};
}

/**
 * isUserId
 *
 * Given a authUserId, checks if the authUserId
 * is valid (exists in the dataStore)
 *
 * @param { number } uId
 * @return { boolean }
 */
function isUserId(uId: number): boolean {
  const data = getData();
  const users = data.users;

  if (users.some(user => user.uId === uId)) {
    return true;
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
  const id = getIdFromToken(token);

  for (const member of members) {
    if (member.uId === id) {
      return true;
    }
  }

  return false;
}

/**
 * isValidToken
 *
 * Given a token and to check if it is
 * a valid token owned by any user
 *
 * @param { string } token
 * @returns { boolean }
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

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
      return user.uId;
    }
  }
  return -1;
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

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
