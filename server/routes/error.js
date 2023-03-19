/***************** ERROR ROUTE *****************/

// External modules
const express = require('express');
const router = express.Router();

// Our modules
const {WORLD} = require("../model/model.js");
const SERVER_SETTINGS = require("../config/server_settings.js");

// Define a default response message
const res_message = `Page not found. Try with one of the following: \n- /login \n- /signup \n- /${SERVER_SETTINGS.app_route}`;

// Error route
router.use((req, res, next) => {

    // Set response status to indicate the client that the page hasn't been found
    res.status(404);

    // Build auxiliar object to use inside ejs view
    const aux =
    {
        current_view : "error",
        session_status: req.isAuthenticated(),
        session_user: req.session.passport == undefined ? null: WORLD.getUser(req.session.passport.user).name
    };
  
    // Respond with the error page
    if (req.accepts('html')) {
      res.render("error", aux);
      return;
    }
  
    // Respond with json
    if (req.accepts('json')) {
      res.json({ error: res_message});
      return;
    }

    // Otherwise, send a txt 
    res.type('txt').send(res_message);
});

// Export module
module.exports = router;

