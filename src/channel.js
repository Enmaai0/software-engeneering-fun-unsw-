/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */
import { getData } from "./dataStore"

export function channelDetailsV1(authUserId, channelId) {
  //error checking
  let channel = {};
  
  if (is_Valid_userId(authUserId, channelId) === false || is_Valid_ChannelId(authUserId, channelId) === false) {
    return {error: 'Id error'};
  }

  //function
  for (const i of data.channels) {
    if (i.channelId === channelId) {
      return i;
    }
  }
}
/*
  return {
    name: 'Hayden',
    ownerMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
    allMembers: [
      {
        uId: 1,
        email: 'example@gmail.com',
        nameFirst: 'Hayden',
        nameLast: 'Jacobs',
        handleStr: 'haydenjacobs',
      }
    ],
  };
}
*/
function channelJoinV1(authUserId, channelId) {

}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}

function channelMessagesV1(authUserId, channelId, start) {
  return {
    messages: [
      {
        messageId: 1,
        uId: 1,
        message: 'Hello world',
        timeSent: 1582426789,
      }
    ],
    start: 0,
    end: 50,
  };
}
    
function  is_Valid_userId(authUserId, channelId) {
  let valid_userId = false;
  const data = getData();

  for (const i of data.users) {
    if (i.authUserId === authUserId) {
      valid_userId = true;
    }
  }
  if (!valid_userId) {
    return false;
  }else {
    return true;
  }
}

function is_Valid_ChannelId(authUserId, channelId) {
  let valid_channelId = false;
  const data = getData();

  for (const i of data.channels) {
    if (i.channelId === channelId) {
      valid_channelId = true;
    }
  }
  if (!valid_channelId) {
    return false;
  }else {
    return true;
  }
}_