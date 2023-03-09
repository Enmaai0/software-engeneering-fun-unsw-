/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */

import { getData } from "./dataStore"

function channelDetailsV1(authUserId, channelId) {
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

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();

  if (channelId <= data.channels.length) {
    return {error: 'Invalid channelId'};
  }

  if (authUserId <= data.authUserId.length) {
    return {error: 'Invalid authUserId'};
  }

  if (uId <= data.users.length) {
    return {error: 'Invalid uId'};
  }

  let check_authUserId = false;
  for (const a of data.channels[channelId].allMembers) {
    if (a.authUserId === authUserId) {
      check_authUserId = true;
    }
  }

  if (!check_authUserId) {
    return  {error: 'authUserId does not have permission'};
  }

  let check_uId = false;
  for (const a of data.channels[channelId].allMembers) {
    if (a.authUserId === authUserId) {
      check_uId = true;
    }
  }

  if (check_uId) {
    return  {error: 'user already in channel'};
  }

  data.channels[channelId].allMembers.push(uId);

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
    
export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 }