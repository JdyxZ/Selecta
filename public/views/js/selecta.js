
/***************** SELECTA *****************/

const SELECTA = 
{
    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Selecta
    selecta: document.get("#Selecta"),

    // Loading screen
    loading_screen: document.get("#loading_screen"),

    // Loading button
    loading_screen_bttn: document.get("#loading_screen .loop_container #start_button"),

    // Loading loop
    loading_screen_loop: document.get("#loading_screen .loop_container #loading_loop"),

    // Wrappers
    search_interface_wrapper: document.get("#Selecta #search_interface_wrapper"),
    vote_interface_wrapper: document.get("#Selecta #vote_interface_wrapper"),

    // Interfaces
    menu_interface: document.get("#menu_interface"),
    search_interface: document.get("#Selecta #search_interface"),
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

    // Player
    player_current_song: document.get("#Selecta .player_container .current_song .player_song"),
    player_next_song: document.get("#Selecta .player_container .next_song .player_song"),

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
    search_dragger: document.get("#search_interface #drag_menu"),
    search_closer: document.get("#search_interface #closer"),
    search_input: document.get("#Selecta #search_interface #search_bar input"),
    search_result: document.get("#Selecta #search_interface #search_result"),

    // Votes interface
    vote_dragger: document.get("#votes_interface #drag_menu"),
    vote_closer: document.get("#votes_interface #closer"),
    vote_input: document.get("#Selecta #votes_interface #search_bar input"),
    vote_result: document.get("#Selecta #votes_interface #search_result"),


    // Templates
    videoTemplate: document.get("#Selecta .video"),
    voteVideoTemplate: document.get("#Selecta .vote_video"),
    videoSelect: null,

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

        // Hide selecta menu and show the loading screen
        this.menu_interface.hide();
        //this.loading_screen.show();

        // Start the loading timeout
        setTimeout(this.loading_over.bind(this), 4000);
    },

    addEventListeners: function()
    {         
        // Start Selecta
        this.loading_screen_bttn.when("click", this.start.bind(this));

        // Triggers
        this.mute_trigger.when("click", this.toggleMute.bind(this));
        this.search_trigger.when("click", () => this.search_interface_wrapper.toggleVisibility());
        this.votes_trigger.when("click", () => this.vote_interface_wrapper.toggleVisibility());
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
        // this.search_dragger.when("mousedown", (event) => dragElement(event, this.search_interface, this.available_width, this.available_height));
        this.search_closer.when("click", () => this.search_interface_wrapper.hide());
        this.vote_closer.when("click", () => this.vote_interface_wrapper.hide());
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

    start: function()
    {
        this.menu_interface.hide();
        this.loading_screen.hide();
    },

    loading_over: function()
    {
        this.loading_screen_bttn.show();
        this.loading_screen_loop.hide();
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

    parseVideosToHTML(videos)
    {
        // Create array of videos
        let videosHTML = [];

        for(const video of videos)
        {
            // Check
            if(video.publisherChannel == null) continue;
            
            // Clone video template
            const videoHTML = this.videoTemplate.clone();

            // Display the suggest icon
            videoHTML.get(".title-wrapper .suggestion").style.display = "flex";

            // Set data ID to the videoHTML
            videoHTML.setAttribute('data-id', video.ID);

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
            if(video.publisherChannel.thumbnails) channelThumbnail.src = video.publisherChannel.thumbnails.medium.url;
            if(video.publisherChannel.title) channelTitle.textContent = video.publisherChannel.title;
            if(video.publisherChannel.subscriberCount) channelSubs.textContent = video.publisherChannel.subscriberCount.toNumber().format();
            if(video.publisherChannel.viewCount) channelViews.textContent = video.publisherChannel.viewCount.toNumber().format();
            if(video.publisherChannel.videoCount) channelVideos.textContent = video.publisherChannel.videoCount.toNumber().format();
            if(video.publisherChannel.elapsedTime) channelElapsedTime.textContent = getBiggestTime(video.publisherChannel.elapsedTime);

            // Create and initialize flag instance
            if(video.publisherChannel.country)
            {
                const flag = new CountryFlag(channelCountry);
                flag.selectByAlpha2(video.publisherChannel.country.toLowerCase());
            }
            
            // Push videoHTML to array
            videosHTML.push(videoHTML);
        }

        // Output
        return videosHTML;
    },      

    youtubeSearch: async function(query)
    {
        // Check
        if(this.searching || query === this.lastQuery)
            return;

        // Display the vote icon
        videoHTML.get(".title-wrapper .votes").style.display = "flex";

        // Add the callback
        videoHTML.when('click', this.voteSuggestion);

        // Get wrappers from template
        const wrapperLanguage = videoHTML.get(".title-wrapper .language");

        // The id of the song
        videoHTML.setAttribute('data-id', suggestion.songID);

        // Draw the correspodent icon
        if(MODEL.my_votes.includes(suggestion.songID))
            videoHTML.get(".title-wrapper .votes img").src = "media/interface/img_heart_on.png"
        else
            videoHTML.get(".title-wrapper .votes img").src = "media/interface/img_heart_off.png"
        if(MODEL.my_suggestion.songID === suggestion.songID)
            videoHTML.get(".title-wrapper .votes img").src = "media/interface/img_heart_my.png"

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

        // Check errors
        if(search == null) return;

        // Map videosIDs
        const videosIDs = search.map(video => video.ID);

        // Add the number of votes of the song
        const count = suggestion.vote_counter;
        videoHTML.get(".title-wrapper .votes #vote_counter").textContent = count;

        // Fill video template with video data
        if(song.thumbnails) videoThumbnail.src = song.thumbnails;
        if(song.duration) videoDuration.textContent = song.duration; // KK????
        if(song.title) videoTitle.textContent = song.title;
        //video.language ? videoLanguage.textContent = video.language.toUpperCase() : wrapperLanguage.hide();
        if(song.likeCount) videoLikes.textContent = song.likeCount;
        if(song.viewCount) videoViews.textContent = song.viewCount;
        if(song.commentCount) videoComments.textContent = song.commentCount;
        if(song.elapsedTime) videoElapsedTime.textContent = song.elapsedTime;
        if(song.description) videoDescription.textContent = song.description;

        // Check errors
        if(videos == null) return;

        // Get IDs of the channels of the videos
        const channelsIDs = videos.map(video => video.publisherChannel.ID);

        // Get info about the channels
        const channels = await YOUTUBE.getChannelsInfo(channelsIDs);

        // Check errors
        if(channels == null) return;

        // Append info about the channels to the videos
        videos.forEach(video => {
            
            // Find channel of the video
            const channel = channels.getObject({ID: video.publisherChannel.ID});

            // Append channel
            video.publisherChannel = channel;
        })

        // Parse videos to HTML containers
        const videosHTML = this.parseVideosToHTML(videos);

        // Append video containers to the search results
        this.search_result.appendChildren(videosHTML);

        // Show video containers
        videosHTML.forEach(video => video.show());

        // Update the suggestion SELECTA.videoSelect
        const selected_videos = document.querySelectorAll('.video');
        selected_videos.forEach(video => {
            video.addEventListener('click', this.suggestSong);
        });

        // Register query
        this.lastQuery = query;
    },

    suggestSong: function(event)
    {
        // Get the entry div and the condition
        var div = event.target;
        var condition = div.classList[0];

        // Find the parent class
        while( condition != "video")
        {
            div = div.parentNode;
            condition = div.classList[0];
        }

        // Get the image icon
        const icon = div.get(".title-wrapper .suggestion img");

        const id = div.getAttribute('data-id');

        // Change the video background color
        if(div.id == "selected_song")
        {
            div.id = '';
            icon.src = "media/interface/img_suggest_off.png";

            // Delete the song
            MODEL.removeSong(MODEL.my_suggestion.songID);
            delete MODEL.suggestions[id];
            MODEL.my_suggestion = null;
            MODEL.updateSuggestionInterface();

            return
        }
        else
        {
            // Get the old selected song TODO IF NOT EXISTS

            var old_selected_video = document.get("#selected_song");
            old_selected_video.id = '';
            old_selected_video.get(".title-wrapper .suggestion img").src = "media/interface/img_suggest_off.png";
            
            // Update the new selected song
            div.id = "selected_song";
            icon.src = "media/interface/img_suggest_on.png";
        }

        // Delete the song
        if(MODEL.my_suggestion !== null)
        {
            MODEL.removeSong(MODEL.my_suggestion.songID);
            delete MODEL.suggestions[id];
        }
            

        // Obtain song data from the div
        MODEL.temp = div;
 
        const videoThumbnail = div.querySelector('.thumbnail-wrapper .thumbnail').src;
        const videoDuration = div.querySelector('.thumbnail-wrapper .duration label').textContent;
        const videoTitle = div.querySelector('.title-wrapper').textContent;
        const videoLanguage = div.querySelector('.title-wrapper .language label').textContent;
        const videoViews = div.querySelector('.stats-wrapper .viewCount label').textContent;
        const videoLikes = div.querySelector('.stats-wrapper .likeCount label').textContent;
        const videoComments = div.querySelector('.stats-wrapper .commentCount label').textContent;
        const videoElapsedTime = div.querySelector('.stats-wrapper .publicationDate label').textContent;
        const channelThumbnail = div.querySelector('.channel-wrapper .thumbnail img').src;
        const channelTitle = div.querySelector('.channel-wrapper .info .title').textContent;
        const channelSubs = div.querySelector('.channel-wrapper .stats .subscriberCount label').textContent;
        const channelViews = div.querySelector('.channel-wrapper .stats .viewCount label').textContent;
        const channelVideos = div.querySelector('.channel-wrapper .stats .videoCount label').textContent;
        const channelElapsedTime = div.querySelector('.channel-wrapper .stats .publicationDate label').textContent;
        const videoDescription = div.querySelector('.description-wrapper .description').textContent;

        MODEL.suggestion_counter += MODEL.suggestion_counter;
        
        // Create the song object  
        MODEL.createSong(id,videoThumbnail,videoDuration,videoTitle,videoViews,videoLikes,videoComments,videoElapsedTime,channelThumbnail,channelTitle,channelSubs,channelViews,channelVideos,channelElapsedTime,videoDescription,videoLanguage);

        // Create and add the suggestion
        MODEL.my_suggestion = MODEL.createSuggestion(id,MODEL.my_user.id,0);

        // Update the DOM
        MODEL.updateSuggestionInterface();
        
        // Send the message to the other users
        CONTROLLER.sendSuggestion(MODEL.my_suggestion);
    },

    votesSearch: function()
    {
        // TODO
    },

    voteSuggestion: function()
    {
        // Get the entry div and the condition
        var div = event.target;
        var condition = div.classList[0];

        // Find the parent class
        while( condition != "video")
        {
            div = div.parentNode;
            condition = div.classList[0];
        }

        // Get the image icon
        const icon = div.get(".title-wrapper .votes img");

        // Get the video id
        const id = div.getAttribute('data-id');
        
        //If its my suggestion
        if(MODEL.my_suggestion.songID === id)
            return

        // If I already voted the video
        if(MODEL.my_votes.includes(id))
        {
            // I already voted so I unvote
            MODEL.suggestions[id].vote_counter -= 1;
            MODEL.my_votes.pop(id);
        }
        else
        {
            // I haven't voted yet, so I proceed
            MODEL.suggestions[id].vote_counter += 1;
            MODEL.my_votes.push(id);
        }
        console.log(icon.src);
        // Update the DOM
        MODEL.updateSuggestionInterface();
        
        // Send the message to the other users
        CONTROLLER.sendVote(id);
    }

}