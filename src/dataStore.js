/**
 * 'data' stores the user and channel data under 
 * 'users: []' and 'channels: []' respectively.
 * 
 * Data is stored within 'data' through an array
 * of objects. The objects contains details about
 * the user/channel and appear under their 
 * respective area
 */

/**
 * Users Object =
 * {
 *  uId: number,
 *  email: string,
 *  password: string,
 *  nameFirst: string,
 *  nameLast: string,
 *  userHandle: string,
 *  permissionId: number,
 * }
 * 
 * Channels Object = 
 * {
 *  channelId: number,
 *  name: string,
 *  isPublic: boolean,
 *  owners: array,
 *  allMembers: array,
 *  messages: array,
 * }
 */
let data = {
  users: [],
  channels: []
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData) {
  data = newData;
}

export { getData, setData };
