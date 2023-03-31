/***************** INTERMEDIATE *****************/

const INTERMEDIATE = {

    button: document.get('#yes'),

    init: function()
    {
        // Key down
        this.button.when("keydown", this.onKeyDown.bind(this));
    },

    // No entiendo como deberia seguir
    onKeyDown: function(event)
    {
        const alert = document.querySelector(".alert");
        if(alert)
            alert.hide();
    }
}