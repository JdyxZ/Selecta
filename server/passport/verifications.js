/***************** VERIFICATIONS *****************/

// Our own modules
const {WORLD} = require("../model/model.js");
const DATABASE = require("../database/database.js");
const CRYPTO = require("../utils/crypto.js");
const LOCKER = require("../utils/locker.js");

const LOCAL_VERIFICATION = 
{
    signup: async function(req, name, password, done)
    {
        // Set input username and password to global variables through flash
        req.flash("signup_username", name);
        req.flash("signup_password", password);

        // Check username
        let [status, result] = await DATABASE.validateUsername(name);

        if (status == "ERROR")
        {
            console.log(result);
            return done(null, false, req.flash('signup_error', 'Something wrong happened. Try again.'));
        }
            
        if (result[0].length != 0) return done(null, false, req.flash('signup_username_error', `The username ${name} already exists.`));

        // Check password
        const [check, error] = CRYPTO.check(password);
        if (check == "ERROR") return done(null, false, req.flash('signup_password_error', error));

        // Hash password
        const hashed_password = await CRYPTO.encrypt(password);

        // Get default room
        const room = WORLD.getDefaultRoom();
        if(!room)
        {
            console.log("ERROR ---> WORLD does not contain rooms");
            return done(null, false, req.flash('signup_error', 'Something wrong happened. Try again.'));
        }

        // Push user info into the database
        let user_obj =
        {
            social : {},
            name : name,
            password: hashed_password,
            model: room.default_model,
            asset: 1,
            room : room.id,
        };

        [status, result] = await DATABASE.pushUser(user_obj);

        if (status == "ERROR")
        {
            console.log(result);
            return done(null, false, req.flash('signup_error', 'Something wrong happened. Try again'));
        }

        // Set push query user ID to object and delete password from it
        user_obj.id = result[0].insertId;
        delete user_obj.password;

        // Create new user into the WORLD and add it to its room
        const user = WORLD.createUser(user_obj);
        WORLD.addUsertoRoom(user.id, user.room);

        // If old session is active, delete it
        LOCKER.deleteCurrentSession(req)
        .then(() =>
        {
            // Pass user id to the serializer to store in the sessions table
            return done(null, user.id);
        })
        .catch((err) =>
        {
            console.log(err);
            return done(null, false, req.flash('signup_error', 'Something wrong happened. Try again.'));
        })
    },

    login: async function(req, name, password, done)
    {
        // Set input username and password to global variables through flash
        req.flash("login_username", name);
        req.flash("login_password", password);

        // Hash password
        const hashed_password = await CRYPTO.encrypt(password);  

        // Check user credentials
        let [status, result] = await DATABASE.validateUser({name: name, password: hashed_password});

        if (status == "ERROR")
        {
            console.log(result);
            return done(null, false, req.flash('login_error', 'Something wrong happened. Try again.'));
        }
            
        if (result[0].length == 0) return done(null, false, req.flash('login_user_error', 'Wrong user or password.'));

        // Check that the client is not already connected in another session
        const user_id = result[0][0].id;

        // Check if user is trying to log in the same account opened in a different window
        if(LOCKER.checkConnection(user_id))
            return done(null, false, req.flash('login_error', 'The user you are trying to log in is already logged in a different window'));

        // If old session is active, delete it
        LOCKER.deleteCurrentSession(req)
        .then(() =>
        {
           // Pass user id to the serializer to store in the sessions table
            return done(null, user_id);
        })
        .catch((err) =>
        {
            console.log(err);
            return done(null, false, req.flash('login_error', 'Something wrong happened. Try again.'));
        })
    }
}

const SOCIAL_VERIFICATION = 
{
    process: async function(req, accessToken, refreshToken, profile, done)
    {        
        // Declare attributes we want to store from profile info
        let id, name, provider;

        // Get profile info attributes
        switch(profile.provider)
        {
            case "google":
                id = profile.id;
                name = profile.displayName;
                provider = profile.provider;
                break;
            case "twitch":
                id = profile.id;
                name = profile.login;
                provider = profile.provider;
                break;
            case "github":
                id = profile.id;
                name = profile.username;
                provider = profile.provider;
                break;
            case "discord":
                id = profile.id;
                name = profile.username;
                provider = profile.provider;
                break;
            case "twitter":
                id = profile.id;
                name = profile.username;
                provider = profile.provider;
                break;
            case "facebook":
                id = profile.id;
                name = profile.displayName;
                provider = profile.provider;
                break;
            default:
                throw "ERROR: Unknown provider";
                return done(null, false, req.flash('social_error', 'Something wrong happened. Try again.'));
        }

        // Define social object
        const social =
        {
            id,
            name,
            provider
        };

        // Check user credentials
        let [status, result] = await DATABASE.validateUserSocial(social);

        // Handle errors
        if (status == "ERROR")
        {
            console.log(result);
            return done(null, false, req.flash('social_error', 'Something wrong happened. Try again.'));
        }

        // Declare user id
        let user_id;
        
        // SignUp: If the user doesn't already exist create it
        if (result[0].length == 0) 
        {
            // Get default room
            const room = WORLD.getDefaultRoom();
            if(!room)
            {
                console.log("ERROR ---> WORLD does not contain rooms");
                return done(null, false, req.flash('signup_error', 'Something wrong happened. Try again.'));
            }

            // Create user object        
            let user_obj =
            {
                social: social,
                avatar : "media/images/char1.png",
                model: room.default_model,
                asset: 1,
                room : room.id,
            };

            // Push user info into the database
            [status, result] = await DATABASE.pushUser(user_obj);

            // Handle errors
            if (status == "ERROR")
            {
                console.log(result);
                return done(null, false, req.flash('social_error', 'Something wrong happened. Try again'));
            }

            // Set push query user ID to object and user id var
            user_obj.id = result[0].insertId;
            user_id = user_obj.id;

            // Create new user into the WORLD and add it to its room
            const user = WORLD.createUser(user_obj);
            WORLD.addUsertoRoom(user.id, user.room);
        }  

        // LogIn: Otherwise find user id
        else 
        {
            // Get user id
            user_id = result[0][0].id;

             // Check if user is trying to log in the same account opened in a different window
            if(LOCKER.checkConnection(user_id))
            return done(null, false, req.flash('social_error', 'The user you are trying to log in is already logged in a different window'));
        }      
       
        // If old session is active, delete it
        LOCKER.deleteCurrentSession(req)
        .then(() =>
        {
           // Pass user id to the serializer to store in the sessions table
            return done(null, user_id);
        })
        .catch((err) =>
        {
            console.log(err);
            return done(null, false, req.flash('social_error', 'Something wrong happened. Try again.'));
        }) 
    } 
}

module.exports = {LOCAL_VERIFICATION, SOCIAL_VERIFICATION};