/**
 * auth.ts
 *
 * Contains the functions of all auth* functions.
 */

import validator from 'validator';
import HTTPError from 'http-errors';
import { getData, setData, getHashOf } from './dataStore';

const nodemailer = require('nodemailer');

interface AuthReturn {
  token: string;
  authUserId: number;
}

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
  resetCodes: string[],
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
 * A hashed token is stored in the dataStore with the original
 * token being returned to the user.
 *
 * @param { string } email
 * @param { string } password
 * @return {{ authUserId: number }}
 */
function authLoginV1(email: string, password: string): AuthReturn {
  if (!isRegisteredEmail(email)) {
    throw HTTPError(400, 'Invalid Email (No existing user with that email)');
  }

  const data = getData();
  const userIndex = emailToUserIndex(email);
  password = getHashOf(password);

  if (data.users[userIndex].password === password) {
    const newToken = generateToken();
    data.users[userIndex].tokens.push(getHashOf(newToken));
    return {
      token: newToken,
      authUserId: userIndex
    };
  }

  setData(data);

  throw HTTPError(400, 'Incorrect Password');
}

/**
 * authLogoutV1
 *
 * Given an active token, invalidates the token to log
 * the user out.
 *
 * @param { string } token
 * @returns {{ }}
 */
function authLogoutV1(token: string): Record<string, never> {
  const data = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid Token');
  }

  const hashedToken = getHashOf(token);

  for (const user of data.users) {
    for (const userToken of user.tokens) {
      if (userToken === hashedToken) {
        const index = user.tokens.indexOf(hashedToken);
        user.tokens.splice(index, 1);
        break;
      }
    }
  }

  setData(data);

  return {};
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
 * @param { string } email
 * @param { string } password
 * @param { string } nameFirst
 * @param { string } nameLast
 * @return {{ authUserId: number }}
 */
function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): AuthReturn {
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid Email (Enter a Valid Email)');
  }

  if (isRegisteredEmail(email)) {
    throw HTTPError(400, 'Invalid Email (Email Already in Use)');
  }

  if (password.length < MINPASSLENGTh) {
    throw HTTPError(400, 'Invalid Password (Minimum 6 Characters)');
  }

  if (nameFirst.length < MINNAMELENGTH || nameLast.length < MINNAMELENGTH) {
    throw HTTPError(400, 'Invalid Name (Name Cannot be Empty)');
  }

  if (nameFirst.length > MAXNAMELENGTH || nameLast.length > MAXNAMELENGTH) {
    throw HTTPError(400, 'Invalid Name (Maximum 50 Characters)');
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
  const newToken = generateToken();

  const userObject: User = {
    uId: newUserIndex,
    email: email,
    password: getHashOf(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    userHandle: generateUserHandle(nameFirst, nameLast),
    permissionId: permissionId,
    tokens: [getHashOf(newToken)],
    notifications: [],
    resetCodes: []
  };

  data.users.push(userObject);

  setData(data);

  return {
    token: newToken,
    authUserId: newUserIndex
  };
}

/**
 * authPasswordResetRequest
 *
 * Given an email sends an email to that person containing a
 * unique code that can be used to reset their passwords utelising
 * the /auth/passwordreset/reset server call.
 *
 * <<<<<<<
 * FOR TUTOR OR MARKER
 *
 * For the sending of emails it is done through Ethereal Mail, a fake STMP service
 * that NodeMailer (the module used to send emails) uses to allow people to test
 * the sending of emails to addresses. All emails are not actually sent, however
 * the ethereal.mail will 'fake send' all the emails and hold them on their server.
 *
 * You can see these 'fake' emails by going to ethereal.email and logging in using:
 * user: estel.hoeger@ethereal.email
 * pass: 95KuTtSnCNVErXZ4cD
 * Then going to the messages tab where you are able to view all messages that have
 * been sent and received from this address.
 * <<<<<<<
 *
 * @param { string } email
 * @returns { }
 */
function authPasswordResetRequest(email: string): Record<never, never> {
  const resetCode = generateResetCode();
  const data = getData();

  for (const user of data.users) {
    if (email === user.email) {
      user.resetCodes.push(getHashOf(resetCode));
      sendEmail(email, resetCode);
      user.tokens = [];
      break;
    }
  }

  setData(data);

  return {};
}

/**
 * authPasswordResetReset
 *
 * Given a valid reset code and new password, updates the
 * password for the user that received the reset code.
 *
 * @param { string } resetCode
 * @param { string } newPassword
 * @returns { }
 */
function authPasswordResetReset(resetCode: string, newPassword: string): Record<never, never> {
  const data = getData();

  if (newPassword.length < 6) {
    throw HTTPError(400, 'Invalid Password (Must be 6 Characters Long');
  }

  let uId = -1;
  let resetCodeIndex;
  const hashedResetCode = getHashOf(resetCode);

  for (const user of data.users) {
    if (user.resetCodes.includes(hashedResetCode)) {
      uId = user.uId;
      resetCodeIndex = user.resetCodes.indexOf(hashedResetCode);
      break;
    }
  }

  if (resetCodeIndex === -1 || uId === -1) {
    throw HTTPError(400, 'Invalid Reset Code');
  }

  data.users[uId].password = getHashOf(newPassword);
  data.users[uId].resetCodes.splice(resetCodeIndex, 1);

  setData(data);

  return {};
}

export { authLoginV1, authRegisterV1, authLogoutV1, authPasswordResetRequest, authPasswordResetReset };

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
 * emailToUserIndex
 *
 * Given an email, returns the index of the user
 * with that email.
 *
 * Returns 0 on email not being in dataStore
 * (Should not occur due to error check).
 *
 * @param { string } email
 * @return { number }
 */
function emailToUserIndex(email: string): number {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return user.uId;
    }
  }
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
 * generateUserHandle
 *
 * Takes in the users first and last name
 * and creates the unique userHandle as
 * described in the project spec.
 *
 * @param { string } nameFirst
 * @param { string } nameLast
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
 * generateToken
 *
 * Generates a random number (between 0 - 9999999) converted
 * into a string to be used as the users current token.
 *
 * @param { } N.A
 * @returns { string }
 */
function generateToken(): string {
  const numToken = Math.floor(Math.random() * MAXTOKEN);
  const strToken = numToken.toString();
  return strToken;
}

/**
 * generateResetCode
 *
 * When called returns a 20 character long string
 * containing [a-zA-Z0-9] characters.
 *
 * @returns { string }
 */
function generateResetCode(): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  while (result.length < 20) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * sendEmail
 *
 * Given an email address and a resetCode, sends an email to that email address
 * with the message stated below. Giving them the resetCode to reset their password.
 *
 * @param { string } email
 * @param { string } resetCode
 */
async function sendEmail(email: string, resetCode: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'estel.hoeger@ethereal.email', // generated ethereal user
      pass: '95KuTtSnCNVErXZ4cD', // generated ethereal password
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"HO9A_DREAM" <estel.hoeger@ethereal.email>', // sender address
    to: `${email}`, // list of receivers
    subject: 'Password Reset Code', // Subject line
    text: `Hello ${email}, someone (hopefuly you) has requested a password reset on your UNSW Memes account. Please go to this link:
      'I dont know the link LMAO', and enter the code below to reset your password. If this wasnt you then you can safely ignore this email.
      
      Reset Code: ${resetCode}`,
  });
}
