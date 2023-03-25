
/***************** SELECTA *****************/

const SELECTA = 
{
    // TODO...

    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Interface interactions
    settings_button : document.get("#settings_button"),
    settings_menu : document.get("#interface_settings_id"),
    settings_menu_close : document.get("#settings_close_button"),

    // Exit button and image
    settings_exit : document.get("#logout_button"),
    settings_exit_button : document.get("#logout-button"),

    // You sure you want to exit?
    exit_button_yes: document.get("#logout_yes"),
    exit_button_no: document.get("#logout_no"),
    exit_menu: document.get("#logout_menu"),

    // Methods
    init: function()
    {
        // Set CSS variables
        document.documentElement.style.setProperty('--screen_width', this.available_width + "px");
        document.documentElement.style.setProperty('--screen_height', this.available_height + "px");

        // Hides
        this.settings_exit_button.hide();
        this.exit_menu.hide();

        // Set callbacks for interactions
        this.settings_button.when("click",this.onClick.bind(this));
        this.settings_menu_close.when("click",this.onClick.bind(this));
        this.settings_exit.when("click",() => this.exit_menu.show());
        this.exit_button_yes.when("click",() => this.settings_exit_button.click());
        this.exit_button_no.when("click",() => this.exit_menu.hide());

        // Init other resources
        CONTROLLER.init();
        CLIENT.init();
    },

    onClick: function(event)
    {
        var element = null;
        console.log("click");
        if((event.target.getParents()[0].id == "settings_button") || (event.target.getParents()[0].id == "settings_close_button")) element = this.settings_menu;
        // const element = document.get("#"+event.target.getParents()[0].id);
        
        // Check the visibility to show or hide depending on the case
        if (element != null)
        {
            if(element.visibility() == "none")
            {
                element.show();
            }
            else
            {
                element.hide();
            }  
        }
        else
        {
            console.log("WARNING: onClick function error, element is null");
        }        
    }

    // TODO...
}