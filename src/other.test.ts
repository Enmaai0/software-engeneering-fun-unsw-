/**
 * other.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all other routes not contained in other files.
 */

import {
  testClear,
  testNotificationsGet,
  testAuthRegister,
  testUsersAll,
  testChannelsCreate,
  testChannelsList,
  testDmCreate,
  testDmList,
  testChannelInvite,
  testMessageSend,
  testMessageSendDm
} from './testFunctions';

interface AuthReturn {
  token: string;
  authUserId: number;
}

describe('/clear Testing', () => {
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

describe('/notifications/get Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('1@gmail.com', 'pass1234', '1', '1');
    user2 = testAuthRegister('2@gmail.com', 'pass1234', '2', '2');
  });

  test('Error: Invalid Token', () => {
    expect(() => testNotificationsGet(user1.token + user2.token)).toThrow(Error);
  });

  test('No Notifications', () => {
    expect(testNotificationsGet(user1.token)).toStrictEqual({ notifications: [] });
    expect(testNotificationsGet(user2.token)).toStrictEqual({ notifications: [] });
  });

  test('Tagged, Reacted, and Added (Channel)', () => {
    const channel = testChannelsCreate(user1.token, 'channel', true);
    expect(testChannelInvite(user1.token, channel.channelId, user2.authUserId)).toStrictEqual({});
    expect(testMessageSend(user1.token, channel.channelId, 'Yo! Come look at this @22, it is so cool')).toStrictEqual({ messageId: expect.any(Number) });

    const user2message = testMessageSend(user2.token, channel.channelId, 'Second users message!');
    expect(user2message).toStrictEqual({ messageId: expect.any(Number) });
    // React to a message that the second user has sent

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction notification here
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: '@11 tagged you in channel: Yo! Come look at thi'
        }, {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: '@11 added you to channel'
        }]
    });
  });

  test('Tagged, Reacted, and Added (Dm)', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    expect(testMessageSendDm(user1.token, dm.dmId, 'Yo! Come look at this @22, it is so cool')).toStrictEqual({ messageId: expect.any(Number) });

    const user2message = testMessageSendDm(user2.token, dm.dmId, 'Second users message!');
    expect(user2message).toStrictEqual({ messageId: expect.any(Number) });
    // React to a message that the second user has sent

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction notification here
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@11 tagged you in 11, 22: Yo! Come look at thi'
        }, {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@11 added you to 11, 22'
        }]
    });
  });

  test('Mixed Notications', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const channel1 = testChannelsCreate(user1.token, 'channel', true);
    const channel2 = testChannelsCreate(user1.token, 'channel', true);

    expect(testChannelInvite(user1.token, channel2.channelId, user2.authUserId)).toStrictEqual({});
    testMessageSend(user1.token, channel2.channelId, '@22 Look a this graphhh!');

    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
    testMessageSendDm(user1.token, dm.dmId, 'Yo! This one is even better @22!');

    testMessageSendDm(user2.token, dm.dmId, 'That thing looks awesome! :O');
    // React to message

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction Notification when implemented
        {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: '@11 tagged you in channel1: Yo! This one is even'
        }, {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: '@11 added you to channel1'
        }, {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: '@11 tagged you in channel2: @22 Look a this grap'
        }, {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: '@11 added you to channel2'
        }, {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@11 added you to 11, 22'
        }]
    });
  });

  test('More than 20 Notifications Test', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);

    for (let i = 0; i < 19; i++) {
      testMessageSendDm(user1.token, dm.dmId, `@22 ${i}`);
    }

    const notifications = testNotificationsGet(user2.token);

    expect(notifications.notifications[0]).toStrictEqual({
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: '@11 tagged you in 11, 22: @22 18'
    });

    expect(notifications.notifications[19]).toStrictEqual({
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: '@11 added you to 11, 22'
    });
  });
});
