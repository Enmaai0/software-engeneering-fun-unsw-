import { authRegisterV1 } from "./auth.js";
import { getData, setData } from "./dataStore.js";

/**
 * channels.js
 * 
 * Contains the stub code functions of all channels* functions.
 */


//Creates a new channel with the given name, that is either a public or private channel.
//The user who created it automatically joins the channel.
function channelsCreateV1(authUserId, name, isPublic) {
  let dataStore = getData();

// Check if the channel name is valid
  if (name.length < 1 || name.length > 20) {
    return { error:'Name is too short.'};
  }

  // Check if the authUserId is valid
  if (typeof authUserId !== 'string') {
    return { error: 'error' };
  }
  
  for (let user of dataStore.users) {
    if (user.authUserId === authUserId) {
        let channelobj = {
          name: name,
          isPublic: isPublic,
          owner: [authUserId],
          allMembers: [authUserId],
          messages: [],
          channelId: dataStore.channels.length,
        }

        const channelId = dataStore.channels.length;

        dataStore.channels.push(channelobj);
        setData(dataStore);

        return {channelId : channelId};
    }

  }
  return {error : 'User is not valid'}
}

function channelsListAllV1(authUserId) { 
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  };
}

function channelsListV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  };
}