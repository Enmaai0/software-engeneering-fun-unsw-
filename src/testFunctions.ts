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

import request from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

/** /admin/* Test Functions **/

export function testAdminUserRemove(token: string, uId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/admin/user/remove/v1`,
    {
      headers: {
        token: token,
      },
      qs: {
        uId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testAdminUserPermissionChange(token: string, uId: number, permissionId: number) {
  const res = request(
    'POST',
    `${url}:${port}/admin/userpermission/change/v1`,
    {
      headers: {
        token: token,
      },
      json: {
        token,
        uId,
        permissionId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /auth/* Test Functions **/

export function testAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v2`,
    {
      json: {
        email,
        password
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v1`,
    {
      json: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testAuthPasswordResetRequest(email: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      json: {
        email
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testAuthPasswordResetReset(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/reset/v1`,
    {
      json: {
        resetCode,
        newPassword
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /channel/* Test Functions **/

export function testChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: {
        token,
        channelId,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v2`,
    {
      json: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v2`,
    {
      qs: {
        token,
        channelId,
        start
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v2`,
    {
      qs: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelLeave(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/leave/v1`,
    {
      json: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelAddOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/addowner/v1`,
    {
      json: {
        token,
        channelId,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelRemoveOwner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/removeowner/v1`,
    {
      json: {
        token,
        channelId,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /channels/* Test Functions **/

export function testChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v2`,
    {
      json: {
        token,
        name,
        isPublic
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelsList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/list/v2`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testChannelsListAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v2`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /dm/* Test Functions **/

export function testDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      json: {
        token,
        uIds
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testDmList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/dm/list/v1`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v1`,
    {
      qs: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v1`,
    {
      qs: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v1`,
    {
      json: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v1`,
    {
      qs: {
        token,
        dmId,
        start
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /message/* Test Functions */

export function testMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/send/v1`,
    {
      json: {
        token: token,
        channelId: channelId,
        message: message
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    `${url}:${port}/message/edit/v1`,
    {
      json: {
        token: token,
        messageId: messageId,
        message: message
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/message/remove/v1`,
    {
      qs: {
        token: token,
        messageId: messageId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testMessageSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v1`,
    {
      json: {
        token: token,
        dmId: dmId,
        message: message,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /users/* Test Functions **/

export function testUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v2`,
    {
      qs: {
        token,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testUsersAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v1`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v1`,
    {
      json: {
        token,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testSetEmail(token: string, email: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setemail/v1`,
    {
      json: {
        token,
        email
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testSetHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/sethandle/v1`,
    {
      json: {
        token,
        handleStr
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/** /other/* Test Functions **/

export function testClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    { qs: {} }
  );
  return JSON.parse(res.getBody() as string);
}

export function testNotificationsGet(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/notifications/get/v1`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}
