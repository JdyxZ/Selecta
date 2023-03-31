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
    messages_types: ["TICK", "SUGGEST", "VOTE", "SKIP", "SONG_READY", "EXIT"],

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
    onReady: function(port)
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

    onMessage: function(connection, ws_message)
    {
        try {
            // Parse message
            const message = JSON.parse(ws_message.utf8Data);
            
            // Check message
            const result = this.checkMessage(connection, message);
            if (result[0] != "OK") throw result;

            // If there is no send time, append one
            if(message.time == null) message.time = Date.getTime();

            // Eventually, message has passed general checkings and is ready to be routed!
            const status = this.routeMessage(message);
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
                error_message = new Message("system", "ERROR", error[1], Date.getTime());
            else
                error_message = new Message("system", "ERROR", "Error upon processing your message", Date.getTime());
            
            // Send error message
            this.sendPrivateMessage(error_message, message.sender);
        }
    },

    onUserConnected: function(connection, user_id)
    {       
        // Get user data
        const user = WORLD.getUser(user_id);

        // Check that user exists
        if(!user)
        {
            console.log(`ERROR --> Invalid user ID ${user_id} in function onUserConnected: User doesn't exist`);
            return;
        }

        // Just in case
        const user_room = WORLD.getRoom(user.room);
        if(!user_room.people.includes(user_id)) user_room.people = [...user_room.people, user_id];
        
        // Store connection
        connection.user_id = user_id;
        this.clients[user_id] = connection; 
        
        // Send data to new user and people of the room
        this.onNewUserToRoom(user_id);

        // Build asset object
        const assets = 
        {
            user_assets: WORLD.user_assets, 
            object_assets: WORLD.object_assets
        }

        // Send to the new user all the app assets
        message = new Message("system", "ASSETS", JSON.stringify(assets), Date.getTime());
        this.sendPrivateMessage(message, user.id);

        // Log
        console.log(`EVENT --> User ${user.name} has joined`);
    },

    onUserDisconnected: function(connection)
    {
        // Get user data
        const user_id = connection.user_id;
        const user = WORLD.getUser(user_id);

        // Remove connection
        this.clients.remove(user_id);
        
        // Update info to the other users
        const message = new Message("system", "USER_LEFT", user.id, Date.getTime());
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
        
        // Check message content is not empty
        if(message.content.length == 0)
            return ["MESSAGE_EMPTY_ERROR", true];

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

        console.log("ANIMATION")
        console.log(content.animation)

        // Do some checkings
        if(content.model == undefined && content.animation == undefined) return ["TICK_WRONG_CONTENT", true];
        if(content.model && !isObject(content.model)) return ["TICK_WRONG_MODEL_TYPE", true];
        if(content.animation && !isString(content.animation)) return ["TICK_WRONG_ANIMATION_TYPE", true];

        // Update the WORLD state
        if(content.model != undefined) user.model = content.model;  
        if(content.animation != undefined) user.animation = content.animation;      
        
        // Send the message to all the people in the room except the user
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
        const old_songID = user.suggestion.songID;
        const new_songID = content;

        // Get suggestion
        const suggestion = user_room.getSuggestion(new_songID);
        
        // Log
        console.log(`EVENT --> User ${user.name} has sent a SUGGEST message`);

        // Fetch song data
        const videoData = await YOUTUBE.getVideosInfo(new_songID)[0];

        // Do some checkings
        const check = YOUTUBE.checkVideoInfo(videoData);
        if(check != "OK") return [check, true];
        if(suggestion != undefined && suggestion.userID != sender_id) return ["SUGGEST_SONG_ALREADY_SUGGESTED", true];

        // Fetch channel's song data from Youtube API
        const channelData = await YOUTUBE.getChannelsInfo(videoData.publisherChannel.ID)[0];
        if(channelData) videoData.publisherChannel = channelData;

        // Update the WORLD state
        if(old_songID == undefined)
            WORLD.addSuggestion(user_room, user, new_songID);
        else if(new_songID == old_songID)
            WORLD.removeSuggestion(user_room, user, new_songID);
        else
            WORLD.updateSuggestion(user_room, old_songID, new_songID);

        // Fill the content of the message with the video data
        message.content = videoData;

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

        // Do some checkings
        if(suggestion == undefined) return ["VOTE_SONG_DOES_NOT_BELONG_TO_THE_ROOM", true];   
        if(suggestion.userID == sender_id) return ["VOTE_SONG_BELONGS_TO_THE_USER", true];

        // Set aux var
        const already_voted = songID in user.votes;

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

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);

        // Output status
        return ["OK", false];
    },

    onSkip: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a SKIP message`);

        // Do some checkings
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
        if(user_room.skip_counter / user_room.num_people > WORLD.skipping_threshold)
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
        message = new Message("system", "USER_LEFT", user_id, Date.getTime());   
        this.sendRoomMessage(message, previous_room, sender_id);    
        
        // Output status
        return ["OK", false];
    },

    /***************** SERVER ACTIONS *****************/

    playSong: function(roomID, song)
    {
        // Get room
        const room = WORLD.getRoom(roomID);

        // Check song
        if(!song)
            room.timers.playSong = null;

        // Update room playback settings
        room.current_song = song;
        room.next_song = null;
        room.skipping = false;
        room.skipping_time = 0;

        // Set aux vars
        const song_duration = song.duration.totalMiliseconds;

        // Clear intervals
        clearInterval(room.intervals.playbackTime);
        room.playback_time = 0.0;

        // Set timers
        room.timers.chooseNextSong = setTimeout(() => {
            this.chooseNextSong(roomID)
        }, song_duration - WORLD.loading_duration);

        room.timers.playSong = setTimeout(() => {
            this.playSong(roomID, room.next_song)
        }, song_duration);
        
        // Set intervals
        room.intervals.playbackTime = setInterval(() => {
            room.playback_time += WORLD.playback_update_frequency / 1000
        }, WORLD.playback_update_frequency);
    },

    chooseNextSong: async function(roomID)
    {
        // Get room data
        const room = WORLD.getRoom(roomID); 
        const MVS = room.getMostVotedSuggestions(); // Most Voted Suggestion

        // Declare next song
        let next_songID = null;

        // Consider different case scenarios
        if(MVS.length == 0)           
            next_songID = room.playlist_items.pickRandom();
        else if(MVS.length == 1) 
            next_songID = MVS[0].songID;
        else
            next_songID = MVS.pickRandom().songID;

        // Fetch song data with Youtube API
        const videoData = (await YOUTUBE.getVideosInfo(next_songID))[0];

        // Check song data
        const check = YOUTUBE.checkVideoInfo(videoData);
        if(check != "OK")
        {
            console.log(`ERROR -> ${check}`);
            return;
        }
        
        // Fetch channel's song data with Youtube API
        const channelData = await YOUTUBE.getChannelsInfo(videoData.publisherChannel.ID)[0];
        if(channelData) videoData.publisherChannel = channelData;

        // Fetch audioStream with Youtube Downloading module
        const audioStream = await YOUTUBE.fetchAudioStreams(next_songID);

        // Check
        if(audioStream[0] == "ERROR")
            return
        
        // Assign url info
        videoData.audioStream = audioStream[1];

        // Create new instance ofSong with song data
        const next_song = new Song(videoData); 
        
        // Get selected suggestion's user
        const suggestion = room.getSuggestion(next_songID);
        const user = suggestion !== undefined ? WORLD.getUser(suggestion.userID) : null;

        // Update room data
        room.next_song = next_song;
        room.skipping = true;
        room.skipping_time = room.playback_time;
        room.skip_counter = 0;
        WORLD.removeSuggestion(room, user, next_song);

        // Update user data
        room.people.forEach(user => {
            user.skip = false;
        });

        // If the playback timer is not active, play the song
        if(room.timers.playSong == null)
            this.playSong(roomID, next_song);

        // Get playbackInfo of the song
        const playbackInfo = this.getPlaybackInfo(room, next_song);
        
        // Send playbackInfo of the song to the room
        const playback_message = new Message("system", "PLAY_SONG", JSON.stringify(playbackInfo), Date.getTime());
        this.sendRoomMessage(playback_message, room.id, []);

        // Output
        return next_song;
    },

    skipSong: function(roomID)
    {
        // Get room
        const room = WORLD.getRoom(roomID);

        // Clear current song timers
        clearTimeout(room.timers.chooseNextSong);
        clearTimeout(room.timers.playSong);

        // Play song after some loading seconds
        room.timers.playSong = setTimeout(() => {
            this.playSong(roomID, next_song)
        }, WORLD.loading_duration);

        // Choose next song
        const next_song = this.chooseNextSong(roomID);
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
            await this.chooseNextSong(roomID);
        }
    },

    getPlaybackInfo: function(room, song)
    {
        // Check
        if(!song || (song != room.current_song && song != room.next_song))
        {
            console.log("Error ---> getPlaybackInfo: Invalid song");
            return null;
        }

        // Build playbackInfo object
        const playbackInfo =
        {
            song: song,
            playbackTime: room.current_song.ID === song.ID ? room.playback_time : room.playback_time - (room.skipping_time + WORLD.loading_time)
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
        // Some checkings before proceeding
        if (isNumber(users_id) || isString(users_id)) users_id = users_id.toArray();    
        else if (!isArray(users_id))
        {
            console.log(`ERROR ---> Invalid input "${users_id}" in function sendRoomMessage of SERVER. Message won't be send`);
            return;
        }

        // Get active users of the room
        const room = WORLD.getRoom(room_id);
        const room_users = room.people.clone().remove(users_id);

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
        // Some checkings before proceeding
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
        const room_users = user_room.people.clone().remove(user_id);
        const active_room_users_ids = this.filterActiveUsers(room_users); 
        const [_, active_room_users_info] = user_room.getRoomUsersInfo(active_room_users_ids, "INCLUSIVE");
        const song = user_room.skipping ? user_room.next_song : user_room.current_song;

        // Send to the new user info about their current/new room
        message = new Message("system", "ROOM", user_room.toJSON(), Date.getTime());
        this.sendPrivateMessage(message, user_id);

        // Send to the new user its own user data
        message = new Message("system", "YOUR_INFO", user.toJSON(), Date.getTime());
        this.sendPrivateMessage(message, user_id);        

        // Send to the new user info about the active users in the current/new room
        if(active_room_users_ids.length > 0)
        {
            message = new Message("system", "USER_JOIN", active_room_users_info, Date.getTime());
            this.sendPrivateMessage(message, user_id);
        }

        // Send to the current/new room active users data of the new user
        message = new Message("system", "USER_JOIN", [user.toJSON()], Date.getTime());
        this.sendRoomMessage(message, user.room, user.id); 
        
        // Send to the new user info about the room current playback
        if(user_room.current_song)
        {
            const playbackInfo = this.getPlaybackInfo(user_room, user_room.current_song);
            message = new Message("system", "PLAY_SONG", JSON.stringify(playbackInfo), Date.getTime());
            this.sendPrivateMessage(message, user_id);
        };

        // Send to the new user info about the room future playback
        if(user_room.next_song)
        {
            const playbackInfo = this.getPlaybackInfo(user_room, user_room.next_song);
            message = new Message("system", "PLAY_SONG", JSON.stringify(playbackInfo), Date.getTime());
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