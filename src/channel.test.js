/**
 * channel.test.js
 * 
 * Contains the jest testing designed for channel.js
 */

import { channelInviteV1, channelJoinV1, channelMessagesV1, channelDetailsV1 } from './channel.js';
import { authRegisterV1 } from './auth.js'
import { channelsCreateV1 } from './auth.js'
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

