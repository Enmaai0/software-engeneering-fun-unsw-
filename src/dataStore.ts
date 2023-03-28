/**
 * 'data' stores the user, channel and dm data under
 * 'users: []', 'channels: []', and 'dms: []' respectively.
 *
 * Data is stored within 'data' through an array of objects.
 * The objects contains details about the user, channel, or dm
 * and appear under their respective area.
 */

interface Users {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
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
  tokenCounter: number,
}

interface Channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  owners: Users[],
  allMembers: Users[],
  messages: Message[],
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
  dms: Dm[]
}

const FILE = 'src/persistenceDataStore.json';
import fs from 'fs';

// Initial state of all data for the application
let data: Data = {
  users: [],
  channels: [],
  dms: []
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
  if (persData.length === 0) {
    return data;
  }
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

export { getData, setData, saveData, grabData };
