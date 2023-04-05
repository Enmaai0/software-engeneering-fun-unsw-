/**
 * other.ts
 *
 * Contains the function implementations of all
 * functions that are uncategorized.
 */

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
 * Array of objects, where each object contains types { channelId, dmId, notificationMessage } where

  channelId is the id of the channel that the event happened in, and is -1 if it is being sent to a DM

  dmId is the DM that the event happened in, and is -1 if it is being sent to a channel

  notificationMessage is a string of the following format for each trigger action:

  tagged: "{User’s handle} tagged you in {channel/DM name}: {first 20 characters of the message}"

  reacted message: "{User’s handle} reacted to your message in {channel/DM name}"

  added to a channel/DM: "{User’s handle} added you to {channel/DM name}"
 */
function notificationsGet(token: string): Notifications {
  const notifications: Notification[] = [];

  return { notifications: notifications };
}

export { clearV1, notificationsGet };
