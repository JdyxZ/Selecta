/***************** UTILS ROUTES *****************/

// External modules
const express = require('express');
const router = express.Router();
const url = require('url');
const needle = require('needle');

// Our modules
const {WORLD} = require("../model/model.js");
const SERVER = require("../main/server.js");
const DATABASE = require("../database/database.js");
const LOCKER = require("../utils/locker.js");
const SERVER_SETTINGS = require("../config/server_settings.js");
const API_CREDENTIALS = require("../config/api_credentials.js");
const YOUTUBE = require("../utils/youtube.js");
require("../../public/framework/javascript.js");

// Util routes
router.get('/get_world', function(req, res){ // Model info
    res.end(WORLD.toJSON());
});

router.get('/update_world', async function(req, res){ // Model update
    const [status, result] = await DATABASE.updateModel(WORLD);

    switch(status)
    {
        case("OK"):
            res.end("Model updated");
            break;
        case("ERROR"):
            res.end(result);
            break;
    }
});

router.get('/rooms', function(req, res){ // Model info
    res.end(JSON.stringify(WORLD.rooms, null, 2));
});

router.get('/user/:id', async function(req,res) { // User info
    const [status, result] = await DATABASE.fetchUser(req.params.id);

    switch(status)
    {
        case("OK"):
            res.end(JSON.stringify(result[0], null, 2));
            break;
        case("ERROR"):
            res.end(result);
            break;
    }
});

router.get('/users', function(req, res){ // Users info
    res.end(JSON.stringify(WORLD.users, null, 2));
});

router.post('/user', async function(req,res){ // User insert
    const [status, result] = await DATABASE.pushUser(req.body);

    switch(type)
    {
        case("OK"):
            res.end(`User ${req.body.name} successfully inserted`);
            break;
        case("ERROR"):
            res.end(result);
            break;
    }
});

router.put('/user', async function(req, res){ // User update
    const [status, result] = await DATABASE.updateUser(req.body);

    switch(type)
    {
        case("OK"):
            res.end(result[0].affectedRows <= 0 ? `User ${req.body.name} has not been found in the database` : `User ${req.body.name} successfully updated`);
            break;
        case("ERROR"):
            res.end(result);
            break;
    }
});

router.delete('/user/:id', async function(req, res){ // User delete
    const [status, result] = await DATABASE.removeUser(req.params.id);
    
    switch(status)
    {
        case("OK"):
            res.end(result[0].affectedRows <= 0 ? `User ${req.body.name} has not been found in the database` : `User ${req.body.name} successfully removed`);
            break;
        case("ERROR"):
            res.end(result);
            break;
    }
});

router.get("/clients", (req, res, next) => {
    res.end(JSON.stringify(SERVER.clients.keys()));
});

router.get("/server_settings", (req, res, next) => {
    res.json(SERVER_SETTINGS);
});

// Youtube 
router.get("/youtube_keys", (req, res, next) => {
    res.json(API_CREDENTIALS.google.public);
});

router.get("/youtubeGetAudioStreams", async (req, res, next) =>
{
    // Unpack params
    const params = url.parse(req.url, true).query;

    // Process request
    const result = await YOUTUBE.fetchAudioStreams(params.videoID);

    // Respond
    res.json(result);    
});

// Proxy
router.get("/proxy", async (req, res, next) => 
{
    const apiRes = await needle('get', `https://yt3.ggpht.com/y8aH22sg9A1XUuDvu74oK_Zv1Q5ygJxn-Z4auUT_XOGxC_Zj5B1W43WVhwiEXuGTq9tIEW9MjrY=s240-c-k-c0x00ffffff-no-rj`)
    const data = apiRes.body
    res.status(200).end(data);
});



// Export module
module.exports = router;