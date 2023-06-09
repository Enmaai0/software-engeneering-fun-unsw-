/**
 * dm.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /dm/* routes.
 */

import {
  testDmCreate,
  testDmList,
  testDmRemove,
  testDmDetails,
  testDmLeave,
  testDmMessages,
  testClear,
  testAuthRegister,
  testMessageSendDm
} from './testFunctions';

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface DmId {
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

afterAll(() => {
  testClear();
});

/** /dm/create/v1 Testing **/

describe('/dm/create: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  let testUser2: AuthRegisterReturn;
  let testUser3: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testUser2 = testAuthRegister('secondemail@gmail.com', 'pass1234', 'Test', 'Bot II');
  });

  test('Token: Invalid Token', () => {
    expect(() => testDmCreate(testUser1.token + 'a', [testUser2.authUserId])).toThrow(Error);
  });

  test('uIds: Duplicate uIds', () => {
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(() => testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId, testUser2.authUserId])).toThrow(Error);
  });

  test('uIds: Invalid uIds (Only Invalid)', () => {
    expect(() => testDmCreate(testUser1.token, [404])).toThrow(Error);
  });

  test('uIds: Invalid uIds (Mixed Invalid)', () => {
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    expect(() => testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId + 1])).toThrow(Error);
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

describe('/dm/list: Error Testing', () => {
  test('Token: Invalid Token', () => {
    const user1 = testAuthRegister('potato@gmail.com', 'potatopotato', 'Simple', 'Spud');
    expect(() => testDmList(user1.token + '1')).toThrow(Error);
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

describe('/dm/remove: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmRemove(testUser1.token + '1', testDm.dmId)).toThrow(Error);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmRemove(testUser1.token, testDm.dmId + 1)).toThrow(Error);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmLeave(testUser1.token, testDm.dmId)).toStrictEqual({});
    expect(() => testDmRemove(testUser1.token, testDm.dmId)).toThrow(Error);
  });

  test('DmId: User is not the Dm owner', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(() => testDmRemove(testUser2.token, testDm.dmId)).toThrow(Error);
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

describe('/dm/details: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmDetails(testUser1.token + '1', testDm.dmId)).toThrow(Error);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmDetails(testUser1.token, testDm.dmId + 1)).toThrow(Error);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmDetails(testUser2.token, testDm.dmId)).toThrow(Error);
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

describe('/dm/leave: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmLeave(testUser1.token + '1', testDm.dmId)).toThrow(Error);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmLeave(testUser1.token, testDm.dmId + 1)).toThrow(Error);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmLeave(testUser2.token, testDm.dmId)).toThrow(Error);
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
    expect(() => testDmDetails(testUser1.token, testDm.dmId)).toThrow(Error);
  });

  test('Owner Leaves Dm (Multiple Members in Dm)', () => {
    const testUser2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot');
    const testUser3 = testAuthRegister('email3@gmail.com', 'pass1234', 'Test', 'Bot');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId, testUser3.authUserId]);
    expect(testDmLeave(testUser1.token, testDm.dmId));
    expect(() => testDmDetails(testUser1.token, testDm.dmId)).toThrow(Error);
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

describe('/dm/messages: Error Testing', () => {
  let testUser1: AuthRegisterReturn;
  beforeEach(() => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Token: Invalid Token', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmMessages(testUser1.token + '1', testDm.dmId, 0)).toThrow(Error);
  });

  test('DmId: Invalid dmId', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmMessages(testUser1.token, testDm.dmId + 1, 0)).toThrow(Error);
  });

  test('DmId: User is not in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmMessages(testUser2.token, testDm.dmId, 0)).toThrow(Error);
  });

  test('Start: Start is Greater than Messages', () => {
    const testDm = testDmCreate(testUser1.token, []);
    expect(() => testDmMessages(testUser1.token, testDm.dmId, 100)).toThrow(Error);
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
      end: -1
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
      end: -1
    });
  });

  test('Dm with Multiple Messages', () => {
    const testMessage1 = testMessageSendDm(testUser1.token, testDm.dmId, 'First Message');
    const testMessage2 = testMessageSendDm(testUser1.token, testDm.dmId, 'Second Message');
    const testMessage3 = testMessageSendDm(testUser1.token, testDm.dmId, 'Third Message');
    expect(testDmMessages(testUser1.token, testDm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: testMessage3.messageId,
        uId: testUser1.authUserId,
        message: 'Third Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage2.messageId,
        uId: testUser1.authUserId,
        message: 'Second Message',
        timeSent: expect.any(Number)
      }, {
        messageId: testMessage1.messageId,
        uId: testUser1.authUserId,
        message: 'First Message',
        timeSent: expect.any(Number)
      }],
      start: 0,
      end: -1
    });
  });

  test('Dm Messages with Start = -60', () => {
    testMessageSendDm(testUser1.token, testDm.dmId, 'First Message');
    expect(testDmMessages(testUser1.token, testDm.dmId, -60)).toStrictEqual({
      messages: [],
      start: -60,
      end: -10
    });
  });
});
