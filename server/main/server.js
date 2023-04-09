// Module imports
const {User, Room, WORLD, Message, Suggestion, Song} = require("../model/model.js");
const {isNumber, isString, isArray, isObject, outOfRange} = require("../../public/framework/javascript.js");
const DATABASE = require("../database/database.js");
const YOUTUBE = require("../utils/youtube.js");

/***************** SERVER *****************/
var SERVER = 
{
    // Server data
    port: null,
    clients : {},
    last_id : 0,
    messages_types: ["TICK", "SUGGEST", "VOTE", "SKIP", "EXIT", "TEST"],

    /***************** HTTP SERVER CALLBACKS *****************/

    // Init server
    init: async function() {

        // Load world data
        const [status, model] = await DATABASE.fetchModel();

        // Check errors
        if(status == "ERROR")
        {
            console.log(model);
            process.exit();
            return;
        }         
   
        // Init model
        WORLD.init(model.rooms, model.users, model.user_assets, model.object_assets);

        // Status prints
        console.log("\n*********** MODEL INFO *********** \n");
        console.log(`World data successfully loaded!`);
        console.log(`Number of rooms ${WORLD.num_rooms}`);
    },

    // Ready callback
    onListening: function(port)
    {
        console.log("\n*********** SERVER INFO *********** \n");
        console.log(`Serving with pid ${process.pid}`); // Good practice to know my process pid
        console.log(`Server listening at port ${port}`);
        console.log("\n*********** SERVER LOG *********** \n");
        this.port = port;

        // Start room playback
        this.initPlayback();
    },

    // Update world
    updateWorld: async function()
    {
        await DATABASE.updateModel(WORLD);
        console.log("EVENT --> Model successfully updated");
    },

    // Before closing
    onClose: async function()
    {
        await this.updateWorld();   
        await DATABASE.pool.end();    
        console.log("EVENT --> Server closing: Model has been successfully updated and pool connections to DATABASE removed");
    },

    /***************** WEBSOCKET CALLBACKS *****************/

    onMessage: async function(connection, ws_message)
    {
        try {
            // Parse message
            const message = JSON.parse(ws_message.utf8Data);
            
            // Check message
            const result = this.checkMessage(connection, message);
            if (result[0] != "OK") throw result;

            // If there is no send time, append one
            if(message.time == null) message.time = Date.now();

            // Eventually, message has passed general checks and is ready to be routed!
            const status = await this.routeMessage(message);
            if (status[0] != "OK") throw status;
        } 
        // Catch errors
        catch (error) 
        {
            // Log error
            console.log("ERROR --> Error upon processing received message \n", error);
            
            // Build error message
            let error_message;
            if(isArray(error) && error.length == 2 && error[1] === true)
                error_message = new Message("system", "ERROR", error[1], Date.now());
            else
                error_message = new Message("system", "ERROR", "Error upon processing your message", Date.now());
            
            // Send error message
            this.sendPrivateMessage(error_message, message.sender);
        }
    },

    onUserConnected: function(connection, user_id)
    {       
        // Get user data
        const user = WORLD.getUser(user_id);
        const user_room = user == undefined ? undefined : WORLD.getRoom(user.room);

        // Check that user exists
        if(!user)
        {
            console.log(`ERROR --> Invalid user ID ${user_id} in function onUserConnected: User doesn't exist`);
            return;
        }

        // Add the user to the active users of the room
        user_room.addActiveUser(user);        
        
        // Store connection
        connection.user_id = user_id;
        this.clients[user_id] = connection; 
        
        // Send data to new user and users of the room
        this.onNewUserToRoom(user_id);

        // Build asset object
        const assets = 
        {
            user_assets: WORLD.user_assets, 
            object_assets: WORLD.object_assets
        }

        // Send to the new user all the app assets
        message = new Message("system", "ASSETS", assets, Date.now());
        this.sendPrivateMessage(message, user.id);

        // Log
        console.log(`EVENT --> User ${user.name} has joined`);
    },

    onUserDisconnected: function(connection)
    {
        // Get user data
        const user_id = connection.user_id;
        const user = WORLD.getUser(user_id);
        const user_room = WORLD.getRoom(user.room);

        // Remove user from active users of the room
        user_room.removeActiveUser(user); 

        // Remove connection
        this.clients.remove(user_id);
        
        // Update info to the other users
        const message = new Message("system", "USER_LEFT", user.id, Date.now());
        this.sendRoomMessage(message, user.room, user_id);

        // Log
        console.log(`EVENT --> User ${user.name} has left`);
    },

    /***************** MESSAGE CHECKING *****************/

    // Check message for security reasons
    checkMessage: function(connection, message)
    {
        // Get some vars
        const user_id = connection.user_id;
        const user = WORLD.getUser(user_id);
        const user_current_room = user.room;

        // Check the sender is sending a valid type of message 
        if(!this.messages_types.includes(message.type))
            return ["TYPE_MESSAGE_ERROR", true];
        
        // Check that the sender is registered in the WORLD
        if(user == undefined)
            return ["SENDER_EXISTS_ERROR", false];
        
        // Check the sender id and the connection user id matches
        if (message.sender != user_id)
            return ["SENDER_MATCH_ERROR", false];

        // Output
        return ["OK", false];
    },

    /***************** MESSAGE ROUTING *****************/

    // Message callbacks
    routeMessage: function(message)
    {
        // Route message        
        switch(message.type)
        {
            case "TICK":
                return this.onTick(message);
            case "SUGGEST":
                return this.onSuggest(message);
            case "VOTE":
                return this.onVote(message);
            case "SKIP":
                return this.onSkip(message);
            case "EXIT":
                return this.onExit(message);
            case "TEST":
                return this.onTest(message);
            default:
                return ["WTF", false];
        }
    },

    onTick: function(message)
    {   
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a TICK message`);

        // Do some checks
        if(content.model == undefined && content.animation == undefined) return ["TICK_WRONG_CONTENT", true];
        if(content.model && !isObject(content.model)) return ["TICK_WRONG_MODEL_TYPE", true];
        if(content.animation && !isString(content.animation)) return ["TICK_WRONG_ANIMATION_TYPE", true];

        // Update the WORLD state
        if(content.model != undefined) user.model = content.model;  
        if(content.animation != undefined) user.animation = content.animation;      
        
        // Send the message to all the users in the room except the user
        this.sendRoomMessage(message, user.room, user.id);

        // Output status
        return ["OK", false];
    },

    onSuggest: async function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);

        // Get suggestion IDs
        const old_songID = user.song == undefined ? undefined : user.song.ID;
        const new_songID = content;

        // Get suggestion
        const suggestion = user_room.getSuggestion(new_songID);
        
        // Log
        console.log(`EVENT --> User ${user.name} has sent a SUGGEST message`);

        // Fetch song data
        let videoData = await YOUTUBE.getVideosInfo(new_songID);
        
        // Do some checks
        const check = YOUTUBE.checkVideosInfo(videoData);
        if(check != "OK") return [check, true];
        if(suggestion != undefined && suggestion.userID != sender_id) return ["SUGGEST_SONG_ALREADY_SUGGESTED", true];

        // Get first video
        videoData = videoData[0];

        // Fetch channel's song data from Youtube API
        const channelData = (await YOUTUBE.getChannelsInfo(videoData.publisherChannel.ID))[0];
        if(channelData) videoData.publisherChannel = channelData;

        // Get & Create song data
        const oldSong = WORLD.getSong(user_room, old_songID);
        const newSong = new Song(videoData);

        // Update the WORLD state
        if(old_songID == undefined)
        {
            WORLD.addSuggestion(user_room, user, new_songID);
            WORLD.addSong(user_room, user, newSong);
        }
        else if(new_songID == old_songID)
        {
            WORLD.removeSuggestion(user_room, user, new_songID);
            WORLD.removeSong(user_room, user, newSong);
        }
        else
        {
            WORLD.updateSuggestion(user_room, user, old_songID, new_songID);
            WORLD.updateSong(user_room, user, oldSong, newSong);
        }

        // Fill the content of the message with the video data
        message.content = newSong;

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);

        // Output status
        return ["OK", false];
    },

    onVote: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);

        // Get vote content
        const songID = content;

        // Get suggestion
        const suggestion = user_room.getSuggestion(songID);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a VOTE message`);

        // Do some checks
        if(suggestion == undefined) return ["VOTE_SONG_DOES_NOT_BELONG_TO_THE_ROOM", true];   
        if(suggestion.userID == sender_id) return ["VOTE_SONG_BELONGS_TO_THE_USER", true];

        // Set aux var
        const already_voted = user.votes.includes(songID);

        // Update the WORLD state
        if(already_voted)
        {
            user.votes.remove(songID);
            suggestion.vote_counter--;
        }    
        else
        {
            user.votes = [...user.votes, songID];
            suggestion.vote_counter++;
        }
        console.log(user_room.suggestions);

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);

        // Output status
        return ["OK", false];
    },

    onSkip: function(message)
    {
        // Get message data
        const sender_id = message.sender;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a SKIP message`);

        // Do some checks
        if(user_room.skipping) return ["SKIP_SONG_IS_SKIPPING", true];        

        // Update WORLD state
        if(user.skip)
        {
            user.skip = false;
            user_room.skip_counter--;
        }
        else
        {
            user.skip = true;
            user_room.skip_counter++;
        }

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);

        // Check skip counter
        if(user_room.skip_counter / user_room.num_active_users > WORLD.skipping_threshold)
            this.skipSong(user.room);

        // Output status
        return ["OK", false];
    },

    onExit: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);

        // Get room data
        const previous_room = WORLD.getRoom(user.room);
        const next_room = WORLD.getRoom(exit);

        // Log
        console.log(`EVENT --> User ${user.name} has sent an EXIT message`);      

        // TODO (check the flow diagram).
        // OBSERVACIÓN: Importante utilizar la funcion WORLD.removeUserfromRoom()

        // Update user and new room clients info
        this.onNewUserToRoom(user.id);

        // Notify the users of the old room that the user has left
        message = new Message("system", "USER_LEFT", user_id, Date.now());   
        this.sendRoomMessage(message, previous_room, sender_id);    
        
        // Output status
        return ["OK", false];
    },

    onTest: function(message)
    {
        // Estimate latency 
        const arrivalTime = message.time;
        const latency = Date.now() - arrivalTime;

        // Show
        const room = WORLD.getRoom(1);
        console.log(latency, room.playback_time);

        // Output status
        return ["OK", false];
    },

    /***************** SERVER ACTIONS *****************/

    playSong: function(roomID, song)
    {
        // Get room
        const room = WORLD.getRoom(roomID);

        // Check song
        if(!song || !song.audioStream)
        {
            room.timers.playSong = null;
            return;
        }

        // Update room playback settings
        room.current_song = song;
        room.next_song = room.future_song;
        room.future_song = null;
        room.skipping = false;
        room.skipping_time = 0;

        // Set aux vars
        const song_duration = song.duration.totalMiliseconds;

        // Clear timers
        clearTimeout(room.timers.chooseNextSongs);
        clearTimeout(room.timers.playSong);

        // Set timers
        room.timers.chooseNextSongs = setTimeout(() => {
            this.chooseNextSongs(roomID);
        }, song_duration - WORLD.loading_duration);

        room.timers.playSong = setTimeout(() => {
            this.playSong(roomID, room.next_song);
        }, song_duration);

        // Clear intervals
        clearInterval(room.intervals.playbackTime);

        // Set intervals data
        room.reference_time = performance.now();
        room.playback_time = 0; // [ms]
        
        // Set intervals
        room.intervals.playbackTime = setInterval(() => {
            room.playback_time = performance.now() - room.reference_time;
        }, WORLD.playback_update_frequency);
    },

    chooseNextSongs: async function(roomID)
    {
        // Get room data
        const room = WORLD.getRoom(roomID); 
        const sortedSuggestions = room.getSortedSuggestions(); // Most Voted Suggestion

        // Declare next song
        let next_songID = null;
        let future_songID = null;

        // Consider different case scenarios
        if(sortedSuggestions.length == 0)
        {
            if(room.next_song)
            {
                next_songID = room.next_song.ID;
                future_songID = room.playlist_items.clone(next_songID).pickRandom();
            }
            else
            {
                next_songID = room.playlist_items.pickRandom();
                future_songID = room.playlist_items.clone(next_songID).pickRandom();
            }
        }           
        else if(sortedSuggestions.length == 1) 
        {
            next_songID = sortedSuggestions[0].songID;
            future_songID = room.playlist_items.pickRandom();
        }
        else
        {
            next_songID = sortedSuggestions[0].songID;
            future_songID = sortedSuggestions[1].songID;
        }

        // Fetch songs data with Youtube API
        const videosData = await YOUTUBE.getVideosInfo([next_songID, future_songID]);

        // Assign song data
        const nextVideoData = videosData.getObject({ID: next_songID});
        const futureVideoData = videosData.getObject({ID: future_songID});

        // Check song data
        const check = YOUTUBE.checkVideosInfo([nextVideoData, futureVideoData]);
        if(check != "OK")
        {
            console.log(`ERROR ---> YOUTUBE.checkVideoInfo: ${check}`);
            return;
        }

        // Get publisher IDs
        const nextPublisherID = nextVideoData.publisherChannel.ID;
        const futurePublisherID = futureVideoData.publisherChannel.ID;
        
        // Fetch channel data of the songs with Youtube API
        const channelsData = await YOUTUBE.getChannelsInfo([nextPublisherID, futurePublisherID]);

        // Assign channel data
        nextVideoData.publisherChannel = channelsData.getObject({ID: nextPublisherID});
        futureVideoData.publisherChannel = channelsData.getObject({ID: futurePublisherID});

        // Fetch audioStream with Youtube Downloading module
        const nextAudioStream = await YOUTUBE.fetchAudioStreams(next_songID);

        // Check
        if(nextAudioStream[0] == "ERROR")
        {
            console.log(`ERROR ---> YOUTUBE.fetchAudioStreams: ${nextAudioStream[1]}`);
            return;
        }
        
        // Assign url info
        nextVideoData.audioStream = nextAudioStream[1];

        // Create new instances of the class Song with songs data
        const next_song = new Song(nextVideoData); 
        const future_song = new Song(futureVideoData);

        // Show the selected song title
        console.log(`EVENT ---> Room ${room.name} has choosen ${next_song.title} as next song`);
        console.log(`EVENT ---> Room ${room.name} has choosen ${future_song.title} as future song`);
        
        // Get selected suggestion's user
        const suggestion = room.getSuggestion(next_songID);
        const user = suggestion !== undefined ? WORLD.getUser(suggestion.userID) : null;        

        // Update room data
        WORLD.resetSkipVotes(room);
        WORLD.removeSuggestion(room, user, next_song);
        room.skipping = true;
        room.skip_counter = 0;
        room.skipping_time = room.playback_time;
        room.next_song = next_song;
        room.future_song = future_song;

        // If the playback timer is not active, play the song
        if(room.timers.playSong == null)
            this.playSong(roomID, next_song);

        // Get playbackInfo of the next and future song
        const nextPlaybackInfo = this.getPlaybackInfo(room, next_song);
        const futurePlaybackInfo = this.getPlaybackInfo(room, future_song);

        // Build playback messages
        const next_playback_message = new Message("system", "PLAY_SONG", nextPlaybackInfo, Date.now());
        const future_playback_message = new Message("system", "PLAY_SONG", futurePlaybackInfo, Date.now());

        // Send messages
        this.sendRoomMessage(next_playback_message, room.id, []);
        this.sendRoomMessage(future_playback_message, room.id, []);
    },

    skipSong: function(roomID)
    {
        // Get room
        const room = WORLD.getRoom(roomID);

        // Clear current song timers
        clearTimeout(room.timers.chooseNextSongs);
        clearTimeout(room.timers.playSong);

        // Play song after some loading seconds
        room.timers.playSong = setTimeout(() => {
            this.playSong(roomID, room.next_song)
        }, WORLD.loading_duration);

        // Choose next song
        this.chooseNextSongs(roomID);
    },

    initPlayback: async function()
    {
        for (const roomID in WORLD.rooms)
        {
            // Get room
            const room = WORLD.getRoom(roomID);

            // Get playlist items
            const playlist_items = await YOUTUBE.getPlaylistItems(room.playlist);

            // Check
            if(!playlist_items)
            {
                if(playlist_items === undefined) console.log(`ERROR ---> The playlist ${room.playlist} does not exist or does not have no item yet`);
                if(playlist_items === null) console.log(`ERROR ---> Something went wrong upon fetching default room playlist items`);
                return;
            }

            // Store playlist items
            room.playlist_items = playlist_items.map(item => item.ID);

            // Start song cycle
            await this.chooseNextSongs(roomID);
        }

        // Notify the initialization of the playback of the rooms is done
        console.log(`EVENT ---> Room playback ready`);
    },

    getPlaybackInfo: function(room, song)
    {
        // Check
        if(!song || (song != room.current_song && song != room.next_song && song != room.future_song))
        {
            console.log("Error ---> getPlaybackInfo: Invalid song");
            return null;
        }

        // Calculate playback time
        let playbackTime;
        if(song === room.current_song)
        {
            playbackTime = room.playback_time;
        }
        else if (song === room.next_song)
        {
            if(room.skipping) playbackTime = room.playback_time - (room.skipping_time + WORLD.loading_duration);
            else playbackTime = "next";
        }
        else
        {
            playbackTime = "future";
        }

        // Build playbackInfo object
        const playbackInfo =
        {
            song,
            playbackTime
        };

        // Return object
        return playbackInfo;
    },

    /***************** MESSAGE DELIVERY *****************/

    sendAllClientsMessage: function(message)
    {
        this.clients.values().forEach(connection => {
            connection.sendUTF(JSON.stringify(message));
        });
    },

    sendRoomMessage: function(message, room_id, users_id)
    {
        // Some checks before proceeding
        if (isNumber(users_id) || isString(users_id)) users_id = users_id.toArray();    
        else if (!isArray(users_id))
        {
            console.log(`ERROR ---> Invalid input "${users_id}" in function sendRoomMessage of SERVER. Message won't be send`);
            return;
        }

        // Get active users of the room
        const room = WORLD.getRoom(room_id);
        const room_users = room.getActiveUsers(users_id);

        // Iterate through room active users
        for(user_id of room_users)
        {
            // Get connection
            const connection = this.clients[user_id];
            if(connection == undefined)
                continue; 

            // In case there is no connection for this id
            if(connection)
                connection.sendUTF(JSON.stringify(message));
        }
    },

    sendPrivateMessage: function(message, addressees)
    {
        // Some checks before proceeding
        if (isNumber(addressees) || isString(addressees)) addressees = addressees.toArray();    
        else if (!isArray(users_id))
        {
            console.log(`ERROR ---> Invalid input "${addressees}" in function sendPrivateMessage of SERVER. Message won't be send`);
            return;
        }

        // Iterate through addresses
        for(const user_id of addressees)
        {
            // Get connection
            const connection = this.clients[user_id];
            if(connection == undefined)
                continue;
    
            // Send message to the user
            connection.sendUTF(JSON.stringify(message));
        }      
    },

    /***************** AUXILIAR METHODS *****************/

    onNewUserToRoom: function(user_id)
    {
        // Get all data stuff
        let message;
        const user = WORLD.getUser(user_id); 
        const user_room = WORLD.getRoom(user.room);
        const active_users_data = user_room.getActiveUsersJSONs(user.id);
        const song = user_room.skipping ? user_room.next_song : user_room.current_song;

        // Send to the new user info about their current/new room
        message = new Message("system", "ROOM", user_room.toJSON(), Date.now());
        this.sendPrivateMessage(message, user_id);

        // Send to the new user its own user data
        message = new Message("system", "YOUR_INFO", user.toJSON(), Date.now());
        this.sendPrivateMessage(message, user_id);        

        // Send to the new user info about the active users in the current/new room
        if(active_users_data.length > 0)
        {
            message = new Message("system", "USER_JOIN", active_users_data, Date.now());
            this.sendPrivateMessage(message, user_id);
        }

        // Send to the current/new room active users data of the new user
        message = new Message("system", "USER_JOIN", user.toJSON(), Date.now());
        this.sendRoomMessage(message, user.room, user_id); 

        // Send to the new user info about the room current playback
        if(user_room.current_song)
        {
            const playbackInfo = this.getPlaybackInfo(user_room, user_room.current_song);
            message = new Message("system", "PLAY_SONG", playbackInfo, Date.now());
            this.sendPrivateMessage(message, user_id);
        };

        // Send to the new user info about the room next playback
        if(user_room.next_song)
        {
            const playbackInfo = this.getPlaybackInfo(user_room, user_room.next_song);
            message = new Message("system", "PLAY_SONG", playbackInfo, Date.now());
            this.sendPrivateMessage(message, user_id);
        }

        // Send to the new user info about the room future playback
        if(user_room.future_song)
        {
            const playbackInfo = this.getPlaybackInfo(user_room, user_room.future_song);
            message = new Message("system", "PLAY_SONG", playbackInfo, Date.now());
            this.sendPrivateMessage(message, user_id);
        }
    },

    filterActiveUsers(users_id)
    {
        return users_id.filter(user_id => {
            return this.clients[user_id] != undefined;
        })
    },
}

module.exports = SERVER;