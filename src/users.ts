/**
 * users.ts
 *
 * Contains the stub code functions of all users* functions.
 */

import { getData, getHashOf, setData } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import Jimp from 'jimp';
import config from './config.json';

const port = config.port;
const url = config.url;

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
    throw HTTPError(403, 'Invalid token (token not exist)');
  }

  if (!isUserId(uId)) {
    throw HTTPError(400, 'Invalid user (uId not exist)');
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
    throw HTTPError(403, 'Invalid token (token not exist)');
  }

  const data = getData();
  const users = data.users;

  const returnArray: UserProfile[] = [];

  for (const user of users) {
    const userProfile: UserProfile = {
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
    throw HTTPError(403, 'Invalid token (token not exist)');
  }

  if (nameFirst.length < MINNAMELENGTH || nameLast.length < MINNAMELENGTH) {
    throw HTTPError(400, 'Invalid Name (Name Cannot be Empty)');
  }

  if (nameFirst.length > MAXNAMELENGTH || nameLast.length > MAXNAMELENGTH) {
    throw HTTPError(400, 'Invalid Name (Maximum 50 Characters)');
  }

  const data = getData();
  const uId = getIdFromToken(token);

  data.users[uId].nameFirst = nameFirst;
  data.users[uId].nameLast = nameLast;

  return {};
}

function userSetEmailV1(token: string, email: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid token (token not exist)');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid Email (Enter a Valid Email)');
  }

  if (isRegisteredEmail(email)) {
    throw HTTPError(400, 'Invalid Email (Email Already in Use)');
  }

  const uId = getIdFromToken(token);

  const data = getData();
  data.users[uId].email = email;

  return {};
}

function userSetHandleV1(token: string, handle: string) : Error | Record<string, never> {
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid token (token not exist)');
  }

  if (isUserHandleTaken(handle)) {
    throw HTTPError(400, 'Invalid Handle (Handle Already Taken)');
  }

  if (handle.length < MINHANDLELENGTH) {
    throw HTTPError(400, 'Invalid Handle (Minimum 3 Characters)');
  }

  if (handle.length > MAXHANDLELENGTH) {
    throw HTTPError(400, 'Invalid Handle (Maximum 20 Characters)');
  }

  // Checks if the string has non-alphanumeric characters
  if (!/^[0-9a-z]+$/.test(handle)) {
    throw HTTPError(400, 'Invalid Handle (Must Contain Only Alphanumeric Characters');
  }

  const uId = getIdFromToken(token);

  const data = getData();
  data.users[uId].userHandle = handle;
  setData(data);

  return {};
}

async function userProfileUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {

  if (!isValidToken(token)) {
    throw HTTPError(403, "Invalid Token");
  }

  if (imgUrl.substring(imgUrl.length - 3) !== 'jpg' && imgUrl.substring(imgUrl.length - 3) !== 'jpeg') {
    throw HTTPError(400, "Invalid image URL");
  }

  const res = request(
    'GET',
    imgUrl
  );

  if (res.statusCode !== 200) {
    throw HTTPError(400, "Invalid image URL");
  }

  const image = await Jimp.read(imgUrl);
  const { width, height } = image.bitmap;

  if (xStart < 0 || xEnd > width || yStart < 0 || yEnd > height) {
    throw HTTPError(400, 'The provided coordinates are not within the dimensions of the image.');
  }

  if (xStart >= xEnd || yStart >= yEnd) {
    throw HTTPError(400, 'The provided coordinates are not valid');
  }

  const croppedImage = await image.crop(xStart, yStart, xEnd - xStart, yEnd - yStart);
  const ImageDta = await croppedImage.getBufferAsync(Jimp.MIME_JPEG);
  fs.writeFileSync(`static/${token}.jpg`, ImageDta, {flag: 'w'});

  return {};
}

export { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1, userProfileUploadPhoto };

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
