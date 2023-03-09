/**
 * channel.js
 * 
 * Contains the stub code functions of all channel* functions.
 */
import { getData } from "./dataStore"

function channelDetailsV1(authUserId, channelId) {
  //error checking
  let data = getData();
  
  if (is_Valid_userId(authUserId) === false || is_Valid_ChannelId(channelId) === false) {
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
  if (is_Valid_userId(authUserId) === false || is_Valid_ChannelId(channelId) === false) {
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
    
function  is_Valid_userId(authUserId) {
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
  }else {
    return true;
  }
}_
    