/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */
import { getData } from "./dataStore"

import { getData, setData } from "./dataStore"

const NO_MORE_MESSAGES = -1
const FIFTY_MESSAGES = 50

function channelDetailsV1(authUserId, channelId) {
  //error checking
  let data = getData();
  
  if (isUserId(authUserId, channelId) === false || isChannelId(authUserId, channelId) === false) {
    return {error: 'Id error'};
  }

  //function
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return channel;
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
  let data = getData();
  //error checking
  if (isUserId(authUserId) === false || isChannelId(channelId) === false) {
    return {error: 'Id error'};
  }

  //check whether is already a member
  if (check_allMembers(authUserId, channelId) === false) {
    return {error: 'already a member'};
  }
  
  //fail to join a private channel
  for (const channel of data.channels) {
    if (channel.channelId === channelId && i.is_Public === false) {
      return {error: 'no permission to join the channel'};
    }
  }

  //start to join
  let the_channel = {};
  let the_user = {};
  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      the_user = user;
    }
  }
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      the_channel = channel;
    }
  }
  the_channel.allMembers.push(the_user);

}
function channelInviteV1(authUserId, channelId, uId) {
  const data = getData();

  if (isChannelId(channelId)) {
    return {error: 'Invalid channelId'};
  }

  if (isUserId(authUserId)) {
    return {error: 'Invalid authUserId'};
  }

  if (isUserId(uId)) {
    return {error: 'Invalid uId'};
  }

  if (!isMember(authUserId, channelId)) {
    return  {error: 'authUserId does not have permission'};
  }

  if (isMember(uId, channelId)) {
    return  {error: 'user already in channel'};
  }

  data.channels[channelId].allMembers.push(uId);

  setData(data);

  return {};
}
function channelMessagesV1(authUserId, channelId, start) {

  const data = getData();

  if (isChannelId(channelId)) {
    return {error: 'Invalid channelId'};
  }

  if (isUserId(authUserId)) {
    return {error: 'Invalid authUserId'};
  }

  if (!isMember(authUserId, channelId)) {
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
    
function isUserId(authUserId) {
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

function isChannelId(channelId) {
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
function isMember(authUserId, channelId) {
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