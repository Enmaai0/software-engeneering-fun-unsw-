/**
 * other.ts
 *
 * Contains the function implementations of all
 * functions that are uncategorized.
 */

import HTTPError from 'http-errors';
import { getData, getHashOf, setData } from './dataStore';

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

export { clearV1, notificationsGet };

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
