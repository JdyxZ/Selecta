/***************** DEFINE APP GLOBALS MIDDLEWARE *****************/

function globals(app, req, res, next)
{
    // Server settings
    app.locals.server_protocol = app.get("server_protocol");
    app.locals.server_address = app.get("server_address");
    app.locals.server_port = app.get("server_port");
    app.locals.server_prefix = app.get("server_prefix") === undefined ? '' : app.get("server_prefix");
    app.locals.appName = app.get("appName");
    app.locals.appRoute = app.get("appRoute");

    // Current view
    app.locals.current_view = app.get("current_view");

    // Sign up
    app.locals.signup_username = req.flash('signup_username');
    app.locals.signup_username_error = req.flash('signup_username_error');
    app.locals.signup_password = req.flash('signup_password');
    app.locals.signup_password_error = req.flash('signup_password_error');
    app.locals.signup_error = req.flash('signup_error')

    // Log in
    app.locals.login_username = req.flash('login_username');
    app.locals.login_password = req.flash('login_password');
    app.locals.login_user_error = req.flash('login_user_error');
    app.locals.login_error = req.flash('login_error');

    // Social log in
    app.locals.social_error = req.flash('social_error');

    // Session 
    app.locals.session_status = req.flash('session_status');
    app.locals.session_user = req.flash('session_user');

    // Pass to the next middleware
    next();
}

module.exports = globals;