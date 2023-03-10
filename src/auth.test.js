/**
 * auth.test.js
 * 
 * Contains the jest testing designed for auth.js
 */

import { authLoginV1, authRegisterV1 } from './auth.js'
import { userProfileV1 } from './users.js'
import { clearV1 } from './other.js'

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
  let user1, user2;
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
  let user1, user2, user3;
  let userProfile1, userProfile2, userProfile3;
  beforeEach(() => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot');
    user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    user3 = authRegisterV1('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    userProfile1 = userProfileV1(user1.authUserId, user1.authUserId);
    userProfile2 = userProfileV1(user2.authUserId, user2.authUserId);
    userProfile3 = userProfileV1(user3.authUserId, user3.authUserId);
  });

  test('Correct Return: First User (Short Name)', () => {
    expect(userProfile1.user.handleStr).toStrictEqual('testbot');
  });

  test('Correct Return: Second User (Short Name)', () => {
    expect(userProfile2.user.handleStr).toStrictEqual('testbot0');
  });

  test('Correct Return: Third User (Short Name)', () => {
    expect(userProfile3.user.handleStr).toStrictEqual('testbot1');
  });

  let user4, user5, user6;
  let userProfile4, userProfile5, userProfile6;
  beforeEach(() => {
    user4 = authRegisterV1('email4@gmail.com', 'pass1234', '1234567891011', '1213141516117181920');
    user5 = authRegisterV1('email5@gmail.com', 'pass1234', '1234567891011', '1213141516117181920');
    user6 = authRegisterV1('email6@gmail.com', 'pass1234', '1234567891011', '1213141516117181920');
    userProfile4 = userProfileV1(user4.authUserId, user4.authUserId);
    userProfile5 = userProfileV1(user5.authUserId, user5.authUserId);
    userProfile6 = userProfileV1(user6.authUserId, user6.authUserId);
  });

  test('Correct Return: First User (Long Name)', () => {
    expect(userProfile4.user.handleStr).toStrictEqual('12345678910111213141');
  });

  test('Correct Return: Second User (Long Name)', () => {
    expect(userProfile5.user.handleStr).toStrictEqual('123456789101112131410');
  });

  test('Correct Return: Third User (Long Name)', () => {
    expect(userProfile6.user.handleStr).toStrictEqual('123456789101112131411');
  });
});
