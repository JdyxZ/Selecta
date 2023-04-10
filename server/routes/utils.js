/***************** UTILS ROUTES *****************/

// External modules
const express = require('express');
const router = express.Router();
const url = require('url');

// Our modules
const {WORLD} = require("../model/model.js");
const SERVER = require("../main/server.js");
const DATABASE = require("../database/database.js");
const LOCKER = require("../utils/locker.js");
const SERVER_SETTINGS = require("../config/server_settings.js");
const YOUTUBE = require("../utils/youtube.js");
const {isString, isArray, isObject} = require("../../public/framework/javascript.js");

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

// Youtube API
router.get("/youtube", async (req, res, next) =>
{
    // Unpack params
    const params = url.parse(req.url, true).query;

    // Unwrap params
    const action = params.action;
    const query = params.query ? JSON.parse(params.query) : undefined;
    const videoIDs = params.videoIDs ? JSON.parse(params.videoIDs) : undefined;
    const channelIDs = params.channelIDs ? JSON.parse(params.channelIDs) : undefined;
    const playlistIDs = params.playlistIDs ? JSON.parse(params.playlistIDs) : undefined;
    const videoID = params.videoID ? JSON.parse(params.videoID) : undefined;
    const playlistID = params.playlistID ? JSON.parse(params.playlistID) : undefined;

    // Process action
    let result;
    switch(action)
    {
        case("search"):
            result = await YOUTUBE.search(query, "public");
            break;
        case("get_videos_info"):
            result = await YOUTUBE.getVideosInfo(videoIDs, "public");
            break;
        case("get_channels_info"):
            result = await YOUTUBE.getChannelsInfo(channelIDs, "public");
            break;
        case("get_playlists_info"):
            result = await YOUTUBE.getPlaylistsInfo(playlistIDs, "public");
            break;
        case("get_playlist_items"):
            result = await YOUTUBE.getPlaylistItems(playlistID, "public");
            break;
        case("get_videos_full_info"):
            result = await YOUTUBE.getVideosFullInfo(videoIDs, "public");
            break;
        case("search_full"):
            result = await YOUTUBE.searchFull(query, "public");
            break;
        case("get_audio_stream"):
            result = await YOUTUBE.getAudioStream(videoID, "public");
            break;
        default:
            result = ["ERROR", "Youtube Utils API: You must send a valid action"];  
            break; 
    }
    
    // Respond
    res.json(result);
});

// Export module
module.exports = router;