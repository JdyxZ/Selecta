
/***************** DATABASE CRUD *****************/

const mysql = require('mysql2/promise');
const {USER_CREDENTIALS, DATABASE_CREDENTIALS} = require('../config/database_credentials.js');
const fs = require('fs/promises');
const {isObject, isNumber, isArray} = require("../../public/framework/javascript.js");

var DATABASE = {

    // Properties
    pool: null,
    users: 'selecta_users',
    rooms: 'selecta_rooms',
    user_assets : 'selecta_user_assets',
    object_assets: 'selecta_object_assets',
    sessions: 'selecta_sessions',

    // Methods
    init: async function()
    {
        // Create pool
        const pool = await mysql.createPool(USER_CREDENTIALS);
                
        // Read and parse init.sql script
        const script = await fs.readFile("./server/database/init.sql", 'utf8');

        // Run init.sql script
        const result = await pool.query(script);

        // Drop auxiliar pool
        pool.end();

        // Create a pool in the created database
        this.pool = await mysql.createPool(DATABASE_CREDENTIALS);
    },

    /***************** USER *****************/

    pushUser: async function(user_json) 
    {
        try
        {
            // Destructure json
            const {social, name, password, model, asset, room} = user_json; 

            // Throw errors
            if(!isObject(social)) throw "You must send a valid social";
            if(!isObject(model)) throw "You must send an valid model";
            if(!isNumber(asset)) throw "You must send a valid asset";
            if(!isNumber(room)) throw "You must send a valid room";

            // Declare result
            let result;
            
            // Local user push
            if(name != undefined && password != undefined) result = await this.pool.query
            (
                `INSERT INTO ${this.users} 
                SET social = ?, name = ?, password = ?, model = ?, asset = ?, room = ? ;`, 
                [JSON.stringify(social), name, password, JSON.stringify(model), asset, room]
            );
            
            // Social user push
            else result = await this.pool.query
            (
                `INSERT INTO ${this.users} 
                SET social = ?, model = ?, asset = ?, room = ? ;`, 
                [JSON.stringify(social), JSON.stringify(model), asset, room]
            );
            
            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    validateUserID: async function(id)
    {
        try
        {
            // Throw errors
            if(isNaN(id) || id === "") throw "You must send a valid ID";
            
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.users} WHERE id = ? ;`, [id]);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    validateUserSocial: async function(social)
    {
        try
        {
            // Throw errors
            if(!isObject(social)) throw "You must send a valid ID";
            
            // Query
            const result = await this.pool.query
            (
                `SELECT * FROM ${this.users} WHERE JSON_EXTRACT(social, '$.id') = ? 
                AND JSON_EXTRACT(social, '$.provider') = ?;`, 
                [social.id, social.provider]
            );

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    validateUsername: async function(username) 
    {
        try
        {
            // Throw errors
            if(username === "" || username === null || username === undefined) throw "You must send a valid username";
            
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.users} WHERE name = ? ;`, [username])

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    validateUser: async function(user_json) 
    {
        try
        {
            // Destructure json
            const {name, password} = user_json;

            // Throw errors
            if(name === "" || name === null || name === undefined) throw "You must send a valid username";
            if(password === "" || password === null || password === undefined) throw "You must send a valid password";

            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.users} WHERE name = ? AND password = ? ;`, [name, password]);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    updateUser: async function(user_json)
    {
        try 
        {
            // Get user meaningful properties 
            const { name, model, asset, room} = user_json; 

            // Throw errors
            if(!isString(name) || name === "") throw "You must send a valid name";
            if(!isObject(model)) throw "You must send a valid model";
            if(!isNumber(asset)) throw "You must send a valid asset";
            if(!isNumber(room)) throw "You must send a valid room";

            // Query
            const result = await this.pool.query
            (
                `UPDATE ${this.users} 
                SET model = ?, asset = ?, room = ? WHERE name = ? ;`,
                [JSON.stringify(model), asset, room]
            );

            // Output
            return ["OK", result];
        } 
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    removeUser: async function(user_id)
    {
        try
        {
            // Throw errors
            if(isNaN(user_id) || user_id === "") throw "You must send a valid user_id";

            // Query
            const result = await this.pool.query(`DELETE FROM ${this.users} WHERE user_id = ? ;`, [user_id]);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    fetchUser: async function(user_id)
    {
        try
        {
            // Throw errors
            if(isNaN(user_id) || user_id === "") throw "You must send a valid user_id";

            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.users} WHERE user_id = ? ;`, user_id);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    /***************** USERS *****************/

    updateUsers: async function(users) 
    {
        try
        {
            // Wrap values into an array
            const values = users.values().reduce((values, user) => {
                values.push([user.id, JSON.stringify(user.model), user.asset, user.room]);
                return values;
            }, []);

            // Query
            const result = await this.pool.query
            (
                `INSERT INTO ${this.users} (id, model, asset, room) VALUES ? 
                ON DUPLICATE KEY UPDATE id = VALUES(id), model = VALUES(model), asset = VALUES(asset), room = VALUES(room);`, 
                [values]
            );
            
            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    removeUsers: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`DELETE FROM ${this.users};`);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    fetchUsers: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.users};`);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    /***************** ROOMS *****************/

    updateRooms: async function(rooms) 
    {
        try
        {
            // Wrap values into an array
            const values = rooms.values().reduce((values, room) => {
                const objects_json = JSON.stringify(room.objects);
                const people_json = JSON.stringify(room.people.toObject("user"));
                values.push([room.id, objects_json, people_json]);
                return values;
            }, []);
            
            // Query            
            const result = await this.pool.query
            (
                `INSERT INTO ${this.rooms} (id, objects, people) VALUES ? 
                ON DUPLICATE KEY UPDATE id = VALUES(id), objects = VALUES(objects), people = VALUES(people);`, 
                [values]
            );

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    removeRooms: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`DELETE FROM ${this.rooms};`);

            // Output
            return ["OK", result];
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        }
    },

    fetchRooms: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.rooms};`);

            // Output
            return ["OK", result]
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        } 
    },

    /***************** USER ASSETS *****************/

    fetchUserAssets: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.user_assets};`);

            // Output
            return ["OK", result]
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        } 
    },

    /***************** OBJECT ASSETS *****************/

    fetchObjectAssets: async function()
    {
        try
        {
            // Query
            const result = await this.pool.query(`SELECT * FROM ${this.object_assets};`);

            // Output
            return ["OK", result]
        }
        catch(err)
        {
            // Error
            console.log(`${err}`);
            return ["ERROR", `${err}`];
        } 
    },

    /***************** MODEL *****************/

    fetchModel: async function()
    {
        const [rooms_status, rooms] = await DATABASE.fetchRooms();
        if(rooms_status == "ERROR") return [rooms_status, rooms];

        const [users_status, users] = await DATABASE.fetchUsers();
        if (users_status == "ERROR") return [users_status, users];

        const [user_assets_status, user_assets] = await DATABASE.fetchUserAssets();
        if (user_assets_status == "ERROR") return [user_assets_status, user_assets];

        const [object_assets_status, object_assets] = await DATABASE.fetchObjectAssets();
        if (object_assets_status == "ERROR") return [object_assets_status, object_assets];

        return ["OK", {rooms: rooms[0], users: users[0], user_assets: user_assets[0], object_assets: object_assets[0]}];
    },

    updateModel: async function(world)
    {
        const [rooms_status, rooms_result] = await DATABASE.updateRooms(world.rooms);
        if(rooms_status == "ERROR") return [rooms_status, rooms_result];

        const [users_status, users_result] = await DATABASE.updateUsers(world.users);
        if (users_status == "ERROR") return [users_status, users_result];

        return ["OK", null];  
    },
}

module.exports = DATABASE;