import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { authLoginV1, authLogoutV1, authRegisterV1 } from './auth';
import { clearV1 } from './other';
import { dmCreate, dmList, dmDetails, dmLeave, dmMessages, dmRemove } from './dm';
import { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 } from './users';
import { saveData, grabData } from './dataStore';
import { channelRemoveOwnerV1, channelAddOwnerV1, channelDetailsV1, channelJoinV1, channelLeaveV1, channelInviteV1, channelMessagesV1 } from './channel';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// start server
const server = app.listen(PORT, HOST, () => {
  grabData();
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

/** Server Routes Implementation **/

app.delete('/clear/v1', (req: Request, res: Response) => {
  const returnMessage = clearV1();
  saveData();

  console.log('⭕ Clearing Server Data');
  res.json(returnMessage);
});

/** /auth/* Routes **/

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const returnMessage = authLoginV1(email, password);
  saveData();

  console.log('Logging in User with Email:', email);
  res.json(returnMessage);
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body;
  const returnMessage = authLogoutV1(token);
  saveData();

  console.log('Logging Out User (Token:', token, ')');
  res.json(returnMessage);
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const returnMessage = authRegisterV1(email, password, nameFirst, nameLast);
  saveData();

  console.log('Registering New User:', nameFirst, nameLast, 'with email:', email);
  res.json(returnMessage);
});

/** /dm/* Routes **/

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  const returnMessage = dmCreate(token, uIds);
  saveData();

  console.log('Creating new DM with owner token:', token);
  res.json(returnMessage);
});

app.get('/dm/list/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = dmList(token);
  saveData();

  console.log('Getting all DMs with member/owner Token:', token);
  res.json(returnMessage);
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const returnMessage = dmRemove(token, Number(dmId));
  saveData();

  console.log('Removing DM with Id:', dmId);
  res.json(returnMessage);
});

app.get('/dm/details/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const returnMessage = dmDetails(token, Number(dmId));
  saveData();

  console.log('Getting Details of DM Id:', dmId);
  res.json(returnMessage);
});

app.post('/dm/leave/v1', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  const returnMessage = dmLeave(token, dmId);

  console.log('User with Token:', token, 'Leaving Dm:', dmId);
  res.json(returnMessage);
});

app.get('/dm/messages/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;
  const returnMessage = dmMessages(token, Number(dmId), Number(start));

  console.log('Getting Details of DM Id:', dmId);
  res.json(returnMessage);
});

/** /user/* Routes **/
app.get('/user/profile/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const uId = req.query.uId as string;
  const returnMessage = userProfileV1(token, Number(uId));
  saveData();

  console.log('Getting Profile of User Id:', uId);
  res.json(returnMessage);
});

app.get('/users/all/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = usersAllV1(token);
  saveData();

  console.log('Getting All Users from Token:', token);
  res.json(returnMessage);
});

app.put('/user/profile/setname/v1', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  const returnMessage = userSetNameV1(token, nameFirst, nameLast);
  saveData();

  console.log('Setting User Name from Token:', token);
  res.json(returnMessage);
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response) => {
  const { token, email } = req.body;
  const returnMessage = userSetEmailV1(token, email);
  saveData();

  console.log('Setting User Email from Token:', token);
  res.json(returnMessage);
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  const returnMessage = userSetHandleV1(token, handleStr);
  saveData();

  console.log('Setting User Handle from Token:', token);
  res.json(returnMessage);
});

/** /channel/* Routes **/
app.get('/channel/details/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  const returnMessage = channelDetailsV1(token, channelId);
  saveData();

  console.log('Getting details from Token:', token);
  res.json(returnMessage);
})

app.post('/channel/join/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  const returnMessage = channelJoinV1(token, channelId);
  saveData();

  console.log('Putting user into Channel:', channelId);
  res.json(returnMessage);
})

app.post('/channel/invite/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelInviteV1(token, channelId, uId);
  saveData();

  console.log('Putting user into Channel from Token:', token);
  res.json(returnMessage);
})

app.post('/channel/messages/v1', (req: Request, res: Response) => {
  const { token, channelId, start } = req.body;
  const returnMessage = channelMessagesV1(token, channelId, start);
  saveData();

  console.log('Return 50 Messages with Token:', token);
  res.json(returnMessage);
})

app.post('/channel/leave/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  const returnMessage = channelLeaveV1(token, channelId);
  saveData();

  console.log('Removing User from Token:', token);
  res.json(returnMessage);
})

app.post('/channel/addowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelAddOwnerV1(token, channelId, uId);
  saveData();

  console.log('Adding User from Token:', token);
  res.json(returnMessage);
})

app.post('/channel/removeowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelRemoveOwnerV1(token, channelId, uId);
  saveData();

  console.log('Removing Owner from Token:', token);
  res.json(returnMessage);
})