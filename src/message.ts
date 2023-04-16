/**
 * message.ts
 *
 * Contains all the function implementations
 * to be used by the server routes.
 */

import { getData, getHashOf, setData } from './dataStore';
import HTTPError from 'http-errors';

interface Error {
  error: string
}

interface MessageSendReturn {
  messageId: number
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

const MAXMESSAGELENGTH = 1000;
const MINMESSAGELENGTH = 1;

/**
 * messageSendV1
 *
 * Sends a given message to a given channel
 *
 * @param { string } token
 * @param { number } channelId
 * @param { string } message
 * @returns {{ messageId: number }}
 */
function messageSendV1(token: string, channelId: number, message: string): MessageSendReturn | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(400, 'Invalid ChannelId');
  }

  if (message.length < MINMESSAGELENGTH || message.length > MAXMESSAGELENGTH) {
    throw HTTPError(400, 'Invalid Message Length');
  }

  const userId = getIdFromToken(token);

  if (!isMemberChannel(userId, channelId)) {
    throw HTTPError(403, 'User is Not a Member of the Channel');
  }

  const data = getData();

  // Message Id's start at 0
  const messageId = data.globalMessageCounter;
  data.globalMessageCounter++;

  const messageObj = {
    message: message,
    uId: userId,
    messageId: messageId,
    timeSent: Math.floor(Date.now() / 1000),
  };

  data.channels[channelId].messages.push(messageObj);

  channelMessageNotif(userId, channelId, message);

  setData(data);

  return { messageId: messageId };
}

/**
 * channelMessageNotif
 *
 * Given a uId, channelId, and message, creates a notification for
 * all user that have been tagged in the message.
 *
 * @param { number } uId
 * @param { number } channelId
 * @param { string } message
 */
function channelMessageNotif(uId: number, channelId: number, message: string) {
  const data = getData();

  let cutMessage: string;
  if (message.length > 20) {
    cutMessage = message.slice(0, 20);
  } else {
    cutMessage = message;
  }

  const notifMsg = `@${data.users[uId].userHandle} tagged you in ${data.channels[channelId].name}: ${cutMessage}`;

  const notification = {
    channelId: channelId,
    dmId: -1,
    notificationMessage: notifMsg
  };

  const taggedHandles = getUserHandles(message);
  const taggedIds: number[] = [];

  if (taggedHandles === null) {
    return;
  }

  for (const handle of taggedHandles) {
    const handleId = getIdfromHandle(handle);
    taggedIds.push(handleId);
  }

  const filteredTaggedIds = taggedIds.filter((element, index) => {
    return taggedIds.indexOf(element) === index;
  });

  for (const id of filteredTaggedIds) {
    if (isMemberChannel(id, channelId)) {
      data.users[id].notifications.push(notification);
    }
  }
}

/**
 * getUserHandles
 *
 * Given a message, extracts all possible user handles from the
 * message inputted.
 *
 * Note: Grabs handles containing '_' however due to constraints
 * on what valid user handles are should not cuase errors
 *
 * @param { string } message
 * @returns { string[] }
 */
function getUserHandles(message: string): string[] {
  const handles = message.match(/[@]\w+/g);
  return handles;
}

/**
 * getIdFromhandle
 *
 * Given a handle extracts the uId of the person
 * associated with that handle.
 * Errors should not occur due to previous error test
 *
 * @param { string } handle
 * @returns { number }
 */
function getIdfromHandle(handle: string): number {
  const data = getData();

  for (const user of data.users) {
    const userHandle = '@' + user.userHandle;
    if (userHandle === handle) {
      return user.uId;
    }
  }
}

/**
 * messageSendDmV1
 *
 * Sends a given message to a given dm
 *
 * @param { string } token
 * @param { number } dmId
 * @param { string } message
 * @returns {{ messageId: number }}
 */
function messageSendDmV1(token: string, dmId: number, message: string): MessageSendReturn | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid DmId');
  }

  if (message.length < MINMESSAGELENGTH || message.length > MAXMESSAGELENGTH) {
    throw HTTPError(400, 'Invalid Message Length');
  }

  const userId = getIdFromToken(token);

  if (!isMemberDm(userId, dmId)) {
    throw HTTPError(403, 'User is Not a Member of the Dm');
  }

  const data = getData();

  // Message Id's start at 0
  const messageId = data.globalMessageCounter;
  data.globalMessageCounter++;

  const messageObj = {
    message: message,
    uId: userId,
    messageId: messageId,
    timeSent: Math.floor(Date.now() / 1000),
  };

  data.dms[dmId].messages.push(messageObj);

  dmMessageNotif(userId, dmId, message);

  setData(data);

  return {
    messageId: messageId,
  };
}

/**
 * channelMessageNotif
 *
 * Given a uId, channelId, and message, creates a notification for
 * all user that have been tagged in the message.
 *
 * @param { number } uId
 * @param { number } dmId
 * @param { string } message
 */
function dmMessageNotif(uId: number, dmId: number, message: string) {
  const data = getData();

  let cutMessage: string;
  if (message.length > 20) {
    cutMessage = message.slice(0, 20);
  } else {
    cutMessage = message;
  }

  const notifMsg = `@${data.users[uId].userHandle} tagged you in ${data.dms[dmId].name}: ${cutMessage}`;

  const notification = {
    channelId: -1,
    dmId: dmId,
    notificationMessage: notifMsg
  };

  const taggedHandles = getUserHandles(message);
  const taggedIds: number[] = [];

  if (taggedHandles === null) {
    return;
  }

  for (const handle of taggedHandles) {
    const handleId = getIdfromHandle(handle);
    taggedIds.push(handleId);
  }

  const filteredTaggedIds = taggedIds.filter((element, index) => {
    return taggedIds.indexOf(element) === index;
  });

  for (const id of filteredTaggedIds) {
    if (isMemberDm(id, dmId)) {
      data.users[id].notifications.push(notification);
    }
  }
}

/**
 * messageEditV1
 *
 * Edits given message
 *
 * @param { string } token
 * @param { number } messageId
 * @param { string } message
 * @returns {{ }}
 */
function messageEditV1(token: string, messageId: number, message: string): Record<string, never> | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channelId = checkMessageInChannels(messageId);
  const dmId = checkMessageInDms(messageId);

  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'Invalid Message Id');
  }

  if (message.length > MAXMESSAGELENGTH) {
    throw HTTPError(400, 'Invalid Message Length');
  }

  const userId = getIdFromToken(token);

  const data = getData();
  let messageIndex, isOwner, route;

  if (channelId > -1) {
    if (!isMemberChannel(userId, channelId)) {
      throw HTTPError(400, 'User is not a Member of the Channel');
    }

    if (isChannelOwner(userId, channelId)) {
      isOwner = true;
    }

    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    route = data.channels[channelId].messages;
  }

  if (dmId > -1) {
    if (!isMemberDm(userId, dmId)) {
      throw HTTPError(400, 'User is not a Member of the Dm');
    }

    if (isDmOwner(userId, dmId)) {
      isOwner = true;
    }

    messageIndex = getMessageIndex(messageId, dmId, 'dm');
    route = data.dms[dmId].messages;
  }

  let userAllowed = false;

  if (userId === route[messageIndex].uId || isOwner) {
    userAllowed = true;
  }

  if (!userAllowed) {
    throw HTTPError(400, 'User does not have Permission to Edit this Message');
  }

  // If the message is empty it simply calls message remove
  // and returns early.
  if (message.length === 0) {
    messageRemoveV1(token, messageId);
    return {};
  }

  route[messageIndex].message = message;

  setData(data);

  return {};
}

/**
 * messageRemoveV1
 *
 * Removes a message from a channel/dm
 *
 * @param { string } token
 * @param { number } messageId
 * @returns {{ }}
 */
function messageRemoveV1(token: string, messageId: number): Record<string, never> | Error {
  if (!isValidToken(token)) {
    throw HTTPError(400, 'Invalid Token');
  }

  const channelId = checkMessageInChannels(messageId);
  const dmId = checkMessageInDms(messageId);

  if (channelId === -1 && dmId === -1) {
    throw HTTPError(400, 'Invalid Message Id');
  }

  const userId = getIdFromToken(token);

  const data = getData();
  let messageObj: Message, messageIndex;

  if (channelId > -1 && dmId === -1) {
    if (!isMemberChannel(userId, channelId)) {
      throw HTTPError(400, 'User is not a Member of the Channel');
    }

    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    messageObj = data.channels[channelId].messages[messageIndex];

    if (!isChannelOwner(userId, channelId) && userId !== messageObj.uId) {
      throw HTTPError(400, 'User does not have Permission to Edit this Message');
    }

    data.channels[channelId].messages.splice(messageIndex, 1);
  }

  if (dmId > -1 && channelId === -1) {
    if (!isMemberDm(userId, dmId)) {
      throw HTTPError(400, 'User is not a Member of the Dm');
    }

    messageIndex = getMessageIndex(messageId, dmId, 'dm');
    messageObj = data.dms[dmId].messages[messageIndex];

    if (!isDmOwner(userId, dmId) && userId !== messageObj.uId) {
      throw HTTPError(400, 'User does not have Permission to Edit this Message');
    }

    data.dms[dmId].messages.splice(messageIndex, 1);
  }

  data.globalMessageCounter--;
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

function messageReactV1(token : string, messageId : number, reactId : number) {
  const userId = getIdFromToken(token);
  const data = getData();

  if (!isValidToken(token)) {
    throw HTTPError(400, 'Invalid Token');
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
    const checkUserInDm = isMemberDm(userId, checkMessage.routeId);
    if (checkUserInDm === false) {
      throw HTTPError(400, 'user not in dm');
    }
    for (const react of data.dms[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === userId) {
          throw HTTPError(400, 'already reacted');
        }
      }
    }

    data.dms[index1].messages[index2].reacts[0].uIds.push(userId);
  }
  if (checkMessage.route === 'channels') {
    const checkUserInChannel = isMemberChannel(userId, checkMessage.routeId);
    if (checkUserInChannel === false) {
      throw HTTPError(400, 'user not in channel');
    }
    for (const react of data.channels[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === userId) {
          throw HTTPError(400, 'already reacted');
        }
      }
    }

    data.channels[index1].messages[index2].reacts[0].uIds.push(userId);
  }
  let isMessageSenderEnrolled = true;
  if (checkMessage.route === 'channels') {
    isMessageSenderEnrolled = isMemberChannel(checkMessage.uId, checkMessage.routeId);
  }
  if (checkMessage.route === '') {
    isMessageSenderEnrolled = isMemberDm(checkMessage.uId, checkMessage.routeId);
  }
  if (isMessageSenderEnrolled === true) {
    let authUserHandle = '';
    for (const user of data.users) {
      if (userId === user.uId) {
        authUserHandle = user.handleStr;
        break;
      }
    }
    let routeName = '';
    if (checkMessage.route === 'channels') {
      for (const channel of data.channels) {
        if (channel.channelId === checkMessage.routeId) {
          routeName = channel.name;
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
function messageUnreactV1(token : string, messageId : any, reactId : any) {
  const userId = getIdFromToken(token);
  const data = getData();
  if (!isValidToken(token)) {
    throw HTTPError(400, 'Invalid Token');
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
    const checkUserInDm = isMemberDm(userId, checkMessage.routeId);
    if (checkUserInDm === false) {
      throw HTTPError(400, 'user not in dm');
    }
    let userFound = false;
    for (const react of data.dms[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === userId) {
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
    const checkUserInChannel = isMemberDm(userId, checkMessage.routeId);
    if (checkUserInChannel === false) {
      throw HTTPError(400, 'user not in channel');
    }
    let userFound = false;
    for (const react of data.channels[index1].messages[index2].reacts) {
      for (const uId of react.uIds) {
        if (uId === userId) {
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
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const userId = getIdFromToken(token);
  const data = getData();

  // Checks the validity of channelId and dmId
  if (channelId === -1 && dmId === -1){
    throw HTTPError(400, 'channelId and dmId are not given');
  }
  if (channelId !== -1 && dmId !== -1){
    throw HTTPError(400, 'channelId and dmId invalid (both given)');
  }
  // Checks the token is valid and gives uId else returns error
  if (!isValidToken(token)) {
    throw HTTPError(400, 'Invalid Token');
  }
  // Checks if a channel to share to has been input
  let shareToChannel: boolean;
  if (checkChannelId(channelId)) {
    shareToChannel = true;
    if (!isMemberChannel(userId, channelId)){
       throw HTTPError(403, 'user is not in this channel');
    }
  } else if (isValidDmId(dmId)) {
    shareToChannel = false;
    if (!isMemberDm(userId, dmId)){
      throw HTTPError(403, 'user is not in this dm');
    }
  } else {
    throw HTTPError(400, 'both channelId and dmId are invalid');
  }

  // Check whether the messageId is valid
  const messageValid = checkMessageId(ogMessageId);
  if (messageValid.route === 'empty'){
    throw HTTPError(400, 'invalid messageId');
  }
  const index1 = messageValid.index1;
  const index2 = messageValid.index2;
  const ogMessage = data[messageValid.route][index1].messages[index2].message;

  // Check valid message length
  if (message.length > 1000){
    throw HTTPError(400, 'invalid message length');
  }

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

  data.globalMessageCounter++;
  data[route][i].messages.unshift({
    message: newMessage,
    uId: authUserId,
    messageId: data.globalMessageCounter,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [{
      reactId: 1,
      uIds: []
    }],
    isPinned: false
  });

  setData(data);
  return {
    sharedMessageId: data.globalMessageCounter,
  };
}

export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1, messageReactV1, messageUnreactV1, messageShareV1 };

/** Helper Functions **/

/**
 * isValidToken
 *
 * Given a token returns whether the token exists
 * within the dataStore or not.
 *
 * @param { string } token
 * @returns { boolean }
 */
function isValidToken(token: string): boolean {
  const data = getData();
  const hashedToken = getHashOf(token);

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(hashedToken)) {
      return true;
    }
  }
  return false;
}

/**
 * getIdFromToken
 *
 * Given a token extracts the uId of the person
 * associated with that token.
 * Errors should not occur due to previous error test
 *
 * @param { string } token
 * @returns { number }
 */
function getIdFromToken(token: string): number {
  const data = getData();
  const hashedToken = getHashOf(token);

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(hashedToken)) {
      return user.uId;
    }
  }
}

/**
 * checkChannelId
 *
 * Checks whether the channelId exists
 *
 * @param { number } channelId
 * @returns { boolean }
 */
function checkChannelId(channelId: number): boolean {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
}

/**
 * isMemberChannel
 *
 * Checks if the authUser is a member of the channel with ID channelId
 *
 * @param { number } uId
 * @param { number } channelId
 * @returns { boolean }
*/
function isMemberChannel(uId: number, channelId: number) {
  const data = getData();

  for (const channel of data.channels) {
    const members = channel.allMembers;
    if (members.some(user => user.uId === uId)) {
      return true;
    }
  }
  return false;
}

/**
 * isValidDmId
 *
 * Given a dmId returns whether it exists or not
 *
 * @param { number } dmId
 * @returns { boolean }
 */
function isValidDmId(dmId: number) {
  const data = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
}

/**
 * isMemberDm
 *
 * Given a userId and dmId, returns whether the user is
 * in the dm.
 *
 * @param { number } uId
 * @param { number } dmId
 * @returns { boolean }
 */
function isMemberDm(uId: number, dmId: number): boolean {
  const dm = getData().dms[dmId];

  for (const member of dm.members) {
    if (member === uId) {
      return true;
    }
  }
  return false;
}

/**
 * checkMessageInChannels
 *
 * Given a messageId, returns a channelId if the message is
 * within a channel, otherwise returns -1.
 *
 * @param { number } messageId
 * @param { number }
 */
function checkMessageInChannels(messageId: number): number {
  const data = getData();

  for (const channel of data.channels) {
    const messages = channel.messages;
    if (messages.some(message => message.messageId === messageId)) {
      return data.channels.indexOf(channel);
    }
  }

  return -1;
}

/**
 * checkMessageInDms
 *
 * Given a messageId, returns a dmId if the message is
 * within a dm, otherwise returns -1.
 *
 * @param { number } messageId
 */
function checkMessageInDms(messageId: number): number {
  const data = getData();

  for (const dm of data.dms) {
    const messages = dm.messages;
    if (messages.some(message => message.messageId === messageId)) {
      return data.dms.indexOf(dm);
    }
  }

  return -1;
}

/**
 * isDmOwner
 *
 * Given a uId and a dmId, checks if that user
 * is a owner in the Dm.
 *
 * @param { number } uId
 * @param { number } dmId
 * @returns { boolean }
 */
function isDmOwner(uId: number, dmId: number): boolean {
  const data = getData();
  const dm = data.dms[dmId];

  if (dm.owner === uId) {
    return true;
  }

  return false;
}

/**
 * isChannelOwner
 *
 * Given a uId and a channelId, checks if that user
 * is a owner in the channel.
 *
 * @param { number } uId
 * @param { number } channelId
 * @returns { boolean }
 */
function isChannelOwner(uId: number, channelId: number): boolean {
  const data = getData();
  const channel = data.channels[channelId];

  if (channel.owners.some(owner => owner.uId === uId)) {
    return true;
  }

  return false;
}

/**
 * getMessageIndex
 *
 * Finds the index of a message in either the
 * channels message array of dms message array
 *
 * @param { number } messageId
 * @param { number } routeId
 * @param { string } identifier
 * @returns { number }
 */
function getMessageIndex(messageId: number, routeId: number, identifier: string): number {
  const data = getData();

  if (identifier === 'channel') {
    const channel = data.channels[routeId];

    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return channel.messages.indexOf(message);
      }
    }
  }

  if (identifier === 'dm') {
    const dm = data.dms[routeId];

    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return dm.messages.indexOf(message);
      }
    }
  }
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
