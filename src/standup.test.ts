/**
 * standup.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /standup/* routes.
 */

import {
  testStandupStart,
  testStandupActive,
  testStandupSend,
  testClear,
  testAuthRegister,
  testChannelsCreate,
  testChannelMessages,
  testChannelJoin,
} from './testFunctions';

const sleep = require('atomic-sleep');

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

/**
 * Clears the dataStore before each test is ran. Ensures that
 * tests do not rely on the results of others to ensure full
 * functionality and correct implementation.
*/
beforeEach(() => {
  testClear();
});

afterAll(() => {
  testClear();
});

/** /standup/start Testing **/

describe('/standup/start: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  const length = 1;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid Token', () => {
    expect(() => testStandupStart(user1.token + 1, channel1.channelId, length)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(() => testStandupStart(user1.token, channel1.channelId + 1, length)).toThrow(Error);
  });

  test('Length: Invalid Length', () => {
    expect(() => testStandupStart(user1.token, channel1.channelId, -1)).toThrow(Error);
  });

  test('Standup: Standup is running', () => {
    testStandupStart(user1.token, channel1.channelId, length);
    expect(() => testStandupStart(user1.token, channel1.channelId, length)).toThrow(Error);
    sleep(1010);
  });

  test('User: User is not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testStandupStart(user2.token, channel1.channelId, length)).toThrow(Error);
  });
});

describe('/standup/start: Success Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  const length = 0.1;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('Success return', () => {
    expect(testStandupStart(user1.token, channel1.channelId, length)).toStrictEqual({ timeFinished: expect.any(Number) });
    sleep(100);
  });
});

/** /standup/active Testing **/

describe('/standup/active: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid Token', () => {
    expect(() => testStandupActive(user1.token + 1, channel1.channelId)).toThrow(Error);
  });

  test('ChannelId: Invalid ChannelId', () => {
    expect(() => testStandupActive(user1.token, channel1.channelId + 1)).toThrow(Error);
  });

  test('User: User is not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(() => testStandupActive(user2.token, channel1.channelId)).toThrow(Error);
  });
});

describe('/standup/active: Success Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('Success: Success Return Not Active', () => {
    expect(testStandupActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: false,
      timeFinished: null,
    });
  });

  test('Success: Success Return Active', () => {
    testStandupStart(user1.token, channel1.channelId, 1);
    expect(testStandupActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: true,
      timeFinished: expect.any(Number),
    });
    sleep(1010);
  });

  test('Success: Success Return not Active after Standup Finished', () => {
    testStandupStart(user1.token, channel1.channelId, 1);
    expect(testStandupActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: true,
      timeFinished: expect.any(Number),
    });
    sleep(1100);
    expect(testStandupActive(user1.token, channel1.channelId)).toStrictEqual({
      isActive: false,
      timeFinished: null,
    });
  });
});

/** /standup/send Testing **/

describe('/standup/send: Error Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  const length = 0.5;
  const message = 'Hello';
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('AuthUserId: Invalid Token', () => {
    testStandupStart(user1.token, channel1.channelId, length);
    expect(() => testStandupSend(user1.token + 1, channel1.channelId, message)).toThrow(Error);
    sleep(510);
  });

  test('ChannelId: Invalid ChannelId', () => {
    testStandupStart(user1.token, channel1.channelId, length);
    expect(() => testStandupSend(user1.token, channel1.channelId + 1, message)).toThrow(Error);
    sleep(510);
  });

  test('Message: Message > 1000 Characters', () => {
    testStandupStart(user1.token, channel1.channelId, length);
    expect(() => testStandupSend(user1.token, channel1.channelId, ONE_THOUSAND_CHARS)).toThrow(Error);
    sleep(510);
  });

  test('No standup has started', () => {
    expect(() => testStandupSend(user1.token, channel1.channelId, message)).toThrow(Error);
  });

  test('User: User is not in Channel', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testStandupStart(user1.token, channel1.channelId, length);
    expect(() => testStandupSend(user2.token, channel1.channelId, message)).toThrow(Error);
    sleep(510);
  });
});

describe('/standup/send: Success Testing', () => {
  let user1: AuthReturn;
  let channel1: ChannelsCreateReturn;
  const message = 'Hello';
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot I');
    channel1 = testChannelsCreate(user1.token, 'channel1', true);
  });

  test('One Standup Message Sent', () => {
    testStandupStart(user1.token, channel1.channelId, 1);
    expect(testStandupSend(user1.token, channel1.channelId, message)).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    sleep(1100);
    expect(testChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: 0,
        uId: user1.authUserId,
        message: 'testboti: Hello\n',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
    sleep(1010);
  });

  test('Two Standup Message Sent', () => {
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    testChannelJoin(user2.token, channel1.channelId);
    testStandupStart(user1.token, channel1.channelId, 1);
    expect(testStandupSend(user1.token, channel1.channelId, message)).toStrictEqual({});
    expect(testStandupSend(user2.token, channel1.channelId, 'Another One')).toStrictEqual({});
    expect(testChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    sleep(1100);
    expect(testChannelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
      messages: [{
        messageId: 0,
        uId: user1.authUserId,
        message: 'testboti: Hello\ntestbotii: Another One\n',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
    sleep(1010);
  });
});
