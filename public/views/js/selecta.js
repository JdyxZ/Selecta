
/***************** SELECTA *****************/

const SELECTA = 
{
    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Interface interactions
    settings_button : document.get("#settings_button"),
    settings_menu : document.get("#interface_settings_id"),
    settings_menu_close : document.get("#settings_close_button"),
    settings_apply_changes : document.get("#settings_apply_changes"),

    // Audio, video and keybinds buttons
    settings_audio_button: document.get("#interface_settings_option_audio"),
    settings_video_button: document.get("#interface_settings_option_video"),
    settings_keybinds_button: document.get("#interface_settings_option_keybinds"),

    // Audio, video and keybinds containers 
    settings_audio_container: document.get("#audio_settings_container"),
    settings_video_container: document.get("#video_settings_container"),
    settings_keybinds_container: document.get("#keybinds_settings_container"),

    // Sliders
    general_volume_slider: document.get("#slider_general"),
    music_volume_slider: document.get("#slider_music"),
    people_volume_slider: document.get("#slider_people"),
    micro_volume_slider: document.get("#slider_mic"),

    // Exit button and image
    settings_exit : document.get("#logout_button"),
    settings_exit_button : document.get("#logout-button"),

    // You sure you want to exit?
    exit_button_yes: document.get("#logout_yes"),
    exit_button_no: document.get("#logout_no"),
    exit_menu: document.get("#logout_menu"),

    // Mute unmute mic image
    mute_img: document.get("#mute_image"),
    mute_button : document.get("#mute_image_button"),

    // Control varibles
    muted: false,

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
        this.settings_button.when("click", this.onClick.bind(this));
        this.settings_menu_close.when("click", this.onClick.bind(this));
        this.settings_apply_changes.when("click", this.settings_menu.hide());

        this.settings_exit.when("click", () => this.exit_menu.show());
        this.exit_button_yes.when("click", () => this.settings_exit_button.click());
        this.exit_button_no.when("click", () => this.exit_menu.hide());

        // Callbacks for switching settings menus
        this.settings_audio_button.when("click", this.switch_menu.bind(this));
        this.settings_video_button.when("click", this.switch_menu.bind(this));
        this.settings_keybinds_button.when("click", this.switch_menu.bind(this));

        // Init sliders
        this.init_slider(this.general_volume_slider);
        this.init_slider(this.music_volume_slider);
        this.init_slider(this.people_volume_slider);
        this.init_slider(this.micro_volume_slider);

        // Callbacks for volume control
        this.music_volume_slider.when("input", this.adjust_volume);
        MODEL.player.volume = this.music_volume_slider.value;

        // Callback for mute/unmute
        this.mute_button.when("click", this.input_audio_switch.bind(this));

        // Init other resources
        CONTROLLER.init();
        CLIENT.init();
    },

    init_slider: function(slider)
    {
        slider.min = 0;
        slider.max = 1;
        slider.step = 0.01;
        slider.value = 0.1;
    },

    adjust_volume: function(event)
    {
        MODEL.player.volume = event.target.value;
    },

    input_audio_switch: function()
    {
        if(this.muted)
        {
            this.mute_img.src = "media/interface/img_speaker_on.png";
            this.muted = false;
        }else
        {
            this.mute_img.src = "media/interface/img_speaker_off.png";
            this.muted = true;
        }
        // src="media/interface/img_speaker_off.png"
    },

    switch_menu: function(event)
    {
        // Clear the background color of each three buttons
        this.settings_audio_button.change_background_color("#323131");
        this.settings_video_button.change_background_color("#323131");
        this.settings_keybinds_button.change_background_color("#323131");

        // Update the selected menu color
        event.target.change_background_color("#208d70");

        // Hide all the menus
        this.settings_audio_container.hide();
        this.settings_video_container.hide();
        this.settings_keybinds_container.hide();

        // Show the selected menu
        if(event.target.id == "interface_settings_option_audio")
            this.settings_audio_container.show();
        if(event.target.id == "interface_settings_option_video")
            this.settings_video_container.show();
        if(event.target.id == "interface_settings_option_keybinds")
            this.settings_keybinds_container.show();
        
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
}