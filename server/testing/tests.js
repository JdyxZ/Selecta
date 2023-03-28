/***************** DATABASE TESTS *****************/

const DATABASE = require("../database/database.js");
const CRYPTO = require("../utils/crypto.js");
const YOUTUBE = require("../utils/youtube.js");
const fs = require('fs/promises');
const {isArray} = require("../../public/framework/javascript.js");
const {Song} = require('../model/model.js');

async function test()
{
    // Init database and youtube API connection
    await DATABASE.init();
    await YOUTUBE.init();

    // URLs
    const youtube_keys_url = "http://localhost:9015/youtube_keys";

    // Fetch resources from url    
    const youtube_keys = await fetch(youtube_keys_url, {method: "GET"});

    if (youtube_keys.status !== 200) {
        console.log(`HTTP-Error ${youtube_keys.status} upon fetching url ${youtube_keys_url} `);
        throw "Bad response";
    };

    console.log(youtube_keys);
    console.log(isArray(youtube_keys));
}

test();

