/**
 * channels.ts
 *
 * Contains the function implementations of all channels* functions.
 */

import { getHashOf, getData, setData } from './dataStore';
import HTTPError from 'http-errors';

interface Error {
  error: string
}

interface React {
  reactId: number;
  uId: number;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

interface Users {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}
interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  owners: Users[],
  allMembers: Users[],
  messages: Message[],
  isActive: boolean,
  timeFinish: number,
  buffer: string,
  standupStarterId: number,
}

interface Channels {
  channelId: number;
  name: string;
}

interface ChannelsList {
  channels: Channels[]
}
interface ChannelId {
  channelId: number
}

interface UserChannelStats {
  numChannelsJoined: number;
  timeStamp: number;
}

interface UserDMStats {
  numDmsJoined: number;
  timeStamp: number;
}

interface UserMessageStats {
  numMessagesSent: number;
  timeStamp: number;
}

interface UserStats {
  channelsJoined: UserChannelStats[];
  dmsJoined: UserDMStats[];
  messagesSent: UserMessageStats[];
  involvementRate: number;
}

interface AllChannelStats {
  numChannelsExist: number;
  timeStamp: number;
}

interface AllDMStats {
  numDmsExist: number;
  timeStamp: number;
}

interface AllMessageStats {
  numMessagesExist: number;
  timeStamp: number;
}

interface WorkSpaceStats {
  channelsExist: AllChannelStats[];
  dmsExist: AllDMStats[];
  messagesExist: AllMessageStats[];
  utilizationRate: number;
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
 * @returns {{ ChannelId }}
 */
function channelsCreateV1(token: string, name: string, isPublic: boolean): ChannelId | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Invalid Name (Name must be 1 - 20 characters long)');
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
    isActive: false,
    standupStarterId: -1,
    timeFinish: 0,
    buffer: '',
  };

  const channelStat: AllChannelStats = {
    numChannelsExist: data.WorkspaceStats.channelsExist.length + 1,
    timeStamp: Date.now()
  };
  const workspace: WorkSpaceStats = data.WorkspaceStats;
  workspace.channelsExist.push(channelStat);

  data.channels.push(channel);

  const userChannelStat: UserChannelStats = { numChannelsJoined: data.users[uId].userStat.channelsJoined.length + 1, timeStamp: Date.now() };
  const userStat: UserStats = data.users[uId].userStat;
  userStat.channelsJoined.push(userChannelStat);

  setData(data);

  return { channelId: channelId };
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
function channelsListAllV1(token: string): ChannelsList | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid User (User does not exist)');
  }

  const data = getData();
  const channelArray: Channels[] = [];

  for (const channel of data.channels) {
    const channelDetails = {
      channelId: channel.channelId,
      name: channel.name,
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
 * @returns {{ ChannelsList }}
 */
function channelsListV1 (token: string) {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid User (User does not exist)');
  }

  const data = getData();
  const channelArray: Channels[] = [];
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
 * createUserObject
 *
 * Given a valid token, returns an object that
 * contains all information to be stored in either
 * channel.owners or channel.allMembers.
 *
 * @param { number } uId
 * @returns { UserObject }
 */
function createUserObject(uId: number): Users {
  const data = getData();
  const user = data.users[uId];

  const userObject: Users = {
    uId: uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  return userObject;
}
