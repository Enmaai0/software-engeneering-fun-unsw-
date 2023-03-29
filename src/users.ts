/**
 * users.ts
 *
 * Contains the function implementation of all users* functions.
 */

import { getData, setData } from './dataStore';
import validator from 'validator';

const MINNAMELENGTH = 1;
const MAXNAMELENGTH = 50;
const MINHANDLELENGTH = 3;
const MAXHANDLELENGTH = 3;

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

interface UserArray {
  users: UserProfile[]
}

/**
 * userProfileV1
 *
 * Given a token and uId, return the profile of user
 *
 * @param { string } token
 * @param { number } uId
 * @return { User }
 */
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

/**
 * usersAll
 *
 * Given a token and uId, return the profile of user
 *
 * @param { string } token
 * @param { number } uId
 * @return { User }
 */
function usersAllV1(token: string) : Error | UserArray {
  if (!isValidToken(token)) {
    return { error: 'Invalid token (token not exist)' };
  }

  const data = getData();
  const users = data.users;
  const returnArray = [];
  for (const user of users) {
    const userProfile = {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.userHandle
    };
    returnArray.push(userProfile);
  }

  return { users: returnArray };
}

function userSetNameV1(token: string, nameFirst: string, nameLast: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token (Enter a Valid Token)' };
  }

  if (nameFirst.length < MINNAMELENGTH || nameLast.length < MINNAMELENGTH) {
    return { error: 'Invalid Name (Name Cannot be Empty)' };
  }

  if (nameFirst.length > MAXNAMELENGTH || nameLast.length > MAXNAMELENGTH) {
    return { error: 'Invalid Name (Maximum 50 Characters)' };
  }

  const data = getData();
  data.users[findUId(token)].nameFirst = nameFirst;
  data.users[findUId(token)].nameLast = nameLast;

  setData(data);

  return {};
}

function userSetEmailV1(token: string, email: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token (Enter a Valid Token)' };
  }

  if (!validator.isEmail(email)) {
    return { error: 'Invalid Email (Enter a Valid Email)' };
  }

  if (isRegisteredEmail(email)) {
    return { error: 'Invalid Email (Email Already in Use)' };
  }

  const data = getData();
  data.users[findUId(token)].email = email;
  setData(data);

  return {};
}

function userSetHandleV1(token: string, handle: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    return { error: 'Invalid Token (Enter a Valid Token)' };
  }

  if (isUserHandleTaken(handle)) {
    return { error: 'Invalid Handle (Handle Already Taken)' };
  }

  if (handle.length < MINHANDLELENGTH) {
    return { error: 'Invalid Handle (Minimum 3 Characters)' };
  }

  if (handle.length > MAXHANDLELENGTH) {
    return { error: 'Invalid Handle (Maximum 20 Characters)' };
  }

  const data = getData();
  data.users[findUId(token)].userHandle = handle;
  setData(data);

  return {};
}

/**
 * isValidToken
 *
 * Given a token returns whether the token exists
 * within the dataStore or not.
 *
 * @param {string} token
 * @returns {boolean}
 */
function isValidToken(token: string): boolean {
  const users = getData().users;
  for (const user of users) {
    if (user.tokens.includes(token)) {
      return true;
    }
  }
  return false;
}

/**
 * isRegisteredEmail
 *
 * Takes in an email and returns true or false
 * depending on whether the email is already
 * contained within dataStore under a user.
 *
 * @param {string} email
 * @return { boolean }
 */
function isRegisteredEmail(email: string): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

/**
 * isUserHandleTaken
 *
 * Takes in an string (userHandle) and scans
 * through the entire data base of users to
 * find if the userHandle already exists.
 *
 * @param {string} userHandle
 * @return { boolean }
 */
function isUserHandleTaken(userHandle: string): boolean {
  const data = getData();

  for (const user of data.users) {
    if (user.userHandle === userHandle) {
      return true;
    }
  }
  return false;
}

/**
 * Given a token, find the corresponding uId
 *
 * @param token
 * @returns {number} uId
 */
function findUId(token: string): number {
  const users = getData().users;
  let id;

  for (const user of users) {
    for (const theToken of user.tokens) {
      if (theToken === token) {
        id = user.uId;
      }
    }
  }
  return id;
}

export { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 };
