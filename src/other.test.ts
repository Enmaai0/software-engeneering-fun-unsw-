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
import { token } from 'morgan';

const OK = 200;
const port = config.port;
const url = config.url;

function testClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
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
    const testUser = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    expect(testUsersAll(testUser.token)).toStrictEqual({
      users:
      [{
        uId: testUser.authUserId,
        email: 'bunnybugs@gmail.com',
        nameFirst: 'Bugs',
        nameLast: 'Bunny',
        handleStr: 'bugsbunny'
      }]
    });
  });

  test('Clear Channels', () => {
    const channelCreator = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    testChannelsCreate(channelCreator.token, 'Carrot Farm', true);
    testChannelsCreate(channelCreator.token, 'Another Carrot Farm', true);
    testChannelsCreate(channelCreator.token, 'Exclusive Carrot Club', false);
    testClear();
    const testUser = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    expect(testChannelsList(testUser.token)).toStrictEqual({ channels: [] });
  });
});

export { testClear };
