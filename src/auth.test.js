/**
 * auth.test.js
 * 
 * Contains the jest testing designed for auth.js
 */

import { authLoginV1, authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

const ERROR = { error: expect.any(String) };

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full 
 * functionality and correct implementation.
*/
beforeEach(() => {
  clearV1();
});

/////////////// authLoginV1 Function ///////////////

describe('authLoginV1: Error Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Email: Invalid Email', () => {
    expect(authLoginV1('invalidEmail','pass1234')).toStrictEqual(ERROR);
  });

  test('Email: No User with Email', () => {
    expect(authLoginV1('nonExistantEmail@gmail.com','pass1234')).toStrictEqual(ERROR);
  });

  test('Password: Incorrect Password', () => {
    expect(authLoginV1('email@gmail.com','1234pass')).toStrictEqual(ERROR);
  });
});

describe('authLoginV1: authUserId Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot');
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Correct Return: First User', () => {
    expect(authLoginV1('email@gmail.com','pass1234')).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('Correct Return: Second User', () => {
    expect(authLoginV1('email2@gmail.com','pass1234')).toStrictEqual({ authUserId: expect.any(Number) });
  });

  test('Correct Return: Check Unique authUserId', () => {
    expect(authLoginV1('email@gmail.com','pass1234')).not.toMatchObject(authLoginV1('email2@gmail.com','pass1234'));
  });
});

/////////////// authRegisterV1 Function ///////////////

describe('authRegisterV1: Error Testing', () => {
  test('Email: Invalid Email', () => {
    expect(authRegisterV1('invalidEmail', 'pass1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Email: Email Already in Use', () => {
    authRegisterV1('usedEmail@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(authRegisterV1('usedEmail@gmail.com', 'pass1234', 'Test', 'Bot II')).toStrictEqual(ERROR);
  });

  test('Password: Too Short', () => {
    expect(authRegisterV1('email@gmail.com', '1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('First Name: Empty', () => {
    expect(authRegisterV1('email@gmail.com', 'pass1234', '', 'Bot')).toStrictEqual(ERROR);
  });

  test('First Name: Too Long', () => {
    expect(authRegisterV1('email@gmail.com', 'pass1234', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'Bot')).toStrictEqual(ERROR);
  });

  test('Last Name: Empty', () => {
    expect(authRegisterV1('email@gmail.com', 'pass1234', 'Test', '')).toStrictEqual(ERROR);
  });

  test('Last Name: Too Long', () => {
    expect(authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toStrictEqual(ERROR);
  });
});

describe('authRegisterV1: authUserId Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
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

describe('authRegisterV1: userHandle Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot');
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot');
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
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }
    });
  });
});
