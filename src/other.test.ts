/**
 * other.test.js
 *
 * Contains the jest testing designed for other functions
 * not included in the main function files
 */

import {
  testClear,
  testAuthRegister,
  testUsersAll,
  testChannelsCreate,
  testChannelsList,
  testDmCreate,
  testDmList
} from './testFunctions';

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

  test('Clear Dms', () => {
    const dmCreator = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    const dmMember = testAuthRegister('bartFarts69@gmail.com', 'HomerStinks', 'Bart', 'Simpson');
    testDmCreate(dmCreator.token, []);
    testDmCreate(dmCreator.token, [dmMember.authUserId]);
    testDmCreate(dmCreator.token, [dmMember.authUserId]);
    testClear();
    const testUser = testAuthRegister('bunnybugs@gmail.com', 'iLoveCarrots', 'Bugs', 'Bunny');
    expect(testDmList(testUser.token)).toStrictEqual({ dms: [] });
  });
});

export { testClear };
