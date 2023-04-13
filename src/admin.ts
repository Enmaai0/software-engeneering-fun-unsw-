/**
 * admin.js
 *
 * Contains the functions of all admin* functions.
 */

import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

const GLOBALMEMBER = 2;
const GLOBALOWNER = 1;

interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}

interface User {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  userHandle: string,
  permissionId: number,
  tokens: string[],
  notifications: Notification[]
  resetCodes: string[]
}

function adminUserRemove(token: string, uId: number): Record<never, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const removerId = getIdFromToken(token);

  if (!isGlobalOwner(removerId)) {
    throw HTTPError(403, 'User is not a Global Owner');
  }

  if (!isUserId(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (isOnlyGlobalMember(uId)) {
    throw HTTPError(400, 'User is the only Global Owner');
  }

  deleteUserFromChannels(uId);
  deleteUserFromDms(uId);
  deleteUserMessages(uId);

  const data = getData();

  const deletedUser: User = {
    uId: uId,
    email: `Archived: ${data.users[uId].email}`,
    password: data.users[uId].password,
    nameFirst: 'Removed',
    nameLast: 'user',
    userHandle: `Archived: ${data.users[uId].userHandle}`,
    permissionId: 1,
    tokens: [],
    notifications: [],
    resetCodes: []
  };

  data.users[uId] = deletedUser;

  return {};
}

function adminUserPermissionChange(token: string, uId: number, permissionId: number): Record<never, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const removerId = getIdFromToken(token);

  if (!isGlobalOwner(removerId)) {
    throw HTTPError(403, 'User is not a Global Owner');
  }

  if (!isUserId(uId)) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  if (isOnlyGlobalMember(uId) && permissionId === GLOBALMEMBER) {
    throw HTTPError(400, 'User is the only Global Owner');
  }

  if (permissionId !== GLOBALMEMBER && permissionId !== GLOBALOWNER) {
    throw HTTPError(400, 'Invalid PermissionId');
  }

  if (isGlobalOwner(uId) && permissionId === GLOBALOWNER) {
    throw HTTPError(403, 'User already a Global Owner');
  }

  if (!isGlobalOwner(uId) && permissionId === GLOBALMEMBER) {
    throw HTTPError(403, 'User already a Global Member');
  }

  const data = getData();
  data.users[uId].permissionId = permissionId;

  setData(data);

  return {};
}

export { adminUserRemove, adminUserPermissionChange };

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

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
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

  for (const user of data.users) {
    const userTokenArray = user.tokens;
    if (userTokenArray.includes(token)) {
      return user.uId;
    }
  }
}

/**
 * isUserId
 *
 * Given a uId checks if that uId exists
 *
 * @param { number } id
 * @returns { boolean }
 */
function isUserId(id: number): boolean {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === id) {
      return true;
    }
  }
  return false;
}

/**
 * isGlobalOwner
 *
 * Given a users uId, returns whether they are
 * a global owner
 *
 * @param { number } uId
 * @returns { boolean }
 */
function isGlobalOwner(uId: number): boolean {
  const data = getData();

  if (data.users[uId].permissionId === GLOBALOWNER) {
    return true;
  }

  return false;
}

/**
 * isOnlyGlobalMember
 *
 * Given a users uId, determined whether they are the
 * only global member in the database.
 *
 * @param { number } uId
 * @returns { boolean }
 */
function isOnlyGlobalMember(uId: number): boolean {
  const data = getData();

  let ownerCounter = 0;
  for (const user of data.users) {
    if (user.permissionId === GLOBALOWNER && user.uId !== uId) {
      ownerCounter++;
    }
  }

  if (ownerCounter === 0) {
    return true;
  }

  return false;
}

/**
 * deleteUserFromChannels
 *
 * Given a users uId, removes that user from all channels
 * they are a member and/or owner of.
 *
 * @param { number } uId
 */
function deleteUserFromChannels(uId: number) {
  const data = getData();

  for (const channel of data.channels) {
    for (const user of channel.allMembers) {
      if (user.uId === uId) {
        const index = channel.allMembers.indexOf(user);
        channel.allMembers.splice(index, 1);
      }
    }

    for (const owner of channel.owners) {
      if (owner.uId === uId) {
        const index = channel.owners.indexOf(owner);
        channel.owners.splice(index, 1);
      }
    }
  }

  setData(data);
}

/**
 * deleteUserFromDms
 *
 * Given a users uId, removes that user from all dms
 * they are a member and/or owner of.
 *
 * @param { number } uId
 */
function deleteUserFromDms(uId: number) {
  const data = getData();

  for (const dm of data.dms) {
    if (dm.members.includes(uId)) {
      const index = dm.members.indexOf(uId);
      dm.members.splice(index, 1);
    }
  }

  setData(data);
}

/**
 * deleteUserMessages
 *
 * Given a users uId, changes all of the messages that user
 * has send into both channels and dms into those by a
 * removed user.
 *
 * @param { number } uId
 */
function deleteUserMessages(uId: number) {
  const data = getData();

  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  setData(data);
}
