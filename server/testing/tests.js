/***************** DATABASE TESTS *****************/

const DATABASE = require("../database/database.js");
const CRYPTO = require("../utils/crypto.js");
const fs = require('fs/promises');
require("../../public/framework.js");

async function test()
{
    // Init database connection
    await DATABASE.init();

    // Try validate social user
    const social =
    {
        id: 1,
        provider: "google"
    }

    const [status, result] = await DATABASE.validateUserSocial(social);
    
    console.log(status);
    console.log(result[0]);

    // hasOwnProperty problem
    var hola = {"number": 1};

    console.log("\nTHE PROBLEM\n")

    for(var key in hola)
    {
        console.log(key);
    }

    console.log("\nTHE SOLUTION\n")

    for(var key in hola)
    {
        if(hola.owns(key))
            console.log(key);
    }

}

test();

