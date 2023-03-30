/**
 * user.test.ts
 *
 * Contains the jest testing designed for user.js
 */

import {
  testUserProfile,
  testUsersAll,
  testSetName,
  testSetEmail,
  testSetHandle,
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

/** UserProfileV1 Function **/

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

/** UsersAllV1 Function **/

describe('usersAllV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testUsersAll(user1.token + 'A')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testUsersAll(user1.token + '1')).toStrictEqual(ERROR);
  });
});

describe('Correct Return: All Users', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('All: One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }]
    });
  });

  test('All: Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetNameV1 Function **/

describe('userSetNameV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetName(user1.token + 'A', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetName(user1.token + '1', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('FirstName: Invalid First Name Too Long', () => {
    expect(testSetName(user1.token, '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toStrictEqual(ERROR);
  });

  test('FirstName: Invalid First Name Too Short', () => {
    expect(testSetName(user1.token, '', 'Bot')).toStrictEqual(ERROR);
  });

  test('LastName: Invalid Last Name Too Long', () => {
    expect(testSetName(user1.token, 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toStrictEqual(ERROR);
  });

  test('LastName: Invalid Last Name Too Short', () => {
    expect(testSetName(user1.token, 'Test', '')).toStrictEqual(ERROR);
  });
});

describe('Correct SetName: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetName(user1.token, 'A', 'B');
  });

  test('SetName: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({ });
  });

  test('SetName: Set Name One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot',
      }]
    });
  });

  test('SetName: Set Name Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetName(user2.token, 'A', 'B');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetEmailV1 Function **/

describe('userSetEmailV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetEmail(user1.token + 'A', 'email@gmail.com')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetEmail(user1.token + '1', 'email@gmail.com')).toStrictEqual(ERROR);
  });

  test('Email: Invalid Email', () => {
    expect(testSetEmail(user1.token, 'invalidEmail')).toStrictEqual(ERROR);
  });
});

describe('Correct SetEmail: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetEmail(user1.token, 'email2@gmail.com');
  });

  test('SetEmail: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({ });
  });

  test('SetEmail: Set Email One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }]
    });
  });

  test('SetName: Set Name Two Users', () => {
    user2 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetEmail(user2.token, 'email@gmail.com');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetHandlecoV1 Function **/

describe('userSetHandleV1: Error Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetEmail(user1.token + 'A', 'handle')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetEmail(user1.token + '1', 'handle')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle !', () => {
    expect(testSetEmail(user1.token, 'invalidHandle!')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Too Long', () => {
    expect(testSetEmail(user1.token, 'invalidHandleinvalidHandle')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Too Short', () => {
    expect(testSetEmail(user1.token, 'in')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Already Taken', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testSetEmail(user2.token, 'testbot')).toStrictEqual(ERROR);
  });
});

describe('Correct SetEmail: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetHandle(user1.token, 'handle');
  });

  test('SetHandle: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({ });
  });

  test('SetHandle: Set Handle One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle',
      }]
    });
  });

  test('SetHandle: Set Handle Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetHandle(user2.token, 'handle2');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle2',
      }]
    });
  });
});

/** UsersAllV1 Function **/

describe('usersAllV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testUsersAll(user1.token + 'A')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testUsersAll(user1.token + '1')).toStrictEqual(ERROR);
  });
});

describe('Correct Return: All Users', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('All: One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }]
    });
  });

  test('All: Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetNameV1 Function **/

describe('userSetNameV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetName(user1.token + 'A', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetName(user1.token + '1', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('FirstName: Invalid First Name Too Long', () => {
    expect(testSetName(user1.token, '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toStrictEqual(ERROR);
  });

  test('FirstName: Invalid First Name Too Short', () => {
    expect(testSetName(user1.token, '', 'Bot')).toStrictEqual(ERROR);
  });

  test('LastName: Invalid Last Name Too Long', () => {
    expect(testSetName(user1.token, 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toStrictEqual(ERROR);
  });

  test('LastName: Invalid Last Name Too Short', () => {
    expect(testSetName(user1.token, 'Test', '')).toStrictEqual(ERROR);
  });
});

describe('Correct SetName: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetName(user1.token, 'A', 'B');
  });

  test('SetName: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({ });
  });

  test('SetName: Set Name One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot',
      }]
    });
  });

  test('SetName: Set Name Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetName(user2.token, 'A', 'B');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'A',
        nameLast: 'B',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetEmailV1 Function **/

describe('userSetEmailV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetEmail(user1.token + 'A', 'email@gmail.com')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetEmail(user1.token + '1', 'email@gmail.com')).toStrictEqual(ERROR);
  });

  test('Email: Invalid Email', () => {
    expect(testSetEmail(user1.token, 'invalidEmail')).toStrictEqual(ERROR);
  });
});

describe('Correct SetEmail: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetEmail(user1.token, 'email2@gmail.com');
  });

  test('SetEmail: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({ });
  });

  test('SetEmail: Set Email One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }]
    });
  });

  test('SetName: Set Name Two Users', () => {
    user2 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetEmail(user2.token, 'email@gmail.com');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0',
      }]
    });
  });
});

/** UserSetHandlecoV1 Function **/

describe('userSetHandleV1: Error Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(testSetEmail(user1.token + 'A', 'handle')).toStrictEqual(ERROR);
  });

  test('Token: Invalid Token 1', () => {
    expect(testSetEmail(user1.token + '1', 'handle')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Too Long', () => {
    expect(testSetEmail(user1.token, 'invalidHandleinvalidHandle')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Too Short', () => {
    expect(testSetEmail(user1.token, 'in')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Already Taken', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testSetEmail(user2.token, 'testbot')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Contains Capitals', () => {
    expect(testSetEmail(user1.token, 'lowerCAPITAL')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Contains Symbols ( ! )', () => {
    expect(testSetEmail(user1.token, 'invalidHandle!')).toStrictEqual(ERROR);
  });

  test('Handle: Invalid Handle Contains Symbols ( & )', () => {
    expect(testSetEmail(user1.token, 'invalid&Handle!')).toStrictEqual(ERROR);
  });
});

describe('Correct SetHandle: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let returnObj: Record<string, never>;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    returnObj = testSetHandle(user1.token, 'handle');
  });

  test('SetHandle: Return Empty Object', () => {
    expect(returnObj).toStrictEqual({});
  });

  test('SetHandle: Set Handle One User', () => {
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle',
      }]
    });
  });

  test('SetHandle: Set Handle Two Users', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    testSetHandle(user2.token, 'handle2');
    expect(testUsersAll(user1.token)).toStrictEqual({
      users: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'handle2',
      }]
    });
  });
});
