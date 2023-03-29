/**
 * user.test.js
 *
 * Contains the jest testing designed for user.js
 */

import {
  testUserProfile,
  testClear,
  testAuthRegister
} from './testFunctions';

const ERROR = { error: expect.any(String) };

interface AuthReturn {
  token: string;
  authUserId: number;
}

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full
 * functionality and correct implementation.
*/
beforeEach(() => {
  testClear();
});

/// //////////// UserProfileV1 Function ///////////////

describe('usersProfileV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
  });

  test('Token: Invalid Token', () => {
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
