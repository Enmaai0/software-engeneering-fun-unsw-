/**
 * message.ts
 *
 * Contains all the function implementations
 * to be used by the server routes.
 */

import { getData, setData } from './dataStore';

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
    return { error: 'Invalid Token' };
  }

  if (!checkChannelId(channelId)) {
    return { error: 'Invalid ChannelId' };
  }

  if (message.length < MINMESSAGELENGTH || message.length > MAXMESSAGELENGTH) {
    return { error: 'Invalid Message Length' };
  }

  const userId = getIdFromToken(token);

  if (!isMemberChannel(userId, channelId)) {
    return { error: 'User is Not a Member of the Channel' };
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
    if (handleId !== -1) {
      taggedIds.push(handleId);
    }
  }

  for (const id of taggedIds) {
    data.users[id].notifications.push(notification);
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
  return -1;
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
    return { error: 'Invalid Token' };
  }

  if (!isValidDmId(dmId)) {
    return { error: 'Invalid DmId' };
  }

  if (message.length < MINMESSAGELENGTH || message.length > MAXMESSAGELENGTH) {
    return { error: 'Invalid Message Length' };
  }

  const userId = getIdFromToken(token);

  if (!isMemberDm(userId, dmId)) {
    return { error: 'User is Not a Member of the Dm' };
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
    if (handleId !== -1) {
      taggedIds.push(handleId);
    }
  }

  for (const id of taggedIds) {
    data.users[id].notifications.push(notification);
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
    return { error: 'Invalid Token' };
  }

  const channelId = checkMessageInChannels(messageId);
  const dmId = checkMessageInDms(messageId);

  if (channelId === -1 && dmId === -1) {
    return { error: 'Invalid Message Id' };
  }

  if (message.length > MAXMESSAGELENGTH) {
    return { error: 'Invalid Message Length' };
  }

  const userId = getIdFromToken(token);

  const data = getData();
  let messageIndex, isOwner, route;

  if (channelId > -1) {
    if (!isMemberChannel(userId, channelId)) {
      return { error: 'User is not a Member of the Channel' };
    }

    if (isChannelOwner(userId, channelId)) {
      isOwner = true;
    }

    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    route = data.channels[channelId].messages;
  }

  if (dmId > -1) {
    if (!isMemberDm(userId, dmId)) {
      return { error: 'User is not a Member of the Dm' };
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
    return { error: 'User does not have Permission to Edit this Message' };
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
    return { error: 'Invalid Token' };
  }

  const channelId = checkMessageInChannels(messageId);
  const dmId = checkMessageInDms(messageId);

  if (channelId === -1 && dmId === -1) {
    return { error: 'Invalid Message Id' };
  }

  const userId = getIdFromToken(token);

  const data = getData();
  let messageObj: Message, messageIndex;

  if (channelId > -1) {
    if (!isMemberChannel(userId, channelId)) {
      return { error: 'User is not a Member of the Channel' };
    }

    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    messageObj = data.channels[channelId].messages[messageIndex];

    if (!isChannelOwner(userId, channelId) && userId !== messageObj.uId) {
      return { error: 'User does not have Permission to Edit this Message' };
    }

    data.channels[channelId].messages.splice(messageIndex, 1);
  }

  if (dmId > -1) {
    if (!isMemberDm(userId, dmId)) {
      return { error: 'User is not a Member of the Dm' };
    }

    messageIndex = getMessageIndex(messageId, dmId, 'dm');
    messageObj = data.dms[dmId].messages[messageIndex];

    if (!isDmOwner(userId, dmId) && userId !== messageObj.uId) {
      return { error: 'User does not have Permission to Edit this Message' };
    }
    data.dms[dmId].messages.splice(messageIndex, 1);
  }

  data.globalMessageCounter--;
  setData(data);

  return {};
}

/** Helper Functions **/

/**
 * isValidToken
 *
 * Given a token and to check if it is
 * a valid token owned by any user
 *
 * @param { string } token
 * @returns { boolean }
 */
function isValidToken(token: string): boolean {
  const users = getData().users;
  for (const user of users) {
    for (const theToken of user.tokens) {
      if (theToken === token) {
        return true;
      }
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

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
      return user.uId;
    }
  }
  return -1;
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
 * @param { number }
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

  if (identifier === 'dm') {
    const dm = data.dms[routeId];

    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return dm.messages.indexOf(message);
      }
    }
  }

  if (identifier === 'channel') {
    const channel = data.channels[routeId];

    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return channel.messages.indexOf(message);
      }
    }
  }

  return -1;
}

export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 };
