/**
 * channels.ts
 *
 * Contains the function implementations of all channels* functions.
 */

import { getData, setData } from './dataStore';

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

interface UserObject {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}
interface Channel {
  channelId: number;
  name: string;
  isPublic: boolean;
  owners: UserObject[];
  allMembers: UserObject[];
  messages: Message[];
}

/**
 * channelsCreateV1
 *
 * Creates a channel given a valid token and
 * creates either a public or private channel based
 * on isPublic with a given name.
 *
 * @param { token } token
 * @param { name } name
 * @param { isPublic } isPublic
 * @returns {{ channelId: channelid }}
 */
function channelsCreateV1(token: string, name: string, isPublic: boolean): { channelId: number } | { error: string } {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
  }

  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid Name (Name must be 1 - 20 characters long)' };
  }

  const data = getData();
  const channelId = data.channels.length;

  const uId = getIdFromToken(token);
  const userObject = createUserObject(uId);
  const messageArray: Message[] = [];

  const channel: Channel = {
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    owners: [userObject],
    allMembers: [userObject],
    messages: messageArray,
  };

  data.channels.push(channel);
  setData(data);

  return { channelId: channelId };
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

/**
 * createUserObject
 *
 * Given a valid token, returns an object that
 * contains all information to be stored in either
 * channel.owners or channel.allMembers.
 *
 * @param { number } uId
 * @returns { UserObject }
 */
function createUserObject(uId: number): UserObject {
  const data = getData();
  const user = data.users[uId];

  const userObject: UserObject = {
    uId: uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  return userObject;
}

/**
 * channelsListAllV1
 *
 * Given a valid token, provides an array of all channels,
 * including private channels containing their channelId and name
 *
 * @param { number } token
 * @returns {{ channels: Channel[] }}
 */
function channelsListAllV1(token: string) {
  if (!isValidToken(token)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  const data = getData();
  const channelArray: Channel[] = [];

  for (const channel of data.channels) {
    const channelDetails: Channel = {
      channelId: channel.channelId,
      name: channel.name,
      isPublic: channel.isPublic,
      owners: channel.owners,
      allMembers: channel.allMembers,
      messages: channel.messages,
    };
    channelArray.push(channelDetails);
  }

  return { channels: channelArray };
}

/**
 * channelsListV1
 *
 * Given a valid token, returns an array of all
 * channels that the inputted token is a part of
 *
 * @param { number } token
 * @returns {{ channels: Array<{ name: string, channelId: number }> }}
 */
function channelsListV1 (token: string) {
  if (!isValidToken(token)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  const data = getData();
  const channelArray = [];
  const userId = getIdFromToken(token);

  for (const channel of data.channels) {
    for (const user of channel.allMembers) {
      if (user.uId === userId) {
        const channelDetails = {
          name: channel.name,
          channelId: channel.channelId
        };
        channelArray.push(channelDetails);
      }
    }
  }

  return { channels: channelArray };
}

export { channelsCreateV1, channelsListAllV1, channelsListV1 };
