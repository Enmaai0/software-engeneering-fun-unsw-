/**
 * auth.test.ts
 * Contains the jest testing designed for auth.ts that utelises
 * the HTTP routes created to test functionality
 */

import request from 'sync-request';
import config from './config.json';
import { getData } from './dataStore';
import { testClear } from './other.test';

const OK = 200;
const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };

interface AuthUserId {
  authUserId: number;
}

beforeEach(() => {
  testClear();
});

/** /auth/login/v2 Testing **/

/** /auth/register/v2 Testing **/

function testAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
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
  expect(res.statusCode).toBe(OK);
  return JSON.parse(res.getBody() as string);
}

describe('/auth/register: Error Testing', () => {
  test('Email: Invalid Email', () => {
    expect(testAuthRegister('invalidEmail', 'pass1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Email: Email Already in Use', () => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Password: Too Short (Empty Password)', () => {
    expect(testAuthRegister('email@gmail.com', '', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Password: Too Short (Non Empty Password)', () => {
    expect(testAuthRegister('email@gmail.com', 'Pass', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('First Name: Empty', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', '', 'Bot')).toStrictEqual(ERROR);
  });

  test('Last Name: Empty', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', '')).toStrictEqual(ERROR);
  });

  test('First Name: Too Long', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toStrictEqual(ERROR);
  });

  test('Last Name: Too Long', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toStrictEqual(ERROR);
  });
});

describe('/auth/register: Return Testing', () => {
  describe('authUserId Testing', () => {
    let user1: AuthUserId, user2: AuthUserId;
    beforeEach(() => {
      user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
      user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    });

    test('Correct Return: First User', () => {
      expect(user1).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Correct Return: Second User', () => {
      expect(user2).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Correct Return: Check Unique authUserId', () => {
      expect(user1).not.toMatchObject(user2);
    });
  });

  describe('Short userHandle Testing', () => {
    let user1: AuthUserId, user2: AuthUserId, user3: AuthUserId;
    beforeEach(() => {
      user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot');
      user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
      user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    });

    test('Correct Return: First User Short Name no Concat', () => {
      expect(grabUserHandle(user1.authUserId)).toStrictEqual({ userHandle: 'testbot' });
    });

    test('Correct Return: Second User Short Name with Concat', () => {
      expect(grabPermissionId(user2.authUserId)).toStrictEqual({ permissionId: 'testbot0' });
    });

    test('Correct Return: Second User Short Name with Concat', () => {
      expect(grabPermissionId(user3.authUserId)).toStrictEqual({ permissionId: 'testbot1' });
    });
  });

  describe('Long userHandle Testing', () => {
    let user1: AuthUserId, user2: AuthUserId, user3: AuthUserId;
    beforeEach(() => {
      user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'ThisIsALong', 'NameForTests');
      user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'ThisIsALong', 'NameForTests');
      user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'ThisIsALong', 'NameForTests');
    });

    test('Correct Return: First User Long Name no Concat', () => {
      expect(grabUserHandle(user1.authUserId)).toStrictEqual({ userHandle: 'thisisalongnameforte' });
    });

    test('Correct Return: Second User Long Name with Concat', () => {
      expect(grabPermissionId(user2.authUserId)).toStrictEqual({ permissionId: 'thisisalongnameforte0' });
    });

    test('Correct Return: Third User Long Name with Concat', () => {
      expect(grabPermissionId(user3.authUserId)).toStrictEqual({ permissionId: 'thisisalongnameforte1' });
    });
  });

  describe('permissionId Testing', () => {
    let user1: AuthUserId, user2: AuthUserId;
    beforeEach(() => {
      user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
      user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    });

    test('Correct Return: First User is Owner', () => {
      expect(grabPermissionId(user1.authUserId)).toStrictEqual({ permissionId: 1 });
    });

    test('Correct Return: Second User is Member', () => {
      expect(grabPermissionId(user2.authUserId)).toStrictEqual({ permissionId: 2 });
    });
  });
});

// NOT SURE IS THIS IS ALLOWED ASK TUTOR

/**
 * grabUserHandle
 * Given a users id, returns their associated userHandle
 * @param {id} number
 * @returns { userHandle: string }
 */
function grabUserHandle(id: number): { userHandle: string } {
  const data = getData();
  return { userHandle: data.users[id].permissionId };
}

/**
 * grabPermissionId
 * Given a users id, returns their associated permissionId value
 * @param {id} number
 * @returns { permissionId: number }
 */
function grabPermissionId(id: number): { permissionId: number } {
  const data = getData();
  return { permissionId: data.users[id].permissionId };
}
