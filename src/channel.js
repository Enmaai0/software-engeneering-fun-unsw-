/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */

import { getData, setData } from "./dataStore"

const NO_MORE_MESSAGES = -1
const FIFTY_MESSAGES = 50

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
  let data = getData();

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

  setData(data);

  return {};
}

function channelMessagesV1(authUserId, channelId, start) {

  let data = getData();

  if (channelId <= data.channels.length) {
    return {error: 'Invalid channelId'};
  }

  if (authUserId <= data.authUserId.length) {
    return {error: 'Invalid authUserId'};
  }

  let check_authUserId = false;
  for (const a of data.channels[channelId].allMembers) {
    if (a.authUserId === authUserId) {
      check_authUserId = true;
    }
  }

  if (!check_authUserId) {
    return {error: 'authUserId does not have permission'};
  }

  if (start > data.channels.messages.length) {
    return {error: 'Not a valid start'};
  }

  const message_array = data.channels[channelId].messages;
  let return_messages = [];
  let end;
  if (start + FIFTY_MESSAGES > message_array.length) {
    end = NO_MORE_MESSAGES;
    for (let i = start; i < message_array.length; i++) {
      return_messages.push(message_array[i]);
    }
  } else {
    end = start + FIFTY_MESSAGES;
    for (let i = start; i < FIFTY_MESSAGES; i++) {
      return_messages.push(message_array[i]);
    }
  }

  return {
    messages: return_messages,
    start: start,
    end: end,
  };
}
    
export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 }