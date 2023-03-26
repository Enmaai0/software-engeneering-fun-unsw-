/**
 * user.test.js
 *
 * Contains the jest testing designed for user.js
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testAuthRegister } from './auth.test'

const port = config.port;
const url = config.url;
const ERROR = { error: expect.any(String) };

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full
 * functionality and correct implementation.
*/
beforeEach(() => {
  testClear();
});

/////////////// UserProfileV2 Function ///////////////

interface AuthReturn {
  token: string;
  authUserId: number;
}

function testUserProfile(token: string, uId: number) {
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

describe('usersProfileV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
  });

  test('AuthUserId: Invalid authUserId', () => {
    expect(testUserProfile(user1.token + 'A', user1.authUserId)).toStrictEqual(ERROR);
  });

  test('uId: Invalid uId', () => {
    expect(testUserProfile(user1.token, user1.authUserId + 1)).toStrictEqual(ERROR);
  });
});

describe('usersProfileV1: Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Correct Return: First User', () => {
    expect(testUserProfile(user1.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }
    });
  });

  test('Correct Return: Second User', () => {
    expect(testUserProfile(user2.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }
    });
  });
});
