/**
 * channels.js
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
function channelsCreateV1(authUserId, name, isPublic) {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid Name (Name must be 1 - 20 characters long)' };
  }

  const data = getData();
  const channelId = data.channels.length;
  const userObject = createUserObject(authUserId);

  const channel = {
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

/**
 * createUserObject
 *
 * Given a valid authUserId, returns an object that
 * contains all information to be stored in either
 * channel.owners or channel.allMembers.
 *
 * @param { number } authUserId
 * @returns { channels }
 */
function createUserObject(userId) {
  const data = getData();

  const user = data.users[userId];

  const userObject = {
    uId: userId,
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
 * Given a valid authUserId, provides an array of all channels,
 * including private channels containing their channelId and name
 *
 * @param { number } authUserId
 * @returns { channels }
 */
function channelsListAllV1(authUserId) {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  const data = getData();
  const channelArray = [];

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
 * Given a valid authUserId, returns an array of all
 * channels that the inputted authUserId is a part of
 *
 * @param { number } authUserId
 * @returns { channels }
 */
function channelsListV1 (authUserId) {
  if (!isValidUserId(authUserId)) {
    return { error: 'Invalid User (User does not exist)' };
  }

  const data = getData();
  const channelArray = [];
  const userId = authUserId;

  for (const channel of data.channels) {
    for (const user of channel.allMembers) {
      if (user.uId === authUserId) {
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

/**
 * isValidUserId
 *
 * Given a id of a user, returns whether that
 * id exists within the dataStore.
 *
 * @param { number } id
 * @returns { boolean }
 */
function isValidUserId(id) {
  const data = getData();

  if (id >= data.users.length) {
    return false;
  }

  return true;
}

export { channelsCreateV1, channelsListAllV1, channelsListV1 };
