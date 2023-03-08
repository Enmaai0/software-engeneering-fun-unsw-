/**
 * auth.js
 * 
 * Contains the  functions of all auth* functions.
 */

import { getData, setData } from './dataStore.js'
import validator from 'validator'

/**
 * authLoginV1
 * 
 * Takes in an email and password, if the email and password
 * both match the same user, the user 'logs in' and the 
 * function returns the authUserId of the associated user
 * 
 * Errors return { error: "error" } on incorrect or
 * invalid input.
 * 
 * @param {string} email
 * @param {string} password
 * @return {{ authUserId: number }}
 */
function authLoginV1(email, password) {
  if (!isRegisteredEmail(email)) {
    return { error: "Invalid Email (No existing user with that email)" }
  };

  let data = getData();
  let userIndex = emailToUserIndex(email);

  if (data.users[userIndex].password === password) {
    return { authUserId: userIndex }
  }

  return { error: "Incorrect Password" }
}

/**
 * emailToUserIndex
 * 
 * Given an email, returns the index of the user
 * with that email.
 * 
 * Returns 0 on email not being in dataStore
 * (Should not occur due to error check)
 * 
 * @param {string} email
 * @return { number }
 */
function emailToUserIndex(email) {
  let data = getData();

  for (const users of data.users) {
    if (user.email === email) {
      return user.authUserId;
    }
  }

  return 0;
}

/**
 * authRegisterV1
 * 
 * Takes in an email, password, first-name and last-name
 * and creates a user profile if all inputs are valid. 
 * Creates an object to be stored into the dataStore
 * that contains the given information as well as an
 * authUserId and userHandle.
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
function authRegisterV1(email, password, nameFirst, nameLast) {
  if (!validator.isEmail(email)) {
    return { error: "Invalid Email (Enter a Valid Email)" }
  };

  if (isRegisteredEmail(email)) {
    return { error: "Invalid Email (Email Already in Use)" }
  };

<<<<<<< HEAD
  if (password.length) {
    return { error: "Invalid Password (Minimum 6 Characters)" }
=======
  if (password.length < 6) {
    return { error: "Invalid Password (Minimum 6 Characters)"}
>>>>>>> 7dda40778010fb5844eac5900be99648fe85c854
  };

  if (nameFirst.length < 1 || nameLast.length < 1) {
    return { error: "Invalid Name (Name Cannot be Empty)" }
  };

  if (nameFirst.length > 50 || nameLast.length > 50) {
    return { error: "Invalid Name (Maximum 50 Characters)" }
  };

  const data = getData();

  // permissionId refers to the global permissions of
  // the users within teams
  // 1 = Owner, 2 = Member
  let permissionId
  if (data.users.length === 0) {
    permissionId = 1;
  } else {
    permissionId = 2
  }

  // Sets the first empty array index to an object
  // containing all information about the user.
  data.users[data.users.length] = {
    uId: data.users.length,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    userHandle: generateUserHandle(nameFirst, nameLast),
    permissionId: permissionId,
  };

  setData(data);

  return {
    authUserId: data.users.length
  };
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
function isRegisteredEmail(email) {
  for (const user of getData().users) {
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
function generateUserHandle(nameFirst, nameLast) {
  let string = nameFirst.toLowerCase().concat(nameLast.toLowerCase());

  // Removes all non alphanumeric characters from the string
  string = string.replace(/\W/g, "");

  if (string.length > 20) {
    string = string.slice(0, 19);
  }

  let originalStringLength = string.length;

  // While the userHandle is already taken, increments the concatNum
  // to add to the end until a unique string is generated
  // originalStringLength - 1 is used as indexes begins at 0, otherwise
  // would be character too long.
  let concatNum = 0;
  while (isUserHandleTaken(string)) { 
    string = string.slice(0, originalStringLength - 1);
    string = string.concat(concatNum);
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
function isUserHandleTaken(userHandle) {
  for (const user of getData().users) {
    if (user.userHandle === userHandle) {
      return true;
    }
  }
  return false;
}

<<<<<<< HEAD
export { authLoginV1, authRegisterV1}
=======
export { authLoginV1, authRegisterV1 }
>>>>>>> 7dda40778010fb5844eac5900be99648fe85c854
