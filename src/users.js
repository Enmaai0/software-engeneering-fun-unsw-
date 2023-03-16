/**
 * users.js
 * 
 * Contains the stub code functions of all users* functions.
 */

import { getData } from './dataStore'

function userProfileV1(authUserId, uId) {

  const data = getData();

  if (authUserId >= data.users.length || authUserId < 0) {
    return { error: "Invalid user (authUserId not exist)" };
  }

  if (uId >= data.users.length || authUserId < 0) {
    return { error: "Invalid user (uId not exist)" };
  }

  let userProfile = {
    uId: data.users[uId].uId,
    email: data.users[uId].email,
    nameFirst: data.users[uId].nameFirst,
    nameLast: data.users[uId].nameLast,
    handleStr: data.users[uId].userHandle
  }

  return { user: userProfile };
}

export { userProfileV1 }