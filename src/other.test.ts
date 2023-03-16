/**
 * other.test.js
 * 
 * Contains the jest testing designed for other functions
 * not included in the main function files
 */

import request from 'sync-request';
import config from './config.json';
import testAuthRegister from './auth.test';
import testUsersAll from './users.test';
import { testChannelsCreate, testChannelsList } from './channels.test';
import { testDmCreate, testDmList } from './dm.test';

const OK = 200;
const port = config.port;
const url = config.url;

function testClear() {
  const res = request(
    'DELETE',
    url + '/clear/v1',
    { qs: {} }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/clear/v1 Testing', () => {
  test('Clear Users', () => {
    testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    testAuthRegister('bartFarts69@gmail.com', 'HomerStinks', 'Bart', 'Simpson');
    testAuthRegister('strongMan@gmail.com', 'SPINACH', 'Pop', 'Eye');
    testClear();
    expect(testUsersAll(>>INSERT TOKEN<<)).toStrictEqual({ users: [] });
  });

  test('Clear Channels', () => {
    let user1 = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    testChannelCreate(>>INSERT TOKEN<<, 'Carrot Farm', true);
    testChannelCreate(>>INSERT TOKEN<<, 'Another Carrot Farm', true);
    testChannelCreate(>>INSERT TOKEN<<, 'Exclusive Carrot Club', false);
    testClear();
    expect(testChannelsList(>>INSERT TOKEN<<)).toStrictEqual({ channels: [] });
  });

  // If testClear runs correctly, user1 and user3 will have identical authUserId/Tokens
  test('Clear Dms', () => {
    let user1 = testAuthRegister('bartFarts69@gmail.com', 'HomerStinks', 'Bart', 'Simpson');
    let user2 = testAuthRegister('strongMan@gmail.com', 'SPINACH', 'Pop', 'Eye');
    testDmCreate(>>INSERT TOKEN<<, [user2.authUserID])
    testClear();
    let user3 = testAuthRegister('bartFarts69@gmail.com', 'HomerStinks', 'Bart', 'Simpson');
    expect(testDmList(>>INSERT TOKEN<<).toStrictEqual({ dms: [] });
  });
});

export { testClear }