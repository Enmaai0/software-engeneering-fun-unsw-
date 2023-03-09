/**
 * channels.js
 * 
 * Contains the stub code functions of all channels* functions.
 */

import { authRegisterV1 } from "./auth.js";
import { getData, setData } from "./dataStore.js";

//Creates a new channel with the given name, that is either a public or private channel.
//The user who created it automatically joins the channel.
/**
 * Function below creates a channel given that the inputs are valid 
 * If input is invalid, appropriate error messages are returned
 * @param {authUserId} authUserId 
 * @param {name} name 
 * @param {isPublic} isPublic 
 * @returns {{ channelId: channelid} }
 */

function channelsCreateV1(authUserId, name, isPublic) {
  if (!isValidUserId) {
      return {error: 'User is not valid'}
  }

// Check if the channel name is valid
  if (name.length < 1 || name.length > 20) {
    return { error: 'Name is too short'};
  }

  let dataStore = getData();
  
  let channelobj = {
    name: name,
    isPublic: isPublic,
    owner: [authUserId],
    allMembers: [authUserId],
    messages: [],
    channelId: dataStore.channels.length,
  }

  const channelId = dataStore.channels.length;

  dataStore.channels.push(channelobj);
  setData(dataStore);

  return { channelId : channelId };
}

/**
 * Provides an array of all channels, including private channels (and their associated details)
 * @param {number} authUserId 
 * @returns { channels[] }
 */
 
export function channelsListAllV1(authUserId) {
  if (!isValidUserId) {
      return {error: 'User is not valid'}
  }

  let dataStore = getData();
  let channelArray = [];

  for (let channel of dataStore.channels) {
    let obj = {
      channelId: channel.channelId,
      name: channel.name,
    }
    channelArray.push(obj);
  }
  return channelArray;
}

/**
 * 
 * @param {*} authUserId - UserID 
 * @returns {( resultChannels )}
 */

// Lists all public channels a user is a part of
export function channelsListV1 (authUserId) {
  if (!isValidUserId) {
      return {error: 'User is not valid'}
  }

  let dataStore = getData();
  let resultChannels = [];
  let i = 0;
  let j = 0;

  for (let user of dataStore.users) {
    while (i < dataStore.channels.length) {
      while (j < dataStore.channels[i].allMembers.length) {
        if (dataStore.channels[i].allMembers[j] === authUserId &&
            dataStore.channels[i].isPublic === true) {
          let channel = {
            name: dataStore.channels[i].name,
            channelId: dataStore.channels[i].channelId
          }
          resultChannels.push(channel);
        }
        j++;
      }
      j = 0;
      i++;
    }
    return { resultChannels }
  }
}

function isValidUserId(id) {
  for (const user in getData().users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
} 