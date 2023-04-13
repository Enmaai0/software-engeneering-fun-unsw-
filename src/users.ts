/**
 * users.ts
 *
 * Contains the function implementation of all users* functions.
 */

import { getData, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';

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

const MINNAMELENGTH = 1;
const MAXNAMELENGTH = 50;
const MINHANDLELENGTH = 3;
const MAXHANDLELENGTH = 20;

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
    throw HTTPError( 403, 'Invalid token (token not exist)' );
  }

  if (!isUserId(uId)) {
    throw HTTPError( 400, 'Invalid user (uId not exist)' );
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
    throw HTTPError( 403, 'Invalid token (token not exist)' );
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

    if (user.nameFirst !== 'Removed' && user.nameFirst !== 'user') {
      returnArray.push(userProfile);
    }
  }

  return { users: returnArray };
}

function userSetNameV1(token: string, nameFirst: string, nameLast: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError( 403, 'Invalid token (token not exist)' );
  }

  if (nameFirst.length < MINNAMELENGTH || nameLast.length < MINNAMELENGTH) {
    throw HTTPError( 400, 'Invalid Name (Name Cannot be Empty)' );
  }

  if (nameFirst.length > MAXNAMELENGTH || nameLast.length > MAXNAMELENGTH) {
    throw HTTPError( 400, 'Invalid Name (Maximum 50 Characters)' );
  }

  const data = getData();
  const uId = findUId(token);

  data.users[uId].nameFirst = nameFirst;
  data.users[uId].nameLast = nameLast;

  return {};
}

function userSetEmailV1(token: string, email: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError( 403, 'Invalid token (token not exist)' );
  }

  if (!validator.isEmail(email)) {
    throw HTTPError( 400, 'Invalid Email (Enter a Valid Email)' );
  }

  if (isRegisteredEmail(email)) {
    throw HTTPError( 400, 'Invalid Email (Email Already in Use)' );
  }

  const uId = findUId(token);

  const data = getData();
  data.users[uId].email = email;

  return {};
}

function userSetHandleV1(token: string, handle: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError( 403, 'Invalid token (token not exist)' );
  }

  if (isUserHandleTaken(handle)) {
    throw HTTPError( 400, 'Invalid Handle (Handle Already Taken)' );
  }

  if (handle.length < MINHANDLELENGTH) {
    throw HTTPError( 400, 'Invalid Handle (Minimum 3 Characters)' );
  }

  if (handle.length > MAXHANDLELENGTH) {
    throw HTTPError( 400, 'Invalid Handle (Maximum 20 Characters)' );
  }

  // Checks if the string has non-alphanumeric characters
  if (!/^[0-9a-z]+$/.test(handle)) {
    throw HTTPError( 400, 'Invalid Handle (Must Contain Only Alphanumeric Characters' );
  }

  const uId = findUId(token);

  const data = getData();
  data.users[uId].userHandle = handle;
  setData(data);

  return {};
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
 * isRegisteredEmail
 *
 * Takes in an email and returns true or false
 * depending on whether the email is already
 * contained within dataStore under a user.
 *
 * @param { string } email
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
 * @param { string } userHandle
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
 * findUId
 *
 * Given a token, find the corresponding uId
 *
 * @param { string } token
 * @returns { number }
 */
function findUId(token: string): number {
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
 * Given a authUserId, checks if the authUserId
 * is valid (exists in the dataStore)
 *
 * @param { number } uId
 * @return { boolean }
 */
function isUserId(uId: number): boolean {
  const data = getData();
  const users = data.users;

  if (users.some(user => user.uId === uId)) {
    return true;
  }

  return false;
}

export { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 };
