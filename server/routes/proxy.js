/***************** PROXY ROUTE *****************/

// External modules
const express = require('express');
const router = express.Router();
const url = require('url');
const needle = require('needle');
// const cache = require('http-proxy-cache');

// Proxy
router.get('/proxy', async (req, res) => {  
    try 
    {
        // Get URL
        const url = req.query.url;

        // Request resource
        const response = await needle('get', url);

        // Pipe response
        res.send(response.body);
    } 
    catch (error) 
    {
        // Manage invalid URL erros
        res.status(400).send('Invalid URL');
    }
});

// Export module
module.exports = router;