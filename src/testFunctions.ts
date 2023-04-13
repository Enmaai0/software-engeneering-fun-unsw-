/**
 * testFunctions.ts
 *
 * This file contains all of the functions used to test
 * the HTTP routes for each interface for the project.
 *
 * Used to prevent the importation of other test functions
 * causing the entire test file to run again (see below).
 *
 * E.g Calling a function from auth.test.ts to use in dm.test.ts
 * causes all of the tests in auth.test.ts to run again when it is
 * not required.
 */

import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

/**
 * Main Request Function
 *
 * Used to prevent repititon of all of the different testing
 * helper functions.
 *
 * Modified version of original function from
 * COMP1531 23T1 Quiz 8 Quiz
*/
function requestHelper(method: HttpVerb, path: string, token: string, payload: object) {
  let qs = {};
  let json = {};

  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // POST / PUT Routes
    json = payload;
  }

  const res = request(method, `${url}:${port}` + path, { headers: { token }, qs, json });

  return JSON.parse(res.getBody() as string);
}

/** /admin/* Test Functions **/

export function testAdminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', token, { uId });
}

export function testAdminUserPermissionChange(token: string, uId: number, permissionId: number) {
  return requestHelper('POST', '/admin/userpermission/change/v1', token, { uId, permissionId });
}

/** /auth/* Test Functions **/

export function testAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', '', { email, password });
}

export function testAuthLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v2', token, {});
}

export function testAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', '', { email, password, nameFirst, nameLast });
}

export function testAuthPasswordResetRequest(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', '', { email });
}

export function testAuthPasswordResetReset(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', '', { resetCode, newPassword });
}

/** /channel/* Test Functions **/

export function testChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', token, { channelId, uId });
}

export function testChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', token, { channelId });
}

export function testChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', token, { channelId, start });
}

export function testChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', token, { channelId });
}

export function testChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', token, { channelId });
}

export function testChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', token, { channelId, uId });
}

export function testChannelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', token, { channelId, uId });
}

/** /channels/* Test Functions **/

export function testChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', token, { name, isPublic });
}

export function testChannelsList(token: string) {
  return requestHelper('GET', '/channels/list/v3', token, {});
}

export function testChannelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v3', token, {});
}

/** /dm/* Test Functions **/

export function testDmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', token, { uIds });
}

export function testDmList(token: string) {
  return requestHelper('GET', '/dm/list/v2', token, {});
}

export function testDmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', token, { dmId });
}

export function testDmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', token, { dmId });
}

export function testDmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', token, { dmId });
}

export function testDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', token, { dmId, start });
}

/** /message/* Test Functions */

export function testMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', token, { channelId, message });
}

export function testMessageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', token, { messageId, message });
}

export function testMessageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', token, { messageId });
}

export function testMessageSendDm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', token, { dmId, message });
}

export const testMessageReact = (token: string, messageId: number, reactId: number) => {
  return requestHelper('POST', '/message/react/v1', token, { messageId, reactId });
};

export const testMessageUnreact = (token: string, messageId: number, reactId: number) => {
  return requestHelper('POST', '/message/unreact/v1', token, { messageId, reactId });
};

export const testMessageShare = (token: string, ogMessageId: number, message: string, channelId: number, dmId: number) => {
  return requestHelper('POST', '/message/share/v1', token, { ogMessageId, message, channelId, dmId });
};

export const testMessageUnpin = (token: string, messageId: number) => {
  return requestHelper('POST', '/message/unpin/v1', token, { messageId });
};

export const testMessagePin = (token: string, messageId: number) => {
  return requestHelper('POST', '/message/pin/v1', token, { messageId });
};

export const testMessageSendLater = (token: string, channelId: number, message: string, timeSent: number) => {
  return requestHelper('POST', '/message/sendlater/v1', token, { channelId, message, timeSent });
};

export const testMessageSendLaterDm = (token: string, dmId: number, message: string, timeSent: number) => {
  return requestHelper('POST', '/message/sendlaterdm/v1', token, { dmId, message, timeSent });
};

/** /users/* Test Functions **/

export function testUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', token, { uId });
}

export function testUsersAll(token: string) {
  return requestHelper('GET', '/users/all/v2', token, {});
}

export function testSetName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', token, { nameFirst, nameLast });
}

export function testSetEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', token, { email });
}

export function testSetHandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', token, { handleStr });
}

/** /other/* Test Functions **/

export function testClear() {
  return requestHelper('DELETE', '/clear/v1', '', {});
}

export function testNotificationsGet(token: string) {
  return requestHelper('GET', '/notifications/get/v1', token, {});
}
