/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */

import { getData, setData } from "./dataStore"

const NO_MORE_MESSAGES = -1
const FIFTY_MESSAGES = 50

function channelDetailsV1(authUserId, channelId) {
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
  const data = getData();

  if (is_Valid_channelId(channelId)) {
    return {error: 'Invalid channelId'};
  }

  if (is_Valid_userId(authUserId)) {
    return {error: 'Invalid authUserId'};
  }

  if (is_Valid_userId(uId)) {
    return {error: 'Invalid uId'};
  }

  if (!check_allMembers(authUserId, channelId)) {
    return  {error: 'authUserId does not have permission'};
  }

  if (check_allMembers(uId, channelId)) {
    return  {error: 'user already in channel'};
  }

  data.channels[channelId].allMembers.push(uId);

  setData(data);

  return {};
}

function channelMessagesV1(authUserId, channelId, start) {

  const data = getData();

  if (is_Valid_channelId(channelId)) {
    return {error: 'Invalid channelId'};
  }

  if (is_Valid_userId(authUserId)) {
    return {error: 'Invalid authUserId'};
  }

  if (!check_allMembers(authUserId, channelId)) {
    return {error: 'authUserId does not have permission'};
  }

  const message_array = data.channels[channelId].messages;

  if (start > message_array.length) {
    return {error: 'Not a valid start'};
  }

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
    
function is_Valid_userId(authUserId) {
  let valid_userId = false;
  const data = getData();

  for (const i of data.users) {
    if (i.authUserId === authUserId) {
      valid_userId = true;
    }
  }
  if (!valid_userId) {
    return false;
  } else {
    return true;
  }
}

function is_Valid_ChannelId(channelId) {
  let valid_channelId = false;
  const data = getData();

  for (const i of data.channels) {
    if (i.channelId === channelId) {
      valid_channelId = true;
    }
  }
  if (!valid_channelId) {
    return false;
  } else {
    return true;
  }
}

/* WARNING: 
 * check_allMembers() require a valid input of both authUserId and channelId,
 * Please ensure to check valid brefore use this function.
 * 
 * @param { number } authUserId
 * @param { number } channelId
 * @return { boolean } 
 */
function check_allMembers(authUserId, channelId) {
  const data = getData();

  const member_array = data.channels[channelId].allMembers;
  for (const member of member_array) {
    if (member.authUserId === authUserId) {
      return true;
    }
  }

  return false;
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 }