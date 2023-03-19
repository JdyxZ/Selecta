// Module imports
const {User, Room, WORLD, Message} = require("../model/model.js");
const {getTime, isNumber, isString, isArray} = require("../../public/framework.js");
const DATABASE = require("../database/database.js");

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
        }            
        else
        {
            WORLD.init(model.rooms, model.users, model.user_assets, model.object_assets);
            console.log("\n*********** MODEL INFO *********** \n");
            console.log(`World data successfully loaded!`);
            console.log(`Number of rooms ${WORLD.num_rooms}`);
        } 
    },

    // Ready callback
    onReady: function(port)
    {
        console.log("\n*********** SERVER INFO *********** \n");
        console.log(`Serving with pid ${process.pid}`); // Good practice to know my process pid
        console.log(`Server listening at port ${port}`);
        console.log("\n*********** SERVER LOG *********** \n");
        this.port = port;
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
            if (result != "OK") throw result;

            // If there is no send time, append one
            if(message.time == null) message.time = getTime();

            // Eventually, message has passed all checkings and is ready to be sent!
            this.routeMessage(message);
        } 
        // Catch errors
        catch (error) 
        {
            console.log("ERROR --> Error upon processing received message \n", error);
            const message = new Message("system", "ERROR", "Error upon processing your message", getTime());
            connection.sendUTF(JSON.stringify(message));
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
        
        // Send data about the new user
        this.onNewUserToRoom(user_id);   

        // Log
        console.log(`EVENT --> User ${user.name} has joined`);
    },

    onUserDisconnected: function(connection)
    {
        // Get user data
        const user_id = connection.user_id;
        const user = WORLD.getUser(user_id);
        
        // Delete the connection
        delete this.clients[user_id];
        
        // Update info to the other users
        const message = new Message("system", "USER_LEFT", user.id, getTime());
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
            return "TYPE_MESSAGE_ERROR";
        
        // Check that the sender is registered in the WORLD
        if(user == undefined)
            return "SENDER_EXISTS_ERROR";
        
        // Check the sender id and the connection user id matches
        if (message.sender != user_id)
            return "SENDER_MATCH_ERROR";
        
        // Check message content is not empty
        if(message.content.length == 0)
            return "MESSAGE_EMPTY_ERROR";

        // Output
        return "OK";
    },

    /***************** MESSAGE ROUTING *****************/

    // Message callbacks
    routeMessage: function(message)
    {
        // Route message        
        switch(message.type)
        {
            case "TICK":
                this.onTick(message);
                break;
            case "SUGGEST":
                this.onSuggest(message);
                break;
            case "VOTE":
                this.onVote(message);
                break;
            case "SKIP":
                this.onSkip(message);
                break;
            case "SONG_READY":
                this.onSongReady(message);
                break;
            case "EXIT":
                this.onExit(message);
                break;
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

        // Update the WORLD state
        // TODO: Actualizamos posición, rotación y escala con la matriz que nos llega del usuario
        // TODO: Actualizamos la animación del usuario
    
        // Send the message to all the people in the room except the user
        this.sendRoomMessage(message, user.room, user.id);
    },

    onSuggest: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);
        
        // Log
        console.log(`EVENT --> User ${user.name} has sent a SUGGEST message`);

        // TODO: Update suggestions property from the room of the user
        // TODO: Update suggestion property from the user instance

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);
    },

    onVote: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);
        const user_room = WORLD.getRoom(user.room);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a VOTE message`);

        // TODO: Update the voteCounter property of the suggestions property from the room of the user (WARNING: Creo que no es necesario puesto que las sugerencias se guardan por referencia. Por ende, solo habría que hacer lo de abajo)
        // TODO: Update the voteCounter property of the suggestion property from the user instance

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);
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

        // TODO: Update skipCounter property from the room of the user
        // TODO: Check if the skipCounter has reached a 70% of majority. If so, start the skipping procedure and proceed properly

        // Redirect the message to the active room users
        this.sendRoomMessage(message, user.room, sender_id);
    },

    onSongReady: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);

        // Log
        console.log(`EVENT --> User ${user.name} has sent a SONG_READY message`);

        // TODO: Send the user a private message with the song playback settings info
        // this.sendPrivateMessage(message, sender_id);
    },

    onExit: function(message)
    {
        // Get message data
        const sender_id = message.sender;
        const content = message.content;

        // Get user data
        const user = WORLD.getUser(sender_id);

        // Get room data
        // const exit = content.exit[1];
        exit = 0;
        var next_room = WORLD.getRoom(exit);
        var previous_room = WORLD.getRoom(content.room);

        // Log
        console.log(`EVENT --> User ${user.name} has sent an EXIT message`);      

        // TODO: Check and adapt this code to the new app (check the flow diagram).

        // Update server data from users
        user.room = new_room.id;
        user.position = room.range[0];
        user.target = user.position;

        // Remove the user from last room
        previous_room.people.remove(sender_id);

        // Add user to new room 
        next_room.people.push(user.id);

        // Update user and new room clients info
        this.onNewUserToRoom(user.id);

        // Notify the users of the old room that the user has left
        message = new Message("system", "USER_LEFT", user_id, getTime());   
        this.sendRoomMessage(message, previous_room, sender_id);     

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

        // Send to the new user info about their current/new room
        message = new Message("system", "ROOM", user_room.toJSON(), getTime());
        this.sendPrivateMessage(message, user_id);

        // Send to the new user its own user data
        message = new Message("system", "YOUR_INFO", user.toJSON(), getTime());
        this.sendPrivateMessage(message, user_id);        

        // Send to the new user info about the active users in the current/new room
        if(active_room_users_ids.length > 0)
        {
            message = new Message("system", "USER_JOIN", active_room_users_info, getTime());
            this.sendPrivateMessage(message, user_id);
        }

        // Send to the current/new room active users data of the new user
        message = new Message("system", "USER_JOIN", [user.toJSON()], getTime());
        this.sendRoomMessage(message, user.room, user.id);      

        // TODO: Send to the new user all app assets
    },

    filterActiveUsers(users_id)
    {
        return users_id.filter(user_id => {
            return this.clients[user_id] != undefined;
        })
    },
}

module.exports = SERVER;