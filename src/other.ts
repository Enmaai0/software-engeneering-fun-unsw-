/**
 * other.ts
 *
 * Contains the function implementations of all
 * functions that are uncategorized.
 */

import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

interface Notifications {
  notifications: Notification[]
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
  const sortedUserNotifications = userNotifications.reverse();
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
 * findUId
 *
 * Given a token, find the corresponding uId
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
}

export { clearV1, notificationsGet };
