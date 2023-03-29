/**
 * users.ts
 *
 * Contains the function implementation of all users* functions.
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

function userProfileV1(token: string, uId: number) : Error | User {
  const data = getData();

  if (!isValidToken(token)) {
    return { error: 'Invalid token (token not exist)' };
  }

  if (uId >= data.users.length || uId < 0) {
    return { error: 'Invalid user (uId not exist)' };
  }

  const user = data.users[uId];
  const userProfile = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.userHandle
  };

  return { user: userProfile };
}

function isValidToken(token: string): boolean {
  const users = getData().users;
  for (const user of users) {
    if (user.tokens.includes(token)) {
      return true;
    }
  }
  return false;
}

export { userProfileV1 };
