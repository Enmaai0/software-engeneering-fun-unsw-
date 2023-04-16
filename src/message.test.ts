import {
  testMessageSend,
  testClear,
  testMessageEdit,
  testMessageRemove,
  testAuthRegister,
  testChannelsCreate,
  testMessageSendDm,
  testChannelJoin,
  testDmCreate,
  testChannelMessages,
  testDmMessages,
  testMessagePin,
  testMessageUnPin,
  testMessageReact,
  testMessageUnreact,
} from './testFunctions';

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
    expect(() => testMessageSend(user.token, channel.channelId + 1, 'This message is valid')).toThrow(Error);
  });

  test('Message: Invalid Length of Message (Empty)', () => {
    expect(() => testMessageSend(user.token, channel.channelId, '')).toThrow(Error);
  });

  test('Message: Invalid Length of Message (Over 1000 Characters)', () => {
    expect(() => testMessageSend(user.token, channel.channelId, ONE_THOUSAND_CHARS)).toThrow(Error);
  });

  test('Token: Token is Invalid', () => {
    expect(() => testMessageSend(user.token + '1', channel.channelId, 'This message is valid')).toThrow(Error);
  });

  test('Token: Not a Member of the Channel', () => {
    const user2 = testAuthRegister('hello2@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(() => testMessageSend(user2.token, channel.channelId, 'This message is valid')).toThrow(Error);
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

describe('/message/send: Testing Removing and Editing for Channelss', () => {
  let user1: AuthReturn;
  let channel: ChannelsCreateReturn;
  let message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'Valid Normal Message');
  });

  test('Editing Dm Message', () => {
    expect(testMessageEdit(user1.token, message.messageId, 'Chad Edited Message')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
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
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
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
    expect(() => testMessageEdit(user1.token + '1', message.messageId, 'Valid change')).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessageEdit(user1.token, message.messageId + 1, 'Valid change')).toThrow(Error);
  });

  test('User: User is not in Channel', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(() => testMessageEdit(user2.token, message.messageId, 'New MssagMessage')).toThrow(Error);
  });

  test('User: User is not in Dm', () => {
    const dm = testDmCreate(user1.token, []);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(() => testMessageEdit(user2.token, message2.messageId, 'New MssagMessage')).toThrow(Error);
  });

  test('Message: Invalid Length of Message (1000 Characters)', () => {
    expect(() => testMessageEdit(user1.token, message.messageId, ONE_THOUSAND_CHARS)).toThrow(Error);
  });

  test('Invalid Permission: Editing Another Message While Not Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessageEdit(user2.token, message.messageId, 'Valid change')).toThrow(Error);
  });

  test('User: User is a GlobalOwner but not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const channel2 = testChannelsCreate(user2.token, 'Second Channel', true);
    const message2 = testMessageSend(user2.token, channel2.channelId, 'This message is valid');
    expect(() => testMessageEdit(user1.token, message2.messageId, 'Meow meow I am a cat')).toThrow(Error);
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

  test('Valid Message Edit (Not Creator of Message But Owner) (Channel)', () => {
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

  test('Valid Message Edit (Not Creator of Message But Owner) (DM)', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    expect(testMessageEdit(user1.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
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

  test('Valid Message Edit (Creator of Message and Not Owner) (Channel)', () => {
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

  test('Valid Message Edit (Creator of Message and Not Owner) (DM)', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    expect(testMessageEdit(user2.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
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

  test('Valid Message Edit Multiple Channels', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    testChannelsCreate(user1.token, 'Channel1', true);
    const channel2 = testChannelsCreate(user1.token, 'Channel2', true);
    testChannelsCreate(user2.token, 'Channel3', true);
    const message = testMessageSend(user1.token, channel2.channelId, 'This message is valid');
    expect(testMessageEdit(user1.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel2.channelId, 0)).toStrictEqual({
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

  test('Valid Message Edit Multiple Dms', () => {
    const user2 = testAuthRegister('email@gmail.com', 'thisisapassword', 'Maximus', 'Minimus');
    testDmCreate(user1.token, [user2.authUserId]);
    const dm2 = testDmCreate(user1.token, [user2.authUserId]);
    testDmCreate(user2.token, [user1.authUserId]);
    const message = testMessageSendDm(user2.token, dm2.dmId, 'This message is valid');
    expect(testMessageEdit(user2.token, message.messageId, 'This message is changed')).toStrictEqual({});
    expect(testDmMessages(user1.token, dm2.dmId, 0)).toStrictEqual({
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
    expect(() => testMessageRemove(user1.token + '1', message.messageId)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessageRemove(user1.token, message.messageId + 1)).toThrow(Error);
  });

  test('User: User is not in Channel', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(() => testMessageRemove(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not in Dm', () => {
    const dm = testDmCreate(user1.token, []);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    expect(() => testMessageRemove(user2.token, message2.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessageRemove(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Dm Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessageRemove(user2.token, message2.messageId)).toThrow(Error);
  });

  test('User: User is a GlobalOwner but not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const channel2 = testChannelsCreate(user2.token, 'Second Channel', true);
    const message2 = testMessageSend(user2.token, channel2.channelId, 'This message is valid');
    expect(() => testMessageRemove(user1.token, message2.messageId)).toThrow(Error);
  });
});

describe('/message/remove: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
  });

  test('Correct Message Removal (1 -> 0 Messages) by Author but not Owner (Channel)', () => {
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageRemove(user2.token, message.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (1 -> 0 Messages) by Author but not Owner (Dm)', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    expect(testMessageRemove(user2.token, message.messageId)).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (1 -> 0 Messages) by Owner but not Author (Channel)', () => {
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user2.token, channel.channelId, 'This message is valid');
    expect(testMessageRemove(user1.token, message.messageId)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('Correct Message Removal (1 -> 0 Messages) by Owner but not Author (Dm)', () => {
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    expect(testMessageRemove(user1.token, message.messageId)).toStrictEqual({});
    expect(testDmMessages(user1.token, dm.dmId, 0)).toStrictEqual({
      messages: [],
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
    expect(() => testMessageSendDm(user1.token, dm.dmId + 1, 'This message is valid')).toThrow(Error);
  });

  test('Message: Invalid Length of Message (Empty)', () => {
    expect(() => testMessageSendDm(user1.token, dm.dmId, '')).toThrow(Error);
  });

  test('Message: Invalid Length of Message (Over 1000 Characters)', () => {
    expect(() => testMessageSendDm(user1.token, dm.dmId, ONE_THOUSAND_CHARS)).toThrow(Error);
  });

  test('Token: Token is Invalid', () => {
    expect(() => testMessageSendDm(user1.token + '1', dm.dmId, 'This message is valid')).toThrow(Error);
  });

  test('Token: Not a Member of the Channel', () => {
    const user2 = testAuthRegister('email@gmail.com', 'alsoapassword', 'Johnny', 'Depp');
    expect(() => testMessageSendDm(user2.token, dm.dmId, 'This message is valid')).toThrow(Error);
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

/** message/pin/v1 Testing **/

describe('message/pin/v1: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Token: Invalid Token', () => {
    expect(() => testMessagePin(user1.token + '1', message.messageId)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessagePin(user1.token, message.messageId + 1)).toThrow(Error);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessagePin(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Dm Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessagePin(user2.token, message2.messageId)).toThrow(Error);
  });

  test('MessageId: Already pinned (Channel)', () => {
    testMessagePin(user1.token, message.messageId);
    expect(() => testMessagePin(user1.token, message.messageId)).toThrow(Error);
  });

  test('MessageId: Already pinned (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    testMessagePin(user1.token, message2.messageId);
    expect(() => testMessagePin(user1.token, message2.messageId)).toThrow(Error);
  });
});

describe('/message/pin/v1: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Correct Message Pin (Channel)', () => {
    expect(testMessagePin(user1.token, message.messageId)).toStrictEqual({});
  });

  test('Correct Message Pin (Dm)', () => {
    const dm: DmCreateReturn = testDmCreate(user1.token, [user2.authUserId]);
    const message2: MessageSendReturn = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');

    expect(testMessagePin(user1.token, message2.messageId)).toStrictEqual({});
  });
});

/** message/unpin/v1 Testing **/

describe('message/unpin/v1: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    testMessagePin(user1.token, message.messageId);
  });

  test('Token: Invalid Token', () => {
    expect(() => testMessageUnPin(user1.token + '1', message.messageId)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessageUnPin(user1.token, message.messageId + 1)).toThrow(Error);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessageUnPin(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Dm Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessageUnPin(user2.token, message2.messageId)).toThrow(Error);
  });

  test('MessageId: Not already pinned (Channel)', () => {
    testMessageUnPin(user1.token, message.messageId);
    expect(() => testMessageUnPin(user1.token, message.messageId)).toThrow(Error);
  });

  test('MessageId: Not already pinned (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessageUnPin(user1.token, message2.messageId)).toThrow(Error);
  });
});

describe('/message/unpin/v1: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    testMessagePin(user1.token, message.messageId);
  });

  test('Correct Message Pin (Channel)', () => {
    expect(testMessageUnPin(user1.token, message.messageId)).toStrictEqual({});
  });

  test('Correct Message Pin (Dm)', () => {
    const dm: DmCreateReturn = testDmCreate(user1.token, [user2.authUserId]);
    const message2: MessageSendReturn = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    testMessagePin(user1.token, message2.messageId);

    expect(testMessageUnPin(user1.token, message2.messageId)).toStrictEqual({});
  });
});

/** message/pin/v1 Testing **/

describe('message/pin/v1: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Token: Invalid Token', () => {
    expect(() => testMessagePin(user1.token + '1', message.messageId)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessagePin(user1.token, message.messageId + 1)).toThrow(Error);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessagePin(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Dm Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessagePin(user2.token, message2.messageId)).toThrow(Error);
  });

  test('MessageId: Already pinned (Channel)', () => {
    testMessagePin(user1.token, message.messageId);
    expect(() => testMessagePin(user1.token, message.messageId)).toThrow(Error);
  });

  test('MessageId: Already pinned (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    testMessagePin(user1.token, message2.messageId);
    expect(() => testMessagePin(user1.token, message2.messageId)).toThrow(Error);
  });
});

describe('/message/pin/v1: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
  });

  test('Correct Message Pin (Channel)', () => {
    expect(testMessagePin(user1.token, message.messageId)).toStrictEqual({});
  });

  test('Correct Message Pin (Dm)', () => {
    const dm: DmCreateReturn = testDmCreate(user1.token, [user2.authUserId]);
    const message2: MessageSendReturn = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');

    expect(testMessagePin(user1.token, message2.messageId)).toStrictEqual({});
  });
});

/** message/unpin/v1 Testing **/

describe('message/unpin/v1: Error Testing', () => {
  let user1: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    testMessagePin(user1.token, message.messageId);
  });

  test('Token: Invalid Token', () => {
    expect(() => testMessageUnPin(user1.token + '1', message.messageId)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessageUnPin(user1.token, message.messageId + 1)).toThrow(Error);
  });

  test('User: User is not Author or Channel Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    expect(() => testMessageUnPin(user2.token, message.messageId)).toThrow(Error);
  });

  test('User: User is not Author or Dm Owner', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessageUnPin(user2.token, message2.messageId)).toThrow(Error);
  });

  test('MessageId: Not already pinned (Channel)', () => {
    testMessageUnPin(user1.token, message.messageId);
    expect(() => testMessageUnPin(user1.token, message.messageId)).toThrow(Error);
  });

  test('MessageId: Not already pinned (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user1.token, [user2.authUserId]);
    const message2 = testMessageSendDm(user1.token, dm.dmId, 'This message is valid');
    expect(() => testMessageUnPin(user1.token, message2.messageId)).toThrow(Error);
  });
});

describe('/message/unpin/v1: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn, channel: ChannelsCreateReturn, message: MessageSendReturn;
  beforeEach(() => {
    user1 = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('email@gmail.com', 'pass1234', 'Bugs', 'Bunny');
    channel = testChannelsCreate(user1.token, 'New Channel', true);
    message = testMessageSend(user1.token, channel.channelId, 'This message is valid');
    testMessagePin(user1.token, message.messageId);
  });

  test('Correct Message Pin (Channel)', () => {
    expect(testMessageUnPin(user1.token, message.messageId)).toStrictEqual({});
  });

  test('Correct Message Pin (Dm)', () => {
    const dm: DmCreateReturn = testDmCreate(user1.token, [user2.authUserId]);
    const message2: MessageSendReturn = testMessageSendDm(user2.token, dm.dmId, 'This message is valid');
    testMessagePin(user1.token, message2.messageId);

    expect(testMessageUnPin(user1.token, message2.messageId)).toStrictEqual({});
  });
});

/** /message/react Testing **/

describe('message/react Error Testing', () => {
  let user: AuthReturn;
  let channel: ChannelsCreateReturn;
  let message: MessageSendReturn;
  beforeEach(() => {
    user = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    channel = testChannelsCreate(user.token, 'test', true);
    message = testMessageSend(user.token, channel.channelId, 'Hi');
  });

  test('Token: Invalid Token', () => {
    expect(() => testMessageReact(user.token + '1', message.messageId, 1)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    expect(() => testMessageReact(user.token, message.messageId + 1, 1)).toThrow(Error);
  });

  test('ReactId: Invalid ReactId', () => {
    expect(() => testMessageReact(user.token, message.messageId, 5)).toThrow(Error);
  });

  test('Invalid React: Already Reacted to Message (Channel)', () => {
    testMessageReact(user.token, message.messageId, 1);
    expect(() => testMessageReact(user.token, message.messageId, 1)).toThrow(Error);
  });

  test('Invalid React: Already Reacted to Message (DM)', () => {
    const dm = testDmCreate(user.token, []);
    testMessageSendDm(user.token, dm.dmId, 'Hi');
    testMessageReact(user.token, message.messageId, 1);
    expect(() => testMessageReact(user.token, message.messageId, 1)).toThrow(Error);
  });

  test('User not in Channel', () => {
    const user2 = testAuthRegister('hello2@gmail.com', 'thisisapassword', 'John2', 'Doe2');
    expect(() => testMessageReact(user2.token, message.messageId, 1)).toThrow(Error);
  });

  test('User not in Dm', () => {
    const dm = testDmCreate(user.token, []);
    const user2 = testAuthRegister('hello2@gmail.com', 'thisisapassword', 'John2', 'Doe2');
    testMessageSendDm(user.token, dm.dmId, 'Hi');
    expect(() => testMessageReact(user2.token, message.messageId, 1)).toThrow(Error);
  });
});

describe('/message/react Return Testing', () => {
  let user: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user = testAuthRegister('hello@gmail.com', 'thisisapassword', 'John', 'Doe');
    user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
  });

  test('Testing success reactId in channel', () => {
    const channel = testChannelsCreate(user.token, 'Channel', true);
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    testChannelJoin(user2.token, channel.channelId);
    expect(testMessageReact(user.token, message.messageId, 1)).toStrictEqual({});
    expect(testMessageReact(user2.token, message.messageId, 1)).toStrictEqual({});
  });

  test('Testing success reactId in dm', () => {
    const dm = testDmCreate(user.token, [user2.authUserId]);
    const message = testMessageSendDm(user.token, dm.dmId, 'Hi');
    expect(testMessageReact(user.token, message.messageId, 1)).toStrictEqual({});
    expect(testMessageReact(user2.token, message.messageId, 1)).toStrictEqual({});
  });
});

/** /message/unreact Testing **/

describe('testing message/unreact', () => {
  let user: AuthReturn;
  let channel: ChannelsCreateReturn;
  beforeEach(() => {
    user = testAuthRegister('cool@hotmail.com', 'password', 'Joe', 'Bloggs');
    channel = testChannelsCreate(user.token, 'Channel', true);
  });

  test('Token: Invalid Token', () => {
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    testMessageReact(user.token, message.messageId, 1);
    expect(() => testMessageUnreact(user.token + '1', message.messageId, 1)).toThrow(Error);
  });

  test('MessageId: Invalid MessageId', () => {
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    testMessageReact(user.token, message.messageId, 1);
    expect(() => testMessageUnreact(user.token, message.messageId + 1, 1)).toThrow(Error);
  });

  test('ReactId: Invalid ReactId (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user.token, [user2.authUserId]);
    const message = testMessageSendDm(user.token, dm.dmId, 'Hi');
    testMessageReact(user2.token, message.messageId, 1);
    expect(() => testMessageUnreact(user2.token, message.messageId, 5)).toThrow(Error);
  });

  test('ReactId: Invalid ReactId (Channel)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    testChannelJoin(user2.token, channel.channelId);
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    testMessageReact(user2.token, message.messageId, 1);
    expect(() => testMessageUnreact(user2.token, message.messageId, 5)).toThrow(Error);
  });

  test('Unreact: Message has not been Reacted to (Channel)', () => {
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    expect(() => testMessageUnreact(user.token, message.messageId, 1)).toThrow(Error);
  });

  test('Unreact: Message has not been Reacted to (Dm)', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user.token, [user2.authUserId]);
    const message = testMessageSendDm(user.token, dm.dmId, 'Hi');
    expect(() => testMessageUnreact(user.token, message.messageId, 1)).toThrow(Error);
  });

  test('User not in Dm', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const dm = testDmCreate(user.token, [user2.authUserId]);
    const message = testMessageSendDm(user.token, dm.dmId, 'Hi');
    expect(() => testMessageUnreact(user2.token, message.messageId, 1)).toThrow(Error);
  });

  test('User not in Channel', () => {
    const user2 = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'James', 'Does');
    const message = testMessageSendDm(user.token, channel.channelId, 'Hi');
    expect(() => testMessageUnreact(user2.token, message.messageId, 1)).toThrow(Error);
  });
});

describe('/message/unreact: Return Testing', () => {
  let user: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    user = testAuthRegister('cool@hotmail.com', 'password', 'Joe', 'Bloggs');
    user2 = testAuthRegister('cool2@gmail.com', 'password', 'Joe1', 'Bloggs1');
  });

  test('Testing success reactId in channel', () => {
    const channel = testChannelsCreate(user.token, 'test', true);
    const message = testMessageSend(user.token, channel.channelId, 'Hi');
    testChannelJoin(user2.token, channel.channelId);
    testMessageReact(user2.token, message.messageId, 1);
    expect(testMessageUnreact(user2.token, message.messageId, 1)).toStrictEqual({});
  });

  test('Testing success reactId in dm', () => {
    const dm = testDmCreate(user.token, [user2.authUserId]);
    const message = testMessageSendDm(user.token, dm.dmId, 'Hi');
    testMessageReact(user2.token, message.messageId, 1);
    expect(testMessageUnreact(user2.token, message.messageId, 1)).toStrictEqual({});
  });
});
