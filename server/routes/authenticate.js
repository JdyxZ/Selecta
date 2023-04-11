/***************** AUTHENTICATE ROUTES *****************/

// External modules
const express = require('express');
const passport = require("passport");
const router = express.Router();

// Our modules
const LOCKER = require("../utils/locker.js");
const SERVER_SETTINGS = require("../config/server_settings.js");

// Local strategy
router.post('/signup', LOCKER.isSessionNotAvailable, passport.authenticate("local_signup", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/signup",
    failureFlash: true
}));

router.post('/login', LOCKER.isSessionNotAvailable, passport.authenticate("local_login", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Google strategy
router.post('/auth/google', LOCKER.isSessionNotAvailable, passport.authenticate("google", {
    failureRedirect: "/"
}));

router.get('/auth/google/callback', LOCKER.isSessionNotAvailable, passport.authenticate("google", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Twitch strategy
router.post('/auth/twitch', LOCKER.isSessionNotAvailable, passport.authenticate("twitch", {
    failureRedirect: "/"
}));
 
router.get('/auth/twitch/callback', LOCKER.isSessionNotAvailable, passport.authenticate("twitch", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

 // Github strategy
router.post('/auth/github', LOCKER.isSessionNotAvailable, passport.authenticate("github", {
    failureRedirect: "/"
}));
 
router.get('/auth/github/callback', LOCKER.isSessionNotAvailable, passport.authenticate("github", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Discord strategy
router.post('/auth/discord', LOCKER.isSessionNotAvailable, passport.authenticate("discord", {
    failureRedirect: "/"
}));
 
router.get('/auth/discord/callback', LOCKER.isSessionNotAvailable, passport.authenticate("discord", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Twitter strategy
router.post('/auth/twitter', LOCKER.isSessionNotAvailable, passport.authenticate("twitter", {
    failureRedirect: "/" 
}));
 
router.get('/auth/twitter/callback', LOCKER.isSessionNotAvailable, passport.authenticate("twitter", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Facebook strategy
router.post('/auth/facebook', LOCKER.isSessionNotAvailable, passport.authenticate("facebook", {
    failureRedirect: "/"
}));
 
router.get('/auth/facebook/callback', LOCKER.isSessionNotAvailable, passport.authenticate("facebook", {
    successRedirect: `/${SERVER_SETTINGS.app_route}`,
    failureRedirect: "/login",
    failureFlash: true
}));

// Export module
module.exports = router;