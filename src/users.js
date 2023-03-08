/**
 * users.js
 * 
 * Contains the stub code functions of all users* functions.
 */

import { getData } from "./dataStore"

function userProfileV1(authUserId, uId) {

  const data = getData();

  if (authUserId >= data.users.length) {
    return { error: "Invalid user (authUserId not exist)" };
  }

  if (uId >= data.users.length) {
    return { error: "Invalid user (uId not exist)" };
  }

  let userProfile = data.users[uId];

  return {
    user: userProfile
  };
}

export { userProfileV1 } from "./users.js"