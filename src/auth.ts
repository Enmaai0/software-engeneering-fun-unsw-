/**
 * auth.js
 *
 * Contains the functions of all auth* functions.
 */

import { getData, setData } from './dataStore';
import validator from 'validator';

interface Error {
  error: string;
}

interface AuthReturn {
  token: string;
  authUserId: number;
}

const MAXTOKEN = 10000000;
const MINPASSLENGTh = 6;
const MINNAMELENGTH = 1;
const MAXNAMELENGTH = 50;
const GLOBALOWNER = 1;
const GLOBALMEMBER = 2;

/**
 * authLoginV1
 *
 * Takes in an email and password, if the email and password
 * both match the same user, the user 'logs in' and the
 * function returns the authUserId of the associated user.
 *
 * Errors return { error: "error" } on incorrect or
 * invalid input.
 *
 * @param {string} email
 * @param {string} password
 * @return {{ authUserId: number }}
 */
function authLoginV1(email: string, password: string): Error | AuthReturn {
  if (!isRegisteredEmail(email)) {
    return { error: 'Invalid Email (No existing user with that email)' };
  }

  const data = getData();
  const userIndex = emailToUserIndex(email);

  if (data.users[userIndex].password === password) {
    const newToken = generateToken();
    data.users[userIndex].tokens.push(newToken);
    return {
      token: newToken,
      authUserId: userIndex
    };
  }

  return { error: 'Incorrect Password' };
}

/**
 * authLogoutV1
 *
 * Given an active token, invalidates the token to log
 * the user out.
 *
 * @param {string} token
 * @returns {}
 */
function authLogoutV1(token: string): Record<string, never> | Error {
  const data = getData();

  if (!isValidToken(token)) {
    return { error: 'Invalid Token' };
  }

  for (const user of data.users) {
    for (const userToken of user.tokens) {
      if (userToken === token) {
        const index = user.tokens.indexOf(token);
        user.tokens.splice(index, 1);
        break;
      }
    }
  }

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
 * authRegisterV1
 *
 * Takes in an email, password, first-name and last-name
 * and creates a user profile if all inputs are valid.
 * Creates an object to be stored into the dataStore
 * that contains the given information as well as an
 * authUserId, userHandle and the users current active tokens.
 *
 * Errors return { error: "error" } on incorrect or
 * invalid input.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @return {{ authUserId: number }}
 */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): Error | AuthReturn {
  if (!validator.isEmail(email)) {
    return { error: 'Invalid Email (Enter a Valid Email)' };
  }

  if (isRegisteredEmail(email)) {
    return { error: 'Invalid Email (Email Already in Use)' };
  }

  if (password.length < MINPASSLENGTh) {
    return { error: 'Invalid Password (Minimum 6 Characters)' };
  }

  if (nameFirst.length < MINNAMELENGTH || nameLast.length < MINNAMELENGTH) {
    return { error: 'Invalid Name (Name Cannot be Empty)' };
  }

  if (nameFirst.length > MAXNAMELENGTH || nameLast.length > MAXNAMELENGTH) {
    return { error: 'Invalid Name (Maximum 50 Characters)' };
  }

  const data = getData();

  // permissionId refers to the global permissions of
  // the users within teams (1 = Owner, 2 = Member).
  let permissionId;
  if (data.users.length === 0) {
    permissionId = GLOBALOWNER;
  } else {
    permissionId = GLOBALMEMBER;
  }

  const newUserIndex = data.users.length;
  const userObject = {
    uId: newUserIndex,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    userHandle: generateUserHandle(nameFirst, nameLast),
    permissionId: permissionId,
    tokens: [generateToken()],
  };

  data.users.push(userObject);
  setData(data);

  return {
    token: userObject.tokens[0],
    authUserId: newUserIndex
  };
}

/**
 * emailToUserIndex
 *
 * Given an email, returns the index of the user
 * with that email.
 *
 * Returns 0 on email not being in dataStore
 * (Should not occur due to error check).
 *
 * @param {string} email
 * @return { number }
 */
function emailToUserIndex(email: string): number {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return user.uId;
    }
  }
  return 0;
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
 * generateUserHandle
 *
 * Takes in the users first and last name
 * and creates the unique userHandle as
 * described in the project spec.
 *
 * @param {string} nameFirst
 * @param {string} nameLast
 * @return { string }
 */
function generateUserHandle(nameFirst: string, nameLast: string): string {
  let string = nameFirst.toLowerCase().concat(nameLast.toLowerCase());

  // Removes all non alphanumeric characters from the string
  string = string.replace(/\W/g, '');

  if (string.length > 20) {
    string = string.slice(0, 20);
  }

  const originalStringLength = string.length;

  // While the userHandle is already taken, increments the concatNum
  // to add to the end until a unique string is generated.
  let concatNum = 0;
  while (isUserHandleTaken(string)) {
    string = string.slice(0, originalStringLength);
    string = string.concat(concatNum.toString());
    concatNum++;
  }
  return string;
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
 * generateToken
 *
 * Generates a random number (between 0 - 9999999) converted
 * into a string to be used as the users current token.
 *
 * @param {} N.A
 * @returns { string }
 */
function generateToken(): string {
  const numToken = Math.floor(Math.random() * MAXTOKEN);
  const strToken = numToken.toString();
  return strToken;
}

export { authLoginV1, authRegisterV1, authLogoutV1 };
