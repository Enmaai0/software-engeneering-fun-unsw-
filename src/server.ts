import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { authLoginV1, authRegisterV1 } from './auth';
import { clearV1 } from './other';
import { dmCreate } from './dm';

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
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

/** Server Routes Implementation **/

app.delete('/clear/v1', (req: Request, res: Response) => {
  const returnMessage = clearV1();
  console.log('Clearing Server Data');

app.post('/auth/login/v2', (req: Request, res: Response) => {
  res.json();
});

app.get('/auth/login/v2', (req: Request, res: Response) => {
  const email = req.query.email as string;
  const password = req.query.passowrd as string;
  const returnMessage = authLoginV1(email, password);

  console.log('Logging in User with Email:', email);
  res.json(returnMessage);
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const returnMessage = authRegisterV1(email, password, nameFirst, nameLast);

  console.log('Registering New User:', nameFirst, nameLast, 'with email:', email);
  res.json(returnMessage);
});

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  const returnMessage = dmCreate(token, uIds);

  console.log('Creating new DM with owner token:', token);
  res.json(returnMessage);
});
