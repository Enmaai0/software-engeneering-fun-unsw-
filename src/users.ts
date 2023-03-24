/**
 * users.js
 *
 * Contains the stub code functions of all users* functions.
 */

import { getData } from './dataStore';

interface Error {
  error: string
}

interface UserProfile {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string
}

interface User {
  user: UserProfile
}

function userProfileV1(authUserId: number, uId: number) : Error | User {
  const data = getData();

  if (authUserId >= data.users.length || authUserId < 0) {
    return { error: 'Invalid user (authUserId not exist)' };
  }

  if (uId >= data.users.length || authUserId < 0) {
    return { error: 'Invalid user (uId not exist)' };
  }

  const userProfile = {
    uId: data.users[uId].uId,
    email: data.users[uId].email,
    nameFirst: data.users[uId].nameFirst,
    nameLast: data.users[uId].nameLast,
    handleStr: data.users[uId].userHandle
  };

  return { user: userProfile };
}

export { userProfileV1 };
