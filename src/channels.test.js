/**
 * channels.test.js
 * 
 * Contains the jest testing designed for channels.js
 */

import { authRegisterV1 } from './auth.js'
import { channelsListAllV1, channelsListV1, channelsCreateV1 } from './channels.js'
import { clearV1 } from './other.js'
import { getData, setData } from "./dataStore.js"

const ERROR = { error: expect.any(String) }

beforeEach(() => {
  clearV1();
});

/////////////// channelsCreateV1 ///////////////

describe('channelsCreateV1: Error Testing', () => {
  let user1;
  beforeEach(() => {
    user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella');
  });

  test('authUserId: Invalid authUserId', () => {
      expect(channelsCreateV1(user1.authUserId + 1, 'Channel', true)).toStrictEqual(ERROR);
  });

  test('Name: Too Short', () => {
      expect(channelsCreateV1(user1.authUserId, '', true)).toStrictEqual(ERROR);
  });
  
  test('Name: Too Long', () => {
    expect(channelsCreateV1(user1.authUserId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', true)).toStrictEqual(ERROR);
  });
});

describe('channelsCreateV1: channelId Testing', () => {
  let user1, channel1, channel2;
  beforeEach(() => {
    user1 = authRegisterV1('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    channel1 = channelsCreateV1(user1.authUserId, 'Channel 1', true);
    channel2 = channelsCreateV1(user1.authUserId, 'Channel 2', true);
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

/////////////// channelsListAllV1 ///////////////

describe('channelsListAllV1: Error Testing', () => {
  test('authUserId: Invalid authUserId', () => {
    let user1 = authRegisterV1('validemail@gmail.com', 'pass1234','Jake', 'Renzella')
    expect(channelsListAllV1(user1.authUserId + 1)).toStrictEqual(ERROR)
  });
});

describe('channelsListAllV1: Return List Testing', () => {
  test('Correct Return: Two Channels', () => {
    let user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella');
    channelsCreateV1(user1.authUserId, 'Channel1', true);
    channelsCreateV1(user1.authUserId, 'Channel2', false);
    expect(channelsListAllV1(user1)).toStrictEqual({
      channels: [
        {
          channelId: expect.any(Number),
          name: 'Channel1'
        },
        {
          channelId: expect.any(Number),
          name: 'Channel2'
        }
      ]
    });
  });
})

/////////////// channelsListV1 ///////////////

describe('channelsListV1" Error Testing', () => {
  test('authUserId is invalid', () => {
    let user1 = authRegisterV1('validemail@gmail.com', 'pass1234', 'jake', 'Renzella');
    expect(channelsListV1(user1.authUserId + 1)).toStrictEqual(ERROR)
  });
});

describe('channelsListV1: Return List Testing', () => {
  test('Testing User is in Public Channels Only', () => {
    const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
    channelsCreateV1(user1, 'Channel1', true);
    channelsCreateV1(user1, 'Channel2', true);
    expect(channelsListV1(user1)).toStrictEqual({
      channels: [
        {
          channelId: expect.any(Number),
          name: 'Channel1'
        },
        {
          channelId: expect.any(Number),
          name: 'Channel2'
        }
      ]
    });
  });

  test('Testing User is in Public & Private Channels', () => {
    const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
    channelsCreateV1(user1, 'Channel1', true);
    channelsCreateV1(user1, 'Channel2', true);
    channelsCreateV1(user1, 'Channel3', false);
    expect(channelsListV1(user1)).toStrictEqual({
      channels: [
        {
          channelId: expect.any(Number),
          name: 'Channel1'
        },
        {
          channelId: expect.any(Number),
          name: 'Channel2'
        },
        {
          channelId: expect.any(Number),
          name: 'Channel3'
        }
      ]
    });
  });
});
