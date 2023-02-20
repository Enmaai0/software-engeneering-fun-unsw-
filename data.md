```javascript
let data = {

  users: [
    {
      userId: 'integer',
      userHandle: 'string',
      password: 'string',
      nameFirst: 'string',
      nameLast: 'string',
      email: 'string',
    },
    {
      userId: 1,
      email: 'example@gmail.com',
      password: 'example123',
      nameFirst: 'example;,
      nameLast: 'user_data',
      userHandle: 'userDataExample123',
    },
  ],

  channels: [
    {
      channelId: 'integer',
      channelName: 'string',
      ownerUserId: '[integer, integer, ...]',
      memberUserIds: '[integer, integer, ...]',
      /**
       * Perhaps some method of storing a dataset of all messages sent
       * within this channel. Following the data structure of:
       * 
       * messages: [
       *   {
       *     messageId: 'integer',
       *     senderId: 'integer',
       *     message: 'string',
       *     timeSent: 'integer', (most likely in 24 hour format)
       *   },
       * ]
       * 
       * Not sure if this method of storing data works
       * 
       */
    },
    {
      channelId: '1',
      channelName: 'exampleChannelData',
      ownerUserId: '[1, 3]',
      memberUserIds: '[1, 2, 3, 4, 9]',
    },
  ]
}
```

[Optional] short description: 
            This files contains the design of the datastore
            being used to store information within 'Memes'.