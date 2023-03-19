async function main()
{
    /***************** DATABASE *****************/

    // Require DATABASE module
    const DATABASE = require("../database/database.js");

    // Init MySQL connection
    await DATABASE.init();

    /***************** IMPORTS *****************/

    // External module 
    const http = require('http');
    const url = require('url');
    const express = require('express');
    const morgan = require('morgan'); 
    const WebSocketServer = require('websocket').server;
    const path = require('path');
    const passport = require('passport');
    const ejs = require('ejs'); 
    const flash = require('connect-flash');
    const bodyParser = require('body-parser');

    // Our modules
    const SERVER = require("./server.js");
    const SERVER_SETTINGS = require("../config/server_settings.js");
    const {SESSION, SESSION_PROPERTIES} = require("../config/session_settings.js");
    const globals = require("../utils/globals.js");
    require('../passport/strategies.js');
    require('../passport/serializer.js');

    /***************** SERVER *****************/

    // Init server data
    await SERVER.init();

    /***************** EXPRESS JS *****************/

    // Create ExpressJS app
    const app = express(); // We use ExpressJS to deal with requests, since it allows us to manage request in a simpler way and easily serve files to the client

    // App settings
    app.set('server_protocol', SERVER_SETTINGS.protocol);
    app.set('server_address', SERVER_SETTINGS.address);
    app.set('server_port', SERVER_SETTINGS.port);
    app.set('server_prefix', SERVER_SETTINGS.server_prefix);
    app.set('appName', SERVER_SETTINGS.app_name);
    app.set('appRoute', SERVER_SETTINGS.app_route);

    // View Engine
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'ejs');

    // Define session parser
    const sessionParser = SESSION(SESSION_PROPERTIES);

    // Middleware
    // app.use(morgan('short')); // Promps the request specs
    app.use(bodyParser.urlencoded({extended: false})); // Parses encoded data sent with post method through a form
    app.use(bodyParser.json()); // Parses json data directly to objects
    app.use(sessionParser); // Parses sessions
    app.use(flash()); // Allows to easily store data in the app
    app.use(passport.initialize());  // Processes signup and login requests
    app.use(passport.session()); // Let passport know we are using a session context

    // Global variables
    app.use((req, res, next) => globals(app, req, res, next));

    // Routers
    app.use(require("../routes/app"));
    app.use(require("../routes/authenticate"));
    app.use(require("../routes/utils"));

    // Default request folder
    app.use(express.static(path.join(__dirname, '../../public')));

    // Error page
    app.use(require("../routes/error"));

    /***************** HTTP SERVER *****************/

    // Create HTTP server
    const server = http.createServer(app); // Instead of passing a custom function to manage requests, we pass the express app and let it process the requests for us

    // Launch the server
    server.listen(app.get('server_port'), () => SERVER.onReady(app.get('server_port')));

    // Update database on exit and periodically
    require("../utils/update.js");

    /***************** WEBSOCKET *****************/

    // Create WebSocketServer
    const wss = new WebSocketServer({ 
        httpServer: server // In case we already have our HTTPServer in "server" variable...
    });

    // Client connection request
    wss.on('request', function(request) {

        // Parse session with sessionParser middleware
        sessionParser(request.httpRequest, {}, function(){

            // Get session info
            const session_info = request.httpRequest.session;

            // Validate session
            if(session_info.passport == undefined) 
            {
                // Reject connection
                request.reject(102, 'You must log in before trying to connect with WebSocket');
                return;
            } 
            else
            {
                // Get user id
                const user_id = session_info.passport.user;

                // Accept connection
                const connection = request.accept(null, request.origin);
        
                // Websocket callbacks
                SERVER.onUserConnected(connection, user_id);
                connection.on('message', (message) => SERVER.onMessage(connection, message));
                connection.on('close', (message) => SERVER.onUserDisconnected(connection));
            }       
        }); 
    });
}

// Main execution
main();




