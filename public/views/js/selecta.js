
/***************** SELECTA *****************/

const SELECTA = 
{
    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Interfaces
    search_interface: document.get("#Selecta #interface_search"),
    votes_interface: document.get("#Selecta #interface_votes"),
    settings_interface: document.get("#Selecta #interface_settings"),
    exit_interface: document.get("#Selecta #logout_menu"),

    // Interface triggers
    mute_trigger: document.get("#Selecta #micro_trigger"),
    search_trigger: document.get("#Selecta #search_trigger"),
    votes_trigger: document.get("#Selecta #votes_trigger"),
    settings_trigger: document.get("#Selecta #settings_trigger"),
    exit_trigger: document.get("#Selecta #logout_trigger"),

    // Micro image
    mute_img: document.get("#Selecta #mute_image"),

    // Settings interactions
    settings_menu_close: document.get("#settings_close_button"),
    settings_apply_changes: document.get("#settings_apply_changes"),

    // Audio, video and keybinds buttons
    settings_audio_button: document.get("#interface_settings_option_audio"),
    settings_video_button: document.get("#interface_settings_option_video"),
    settings_keybinds_button: document.get("#interface_settings_option_keybinds"),

    // Audio, video and keybinds containers 
    settings_audio_container: document.get("#audio_settings_container"),
    settings_video_container: document.get("#video_settings_container"),
    settings_keybinds_container: document.get("#keybinds_settings_container"),

    // Sliders
    sliders: {
        general_volume: document.get("#slider_general"),
        music_volume: document.get("#slider_music"),
        people_volume: document.get("#slider_people"),
        micro_volume: document.get("#slider_mic"),
    },

    // Exit button
    exit_button: document.get("#logout-button"),
    exit_button_yes: document.get("#logout_yes"),
    exit_button_no: document.get("#logout_no"),

    // Search interface
    search_result: document.get("#Selecta #interface_search #search_result"),

    // Votes interface

    // Templates
    song_template: document.get("#Selecta .song"),

    // Control varibles
    muted: false,

    // Methods
    init: function()
    {
        // Set CSS variables
        document.documentElement.style.setProperty('--screen_width', this.available_width + "px");
        document.documentElement.style.setProperty('--screen_height', this.available_height + "px");

        // Add listeners
        this.addEventListeners();

        // Init sliders
        this.initSliders();

        // Update MODEL state
        this.updateModel();

        // Init other resources
        CONTROLLER.init();
        CLIENT.init();
    },

    addEventListeners: function()
    {             
        // Triggers
        this.mute_trigger.when("click", this.toggleMute.bind(this));
        this.search_trigger.when("click", () => this.search_interface.toggleVisibility());
        this.votes_trigger.when("click" () => this.votes_interface.toggleVisibility());
        this.search_trigger.when("click", () => this.search_interface.toggleVisibility());
        this.settings_trigger.when("click", () => this.settings_interface.toggleVisibility());
        this.exit_trigger.when("click", () => this.exit_interface.toggleVisibility());

        // Settings interactions
        this.settings_menu_close.when("click", () => this.settings_interface.toggleVisibility());
        this.settings_apply_changes.when("click", () => this.settings_interface.hide());

        // Exit button
        this.exit_button_yes.when("click", () => this.exit_button.click());
        this.exit_button_no.when("click", () => this.exit_interface.hide());

        // Settings menus
        this.settings_audio_button.when("click", this.switchSettingsMenu.bind(this));
        this.settings_video_button.when("click", this.switchSettingsMenu.bind(this));
        this.settings_keybinds_button.when("click", this.switchSettingsMenu.bind(this)); 
        
        // Callbacks for volume control
        this.sliders.music_volume.when("input", this.setVolume);
    },

    initSliders: function(slider)
    {
        this.sliders.values().forEach(slider => {
            slider.min = 0;
            slider.max = 1;
            slider.step = 0.01;
            slider.value = 0.1;
        });
    },

    updateModel: function()
    {
        MODEL.player.volume = this.sliders.music_volume.value;
    },

    setVolume: function(event)
    {
        MODEL.player.volume = event.target.value;
    },

    toggleMute: function()
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

    switchSettingsMenu: function(event)
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

    youtubeSearch: function()
    {
        
    },

    suggestSong: function()
    {

    },

    votesSearch: function()
    {

    },

    voteSuggestion: function()
    {

    }

}