/***************** CLIENT *****************/
var CLIENT =
{
    // Client data
    server_protoccol: null,
    server_port: null,
    server_address: null,
    protocol: null,
    api_credentials: null,
    socket: null,
    debug: null,
    
    init: async function()
    {
        // Fetch server settings
        const response = await this.fetchServerResources();

        // Set server settings        
        this.server_protocol = response.settings.protocol;
        this.server_address = response.settings.address;
        this.server_port = response.settings.port;

        // Set API credentials
        this.api_credentials = response.api_credentials;

        // New WebSocket instance
        this.socket = new WebSocket(`${this.server_protocol == "secure" ? "wss://" : "ws://"}${this.server_address}:${this.server_port}`);

        // Callbacks
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    },

    fetchServerResources: async function ()
    {
        try
        {
            // URLs
            const ss_url = "/server_settings";
            const ac_url = "/api_credentials";

            // Fetch resources from url    
            const ss_response = await fetch(ss_url, {method: "GET"}); 
            const ac_response = await fetch(ac_url, {method: "GET"});
        
            // Check responses
            if (ss_response.status !== 200) {
                console.log(`HTTP-Error ${ss_response.status} upon fetching url ${ss_url} `);
                throw "Bad response";
            };

            if (ac_response.status !== 200) {
                console.log(`HTTP-Error ${ac_response.status} upon fetching url ${ac_url} `);
                throw "Bad response";
            };
                
            // Convert responses into response json
            const response = 
            {
                settings: await ss_response.json(),
                api_credentials: await ac_response.json()
            }

            // Return settings
            return response;
        }
        catch(error)
        {
            console.log(error);
            throw "Something went wrong upon fetching server settings";
        }
    },

    // WebSocket callbacks
    onOpen: function()
    {
        console.log("Connecting!");
    },

    onClose: function()
    {
        console.log("Disconnecting!");
    },
    
    onMessage: function(ws_message)
    {
        // Process message
        const message = JSON.parse(ws_message.data);

        switch(message.type)
        {
            case "ROOM":
                this.setRoom(message);
                break;
            case "YOUR_INFO":
                this.setMyUser(message);
                break;
            case "ASSETS":
                this.setAssets(message);
                break;
            case "USER_JOIN":
                this.onUserJoin(message);
                break;
            case "USER_LEFT":
                this.onUserLeft(message);
                break;
            case "TICK":
                this.onTick(message);
                break;
            case "EXIT":
                this.onExit(message);
                break;
            case "SUGGEST":
                this.onSuggest(message);
                break;
            case "VOTE":
                this.onVote(message);
                break;
            case "FETCH_SONG":
                this.onFetchSong(message);
                break;
            case "PLAY_SONG":
                this.onPlaySong(message);
                break;
            case "SHUT_DOWN":
                this.onShutDown(message);
                break;
            case "ERROR":
                this.onError(message);
                break;
        }        
        
    },
    
    // Message callbacks
    setRoom: function(message)
    {
        // Log
        console.log("New ROOM message received\n");
        console.table(message.content);

        // Unpack message data
        const room = message.content;

        // Callback
        CONTROLLER.setRoom(room);

    },

    setMyUser: function(message)
    {
        // Log
        console.log("New YOUR_INFO message received\n");
        console.table(message.content);

        // Unpack message data
        const users = message.content

        // Callback
        CONTROLLER.setMyUser(users);
    },

    setAssets: function(message)
    {
        // Log
        console.log("New ASSETS message received\n");
        console.table(message.content);

        // Unpack message data
        const user_assets = message.content.user_assets;
        const object_assets = message.content.object_assets;

        // Callback
        CONTROLLER.setAvatarAssets(user_assets);
        CONTROLLER.setObjectAssets(object_assets);
    },

    onUserJoin: function(message)
    {
        // Log
        console.log("New USER_JOIN message received\n");
        console.table(message.content);

        // Unpack message data
        const users = message.content;

        // Callback
        CONTROLLER.onUserJoin(users);
    },

    onUserLeft: function(message)
    {
        // Log
        console.log("New USER_LEFT message received\n");
        console.table(message.content);

        // Unpack message data
        const user_id = message.content;
        
        // Callback
        CONTROLLER.onUserLeft(user_id);
    },

    onTick: function(message)
    {
        // Log
        console.log("New TICK message received\n");
        console.table(message.content);

        // Unpack message data
        const sender_id = message.sender;
        const user = MODEL.users_obj[sender_id];
        const model = message.content.model;
        const animation = message.content.animation;

        // Check
        if(!user)
        {
            console.error(`onTick callback --> The user id ${sender_id} is not registered`);
            return;
        }

        // Callback
        CONTROLLER.onTick(user, model, animation);
    },

    onExit: function(message)
    {
        // Log
        console.log("New EXIT message received\n");
        console.table(message.content);

        // Callback
        CONTROLLER.onExit();
    },

    onSuggest: function(message)
    {
        // Log
        console.log("New SUGGEST message received\n");
        console.table(message.content);

        // Unpack message data
        const suggestionID = message.content;
        const suggestion = suggestions[suggestionID];
        const user = MODEL.users_obj[suggestion.userID];

        // Callback
        CONTROLLER.onSuggest(user, suggestion);
    },

    onVote: function(message)
    {
        // Log
        console.log("New VOTE message received\n");
        console.table(message.content);

        // Unpack message data
        const songID = message.content.songID;
        const requester = message.content.requester;
        const user = MODEL.users_obj[requester];
    
        // Callback
        CONTROLLER.onVote(user, songID);
    },

    onFetchSong: function(message)
    {
        // Log
        console.log("New FETCH_SONG message received\n");
        console.table(message.content);

        // Unpack message data
        const songID = message.content;

        // Callback
        CONTROLLER.onFetchSong(songID);
    },

    onPlaySong: function(message)
    {
        // Log
        console.log("New PLAY_SONG message received\n");
        console.table(message.content);

        // Unpack message data
        const songID = message.content.playbackInfo.song;
        const playbackTime = message.content.playbackInfo.playbackTime;

        // Guess which song is the one to play
        let type;
        if(songID === MODEL.current_song.songID) type = "current";
        else if(songID === MODEL.current_song.songID) type = "next";
        else
        {
            console.log(`onPlaySong callback --> The song ${songID} is not the current nor the next one`);
            return;
        }

       // Callback
       CONTROLLER.onPlaySong(type, playbackTime);
    },

    onShutDown: function(message)
    {
        // Log
        console.log("New SHUT_DOWN message received\n");
        console.table(message.content);

        // TODO
    },

    onError: function(message)
    {
        // Log
        console.log("New ERROR message received\n");
        console.table(message.content);

        // TODO
    },

    // Methods
    sendMessage: function(message)
    {
        // Send message to user
        this.socket.send(JSON.stringify(message));
    },
}

// Before reloading page, close connection with the WebSocket Server
window.onbeforeunload = function() {
    if(CLIENT.socket != null)
    {
        CLIENT.socket.onclose = function () {}; // disable onclose handler first
        CLIENT.socket.close(); // Gracias internet <3
    }
};