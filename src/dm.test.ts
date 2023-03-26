/**
 * dm.test.ts
 * Contains the jest testing designed for dm.ts that utilises
 * the HTTP routes created to test funcionality
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testAuthRegister } from './auth.test';

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

interface Member {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

interface DmDetailsReturn {
  name: string;
  members: Member[];
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
  let testUser1: AuthRegisterReturn;
  let testUser2: AuthRegisterReturn;
  let testUser3: AuthRegisterReturn;
  let testDm: DmId;
  let testDmDetail: DmDetailsReturn;

  test('Correct Return: Just Owner', () => {
    testUser1 = testAuthRegister('LonelyGuy@gmail.com', 'pass1234', 'Lonely', 'Guy');
    testDm = testDmCreate(testUser1.token, []);
    testDmDetail = testDmDetails(testUser1.token, testDm.dmId);
    expect(testDmDetail.name).toStrictEqual('lonelyguy');
  });

  test('Correct Return: Just Letters', () => {
    testUser1 = testAuthRegister('a@gmail.com', 'pass1234', 'a', 'a');
    testUser2 = testAuthRegister('b@gmail.com', 'pass1234', 'a', 'b');
    testUser3 = testAuthRegister('c@gmail.com', 'pass1234', 'b', 'a');
    testDm = testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId]);
    testDmDetail = testDmDetails(testUser1.token, testDm.dmId);
    expect(testDmDetail.name).toStrictEqual('aa, ab, ba');
  });

  test('Correct Return: Longer Names', () => {
    testUser1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testUser2 = testAuthRegister('secondemail@gmail.com', 'pass1234', 'Test', 'Bot II');
    testUser3 = testAuthRegister('thirdemail@gmail.com', 'pass1234', 'Test', 'Bot III');
    testDm = testDmCreate(testUser1.token, [testUser3.authUserId, testUser2.authUserId]);
    testDmDetail = testDmDetails(testUser1.token, testDm.dmId);
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
    testDmCreate(user1.token, [user2.authUserId]);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: expect.any(Number),
        name: expect.any(String)
      }]
    });
  });

  test('One Dm (Is Member)', () => {
    testDmCreate(user1.token, [user2.authUserId]);
    expect(testDmList(user2.token)).toStrictEqual({
      dms: [{
        dmId: expect.any(Number),
        name: expect.any(String)
      }]
    });
  });

  test('Multiple Dms (Member of All)', () => {
    testDmCreate(user1.token, [user2.authUserId]);
    testDmCreate(user2.token, [user1.authUserId]);
    testDmCreate(user1.token, []);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: expect.any(Number),
        name: expect.any(String)
      }, {
        dmId: expect.any(Number),
        name: expect.any(String)
      }, {
        dmId: expect.any(Number),
        name: expect.any(String)
      }]
    });
  });

  test('Multiple Dms (Member of 2, Not a Member of 1)', () => {
    testDmCreate(user1.token, [user2.authUserId]);
    testDmCreate(user2.token, [user1.authUserId]);
    testDmCreate(user2.token, []);
    expect(testDmList(user1.token)).toStrictEqual({
      dms: [{
        dmId: expect.any(Number),
        name: expect.any(String)
      }, {
        dmId: expect.any(Number),
        name: expect.any(String)
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

describe('/dm/create: Error Testing', () => {
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

  test('DmId: User is no longer in Dm', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    testDmLeave(testUser1.token, testDm.dmId);
    expect(testDmRemove(testUser1.token, testDm.dmId)).toStrictEqual(ERROR);
  });

  test('DmId: User is not the Dm owner', () => {
    const testUser2 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot II');
    const testDm = testDmCreate(testUser1.token, [testUser2.authUserId]);
    expect(testDmRemove(testUser2.token, testDm.dmId)).toStrictEqual(ERROR);
  });
});

describe('/dm/create: Deletion Testing', () => {
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

describe('/dm/create: Error Testing', () => {
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

describe('/dm/create: Return Testing', () => {
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
    const testDm = testDmCreate(testUser1.token, []);
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
    const testDm = testDmCreate(testUser1.token, []);
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

export { testDmCreate, testDmList };
