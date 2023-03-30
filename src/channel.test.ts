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
} from './testFunctions';

const ERROR = { error: expect.any(String) };

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

/** /channel/invite Testing **/

describe('/channel/invite: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid Token', () => {
    expect(testChannelInvite(user1.token + 1, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UId: Invalid uId', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Invalid Self Invite: User In Channel', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('channelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testChannelInvite(user1.token, channel1.channelId + 1, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Invite: Member Not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testChannelInvite(user2.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Invite: User Already in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testChannelJoin(user2.token, channel1.channelId);
    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
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
    expect(testChannelMessages(user1.token + '1', channel1.channelId, start)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(testChannelMessages(user1.token, channel1.channelId + 1, start)).toStrictEqual(ERROR);
  });

  test('Start: Invalid Start Index', () => {
    expect(testChannelMessages(user1.token, channel1.channelId, start + 1)).toStrictEqual(ERROR);
  });

  test('UId: Not A Member', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testChannelMessages(user2.token, channel1.channelId, start)).toStrictEqual(ERROR);
  });
});

describe('/channel/messages: Return Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  test('Correct Return: No Message', () => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
    expect(testChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
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
    expect(testChannelDetails(user1.token + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelDetails(user2.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid channelId', () => {
    expect(testChannelDetails(user1.token, channel.channelId + 1)).toStrictEqual(ERROR);
  });
});

describe('/channel/details: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel: ChannelsCreateReturn;

  test('Correct Return: One Members', () => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
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
      }]
    });
  });

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
    expect(testChannelJoin(user1.token + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (Already a member)', () => {
    expect(testChannelJoin(user1.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelJoin(user2.token, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('UserId: Channel is Private & User is Global Member', () => {
    const channel2 = testChannelsCreate(user1.token, 'firstChannel', false);
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelJoin(user2.token, channel2.channelId)).toStrictEqual(ERROR);
  });
});

describe('/channel/join: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let channel: ChannelsCreateReturn, privateChannel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
    privateChannel = testChannelsCreate(user2.token, 'privateChannel', true);
  });

  test('Correct Return: Global Member Public Channel', () => {
    expect(testChannelJoin(user2.token, channel.channelId)).toStrictEqual({});
  });

  test('Correct Return: Global Member Public Channel with testChannelDetails', () => {
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

  test('Correct Return: Global Owner Private Channel', () => {
    expect(testChannelJoin(user1.token, privateChannel.channelId)).toStrictEqual({});
  });

  test('Correct Return: Global Owner Private Channel with testChannelDetails', () => {
    testChannelJoin(user1.token, privateChannel.channelId);
    expect(testChannelDetails(user1.token, privateChannel.channelId)).toStrictEqual({
      name: 'privateChannel',
      isPublic: true,
      ownerMembers: [{
        uId: user2.authUserId,
        email: 'user2Email@gmail.com',
        nameFirst: 'First2',
        nameLast: 'Last2',
        handleStr: 'first2last2',
      }],
      allMembers: [{
        uId: user2.authUserId,
        email: 'user2Email@gmail.com',
        nameFirst: 'First2',
        nameLast: 'Last2',
        handleStr: 'first2last2',
      }, {
        uId: user1.authUserId,
        email: 'user1Email@gmail.com',
        nameFirst: 'First1',
        nameLast: 'Last1',
        handleStr: 'first1last1',
      }]
    });
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
    expect(testChannelLeave(user1.token + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(testChannelLeave(user1.token, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelLeave(user2.token, channel.channelId)).toStrictEqual(ERROR);
  });
});

describe('/channel/leave: Return Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Correct Return: Only User Leaves', () => {
    expect(testChannelLeave(user1.token, channel.channelId)).toStrictEqual({});
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('Correct Return: Other User Leaves', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelInvite(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelLeave(user2.token, channel.channelId)).toStrictEqual({});
  });

  test('Correct Return: Test with testChannelDetails', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelInvite(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelLeave(user1.token, channel.channelId)).toStrictEqual({});
    expect(testChannelDetails(user2.token, channel.channelId)).toStrictEqual({
      name: expect.any(String),
      isPublic: true,
      ownerMembers: [],
      allMembers: [{
        uId: user2.authUserId,
        email: 'user2Email@gmail.com',
        nameFirst: 'First2',
        nameLast: 'Last2',
        handleStr: 'first2last2',
      }]
    });
  });
});

/** /channel/addOwner Testing **/

describe('/channel/addOwner: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(testChannelAddOwner(user1.token + 1, channel.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (not a valid user)', () => {
    expect(testChannelAddOwner(user1.token, channel.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid ChannelId', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelAddOwner(user1.token, channel.channelId + 1, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (already an owner)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid Token: (not permitted)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    const user3 = testAuthRegister('user3Email@gmail.com', 'password3', 'First3', 'Last3');
    testChannelJoin(user2.token, channel.channelId);
    testChannelJoin(user3.token, channel.channelId);
    expect(testChannelAddOwner(user3.token, channel.channelId, user2.authUserId));
  });
});

describe('/channel/addOwner: Return Testing', () => {
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

  test('Correct Return: Test with testChannelDetails', () => {
    expect(testChannelJoin(user2.token, channel.channelId)).toStrictEqual({});
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: expect.any(String),
      isPublic: true,
      ownerMembers: [
        {
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
        }
      ],
      allMembers: [
        {
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
        }
      ]
    });
  });
});

/** /channel/removeOwner Testing **/

describe('/channel/removeOwner: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('Token: Invalid Token (Token does not exist)', () => {
    expect(testChannelRemoveOwner(user1.token + 1, channel.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(testChannelRemoveOwner(user1.token, channel.channelId + 1, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (Not a member)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid UserId (Not a valid user)', () => {
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid userId (User is the only owner)', () => {
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid Token: (Not permitted)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    const user3 = testAuthRegister('user3Email@gmail.com', 'password3', 'First3', 'Last3');
    testChannelJoin(user2.token, channel.channelId);
    testChannelJoin(user3.token, channel.channelId);
    expect(testChannelRemoveOwner(user3.token, channel.channelId, user1.authUserId));
  });

  test('UserId: Invalid Token: (Not an owner)', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId));
  });
});

describe('/channel/removeOwner: Return Testing', () => {
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

  test('Correct Return: Test with testChannelDetails', () => {
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelAddOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelRemoveOwner(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: expect.any(String),
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'user1Email@gmail.com',
          nameFirst: 'First1',
          nameLast: 'Last1',
          handleStr: 'first1last1',
        }
      ],
      allMembers: [
        {
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
        }
      ]
    });
  });
});
