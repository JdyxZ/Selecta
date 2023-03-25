/********************************** MODEL **********************************/

const {getTime, isNumber, isString, isArray} = require("../../public/framework/javascript.js");

/***************** USER *****************/

function User(data)
{   
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : (data.name != undefined ? data.name : data.social.name || "unamed");
    this.model = data == undefined ? [] : data.model || [];
    this.asset = data == undefined ? 0 : data.asset || 0; 
    this.room = data == undefined ? 1 : data.room || 1;
    this.animation = "idle";
    this.suggestion = {};
    this.votes = [];
    this.skip = false;
}

User.prototype.toJSON = function()
{
    const{ id, name, model, asset, room, animation, suggestion, votes, skip } = this;

    const user_json =
    {
        id,
        name,
        model,
        asset,
        room,
        animation,
        suggestion,
        votes,
        skip
    }

    // Output JSON
    return user_json;
}

User.prototype.toJSONSimplified = function()
{
    const{ id, model, asset, dance } = this;

    // Make a copy of the properties that we want to share
    const user_json =
    {
        id,
        model,
        asset,
        dance
    }

    // Output JSON
    return user_json;
}

/***************** ASSETS *****************/

function userAsset(data)
{
    this.id = data == undefined ? -1 : data.id || -1;
    this.asset = data == undefined ? {} : data.asset || {};
    this.animations = data == undefined ? [] : data.animations || [];
}

function objectAsset(data)
{
    this.id = data == undefined ? -1 : data.id || -1;
    this.asset = data == undefined ? {} : data.asset || {};
    this.model = data == undefined ? [] : data.model || [];
}

/***************** ROOM *****************/

function Room(data)
{
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : data.name || "unnamed";
    this.objects = data == undefined ? [] : data.objects || [];
    this.people = data == undefined ? [] : data.people || []; 
    this.exits = data == undefined ? [] : data.exits || [];
    this.default_model = data == undefined ? [] : data.default_model || [];
    this.suggestions = {};
    this.skip_counter = 0;
    this.skipping = false;
    this.skipping_time = 0;
    this.current_song = {};
    this.next_song = {};
    this.playback_time = 0;
    this.num_people = 0;
}

Room.prototype.addUser = function(user)
{
    this.people.push( user.id );
    this.num_people++;
    user.room = this.id;
}

Room.prototype.removeUser = function(user)
{
    delete this.people[user.id];
    this.num_people--;
}

Room.prototype.toJSON = function()
{
    const{ id, name, objects, people, exits, default_model, suggestions, num_people } = this;

    const room_json =
    {
        id,
        name,
        objects,
        people,
        exits,
        default_model,
        suggestions,
        num_people
    }

    // Output JSON
    return room_json;
}

Room.prototype.getRoomUsersInfo = function(users_id, filter_type)
{
    // Checkings
    if (isNumber(users_id) || isString(users_id)) users_id = users_id.toArray();    
    else if (!isArray(users_id))
    {
        console.log(`ERROR ---> Invalid input "${users_id}" in function roomUserstoJSON of Room Class. Returning null`);
        return null;
    }

    // Check filter type
    if(filter_type != "EXCLUSIVE" && filter_type != "INCLUSIVE")
    {
        console.log(`ERROR ---> Invalid filter type "${filter_type}" in function roomUserstoJSON of Room Class. Returning null`);
        return null;
    }

    // Reduce
    return this.people.reduce( (arr, user_id) => {

        // Check if current user is exempt
        if(filter_type == "EXCLUSIVE" && users_id.includes(user_id)) return arr;
        else if(filter_type == "INCLUSIVE" && !users_id.includes(user_id)) return arr;

        // Push to obj
        const user = WORLD.getUser(user_id);
        arr[0].push(user_id)
        arr[1].push(user.toJSON());

        // Ouput
        return arr;
    }, [[],[]]);
}


Room.prototype.getUsers = function(users_id)
{
    // Checkings
    if (isNumber(users_id) || isString(users_id)) users_id = users_id.toArray();    
    else if (!users_id instanceof Array)
    {
        console.log(`ERROR ---> Invalid input "${users_id}" in function getUsers of Room Class. Returning null`);
        return null;
    }

    return user_room.people.clone().remove(users_id);
}

Room.prototype.getSuggestion = function(suggestionID)
{
    return this.suggestions[suggestionID];
}

Room.prototype.getSortedSuggestions = function()
{
    this.suggestions.values().sort((a, b) => {
        return b.vote_counter - a.vote_counter
    });
}

Room.prototype.getMostVotedSuggestions = function()
{
    let max = -1;
    let max_list = [];

    for(const suggestionID in this.suggestions)
    {
        if (this.suggestions.hasOwnProperty(suggestionID)) 
        {                    
            // Get current suggestion
            const current_suggestion = this.suggestions[suggestionID];          
            if(current_suggestion.vote_counter >= max)
            {
                max_list = [...max_list, current_suggestion];
            }
        }
    }

    return max_list;
}

/***************** WORLD *****************/

var WORLD = {

    // Macros
    song_duration_range: [60, 600], // [s, s]
    playback_update_frequency: 10, // [ms]
    loading_duration: 5, // [s]
    skipping_threshold: 0.7, // [%]

    // Timers
    timers: 
    {
        "chooseNextSong" : null,
        "playSong" : null
    },

    // Intervals
    intervals:
    {
        "playbackTime" : null 
    },

    // Objects
    rooms: {},
    users: {},
    user_assets: {},
    object_assets: {},
    num_users: 0,
    num_rooms: 0,

    // Methods
    init: function(rooms_array, users_array, user_assets_array, object_assets_array)
    {
        // Map user properties to proper structures
        users_array.map( user => 
        {
            user.model = user.model.values();
        });

        // Map room properties to proper structures
        rooms_array.map( room => 
        {
            room.exits = room.exits.values();
            room.people = room.people.values();
            room.default_model = room.default_model.values();
        });

        // Map user assets properties to proper structures
        user_assets_array.map( user_asset => 
        {
            user_asset.animations = user_asset.animations.values();
        });

        // Map object asset properties to proper structures
        object_assets_array.map( object_asset => 
        {
            object_asset.model = object_asset.model.values();
        });
    
        const world_json =
        {
            rooms: rooms_array,
            users: users_array,
            user_assets: user_assets_array,
            object_assets: object_assets_array
        }

        this.fromJSON(world_json);
    },

    createUser: function (data)
    {
        var user = new User(data);
        this.num_users++;
        this.users[user.id] = user;
        return user;
    },

    createRoom: function (data)
    {
        var room = new Room(data);
        this.num_rooms++;
        this.rooms[room.id] = room;
        return room;
    },

    createUserAsset: function(data)
    {
        var user_asset = new userAsset(data);
        this.user_assets[user_asset.id] = user_asset;
        return user_asset;
    },

    createObjectAsset: function(data)
    {
        var object_asset = new objectAsset(data);
        this.object_assets[object_asset.id] = object_asset;
        return object_asset;
    },

    getUser: function (id)
    {
        return this.users[id];
    },

    getRoom: function(id)
    {
        return this.rooms[id];
    },

    getDefaultRoom: function(id)
    {
        return this.rooms[1];
    },

    addUser: function(user)
    {
        if(users[user.id] != undefined)
        {
            console.error(`The user ${user.name} already exists`);
            return;
        }

        users[user.id] = user;
    },

    addRoom: function(room)
    {
        if(rooms[room.id] != undefined)
        {
            console.error(`The room ${room.name} already exists`);
            return;
        }

        rooms[room.id] = room;
    },
    
    removeUser: function(id)
    {
        delete users.id;
    },

    addUsertoRoom: function(user_id, room_id)
    {
        const user = this.getUser(user_id);
        const room = this.getRoom(room_id);
        room.addUser(user);
    },

    removeUserfromRoom: function(user_id, room_id)
    {
        const user = this.getUser(user_id);
        const room = this.getRoom(room_id);
        room.removeUser(user);
    },

    addSuggestion: function(room_id, user_id, song_id)
    {
        // Build suggestion instance
        const suggestion = new Suggestion(song_id, user_id, 0);

        // Get room and user
        const room = this.getRoom(room_id);
        const user = this.getUser(user_id);

        // Add
        user.suggestion = suggestion;
        room.suggestions[songID] = suggestion;
    },

    removeSuggestion: function(room_id, song_id)
    {
        // Get room
        const room = this.getRoom(room_id);

        // Check
        if(room.getSuggestion(song_id) == undefined) return;

        // Get user
        const user = this.getUser(room.getSuggestion(song_id).userID);
        
        // Remove
        delete room.suggestions[song_id];
        delete user.suggestion;
        user.suggestion = {};

        // Remove votes for the deleted suggestion
        this.removeSuggestionVotes(room_id, song_id);

    },

    updateSuggestion: function(room_id, old_songID, new_songID)
    {
        // Get room and suggestion
        const room = this.getRoom(room_id);
        const suggestion = room.getSuggestion(old_songID);

        // Update
        suggestion.songID = new_songID;

        // Remove votes for the updated suggestion
        this.removeSuggestionVotes(room_id, new_songID);
    },

    removeSuggestionVotes(room_id, songID)
    {
        // Get room and suggestion
        const room = this.getRoom(room_id);
        const suggestion = room.getSuggestion(songID);

        // Reset counter
        suggestion.vote_counter = 0;

        // Remove votes
        room.people.forEach(user => {
            user.votes.remove(songID);
        })
    },

    fromJSON: function(world_json)
    {
        // Create rooms
        world_json.rooms.forEach(room_json => {
            this.createRoom(room_json);
        }); 
       
        // Create users
        world_json.users.forEach(user_json => {
            const user = this.createUser(user_json);
            this.addUsertoRoom(user.id, user.room);
        }); 

        // Create user assets
        world_json.user_assets.forEach(user_asset_json => {
            this.createUserAsset(user_asset_json);
        })

        // Create object assets
        world_json.user_assets.forEach(object_asset_json => {
            this.createObjectAsset(object_asset_json);
        })
    },

    toJSON: function()
    {
        const{ rooms, users, user_assets, object_assets, num_rooms, num_users } = this;

        world_json =
        {
            rooms,
            users,
            user_assets,
            object_assets,
            num_rooms,
            num_users,

        }

        return JSON.stringify(world_json, null, 2);
    }
}

/***************** MESSAGE *****************/

function Message(sender, type, content, time)
{
    this.sender = sender || ""; //ID
    this.type = type || "ERROR";
    this.content = content || "";
    this.time = time || getTime();
}

/***************** SUGGESTION *****************/

function Suggestion(songID, userID, vote_counter)
{
    this.songID = songID;
    this.userID = userID;
    this.vote_counter = vote_counter;
}

/***************** SONG *****************/

function Song(ID, duration)
{
    this.ID = ID;
    this.duration = duration;
}

if(typeof(window) == "undefined")
{
    module.exports = { WORLD, Room, User, Message, Suggestion, Song};
}