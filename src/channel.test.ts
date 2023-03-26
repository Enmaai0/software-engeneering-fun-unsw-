/**
 * channel.test.ts
 *
 * Contains the jest testing designed for channel.ts
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testAuthRegister } from './auth.test'
import { testChannelsCreate } from './channels.test'

const port = config.port;
const url = config.url;

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

/////////////// testChannelInvite Function ///////////////

function testChannelInvite(token: string, channelId: number, uid: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v2`,
    {
      json: {
        token,
        channelId,
        uid
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/////////////// testChannelJoin Function ///////////////

function testChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/join/v2`,
    {
      json: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/////////////// testChannelMessages Function ///////////////

function testChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/messages/v2`,
    {
      qs: {
        token,
        channelId,
        start
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

/////////////// testChannelDetails Function ///////////////

function testChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}/channel/details/v2`,
    {
      qs: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}


/////////////// ChannelInviteV1 Test ///////////////

describe('testChannelInvite: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid token', () => {
    expect(testChannelInvite(user1.token + 1, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UId: Invalid uId', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Invalid Self Invite: User In Channel', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('channelId: Invalid channelId', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testChannelInvite(user1.token, channel1.channelId + 1, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Invite: Member Not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testChannelInvite(user2.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Inivite: User Already in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testChannelJoin(user2.token, channel1.channelId);
    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });
});

describe('testChannelInvite: Correct Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Correct Return: Empty Object', () => {
    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });

  test('Correct Invite: Invited User ', () => {
    testChannelInvite(user1.token, channel1.channelId, user2.authUserId);
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

/////////////// ChannelMessagesV1 Test ///////////////

describe('testChannelMessages: Error Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel1: ChannelsCreateReturn;
  let start: number;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
    start = 0;
  });

  test('uId: Invalid uId', () => {
    expect(testChannelMessages(user1.token + 1, channel1.channelId, start)).toStrictEqual(ERROR);
  });

  test('channelId: Invalid channelId', () => {
    expect(testChannelMessages(user1.token, channel1.channelId + 1, start)).toStrictEqual(ERROR);
  });

  test('start: Invalid start Index', () => {
    expect(testChannelMessages(user1.token, channel1.channelId, start + 1)).toStrictEqual(ERROR);
  });

  beforeEach(() => {
    user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('uId: Not A Member', () => {
    expect(testChannelMessages(user2.token, channel1.channelId, start)).toStrictEqual(ERROR);
  });
});

describe('testChannelMessages: Return Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  let start: number;
  test('Correct Return: No Message', () => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
    start = 0;

    expect(testChannelMessages(user1.token, channel1.channelId, start)).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });
});

/////////////// ChannelDetailsV1 Test ///////////////
describe('testChannelDetails: Error Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('UserId: Invalid token (Not a valid token)', () => {
    expect(testChannelDetails(user1.token + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('userId: Invalid UserId (Not a member)', () => {
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelDetails(user2.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid channelId', () => {
    expect(testChannelDetails(user1.token, channel.channelId + 1)).toStrictEqual(ERROR);
  });
});

describe('testChannelDetails: Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  test('channelDetails: Correct Return (2 Members)', () => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
    testChannelJoin(user2.token, channel.channelId);

    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: expect.any(String),
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

/////////////// ChannelJoinV1 Test ///////////////

describe('testChannelJoin: Error Testing', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });

  test('UserId: Invalid userId (User does not exist)', () => {
    expect(testChannelJoin(user1.token + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid userId (Already a member)', () => {
    expect(testChannelJoin(user1.token, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid channelId', () => {
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelJoin(user2.token, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('UserId: Channel is private & userId is not a global owner', () => {
    const channel2 = testChannelsCreate(user1.token, 'firstChannel', false);
    const user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(testChannelJoin(user2.token, channel2.channelId)).toStrictEqual(ERROR);
  });
});

describe('testChannelJoin: Return Testing', () => {
  let user1: AuthReturn;
  let user2: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = testAuthRegister('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = testChannelsCreate(user1.token, 'firstChannel', true);
  });
  test('Succesful testChannelJoin (No return)', () => {
    expect(testChannelJoin(user2.token, channel.channelId)).toStrictEqual({});
  });

  test('Succesful testChannelJoin (Test with testChannelDetails)', () => {
    testChannelJoin(user2.token, channel.channelId);
    expect(testChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: expect.any(String),
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
