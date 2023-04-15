/**
 * standup.ts
 *
 * Contains the functions of all standup* functions.
 */

import { getHashOf, getData, setData } from './dataStore';
import HTTPError from 'http-errors';

interface TimeFinish {
  timeFinished: number
}

interface StandUpActive {
  isActive: boolean,
  timeFinished: number | null
}

const MAXMESSAGELENGTH = 1000;
const MINMESSAGELENGTH = 1;

/**
 * standupStart
 *
 * Given a token, channelId and length,
 * starts a standup and return the time finished
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } length
 * @return {{ timeFinished }}
 */
function standupStart(token: string, channelId: number, length: number) : TimeFinish {
  const data = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid token (No user with that token)');
  }

  if (!isChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channelId (No channel with that id)');
  }

  if (length < 0) {
    throw HTTPError(400, 'Invalid Standup Length (Length cannot be negative)');
  }

  const channel = data.channels[channelId];

  if (channel.isActive) {
    throw HTTPError(400, 'Cannot Start Standup (Standup is currently running)');
  }

  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'User is not a member (User is not a member of current channel)');
  }

  channel.isActive = true;
  channel.timeFinish = Math.floor(Date.now() / 1000) + length;
  setData(data);

  setTimeout(() => {
    channel.isActive = false;
    setData(data);
    messageSend(token, channelId, channel.buffer);
  }, length * 1000);

  return {
    timeFinished: channel.timeFinish
  };
}

/**
 * standupActive
 *
 * Given a token, channelId,
 * return the status of standup.
 *
 * @param { string } token
 * @param { number } channelId
 * @param { number } length
 * @return {{ isActive, timeFinished }}
 */
function standupActive(token: string, channelId: number) : StandUpActive {
  const data = getData();

  if (isValidToken(token)) {
    throw HTTPError(403, 'Invalid token (No user with that token)');
  }

  if (!isChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channelId (No channel with that id)');
  }

  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'User is not a member (User is not a member of current channel)');
  }

  const channel = data.channels[channelId];
  if (channel.isActive) {
    return {
      isActive: channel.isActive,
      timeFinished: channel.timeFinish
    };
  } else {
    return {
      isActive: channel.isActive,
      timeFinished: null
    };
  }
}

/**
 * standupSend
 *
 * Given a token, channelId, message,
 * send message
 * return empty object.
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 * @return {{ }}
 */
function standupSend(token: string, channelId: number, message: string) : Record<string, never> {
  if (isValidToken(token)) {
    throw HTTPError(403, 'Invalid token (No user with that token)');
  }

  if (!isChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channelId (No channel with that id)');
  }

  if (message.length > MAXMESSAGELENGTH || message.length < MINMESSAGELENGTH) {
    throw HTTPError(400, 'Invalid token (No user with that token)');
  }

  const data = getData();
  const channel = data.channels[channelId];

  if (!channel.isActive) {
    throw HTTPError(400, 'Invalid Send (No standup is currently running)');
  }

  if (!isMember(token, channelId)) {
    throw HTTPError(403, 'User is not a member (User is not a member of current channel)');
  }

  channel.buffer = channel.buffer + `${getIdFromToken(token)}: ${message}\n`;
  setData(data);

  return {};
}

export { standupStart, standupActive, standupSend };

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

interface MessageSendReturn {
  messageId: number
}

interface React {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

/**
 * messageSend
 *
 * Sends a given message to a given channel
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 * @returns {{ messageId: number }}
 */
function messageSend(token: string, channelId: number, message: string): MessageSendReturn | Error {
  const userId = getIdFromToken(token);

  const data = getData();

  // Message Id's start at 0
  const messageId = data.globalMessageCounter;
  data.globalMessageCounter++;
  const reacts: React[] = [];
  const messageObj = {
    message: message,
    uId: userId,
    messageId: messageId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: reacts,
    isPinned: false,
  };

  data.channels[channelId].messages.push(messageObj);

  setData(data);

  return { messageId: messageId };
}
