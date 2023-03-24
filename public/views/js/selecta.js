
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

    // Methods
    init: function()
    {
        // Set CSS variables
        document.documentElement.style.setProperty('--screen_width', available_width + "px");
        document.documentElement.style.setProperty('--screen_height', available_height + "px");

        // Set callbacks for interactions
        this.settings_button.when("click",this.onClick.bind(this));
        this.settings_menu_close.when("click",this.onClick.bind(this));

        // Init other resources
        CONTROLLER.init();
        CLIENT.init();
    },

    onClick: function(event)
    {
        var element = null;
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