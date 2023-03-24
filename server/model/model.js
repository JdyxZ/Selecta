/********************************** MODEL **********************************/

const {getTime, isNumber, isString, isArray} = require("../../public/framework/javascript.js");

/***************** SUGGESTION *****************/

function Suggestion(songID, userID, vote_counter)
{
    this.songID = songID;
    this.userID = userID;
    this.vote_counter = vote_counter;
}

/***************** USER *****************/

function User(data)
{   
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : (data.name != undefined ? data.name : data.social.name || "unamed");
    this.model = data == undefined ? null : data.model || null;
    this.asset = data == undefined ? 0 : data.asset || 0; 
    this.room = data == undefined ? 1 : data.room || 1;
    this.suggestion = {};
    this.votes = [];
    this.skip = false;
}

User.prototype.toJSON = function()
{
    const user_json =
    {
        id: this.id,
        name: this.name,
        model: this.model,
        asset: this.asset,
        room: this.room,
        suggestion: this.suggestion,
        votes: this.votes,
        skip: this.skip
    }

    // Output JSON
    return user_json;
}

User.prototype.toJSONSimplified = function()
{
    // Make a copy of the properties that we want to share
    const user_json =
    {
        id: this.id,
        asset: this.asset,
        dance: this.dance
    }

    // Output JSON
    return user_json;
}

/***************** ASSETS *****************/

function userAsset(data)
{
    // TODO
}

function objectAsset(data)
{
    // TODO
}

/***************** ROOM *****************/

function Room(data)
{
    this.id = data == undefined ? -1 : data.id || -1;
    this.name = data == undefined ? "unnamed" : data.name || "unnamed";
    this.objects = data == undefined ? [] : data.objects || [];
    this.people = data == undefined ? [] : data.people || []; 
    this.exits = data == undefined ? [] : data.exits || [];
    this.default_model = data == undefined ? null : data.default_model || null;
    this.suggestions = {};
    this.skip_counter = 0;
    this.current_song = null;
}

Room.prototype.addUser = function(user)
{
    this.people.push( user.id );
    user.room = this.id;
}

Room.prototype.removeUser = function(user)
{
    delete this.people[user.id];
}

Room.prototype.toJSON = function()
{
    const room_json =
    {
        id: this.id,
        name: this.name,
        objects: this.objects,
        people: this.people,
        exits: this.exits,
        default_model: this.default_model,
        suggestions: this.suggestions,
        skip_counter: this.skip_counter,
        current_song: this.current_song,
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

/***************** WORLD *****************/

var WORLD = {

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
            // TODO: Convert position to matrix of values
            // Observación!!!!: Deberíamos utilizar las clase Matrix de la librería esa que comentó Agenjo
        });

        // Map room properties to proper structures
        rooms_array.map( room => 
        {
            room.exits = room.exits.values();
            room.people = room.people.values();
            // TODO: Convert default_model to matrix of values
            
            return room
        });

        // Map object asset properties to proper structures
        object_assets_array.map( object_asset => 
        {
            // TODO: Convert bounding_box to matrix of values
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

if(typeof(window) == "undefined")
{
    module.exports = { WORLD, Room, User, Message};
}