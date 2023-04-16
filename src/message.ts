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

interface React {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
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
function messageSendV1(token: string, channelId: number, message: string, standup?: boolean): MessageSendReturn | Error {
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

  const reacts: React[] = [];
  const messageObj: Message = {
    message: message,
    uId: userId,
    messageId: messageId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: reacts,
    isPinned: false
  };

  data.channels[channelId].messages.push(messageObj);

  if (typeof standup === 'undefined') {
    channelMessageNotif(userId, channelId, message);
  }

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

  const reacts: React[] = [];
  const messageObj: Message = {
    message: message,
    uId: userId,
    messageId: messageId,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: reacts,
    isPinned: false
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

function messagePinV1(token: string, messageId: number): Record<string, never> | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
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
    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    messageObj = data.channels[channelId].messages[messageIndex];

    if (!isChannelOwner(userId, channelId) && userId !== messageObj.uId) {
      throw HTTPError(400, 'User does not have Permission to Edit this Message');
    }

    if (data.channels[channelId].messages[messageIndex].isPinned) {
      throw HTTPError(400, 'The message is already pinned');
    }

    data.channels[channelId].messages[messageIndex].isPinned = true;
    setData(data);
    return {};
  }

  if (dmId > -1 && channelId === -1) {
    messageIndex = getMessageIndex(messageId, dmId, 'dm');
    messageObj = data.dms[dmId].messages[messageIndex];

    if (!isDmOwner(userId, dmId) && userId !== messageObj.uId) {
      throw HTTPError(403, 'User does not have Permission to Edit this Message');
    }

    if (data.dms[dmId].messages[messageIndex].isPinned) {
      throw HTTPError(400, 'The message is already pinned');
    }

    data.dms[dmId].messages[messageIndex].isPinned = true;
    setData(data);
    return {};
  }
}

function messageUnPinV1(token: string, messageId: number): Record<string, never> | Error {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
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
    messageIndex = getMessageIndex(messageId, channelId, 'channel');
    messageObj = data.channels[channelId].messages[messageIndex];

    if (!isChannelOwner(userId, channelId) && userId !== messageObj.uId) {
      throw HTTPError(403, 'User does not have Permission to Edit this Message');
    }

    if (!data.channels[channelId].messages[messageIndex].isPinned) {
      throw HTTPError(400, 'The message is not already pinned');
    }

    data.channels[channelId].messages[messageIndex].isPinned = false;
    setData(data);
    return {};
  }

  if (dmId > -1 && channelId === -1) {
    messageIndex = getMessageIndex(messageId, dmId, 'dm');
    messageObj = data.dms[dmId].messages[messageIndex];

    if (!isDmOwner(userId, dmId) && userId !== messageObj.uId) {
      throw HTTPError(400, 'User does not have Permission to Edit this Message');
    }

    if (!data.dms[dmId].messages[messageIndex].isPinned) {
      throw HTTPError(400, 'The message is not already pinned');
    }

    data.dms[dmId].messages[messageIndex].isPinned = false;
    setData(data);
    return {};
  }
}

export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1, messagePinV1, messageUnPinV1 };

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
export function getMessageIndex(messageId: number, routeId: number, identifier: string): number {
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
