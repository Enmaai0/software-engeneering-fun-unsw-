import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { clearV1, notificationsGet } from './other';
import { saveData, grabData } from './dataStore';
import { authLoginV1, authLogoutV1, authRegisterV1 } from './auth';
import { dmCreate, dmList, dmDetails, dmLeave, dmMessages, dmRemove } from './dm';
import { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 } from './users';
import { channelRemoveOwnerV1, channelAddOwnerV1, channelDetailsV1, channelJoinV1, channelLeaveV1, channelInviteV1, channelMessagesV1 } from './channel';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import { messageEditV1, messageRemoveV1, messageSendV1, messageSendDmV1 } from './message';

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

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

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

/** /auth/* Routes **/

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const returnMessage = authLoginV1(email, password);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body;
  const returnMessage = authLogoutV1(token);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const returnMessage = authRegisterV1(email, password, nameFirst, nameLast);
  saveData();
  res.json(returnMessage);
});

/** /channel/* Routes **/

app.get('/channel/details/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  const returnMessage = channelDetailsV1(token, Number(channelId));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/join/v2', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  const returnMessage = channelJoinV1(token, channelId);
  saveData();
  res.json(returnMessage);
});

app.post('/channel/invite/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelInviteV1(token, channelId, uId);
  saveData();
  res.json(returnMessage);
});

app.get('/channel/messages/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  const returnMessage = channelMessagesV1(token, Number(channelId), Number(start));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/leave/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  const returnMessage = channelLeaveV1(token, channelId);
  saveData();
  res.json(returnMessage);
});

app.post('/channel/addowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelAddOwnerV1(token, channelId, Number(uId));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/removeowner/v1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  const returnMessage = channelRemoveOwnerV1(token, channelId, Number(uId));
  saveData();
  res.json(returnMessage);
});

/** /channels/* Routes **/

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  const returnMessage = channelsCreateV1(token, name, isPublic);
  saveData();
  res.json(returnMessage);
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = channelsListV1(token);
  saveData();
  res.json(returnMessage);
});

app.get('/channels/listall/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = channelsListAllV1(token);
  saveData();
  res.json(returnMessage);
});

/** /dm/* Routes **/

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  const returnMessage = dmCreate(token, uIds);
  saveData();
  res.json(returnMessage);
});

app.get('/dm/list/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = dmList(token);
  saveData();
  res.json(returnMessage);
});

app.delete('/dm/remove/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const returnMessage = dmRemove(token, Number(dmId));
  saveData();
  res.json(returnMessage);
});

app.get('/dm/details/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const returnMessage = dmDetails(token, Number(dmId));
  saveData();
  res.json(returnMessage);
});

app.post('/dm/leave/v1', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  const returnMessage = dmLeave(token, dmId);
  saveData();
  res.json(returnMessage);
});

app.get('/dm/messages/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;
  const returnMessage = dmMessages(token, Number(dmId), Number(start));
  saveData();
  res.json(returnMessage);
});

/** /message/* Routes **/

app.post('/message/send/v1', (req: Request, res: Response) => {
  const { token, channelId, message } = req.body;
  const returnMessage = messageSendV1(token, channelId, message);
  saveData();
  res.json(returnMessage);
});

app.put('/message/edit/v1', (req: Request, res: Response) => {
  const { token, messageId, message } = req.body;
  const returnMessage = messageEditV1(token, messageId, message);
  saveData();
  res.json(returnMessage);
});

app.delete('/message/remove/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const messageId = req.query.messageId as string;
  const returnMessage = messageRemoveV1(token, Number(messageId));
  saveData();
  res.json(returnMessage);
});

app.post('/message/senddm/v1', (req: Request, res: Response) => {
  const { token, dmId, message } = req.body;
  const returnMessage = messageSendDmV1(token, dmId, message);
  saveData();
  res.json(returnMessage);
});

/** /user/* Routes **/

app.get('/user/profile/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const uId = req.query.uId as string;
  const returnMessage = userProfileV1(token, Number(uId));
  saveData();
  res.json(returnMessage);
});

app.get('/users/all/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = usersAllV1(token);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/setname/v1', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  const returnMessage = userSetNameV1(token, nameFirst, nameLast);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response) => {
  const { token, email } = req.body;
  const returnMessage = userSetEmailV1(token, email);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  const returnMessage = userSetHandleV1(token, handleStr);
  saveData();
  res.json(returnMessage);
});

/** /other/ Routes */

app.delete('/clear/v1', (req: Request, res: Response) => {
  const returnMessage = clearV1();
  saveData();
  res.json(returnMessage);
});

app.get('/notifications/get/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const returnMessage = notificationsGet(token);
  saveData();
  res.json(returnMessage);
});
