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
  testMessageSendDm,
  testChannelJoin
} from './testFunctions';

interface AuthReturn {
  token: string;
  authUserId: number;
}

beforeEach(() => {
  testClear();
});

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
    testChannelsCreate(channelCreator.token, 'Exclusive CarrotClub', false);
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
    user1 = testAuthRegister('user1@gmail.com', 'pass1234', 'first1', 'last1');
    user2 = testAuthRegister('user2@gmail.com', 'pass1234', 'first2', 'last2');
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
    expect(testMessageSend(user1.token, channel.channelId, 'Yo! Come look at this @first2last2, it is so cool')).toStrictEqual({ messageId: expect.any(Number) });

    const user2message = testMessageSend(user2.token, channel.channelId, 'Second users message!');
    expect(user2message).toStrictEqual({ messageId: expect.any(Number) });
    // React to a message that the second user has sent

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction notification here
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: '@first1last1 tagged you in channel: Yo! Come look at thi'
        }, {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: '@first1last1 added you to channel'
        }]
    });
  });

  test('Tagged, Reacted, and Added (Dm)', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    expect(testMessageSendDm(user1.token, dm.dmId, 'Yo! Come look at this @first2last2, it is so cool')).toStrictEqual({ messageId: expect.any(Number) });

    const user2message = testMessageSendDm(user2.token, dm.dmId, 'Second users message!');
    expect(user2message).toStrictEqual({ messageId: expect.any(Number) });
    // React to a message that the second user has sent

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction notification here
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@first1last1 tagged you in first1last1, first2last2: Yo! Come look at thi'
        }, {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@first1last1 added you to first1last1, first2last2'
        }]
    });
  });

  test('Mixed Notications', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const channel1 = testChannelsCreate(user1.token, 'channel1', true);
    const channel2 = testChannelsCreate(user1.token, 'channel2', true);

    expect(testChannelInvite(user1.token, channel2.channelId, user2.authUserId)).toStrictEqual({});
    testMessageSend(user1.token, channel2.channelId, '@first2last2 Look a this graphhh!');

    expect(testChannelInvite(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
    testMessageSendDm(user1.token, dm.dmId, 'Yo! This one is even better @first2last2!');

    testMessageSendDm(user2.token, dm.dmId, 'That thing looks awesome! :O');
    // React to message

    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [
        // Reaction Notification when implemented
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@first1last1 tagged you in first1last1, first2last2: Yo! This one is even'
        }, {
          channelId: channel1.channelId,
          dmId: -1,
          notificationMessage: '@first1last1 added you to channel1'
        }, {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: '@first1last1 tagged you in channel2: @first2last2 Look a '
        }, {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: '@first1last1 added you to channel2'
        }, {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: '@first1last1 added you to first1last1, first2last2'
        }]
    });
  });

  test('More than 20 Notifications Test', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);

    for (let i = 0; i < 21; i++) {
      testMessageSendDm(user1.token, dm.dmId, `@first2last2 ${i}`);
    }

    const notifications = testNotificationsGet(user2.token);

    expect(notifications.notifications[0]).toStrictEqual({
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: '@first1last1 tagged you in first1last1, first2last2: @first2last2 20'
    });

    expect(notifications.notifications[19]).toStrictEqual({
      channelId: -1,
      dmId: dm.dmId,
      notificationMessage: '@first1last1 tagged you in first1last1, first2last2: @first2last2 1'
    });
  });

  test('Multiple Users Tagged in One Message', () => {
    const channel1 = testChannelsCreate(user1.token, 'channel1', true);
    testChannelJoin(user2.token, channel1.channelId);
    testMessageSend(user1.token, channel1.channelId, '@first1last1 Test Message @first2last2');
    expect(testNotificationsGet(user1.token)).toStrictEqual({
      notifications: [{
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: '@first1last1 tagged you in channel1: @first1last1 Test Me'
      }]
    });
    expect(testNotificationsGet(user2.token)).toStrictEqual({
      notifications: [{
        channelId: channel1.channelId,
        dmId: -1,
        notificationMessage: '@first1last1 tagged you in channel1: @first1last1 Test Me'
      }]
    });
  });
});
