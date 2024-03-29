/***************** CLIENT *****************/
var CLIENT =
{
    // Client data
    server_protocol: null,
    server_port: null,
    server_address: null,
    socket: null,
    debug: null,
    
    // Init
    init: async function()
    {
        // Fetch server settings
        const settings = await this.fetchServerSettings();

        // Set server settings        
        this.server_protocol = settings.protocol;
        this.server_address = settings.address;
        this.server_port = settings.port;

        // New WebSocket instance
        this.socket = new WebSocket(`${this.server_protocol == "secure" ? "wss://" : "ws://"}${this.server_address}:${this.server_port}`);

        // Callbacks
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    },

    fetchServerSettings: async function ()
    {
        try
        {
            // URL
            const url = "/server_settings";

            // Fetch image from url    
            const response = await fetch(url, {method: "GET"}); 
        
            // Check response
            if (response.status !== 200) {
                console.log(`HTTP-Error ${response.status} upon fetching url ${url} `);
                throw "Bad response";
            };
                
            // Convert response into json
            const settings = await response.json()

            // Return settings
            return settings;
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
            case "SKIP":
                this.onSkip(message);
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
        // console.table(message.content);

        // Unpack message data
        const room = message.content;

        // Callback
        CONTROLLER.setRoom(room);
    },

    setMyUser: function(message)
    {
        // Log
        console.log("New YOUR_INFO message received\n");
        // console.table(message.content);

        // Unpack message data
        const users = message.content

        // Callback
        CONTROLLER.setMyUser(users);
    },

    setAssets: function(message)
    {
        // Log
        console.log("New ASSETS message received\n");
        //console.table(message.content);

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
        // console.table(message.content);

        // Unpack message data
        const user_data = message.content;

        // Callback
        CONTROLLER.onUserJoin(user_data);
    },

    onUserLeft: function(message)
    {
        // Log
        console.log("New USER_LEFT message received\n");
        //console.table(message.content);

        // Unpack message data
        const user_id = message.content;

        // Callback
        CONTROLLER.onUserLeft(user_id);
    },

    onTick: function(message)
    {
        // Log
        console.log("New TICK message received\n");
        //console.table(message.content);

        // Unpack message data
        const sender = message.sender;
        const user = MODEL.getUser(sender);
        const model = message.content.model;
        const animation = message.content.animation;

        // Check
        if(!user)
        {
            console.error(`onTick callback --> The user id ${sender} is not registered`);
            return;
        }

        // Callback
        CONTROLLER.onTick(user, model, animation);
    },

    onExit: function(message)
    {
        // Log
        console.log("New EXIT message received\n");
        //console.table(message.content);

        // Callback
        CONTROLLER.onExit();
    },

    onSuggest: function(message)
    {
        // Log
        console.log("New SUGGEST message received\n");
        // console.table(message.content);

        // Unpack message data
        const user = MODEL.getUser(message.sender);
        const song = message.content;

        // Callback
        CONTROLLER.onSuggest(user, song);
    },

    onVote: function(message)
    {
        // Log
        console.log("New VOTE message received\n");
        //console.table(message.content);

        // Unpack message data
        const requester = message.sender;
        const songID = message.content;
        const user = MODEL.getUser(requester);
    
        // Callback
        CONTROLLER.onVote(user, songID);
    },

    onSkip: function(message)
    {
        // Log
        console.log("New SKIP message received\n");
        //console.table(message.content);

        // Unpack message data
        const requester = message.sender;
        const user = MODEL.getUser(requester);
    
        // Callback
        CONTROLLER.onSkip(user);
    },

    onPlaySong: function(message)
    {
        // Log
        console.log("New PLAY_SONG message received\n");
        // console.table(message.content);

        // Unpack message data
        const song = message.content.song;
        let playbackTime = message.content.playbackTime; // [ms]
        const deliveryTime = message.time; // [ms]

        // If playbackTime is a number
        if(isNumber(playbackTime))
        {
            // Estimate latency and arrival timestamp
            const latency = Date.now() - deliveryTime;
            const arrivalTime = performance.now();
    
            // Adjust latency
            playbackTime += latency;
    
            // Set arrival timestamp to the song
            song.arrivalTime = arrivalTime;
        }

        // Set playbackTime to the song
        song.playbackTime = playbackTime;

       // Callback
       CONTROLLER.onPlaySong(song);
    },

    onShutDown: function(message)
    {
        // Log
        console.log("New SHUT_DOWN message received\n");
        //console.table(message.content);

        // TODO
    },

    onError: function(message)
    {
        // Log
        console.log("New ERROR message received\n");
        console.table(message.content);
    },

    // Methods
    sendMessage: function(message)
    {
        // Send message to user
        this.socket.send(JSON.stringify(message));
    }
}

// Before reloading page, close connection with the WebSocket Server
window.onbeforeunload = function() {
    if(CLIENT.socket != null)
    {
        CLIENT.socket.onclose = function () {}; // disable onclose handler first
        CLIENT.socket.close(); // Gracias internet <3
    }
};