
import { findTokenId, checkChannelId, checkEnrolled } from './channel';
import { getData, setData } from './dataStore';

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
  if (authUserId === false) return { error: 'token is not valid' };

  // Check whether the channelId is valid
  const channelInvalid = checkChannelId(channelId);
  if (channelInvalid !== true) return channelInvalid;

  // Check valid message length


  if (message.length < 1 || message.length > 1000) return { error: 'invalid message length' };

  // Check whether a user is in the channel
  const userEnrolled = checkEnrolled(authUserId, channelId);
  if (userEnrolled === false) return { error: 'authUser is not a member of this channel' };

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
  if (authUserId === false) return { error: 'token is not valid' };

  // Check whether the dmId is valid
  const dmInvalid = checkDmId(dmId);
  if (dmInvalid !== true) return dmInvalid;


  // Check valid message length
  if (message.length < 1 || message.length > 1000) return { error: 'invalid message length' };

  // Check whether a user is in the channel
   const userEnrolled = checkEnrolledDm(authUserId, dmId);
  if (userEnrolled === false) return { error: 'authUser is not a member of this channel' };

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
 * @returns {{error: string}} - any invalid input
 */
export function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();

  // Checks the token is valid and gives uId else returns error

  const authUserId = findTokenId(token);
  if (authUserId === false) return { error: 'token is not valid' };

  // Check whether the messageId is valid
  const messageValid = checkMessageId(messageId);
  if (messageValid.route === 'empty') return { error: 'invalid messageId' };

  // Check valid message length
  if (message.length > 1000) return { error: 'invalid message length' };


  // Check whether a user is in the channel
  if (messageValid.uId !== authUserId) {
    const perms = checkPermissions(authUserId, messageValid.routeId, messageValid.route);
    if (!perms) return { error: 'incorrect permissions for this action' };
  }

  // Remove message if the edit is an empty string

  if (message.length < 1) return messageRemoveV1(token, messageId);

  // Different path if message is a dm or channel
  if (messageValid.route === 'channel') {
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
    if (authUserId === false) return { error: 'token is not valid' };

  // Check whether the messageId is valid
  const messageValid = checkMessageId(messageId);
  if (messageValid.route === 'empty') return { error: 'invalid messageId' };

  // Check whether a user is in the channel
 
  if (messageValid.uId !== authUserId) {
    const perms = checkPermissions(authUserId, messageValid.routeId, messageValid.route);
    if (!perms) return { error: 'incorrect permissions for this action' };
  }

  // Different path if message is a dm or channel
  if (messageValid.route === 'channel') {
 
    data.channels[messageValid.index1].messages.splice(messageValid.index2, 1);
  } else if (messageValid.route === 'dms') {
    data.dms[messageValid.index1].messages.splice(messageValid.index2, 1);
  }

 
  setData(data);
  return {};
}

/// ////////// Helper Functions //////////////

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
 
 * Checks given dmId exists
 *
 * @param {number} dmId - Id of a dm
 * @returns {true} - if dmId is found
 * @returns {{error: string}} - dmId not found
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
 
  if (inBank === false) return { error: 'Invalid dmId' };   
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
 *      route: string,
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
              route: 'channel',
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
  const     data = getData();
  if (route === 'channel') {
    for (const channel of data.channels) {
      if (channel.channelId === routeId) {
        for (const member of channel.allMembers) {
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

