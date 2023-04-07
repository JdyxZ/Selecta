# Selecta

## How does it work?


 
## Notes

Run server with nodemon: npm run server

## Execution flow

- ExpressJS -> Client - Server communication -> General client requests (log in, sign in, fetch world data, etc.) and API proxy requests.

- WebSocket -> P2P communiaction -> users actions, send message, receive message, user moving (send only target), user changing facing, change room, server pings (user join server, user leave server, etc.), etc.

## TODO

- Change between rooms.
- Create an avatar table and adapt everything towards it.
- Change require module import to the new way of importing modules with "import" clause.
- Admin type accounts.
- Room playback ready, send message.
- Play videos instead of songs and place a canvas inside the 3D world to show the video to the people in the room.
- Remove GAPI and use proxy and apicache.
- Fade suggested videos.
- Improve contains method from Array: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/some
- Adapt getEventListeners and removeEventListeners methods to framework.js.



