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

/** /channel/* Test Functions **/

export function testChannelInvite(token: string, channelId: number, uid: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: {
        token,
        channelId,
        uid
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

/** /channels/* Test Functions **/

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

/** /other/* Test Functions **/

export function testClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    { qs: {} }
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
    `${url}:${port}/user/all/v1`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function testSetName(token: string, namFisrt: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v1`,
    {
      json: {
        token,
        namFisrt,
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
