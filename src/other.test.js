/**
 * other.test.js
 * 
 * Contains the jest testing designed for other functions
 * not included in the main function files
 */

import { authLoginV1, authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { userProfileV1 } from "./users.js"


////////////// clearV1 Function ///////////////
describe('reset data to initial state',() => {
    let user = authRegisterV1('userEmail@gmail.com', 'password', 'First', 'Last');
    user = authLoginV1('userEmail@gmail.com', 'password');
    channel = channelsCreateV1(user.authUserId, 'firstChannel', true);
    clearV1();
    test('everything is now deleted', () => {
        expect(userProfileV1(user.authUserId, user.authUserId)).toStrictEqual({error: expect.any(String)});
    })
})