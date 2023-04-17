/**
 * users.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /users/* routes.
 */

import {
  testUserProfile,
  testUsersAll,
  testSetName,
  testSetEmail,
  testSetHandle,
  testClear,
  testAuthRegister,
  testUserProfileUploadPhoto
} from './testFunctions';

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full
 * functionality and correct implementation.
*/
beforeEach(() => {
  testClear();
});

interface AuthReturn {
  token: string;
  authUserId: number;
}

/* UserProfileV1 Function */

describe('usersProfileV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
  });

  test('Token: Invalid Token', () => {
    expect(() => testUserProfile(user1.token + 'A', user1.authUserId)).toThrow(Error);
  });

  test('uId: Invalid uId', () => {
    expect(() => testUserProfile(user1.token, user1.authUserId + 1)).toThrow(Error);
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

/// //////////// UsersAllV1 Function ///////////////

describe('usersAllV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(() => testUsersAll(user1.token + 'A')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testUsersAll(user1.token + '1')).toThrow(Error);
  });
});

describe('Correct Return: All Users', () => {
  test('All: One User', () => {
    const user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
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
    const user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
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

test('All: Iter2 Failed Test', () => {
  const userWoody = testAuthRegister('sherrif.woody@andysroom.com', 'qazwsx!!', 'sherrif', 'woody');
  const userBuzz = testAuthRegister('buzz.ligthyear@starcommand.com', 'qazwsx@@', 'buzz', 'lightyear');
  expect(testUsersAll(userWoody.token)).toStrictEqual({
    users: [{
      uId: userWoody.authUserId,
      email: 'sherrif.woody@andysroom.com',
      nameFirst: 'sherrif',
      nameLast: 'woody',
      handleStr: 'sherrifwoody',
    }, {
      uId: userBuzz.authUserId,
      email: 'buzz.ligthyear@starcommand.com',
      nameFirst: 'buzz',
      nameLast: 'lightyear',
      handleStr: 'buzzlightyear',
    }]
  });
});

/** UserSetNameV1 Function **/

describe('userSetNameV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(() => testSetName(user1.token + 'A', 'Test', 'Bot')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testSetName(user1.token + '1', 'Test', 'Bot')).toThrow(Error);
  });

  test('FirstName: Invalid First Name Too Long', () => {
    expect(() => testSetName(user1.token, '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toThrow(Error);
  });

  test('FirstName: Invalid First Name Too Short', () => {
    expect(() => testSetName(user1.token, '', 'Bot')).toThrow(Error);
  });

  test('LastName: Invalid Last Name Too Long', () => {
    expect(() => testSetName(user1.token, 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toThrow(Error);
  });

  test('LastName: Invalid Last Name Too Short', () => {
    expect(() => testSetName(user1.token, 'Test', '')).toThrow(Error);
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

/// //////////// UserSetEmailV1 Function ///////////////

describe('userSetEmailV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(() => testSetEmail(user1.token + 'A', 'email@gmail.com')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testSetEmail(user1.token + '1', 'email@gmail.com')).toThrow(Error);
  });

  test('Email: Invalid Email', () => {
    expect(() => testSetEmail(user1.token, 'invalidEmail')).toThrow(Error);
  });

  test('Email: Email Already in Use', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testSetEmail(user2.token, 'email@gmail.com')).toThrow(Error);
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

/** UserSetHandleV1 Function **/

describe('userSetHandleV1: Error Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token A', () => {
    expect(() => testSetHandle(user1.token + 'A', 'handle')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testSetHandle(user1.token + '1', 'handle')).toThrow(Error);
  });

  test('Handle: Invalid Handle (symbol)', () => {
    expect(() => testSetHandle(user1.token, 'invalidHandle!')).toThrow(Error);
  });

  test('Handle: Invalid Handle (space)', () => {
    expect(() => testSetHandle(user1.token, 'invalid handle')).toThrow(Error);
  });

  test('Handle: Invalid Handle (symbol)', () => {
    expect(() => testSetHandle(user1.token, 'invalidh@ndle')).toThrow(Error);
  });

  test('Handle: Invalid Handle Too Long', () => {
    expect(() => testSetHandle(user1.token, 'invalidHandleinvalidHandle')).toThrow(Error);
  });

  test('Handle: Invalid Handle Too Short', () => {
    expect(() => testSetHandle(user1.token, 'in')).toThrow(Error);
  });

  test('Handle: Invalid Handle Already Taken', () => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testSetHandle(user2.token, 'testbot')).toThrow(Error);
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
    expect(() => testUsersAll(user1.token + 'A')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testUsersAll(user1.token + '1')).toThrow(Error);
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
    expect(() => testSetName(user1.token + 'A', 'Test', 'Bot')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testSetName(user1.token + '1', 'Test', 'Bot')).toThrow(Error);
  });

  test('FirstName: Invalid First Name Too Long', () => {
    expect(() => testSetName(user1.token, '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toThrow(Error);
  });

  test('FirstName: Invalid First Name Too Short', () => {
    expect(() => testSetName(user1.token, '', 'Bot')).toThrow(Error);
  });

  test('LastName: Invalid Last Name Too Long', () => {
    expect(() => testSetName(user1.token, 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toThrow(Error);
  });

  test('LastName: Invalid Last Name Too Short', () => {
    expect(() => testSetName(user1.token, 'Test', '')).toThrow(Error);
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
    expect(() => testSetEmail(user1.token + 'A', 'email@gmail.com')).toThrow(Error);
  });

  test('Token: Invalid Token 1', () => {
    expect(() => testSetEmail(user1.token + '1', 'email@gmail.com')).toThrow(Error);
  });

  test('Email: Invalid Email', () => {
    expect(() => testSetEmail(user1.token, 'invalidEmail')).toThrow(Error);
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

/** UserProfileUploadPhoto Function **/

describe('UserProfileUploadPhoto: Error Testing', () => {
  let user1: AuthReturn;
  const imgUrl = 'image.png';
  let xStart = 0;
  let xEnd = 100;
  let yStart = 0;
  let yEnd = 100;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    expect(() => testUserProfileUploadPhoto(user1.token + 1, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('URL: Invalid imgUrl Not End With jpg or jpeg', () => {
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl + 1, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('URL: Invalid imgUrl', () => {
    const testImgUrl = '.jpg'; // Invalid imgUrl
    expect(() => testUserProfileUploadPhoto(user1.token, testImgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('URL: Invalid imgUrl (URL starts with https)', () => {
    const testImgUrl = 'https://image.jpg'; // Invalid imgUrl
    expect(() => testUserProfileUploadPhoto(user1.token, testImgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid xStart', () => {
    xStart = -1;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid yStart', () => {
    yStart = -1;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid xEnd', () => {
    xEnd = -1;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid yEnd', () => {
    yEnd = -1;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid xEnd >= xStart', () => {
    xStart = 100;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });

  test('Crop: Invalid yEnd >= yStart', () => {
    yStart = 100;
    expect(() => testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toThrow(Error);
  });
});

describe('Correct UserProfileUploadPhoto: Correct Return Testing', () => {
  test('UserProfileUploadPhoto: Return Empty Object', () => {
    const user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    const imgUrl = 'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Rufous_Hummingbird%2C_male_01.jpg/1280px-Rufous_Hummingbird%2C_male_01.jpg';
    const xStart = 0;
    const xEnd = 100;
    const yStart = 0;
    const yEnd = 100;
    expect(testUserProfileUploadPhoto(user1.token, imgUrl, xStart, yStart, xEnd, yEnd)).toStrictEqual({});
  });
});
