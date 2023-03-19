var signup = {

    username: document.get('#username'),
    password: document.get('#password1'),
    verification_password: document.get('#password2'),

    init: function()
    {

        // Key down
        this.username.when("keydown", this.onKeyDown.bind(this));
        this.password.when("keydown", this.onKeyDown.bind(this));
        this.verification_password.when("keydown", this.onKeyDown.bind(this));
    },

    onKeyDown: function(event)
    {
        const alert = document.querySelector(".alert");
        if(alert)
            alert.hide();
    },    
}