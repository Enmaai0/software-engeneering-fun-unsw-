import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { clearV1, notificationsGet, search } from './other';
import { saveData, grabData } from './dataStore';
import { authLoginV1, authLogoutV1, authRegisterV1, authPasswordResetRequest, authPasswordResetReset } from './auth';
import { adminUserRemove, adminUserPermissionChange } from './admin';
import { dmCreate, dmList, dmDetails, dmLeave, dmMessages, dmRemove } from './dm';
import { userProfileV1, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1, userProfileUploadPhoto } from './users';
import { channelRemoveOwnerV1, channelAddOwnerV1, channelDetailsV1, channelJoinV1, channelLeaveV1, channelInviteV1, channelMessagesV1 } from './channel';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import { messageEditV1, messageRemoveV1, messageSendV1, messageSendDmV1, messagePinV1, messageUnPinV1 } from './message';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for upload image
app.use('/static', express.static('static'));

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

/** -Server Routes Implementation- **/

/** /admin/* Routes **/

app.delete('/admin/user/remove/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = req.query.uId as string;
  const returnMessage = adminUserRemove(token, Number(uId));
  saveData();
  res.json(returnMessage);
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uId, permissionId } = req.body;
  const returnMessage = adminUserPermissionChange(token, uId, permissionId);
  saveData();
  res.json(returnMessage);
});

/** /auth/* Routes **/

app.post('/auth/login/v3', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const returnMessage = authLoginV1(email, password);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/logout/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const returnMessage = authLogoutV1(token);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/register/v3', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const returnMessage = authRegisterV1(email, password, nameFirst, nameLast);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response) => {
  const { email } = req.body;
  const returnMessage = authPasswordResetRequest(email);
  saveData();
  res.json(returnMessage);
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response) => {
  const { resetCode, newPassword } = req.body;
  const returnMessage = authPasswordResetReset(resetCode, newPassword);
  saveData();
  res.json(returnMessage);
});

/** /channel/* Routes **/

app.get('/channel/details/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  const returnMessage = channelDetailsV1(token, Number(channelId));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/join/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  const returnMessage = channelJoinV1(token, channelId);
  saveData();
  res.json(returnMessage);
});

app.post('/channel/invite/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  const returnMessage = channelInviteV1(token, channelId, uId);
  saveData();
  res.json(returnMessage);
});

app.get('/channel/messages/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  const returnMessage = channelMessagesV1(token, Number(channelId), Number(start));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId } = req.body;
  const returnMessage = channelLeaveV1(token, channelId);
  saveData();
  res.json(returnMessage);
});

app.post('/channel/addowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  const returnMessage = channelAddOwnerV1(token, channelId, Number(uId));
  saveData();
  res.json(returnMessage);
});

app.post('/channel/removeowner/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, uId } = req.body;
  const returnMessage = channelRemoveOwnerV1(token, channelId, Number(uId));
  saveData();
  res.json(returnMessage);
});

/** /channels/* Routes **/

app.post('/channels/create/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, isPublic } = req.body;
  const returnMessage = channelsCreateV1(token, name, isPublic);
  saveData();
  res.json(returnMessage);
});

app.get('/channels/list/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const returnMessage = channelsListV1(token);
  saveData();
  res.json(returnMessage);
});

app.get('/channels/listall/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const returnMessage = channelsListAllV1(token);
  saveData();
  res.json(returnMessage);
});

/** /dm/* Routes **/

app.post('/dm/create/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { uIds } = req.body;
  const returnMessage = dmCreate(token, uIds);
  saveData();
  res.json(returnMessage);
});

app.get('/dm/list/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const returnMessage = dmList(token);
  saveData();
  res.json(returnMessage);
});

app.delete('/dm/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  const returnMessage = dmRemove(token, Number(dmId));
  saveData();
  res.json(returnMessage);
});

app.get('/dm/details/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  const returnMessage = dmDetails(token, Number(dmId));
  saveData();
  res.json(returnMessage);
});

app.post('/dm/leave/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId } = req.body;
  const returnMessage = dmLeave(token, dmId);
  saveData();
  res.json(returnMessage);
});

app.get('/dm/messages/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;
  const returnMessage = dmMessages(token, Number(dmId), Number(start));
  saveData();
  res.json(returnMessage);
});

/** /message/* Routes **/

app.post('/message/send/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { channelId, message } = req.body;
  const returnMessage = messageSendV1(token, channelId, message);
  saveData();
  res.json(returnMessage);
});

app.put('/message/edit/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId, message } = req.body;
  const returnMessage = messageEditV1(token, messageId, message);
  saveData();
  res.json(returnMessage);
});

app.delete('/message/remove/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const messageId = req.query.messageId as string;
  const returnMessage = messageRemoveV1(token, Number(messageId));
  saveData();
  res.json(returnMessage);
});

app.post('/message/senddm/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { dmId, message } = req.body;
  const returnMessage = messageSendDmV1(token, dmId, message);
  saveData();
  res.json(returnMessage);
});

app.post('/message/pin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  const returnMessage = messagePinV1(token, messageId);
  saveData();
  res.json(returnMessage);
});

app.post('/message/unpin/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { messageId } = req.body;
  const returnMessage = messageUnPinV1(token, messageId);
  saveData();
  res.json(returnMessage);
});

/** /user/* Routes **/

app.get('/user/profile/v3', (req: Request, res: Response) => {
  const token = req.header('token');
  const uId = req.query.uId as string;
  const returnMessage = userProfileV1(token, Number(uId));
  saveData();
  res.json(returnMessage);
});

app.get('/users/all/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const returnMessage = usersAllV1(token);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/setname/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { nameFirst, nameLast } = req.body;
  const returnMessage = userSetNameV1(token, nameFirst, nameLast);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email } = req.body;
  const returnMessage = userSetEmailV1(token, email);
  saveData();
  res.json(returnMessage);
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response) => {
  const token = req.header('token');
  const { handleStr } = req.body;
  const returnMessage = userSetHandleV1(token, handleStr);
  saveData();
  res.json(returnMessage);
});

app.post('user/profile/uploadphoto/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  const returnMessage = userProfileUploadPhoto(token, imgUrl, xStart, yStart, xEnd, yEnd);
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
  const token = req.header('token');
  const returnMessage = notificationsGet(token);
  saveData();
  res.json(returnMessage);
});

app.get('/search/v1', (req: Request, res: Response) => {
  const token = req.header('token');
  const queryString = req.query.queryString as string;
  const returnMessage = search(token, queryString);
  saveData();
  res.json(returnMessage);
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());
