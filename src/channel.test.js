/**
 * channel.test.js
 * 
 * Contains the jest testing designed for channel.js
 */

import { channelInviteV1, channelJoinV1, channelMessagesV1, channelDetailsV1 } from './channel.js'
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelsCreateV1 } from './channels.js'
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

/////////////// channelInviteV1 Function ///////////////

describe('channelInviteV1: Error Testing', () => {
  let user1;
  let channel1;
  beforeEach( () => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
  });
  
  test('AuthUserId: Invalid authUserId', () => {
    expect(channelInviteV1(user1.authUserId + 1, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('UId: Invalid uId', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Invalid Self Invite: User In Channel', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('channelId: Invalid channelId', () => {
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(channelInviteV1(user1.authUserId, channel1.channelId + 1, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Invite: Member Not in Channel', () => {
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(channelInviteV1(user2.authUserId, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Inivite: User Already in Channel', () => {
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    channelJoinV1(user2.authUserId, channel1.channelId);
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });
});

describe('channelInviteV1: Correct Return Testing', () => {
  let user1, user2;
  let channel1;
  beforeEach(() => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Correct Return: Empty Object', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });

  test('Correct Invite: Invited User ', () => {
    channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId);
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({ 
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
      },{
        uId: user2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot II',
        handleStr: 'testbotii',
      }],
    });
  });
});

/////////////// channelMessagesV1 Function ///////////////

describe('channelMessagesV1: Error Testing', () => {
  let user1, user2;
  let channel1;
  let start;
  beforeEach(() => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    start = 0;
  });
  
  test('uId: Invalid uId', () => {
    expect(channelMessagesV1(user1.authUserId + 1, channel1.channelId, start)).toStrictEqual(ERROR);
  });

  test('channelId: Invalid channelId', () => {
    expect(channelMessagesV1(user1.authUserId, channel1.channelId + 1, start)).toStrictEqual(ERROR);
  });

  test('start: Invalid start Index', () => {
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, start + 1)).toStrictEqual(ERROR);
  });

  beforeEach(() => {
    user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('uId: Not A Member', () => {
    expect(channelMessagesV1(user2.authUserId, channel1.channelId, start)).toStrictEqual(ERROR);
  });
});

describe('channelMessagesV1: Return Testing', () => {
  let user1;
  let channel1;
  let start;
  test('Correct Return: No Message', () => {
    user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    start = 0;

    expect(channelMessagesV1(user1.authUserId, channel1.channelId, start)).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });
});

/////////////// channelDetailsV1 Function ///////////////
describe('channelDetailsV1: Error Testing',() => {
  let user1, user2;
  let channel;
  beforeEach( () => {
    user1 = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
  });

  test('UserId: Invalid UserId (Not a user)',() => {
    expect(channelDetailsV1(user1.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('userId: Invalid UserId (Not a member)', () => {
    user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid channelId',() => {
    expect(channelDetailsV1(user1.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });
});

describe('channelDetailsV1: Return Testing', () => {
  let user1, user2;
  let channel;
  test('channelDetails: Correct Return (2 Members)', () => {
    user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
    channelJoinV1(user2.authUserId, channel.channelId);

    expect(channelDetailsV1(user1.authUserId, channel.channelId)).toStrictEqual({
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

/////////////// channelJoinV1 Function ///////////////

describe('channelJoinV1: Error Testing',() => {
  let user1;
  let channel;
  beforeEach( () => {
    user1 = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
  });

  test('UserId: Invalid userId (User does not exist)',() => {
    expect(channelJoinV1(user1.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });

  test('UserId: Invalid userId (Already a member)',() => {
    expect(channelJoinV1(user1.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });

  test('ChannelId: Invalid channelId',() => {
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(channelJoinV1(user2.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });

  test('UserId: Channel is private & userId is not a global owner',() => {
    let channel2 = channelsCreateV1(user1.authUserId, 'firstChannel', false);
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    expect(channelJoinV1(user2.authUserId, channel2.channelId)).toStrictEqual(ERROR);
  });
});

describe('channelJoinV1: Return Testing',() => {
  let user1, user2;
  let channel;
  beforeEach( () => {
    user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
  });
  test('Succesful channelJoinV1 (No return)',() => {
    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual({});
  });

  test('Succesful channelJoinV1 (Test with channelDetailsV1)', () => {
    channelJoinV1(user2.authUserId, channel.channelId);
    expect(channelDetailsV1(user1.authUserId, channel.channelId)).toStrictEqual({
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