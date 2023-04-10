/***************** DATABASE TESTS *****************/

const DATABASE = require("../database/database.js");
const CRYPTO = require("../utils/crypto.js");
const YOUTUBE = require("../utils/youtube.js");
const fs = require('fs/promises');
const {isArray} = require("../../public/framework/javascript.js");
const {Song} = require('../model/model.js');
const ytdl = require('ytdl-core');

async function init()
{
    // Init database and youtube API connection
    await DATABASE.init();
    await YOUTUBE.init();
}

async function test()
{
    // Init
    await init();

    // await fetchVideoStream("ntCZjb_AAWE")
    // const result = await YOUTUBE.search("hola", "public");
    const result = await YOUTUBE.getVideosInfo("YuHoTbQv02k", "public");
    console.log(result); 
    
    // fetchVideoStream("ntCZjb_AAWE");
}

async function fetchVideoStream(videoID)
{
    try
    {
        const info = await ytdl.getInfo(videoID);
        const audio_info = ytdl.chooseFormat(info.formats, {quality: 'highestaudio', filter: 'audioonly'});
        console.log(info.videoDetails);
    }
    catch(err)
    {
        console.log(err);
    }
}

// Calls
test();

