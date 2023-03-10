/**
 * other.test.js
 * 
 * Contains the jest testing designed for other functions
 * not included in the main function files
 */

import { channelsListAllV1, channelsCreateV1 } from './channels.js'
import { authRegisterV1 } from './auth.js'
import { userProfileV1 } from "./users.js"
import { getData } from './dataStore.js'
import { clearV1 } from './other.js'

beforeEach(() => {
  clearV1();
});

////////////// clearV1 Function ///////////////

describe('clearV1: Tests',() => {
  test('Check Users no Longer Exists', () => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    clearV1();
    expect(userProfileV1(user.authUserId, user.authUserId)).toStrictEqual({error: expect.any(String)});
  });

  test('Check Channel no Longer Exists', () => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    let channel = channelsCreateV1(user.authUserId, 'firstChannel', true);
    clearV1();
    let user1 = authRegisterV1('user1Email@gmail.com', 'password', 'First', 'Last');
    expect(channelsListAllV1(user1.authUserId)).toStrictEqual({ channels: [] });
  });
})