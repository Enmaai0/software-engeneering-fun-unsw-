/**
 * auth.test.js
 * 
 * Contains the jest testing designed for auth.js
 */

import { authLoginV1, authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js'
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
  let user1;
  let user2;
  beforeEach(() => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
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
  let user1;
  let user2;
  let userProfile1;
  let userProfile2;
  beforeEach(() => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot');
    user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    userProfile1 = userProfileV1(user1.authUserId, user1.authUserId);
    userProfile2 = userProfileV1(user2.authUserId, user2.authUserId);
  });

  test('Correct Return: First User', () => {
    expect(userProfile1.handleStr).toStrictEqual('testbot');
  });

  test('Correct Return: Second User', () => {
    expect(userProfile2.handleStr).toStrictEqual('testbot0');
  });

  let user3; 
  let user4;
  let userProfile3;
  let userProfile4;
  beforeEach(() => {
    user3 = authRegisterV1('email3@gmail.com', 'pass1234', '1234567891011', '1213141516117181920');
    user4 = authRegisterV1('email4@gmail.com', 'pass1234', '1234567891011', '1213141516117181920');
    userProfile3 = userProfileV1(user3.authUserId, user3.authUserId);
    userProfile4 = userProfileV1(user4.authUserId, user4.authUserId);
  });

  test('Correct Return: Long Name', () => {
    expect(userProfile3.handleStr).toStrictEqual('12345678910111213141');
  });

  test('Correct Return: Long Name Second', () => {
    expect(userProfile3.handleStr).toStrictEqual('123456789101112131410');
  });
});
