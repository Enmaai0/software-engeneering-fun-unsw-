/**
 * other.ts
 *
 * Contains the function implementations of all
 * functions that are uncategorized.
 */

import HTTPError from 'http-errors';
import { getData, getHashOf, setData } from './dataStore';

const MINSTRINGLENGTH = 1;
const MAXSTRINGLENGTH = 1000;

interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

interface Notifications {
  notifications: Notification[]
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

/**
 * clearV1
 *
 * Grabs the data in the dataStore, then
 * sets the data to be an empty user and
 * channel array (default state)
 *
 * @param null
 * @returns {{ }}
 */
function clearV1(): Record<string, never> {
  let data = getData();

  data = {
    users: [],
    channels: [],
    dms: [],
    userStats: {
      channelsJoined: [],
      dmsJoined: [],
      messagesSent: [],
      involvementRate: 0,
    },
    WorkspaceStats: {
      channelsExist: [],
      dmsExist: [],
      messagesExist: [],
      utilizationRate: 0,
    },
    globalMessageCounter: 0
  };

  setData(data);

  return {};
}

/**
 * notificationsGet
 *
 * Given a token, returns an array of all the notifications
 * that person has recieved.
 *
 * Notifications include:
 * - Being added/invited to a channel or dm
 * - Being tagged in a message in a channel or dm (see 6.10.2)
 * - Having someone react to your message in a channel or dm
 *
 * @param { string } token
 * @returns {{ notifications: [] }}
 */
function notificationsGet(token: string): Notifications | { error: string } {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const uId = getIdFromToken(token);
  const user = getData().users[uId];

  const userNotifications = user.notifications;
  const sortedUserNotifications = [...userNotifications.reverse()];
  const returnNotifications: Notification[] = [];

  for (const notification of sortedUserNotifications) {
    if (returnNotifications.length >= 20 || notification === undefined) {
      break;
    }
    returnNotifications.push(notification);
  }

  return { notifications: returnNotifications };
}

/**
 * search
 *
 * Given a queryString, returns a list of all messages that contain
 * that string in both channels and Dms that that user is a member of.
 *
 * @param { string } token
 * @param { string } queryString
 * @returns {{ messages: Message[] }}
 */
function search(token: string, queryString: string): { messages: Message[] } {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  if (queryString.length < MINSTRINGLENGTH) {
    throw HTTPError(400, 'String Cannot be Empty');
  }

  if (queryString.length > MAXSTRINGLENGTH) {
    throw HTTPError(400, 'String Cannot be Over 1000 Characters');
  }

  const channelMessages = getSearchMessages(token, queryString, 'channel');
  const dmMessages = getSearchMessages(token, queryString, 'dms');

  return { messages: channelMessages.concat(dmMessages) };
}

export { clearV1, notificationsGet, search };

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
 * getSearchMessages
 *
 * Returns all messages that the user is a part of that contains
 * the queryString (non-case sensitive) from either all channels
 * or dms depending on the route entered.
 *
 * @param { string } token
 * @param { string } queryString
 * @param { string } route
 * @returns { Message[] }
 */
function getSearchMessages(token: string, queryString: string, route: string): Message[] {
  let dataArea;

  if (route === 'channel') {
    dataArea = getData().channels;
  } else {
    // if route === 'dms'
    dataArea = getData().dms;
  }

  const messages: Message[] = [];

  for (let i = 0; i < dataArea.length; i++) {
    if (!isMember(token, i, route)) {
      continue;
    }
    const area = dataArea[i];
    for (const message of area.messages) {
      if (doesMessageContain(message.message, queryString)) {
        const messageObject = {
          messageId: message.messageId,
          uId: message.uId,
          message: message.message,
          timeSent: message.timeSent
        };

        messages.push(messageObject);
      }
    }
  }

  return messages;
}

/**
 * isMember
 *
 * Given a token and a channel/dm id returns whether the user
 * is a member of the channel/dm depending on the route entered.
 *
 * @param { string } token
 * @param { string } id
 * @param { string } route
 * @returns { boolean }
 */
function isMember(token: string, id: number, route: string) {
  if (route === 'channel') {
    return isChannelMember(token, id);
  } else {
    return isDmMember(token, id);
  }
}

/**
 * isChannelMember
 *
 * Given an token and channelId, checks if a user
 * with the token is a part of the channel
 *
 * @param { string } token
 * @param { number } channelId
 * @return { boolean }
 */
function isChannelMember(token: string, channelId: number): boolean {
  const members = getData().channels[channelId].allMembers;
  const uId = getIdFromToken(token);

  for (const member of members) {
    if (member.uId === uId) {
      return true;
    }
  }

  return false;
}

/**
 * isDmMember
 *
 * Given an token and channelId, checks if a user
 * with the token is a part of the channel
 *
 * @param { string } token
 * @param { number } DmId
 * @return { boolean }
 */
function isDmMember(token: string, dmId: number): boolean {
  const members = getData().dms[dmId].members;
  const uId = getIdFromToken(token);

  for (const member of members) {
    if (member === uId) {
      return true;
    }
  }

  return false;
}

function doesMessageContain(message: string, queryString: string): boolean {
  if (message.toLowerCase().includes(queryString.toLowerCase())) {
    return true;
  }
  return false;
}
