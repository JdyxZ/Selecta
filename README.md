# Selecta

## Features

### Log in / Sign up
- Social login and signup with Google, Twitch, Github, Discord and Facebook.
- Session cookie: Your important data is always backed up in an active session cookie on your browser and consequently there is no need to log in again if you decide to come back later (just for a month).

### Virtual Space
- Player movement and dance animation (up to 5 different dances).
- Selecta Virtual Space: Inspired by the idea of an old and industrial Berlin nightclub with some fancy decorations.

### Youtube DATA API
- Search for videos as if you were on youtube (DISCLAIMER: only the basic search features are implemented).
- Enhanced video data and video owner channel data visualization.

### Audio playback
- Javascript Audio API for playback.
- Audio Active Synchronization.
- Ytdl-core module: Decryption of audio streams and selection of best audio quality to send back to the client.
- Player bar: Displays information about the current and the next song. Moreover, displays information about the current playback time and the song duration.

### Proxy server
- Proxy route: A proxy route that disables CORS restrictions upon fetching any web content.

### Other relevant features
- Settings interface: Adjust volume and modify key binds.
- Search interface: Search for songs and suggest them to the room.
- Vote interface: Vote for suggested videos and promote them for the next playback. Suggestions are sorted in decreasing order of votes.
- Skip button: Allows to send a vote to skip the current song and play the next one (70% of agreement is required to skip a song)
- Log out button: Log out and log in with a different account or create a new one.

## How does it work?

Application user interaction flow:

- Join the application locally or socially signing up or logging in.
- Create your settings.
- Listen to music, move around, dance and enjoy.
- Interact with other users who may have similar music tastes.
- Search for a song that could fit in the current music style of the room.
- Take a look at the songs that other users have suggested and vote for the ones that you would like to listen to next.
- Observe how your suggestion goes through the roof.
- Vote for skipping the current song if you don't like the song or think that could break the current mood or can't wait to listen to the next one.
- Logout or exit the application.

## TODO

- Change between rooms.
- Create an avatar table and adapt everything towards it.
- Change require module import to the new way of importing modules with "import" clause.
- Admin-type accounts.
- Play videos instead of songs and place a canvas inside the 3D world to show the video to the people in the room.
- Fade suggested videos.
- Improve contains method from Array: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/some
- Add cache to the proxy server.
- Search logic in the votes interface.
- Transitions in the suggestions and votes interfaces.
- Upgrade framework.
- Create in/out audio settings.
- Dynamic key binds.
- Encourage users, add prizes or some recognition that other users may see.

