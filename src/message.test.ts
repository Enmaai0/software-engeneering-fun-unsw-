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
  testMessageShare,
  testMessageSendLater,
  testMessageSendLaterDm,
  testMessageReact,
  testMessageUnreact,
  testMessagePin,
  testMessageUnpin
} from './testFunctions.ts';
const delay = require('delay');
const ONE_THOUSAND_CHARS = 'a'.repeat(1001);

const OK = 200;

afterEach(() => {
  testClear();
});

beforeEach(() => {
  testClear();
});

describe('tests for message/send/v1', () => {
  test('success', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid channelId', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = testMessageSend(newId.ret.token, channel.ret.channelId + 1, 'This message is valid');
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = testMessageSend(newId.ret.token, channel.ret.channelId, '');
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = testMessageSend(newId.ret.token, channel.ret.channelId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
  test('authUser not a member of the channel', () => {
    const owner = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(owner.ret.token, 'New Channel', true);
    const newId = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const result = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
  test('token is invalid', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = testMessageSend(newId.ret.token + 'invalid', channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('tests for message/edit/v1', () => {
  test('success', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageEdit(newId.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
    const result2 = testChannelMessages(newId.ret.token, channel.ret.channelId, 0);
    expect(result2.ret).toStrictEqual({
      messages: [{
        message: 'This message is changed',
        uId: newId.ret.authUserId,
        messageId: newText.ret.messageId,
        timeSent: expect.any(Number),
        reacts: expect.any(Array),
        isPinned: expect.any(Boolean)
      }],
      start: 0,
      end: -1,
    });
  });

  test('invalid messageId', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This message is changed');
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageEdit(newId.ret.token, newText.ret.messageId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = testMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    testChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = testMessageEdit(newId.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const newId = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testChannelsCreate(owner.ret.token, 'New Channel', true);
    testChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageEdit(owner.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageEdit(newId.ret.token + 'invalid', newText.ret.messageId, 'This is a valid change');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('tests for message/remove/v1', () => {
  test('success', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
    const result2 = testChannelMessages(newId.ret.token, channel.ret.channelId, 0);
    expect(result2.ret).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('success dm', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const dm = testDmCreate(newId.ret.token, [newId.ret.authUserId]);
    const newText = testMessageSendDm(newId.ret.token, dm.ret.dmId, 'This message is valid');
    const result = testMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
    const result2 = testDmMessages(newId.ret.token, dm.ret.dmId, 0);
    expect(result2.ret).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('invalid messageId', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageRemove(newId.ret.token, newText.ret.messageId + 1);
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = testMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    testChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = testMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const newId = testAuthRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testChannelsCreate(owner.ret.token, 'New Channel', true);
    testChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageRemove(owner.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = testChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = testMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = testMessageRemove(newId.ret.token + 'invalid', newText.ret.messageId);
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('tests for message/senddm/v1', () => {
  test('success', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = testMessageSendDm(newId.ret.token, channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid dmId', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = testMessageSendDm(newId.ret.token, channel.ret.dmId + 1, 'This message is valid');
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = testMessageSendDm(newId.ret.token, channel.ret.dmId, '');
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = testMessageSendDm(newId.ret.token, channel.ret.dmId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(400);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('authUser not a member of the DM', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, []);
    const result = testMessageSendDm(member.ret.token, channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const newId = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = testDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = testMessageSendDm(newId.ret.token + 'invalid', channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(403);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('tests for message/react/v1', () => {
  let mainUser;
  let member;
  let newDm;
  let newChannel;
  let channelMessage;
  let dmMessage;
  // Set up channel/dms and messages
  beforeEach(() => {
    testClear();
  });
  test('successful react for channel', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const messageDetails = testChannelMessages(mainUser.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: channelMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test',
      timeSent: expect.any(Number),
      reacts: [{
        reactId: 1,
        uIds: [member.ret.authUserId],
        isThisUserReacted: false
      }],
      isPinned: false
    });
    expect(messageDetails.status).toBe(OK);
  });
  test('successful react for channel(2 different people reacting)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('marcus@gmail.com', 'password', 'marcus', 'sar');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    testChannelJoin(secondmember.ret.token, newChannel.ret.channelId);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const reactedMessage2 = testMessageReact(secondmember.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage2.ret).toStrictEqual({});
    expect(reactedMessage2.status).toBe(OK);
    const messageDetails = testChannelMessages(secondmember.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: channelMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test',
      timeSent: expect.any(Number),
      reacts: [
        {
          reactId: 1,
          uIds: [member.ret.authUserId, secondmember.ret.authUserId],
          isThisUserReacted: true
        }
      ],
      isPinned: false
    });
    expect(messageDetails.status).toBe(OK);
  });
  test('successful react for dm', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const dmMessages = testDmMessages(mainUser.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test2',
      timeSent: expect.any(Number),
      reacts: [{
        reactId: 1,
        uIds: [member.ret.authUserId],
        isThisUserReacted: false
      }],
      isPinned: false
    });
    expect(dmMessages.status).toBe(OK);
  });
  test('successful react for dm(2 people reacting)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('marcus@gmail.com', 'password', 'marcus', 'sar');
    const thirdMember = testAuthRegister('sahar@gmail.com', 'password', 'saharsh', 'sar');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId, secondmember.ret.authUserId, thirdMember.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const reactedMessage2 = testMessageReact(secondmember.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage2.ret).toStrictEqual({});
    expect(reactedMessage2.status).toBe(OK);
    testMessageReact(thirdMember.ret.token, dmMessage.ret.messageId, 1);
    const dmMessages = testDmMessages(mainUser.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test2',
      timeSent: expect.any(Number),
      reacts: [
        {
          reactId: 1,
          uIds: [member.ret.authUserId, secondmember.ret.authUserId, thirdMember.ret.authUserId],
          isThisUserReacted: false
        },
      ],
      isPinned: false
    });
    expect(dmMessages.status).toBe(OK);
  });
  test('unsuccessful react(invalid message id)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId + 500, 1);
    expect(reactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(reactedMessage.status).toBe(400);
  });
  test('unsuccessful react(invalid token)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const invalidToken = mainUser.ret.token + 'invalid';
    const reactedMessage = testMessageReact(invalidToken, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(reactedMessage.status).toBe(403);
  });
  test('unsuccessful react(invalid reactId)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 2);
    expect(reactedMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(reactedMessage.status).toBe(400);
  });
  test('unsuccessful react(double react with same reactId on dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const reactedMessage2 = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(reactedMessage2.status).toBe(400);
  });
  test('unsuccessful react(double react with same reactId on channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    expect(reactedMessage.status).toBe(OK);
    const reactedMessage2 = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(reactedMessage2.status).toBe(400);
  });
  test('unsuccessful react(valid message Id for channel but user not apart of the channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(reactedMessage.status).toBe(400);
  });
  test('unsuccessful react(valid message Id for dm but user not apart of the dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, []);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(reactedMessage.status).toBe(400);
  });
});

describe('tests for message/unreact/v1', () => {
  let mainUser;
  let member;
  let newDm;
  let newChannel;
  let channelMessage;
  let dmMessage;
  // Set up channel/dms and messages
  beforeEach(() => {
    testClear();
  });
  test('successful unreact for channel', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    const unreactedMessage = testMessageUnreact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(unreactedMessage.ret).toStrictEqual({});
    const messageDetails = testChannelMessages(mainUser.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: channelMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test',
      timeSent: expect.any(Number),
      reacts: [{
        reactId: 1,
        uIds: [],
        isThisUserReacted: false
      }],
      isPinned: false
    });
    expect(messageDetails.status).toBe(OK);
  });
  test('successful unreact for dm', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('hi@gmail.com', 'password', 'brandon', 'je');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId, secondmember.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    testMessageReact(secondmember.ret.token, dmMessage.ret.messageId, 1);
    const unreactedMessage = testMessageUnreact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(unreactedMessage.ret).toStrictEqual({});
    const dmMessages = testDmMessages(mainUser.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test2',
      timeSent: expect.any(Number),
      reacts: [{
        reactId: 1,
        uIds: [secondmember.ret.authUserId],
        isThisUserReacted: false
      }],
      isPinned: false
    });
    expect(dmMessages.status).toBe(OK);
  });
  test('successful unreact for dm(multiple users reacting', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const anotherMember = testAuthRegister('john@gmail.com', '12341313', 'hello', 'there');
    const thirdMember = testAuthRegister('helqweqeqwe@gmail.com', '3r43r4r4', 'biggg', 'man');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId, anotherMember.ret.authUserId, thirdMember.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const reactedMessage = testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    testMessageReact(anotherMember.ret.token, dmMessage.ret.messageId, 1);
    testMessageReact(thirdMember.ret.token, dmMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});

    const unreactedMessage = testMessageUnreact(member.ret.token, dmMessage.ret.messageId, 1);
    expect(unreactedMessage.ret).toStrictEqual({});
    const dmMessages = testDmMessages(anotherMember.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: mainUser.ret.authUserId,
      message: 'test2',
      timeSent: expect.any(Number),
      reacts: [{
        reactId: 1,
        uIds: [anotherMember.ret.authUserId, thirdMember.ret.authUserId],
        isThisUserReacted: true
      }],
      isPinned: false
    });
    expect(dmMessages.status).toBe(OK);
  });
  test('unsuccessful react(invalid message id)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    const unreactedMessage = testMessageUnreact(member.ret.token, dmMessage.ret.messageId + 500, 1);
    expect(unreactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(unreactedMessage.status).toBe(400);
  });
  test('unsuccessful unreact(invalid token)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    const invalidToken = member.ret.token + 'invalid';
    const unreactedMessage = testMessageUnreact(invalidToken, dmMessage.ret.messageId, 1);
    expect(unreactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(unreactedMessage.status).toBe(403);
  });
  test('unsuccessful unreact(invalid reactId)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    const unreactedMessage = testMessageUnreact(member.ret.token, dmMessage.ret.messageId, 2);
    expect(unreactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(unreactedMessage.status).toBe(400);
  });
  test('unsuccessful unreact(valid reactId but not made by authorised user dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('davies@gmail.com', 'hellothere', 'alphonso', 'davies');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId, secondmember.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    testMessageReact(member.ret.token, dmMessage.ret.messageId, 1);
    const unreactedMessage = testMessageUnreact(secondmember.ret.token, dmMessage.ret.messageId, 1);
    expect(unreactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(unreactedMessage.status).toBe(400);
  });
  test('unsuccessful unreact(valid reactId but not made by authorised user channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('davies@gmail.com', 'hellothere', 'alphonso', 'davies');
    newChannel = testChannelsCreate(mainUser.ret.token, 'New channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    testChannelJoin(secondmember.ret.token, newChannel.ret.channelId);
    channelMessage = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'test');
    const reactedMessage = testMessageReact(member.ret.token, channelMessage.ret.messageId, 1);
    expect(reactedMessage.ret).toStrictEqual({});
    const unreactedMessage = testMessageUnreact(secondmember.ret.token, channelMessage.ret.messageId, 1);
    expect(unreactedMessage.ret.error).toMatchObject({ message: expect.any(String) });
    expect(unreactedMessage.status).toBe(400);
  });
});

describe('tests for message/pin/v1', () => {
  let mainUser;
  let member;
  let newDm;
  let newChannel;
  let dmMessage;
  beforeEach(() => {
    testClear();
  });
  test('successful pin in a dm with dm owner', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newDm = testDmCreate(secondmember.ret.token, [member.ret.authUserId, mainUser.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'hello');
    // dm owner but not global owner, should work
    const pinMessage = testMessagePin(secondmember.ret.token, dmMessage.ret.messageId);
    expect(pinMessage.ret).toStrictEqual({});
    expect(pinMessage.status).toBe(OK);
    const dmMessages = testDmMessages(secondmember.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: member.ret.authUserId,
      message: 'hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: true
    });
  });
  test('successful pin in a channel with a channel owner', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newChannel = testChannelsCreate(secondmember.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessage = testMessagePin(secondmember.ret.token, message.ret.messageId);
    expect(pinMessage.ret).toStrictEqual({});
    expect(pinMessage.status).toBe(OK);
    const messageDetails = testChannelMessages(secondmember.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: message.ret.messageId,
      uId: member.ret.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: true
    });
  });
  test('unsuccesful pin(already pinned in dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'test2');
    const pinMessage = testMessagePin(mainUser.ret.token, dmMessage.ret.messageId);
    expect(pinMessage.ret).toStrictEqual({});
    expect(pinMessage.status).toBe(OK);
    const pinMessage2 = testMessagePin(mainUser.ret.token, dmMessage.ret.messageId);
    expect(pinMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage2.status).toBe(400);
  });
  test('unsuccesful pin(already pinned in channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('hi@gmail.com', 'password', 'marcus', 'sar');
    newChannel = testChannelsCreate(secondmember.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    testChannelJoin(mainUser.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessageInChannel = testMessagePin(mainUser.ret.token, message.ret.messageId);
    expect(pinMessageInChannel.ret).toStrictEqual({});
    expect(pinMessageInChannel.status).toBe(OK);
    const pinMessage2 = testMessagePin(mainUser.ret.token, message.ret.messageId);
    expect(pinMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage2.status).toBe(400);
  });
  test('unsuccesful pin(message Id not valid in dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'test2');
    const pinMessage2 = testMessagePin(mainUser.ret.token, dmMessage.ret.messageId + 500);
    expect(pinMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage2.status).toBe(400);
  });
  test('unsuccesful pin(message Id not valid in channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('hi@gmail.com', 'password', 'marcus', 'sar');
    newChannel = testChannelsCreate(secondmember.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessageInChannel = testMessagePin(mainUser.ret.token, message.ret.messageId + 500);
    expect(pinMessageInChannel.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessageInChannel.status).toBe(400);
  });
  test('unsuccesful pin(user does not have owner permissions in the dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(mainUser.ret.token, newDm.ret.dmId, 'test2');
    const pinMessage = testMessagePin(member.ret.token, dmMessage.ret.messageId);
    expect(pinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage.status).toBe(403);
  });
  test('unsuccesful pin(user does not have owner permissions in the channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessage = testMessagePin(member.ret.token, message.ret.messageId);
    expect(pinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage.status).toBe(403);
  });
  test('unsuccesful pin(user does not have owner permissions in the dm even if global owner)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newDm = testDmCreate(member.ret.token, [secondmember.ret.authUserId, mainUser.ret.authUserId]);
    dmMessage = testMessageSendDm(secondmember.ret.token, newDm.ret.dmId, 'test2');
    const pinMessage = testMessagePin(mainUser.ret.token, dmMessage.ret.messageId);
    expect(pinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage.status).toBe(403);
  });
  test('unsuccessful pin(invalid token)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(member.ret.token, 'new channel', true);
    testChannelJoin(mainUser.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(mainUser.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessage = testMessagePin(member.ret.token + 'invalid', message.ret.messageId);
    expect(pinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage.status).toBe(403);
  });
  test('successful pin(user is a global owner in a channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(member.ret.token, 'new channel', true);
    testChannelJoin(mainUser.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessage = testMessagePin(mainUser.ret.token, message.ret.messageId);
    expect(pinMessage.ret).toStrictEqual({});
    expect(pinMessage.status).toBe(OK);
    const messageDetails = testChannelMessages(member.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: message.ret.messageId,
      uId: member.ret.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: true
    });
  });
});

describe('tests for message/unpin/v1', () => {
  let mainUser;
  let member;
  let newDm;
  let newChannel;
  let dmMessage;
  beforeEach(() => {
    testClear();
  });
  test('successful unpin in a dm with dm owner', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newDm = testDmCreate(secondmember.ret.token, [member.ret.authUserId, mainUser.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'hello');

    testMessagePin(secondmember.ret.token, dmMessage.ret.messageId);
    const unpinMessage = testMessageUnpin(secondmember.ret.token, dmMessage.ret.messageId);

    expect(unpinMessage.ret).toStrictEqual({});
    expect(unpinMessage.status).toBe(OK);
    const dmMessages = testDmMessages(secondmember.ret.token, newDm.ret.dmId, 0);
    expect(dmMessages.ret.messages[0]).toMatchObject({
      messageId: dmMessage.ret.messageId,
      uId: member.ret.authUserId,
      message: 'hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: false
    });
  });
  test('successful unpin in a channel with a channel owner', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newChannel = testChannelsCreate(secondmember.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');

    testMessagePin(secondmember.ret.token, message.ret.messageId);
    const unpinMessage = testMessageUnpin(secondmember.ret.token, message.ret.messageId);

    expect(unpinMessage.ret).toStrictEqual({});
    expect(unpinMessage.status).toBe(OK);
    const messageDetails = testChannelMessages(secondmember.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: message.ret.messageId,
      uId: member.ret.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: false
    });
  });
  test('unsuccesful unpin(not pinned already in dm )', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'test2');
    const pinMessage2 = testMessageUnpin(mainUser.ret.token, dmMessage.ret.messageId);
    expect(pinMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage2.status).toBe(400);
  });
  test('unsuccesful unpin(not pinned already in channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    const pinMessage2 = testMessageUnpin(mainUser.ret.token, message.ret.messageId);
    expect(pinMessage2.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(pinMessage2.status).toBe(400);
  });
  test('unsuccesful unpin(message Id not valid in dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId]);
    dmMessage = testMessageSendDm(member.ret.token, newDm.ret.dmId, 'test2');
    testMessagePin(mainUser.ret.token, dmMessage.ret.messageId);
    const unpinMessage = testMessageUnpin(mainUser.ret.token, dmMessage.ret.messageId + 500);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(400);
  });
  test('unsuccesful unpin(message Id not valid in channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    newChannel = testChannelsCreate(mainUser.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    testMessagePin(mainUser.ret.token, message.ret.messageId);
    const unpinMessage = testMessageUnpin(mainUser.ret.token, message.ret.messageId + 500);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(400);
  });
  test('unsuccesful unpin(user does not have owner permissions in the dm)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newDm = testDmCreate(mainUser.ret.token, [member.ret.authUserId, secondmember.ret.authUserId]);
    dmMessage = testMessageSendDm(secondmember.ret.token, newDm.ret.dmId, 'test2');
    testMessagePin(mainUser.ret.token, dmMessage.ret.messageId);
    const unpinMessage = testMessageUnpin(secondmember.ret.token, dmMessage.ret.messageId);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(403);
  });
  test('unsuccesful unpin(user does not have owner permissions in the channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newChannel = testChannelsCreate(mainUser.ret.token, 'new channel', true);
    testChannelJoin(member.ret.token, newChannel.ret.channelId);
    testChannelJoin(secondmember.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(member.ret.token, newChannel.ret.channelId, 'Hello');
    testMessagePin(mainUser.ret.token, message.ret.messageId);
    const unpinMessage = testMessageUnpin(secondmember.ret.token, message.ret.messageId);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(403);
  });
  test('unsuccesful unpin(user does not have owner permissions in the dm even if global owner)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newDm = testDmCreate(member.ret.token, [secondmember.ret.authUserId, mainUser.ret.authUserId]);
    dmMessage = testMessageSendDm(secondmember.ret.token, newDm.ret.dmId, 'test2');
    testMessagePin(member.ret.token, dmMessage.ret.messageId);
    const unpinMessage = testMessageUnpin(mainUser.ret.token, dmMessage.ret.messageId);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(403);
  });
  test('unsuccessful unpin(invalid token)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newChannel = testChannelsCreate(member.ret.token, 'new channel', true);
    testChannelJoin(mainUser.ret.token, newChannel.ret.channelId);
    testChannelJoin(secondmember.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(secondmember.ret.token, newChannel.ret.channelId, 'Hello');
    testMessagePin(member.ret.token, message.ret.messageId);
    const unpinMessage = testMessageUnpin(member.ret.token + 'invalid', message.ret.messageId);
    expect(unpinMessage.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(unpinMessage.status).toBe(403);
  });
  test('successful unpin(user is a global owner in a channel)', () => {
    mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    member = testAuthRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const secondmember = testAuthRegister('yello@gmail.com', 'password', 'johnny', 'depp');
    newChannel = testChannelsCreate(member.ret.token, 'new channel', true);
    testChannelJoin(mainUser.ret.token, newChannel.ret.channelId);
    testChannelJoin(secondmember.ret.token, newChannel.ret.channelId);
    const message = testMessageSend(secondmember.ret.token, newChannel.ret.channelId, 'Hello');
    testMessagePin(member.ret.token, message.ret.messageId);
    const unpinMessage = testMessageUnpin(mainUser.ret.token, message.ret.messageId);
    expect(unpinMessage.ret).toStrictEqual({});
    expect(unpinMessage.status).toBe(OK);
    const messageDetails = testChannelMessages(secondmember.ret.token, newChannel.ret.channelId, 0);
    expect(messageDetails.ret.messages[0]).toMatchObject({
      messageId: message.ret.messageId,
      uId: secondmember.ret.authUserId,
      message: 'Hello',
      timeSent: expect.any(Number),
      reacts: expect.any(Array),
      isPinned: false
    });
  });
});

describe('message/share/v1 tests', () => {
  describe('success cases message share', () => {
    test('share to channel', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(token, 'New Channel', true);
      const channelId = channel.ret.channelId;
      const messageChannel = testMessageSend(token, channelId, 'This message is valid');
      const messageIdChannel = messageChannel.ret.messageId;

      const result = testMessageShare(token, messageIdChannel, 'This is valid', channelId, -1);
      expect(result.ret).toStrictEqual({
        sharedMessageId: expect.any(Number),
      });
      expect(result.status).toBe(OK);
      const result2 = testChannelMessages(token, messageIdChannel, 0);
      expect(result2.ret).toStrictEqual({
        messages: [
          {
            messageId: result.ret.sharedMessageId,
            uId: mainUser.ret.authUserId,
            message: 'This message is valid This is valid',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false
            }],
            isPinned: false
          },
          {
            messageId: messageIdChannel,
            uId: mainUser.ret.authUserId,
            message: 'This message is valid',
            timeSent: expect.any(Number),
            reacts: [{
              reactId: 1,
              uIds: [],
              isThisUserReacted: false
            }],
            isPinned: false
          }
        ],
        start: 0,
        end: -1,
      });
    });

    test('share to dm', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const dm = testDmCreate(mainUser.ret.token, []);
      const dmId = dm.ret.dmId;
      const messageDm = testMessageSendDm(mainUser.ret.token, dm.ret.dmId, 'This message is valid');
      const messageIdDm = messageDm.ret.messageId;

      const result = testMessageShare(token, messageIdDm, 'This is valid', -1, dmId);
      expect(result.ret).toStrictEqual({
        sharedMessageId: expect.any(Number),
      });
      expect(result.status).toBe(OK);
    });
  });

  describe('invalid channel/dm id', () => {
    test('channelId invalid', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
      const channelId = channel.ret.channelId;
      const messageChannel = testMessageSend(mainUser.ret.token, channel.ret.channelId, 'This message is valid');
      const messageIdChannel = messageChannel.ret.messageId;

      const result = testMessageShare(token, messageIdChannel, 'This is valid', channelId + 1, -1);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });

    test('dmId Invalid', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const dm = testDmCreate(mainUser.ret.token, []);
      const dmId = dm.ret.dmId;
      const messageDm = testMessageSendDm(mainUser.ret.token, dm.ret.dmId, 'This message is valid');
      const messageIdDm = messageDm.ret.messageId;

      const result = testMessageShare(token, messageIdDm, 'This is valid', -1, dmId + 1);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });

    test('neither dmId and channelId are -1', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
      const channelId = channel.ret.channelId;
      const dm = testDmCreate(mainUser.ret.token, []);
      const dmId = dm.ret.dmId;
      const messageChannel = testMessageSend(mainUser.ret.token, channel.ret.channelId, 'This message is valid');
      const messageIdChannel = messageChannel.ret.messageId;

      const result = testMessageShare(token, messageIdChannel, 'This is valid', channelId, dmId);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });

    test('both dmId and channelId are -1', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
      const channelId = channel.ret.channelId;
      const messageChannel = testMessageSend(mainUser.ret.token, channelId, 'This message is valid');
      const messageIdChannel = messageChannel.ret.messageId;

      const result = testMessageShare(token, messageIdChannel, 'This is valid', -1, -1);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });
  });

  test('ogMessageId is invalid', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
    const channelId = channel.ret.channelId;
    const messageChannel = testMessageSend(mainUser.ret.token, channel.ret.channelId, 'This message is valid');
    const messageIdChannel = messageChannel.ret.messageId;

    const result = testMessageShare(token, messageIdChannel + 1, 'This is valid', channelId, -1);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(400);
  });

  test('optional message length more than 1000 characters', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const channel = testChannelsCreate(token, 'New Channel', true);
    const channelId = channel.ret.channelId;
    const messageChannel = testMessageSend(token, channelId, 'This message is valid');
    const messageIdChannel = messageChannel.ret.messageId;

    const result = testMessageShare(token, messageIdChannel, ONE_THOUSAND_CHARS, channelId, -1);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(400);
  });

  describe('user is not in given channel/dm', () => {
    test('user not in channel', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const secondUser = testAuthRegister('hello1@gmail.com', 'thisisapassword', 'max', 'planck');
      const otherToken = secondUser.ret.token;
      const channel = testChannelsCreate(token, 'New Channel', true);
      const channelId = channel.ret.channelId;
      const messageChannel = testMessageSend(token, channel.ret.channelId, 'This message is valid');
      const messageIdChannel = messageChannel.ret.messageId;

      const result = testMessageShare(otherToken, messageIdChannel, 'This is valid', channelId, -1);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(403);
    });

    test('user not in dm', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const secondUser = testAuthRegister('hello1@gmail.com', 'thisisapassword', 'max', 'planck');
      const otherToken = secondUser.ret.token;
      const dm = testDmCreate(token, []);
      const dmId = dm.ret.dmId;
      const messageDm = testMessageSendDm(token, dm.ret.dmId, 'This message is valid');
      const messageIdDm = messageDm.ret.messageId;

      const result = testMessageShare(otherToken, messageIdDm, 'This is valid', -1, dmId);
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(403);
    });
  });

  test('token is invalid', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const invalid = token + 'invalid';
    const channel = testChannelsCreate(token, 'New Channel', true);
    const channelId = channel.ret.channelId;
    const messageChannel = testMessageSend(token, channel.ret.channelId, 'This message is valid');
    const messageIdChannel = messageChannel.ret.messageId;

    const result = testMessageShare(invalid, messageIdChannel, 'This is valid', channelId, -1);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(403);
  });
});

describe('tests for message/sendlater/v1', () => {
  test('sendlater success', async () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const channel = testChannelsCreate(token, 'New Channel', true);
    const channelId = channel.ret.channelId;

    const message = testMessageSendLater(token, channelId, 'this is a valid message', Math.floor(Date.now() / 1000) + 3);
    const initial = testChannelMessages(token, channelId, 0);
    expect(initial.ret).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    await delay(3000);

    const final = testChannelMessages(token, channelId, 0);
    expect(final.ret).toStrictEqual({
      messages: [
        {
          messageId: message.ret.messageId,
          uId: mainUser.ret.authUserId,
          message: 'this is a valid message',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
  }, 5000);

  test('channelId invalid', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
    const channelId = channel.ret.channelId;

    const result = testMessageSendLater(token, channelId + 1, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: 'invalid channel' });
    expect(result.status).toBe(400);
  });

  describe('invalid message length', () => {
    test('less than 1 character', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
      const channelId = channel.ret.channelId;

      const result = testMessageSendLater(token, channelId, '', Math.floor(Date.now() / 1000) + 3);
      expect(result.ret.error).toStrictEqual({ message: 'invalid message length' });
      expect(result.status).toBe(400);
    });

    test('more than 1000 character', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
      const channelId = channel.ret.channelId;

      const result = testMessageSendLater(token, channelId, ONE_THOUSAND_CHARS, Math.floor(Date.now() / 1000) + 3);
      expect(result.ret.error).toStrictEqual({ message: 'invalid message length' });
      expect(result.status).toBe(400);
    });
  });

  test('channel timeSent past', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const channel = testChannelsCreate(token, 'New Channel', true);
    const channelId = channel.ret.channelId;

    const result = testMessageSendLater(token, channelId, 'this is a valid message', Math.floor(Date.now() / 1000) - 10);
    expect(result.ret.error).toStrictEqual({ message: 'time sent is in the past' });
    expect(result.status).toBe(400);
  });

  test('channelId is valid and authUser is not a member', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const secondUser = testAuthRegister('hello1@gmail.com', 'thisisapassword', 'max', 'planck');
    const otherToken = secondUser.ret.token;
    const channel = testChannelsCreate(token, 'New Channel', true);
    const channelId = channel.ret.channelId;

    const result = testMessageSendLater(otherToken, channelId, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: 'authUser is not a member of this channel' });
    expect(result.status).toBe(403);
  });

  test('invalid token', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const invalid = token + 'invalid';
    const channel = testChannelsCreate(mainUser.ret.token, 'New Channel', true);
    const channelId = channel.ret.channelId;

    const result = testMessageSendLater(invalid, channelId, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: 'token is not valid' });
    expect(result.status).toBe(403);
  });
});

describe('tests for message/sendlaterdm/v1', () => {
  test('sendlaterdm success', async () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const dm = testDmCreate(mainUser.ret.token, []);
    const dmId = dm.ret.dmId;

    const message = testMessageSendLaterDm(token, dmId, 'this is a valid message', Math.floor(Date.now() / 1000) + 3);
    const initial = testDmMessages(token, dmId, 0);
    expect(initial.ret).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    await delay(3000);

    const final = testDmMessages(token, dmId, 0);
    expect(final.ret).toStrictEqual({
      messages: [
        {
          messageId: message.ret.messageId,
          uId: mainUser.ret.authUserId,
          message: 'this is a valid message',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
  }, 5000);

  test('dmId invalid', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const dm = testDmCreate(mainUser.ret.token, []);
    const dmId = dm.ret.dmId;

    const result = testMessageSendLaterDm(token, dmId + 1, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(400);
  });

  describe('invalid message length', () => {
    test('less than 1 character', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const dm = testDmCreate(mainUser.ret.token, []);
      const dmId = dm.ret.dmId;

      const result = testMessageSendLaterDm(token, dmId, '', Math.floor(Date.now() / 1000));
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });

    test('more than 1000 character', () => {
      const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
      const token = mainUser.ret.token;
      const dm = testDmCreate(mainUser.ret.token, []);
      const dmId = dm.ret.dmId;

      const result = testMessageSendLaterDm(token, dmId, ONE_THOUSAND_CHARS, Math.floor(Date.now() / 1000));
      expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
      expect(result.status).toBe(400);
    });
  });

  test('timeSent is in the past', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const dm = testDmCreate(token, []);
    const dmId = dm.ret.dmId;

    const result = testMessageSendLaterDm(token, dmId, 'this is a valid message', Math.floor(Date.now() / 1000) - 10);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(400);
  });

  test('dmId is valid and authUser is not a member', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const secondUser = testAuthRegister('hello1@gmail.com', 'thisisapassword', 'max', 'planck');
    const otherToken = secondUser.ret.token;
    const dm = testDmCreate(token, []);
    const dmId = dm.ret.dmId;

    const result = testMessageSendLaterDm(otherToken, dmId, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(403);
  });

  test('invalid token', () => {
    const mainUser = testAuthRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const token = mainUser.ret.token;
    const invalid = token + 'invalid';
    const dm = testDmCreate(mainUser.ret.token, []);
    const dmId = dm.ret.dmId;

    const result = testMessageSendLaterDm(invalid, dmId, 'this is a valid message', Math.floor(Date.now() / 1000) + 5);
    expect(result.ret.error).toStrictEqual({ message: expect.any(String) });
    expect(result.status).toBe(403);
  });
});
