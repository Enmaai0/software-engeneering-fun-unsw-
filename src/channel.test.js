/**
 * channel.test.js
 * 
 * Contains the jest testing designed for channel.js
 */

import { channelInviteV1, channelJoinV1, channelMessagesV1, channelDetailsV1 } from './channel.js';
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelsCreateV1 } from './channels.js'
import { userProfileV1 } from './users.js'
import { clearV1 } from './other.js';

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
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
  });

  test('authUserId: Invalid User Id', () => {
    expect(channelInviteV1(user1.authUserId + 1, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  beforeEach(() => {
    channelJoinV1(user1.authUserId, channel1.channelId);
  });

  test('uId: Invalid User2 Id', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user1.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Invalid Self Inivite: User In Channel', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  beforeEach(() => {
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('channelId: Invalid channelId', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId + 1, user2.authUserId)).toStrictEqual(ERROR);
  });

  test('Invalid Invite: Member Not in Channel', () => {
    expect(channelInviteV1(user2.authUserId, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  });

  beforeEach(() => {
    channelJoinV1(user2.authUserId, channel1.channelId);
  });

  test('Invalid Inivite: User In Channel', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  });
});

describe('channelInviteV1: Correct Return Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    channelJoinV1(user1.authUserId, channel1.channelId);
  });

  test('Correct Return: Empty Object', () => {
    expect(channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });
});

describe('channelInviteV1: Invite Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    channelInviteV1(user1.authUserId, channel1.channelId, user2.authUserId);
    user1_profile = userProfileV1(user1.authUserId, user1.authUserId);
    user2_profile = userProfileV1(user2.authUserId, user2.authUserId);
  });

  test('Correct Invite: Invited User ', () => {
    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toStrictEqual({ 
      name: 'channel1',
      isPublic: true,
      ownerMembers: [user1_profile],
      allMembers: [user1_profile, user2_profile],
     });
  });
});

/////////////// channelMessagesV1 Function ///////////////

describe('channelMessagesV1: Error Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    let start = 0;
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
    let user2 = authRegisterV1('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('uId: Not A Member', () => {
    expect(channelMessagesV1(user2.authUserId, channel1.channelId, start)).toStrictEqual(ERROR);
  });
});

describe('channelMessagesV1: Return Testing', () => {
  beforeEach(() => {
    let user1 = authRegisterV1('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    let channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    let start = 0;
  });
  
  test('Correct Return: No Message', () => {
    expect(channelMessagesV1(user1.authUserId, channel1.channelId, start)).toStrictEqual({
      masseges: [],
      start: start,
      end: -1,
    });
  });
});

/////////////// channelDetailsV1 Function ///////////////
describe('userId error',() => {
  test('not a valid userId',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    user = authLoginV1('userEmail@gmail.com', 'password');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    expect(channelDetailsV1(user.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
  });
});

describe('channelId error',() => {
  test('not a valid channelId',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    user = authLoginV1('userEmail@gmail.com', 'password');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    expect(channelDetailsV1(user.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
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
    expect(channelDetailsV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  })
})

describe('channelDetails with no error', () => {
  test('success channelDetails', () => {
    let user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
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
    });
  })
});

/////////////// channelJoinV1 Function ///////////////
describe('userId error',() => {
  test('not a valid userId',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user = authLoginV1('userEmail@gmail.com', 'password');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);
  });

  expect(channelJoinV1(user2.authUserId + 1, channel.channelId)).toStrictEqual(ERROR);
});

describe('channelId error',() => {
  test('not a valid channelId',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user = authLoginV1('userEmail@gmail.com', 'password');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    expect(channelJoinV1(user2.authUserId, channel.channelId + 1)).toStrictEqual(ERROR);
  });
});

describe('repeat join',() => {
  test('already a member',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user = authLoginV1('userEmail@gmail.com', 'password');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);

    expect(channelJoinV1(user.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });
});

describe('fail to join private channel',() => {
  test('have no permission to join',() => {
    let user1 = authRegisterV1('user1Email@gmail.com', 'password1', 'First1', 'Last1');
    let user2 = authRegisterV1('user2Email@gmail.com', 'password2', 'First2', 'Last2');
    user1 = authLoginV1('user1Email@gmail.com', 'password1');
    user2 = authLoginV1('user2Email@gmail.com', 'password2');
    channel = channelsCreateV1(user1.authUserId, 'firstChannel', false);

    expect(channelJoinV1(user2.authUserId, channel.channelId)).toStrictEqual(ERROR);
  });
});