/**
 * auth.test.ts
 * 
 * Contains the jest testing designed for auth.ts that utelises
 * the HTTP routes created to test functionality
 */

import request from 'sync-request';
import config from './config.json';

const OK = 200;
const port = config.port;
const url = config.url;

/** /auth/login/v2 Testing **/


/** /auth/register/v2 Testing **/

function testAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    url + '/auth/register/v2',
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