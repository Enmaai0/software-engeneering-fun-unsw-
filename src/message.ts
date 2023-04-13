import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

/**
 * Sends a given message to a given channel
 *
 * @param {string} token - user session
 * @param {number} channelId - channel Id number
 * @param {string} message - message to comment
 * @returns {{messageId: number}}  - Id number for sent message
 * @returns {{error: string}} - if any inputs are invalid
 */
export function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();

  // Checks the token is valid and gives uId else returns error
  const authUserId = findTokenId(token);
  if (authUserId === false) throw HTTPError(403, 'token is not valid');

  // Check whether the channelId is valid
  const channelInvalid = checkChannelId(channelId);
  if (channelInvalid !== true) throw HTTPError(400, 'invalid channel');

  // Check valid message length
  if (message.length < 1 || message.length > 1000) throw HTTPError(400, 'invalid message length');

  // Check whether a user is in the channel
  const userEnrolled = checkEnrolled(authUserId, channelId);
  if (userEnrolled === false) throw HTTPError(403, 'authUser is not a member of this channel');

  let i = 0;
  for (i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) break;
  }

  data.messageCountId++;
  data.channels[i].messages.unshift({
    message: message,
    uId: authUserId,
    messageId: data.messageCountId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  let authUserHandle = '';
  for (const user of data.users) {
    if (authUserId === user.uId) {
      authUserHandle = user.handleStr;
      break;
    }
  }
  let channelName = '';
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channelName = channel.nameChannel;
      break;
    }
  }
  const messageString = authUserHandle + ' tagged you in ' + channelName + ': ' + message.substring(0, 20);
  for (const user of data.users) {
    if (message.includes('@' + user.handleStr)) {
      if (checkEnrolled(user.uId, channelId) === true) {
        const notification = {
          channelId: channelId,
          dmId: -1,
          notificationMessage: messageString,
        };
        user.notifications.push(notification);
      }
    }
  }

  // userStats
  for (const person of data.users) {
    if (person.uId === authUserId) {
      person.messagesSent++;
      person.messagesCreation.push({
        numMessagesSent: person.messagesSent,
        timeStamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  // workspaceStats
  data.messagesCreation.push({
    numMessagesExist: data.messageCountId,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  setData(data);
  return {
    messageId: data.messageCountId,
  };
}

/**
 * Sends a given message to a given dm
 *
 * @param {string} token - user session
 * @param {number} dmId - Id of dm to send message to
 * @param {string} message - message to send
 * @returns {{messageId: number}} - Id number for sent message
 * @returns {{error: string}} - any invalid input
 */
export function messageSendDmV1(token: string, dmId: number, message: string) {
  const data = getData();

  // Checks the token is valid and gives uId else returns error
  const authUserId = findTokenId(token);
  if (authUserId === false) throw HTTPError(403, 'token is not valid');

  // Check whether the dmId is valid
  const dmInvalid = checkDmId(dmId);
  if (dmInvalid !== true) throw HTTPError(400, 'invalid dmId');

  // Check valid message length
  if (message.length < 1 || message.length > 1000) throw HTTPError(400, 'invalid message length');

  // Check whether a user is in the channel
  const userEnrolled = checkEnrolledDm(authUserId, dmId);
  if (userEnrolled === false) throw HTTPError(403, 'authUser is not a member of this channel');

  let i = 0;
  for (i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) break;
  }

  data.messageCountId++;
  data.dms[i].messages.unshift({
    message: message,
    uId: authUserId,
    messageId: data.messageCountId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  let authUserHandle = '';
  for (const user of data.users) {
    if (authUserId === user.uId) {
      authUserHandle = user.handleStr;
      break;
    }
  }
  let dmName = '';
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      dmName = dm.name;
      break;
    }
  }
  const messageString = authUserHandle + ' tagged you in ' + dmName + ': ' + message.substring(0, 20);
  for (const user of data.users) {
    if (message.includes('@' + user.handleStr)) {
      if (checkEnrolledDm(user.uId, dmId) === true) {
        const notification = {
          channelId: -1,
          dmId: dmId,
          notificationMessage: messageString,
        };
        user.notifications.push(notification);
      }
    }
  }

  // userStats
  for (const person of data.users) {
    if (person.uId === authUserId) {
      person.messagesSent++;
      person.messagesCreation.push({
        numMessagesSent: person.messagesSent,
        timeStamp: Math.floor(Date.now() / 1000)
      });
    }
  }

  // workspaceStats
  data.messagesCreation.push({
    numMessagesExist: data.messageCountId,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  setData(data);
  return {
    messageId: data.messageCountId,
  };
}

/**
 * Edits given message
 *
 * @param {string} token - user session
 * @param {number} messageId - Id of message to be edited
 * @param {string} message - new edit of existing message
 * @returns {{}}
 */
export function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();

  // Checks the token is valid and gives uId else returns error
  const authUserId = findTokenId(token);
  if (authUserId === false) throw HTTPError(403, 'token is not valid');

  // Check whether the messageId is valid
  const messageValid = checkMessageId(messageId);
  if (messageValid.route === 'empty') throw HTTPError(400, 'invalid messageId');

  // Check valid message length
  if (message.length > 1000) throw HTTPError(400, 'invalid message length');

  // Check whether a user is in the channel
  if (messageValid.uId !== authUserId) {
    const perms = checkPermissions(authUserId, messageValid.routeId, messageValid.route);
    if (!perms || perms === -1) throw HTTPError(403, 'incorrect permissions for this action');
  }

  // Remove message if the edit is an empty string
  if (message.length < 1) return messageRemoveV1(token, messageId);

  // Different path if message is a dm or channel
  if (messageValid.route === 'channels') {
    data.channels[messageValid.index1].messages[messageValid.index2].message = message;
  } else if (messageValid.route === 'dms') {
    data.dms[messageValid.index1].messages[messageValid.index2].message = message;
  }

  setData(data);
  return {};
}

/**
 * Removes a message from a channel/dm
 *
 * @param {string} token - user session
 * @param {any} messageId - Id of message sent (given as a string)
 * @returns {{}}
 * @returns {{error: string}} - any invalid input
 */
export function messageRemoveV1(token: string, messageId: any) {
  const data = getData();
  messageId = parseInt(messageId);

  // Checks the token is valid and gives uId else returns error
  const authUserId = findTokenId(token);
  if (authUserId === false) throw HTTPError(403, 'token is not valid');

  // Check whether the messageId is valid
  const messageValid = checkMessageId(messageId);
  if (messageValid.route === 'empty') throw HTTPError(400, 'invalid messageId');

  // Check whether a user is in the channel
  if (messageValid.uId !== authUserId) {
    const perms = checkPermissions(authUserId, messageValid.routeId, messageValid.route);
    if (!perms || perms === -1) throw HTTPError(403, 'incorrect permissions for this action');
  }

  // Different path if message is a dm or channel
  if (messageValid.route === 'channels') {
    data.channels[messageValid.index1].messages.splice(messageValid.index2, 1);
  } else if (messageValid.route === 'dms') {
    data.dms[messageValid.index1].messages.splice(messageValid.index2, 1);
  }

  data.messageCountId--;

  // workspaceStats
  data.messagesCreation.push({
    numMessagesExist: data.messageCountId,
    timeStamp: Math.floor(Date.now() / 1000)
  });

  setData(data);
  return {};
}

/**
  * <Reacts to a message>
  *
  * @param {String} token - token of user reacting to a message
  * @param {int} messageId - messagedId of message being reacted to
  * @param {int} reactId - reactId of the type of react the user wants to react with
  * ...
  *
  * @returns {error} - invalid token, invalid reactId, invalid MessageId, user already reacted,
  * user not in DM or channel
  * @returns {} - successful react
*/

export function messageReactV1(token : string, messageId : any, reactId : any) {
  const data = getData();
  const authUserId = findTokenId(token);
  if (authUserId === false) {
    throw HTTPError(403, 'invalid token');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid react Id');
  }
  const checkMessage = checkMessageId(messageId);
  if (checkMessage.route === 'empty') {
    throw HTTPError(400, 'not a valid message Id');
  }
  const index1 = checkMessage.index1;
  const index2 = checkMessage.index2;
  // Check if double react
  if (checkMessage.route === 'dms') {
    const checkUserInDm = checkEnrolledDm(authUserId, checkMessage.routeId);
    if (checkUserInDm === false) {
      throw HTTPError(400, 'user not in dm');
    }
    for (const react of data.dms[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === authUserId) {
          throw HTTPError(400, 'already reacted');
        }
      }
    }

    data.dms[index1].messages[index2].reacts[0].uIds.push(authUserId);
  }
  if (checkMessage.route === 'channels') {
    const checkUserInChannel = checkEnrolled(authUserId, checkMessage.routeId);
    if (checkUserInChannel === false) {
      throw HTTPError(400, 'user not in channel');
    }
    for (const react of data.channels[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === authUserId) {
          throw HTTPError(400, 'already reacted');
        }
      }
    }

    data.channels[index1].messages[index2].reacts[0].uIds.push(authUserId);
  }
  let isMessageSenderEnrolled = true;
  if (checkMessage.route === 'channels') {
    isMessageSenderEnrolled = checkEnrolled(checkMessage.uId, checkMessage.routeId);
  }
  if (checkMessage.route === '') {
    isMessageSenderEnrolled = checkEnrolledDm(checkMessage.uId, checkMessage.routeId);
  }
  if (isMessageSenderEnrolled === true) {
    let authUserHandle = '';
    for (const user of data.users) {
      if (authUserId === user.uId) {
        authUserHandle = user.handleStr;
        break;
      }
    }
    let routeName = '';
    if (checkMessage.route === 'channels') {
      for (const channel of data.channels) {
        if (channel.channelId === checkMessage.routeId) {
          routeName = channel.nameChannel;
          break;
        }
      }
    } else if (checkMessage.route === 'dms') {
      for (const dm of data.dms) {
        if (dm.dmId === checkMessage.routeId) {
          routeName = dm.name;
          break;
        }
      }
    }
    const messageString = authUserHandle + ' reacted to your message in ' + routeName;
    if (checkMessage.route === 'channels') {
      const notification = {
        channelId: checkMessage.routeId,
        dmId: -1,
        notificationMessage: messageString,
      };
      for (const user of data.users) {
        if (checkMessage.uId === user.uId) {
          user.notifications.push(notification);
          break;
        }
      }
    }
    if (checkMessage.route === 'dms') {
      const notification = {
        channelId: -1,
        dmId: checkMessage.routeId,
        notificationMessage: messageString,
      };
      for (const user of data.users) {
        if (checkMessage.uId === user.uId) {
          user.notifications.push(notification);
          break;
        }
      }
    }
  }

  setData(data);

  return {};
}

/**
  * <Unreacts a message>
  *
  * @param {String} token - token of user unreacting to a message
  * @param {int} messageId - messagedId of message being unreacted to
  * @param {int} reactId - reactId of the type of react the user wants to unreact with
  * ...
  *
  * @returns {error} - invalid token, invalid reactId, invalid MessageId, user hasn't reacted,
  * user not in DM or channel
  * @returns {} - successful unreact
*/
export function messageUnreactV1(token : string, messageId : any, reactId : any) {
  const data = getData();
  const authUserId = findTokenId(token);
  if (authUserId === false) {
    throw HTTPError(403, 'invalid token');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'invalid react Id');
  }
  const checkMessage = checkMessageId(messageId);
  if (checkMessage.route === 'empty') {
    throw HTTPError(400, 'not a valid message Id');
  }
  const index1 = checkMessage.index1;
  const index2 = checkMessage.index2;
  if (checkMessage.route === 'dms') {
    const checkUserInDm = checkEnrolledDm(authUserId, checkMessage.routeId);
    if (checkUserInDm === false) {
      throw HTTPError(400, 'user not in dm');
    }
    let userFound = false;
    for (const react of data.dms[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === authUserId) {
          userFound = true;
          const currentIndex = data.dms[index1].messages[index2].reacts[0].uIds.indexOf(uId);
          data.dms[index1].messages[index2].reacts[0].uIds.splice(currentIndex, 1);
        }
      }
    }
    if (userFound === false) {
      throw HTTPError(400, 'user has not reacted to the message');
    }
  }
  if (checkMessage.route === 'channels') {
    const checkUserInChannel = checkEnrolled(authUserId, checkMessage.routeId);
    if (checkUserInChannel === false) {
      throw HTTPError(400, 'user not in channel');
    }
    let userFound = false;
    for (const react of data.channels[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === authUserId) {
          userFound = true;
          const currentIndex = data.channels[index1].messages[index2].reacts[0].uIds.indexOf(uId);
          data.channels[index1].messages[index2].reacts[0].uIds.splice(currentIndex, 1);
        }
      }
    }
    if (userFound === false) {
      throw HTTPError(400, 'user has not reacted to the message');
    }
  }
  setData(data);
  return {};
}

/**
 * shares the message to a new dm/channel
 *
 * @param {string} token - token of user
 * @param {number} ogMessageId - messageId of original message
 * @param {string} message - message to append to original message
 * @param {number} channelId - channel to share to (-1 if dm)
 * @param {number} dmId - dm to share to (-1 if channel)
 * @returns {{sharedMessageId: number}} - messageId of shared message
 */
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data = getData();

  // Checks the validity of channelId and dmId
  if ((channelId === -1 && dmId === -1)) throw HTTPError(400, 'channelId and dmId are not given');
  if ((channelId !== -1 && dmId !== -1)) throw HTTPError(400, 'channelId and dmId invalid (both given)');

  // Checks the token is valid and gives uId else returns error
  const authUserId = findTokenId(token);
  if (authUserId === false) throw HTTPError(403, 'token is not valid');

  // Checks if a channel to share to has been input
  let shareToChannel: boolean;
  if (checkChannelId(channelId)) {
    shareToChannel = true;
    if (!checkEnrolled(authUserId, channelId)) throw HTTPError(403, 'user is not in this channel');
  } else if (checkDmId(dmId)) {
    shareToChannel = false;
    if (!checkEnrolledDm(authUserId, dmId)) throw HTTPError(403, 'user is not in this dm');
  } else {
    throw HTTPError(400, 'both channelId and dmId are invalid');
  }

  // Check whether the messageId is valid
  const messageValid = checkMessageId(ogMessageId);
  if (messageValid.route === 'empty') throw HTTPError(400, 'invalid messageId');
  const index1 = messageValid.index1;
  const index2 = messageValid.index2;
  const ogMessage = data[messageValid.route][index1].messages[index2].message;

  // Check valid message length
  if (message.length > 1000) throw HTTPError(400, 'invalid message length');

  // Set search route to correct path (channel or dm)
  let route = 'empty';
  let routeId = 'empty';
  if (shareToChannel) {
    route = 'channels';
    routeId = 'channelId';
  } else {
    route = 'dms';
    routeId = 'dmId';
  }
  const destinationId = channelId === -1 ? dmId : channelId;

  // Find route index
  let i = 0;
  for (i = 0; i < data[route].length; i++) {
    // for channel the below line would look like
    // data.channels[i].channelId === channelId
    if (data[route][i][routeId] === destinationId) break;
  }

  // Create new message
  let newMessage = ogMessage;
  if (message !== '') {
    newMessage += ' ';
    newMessage += message;
  }

  data.messageCountId++;
  data[route][i].messages.unshift({
    message: newMessage,
    uId: authUserId,
    messageId: data.messageCountId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  setData(data);
  return {
    sharedMessageId: data.messageCountId,
  };
}
/// //////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////

/**
  * Checks whether the channelId exists and is valid
  *
  * @param {number} channelId
  * @returns {boolean}
  */
export function checkChannelId(channelId: number): boolean {
  let inBank = false;
  const data = getData();
  for (let i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId && data.channels[i].channelId !== undefined) {
      inBank = true;
      break;
    }
  }
  if (inBank === false) return false;
  return true;
}

/**
  * Checks if the authUser is a member of the channel with ID channelId
  *
  * @param {number} authUserId
  * @param {number} channelId
  * @returns {boolean}
  */
export function checkEnrolled(authUserId: number, channelId: number) {
  const data = getData();
  let i = 0;
  for (i = 0; i < data.channels.length; i++) {
    if (data.channels[i].channelId === channelId) break;
  }

  for (let j = 0; j < data.channels[i].allMembers.length; j++) {
    if (authUserId === data.channels[i].allMembers[j].uId) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if token is valid, and if it is gives the uId of the session
 *
 * @param token
 * @returns {false | number}
 */
export function findTokenId(token: string) {
  const data = getData();
  for (const user of data.users) {
    for (const session of user.tokenSessions) {
      if (token === session) return user.uId;
    }
  }
  return false;
}

/**
 * Checks given dmId exists
 *
 * @param {number} dmId - Id of a dm
 * @returns {boolean} - if dmId is found
 */
export function checkDmId(dmId: number) {
  let inBank = false;
  const data = getData();
  for (let i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId && data.dms[i].dmId !== undefined) {
      inBank = true;
      break;
    }
  }
  if (inBank === false) return false;
  return true;
}

/**
 * Checks if user is in a given dm
 *
 * @param {number} authUserId
 * @param {number} dmId
 * @returns {boolean} - if user is/isn't in dm
 */
export function checkEnrolledDm(authUserId: number, dmId: number) {
  const data = getData();
  let i = 0;
  for (i = 0; i < data.dms.length; i++) {
    if (data.dms[i].dmId === dmId) break;
  }

  for (let j = 0; j < data.dms[i].members.length; j++) {
    if (authUserId === data.dms[i].members[j].uId) {
      return true;
    }
  }

  return false;
}

/**
 * Check if given messageId exists
 *
 * @param {number} messageId
 * @returns {
 *  route: string,
 *  index1: number,
 *  index2: number,
 *  uId: number,
 *  routeId: number,
 * } - if messageId is found
 * @returns {{route: 'empty'}} - if messageId not found
 */
export function checkMessageId(messageId: number) {
  const data = getData();
  for (let i = 0; i < data.channels.length; i++) {
    for (let j = 0; j < data.channels[i].messages.length; j++) {
      if (data.channels[i].messages[j].messageId === messageId) {
        return {
          route: 'channels',
          index1: i,
          index2: j,
          uId: data.channels[i].messages[j].uId,
          routeId: data.channels[i].channelId,
        };
      }
    }
  }

  for (let i = 0; i < data.dms.length; i++) {
    for (let j = 0; j < data.dms[i].messages.length; j++) {
      if (data.dms[i].messages[j].messageId === messageId) {
        return {
          route: 'dms',
          index1: i,
          index2: j,
          uId: data.dms[i].messages[j].uId,
          routeId: data.dms[i].dmId,
        };
      }
    }
  }

  return { route: 'empty' };
}

/**
 * Checks the permissions of the user in a channel/dm/global
 *
 * @param {number} uId
 * @param {number} routeId
 * @param {string} route
 * @returns {boolean} - whether user is a global owner or owner of a channel/dm
 */
export function checkPermissions(uId, routeId, route) {
  const data = getData();
  let isGlobalOwner = false;
  for (const user of data.users) {
    if (user.uId === uId) isGlobalOwner = user.isGlobalOwner;
  }

  if (route === 'channels') {
    for (const channel of data.channels) {
      if (channel.channelId === routeId) {
        for (const member of channel.allMembers) {
          if (member.uId === uId && isGlobalOwner) return isGlobalOwner;
          if (member.uId === uId) return member.isOwner;
        }
      }
    }
  } else if (route === 'dms') {
    for (const dm of data.dms) {
      if (dm.dmId === routeId) {
        for (const member of dm.members) {
          if (member.uId === uId) return member.isOwner;
        }
      }
    }
  }

  for (const user of data.users) {
    if (user.uId === uId) return user.isGlobalOwner;
  }
}
