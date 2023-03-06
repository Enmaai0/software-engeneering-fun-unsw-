/**
 * channel.test.js
 * 
 * Contains the jest testing designed for channel.js
 */

import { authRegisterV1,authLoginV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { channelDetailsV1, channelJoinV1 } from './channel.js';
import { clearV1 } from './other.js';

beforeEach(() => {
  clearV1();
});

/////////////// channelDetailsV1 Function ///////////////
describe('userId error',() => {
  test('not a valid userId',() => {
    const user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    user = authLoginV1('userEmail@gmail.com', 'password');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual({error: expect.any(String)});
  });
});

describe('channelId error',() => {
  test('not a valid channelId',() => {
    const user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    user = authLoginV1('userEmail@gmail.com', 'password');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    test(channelDetailsV1(user.authUserId, channel.channelId)).toStrictEqual({error: expect.any(String)});
  });
});
describe('member error', () => {
  let user1;
  let user2;
  let channel;
  beforeEach( () => {
    user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user1 = authLoginV1('user1Email@gmail.com', 'password1');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
  })

  test('the user is not a member of this channel', () => {
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual({error: expect.any(String)});
  })
})

describe('channelDetails with no error', () => {
  test('success channelDetails', () => {
    const user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    const user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user1 = authLoginV1('user1Email@gmail.com', 'password1');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
    channelJoinV1(user2.authUserId, channel.channelId);

    expect(channelDetailsV1(user1.authUserId, channel.channelId)).toStrictEqual({
        name: expect.any(String),
        isPublic: true,
        ownerMembers: [{
        authUserId: user1.authUserId,
        email: 'user1Email@gmail.com',
        nameFirst: 'First1',
        nameLast: 'Last1',
        handleStr: 'First1Last1',
      }],
        allMembers: [{
        authUserId: user1.authUserId,
        email: 'user1Email@gmail.com',
        nameFirst: 'First1',
        nameLast: 'Last1',
        handleStr: 'First1Last1',
      }, {
        authUserId: user2.authUserId,
        email: 'user2Email@gmail.com',
        nameFirst: 'First2',
        nameLast: 'Last2',
        handleStr: 'First2Last2',
      }]
        })
    })
})

/////////////// channelJoinV1 Function ///////////////
describe('fail to join channel', () => {
  let user1;
  let user2;
  let channel;
  beforeEach( () => {
    user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user1 = authLoginV1('user1Email@gmail.com', 'password1');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', true);
    privateChannel = channelsCreateV1(user2.authUserId, 'private', false);
  })

  test('not a valid channel', () => {
    expect(channelJoinV1(user2.authUserId, channel.channelId + 1)).toStrictEqual(expect.any(String));
  });

  test('already a member', () => {
    expect(channelJoinV1(user1.authUserId, channel,channelId)).toStrictEqual(expect.any(String));
  });

  test('fail to join a private channel', () => {
    expect(channelJoinV1(user1.authUserId, privateChannel.channelId)).toStrictEqual(expect.any(String));
  });

  test('invalid user id', () => {
    expect(channelJoinV1(user1.authUserId + 1, privateChannel.channelId)).toStrictEqual(expect.any(String));
  });
});
