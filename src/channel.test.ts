/**
 * channel.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /channel/* routes.
 */

import {
  testChannelDetails,
  testChannelInvite,
  testChannelJoin,
  testChannelMessages,
  testChannelLeave,
  testChannelAddOwner,
  testChannelRemoveOwner,
  testClear,
  testAuthRegister,
  testChannelsCreate,
  testMessageSend,
  testStandupStart,
  testStandupActive
} from './testFunctions';

interface AuthReturn {
  token: string;
  authUserId: number;
}

interface ChannelsCreateReturn {
  channelId: number;
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

/** /channel/invite Testing **/

describe('/channel/invite: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid Token', () => {
    expect(() => testChannelInvite(user1.token + 1, channel1.channelId, user1.authUserId)).toThrow(Error);
  });

  test('UId: Invalid uId', () => {
    expect(() => testChannelInvite(user1.token, channel1.channelId, user1.authUserId + 1)).toThrow(Error);
  });

  test('Invalid Self Invite: User In Channel', () => {
    expect(() => testChannelInvite(user1.token, channel1.channelId, user1.authUserId)).toThrow(Error);
  });

  test('channelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testChannelInvite(user1.token, channel1.channelId + 1, user2.authUserId)).toThrow(Error);
  });

  test('Invalid Invite: Member Not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    const user3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(() => testChannelInvite(user3.token, channel1.channelId, user2.authUserId)).toThrow(Error);
  });

  test('Invalid Invite: User Already in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testChannelJoin(user2.token, channel1.channelId);
    expect(() => testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toThrow(Error);
  });
});

describe('/channel/invite: Correct Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('Correct Return: Empty Object', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });

  test('Correct Invite: Invited User (/channel/details) ', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelDetails(user1.token, channel1.channelId)).toStrictEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot I',
        handleStr: 'testboti',
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot I',
        handleStr: 'testboti',
      }, {
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }],
    });
  });
});

/** /channel/messages Testing **/

describe('/channel/messages: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  let start: number;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
    start = 0;
  });

  test('Token: Invalid Token', () => {
    expect(() => testChannelMessages(user1.token + '1', channel1.channelId, start)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(() => testChannelMessages(user1.token, channel1.channelId + 1, start)).toThrow(Error);
  });

  test('Start: Invalid Start Index', () => {
    expect(() => testChannelMessages(user1.token, channel1.channelId, start + 1)).toThrow(Error);
  });

  test('UId: Not A Member', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testChannelMessages(user2.token, channel1.channelId, start)).toThrow(Error);
  });
});

describe('/channel/messages: Return Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('orangecat@gmail.com', 'ball0fYarn', 'Orange', 'Cat');
    channel = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('Channel with no Messages', () => {
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('Channel with Multiple Messages', () => {
    const testMessage1 = testMessageSend(user1.token, channel.channelId, 'First Message');
    const testMessage2 = testMessageSend(user1.token, channel.channelId, 'Second Message');
    const testMessage3 = testMessageSend(user1.token, channel.channelId, 'Third Message');
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: testMessage3.messageId,
        uId: user1.authUserId,
        message: 'Third Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage2.messageId,
        uId: user1.authUserId,
        message: 'Second Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage1.messageId,
        uId: user1.authUserId,
        message: 'First Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Channel Message with Start = -60', () => {
    testMessageSend(user1.token, channel.channelId, 'First Message');
    expect(testChannelMessages(user1.token, channel.channelId, -60)).toStrictEqual({
      messages: [],
      start: -60,
      end: -10
    });
  });
});

/** /channel/details Testing **/

describe('/channel/details: Error Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('UserId: Invalid Token (Not a valid token)', () => {
    expect(() => testChannelDetails(user1.token + 1, channel.channelId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelDetails(user2.token, channel.channelId)).toThrow(Error);
  });

  test('ChannelId: Invalid channelId', () => {
    expect(() => testChannelDetails(user1.token, channel.channelId + 1)).toThrow(Error);
  });
});

describe('/channel/details: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel: ChannelsCreateReturn;

  test('Correct Return: Two Members', () => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
    testChannelJoin(user2.token, channel.channelId);

    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: 'firstChannel',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'user1Email@gmail.com',
        nameFirst: 'First1',
        nameLast: 'Last1',
        handleStr: 'first1last1',
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'user1Email@gmail.com',
        nameFirst: 'First1',
        nameLast: 'Last1',
        handleStr: 'first1last1',
      }, {
        uId: user2.authUserId,
        email: 'user2Email@gmail.com',
        nameFirst: 'First2',
        nameLast: 'Last2',
        handleStr: 'first2last2',
      }]
    });
  });
});

/** /channel/join Testing **/

describe('/channel/join: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(() => testChannelJoin(user1.token + 1, channel.channelId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (Already a member)', () => {
    expect(() => testChannelJoin(user1.token, channel.channelId)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelJoin(user2.token, channel.channelId + 1)).toThrow(Error);
  });

  test('UserId: Channel is Private & User is Global Member', () => {
    const channel2 = testChannelsCreate(user1.token, 'firstChannel', false);
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelJoin(user2.token, channel2.channelId)).toThrow(Error);
  });

  test('Correct Return: Global Owner Private Channel', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    const privateChannel = testChannelsCreate(user2.token, 'private', false);
    expect(testChannelJoin(user1.token, privateChannel.channelId)).toStrictEqual({});
  });
});

/** /channel/leave Testing **/

describe('/channel/leave: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(() => testChannelLeave(user1.token + 1, channel.channelId)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(() => testChannelLeave(user1.token, channel.channelId + 1)).toThrow(Error);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelLeave(user2.token, channel.channelId)).toThrow(Error);
  });

  test('Invalid user: (User is the starter of the standup)', () => {
    testStandupStart(user1.token, channel.channelId, 10);
    testStandupActive(user1.token, channel.channelId);
    expect(() => testChannelLeave(user1.token, channel.channelId)).toThrow(Error);
  });
});

describe('/channel/leave: Return Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Correct Return: Other Owner Leaves', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelInvite(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelLeave(user2.token, channel.channelId)).toStrictEqual({});
  });
});

/** /channel/addOwner Testing **/

describe('/channel/addowner: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(() => testChannelAddOwner(user1.token + 1, channel.channelId, user1.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (not a valid user)', () => {
    expect(() => testChannelAddOwner(user1.token, channel.channelId, user1.authUserId + 1)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testChannelAddOwner(user1.token, channel.channelId + 1, user2.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (already an owner)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(() => testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid Token: (not permitted)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    const user3 = testAuthRegister('user3Email@gmail.com', 'password3', 'First3', 'Last3');
    testChannelJoin(user2.token, channel.channelId);
    testChannelJoin(user3.token, channel.channelId);
    expect(() => testChannelAddOwner(user3.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });
});

describe('/channel/addowner: Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Correct Return: Adding One User', () => {
    expect(testChannelJoin(user2.token, channel.channelId)).toStrictEqual({});
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
  });

  test('Correct Return: Global Owner Can Add Member', () => {
    const user3 = testAuthRegister('user3@gmail.com', 'password3', 'First3', 'Last3');
    const channel2 = testChannelsCreate(user2.token, 'secondChannel', true);
    testChannelJoin(user3.token, channel2.channelId);
    expect(testChannelAddOwner(user1.token, channel2.channelId, user3.authUserId)).toStrictEqual({});
  });
});

/** /channel/removeOwner Testing **/

describe('/channel/removeowner: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(() => testChannelRemoveOwner(user1.token + 1, channel.channelId, user1.authUserId)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(() => testChannelRemoveOwner(user1.token, channel.channelId + 1, user1.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(() => testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid Token: (Not an owner)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid UserId (Not a valid user)', () => {
    expect(() => testChannelRemoveOwner(user1.token, channel.channelId, user1.authUserId + 1)).toThrow(Error);
  });

  test('UserId: Invalid userId (User is the only owner)', () => {
    expect(() => testChannelRemoveOwner(user1.token, channel.channelId, user1.authUserId)).toThrow(Error);
  });

  test('UserId: Invalid Token: Remove Another User (Not permitted)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    const user3 = testAuthRegister('user3Email@gmail.com', 'password3', 'First3', 'Last3');
    testChannelJoin(user2.token, channel.channelId);
    testChannelAddOwner(user1.token, channel.channelId, user2.authUserId);
    testChannelJoin(user3.token, channel.channelId);
    expect(() => testChannelRemoveOwner(user3.token, channel.channelId, user2.authUserId)).toThrow(Error);
  });
});

describe('/channel/removeowner: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Correct Return: Adding then Removing Owner)', () => {
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
  });

  test('Correct Return: Global Owner Can Remove Member', () => {
    const user3 = testAuthRegister('user3@gmail.com', 'password3', 'First3', 'Last3');
    const channel2 = testChannelsCreate(user2.token, 'secondChannel', true);
    testChannelJoin(user3.token, channel2.channelId);
    expect(testChannelAddOwner(user2.token, channel2.channelId, user3.authUserId)).toStrictEqual({});
    expect(testChannelRemoveOwner(user1.token, channel2.channelId, user3.authUserId)).toStrictEqual({});
  });
});
