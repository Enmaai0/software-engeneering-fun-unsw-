/**
 * admin.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /admin/* routes.
 */

import {
  testAdminUserRemove,
  testAdminUserPermissionChange,
  testAuthRegister,
  testChannelsCreate,
  testChannelInvite,
  testChannelDetails,
  testDmCreate,
  testDmDetails,
  testUsersAll,
  testMessageSend,
  testChannelMessages,
  testUserProfile,
  testClear,
  testChannelAddOwner,
  testDmMessages,
  testMessageSendDm
} from './testFunctions';

const GLOBALMEMBER = 2;
const GLOBALOWNER = 1;

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

describe('/admin/user/remove: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testAdminUserRemove(user1.token + '1', user2.authUserId)).toThrow(Error);
  });

  test('Authorised User is not a Global Owner', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    const user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(() => testAdminUserRemove(user2.token, user3.authUserId)).toThrow(Error);
  });

  test('uId: Invalid uId (No User with that uId)', () => {
    expect(() => testAdminUserRemove(user1.token, user1.authUserId + 1)).toThrow(Error);
  });

  test('uId: Invalid uId (User is the only Global Owner)', () => {
    expect(() => testAdminUserRemove(user1.token, user1.authUserId)).toThrow(Error);
  });
});

describe('/admin/user/remove: Functionality Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Testing Removal from Channel', () => {
    const channel = testChannelsCreate(user1.token, 'channel', true);
    testChannelInvite(user1.token, channel.channelId, user2.authUserId);
    testChannelAddOwner(user1.token, channel.channelId, user2.authUserId);
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: 'channel',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }],
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: 'channel',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot',
      }],
    });
  });

  test('Testing Removal from Dms', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    expect(testDmDetails(user1.token, dm.dmId)).toStrictEqual({
      name: 'testbot, testbotii',
      members: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii'
      }]
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(testDmDetails(user1.token, dm.dmId)).toStrictEqual({
      name: 'testbot, testbotii',
      members: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }]
    });
  });

  test('Testing Removal from /users/all', () => {
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
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }]
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
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

  test('Testing Removal of Another Global Member with /users/all', () => {
    expect(testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALOWNER)).toStrictEqual({});
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
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }]
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
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

  test('Removed Users Messages Test (Channel)', () => {
    const channel = testChannelsCreate(user1.token, 'Channel', true);
    testChannelInvite(user1.token, channel.channelId, user2.authUserId);
    const message1 = testMessageSend(user2.token, channel.channelId, 'I\'m not deleted yet!');
    const message2 = testMessageSend(user2.token, channel.channelId, 'I\'m still not deleted yet!');
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'I\'m still not deleted yet!',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'I\'m not deleted yet!',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'Removed user',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'Removed user',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Removed Users Messages Test (Dm)', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message1 = testMessageSendDm(user2.token, dm.dmId, 'I\'m not deleted yet!');
    const message2 = testMessageSendDm(user2.token, dm.dmId, 'I\'m still not deleted yet!');
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'I\'m still not deleted yet!',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'I\'m not deleted yet!',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'Removed user',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user2.authUserId,
        message: 'Removed user',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Testing /user/profile with Removed User', () => {
    expect(testUserProfile(user1.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }
    });
    expect(testAdminUserRemove(user1.token, user2.authUserId)).toStrictEqual({});
    expect(testUserProfile(user1.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'Archived: email2@gmail.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: 'Archived: testbotii',
      }
    });
  });
});

describe('/admin/userpermission/change: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testAdminUserPermissionChange(user1.token + '1', user2.authUserId, GLOBALOWNER)).toThrow(Error);
  });

  test('Authorised User is not a Global Owner', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    const user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(() => testAdminUserPermissionChange(user2.token, user3.authUserId, GLOBALOWNER)).toThrow(Error);
  });

  test('uId: Invalid uId (No User with that uId)', () => {
    expect(() => testAdminUserPermissionChange(user1.token, user1.authUserId + 1, GLOBALOWNER)).toThrow(Error);
  });

  test('uId: Invalid uId (User is the only Global Owner)', () => {
    expect(() => testAdminUserPermissionChange(user1.token, user1.authUserId, GLOBALMEMBER)).toThrow(Error);
  });

  test('permissionId: Invalid permissionId (No Permission with that Id)', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALMEMBER + GLOBALOWNER)).toThrow(Error);
  });

  test('permissionId: Invalid permissionId (User Already has that permissionId)', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALMEMBER)).toThrow(Error);
  });

  test('User: User is Already a Global Owner', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALOWNER);
    expect(() => testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALOWNER)).toThrow(Error);
  });
});

describe('/admin/userpermission/change: Functionality Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Correct Return', () => {
    expect(testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALOWNER)).toStrictEqual({});
  });

  test('User is Promoted and can Promote a Global Member', () => {
    const user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(testAdminUserPermissionChange(user1.token, user2.authUserId, GLOBALOWNER)).toStrictEqual({});
    expect(testAdminUserPermissionChange(user2.token, user3.authUserId, GLOBALOWNER)).toStrictEqual({});
  });

  test('User is Demoted and Cannot Demote another Global Owner', () => {
    const user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(testAdminUserPermissionChange(user1.token, user3.authUserId, GLOBALOWNER)).toStrictEqual({});
    expect(testAdminUserPermissionChange(user3.token, user2.authUserId, GLOBALOWNER)).toStrictEqual({});
    expect(testAdminUserPermissionChange(user1.token, user3.authUserId, GLOBALMEMBER)).toStrictEqual({});
    expect(() => testAdminUserPermissionChange(user3.token, user2.authUserId, GLOBALMEMBER)).toThrow(Error);
  });
});
