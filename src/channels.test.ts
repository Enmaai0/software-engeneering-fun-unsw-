/**
 * channels.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /channels/* routes.
 */

import {
  testChannelsCreate,
  testChannelsList,
  testChannelsListAll,
  testClear,
  testAuthRegister,
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

/** channelsCreateV1 **/

describe('channelsCreateV1: Error Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('validemail@gmail.com', '123abc!@#', 'jake', 'Renzella');
  });

  test('Token: Invalid Token', () => {
    expect(testChannelsCreate(user1.token + '1', 'Channel', true)).toStrictEqual(ERROR);
  });

  test('Name: Too Short', () => {
    expect(testChannelsCreate(user1.token, '', true)).toStrictEqual(ERROR);
  });

  test('Name: Too Long', () => {
    expect(testChannelsCreate(user1.token, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', true)).toStrictEqual(ERROR);
  });
});

describe('channelsCreateV1: channelId Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn, channel2: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    channel1 = testChannelsCreate(user1.token, 'Channel 1', true);
    channel2 = testChannelsCreate(user1.token, 'Channel 2', true);
  });

  test('Correct Return: First Channel', () => {
    expect(channel1).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Correct Return: Second Channel', () => {
    expect(channel2).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('Correct Return: Check Unique channelId', () => {
    expect(channel1).not.toMatchObject(channel2);
  });
});

/** channelsListV1 **/

describe('channelsListV1" Error Testing', () => {
  test('authUserId is invalid', () => {
    const user1 = testAuthRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    testChannelsCreate(user1.token, 'Channel1', true);
    expect(testChannelsListAll(user1.token + '1')).toStrictEqual(ERROR);
  });
});

describe('channelsListV1: Return List Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    user2 = testAuthRegister('anotheemail@gmail.com', '123abc!@#', 'Monty', 'Python');
  });

  test('Testing User is in No Channels (Zero Total)', () => {
    expect(testChannelsList(user1.token)).toStrictEqual({ channels: [] });
  });

  test('Testing User is in No Channels (One Total)', () => {
    testChannelsCreate(user2.token, 'Channel1', true);
    expect(testChannelsList(user1.token)).toStrictEqual({ channels: [] });
    expect(testChannelsList(user2.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel1'
      }]
    });
  });

  test('Testing User is in Two Channels (Three Total)', () => {
    testChannelsCreate(user1.token, 'Channel1', true);
    testChannelsCreate(user2.token, 'Channel2', true);
    testChannelsCreate(user1.token, 'Channel3', true);
    expect(testChannelsList(user1.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel1'
      }, {
        channelId: expect.any(Number),
        name: 'Channel3'
      }]
    });
    expect(testChannelsList(user2.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel2'
      }]
    });
  });
});

/** channelsListAllV1 **/

describe('channelsListAllV1: Error Testing', () => {
  test('authUserId: Invalid authUserId', () => {
    const user1 = testAuthRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    testChannelsCreate(user1.token, 'Channel1', true);
    expect(testChannelsList(user1.token + '1')).toStrictEqual(ERROR);
  });
});

describe('channelsListAllV1: Return List Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    user2 = testAuthRegister('anotheemail@gmail.com', '123abc!@#', 'Monty', 'Python');
  });

  test('Correct Return: No Channels', () => {
    expect(testChannelsListAll(user1.token)).toStrictEqual({ channels: [] });
  });

  test('Correct Return: One Channels', () => {
    testChannelsCreate(user1.token, 'Channel1', true);
    expect(testChannelsListAll(user1.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel1'
      }]
    });
  });

  test('Correct Return: Two Channels (First User Token)', () => {
    testChannelsCreate(user1.token, 'Channel1', true);
    testChannelsCreate(user2.token, 'Channel2', false);
    expect(testChannelsListAll(user1.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel1'
      }, {
        channelId: expect.any(Number),
        name: 'Channel2'
      }]
    });
  });

  test('Correct Return: Two Channels (Second User Token)', () => {
    testChannelsCreate(user1.token, 'Channel1', true);
    testChannelsCreate(user2.token, 'Channel2', false);
    expect(testChannelsListAll(user2.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'Channel1'
      }, {
        channelId: expect.any(Number),
        name: 'Channel2'
      }]
    });
  });
});
