/**
 * dm.test.ts
 * Contains the jest testing designed for dm.ts that utilises
 * the HTTP routes created to test funcionality
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testAuthRegister } from './auth.test';
import { testMessageSendDm } from './message';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface DmId {
  dmId: number;
}

beforeEach(() => {
  testClear();
});

/** /dm/create/v1 Testing **/

function testDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v1`,
    {
      json: {
        token,
        uIds
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/create: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  let testUser2: AuthRegisterReturn;
  let testUser3: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testUser2 = testAuthRegister('secondemail@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Token: Invalid Token', () => {
    expect(testDmCreate(testUser1.token + 'a', [testUser2.authUserId])).toStrictEqual(ERROR);
  });

  test('uIds: Duplicate uIds', () => {
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId, testUser2.authUserId])).toStrictEqual(ERROR);
  });

  test('uIds: Invalid uIds (Only Invalid)', () => {
    expect(testDmCreate(testUser1.token, [testUser2.authUserId + 1])).toStrictEqual(ERROR);
  });

  test('uIds: Invalid uIds (Mixed Invalid)', () => {
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId + 1])).toStrictEqual(ERROR);
  });
});

describe('/dm/create: Return Testing', () => {
  let testUser1: AuthRegisterReturn;
  let testUser2: AuthRegisterReturn;
  let testUser3: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testUser2 = testAuthRegister('secondemail@gmail.com', 'pass1234', 'Test', 'Bot II');
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
  });

  test('Correct Return: 1 to 1 Dm', () => {
    expect(testDmCreate(testUser1.token, [testUser2.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('Correct Return: 3 Person Dm', () => {
    expect(testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
  });

  test('Correct Return: Someone Else Making Dm', () => {
    expect(testDmCreate(testUser2.token, [testUser3.authUserId, testUser1.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
  });
});

describe('/dm/create: dmName Testing', () => {
  test('Correct Return: Just Owner', () => {
    const testUser1 = testAuthRegister('LonelyGuy@gmail.com', 'pass1234', 'Lonely', 'Guy');
    expect(testUser1).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDm).toStrictEqual({ dmId: expect.any(Number) });
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual({
      name: 'lonelyguy',
      members: [{
        uId: testUser1.authUserId,
        email: 'LonelyGuy@gmail.com',
        nameFirst: 'Lonely',
        nameLast: 'Guy',
        handleStr: 'lonelyguy'
      }]
    });
  });

  test('Correct Return: Just Letters', () => {
    const testUser1 = testAuthRegister('a@gmail.com', 'pass1234', 'a', 'a');
    const testUser2 = testAuthRegister('b@gmail.com', 'pass1234', 'a', 'b');
    const testUser3 = testAuthRegister('c@gmail.com', 'pass1234', 'b', 'a');
    const testDm = testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId]);
    const testDmDetail = testDmDetails(testUser1.token, testDm.dmId);
    expect(testDmDetail.name).toStrictEqual('aa, ab, ba');
  });

  test('Correct Return: Longer Names', () => {
    const testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser2 = testAuthRegister('secondemail@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    const testDm = testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId]);
    const testDmDetail = testDmDetails(testUser1.token, testDm.dmId);
    expect(testDmDetail.name).toStrictEqual('testbot, testbotii, testbotiii');
  });
});

/** /dm/list/v1 Testing **/

function testDmList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/dm/list/v1`,
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/list: Error Testing', () => {
  test('Token: Invalid Token', () => {
    const user1 = testAuthRegister('potato@gmail.com', 'potatopotato', 'Simple', 'Spud');
    expect(testDmList(user1.token + '1')).toStrictEqual(ERROR);
  });
});

describe('/dm/list: Return Testing', () => {
  let user1: AuthRegisterReturn, user2: AuthRegisterReturn;
  beforeEach(() => {
    user1 = testAuthRegister('potato@gmail.com', 'humblepotato', 'Simple', 'Spud');
    user2 = testAuthRegister('carrot@gmail.com', 'carrotarebetter', 'Chad', 'Carrot');
  });

  test('No Dms', () => {
    expect(testDmList(user1.token)).toStrictEqual({ dms: [] });
  });

  test('One Dm (Is Owner)', () => {
    const testDm = testDmCreate(user1.token, [user2.authUserId]);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: testDm.dmId,
        name: 'chadcarrot, simplespud'
      }]
    });
  });

  test('One Dm (Is Member)', () => {
    const testDm = testDmCreate(user1.token, [user2.authUserId]);
    expect(testDmList(user2.token)).toStrictEqual({
      dms: [{
        dmId: testDm.dmId,
        name: 'chadcarrot, simplespud'
      }]
    });
  });

  test('Multiple Dms (Member of All)', () => {
    const testDm1 = testDmCreate(user1.token, [user2.authUserId]);
    const testDm2 = testDmCreate(user2.token, [user1.authUserId]);
    const testDm3 = testDmCreate(user1.token, []);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: testDm1.dmId,
        name: 'chadcarrot, simplespud'
      }, {
        dmId: testDm2.dmId,
        name: 'chadcarrot, simplespud'
      }, {
        dmId: testDm3.dmId,
        name: 'simplespud'
      }]
    });
  });

  test('Multiple Dms (Member of 2, Not a Member of 1)', () => {
    const testDm1 = testDmCreate(user1.token, [user2.authUserId]);
    const testDm2 = testDmCreate(user2.token, [user1.authUserId]);
    testDmCreate(user2.token, []);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: testDm1.dmId,
        name: 'chadcarrot, simplespud'
      }, {
        dmId: testDm2.dmId,
        name: 'chadcarrot, simplespud'
      }]
    });
  });

  test('Multiple Dms (Not a Member of All)', () => {
    const user3 = testAuthRegister('meow@gmail.com', 'ILoveYarn123', 'Orange', 'Cat');
    testDmCreate(user3.token, [user2.authUserId]);
    testDmCreate(user2.token, [user3.authUserId]);
    testDmCreate(user2.token, []);
    expect(testDmList(user1.token)).toStrictEqual({ dms: [] });
  });
});

/** /dm/remove/v1 Testing **/

function testDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v1`,
    {
      qs: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/remove: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmRemove(testUser1.token + '1', testDm.dmId)).toStrictEqual(ERROR);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmRemove(testUser1.token, testDm.dmId + 1)).toStrictEqual(ERROR);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmLeave(testUser1.token, testDm.dmId)).toStrictEqual({});
    expect(testDmRemove(testUser1.token, testDm.dmId)).toStrictEqual(ERROR);
  });

  test('DmId: User is not the Dm owner', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmRemove(testUser2.token, testDm.dmId)).toStrictEqual(ERROR);
  });
});

describe('/dm/remove: Deletion Testing', () => {
  let testUser1: AuthRegisterReturn, testUser2: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Remove Only Dm', () => {
    const testDm1 = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmRemove(testUser1.token, testDm1.dmId)).toStrictEqual({});
    expect(testDmList(testUser1.token)).toStrictEqual({ dms: [] });
  });

  test('Remove One Dm with Multiple Dms', () => {
    const testDm1 = testDmCreate(testUser1.token, [testUser2.authUserId]);
    const testDm2 = testDmCreate(testUser2.token, [testUser1.authUserId]);
    const testDm3 = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmRemove(testUser2.token, testDm2.dmId)).toStrictEqual({});
    expect(testDmList(testUser1.token)).toStrictEqual({
      dms: [{
        dmId: testDm1.dmId,
        name: expect.any(String)
      }, {
        dmId: testDm3.dmId,
        name: expect.any(String)
      }]
    });
    expect(testDmList(testUser2.token)).toStrictEqual({
      dms: [{
        dmId: testDm1.dmId,
        name: expect.any(String)
      }, {
        dmId: testDm3.dmId,
        name: expect.any(String)
      }]
    });
  });
});

/** /dm/details/v1 Testing **/

function testDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v1`,
    {
      qs: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/details: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmDetails(testUser1.token + '1', testDm.dmId)).toStrictEqual(ERROR);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmDetails(testUser1.token, testDm.dmId + 1)).toStrictEqual(ERROR);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmDetails(testUser2.token, testDm.dmId)).toStrictEqual(ERROR);
  });
});

describe('/dm/details: Return Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Only owner in Dm', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual({
      name: 'testbot',
      members: [{
        uId: testUser1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }]
    });
  });

  test('Multiple Members in Dm', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId]);
    expect(testDmDetails(testUser3.token, testDm.dmId)).toStrictEqual({
      name: 'testbot, testbot0, testbot1',
      members: [{
        uId: testUser1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }, {
        uId: testUser2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0'
      }, {
        uId: testUser3.authUserId,
        email: 'email3@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot1'
      }]
    });
  });

  test('Multiple Members in Dm but a Member Leaves', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId]);
    testDmLeave(testUser3.token, testDm.dmId);
    expect(testDmDetails(testUser2.token, testDm.dmId)).toStrictEqual({
      name: 'testbot, testbot0, testbot1',
      members: [{
        uId: testUser1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }, {
        uId: testUser2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0'
      }]
    });
  });
});

/** /dm/leave/v1 Testing **/

function testDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v1`,
    {
      json: {
        token,
        dmId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/leave: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmLeave(testUser1.token + '1', testDm.dmId)).toStrictEqual(ERROR);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmLeave(testUser1.token, testDm.dmId + 1)).toStrictEqual(ERROR);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmLeave(testUser2.token, testDm.dmId)).toStrictEqual(ERROR);
  });
});

describe('/dm/leave: User Left Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Owner Leaves Dm (Only Owner in Dm)', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmLeave(testUser1.token, testDm.dmId)).toStrictEqual({});
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual(ERROR);
  });

  test('Owner Leaves Dm (Multiple Members in Dm)', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId]);
    expect(testDmLeave(testUser1.token, testDm.dmId)).toStrictEqual({});
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual(ERROR);
    expect(testDmDetails(testUser2.token, testDm.dmId)).toStrictEqual({
      name: 'testbot, testbot0, testbot1',
      members: [{
        uId: testUser2.authUserId,
        email: 'email2@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot0'
      }, {
        uId: testUser3.authUserId,
        email: 'email3@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot1'
      }]
    });
  });

  test('One Member Leaves Dm', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmLeave(testUser2.token, testDm.dmId)).toStrictEqual({});
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual({
      name: 'testbot, testbot0',
      members: [{
        uId: testUser1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }]
    });
  });

  test('Multiple Members Leave Dm', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId]);
    expect(testDmLeave(testUser2.token, testDm.dmId)).toStrictEqual({});
    expect(testDmLeave(testUser3.token, testDm.dmId)).toStrictEqual({});
    expect(testDmDetails(testUser1.token, testDm.dmId)).toStrictEqual({
      name: 'testbot, testbot0, testbot1',
      members: [{
        uId: testUser1.authUserId,
        email: 'email@gmail.com',
        nameFirst: 'Test',
        nameLast: 'Bot',
        handleStr: 'testbot'
      }]
    });
  });
});

/** /dm/messages/v1 Testing **/

function testDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v1`,
    {
      qs: {
        token,
        dmId,
        start
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/dm/messages: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmMessages(testUser1.token + '1', testDm.dmId, 0)).toStrictEqual(ERROR);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmMessages(testUser1.token, testDm.dmId + 1, 0)).toStrictEqual(ERROR);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmMessages(testUser2.token, testDm.dmId, 0)).toStrictEqual(ERROR);
  });

  test('Start: Start is Greater than Messages', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(testDmMessages(testUser1.token, testDm.dmId, 100)).toStrictEqual(ERROR);
  });
});

describe('/dm/messages: Return Testing', () => {
  let testUser1: AuthRegisterReturn, testUser2: AuthRegisterReturn;
  let testDm: DmId;
  beforeEach(() => {
    testUser1 = testAuthRegister('orangecat@gmail.com', 'ball0fYarn', 'Orange', 'Cat');
    testUser2 = testAuthRegister('browncat@gmail.com', 'L0vingFish', 'Brown', 'Cat');
    testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
  });

  test('Dm with no Messages', () => {
    expect(testDmMessages(testUser1.token, testDm.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      finish: -1
    });
  });

  test('Dm with Single Message', () => {
    const testMessage = testMessageSendDm(testUser1.token, testDm.dmId, 'One Message');
    expect(testDmMessages(testUser1.token, testDm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: testMessage.messageId,
        uId: testUser1.authUserId,
        message: 'One Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      finish: -1
    });
  });

  test('Dm with Multiple Messages', () => {
    const testMessage1 = testMessageSendDm(testUser1.token, testDm.dmId, 'First Message');
    const testMessage2 = testMessageSendDm(testUser1.token, testDm.dmId, 'Second Message');
    const testMessage3 = testMessageSendDm(testUser1.token, testDm.dmId, 'Third Message');
    expect(testDmMessages(testUser1.token, testDm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: testMessage1.messageId,
        uId: testUser1.authUserId,
        message: 'First Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage2.messageId,
        uId: testUser1.authUserId,
        message: 'Second Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage3.messageId,
        uId: testUser1.authUserId,
        message: 'Third Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      finish: -1
    });
  });

  test('Dm (75 Messages) Start = 0', () => {
    for (let i = 0; i < 75; i++) {
      testMessageSendDm(testUser1.token, testDm.dmId, String(i));
    }

    const testMessages = testDmMessages(testUser1.token, testDm.dmId, 0);
    expect(testMessages.start).toStrictEqual(0);
    expect(testMessages.end).toStrictEqual(50);
    expect(testMessages.messages.length).toStrictEqual(50);
    expect(testMessages.messages[49]).toStrictEqual({
      messageId: 49,
      uId: testUser1.authUserId,
      message: '49',
      timeSent: expect.any(Number)
    });
    expect(testMessages.messages[0]).toStrictEqual({
      messageId: 0,
      uId: testUser1.authUserId,
      message: '0',
      timeSent: expect.any(Number)
    });
  });

  test('Dm (75 Messages) Start = 25', () => {
    for (let i = 0; i < 75; i++) {
      testMessageSendDm(testUser1.token, testDm.dmId, String(i));
    }

    const testMessages = testDmMessages(testUser1.token, testDm.dmId, 25);
    expect(testMessages.start).toStrictEqual(25);
    expect(testMessages.end).toStrictEqual(75);
    expect(testMessages.messages.length).toStrictEqual(50);
    expect(testMessages.messages[49]).toStrictEqual({
      messageId: 74,
      uId: testUser1.authUserId,
      message: '74',
      timeSent: expect.any(Number)
    });
    expect(testMessages.messages[0]).toStrictEqual({
      messageId: 25,
      uId: testUser1.authUserId,
      message: '25',
      timeSent: expect.any(Number)
    });
  });

  test('Dm (75 Messages) Start = 50', () => {
    for (let i = 0; i < 75; i++) {
      testMessageSendDm(testUser1.token, testDm.dmId, String(i));
    }

    const testMessages = testDmMessages(testUser1.token, testDm.dmId, 50);
    expect(testMessages.start).toStrictEqual(50);
    expect(testMessages.end).toStrictEqual(-1);
    expect(testMessages.messages.length).toStrictEqual(25);
    expect(testMessages.messages[24]).toStrictEqual({
      messageId: 74,
      uId: testUser1.authUserId,
      message: '74',
      timeSent: expect.any(Number)
    });
    expect(testMessages.messages[0]).toStrictEqual({
      messageId: 50,
      uId: testUser1.authUserId,
      message: '50',
      timeSent: expect.any(Number)
    });
  });

  test('Dm (20 Messages) Start = -40', () => {
    for (let i = 0; i < 20; i++) {
      testMessageSendDm(testUser1.token, testDm.dmId, String(i));
    }

    const testMessages = testDmMessages(testUser1.token, testDm.dmId, -40);
    expect(testMessages.start).toStrictEqual(-40);
    expect(testMessages.end).toStrictEqual(10);
    expect(testMessages.messages.length).toStrictEqual(10);
    expect(testMessages.messages[9]).toStrictEqual({
      messageId: 9,
      uId: testUser1.authUserId,
      message: '9',
      timeSent: expect.any(Number)
    });
    expect(testMessages.messages[0]).toStrictEqual({
      messageId: 0,
      uId: testUser1.authUserId,
      message: '0',
      timeSent: expect.any(Number)
    });
  });

  test('Dm (20 Messages) Start = -20', () => {
    for (let i = 0; i < 20; i++) {
      testMessageSendDm(testUser1.token, testDm.dmId, String(i));
    }

    const testMessages = testDmMessages(testUser1.token, testDm.dmId, -20);
    expect(testMessages.start).toStrictEqual(-20);
    expect(testMessages.end).toStrictEqual(-1);
    expect(testMessages.messages.length).toStrictEqual(20);
    expect(testMessages.messages[19]).toStrictEqual({
      messageId: 19,
      uId: testUser1.authUserId,
      message: '19',
      timeSent: expect.any(Number)
    });
    expect(testMessages.messages[0]).toStrictEqual({
      messageId: 0,
      uId: testUser1.authUserId,
      message: '0',
      timeSent: expect.any(Number)
    });
  });
});

export { testDmCreate, testDmList };
