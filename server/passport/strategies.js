/***************** STRATEGIES *****************/

// External modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitchStrategy = require('passport-twitch-new').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
/* const TwitterStrategy = require('passport-twitter').Strategy; */
const FacebookStrategy = require('passport-facebook').Strategy;

// Our modules
const LOCKER = require("../utils/locker.js");
const OAUTH_CREDENTIALS = require('../config/oauth_credentials.js');
const {LOCAL_VERIFICATION, SOCIAL_VERIFICATION} = require("./verifications.js");

/***************** LOCAL STRATEGY *****************/

passport.use('local_signup', new LocalStrategy(
{
    usernameField: 'name',
    passwordField: 'password',
    passReqToCallback: true
},
LOCAL_VERIFICATION.signup));
    
passport.use('local_login', new LocalStrategy(
{
    usernameField: 'name',
    passwordField: 'password',
    passReqToCallback: true
}, 
LOCAL_VERIFICATION.login));

/***************** GOOGLE STRATEGY *****************/

passport.use(new GoogleStrategy(
{
    clientID: OAUTH_CREDENTIALS.google.ID,
    clientSecret: OAUTH_CREDENTIALS.google.secret,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true,
    scope: ['profile'] 
},
SOCIAL_VERIFICATION.process));


/***************** TWITCH STRATEGY *****************/

passport.use(new TwitchStrategy(
{
    clientID: OAUTH_CREDENTIALS.twitch.ID,
    clientSecret: OAUTH_CREDENTIALS.twitch.secret,
    callbackURL: '/auth/twitch/callback',
    passReqToCallback: true,
    scope: ['user_read']
},
SOCIAL_VERIFICATION.process));

/***************** GITHUB STRATEGY *****************/

passport.use(new GithubStrategy(
{
    clientID: OAUTH_CREDENTIALS.github.ID,
    clientSecret: OAUTH_CREDENTIALS.github.secret,
    callbackURL: '/auth/github/callback',
    passReqToCallback: true,
    scope: ['profile'] 
},
SOCIAL_VERIFICATION.process));

/***************** DISCORD STRATEGY *****************/

passport.use(new DiscordStrategy(
{
    clientID: OAUTH_CREDENTIALS.discord.ID,
    clientSecret: OAUTH_CREDENTIALS.discord.secret,
    callbackURL: '/auth/discord/callback',
    passReqToCallback: true,
    scope: ['identify'] 
},
SOCIAL_VERIFICATION.process));

/***************** TWITTER STRATEGY *****************/

/* passport.use(new TwitterStrategy(
{
    consumerKey: OAUTH_CREDENTIALS.twitter.ID,
    consumerSecret: OAUTH_CREDENTIALS.twitter.secret,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true,
    scope: ['profile'] 
},
SOCIAL_VERIFICATION.process)); */

/***************** FACEBOOK STRATEGY *****************/

passport.use(new FacebookStrategy(
{
    clientID: OAUTH_CREDENTIALS.facebook.ID,
    clientSecret: OAUTH_CREDENTIALS.facebook.secret,
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true,
    profileFields: ['id', 'displayName']
},
SOCIAL_VERIFICATION.process));