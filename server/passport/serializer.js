/***************** SESSION SERIALIZER *****************/

// External modules
const passport = require('passport');

// Our modules
const DATABASE = require("../database/database.js");

// Store user id into the express session
passport.serializeUser((user_id,done) => {
    done(null, user_id);
});

// Get user id from session
passport.deserializeUser(async (user_id, done) => {
    // Query
    const [status, result] = await DATABASE.validateUserID(user_id);

    // Check
    if(status == "ERROR") return done(result, null);
    if(result[0].length == 0) return done("ID not valid", null);

    // Flush user ID
    done(null, user_id);
});
