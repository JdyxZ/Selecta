/***************** EXIT HANDLER *****************/

// Modules
const SERVER = require("../main/server.js");
const DATABASE = require("../database/database.js");

// Define array of exit signals
const exit_signals = 
[
    'beforeExit', 'uncaughtException', 'unhandledRejection', 
    'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 
    'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 
    'SIGUSR2', 'SIGTERM'
];

// Set an asynchronous exitHandler callback for all exit signals
exit_signals.forEach(signal => process.on(signal, exitHandler));

// Exit Handler
async function exitHandler(exit_code) 
{
    // Output error
    console.log("\n", exit_code, "\n");

    try 
    {
        // Server on close callback
        await SERVER.onClose(); 
    } 
    catch (e) 
    {
        // Handle errors
      console.error('EXIT HANDLER ERROR ', e);
    }

    // Terminate process
    console.log('Terminating server app');
    process.exit(isNaN(exit_code) ? 1 : exit_code);
}

/***************** UPDATE DATABASE PERIODICALLY *****************/

// Define update interval
const update_interval = 10000; // [ms]

// Update database in each interval
setInterval(() => {
    if(!SERVER.clients.isEmpty()) SERVER.updateWorld();
}, update_interval);
  
