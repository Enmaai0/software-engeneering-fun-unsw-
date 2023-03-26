import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const OK = 200;

const callMessageSend = (token: string, channelId: number, message: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v1',
    {
      json: {
        token: token,
        channelId: channelId,
        message: message,
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
};
// Had this linting error, we had it previously on multiple lines but wouldn't let us pass the linting tests
// 27:3  error  Multiline support is limited to browsers supporting ES5 only  no-multi-str
const ONE_THOUSAND_CHARS = (
  'The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!  Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex. Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! "Now fax quiz Jack!" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump. Joaquin Phoenix was gazed by MTV for luck. A wizards job is to vex chumps quickly in fog. Watch "Jeopardy!", Alex Trebeks fun TV quiz game. Woven silk pyjamas exchanged for blue quartz.'
);

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    { qs: {} }
  );
});

describe('tests for message/send/v1', () => {
  test('success', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid channelId', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId + 1, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, '');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
  test('authUser not a member of the channel', () => {
    const owner = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newId = requestRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
  test('token is invalid', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token + 'invalid', channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
});

const callMessageEdit = (token: string, channelId: number, message: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/message/edit/v1',
    {
      json: {
        token: token,
        messageId: messageId,
        message: message,
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
};

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    { qs: {} }
  );
});

describe('tests for message/edit/v1', () => {
  test('success', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
    const result2 = callChannelMessages(newId.ret.token, channel.ret.channelId, 0);
    expect(result2.ret).toStrictEqual({
      messages: [{
        message: 'This message is changed',
        uId: newId.ret.authUserId,
        messageId: newText.ret.messageId,
        timeSent: expect.any(Number),
      }],
      start: 0,
      end: -1,
    });
  });

  test('invalid messageId', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = callMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = requestRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const newId = requestRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(owner.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token + 'invalid', newText.ret.messageId, 'This is a valid change');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
});

const callMessageRemove = (token: string, messageId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + '/message/remove/v1',
    {
      qs: {
        token: token,
        messageId: messageId,
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
};

describe('tests for message/remove/v1', () => {
  test('success', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
    const result2 = callChannelMessages(newId.ret.token, channel.ret.channelId, 0);
    expect(result2.ret).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('invalid messageId', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This is a change');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid messageId', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This is valid change');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = callMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = requestRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = callMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const newId = requestRegister('hello22@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageRemove(owner.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageRemove(newId.ret.token + 'invalid', newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
});

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    { qs: {} }
  );
});

const callMessageSendDm = (token: string, dmId: number, message: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v1',
    {
      json: {
        token: token,
        dmId: dmId,
        message: message,
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
};

describe('tests for message/senddm/v1', () => {
  test('success', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = callMessageSendDm(newId.ret.token, channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid dmId', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = callMessageSendDm(newId.ret.token, channel.ret.dmId + 1, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = callMessageSendDm(newId.ret.token, channel.ret.dmId, '');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = callMessageSendDm(newId.ret.token, channel.ret.dmId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('authUser not a member of the DM', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, []);
    const result = callMessageSendDm(member.ret.token, channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('token is invalid', () => {
    const newId = requestRegister('hello@gmail.com', 'thisisapassword', 'john', 'doe');
    const member = requestRegister('he11o@gmail.com', 'thisisapassword', 'james', 'does');
    const channel = requestDmCreate(newId.ret.token, [member.ret.authUserId]);
    const result = callMessageSendDm(newId.ret.token + 'invalid', channel.ret.dmId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
});

/// ////////////////////////////////////////////////////////////////////////

function requestChannelJoin(token : string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v2',
    {
      json: {
        token,
        channelId
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
}

function requestRegister(email : string, password : string, nameFirst : string, nameLast : string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );

  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
}

function requestDmCreate(token : string, uIds : number[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v1',
    {
      json: {
        token: token,
        uIds: uIds
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
}

export const callChannelMessages = (token: string, channelId: number, start:number) => {
  const res = request(
    'GET',
    SERVER_URL + '/channel/messages/v2',
    {
      qs: {
        token: token,
        channelId: channelId,
        start: start,
      }
    }
  );
  return {
    ret: JSON.parse(res.body as string),
    status: res.statusCode,
  };
};

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v2',
    {
      json: {
        token,
        name,
        isPublic,
      }
    }
  );
  return {
    ret: JSON.parse(res.getBody() as string),
    status: res.statusCode
  };
}

export { callMessageSend, callMessageEdit, callMessageSendDm, callMessageRemove };
