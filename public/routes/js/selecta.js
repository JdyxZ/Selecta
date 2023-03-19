
/***************** SELECTA *****************/

const SELECTA = 
{
    // TODO...

    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Methods
    init: function()
    {
        // Set CSS variables
        document.documentElement.style.setProperty('--screen_width', available_width + "px");
        document.documentElement.style.setProperty('--screen_height', available_height + "px");
    }

    // TODO...
}