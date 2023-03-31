
/***************** SELECTA *****************/

const SELECTA = 
{
    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Interfaces
    search_interface: document.get("#Selecta #search_interface_wrapper"),
    votes_interface: document.get("#Selecta #votes_interface"),
    settings_interface: document.get("#Selecta #settings_interface"),
    exit_interface: document.get("#Selecta #exit_interface"),

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
    search_input: document.get("#Selecta #search_interface #search_bar input"),
    search_result: document.get("#Selecta #search_interface #search_result"),

    // Votes interface

    // Templates
    videoTemplate: document.get("#Selecta .video"),

    // Control varibles
    muted: false,
    searching: false,
    lastQuery: null,

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
        this.votes_trigger.when("click", () => this.votes_interface.toggleVisibility());
        this.settings_trigger.when("click", () => this.settings_interface.toggleVisibility());
        this.exit_trigger.when("click", () => this.exit_interface.toggleVisibility());

        // Settings interactions
        this.settings_menu_close.when("click", () => this.settings_interface.hide());
        this.settings_apply_changes.when("click", () => this.settings_interface.hide());

        // Exit button
        this.exit_button_yes.when("click", () => this.exit_button.click());
        this.exit_button_no.when("click", () => this.exit_interface.hide());

        // Settings menus
        this.settings_audio_button.when("click", this.switchSettingsMenu.bind(this));
        this.settings_video_button.when("click", this.switchSettingsMenu.bind(this));
        this.settings_keybinds_button.when("click", this.switchSettingsMenu.bind(this)); 

        // Search interface
        this.search_input.when("keydown", this.onKeyDown);
        
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

    onKeyDown: function(event)
    {
        if(this.tagName == "INPUT")
		{		
			if(event.code == "Enter")
			{
				SELECTA.youtubeSearch(this.value);
			}
		}
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

    youtubeSearch: async function(query)
    {
        // Check
        if(this.searching || query === this.lastQuery)
            return;

        // Remove previous search elements
        this.search_result.removeChildren();

        // Search videos related to the query
        const search = await YOUTUBE.search(query);

        // Check errors
        if(search == null) return;

        // Map videosIDs
        const videosIDs = search.map(video => video.ID);

        // Get more information about the searched videos
        const videos = await YOUTUBE.getVideosInfo(videosIDs);

        // Check errors
        if(videos == null) return;

        const channelsIDs = videos.reduce((acc, video) => {
            
            // Declare channel ID
            const channelID = video.publisherChannel.ID;

            // If is not included, push it
            if(!acc.includes(channelID))
                acc.push(channelID);

            return acc;
        }, []);

        // Get info about the channels
        const channels = await YOUTUBE.getChannelsInfo(channelsIDs);

        // Check errors
        if(channels == null) return;

        // Iterate through the videos of the result of the search
        for(const video of videos)
        {
            // Find channel of the video
            const channel = channels.getObject({ID: video.publisherChannel.ID});

            // Check
            if(channel == null) continue;
            
            // Clone video template
            const videoHTML = this.videoTemplate.clone();

            // Get wrappers from template
            const wrapperLanguage = videoHTML.get(".title-wrapper .language");

            // Get video HTML elements from template
            const videoThumbnail = videoHTML.get(".thumbnail-wrapper .thumbnail");
            const videoDuration = videoHTML.get(".duration label");
            const videoTitle = videoHTML.get(".title-wrapper .title");
            const videoLanguage = videoHTML.get(".language label");
            const videoLikes = videoHTML.get(".stats-wrapper .likeCount label");
            const videoViews = videoHTML.get(".stats-wrapper .viewCount label");
            const videoComments = videoHTML.get(".stats-wrapper .commentCount label");
            const videoElapsedTime = videoHTML.get(".stats-wrapper .publicationDate label");
            const videoDescription = videoHTML.get(".description");

            // Get channel HTML elements from template
            const channelThumbnail = videoHTML.get(".channel-wrapper .thumbnail img");
            const channelTitle = videoHTML.get(".channel-wrapper .title");
            const channelCountry = videoHTML.get(".countryFlag");
            const channelSubs = videoHTML.get(".channel-wrapper .subscriberCount label");
            const channelViews = videoHTML.get(".channel-wrapper .viewCount label");
            const channelVideos = videoHTML.get(".channel-wrapper .videoCount label");
            const channelElapsedTime = videoHTML.get(".channel-wrapper .publicationDate label");

            // Fill video template with video data
            if(video.thumbnails) videoThumbnail.src = video.thumbnails.high.url;
            if(video.duration) videoDuration.textContent = joinTime(video.duration);
            if(video.title) videoTitle.textContent = video.title;
            video.language ? videoLanguage.textContent = video.language.toUpperCase() : wrapperLanguage.hide();
            if(video.likeCount) videoLikes.textContent = video.likeCount.toNumber().format();
            if(video.viewCount) videoViews.textContent = video.viewCount.toNumber().format();
            if(video.commentCount) videoComments.textContent = video.commentCount.toNumber().format();
            if(video.elapsedTime) videoElapsedTime.textContent = getBiggestTime(video.elapsedTime);
            if(video.description) videoDescription.textContent = video.description.resume(20);

            // Fill video template with channel data
            if(channel.thumbnails) channelThumbnail.src = channel.thumbnails.medium.url;
            if(channel.title) channelTitle.textContent = channel.title;
            if(channel.subscriberCount) channelSubs.textContent = channel.subscriberCount.toNumber().format();
            if(channel.viewCount) channelViews.textContent = channel.viewCount.toNumber().format();
            if(channel.videoCount) channelVideos.textContent = channel.videoCount.toNumber().format();
            if(channel.elapsedTime) channelElapsedTime.textContent = getBiggestTime(channel.elapsedTime);

            // Create and initialize flag instance
            if(channel.country)
            {
                const flag = new CountryFlag(channelCountry);
                flag.selectByAlpha2(channel.country.toLowerCase());
            }
            
            // Append video template to the search results
            this.search_result.appendChild(videoHTML);

            // Show video template
            videoHTML.show();
        }

        // Register query
        this.lastQuery = query;
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