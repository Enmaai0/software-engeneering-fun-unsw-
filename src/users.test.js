/**
 * user.test.js
 * 
 * Contains the jest testing designed for user.js
 */

import { userProfileV1 } from './users.js';
import { authRegisterV1 } from './auth.js';

const ERROR = { error: expect.any(String) };

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full 
 * functionality and correct implementation.
*/
beforeEach(() => {
  clearV1();
});

describe('usersProfileV1: Error Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
  });

  test('Correct Return: First User', () => {
    expect(userProfileV1(user1.authUserId + 1, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('Correct Return: Second User', () => {
    expect(userProfileV1(user1.authUserId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });
});

describe('usersProfileV1: Return Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Correct Return: First User', () => {
    expect(userProfileV1(user1.authUserId, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot I',
        handleStr: 'testbot',
      }
    });
  });

  test('Correct Return: Second User', () => {
    expect(userProfileV1(user2.authUserId, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbot0',
      }
    });
  });
});
  