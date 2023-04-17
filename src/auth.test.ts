/**
 * auth.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /auth/* routes.
 */

import {
  testAuthLogin,
  testAuthLogout,
  testAuthPasswordResetRequest,
  testAuthPasswordResetReset,
  testAuthRegister,
  testChannelDetails,
  testChannelsCreate,
  testClear,
  testDmCreate,
} from './testFunctions';

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

afterAll(() => {
  testClear();
});

/** /auth/login/v2 Testing **/

describe('/auth/login: Error Testing', () => {
  beforeEach(() => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Email: Invalid Email', () => {
    expect(() => testAuthLogin('invalidEmail', 'pass1234')).toThrow(Error);
  });

  test('Email: No User with Email', () => {
    expect(() => testAuthLogin('nonExistantEmail@gmail.com', 'pass1234')).toThrow(Error);
  });

  test('Password: Incorrect Password', () => {
    expect(() => testAuthLogin('email@gmail.com', '1234pass')).toThrow(Error);
  });
});

/** /auth/logout/v1 Testing **/

describe('/auth/logout: Error Testing', () => {
  test('Email: Invalid Token (No Users)', () => {
    expect(() => testAuthLogout('someRandomTokenIDK?')).toThrow(Error);
  });

  test('Email: Invalid Token (With Users)', () => {
    const user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testAuthLogout(user1.token + user2.token)).toThrow(Error);
  });
});

describe('/auth/logout: Return Testing', () => {
  test('Email: Invalid Token (No Users)', () => {
    const user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
    expect(testAuthLogout(user1.token)).toStrictEqual({});
  });
});

describe('/auth/logout: Token Removal Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('realEmail@gmail.com', 'password1234', 'Kazoo', 'Kid');
  });

  test('Creating Dm with Deleted Token', () => {
    testClear();
    expect(() => testDmCreate(user1.token, [])).toThrow(Error);
  });
});

/** /auth/register/v2 Testing **/

describe('/auth/register: Error Testing', () => {
  test('Email: Invalid Email', () => {
    expect(() => testAuthRegister('invalidEmail', 'pass1234', 'Test', 'Bot')).toThrow(Error);
  });

  test('Email: Email Already in Use', () => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(() => testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot')).toThrow(Error);
  });

  test('Password: Too Short (Empty Password)', () => {
    expect(() => testAuthRegister('email@gmail.com', '', 'Test', 'Bot')).toThrow(Error);
  });

  test('Password: Too Short (Non Empty Password)', () => {
    expect(() => testAuthRegister('email@gmail.com', 'Pass', 'Test', 'Bot')).toThrow(Error);
  });

  test('First Name: Empty', () => {
    expect(() => testAuthRegister('email@gmail.com', 'pass1234', '', 'Bot')).toThrow(Error);
  });

  test('Last Name: Empty', () => {
    expect(() => testAuthRegister('email@gmail.com', 'pass1234', 'Test', '')).toThrow(Error);
  });

  test('First Name: Too Long', () => {
    expect(() => testAuthRegister('email@gmail.com', 'pass1234', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toThrow(Error);
  });

  test('Last Name: Too Long', () => {
    expect(() => testAuthRegister('email@gmail.com', 'pass1234', 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toThrow(Error);
  });
});

describe('/auth/register: Testing', () => {
  test('Handle: Super Long Name', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'IBGoenfoiaefeafuheagoeg', 'SuperLongNameImSoTiredPleaseHelpMe')).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
});

/** /auth/passwordreset/request/v1 Testing **/

describe('/auth/passwordreset/request: Error Testing', () => {
  test('Email: Invalid Email (Return Empty Object)', () => {
    testAuthRegister('validEmail@gmail.com', 'password1234', 'Jerry', 'Yang');
    expect(testAuthPasswordResetRequest('randomEmail@gmail.com')).toStrictEqual({});
  });
});

// NOTE: These tests use ethereal.email to test email sending. To use account, go to auth.ts sendEmail Helper.
// NOTE: Confirmed Emails do Send through NodeMailer
describe('/auth/passwordreset/request: General Testing', () => {
  test('User is logged out of all sessions (1 Session)', () => {
    const user = testAuthRegister('useremail@gmail.com', 'pass1234', 'Jerry', 'Yang');
    const channel = testChannelsCreate(user.token, 'Channel', true);
    expect(() => testChannelDetails(user.token, channel.channelId)).not.toThrow(Error);
    expect(testAuthPasswordResetRequest('useremail@gmail.com')).toStrictEqual({});
    expect(() => testChannelDetails(user.token, channel.channelId)).toThrow(Error);
  });

  test('User is logged out of all sessions (2 Sessions)', () => {
    const userS1 = testAuthRegister('useremail@gmail.com', 'pass1234', 'Jerry', 'Yang');
    const userS2 = testAuthLogin('useremail@gmail.com', 'pass1234');
    const channel = testChannelsCreate(userS1.token, 'Channel', true);
    expect(() => testChannelDetails(userS1.token, channel.channelId)).not.toThrow(Error);
    expect(() => testChannelDetails(userS2.token, channel.channelId)).not.toThrow(Error);
    expect(testAuthPasswordResetRequest('useremail@gmail.com')).toStrictEqual({});
    expect(() => testChannelDetails(userS1.token, channel.channelId)).toThrow(Error);
    expect(() => testChannelDetails(userS2.token, channel.channelId)).toThrow(Error);
  });
});

/** /auth/passwordreset/reset/v1 Testing **/

describe('/auth/passwordreset/reset: Error Testing', () => {
  test('newPassword: Invalid Password (<6 Characters)', () => {
    expect(() => testAuthPasswordResetReset('RESETCODE', '1234')).toThrow(Error);
  });

  test('resetCode: Invalid resetCode (Random String (Mixed))', () => {
    expect(() => testAuthPasswordResetReset('Die38UKaiD', 'validPassword1234')).toThrow(Error);
  });

  test('resetCode: Invalid resetCode (Random String (Numbers))', () => {
    expect(() => testAuthPasswordResetReset('1247896918', 'validPassword1234')).toThrow(Error);
  });

  test('resetCode: Invalid resetCode (Random String (Symbols))', () => {
    expect(() => testAuthPasswordResetReset('(!*$^*!@$%', 'validPassword1234')).toThrow(Error);
  });
});

describe('/auth/passwordreset/reset: Return Testing', () => {
  test('Tested Manually: Forced resetCode to be one specific value', () => {
    expect('Manually Tested').toStrictEqual('Manually Tested');
  });

  /*
  Manually tested via forcing resetCode to be 'ThisIsTheResetCode'
  NOTE: Cannot create tests to ensure this is covered

  test('Valid resetCode: Password is updated using newPassword', () => {
    testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
    expect(testAuthLogin('email1@gmail.com', 'pass1234')).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });;
    expect(testAuthPasswordResetRequest('email1@gmail.com')).toStrictEqual({});
    expect(testAuthPasswordResetReset('ThisIsTheResetCode', 'validPassword1234')).toStrictEqual({});
    expect(testAuthLogin('email1@gmail.com', 'pass1234')).toStrictEqual(ERROR);
    expect(testAuthLogin('email1@gmail.com', 'validPassword1234')).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(testAuthPasswordResetReset('ThisIsTheResetCode', 'validPassword1234')).toStrictEqual(ERROR);
  });
  */
});
