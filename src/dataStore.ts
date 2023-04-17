/**
 * 'data' stores the user, channel and dm data under
 * 'users: []', 'channels: []', and 'dms: []' respectively.
 *
 * Data is stored within 'data' through an array of objects.
 * The objects contains details about the user, channel, or dm
 * and appear under their respective area.
 */

import crypto from 'crypto';

interface Users {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

interface React {
  reactId: number;
  uId: number;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

interface Notification {
  channelId: number,
  dmId: number,
  notificationMessage: string
}
interface User {
  uId: number,
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string,
  userHandle: string,
  permissionId: number,
  tokens: string[],
  notifications: Notification[]
  resetCodes: string[]
}

interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  owners: Users[],
  allMembers: Users[],
  messages: Message[],
  isActive: boolean,
  timeFinish: number,
  buffer: string,
  standupStarterId: number,
}

interface Dm {
  dmId: number,
  name: string,
  owner: number,
  members: number[],
  messages: Message[],
}

interface Data {
  users: User[],
  channels: Channel[],
  dms: Dm[],
  globalMessageCounter: number
}

const FILE = 'src/persistenceDataStore.json';
import fs from 'fs';

// Initial state of all data for the application
let data: Data = {
  users: [],
  channels: [],
  dms: [],
  globalMessageCounter: 0
};

/**
 * Use getData() to access the data
 * Any time getData is called the persistent dataStore is updated.
 */
function getData(): Data {
  return data;
}

/**
 * Replaces the non persistence dataStore to the dataStore being
 * inputted.
 */
function setData(newData: Data) {
  data = newData;
}

/**
 * When called this function saves the data contained within the non persistence
 * dataStore by writing to the persistence dataStore.
 */
function saveData() {
  writeData(data);
}

/**
 * When called this function is called updates the non-persistent dataStore
 * with the one contained within the persistence file.
 */
function grabData() {
  data = readData();
}

/**
 * When called reads the file in which ther persistence data is
 * being held and updates the non-persistant dataStore with the
 * new data.
 *
 * If the file being read is empty (that is no data has be written)
 * to it), it returns the default dataStore.
 */
function readData(): Data {
  const jsonData = fs.readFileSync(FILE, { flag: 'r' });
  const persData = JSON.parse(String(jsonData));
  return persData;
}

/**
 * When called writes to the persistent dataStore with the new
 * updated dataStore contained within the non-persistant dataStore.
 */
function writeData(data: Data) {
  const persData = JSON.stringify(data);
  fs.writeFileSync(FILE, persData, { flag: 'w' });
}

/**
 * When called utelises the 'crypto' node package to hash the string
 * put as a parameter for the function.
 */
function getHashOf(string: string): string {
  return crypto.createHash('sha512').update(string).digest('hex');
}

export { getData, setData, saveData, grabData, getHashOf };
