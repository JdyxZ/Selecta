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

    await YOUTUBE.getVideosInfo("hola");
}

test();

