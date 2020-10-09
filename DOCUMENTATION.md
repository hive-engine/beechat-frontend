# BeeChat Developer Documentation

## API

Base URL: https://beechat.hive-engine.com/api

### `GET /users/login`

Logs in a user.

**Query Parameters**

- `username`: String - Hive username, e.g. `reazuliqbal`
- `ts`: Number - Timestamp in miliseconds, e.g. `1601355471900`
- `sig`: String - Signed `username + timestamp` using user's posting/active key. e.g. `reazuliqbal1601355471900`

**Example Response**

```jsonld=
{
  "username": "reazuliqbal",
  "admin": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWF6dWxpcWJhbCIsImFkbWluIjp0cnVlLCJpYXQiOjE2MDIyMjA3MzcsImV4cCI6MTYwMjIyMTYzN30.cEMHaz_PJCdg-o-EelD7o0rmYZotLMS-SH4SXFIjZZA",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWF6dWxpcWJhbCIsImlhdCI6MTYwMjIyMDczNywiZXhwIjoxNjA5OTk2NzM3fQ.uDfA5X_RAXrk5JAx7eeoA75sFyTdJX02M3kN12T5zjI"
}
```

`token` is the access token of the user and should be sent as Bearer token in the Authentication header for subsequent request to the API and also to authenticate with the websocket server.

`refresh_token` is for renewing the access token.

### `GET /users/verify`

Verifies if the current access token is valid.

**Query Parameters**

No parameters are needed.

**Example Response**
```json=
{
  "username": "reazuliqbal"
}
```

### `GET /users/refresh-token`

Requests a new access token. User's `refresh_token` should be sent as Bearer token in the Authentication header instead of `access_token`/`token` while renewing.

**Query Parameters**

No parameters are needed.

**Example Response**
```json=
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjb2RlYnVsbCIsImFkbWluIjpmYWxzZSwiaWF0IjoxNjAyMDY3NzY2LCJleHAiOjE2MDM4Njc3NjZ9.ikvzEszGIC8uolP876EGvmY1b7yVCBZWx7ynPZbt030"
}
```

### `GET /users/friends`

Returns user's friends and blocked list.

**Query Parameters**

No parameters are needed.

**Example Response**

```json=
{
	"friends": ["codebull", "bdcommunity", "aggroed"],
	"blocked": ["reazul-dev"]
}
```

### `GET /users/friend-requests`

Returns an array of user's pending friend requests.

**Query Parameters**

No parameters are needed.

**Example Response**

```json=
[{
	"id": "01EKC46ZMG111C2HYABE80WE8T",
	"username": "reazul-dev"
}]
```

### `GET /users/settings`

Returns user's settings.

**Query Parameters**

No parameters are needed.

**Example Response**
```json=
{
  "dm": {
    "only_from_friends": false
  }
}
```

### `POST /users/settings`

Updates the user's settings.

**Payload**

- `dm` - Object
-- `only_from_friends`: Boolean

**Example Response**
```json=
{
  "dm": {
    "only_from_friends": false
  }
}
```

### `GET /users/channels`

Returns an array of user-created channels.

**Query Parameters**

No parameters are needed.

**Example Payload**
```json=
[{
  "moderators": [],
  "members": ["reazuliqbal"],
  "blocked": false,
  "type": "channel",
  "name": "BDCommunity Chat",
  "creator": "reazuliqbal",
  "created_at": "2020-09-29T05:17:43.848Z",
  "updated_at": "2020-09-29T05:17:43.848Z",
  "id": "01EKC4Q317YM484Z7BMVG9Y1K0"
},
....
....
]
```

### `POST /users/channels`

Creates a new channel.

**Payload**
- `name`: String

**Example Response**

```json=
{
  "id": "01EKC4Q317YM484Z7BMVG9Y1K0",
  "name": "BDCommunity Chat",
  "creator": "reazuliqbal"
}
```

### `GET /users/logout`

Logs out the user.


### `GET /messages/conversations`

Returns an array of user's conversations.

**Query Parameters**

No parameters are needed.

**Example Response**
```json=
[{
  "moderators": [],
  "members": ["codebull", "reazuliqbal"],
  "blocked": false,
  "type": "dm",
  "creator": "reazuliqbal",
  "created_at": "2020-09-29T04:09:31.453Z",
  "updated_at": "2020-09-29T04:09:51.596Z",
  "id": "01EKC0T6HEVRDP0CYGZAE6VVFR"
},
.....
.....
]
```

### `GET /messages/conversation`

Returns details of a conversation.

**Query Parameters**
- `id`: String - ID of a conversation
- `ids`: String - Comma separated IDs of conversations

Either `id`, or `ids` is required.

**Example Response**
```json=
{
  "moderators": [],
  "members": ["codebull", "reazuliqbal"],
  "blocked": false,
  "type": "dm",
  "creator": "reazuliqbal",
  "created_at": "2020-09-29T04:09:31.453Z",
  "updated_at": "2020-09-29T04:09:51.596Z",
  "id": "01EKC0T6HEVRDP0CYGZAE6VVFR"
}
```

### `GET /messages/new`

Return an array of unread messages.

**Query Parameters**

No parameters are needed.

**Example Response**
```json=
[{
  "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
  "from": "codebull",
  "to": "reazuliqbal",
  "content": "Whats up?",
  "timestamp": "2020-09-29T05:31:56.399Z",
  "id": "01EKC5H3KFSWN7FE9XT497HGQT"
},
....
....
]
```

### `GET /messages/chats`

**Query Parameters**

- `conversation_id`: String. Required - Conversation ID
- `before`: Number. Optional - Timestamp from which to return messages
- `limit`: Number. Optional - Number of messages to return

**Example Response**
```json=
[{
  "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
  "from": "reazuliqbal",
  "to": "codebull",
  "content": "Hey, first message from BeeChat",
  "timestamp": "2020-09-29T04:09:31.473Z",
  "id": "01EKC0T6JHCGEPGPSMRB3X88RR",
  "read": true
}, {
  "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
  "from": "codebull",
  "to": "reazuliqbal",
  "content": "Hey Hey!",
  "timestamp": "2020-09-29T04:09:51.617Z",
  "id": "01EKC0TT81T2WGRKKYPQRXWGVA",
  "read": true
},
....
....
]
```

## WebSocket

Server: `wss://ws.beechat.hive-engine.com`

A WebSocket server is for two way communication between a server and a user, this facilitates the real-time chatting. As soon as a user connects to the WebSocket server, they should authenticate themselves otherwise the connection will be closed by the server.

The server will only accept JSON message and will also reply in JSON.

**Protocol**

```json=
{
  "type": String,
  "payload": Object
}
```

### Authentication

Authenticate the user with the server. `token` is the access token of the user.

**Payload**

- `token`: Access token of the user.

**Message**

```json=
{
  "type": "authenticate",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWF6dWxpcWJhbCIsImFkbWluIjp0cnVlLCJpYXQiOjE2MDIyMjA3MzcsImV4cCI6MTYwMjIyMTYzN30.cEMHaz_PJCdg-o-EelD7o0rmYZotLMS-SH4SXFIjZZA"
  }
}
```

**Response**

```json=
{
  "type": "status",
  "payload": {
    "authenticated": true
  }
}
```

`authenticated` could be true or false depending on the user's authentication status.

### Create Conversation

Creates a DM or group conversation.

**Payload**

- `to`: String (dm) or Array (group)
- `message`: String

**Message**
```json=
// DM
{
  "type": "create-conversation",
  "payload": {
    "to": "reazuliqbal",
    "message": "Hi"
  }
}

// GROUP
{
  "type": "create-conversation",
  "payload": {
    "to": ["codebull", "reazul-dev"],
    "message": "This is a group conversation!"
  }
}
```

**Response**

The server will respond with two messages. One for the created conversation and one for the new chat message.

```json=
{
  "type": "conversation-created",
  "payload": {
    "moderators": [],
    "members": ["codebull", "reazul-dev", "reazuliqbal"],
    "blocked": false,
    "type": "group",
    "creator": "reazuliqbal",
    "created_at": "2020-09-29T06:16:25.695Z",
    "updated_at": "2020-09-29T06:16:25.695Z",
    "id": "01EKC82JAMV9JQ1PPG9CNDF3ER"
  }
}
```

```json=
{"type":"chat-message","payload":{"id":"01EKC82JBDQD25B94NZRSH2FMX","conversation_id":"01EKC82JAMV9JQ1PPG9CNDF3ER","content":"This is a group conversation!","from":"reazuliqbal","to":null,"read":false,"timestamp":"2020-09-29T06:16:25.709Z"}}
```

### Rename Conversation

Renames a group conversation. Only the creator can rename a conversation.

**Payload**

- `conversation_id`: String - ID of the conversation to be renamed.
- `name`: String - New name

**Message**

```json=
{
  "type": "rename-conversation",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "name": "The Awesome Group"
  }
}
```

**Response**

```json=
{
  "type": "conversation-renamed",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "name": "The Awesome Group"
  }
}
```

### Leave Conversation

Leaves a conversation.

**Payload**

- `conversation_id`: String - ID of the conversation.

**Message**

```json=
{
  "type": "leave-conversation",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER"
  }
}
```

**Response**

To user:

```json=
{
  "type": "conversation-removed",
  "payload": {
    "id": "01EKC82JAMV9JQ1PPG9CNDF3ER"
  }
}
```

To all members:

```json=
{
  "type": "member-left",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "member": "codebull"
  }
}
```

### Chat Message

Send a new chat message.

**Payload**

- `conversation_id`: String - ID of the conversation.
- `to` : String (dm) or null (group) - Username of the recipient or null
- `message`: String - Message to be sent to the chat

**Message**

```json=
// DM
{
  "type": "chat-message",
  "payload": {
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
    "to": "reazuliqbal",
    "message": "Hey"
  }
}
// GROUP
{
  "type": "chat-message",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "to": null,
    "message": "Hey!"
  }
}
```

**Response**

```json=
{
  "type": "chat-message",
  "payload": {
    "id": "01EKCA9BWCJXQEPMVF047QQFXW",
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
    "content": "Hey",
    "from": "codebull",
    "to": "reazuliqbal",
    "read": false,
    "timestamp": "2020-09-29T06:55:05.613Z"
  }
}
```

### Delete Message

Deletes a message from chat. The sender can delete a message. Creator and Moderators can delete any message from a group chat.

**Payload**

- `id`: String - ID of the message

**Message**

```json=
{
  "type": "delete-message",
  "payload": {
    "id": "01EKCAE9KSKTQ7SHX0P0PZZ53Z"
  }
}
```
**Response**

```json=
{
  "type": "message-deleted",
  "payload": {
    "id": "01EKCAE9KSKTQ7SHX0P0PZZ53Z"
  }
}
```

### Acknowledgment

Sets a conversation as read.

**Payload**

- `conversation_id`: String - ID of the conversation

**Message**

```json=
{
  "type": "acknowledgment",
  "payload": {
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR"
  }
}
```
**Response**

```json=
{
  "type": "acknowledged",
  "payload": {
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR"
  }
}
```

### Add Member

Adds a new member to a group conversation. Creator and Moderators can add a new member.

**Payload**

- `conversation_id`: String - ID of the conversation to be renamed.
- `username`: String - New member's Hive username

**Message**

```json=
{
  "type": "add-member",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "bdcommunity"
  }
}
```
**Response**
```json=
{
  "type": "member-added",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "bdcommunity"
  }
}
```

### Remove Member

Removes a member from a group conversation. Creator and Moderators can remove a member.

**Payload**
- `conversation_id`: String - ID of the conversation to be renamed.
- `username`: String - Hive username of the member to be removed.

**Message**

```json=
{
  "type": "remove-member",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "bdcommunity"
  }
}
```

**Response**
```json=
{
  "type": "member-removed",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "bdcommunity"
  }
}
```

### Add Moderator

Adds a new moderator for a group conversation.

**Payload**

- `conversation_id`: String - ID of the conversation.
- `username`: String - Hive username of the member.

**Message**

```json=
{
  "type": "add-moderator",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "reazul-dev"
  }
}
```

**Response**
```json=
{
  "type": "moderator-added",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "reazul-dev"
  }
}
```

### Remove Moderator

Removes a moderator. Only the Creator can remove a moderator.

**Payload**

- `conversation_id`: String - ID of the conversation.
- `username`: String - Hive username of the member.

**Message**

```json=
{
  "type": "remove-moderator",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "reazul-dev"
  }
}
```

**Response**

```json=
{
  "type": "moderator-removed",
  "payload": {
    "conversation_id": "01EKC82JAMV9JQ1PPG9CNDF3ER",
    "username": "reazul-dev"
  }
}
```

### Request Friendship

Sends a friend request.

**Payload**

- `username`: String - Hive username

**Message**

```json=
{
  "type": "request-friendship",
  "payload": {
    "username": "reazuliqbal"
  }
}
```

**Response**

```json=
{
  "type": "friendship-requested",
  "payload": {
    "id": "01EKCB8D4PVDHBQ4MC7T4JFYAB",
    "username": "reazul-dev"
  }
}
```

### Accept Friendship

Accepts a friend request.

**Payload**

- `id`: String - ID of the friend request

**Message**

```json=
{
  "type": "accept-friendship",
  "payload": {
    "id": "01EKCB8D4PVDHBQ4MC7T4JFYAB"
  }
}
```

**Response**

```json=
{
  "type": "friendship-accepted",
  "payload": {
    "id": "01EKCB8D4PVDHBQ4MC7T4JFYAB",
    "username": "reazul-dev"
  }
}
```

### Reject Friendship

Rejects a friend request.

**Payload**

- `id`: String - ID of the friend request

**Message**

```json=
{
  "type": "reject-friendship",
  "payload": {
    "id": "01EKCBKXX88MANDK8FWNQAG8AB"
  }
}
```

**Response**

```json=
{
  "type": "friendship-rejected",
  "payload": {
    "id": "01EKCBKXX88MANDK8FWNQAG8AB"
  }
}
```

### Remove Friendship

Removes a friend.

**Payload**

- `username`: String - Hive username

**Message**

```json=
{
  "type": "remove-friendship",
  "payload": {
    "username": "reazul-dev"
  }
}
```

**Response**

```json=
{
  "type": "friendship-removed",
  "payload": {
    "username": "reazul-dev"
  }
}
```

### Block User

Blocks a user, blocking a user will remove them from the friend list.

**Payload**

 - `username`: String - Hive username

**Message**

```json=
{
  "type": "block-user",
  "payload": {
    "username": "codebull"
  }
}
```

**Response**

```json=
{
  "type": "user-blocked",
  "payload": {
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR",
    "username": "codebull"
  }
}
```

### Unblock User

Unblocks a user.

**Payload**

 - `username`: String - Hive username

**Message**

```json=
{
  "type": "unblock-user",
  "payload": {
    "username": "codebull"
  }
}
```

**Response**

```json=
{
  "type": "user-unblocked",
  "payload": {
    "username": "codebull",
    "conversation_id": "01EKC0T6HEVRDP0CYGZAE6VVFR"
  }
}
```

### Re-authentication Required

Server will send `reauthentication-required` message 1 minute before authentication is about to expire. Do listen to those messages for renewing authentication by requesting a new access token from the `/users/refresh-token` API endpoint.

**Response**

```json=
{
  "type": "reauthentication-required",
  "payload": {
    "username": "codebull"
  }
}
```

___

Please note that this service is in Beta. If you find any bugs, please report them to me @reazuliqbal (`reazuliqbal#1149`). If you need any help in implementing this chat, feel free to contact me on Discord.
