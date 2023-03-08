/**
 * channels.test.js
 * 
 * Contains the jest testing designed for channels.js
 */

import {authRegisterV1} from './auth.js'
import { channelsListAllV1 } from './channels.js';
import { channelsListV1} from './channels.js';
import { channelsCreateV1 } from './channels.js';
import { clearV1 } from './other.js';
import { getData, setData } from "./dataStore.js";




/*
Testing for channelsListAllV1
cases:
authUserId is invalid
authUserId is valid
*/
describe('Testing channelsListAllV1', () => {
    beforeEach(() => {
        clearV1();
    });
    test('Testing for invalid authUserId', () => {
        let user = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
        let channel = channelsCreateV1(user, 'jack', true);
        let dataStore = getData();
        let result = channelsListAllV1(dataStore.users.length+1)
        expect(result).toStrictEqual(
            {
                error: expect.any(String)
            }
        );
    })
})

describe('Testing channelsListAllV1', () => {
    beforeEach(() => {
        clearV1();
    });
    test('test case where a valid ID is given', () => {
        const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId;
        channelsCreateV1(user1, 'jack', true);
        channelsCreateV1(user1, 'alpha', false);
        expect(channelsListAllV1(user1)).toStrictEqual([
            {
                channelId: expect.any(Number),
                name: 'jack'
            },
            {
                channelId: expect.any(Number),
                name: 'alpha'
            }
        ]);

        // let dataStore = getData();
        // let result = channelsListAllV1(user);
        // for (let channel of dataStore.channels) {
        //     let obj = {};
        //     obj.push(channel.channelId);
        //     obj.push(channel.name);
        //     channelArray.push(obj)
        // }
        // expect(result).toStrictEqual(
        //     { 
        //         channels: dataStore.channels
        //     }
    
    });
})


// Test cases: 
// 1. authUserId is valid, name is valid (no error)
// 2. authUserId is invalid 
// 3. name is invalid -- has 2 cases 
//    3.1. name < 1  : error Name is too short
//    3.2  name > 20 : error Name is too long


describe('Testing channelsCreateV1 main', () => {
    beforeEach(() => {
        clearV1();
    });
    test('Testing success', () => {
        const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
        expect(channelsCreateV1(user1, 'jack', true)).toStrictEqual(
            {
                channelId: expect.any(Number)
            }
        );
    })
})

describe('Testing channelsCreateV1 main', () => {
    afterEach(() => {
        clearV1();
    });
    test('authUserId is invalid', () => {
        let authregister = authRegisterV1('validemail@gmail.com','jake', 'Renzella');
        let dataStore = getData();
        let result = channelsCreateV1('-1', 'jack', true);
        expect(result).toStrictEqual(
            {
              error: expect.any(String)
            }
        );
    })

    test('Name is too short', () => {
        let dataStore = getData();
        let result = channelsCreateV1('1', '', true);
        expect(result).toStrictEqual(
            {
                error: expect.any(String)
            }
        );
    })

    test('Name is too long', () => {
        let dataStore = getData();
        let result = channelsCreateV1('1', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', true);
        expect(result).toStrictEqual(
            {
                error: expect.any(String)
            }
        );
    })

})

// Test cases
// 1. authUserId is valid (function runs successfully)
//     1.1  user is in a public channels only
//     1.2  user is in public and private channels --> only public should be outputted
// 2. authUserId is invalid (error: User is not valid)

describe('Testing channelsListV1 main', () => {
    beforeEach(() => {
        clearV1();
    })

    test('Testing user is in public channels only', () => {
        const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
        channelsCreateV1(user1, 'channel1', true);
        channelsCreateV1(user1, 'channel2', true);
        
        expect(channelsListV1(user1).resultChannels.length != 0);
    })

    test('Testing user is in public channels & private channels', () => {
        const user1 = authRegisterV1('validemail@gmail.com', '123abc!@#','jake', 'Renzella').authUserId
        channelsCreateV1(user1, 'channel1', true);
        channelsCreateV1(user1, 'channel2', true);
        channelsCreateV1(user1, 'channel3', false);
        let dataStore = getData();
        
        expect(channelsListV1(user1).resultChannels.length < dataStore.channels.length);
    })

})

describe('Testing channelsListV1 error', () => {
    beforeEach(() => {
        clearV1();
    })
    test('authUserId is invalid', () => {
        let authregister = authRegisterV1('validemail@gmail.com','jake', 'Renzella');
        let result = channelsListV1('-1', 'jack', true);
        expect(result).toStrictEqual(
            {
              error: expect.any(String)
            }
        );
    })
})

