
/***************** SELECTA *****************/

const SELECTA = 
{
    // CSS variables
    available_height: window.screen.availHeight,
    available_width: window.screen.availWidth,

    // Selecta
    selecta: document.get("#Selecta"),

     // Loading
    loading_screen: document.get("#loading_screen"),
    loading_screen_button: document.get("#loading_screen .loop_container #start_button"),
    loading_screen_loop: document.get("#loading_screen .loop_container #loading_loop"),

    // Wrappers
    search_interface_wrapper: document.get("#Selecta #search_interface_wrapper"),
    vote_interface_wrapper: document.get("#Selecta #vote_interface_wrapper"),

    // Interfaces
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
    sliders: 
    {
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
    debug: null,

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

        // Hide selecta and show the loading screen
        this.selecta.hide();
        //this.loading_screen.show();

        // Start the loading timeout
        setTimeout(this.loadingOver.bind(this), 3000);
    },

    addEventListeners: function()
    {             
        // Start Selecta
        this.loading_screen_button.when("click", this.start.bind(this));

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
        this.search_result.when("click", this.suggestSong.bind(this));

        // Votes interface
        this.votes_trigger.when("click", this.updateVotesInterface.bind(this));
        this.vote_result.when('click', this.voteSuggestion.bind(this));
        
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
        this.selecta.show();
        this.loading_screen.hide();
    },

    loadingOver: function()
    {
        this.loading_screen_button.show();
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

            // Set data ID to the videoHTML
            videoHTML.setAttribute('data-id', video.ID);

            // Get wrappers from template
            const languageWrapper = videoHTML.get(".title-wrapper .language");

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

            // Display the suggest icon
            videoHTML.get(".title-wrapper .suggestion").style.display = "flex";

            // Fill video template with video data
            if(video.thumbnails) videoThumbnail.src = video.thumbnails.high.url;
            if(video.duration) videoDuration.textContent = joinTime(video.duration);
            if(video.title) videoTitle.textContent = video.title;
            video.language ? videoLanguage.textContent = video.language.toUpperCase() : languageWrapper.hide();
            if(video.likeCount) videoLikes.textContent = video.likeCount.toNumber().format();
            if(video.viewCount) videoViews.textContent = video.viewCount.toNumber().format();
            if(video.commentCount) videoComments.textContent = video.commentCount.toNumber().format();
            if(video.elapsedTime) videoElapsedTime.textContent = getBiggestTime(video.elapsedTime);
            if(video.description) videoDescription.textContent = video.description.resumeByChars(200);

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

        // Get suggested HTML elements
        const suggested_videos = [];
        if(MODEL.my_suggestion) suggested_videos.push(MODEL.my_suggestion.ID);
        
        // Remove previous search elements except suggested ones
        this.search_result.replaceChildren(...suggested_videos);

        // Search videos related to the query
        const search = await YOUTUBE.search(query);

        // Check errors
        if(search == null) return;

        // Map videosIDs
        const videosIDs = search.map(video => video.ID);

        // Get more information about the searched videos
        let videos = await YOUTUBE.getVideosInfo(videosIDs);

        // Check errors
        if(videos == null) return;

        // Get IDs of the channels of the videos
        const channelsIDs = videos.map(video => video.publisherChannel.ID);

        // Get info about the channels
        const channels = await YOUTUBE.getChannelsInfo(channelsIDs);

        // Check errors
        if(channels == null) return;

        // Append info about the channels to the videos
        videos.forEach(video => video.publisherChannel = channels.getObject({ID: video.publisherChannel.ID}));

        // Parse videos to HTML containers
        const videosHTML = this.parseVideosToHTML(videos);

        // Append video containers to the search results
        this.search_result.appendChildren(videosHTML);

        // Show video containers
        videosHTML.forEach(video => video.show());

        // Update MODEL with the current search results
        MODEL.current_search = videos;

        // Register query
        this.lastQuery = query;
    },

    suggestSong: function(event)
    {
        // Get node element of the event
        const node = event.srcElement;

        // Get parents
        const parents = node.getParents();

        // Get videoHTML and videoID
        let videoHTML, videoID;
        for(const parent of parents)
        {
            if(parent.classList && parent.classList.contains("video")) 
            {
                videoHTML = parent;
                videoID = videoHTML.getAttribute('data-id');
            }
        }

        // Checkings
        if(!videoHTML || (my_suggestion.songID !== videoID && MODEL.suggestions.getObjectIndex({songID: videoID}) !== -1))
            return;

        // Fetch suggestion icon
        const suggestionIcon = videoHTML.get(".title-wrapper .suggestion img");

        // If the video has already been suggested by the user
        if(videoID == my_suggestion.songID)
        {
            // Toggle the suggestion icon
            suggestionIcon.src = "media/interface/img_suggest_off.png";

            // Update MODEL state
            MODEL.removeSong(videoID);
            MODEL.removeSuggestion(MODEL.my_user, videoID);

            // Send a SUGGESTION message with the selected videoID to others users
            CONTROLLER.sendSuggestion(videoID);
        }
        else
        {
            // Get old video data
            const oldVideoID = MODEL.my_suggestion.songID;
            const oldVideoHTML = oldVideoID == undefined ? undefined : this.search_result.get(`[data-id='${oldVideoID}']`);
            const oldSuggestionIcon =  oldVideoHTML == undefined ? oldVideoHTML : oldVideoHTML.get(".title-wrapper .suggestion img");

            // Toggle the suggestion icon
            suggestionIcon.src = "media/interface/img_suggest_on.png";

            // Change the previous suggestion icon
            if(oldSuggestionIcon != undefined)
                oldSuggestionIcon.src = "media/interface/img_suggest_off.png";

            // Create new song and suggestion objects
            const song = MODEL.current_search.getObject({ID: videoID})
            const suggestion = new MODEL.Suggestion(videoID, MODEL.my_user.id, 0);
            
            // Update MODEL state
            oldVideoID == undefined ? MODEL.addSong(song) : MODEL.updateSong(oldVideoID, song);
            oldVideoID == undefined ? MODEL.addSuggestion(MODEL.my_user, suggestion) : MODEL.updateSuggestion(MODEL.my_suggestion, videoID);

            // Send a SUGGESTION message with the selected videoID to others users
            CONTROLLER.sendSuggestion(videoID);
        }     
    },

    votesSearch: function()
    {
        // TODO
    },

    voteSuggestion: function(event)
    {
        // Get node element of the event
        const node = event.srcElement;

        // Get parents
        const parents = node.getParents();

        // Get videoHTML and videoID
        let videoHTML, videoID;
        for(const parent of parents)
        {
            if(parent.classList && parent.classList.contains("video")) 
            {
                videoHTML = parent;
                videoID = videoHTML.getAttribute('data-id');
            }
        }

        // Checkings
        if(!videoHTML || MODEL.my_suggestion.songID === videoID)
            return;

        // Fetch suggestion icon
        const votesIcon = videoHTML.get(".title-wrapper .votes img");

        // If the user has already voted the video
        if(MODEL.my_votes.includes(videoID))
        {
            // Toggle vote icon image
            // TODO

            // Remove vote
            MODEL.my_votes.remove(videoID);
            MODEL.suggestions[videoID].vote_counter--;
        }
        else
        {
            // Toggle vote icon image
            // TODO

            // Add vote
            MODEL.my_votes = [...MODEL.my_votes, videoID];
            MODEL.suggestions[videoID].vote_counter++;
        }

        // Update the DOM
        MODEL.updateVotesInterface();
        
        // Send the message to the other users
        CONTROLLER.sendVote(videoID);  
    },

    updateSuggestionInterface: function()
    {
        // TODO
    },

    updateVotesInterface: function()
    {
        // Remove old suggestions
        this.vote_result.removeChildren();

        // Get sorted array of songs
        const sorted_songs = MODEL.suggested_songs.values().sort(MODEL.songSorter);

        // Append vote counter to containers
        sorted_songs.forEach(song => song.voteCount = MODEL.suggestions[song.ID].vote_counter);

        // Parse videos to HTML containers
        const videosHTML = parseVideosToHTML(sorted_songs);

        // Append video containers to the search results
        this.vote_result.appendChildren(videosHTML);

        // Show video containers
        videosHTML.forEach(video => video.show());        
    }
}