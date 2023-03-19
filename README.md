# Jabbon
 
## Notes

Run server with nodemon: npm run server

## Execution flow

Suggestion: 
    - ExpressJS -> Client - Server communication -> General client requests (log in, sign in, fetch world data, etc.), but also server pings (user join server, user leave server, etc.).
    - WebSocket -> P2P communiaction -> chat and users actions: typing, send message, receive message, user moving (send only target), user changing facing, change room, etc.

## TODO

- Change between rooms.
- Create an avatar table and adapt everything towards it.
- Improve chat: Code structure in client, private and public chats with chat menu, emojis in the chat, typing messages, status messages, etc.
- Reestructure Agenjo's code: Create a Canvas object in canvas.js and more.
- Use nodemon in UPF server.
- Change Requires to Imports.
- When fail, go to index page with all links.
- Admin type accounts.
- Add CSS to pages.
- Use includes in EJS views.


