import request from 'sync-request';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const OK = 200;

const callMessageSend = (token: string, channelId: number, message: string) => {
  const res = request('POST', SERVER_URL + '/message/send/v1', {
    json: {
      token: token,
      channelId: channelId,
      message: message,
    },
  });

  return {
    ret: JSON.parse(res.getBody('utf8')),
    status: res.statusCode,
  };
};

// Had this linting error, we had it previously on multiple lines but wouldn't let us pass the linting tests
// 27:3  error  Multiline support is limited to browsers supporting ES5 only  no-multi-str
// random 100 characters I asked gpt to write.
const ONE_THOUSAND_CHARS =
"As I sit here typing this passage, I can't help but feel a sense of nostalgia wash over me. It's been a long time since I've written something with exactly 1000 characters. In fact, it's been so long that I'm not even sure what to write about. Should I write about the weather? It's sunny outside, with a chance of rain later in the day. Or maybe I should write about my day so far. I woke up early, had breakfast, and went for a walk around the park. It was nice, but nothing out of the ordinary. Perhaps I should write about something more meaningful, like the state of the world. There's so much going on right now, with politics, the environment, and social issues all vying for attention. It can be overwhelming at times, and it's hard to know where to start. But maybe the best thing to do is simply write from my heart, without any particular topic in mind. To let the words flow freely, without worrying about their length or content. To express myself in a way that feels authentic and true."
beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
});


describe('tests for message/send/v1', () => {
  test('success', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid channelId', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId + 1, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, '');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
  test('authUser not a member of the channel', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });
  test('token is invalid', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
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
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
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
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = callMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(owner.ret.token, newText.ret.messageId, 'This message is changed');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
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
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
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
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This is a change');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid messageId', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageEdit(newId.ret.token, newText.ret.messageId + 1, 'This is valid change');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they dont have owner permissions', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newText = callMessageSend(owner.ret.token, channel.ret.channelId, 'This message is valid');
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const result = callMessageRemove(newId.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('message not sent by authUser and they have owner permissions', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    requestChannelJoin(newId.ret.token, channel.ret.channelId);
    const newText = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    const result = callMessageRemove(owner.ret.token, newText.ret.messageId);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({});
  });

  test('token is invalid', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
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

describe('tests for message/send/v1', () => {
  test('success', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ messageId: expect.any(Number) });
  });

  test('invalid channelId', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId + 1, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (under 1 character)', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, '');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid length of message (over 1000 characters)', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, ONE_THOUSAND_CHARS);
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('authUser not a member of the channel', () => {
    const owner = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(owner.ret.token, 'New Channel', true);
    const newId = requestRegister('validemail11@gmail.com', 'pass1234', 'jornet', 'Renzella');
    const result = callMessageSend(newId.ret.token, channel.ret.channelId, 'This message is valid');
    expect(result.status).toBe(OK);
    expect(result.ret).toStrictEqual({ error: expect.any(String) });
  });

  test('token is invalid', () => {
    const newId = requestRegister('validemail@gmail.com', 'pass1234', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(newId.ret.token, 'New Channel', true);
    const result = callMessageSend(newId.ret.token + 'invalid', channel.ret.channelId, 'This message is valid');
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
