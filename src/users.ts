/**
 * users.ts
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

function userProfileV1(token: string, uId: number) : Error | User {
  const data = getData();

  if (!isValidToken(token)) {
    return { error: 'Invalid token (token not exist)' };
  }

  if (uId >= data.users.length || uId < 0) {
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

function isValidToken(token: string): boolean {
  let users = getData().users;
  for (const object of users) {
    for (const the_token of object.tokens) {
      if (the_token === token) {
        return true;
      }
    }
  }
  return false;
}

export { userProfileV1 };
