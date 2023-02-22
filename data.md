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
      messages: [
        {
          messageId: 'integer',
          senderId: 'integer',
          message: 'string',
          timeSent: 'integer',
        },
      ]
    },
    {
      channelId: '1',
      channelName: 'exampleChannelData',
      ownerUserId: '[1, 3]',
      memberUserIds: '[1, 2, 3, 4, 9]',
      messages: [
        {
          messageId: '1',
          senderId: '3',
          message: 'this is an example message',
          timeSent: '20230221132405',
        },
      ]
    },
  ]
}
```

[Optional] short description: 
            This files contains the design of the datastore
            being used to store information within 'Memes'.

            For timeSent, format follows: yyyymmddhhmmss
            (year - month - day - hour- minutes - seconds)
            20230221132405 = 2023 - 02 - 21 - 13 - 24 - 05