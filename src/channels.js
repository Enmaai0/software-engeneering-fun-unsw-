/**
 * channels.js
 * 
 * Contains the stub code functions of all channels* functions.
 */

function channelsCreateV1(authUserId, name, isPublic) {
  return { 
    channelId: 1
  };
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