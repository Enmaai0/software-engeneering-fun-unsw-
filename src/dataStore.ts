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

const FILE = 'persistenceDataStore.json';
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
  const persData = readData();

  // If the persistence data file is currently empty, there is
  // nothing to read, therefore returns the default empty data object.
  if (isEmptyData(persData)) {
    return data;
  }

  return persData;
}

/**
 * Use set(newData) to pass in the entire data object, with modifications made
 * Only needs to be used if you replace the data store entirely
 * Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
 */ 
function setData(newData: Data) {
  writeData(newData);
}

/**
 * Given the read value from readData(), returns whether the file
 * if empty (true) or contains data (false).
 *
 * @param {Data} data 
 * @returns {boolean}
 */
function isEmptyData(data: Data): boolean {
  return Object.keys(data).length === 0;
}

/**
 * When called reads the file in which ther persistence data is
 * being held and updates the non-persistant dataStore with the
 * new data.
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

export { getData, setData };
