/***************** DATABASE TESTS *****************/

const DATABASE = require("../database/database.js");
const CRYPTO = require("../utils/crypto.js");
const YOUTUBE = require("../utils/youtube.js");
const fs = require('fs/promises');
const {isArray} = require("../../public/framework/javascript.js");
const {Song} = require('../model/model.js');
const ytdl = require('ytdl-core');

async function test()
{
    // Init database and youtube API connection
    await DATABASE.init();
    await YOUTUBE.init();

    // await YOUTUBE.getVideosInfo("hola");
    await fetchVideoStream("ntCZjb_AAWE")
}

async function fetchVideoStream(videoID)
{
    try
    {
        const info = await ytdl.getInfo("ntCZjb_AAWE");
        const audio_info = ytdl.chooseFormat(info.formats, {quality: 'highestaudio', filter: 'audioonly'});
        console.log(audio_info);
    }
    catch(err)
    {
        console.log(err);
    }
}

test();

