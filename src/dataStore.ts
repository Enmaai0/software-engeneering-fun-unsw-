/**
 * 'data' stores the user and channel data under
 * 'users: []' and 'channels: []' respectively.
 *
 * Data is stored within 'data' through an array
 * of objects. The objects contains details about
 * the user/channel and appear under their
 * respective area
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

// Initial state of all data for the application
let data: Data = {
  users: [],
  channels: [],
  dms: []
};

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: Data) {
  data = newData;
}

export { getData, setData };
