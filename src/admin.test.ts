/**
 * admin.test.ts
 *
 * File contains all of the jest testing for the HTTP layer for
 * all /admin/* routes.
 */

import {
  testAdminUserRemove,
  testAdminUserPermissionChange,
  testAuthRegister
} from './testFunctions'

const ERROR = { error: expect.any(String) };

interface AuthReturn {
  token: string;
  authUserId: number;
}

describe('/admin/user/remove: Error Testing', () => {
  let user1: AuthReturn
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Authorised User is not a Global Owner', () => {

  });

  test('uId: Invalid uId (No User with that uId)', () => {

  });

  test('uId: Invalid uId (User is the only Global Owner)', () => {

  });
});

describe('/admin/user/remove: Functionality Testing', () => {
  // large test: Test all removed things at once
});

describe('/admin/userpermission/change: Error Testing', () => {
  let user1: AuthReturn
  beforeEach(() => {
    user1 = testAuthRegister('email@gmail.com', 'pass1234', 'Test', 'Bot');
  });

  test('Authorised User is not a Global Owner', () => {

  });

  test('uId: Invalid uId (No User with that uId)', () => {

  });

  test('uId: Invalid uId (User is the only Global Owner and cannot be demoted)', () => {

  });

  test('permissionId: Invalid permissionId (No Permission with that Id)', () => {

  });

  test('permissionId: Invalid permissionId (User Already has that permissionId)', () => {

  });
});

describe('/admin/userpermission/change: Functionality Testing', () => {
  test('Correct Return', () => {

  });

  describe('User is Promoted', () => {
    // Test can do globalowner things
  });

  describe('User is Demoted', () => {
    // Test cant do globalowner things
  });
});