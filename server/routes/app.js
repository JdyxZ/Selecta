/***************** APP ROUTES *****************/

// External modules
const express = require('express');
const router = express.Router();

// Our modules
const LOCKER = require("../utils/locker.js");
const SERVER_SETTINGS = require("../config/server_settings.js");

// App routes
router.get('/', LOCKER.isSessionNotAvailable, (req, res) => {
    res.redirect(`${SERVER_SETTINGS.prefix}/login`);
});

router.get('/login', LOCKER.isSessionNotAvailable, (req, res) => { 
    res.render("login", {current_view: "login"});
});

router.get('/signup', LOCKER.isSessionNotAvailable, (req, res) => { 
    res.render("signup", {current_view: "signup"});
});

router.get('/logout', LOCKER.isSessionAvailable, (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        res.redirect(`${SERVER_SETTINGS.prefix}/login`);
    });
});

router.get(`/${SERVER_SETTINGS.app_route}`, LOCKER.isSessionAvailable, (req, res) => {
    res.render(`${SERVER_SETTINGS.app_route}`, {current_view: `${SERVER_SETTINGS.app_route}`});
});

module.exports = router;