/**
 * message.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /message/* routes.
 */

import {
  testMessageEdit,
  testMessageRemove,
  testMessageSend,
  testMessageSendDm,
  testClear,
  testAuthRegister,
  testChannelsCreate,
  testChannelJoin,
  testChannelMessages,
  testDmCreate,
  testDmMessages
} from './testFunctions';

const ERROR = { error: expect.any(String) };

const ONE_THOUSAND_CHARS = (
  'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!  Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex. Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! "Now fax quiz Jack!" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. Joaquin Phoenix was gazed by MTV for luck. A wizards job is to vex chumps quickly in fog. Watch "Jeopardy!", Alex Trebeks fun TV quiz game. Woven silk pyjamas exchanged for blue quartz.'
);

interface AuthReturn {
  token: string;
  authUserId: number;
}

interface ChannelsCreateReturn {
  channelId: number;
}

interface MessageSendReturn {
  messageId: number;
}

interface DmCreateReturn {
  dmId: number;
}

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full
 * functionality and correct implementation.
*/
beforeEach(() => {
  testClear();
});

/** /message/send Testing **/

describe('/message/send: Error Testing', () => {
  let user: AuthReturn, channel: ChannelsCreateReturn;
  beforeEach(() => {
    user = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user.token, 'New Channel', true);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(testMessageSend(user.token, channel.channelId + 1, 'This message is valid')).toStrictEqual(ERROR);
  });

  test('Message: Invalid Length of Message (Empty)', () => {
    expect(testMessageSend(user.token, channel.channelId, '')).toStrictEqual(ERROR);
  });

  test('Message: Invalid Length of Message (Over 1000 Characters)', () => {
    expect(testMessageSend(user.token, channel.channelId, ONE_THOUSAND_CHARS)).toStrictEqual(ERROR);
  });

  test('Token: Token is Invalid', () => {
    expect(testMessageSend(user.token + '1', channel.channelId, 'This message is valid')).toStrictEqual(ERROR);
  });

  test('Token: Not a Member of the Channel', () => {
    const user2 = testAuthRegister('hello2@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(testMessageSend(user2.token, channel.channelId, 'This message is valid')).toStrictEqual(ERROR);
  });
});

describe('/message/send: Correct Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn;
  let message1: MessageSendReturn, message2: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('second@gmail.com', 'alsoapassword', 'Johnny', 'Potato');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    testChannelJoin(user2.token, channel.channelId);
    message1 = testMessageSend(user1.token, channel.channelId, 'First Message');
    message2 = testMessageSend(user2.token, channel.channelId, 'Second Message');
  });

  test('Correct Return: Sending Messages to Channel', () => {
    expect(message1).toStrictEqual({ messageId: expect.any(Number) });
    expect(message2).toStrictEqual({ messageId: expect.any(Number) });
    expect(message1.messageId).not.toEqual(message2.messageId);
  });

  test('Correct Return: Using Channel Messages', () => {
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'Second Message',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'First Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });
});

/** /message/edit Testing **/

describe('/message/edit: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Token: Invalid Token', () => {
    expect(testMessageEdit(user1.token + '1', message.messageId, 'Valid change')).toStrictEqual(ERROR);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(testMessageEdit(user1.token, message.messageId + 1, 'Valid change')).toStrictEqual(ERROR);
  });

  test('Message: Invalid Length of Message (1000 Characters)', () => {
    expect(testMessageEdit(user1.token, message.messageId, ONE_THOUSAND_CHARS)).toStrictEqual(ERROR);
  });

  test('Invalid Permission: Editing Another Message While Not Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(testMessageEdit(user2.token, message.messageId, 'Valid change')).toStrictEqual(ERROR);
  });
});

describe('/message/edit: Return Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
  });

  test('Valid Message Edit (Creator of Message and Owner)', () => {
    const message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    expect(testMessageEdit(user1.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        message: 'This message is changed',
        uId: user1.authUserId,
        messageId: message.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });

  test('Valid Message Edit (Empty String (Delete Message) )', () => {
    const message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    expect(testMessageEdit(user1.token, message.messageId, '')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Valid Message Edit (Not Creator of Message But Owner)', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageEdit(user1.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        message: 'This message is changed',
        uId: user2.authUserId,
        messageId: message.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });

  test('Valid Message Edit (Creator of Message and Not Owner)', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageEdit(user2.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        message: 'This message is changed',
        uId: user2.authUserId,
        messageId: message.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });
});

/** /message/remove Testing **/

describe('/message/remove: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Token: Invalid Token', () => {
    expect(testMessageRemove(user1.token + '1', message.messageId)).toStrictEqual(ERROR);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(testMessageRemove(user1.token, message.messageId + 1)).toStrictEqual(ERROR);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(testMessageRemove(user2.token, message.messageId)).toStrictEqual(ERROR);
  });
});

describe('/message/remove: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
  });

  test('Correct Message Removal (1 -> 0 Messages) by Author and Owner', () => {
    const message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    expect(testMessageRemove(user1.token, message.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (1 -> 0 Messages) by Author but not Owner', () => {
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageRemove(user2.token, message.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (1 -> 0 Messages) by Owner but not Author', () => {
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageRemove(user1.token, message.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (3 -> 2 Messages)', () => {
    testChannelJoin(user2.token, channel.channelId);
    const message1 = testMessageSend(user1.token, channel.channelId, 'First');
    const message2 = testMessageSend(user1.token, channel.channelId, 'Second');
    const message3 = testMessageSend(user2.token, channel.channelId, 'Third');
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        message: 'Third',
        uId: user2.authUserId,
        messageId: message3.messageId,
        timeSent: expect.any(Number),
      }, {
        message: 'Second',
        uId: user1.authUserId,
        messageId: message2.messageId,
        timeSent: expect.any(Number),
      }, {
        message: 'First',
        uId: user1.authUserId,
        messageId: message1.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
    expect(testMessageRemove(user1.token, message2.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [{
        message: 'Third',
        uId: user2.authUserId,
        messageId: message3.messageId,
        timeSent: expect.any(Number),
      }, {
        message: 'First',
        uId: user1.authUserId,
        messageId: message1.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });
});

/** /message/senddm Testing **/

describe('/message/senddm: Error Testing', () => {
  let user1: AuthReturn, dm: DmCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    dm = testDmCreate(user1.token, []);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(testMessageSendDm(user1.token, dm.dmId + 1, 'This message is valid')).toStrictEqual(ERROR);
  });

  test('Message: Invalid Length of Message (Empty)', () => {
    expect(testMessageSendDm(user1.token, dm.dmId, '')).toStrictEqual(ERROR);
  });

  test('Message: Invalid Length of Message (Over 1000 Characters)', () => {
    expect(testMessageSendDm(user1.token, dm.dmId, ONE_THOUSAND_CHARS)).toStrictEqual(ERROR);
  });

  test('Token: Token is Invalid', () => {
    expect(testMessageSendDm(user1.token + '1', dm.dmId, 'This message is valid')).toStrictEqual(ERROR);
  });

  test('Token: Not a Member of the Channel', () => {
    const user2 = testAuthRegister('email@gmail.com', 'alsoapassword', 'Johnny', 'Depp');
    expect(testMessageSendDm(user2.token, dm.dmId, 'This message is valid')).toStrictEqual(ERROR);
  });
});

describe('/message/senddm: Correct Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let dm: DmCreateReturn;
  let message1: MessageSendReturn, message2: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('second@gmail.com', 'alsoapassword', 'Johnny', 'Potato');
    dm = testDmCreate(user1.token, [user2.authUserId]);
    message1 = testMessageSendDm(user1.token, dm.dmId, 'First Message');
    message2 = testMessageSendDm(user2.token, dm.dmId, 'Second Message');
  });

  test('Correct Return: Sending Messages to Dm', () => {
    expect(message1).toStrictEqual({ messageId: expect.any(Number) });
    expect(message2).toStrictEqual({ messageId: expect.any(Number) });
    expect(message1.messageId).not.toEqual(message2.messageId);
  });

  test('Correct Return: Using Dm Messages', () => {
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: message2.messageId,
        uId: user2.authUserId,
        message: 'Second Message',
        timeSent: expect.any(Number)
      }, {
        messageId: message1.messageId,
        uId: user1.authUserId,
        message: 'First Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });
});

describe('/message/senddm: Testing Removing and Editing for Dms', () => {
  let user1: AuthReturn, user2: AuthReturn;
  let dm: DmCreateReturn;
  let message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('second@gmail.com', 'alsoapassword', 'Johnny', 'Potato');
    dm = testDmCreate(user1.token, [user2.authUserId]);
    message = testMessageSendDm(user1.token, dm.dmId, 'Valid Normal Message');
  });

  test('Editing Dm Message', () => {
    expect(testMessageEdit(user1.token, message.messageId, 'Chad Edited Message')).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: message.messageId,
        uId: user1.authUserId,
        message: 'Chad Edited Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Removing Dm Message', () => {
    expect(testMessageRemove(user1.token, message.messageId)).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
});
