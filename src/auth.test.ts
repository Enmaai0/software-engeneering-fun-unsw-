/**
 * auth.test.ts
 * Contains the jest testing designed for auth.ts that utelises
 * the HTTP routes created to test functionality
 */

import request from 'sync-request';
import config from './config.json';
import { testClear } from './other.test';
import { testDmCreate } from './dm.test';

const port = config.port;
const url = config.url;

const ERROR = { error: expect.any(String) };

interface AuthReturn {
  token: string;
  authUserId: number;
}

beforeEach(() => {
  testClear();
});

/** /auth/login/v2 Testing **/

function testAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v2`,
    {
      json: {
        email,
        password
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/auth/login: Error Testing', () => {
  beforeEach(() => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Email: Invalid Email', () => {
    expect(testAuthLogin('invalidEmail', 'pass1234')).toStrictEqual(ERROR);
  });

  test('Email: No User with Email', () => {
    expect(testAuthLogin('nonExistantEmail@gmail.com', 'pass1234')).toStrictEqual(ERROR);
  });

  test('Password: Incorrect Password', () => {
    expect(testAuthLogin('email@gmail.com', '1234pass')).toStrictEqual(ERROR);
  });
});

describe('/auth/login: Return Testing', () => {
  let user1: AuthReturn, user2: AuthReturn;
  beforeEach(() => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    user1 = testAuthLogin('email@gmail.com', 'pass1234');
    user2 = testAuthLogin('email2@gmail.com', 'pass1234');
  });

  test('Correct Return: First User', () => {
    expect(user1.authUserId).toStrictEqual(expect.any(Number));
    expect(user1.token).toStrictEqual(expect.any(String));
  });

  test('Correct Return: Second User', () => {
    expect(user2.authUserId).toStrictEqual(expect.any(Number));
    expect(user2.token).toStrictEqual(expect.any(String));
  });

  test('Correct Return: Check Unique authUserId', () => {
    expect(user1).not.toMatchObject(user2);
  });
});

/** /auth/logout/v1 Testing **/

function testAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v1`,
    {
      json: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/auth/logout: Error Testing', () => {
  test('Email: Invalid Token (No Users)', () => {
    expect(testAuthLogout('someRandomTokenIDK?')).toStrictEqual(ERROR);
  });

  test('Email: Invalid Token (With Users)', () => {
    const user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
    const user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    expect(testAuthLogout(user1.token + user2.token)).toStrictEqual(ERROR);
  });
});

describe('/auth/logout: Return Testing', () => {
  test('Email: Invalid Token (No Users)', () => {
    const user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
    expect(testAuthLogout(user1.token)).toStrictEqual({});
  });
});

describe('/auth/logout: Token Removal Testing', () => {
  let user1: AuthReturn;
  beforeEach(() => {
    user1 = testAuthRegister('realEmail@gmail.com', 'password1234', 'Kazoo', 'Kid');
  });

  test('Creating Dm with Deleted Token', () => {
    testClear();
    expect(testDmCreate(user1.token, [])).toStrictEqual(ERROR);
  });
});

/** /auth/register/v2 Testing **/

function testAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v2`,
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/auth/register: Error Testing', () => {
  test('Email: Invalid Email', () => {
    expect(testAuthRegister('invalidEmail', 'pass1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Email: Email Already in Use', () => {
    testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Password: Too Short (Empty Password)', () => {
    expect(testAuthRegister('email@gmail.com', '', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('Password: Too Short (Non Empty Password)', () => {
    expect(testAuthRegister('email@gmail.com', 'Pass', 'Test', 'Bot')).toStrictEqual(ERROR);
  });

  test('First Name: Empty', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', '', 'Bot')).toStrictEqual(ERROR);
  });

  test('Last Name: Empty', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', '')).toStrictEqual(ERROR);
  });

  test('First Name: Too Long', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w', 'Bot')).toStrictEqual(ERROR);
  });

  test('Last Name: Too Long', () => {
    expect(testAuthRegister('email@gmail.com', 'pass1234', 'Test', '1ZdP8qqutEVebdstDOtjqzZjIA1f4Oe3KQdYFHbakVSYodzEP6w')).toStrictEqual(ERROR);
  });
});

describe('/auth/register: Return Testing', () => {
  describe('authUserId Testing', () => {
    let user1: AuthReturn, user2: AuthReturn;
    beforeEach(() => {
      user1 = testAuthRegister('email1@gmail.com', 'pass1234', 'Test', 'Bot I');
      user2 = testAuthRegister('email2@gmail.com', 'pass1234', 'Test', 'Bot II');
    });

    test('Correct Return: First User', () => {
      expect(user1).toStrictEqual({
        authUserId: expect.any(Number),
        token: expect.any(String)
      });
    });

    test('Correct Return: Second User', () => {
      expect(user2).toStrictEqual({
        authUserId: expect.any(Number),
        token: expect.any(String)
      });
    });

    test('Correct Return: Check Unique authUserId', () => {
      expect(user1).not.toMatchObject(user2);
    });
  });
});

export { testAuthLogin, testAuthLogout, testAuthRegister };
