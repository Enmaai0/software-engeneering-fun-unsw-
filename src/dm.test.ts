/**
 * dm.test.ts
 * Contains the jest testing designed for dm.ts that utilises
 * the HTTP routes created to test funcionality
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testAuthRegister } from './auth.test';

const OK = 200;
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

/** /dm/details/v1 Testing **/

/** /dm/leave/v1 Testing **/

/** /dm/messages/v1 Testing **/
