/**
 * channels.ts
 * 
 * Contains the function implementations of all channels* functions.
 */

import { authRegisterV1 } from './auth.js';
import { getData, setData } from './dataStore.js';

/**
 * channelsCreateV1
 * 
 * Creates a channel given a valid authUserId and 
 * creates either a public or private channel based 
 * on isPublic with a given name. 
 * 
 * @param { authUserId } authUserId 
 * @param { name } name 
 * @param { isPublic } isPublic 
 * @returns {{ channelId: channelid }}
 */

interface UserObject {
  userId: string;
  username: string;
}

interface Channel {
  channelId: number;
  name: string;
  isPublic: boolean;
  owners: UserObject[];
  allMembers: UserObject[];
  messages: string[];
}

function channelsCreateV1(authUserId: string, name: string, isPublic: boolean): { channelId: number } | { error: string } {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid Name (Name must be 1 - 20 characters long)' };
  }

  let data = getData();
  const channelId = data.channels.length;
  const userObject = createUserObject(authUserId);

  let channel: Channel = {
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    owners: [userObject],
    allMembers: [userObject],
    messages: [],
  };

  data.channels.push(channel);
  setData(data);

  return { channelId: channelId };
}


interface UserObject {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

/**
 * createUserObject
 * 
 * Given a valid authUserId, returns an object that
 * contains all information to be stored in either
 * channel.owners or channel.allMembers.
 * 
 * @param { number } authUserId 
 * @returns { UserObject }
 */
function createUserObject(authUserId: number): UserObject {
  const data = getData();

  const user = data.users[authUserId];

  let userObject: UserObject = {
    uId: authUserId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  }

  return userObject;
}

/**
 * channelsListAllV1
 * 
 * Given a valid authUserId, provides an array of all channels,
 * including private channels containing their channelId and name
 * 
 * @param { number } authUserId 
 * @returns {{ channels: Channel[] }}
 */
function channelsListAllV1(authUserId: number) {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  let data = getData();
  let channelArray: Channel[] = [];

  for (const channel of data.channels) {
    let channelDetails: Channel = {
      channelId: channel.channelId,
      name: channel.name,
      isPublic: channel.isPublic,
      owners: channel.owners,
      allMembers: channel.allMembers,
      messages: channel.messages,
    }
    channelArray.push(channelDetails);
  }

  return { channels: channelArray };
}

/**
 * channelsListV1
 * 
 * Given a valid authUserId, returns an array of all 
 * channels that the inputted authUserId is a part of
 * 
 * @param { number } authUserId 
 * @returns {{ channels: Array<{ name: string, channelId: number }> }}
 */
function channelsListV1 (authUserId: number) {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  let data = getData();
  let channelArray = [];
  const userId = authUserId;

  for (const channel of data.channels) {
    for (const user of channel.allMembers) {
      if (user.uId === authUserId) {
        let channelDetails = {
          name: channel.name,
          channelId: channel.channelId
        }
        channelArray.push(channelDetails);
      }
    }
  }

  return { channels: channelArray };
}

/**
 * isValidUserId
 * 
 * Given a id of a user, returns whether that
 * id exists within the dataStore. 
 * 
 * @param { number } id
 * @returns { boolean }
 */
function isValidUserId(id: number): boolean {
  const data = getData();

  if (id >= data.users.length) {
    return false;
  }

  return true;
} 

export { channelsCreateV1, channelsListAllV1, channelsListV1 }
