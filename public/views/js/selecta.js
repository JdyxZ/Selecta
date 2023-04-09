
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
    vote_interface_wrapper: document.get("#Selecta #votes_interface_wrapper"),

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
    player_wrapper: document.get("#Selecta #player_wrapper"),

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
    search_error_prompt: document.get("#Selecta #search_interface #error_prompt"),

    // Votes interface
    vote_dragger: document.get("#votes_interface #drag_menu"),
    vote_closer: document.get("#votes_interface #closer"),
    vote_input: document.get("#Selecta #votes_interface #search_bar input"),
    vote_result: document.get("#Selecta #votes_interface #search_result"),
    vote_error_prompt: document.get("#Selecta #votes_interface #error_prompt"),

    // Player
    current_song: document.get("#player_container #current_song"),
    next_song: document.get("#player_container #next_song"),
    player: document.get("#player_container #player"),
    progress_bar: document.get("#player_container #player .progress-bar"),
    player_thumbnail: document.get("#player_container #player .thumbnail"),
    playback_timer: document.get("#player_container #player #current-time"),
    playback_info: document.get("#player_container #player #playback-info"),
    skip_button: document.get("#player_container #player #skip-button"),

    // Templates
    videoTemplate: document.get("#Selecta .video"),

    // Control varibles
    muted: false,
    searching: false,
    lastQuery: null,
    debug: null,

    // Methods
    init: async function()
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
        await CLIENT.init();
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
        this.vote_result.when("click", this.voteSuggestion.bind(this));

        // Player
        MODEL.player.listener = this.updatePlaybackProgress.bind(this)
        MODEL.player.when("timeupdate", MODEL.player.listener); 
        this.skip_button.when("click", this.skipSong.bind(this));
        
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

    loadingOver: function()
    {
        // Show button to access the app
        this.loading_screen_loop.hide();
        this.loading_screen_button.show();
    },

    start: function()
    {
        // Restore volume
        MODEL.player.muted = false;

        // Set loading status to false
        CONTROLLER.loading = false;

        // Toggle screens
        this.loading_screen.hide();
        this.selecta.show();
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

            // Fill video template with video data
            if(video.thumbnails) videoThumbnail.src = video.thumbnails.high.url;
            if(video.duration) videoDuration.textContent = joinTime(video.duration);
            if(video.title) videoTitle.textContent = video.title.resumeByChars(75);
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

        // Reset error prompt
        this.search_error_prompt.innerHTML = ""

        // Get suggested HTML elements
        const suggested_videos = [];
        if(MODEL.my_song) suggested_videos.push(this.search_result.get(`[data-id=${MODEL.my_song.ID}]`));
        
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
        let videosHTML = this.parseVideosToHTML(videos);

        // Manipulate video containers
        videosHTML.forEach((video, index, array) => {

            // Get videoID
            const videoID = video.getAttribute('data-id');

            // Display the suggest icon
            video.get(".title-wrapper .suggestion").style.display = "flex";

            // Drop user suggestions from the search
            if(MODEL.my_song && MODEL.my_song.ID === videoID)
                array.splice(index, 1);

            // Show container
            video.show();
        });

        // Append video containers to the search results
        this.search_result.appendChildren(videosHTML);

        // Update MODEL with the current search results
        MODEL.current_search = videos;

        // Register query
        this.lastQuery = query;
    },

    votesSearch: function()
    {
        // TODO
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

        // Get suggestion
        const suggestion = MODEL.getSuggestion(videoID);

        // Checks
        if(!videoHTML)
        {
            return;
        }
        else if (suggestion && suggestion.userID != MODEL.my_user.id)
        {
            this.search_error_prompt.innerHTML = "Song already suggested!";
            return;
        }
        else
        {
            this.search_error_prompt.innerHTML = "";
        }

        // Fetch suggestion icon
        const suggestionIcon = videoHTML.get(".title-wrapper .suggestion img");

        // If the video has already been suggested by the user
        if(MODEL.my_song && videoID == MODEL.my_song.ID)
        {
            // Toggle the suggestion icon
            suggestionIcon.src = "media/interface/img_suggest_off.png";

            // Update MODEL state
            MODEL.removeSuggestion(MODEL.my_user, MODEL.my_song.ID);
            MODEL.removeSong(MODEL.my_user, MODEL.my_song);

            // Send a SUGGESTION message with the selected videoID to others users
            CONTROLLER.sendSuggestion(videoID);
        }
        else
        {
            // Get old video data
            const oldVideoID = MODEL.my_song == undefined ? undefined : MODEL.my_song.ID;
            const oldVideoHTML = oldVideoID == undefined ? undefined : this.search_result.get(`[data-id='${oldVideoID}']`);
            const oldSuggestionIcon =  oldVideoHTML == undefined ? oldVideoHTML : oldVideoHTML.get(".title-wrapper .suggestion img");

            // Toggle the suggestion icon
            suggestionIcon.src = "media/interface/img_suggest_on.png";

            // Change the previous suggestion icon
            if(oldSuggestionIcon != undefined)
                oldSuggestionIcon.src = "media/interface/img_suggest_off.png";

            // Get songs
            const oldSong = oldVideoID == undefined ? undefined : MODEL.getSong(oldVideoID);
            const newSong = MODEL.current_search.getObject({ID: videoID})
            
            // Update MODEL state
            oldVideoID == undefined ? MODEL.addSuggestion(MODEL.my_user, videoID) : MODEL.updateSuggestion(MODEL.my_user, MODEL.my_song.ID, videoID);
            oldVideoID == undefined ? MODEL.addSong(MODEL.my_user, newSong) : MODEL.updateSong(MODEL.my_user, oldSong, newSong);

            // Send a SUGGESTION message with the selected videoID to others users
            CONTROLLER.sendSuggestion(videoID);
        }     
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

        // Checks
        if(!videoHTML)
        {
            return;
        }
        else if (MODEL.my_song && MODEL.my_song.ID === videoID)
        {
            this.vote_error_prompt.innerHTML = "You cannot vote your own suggestion!";
            return;
        }
        else
        {
            this.vote_error_prompt.innerHTML = ""
        }

        // Get suggestion
        const suggestion = MODEL.suggestions[videoID];

        // If the user has already voted the video
        if(MODEL.my_votes.includes(videoID))
        {
            // Remove vote
            MODEL.my_votes.remove(videoID);
            suggestion.vote_counter--;
        }
        else
        {
            // Add vote
            MODEL.my_votes = [...MODEL.my_votes, videoID];
            suggestion.vote_counter++;
        }      

        // Update the DOM
        this.updateVotesInterface();
        
        // Send the message to the other users
        CONTROLLER.sendVote(videoID);  
    },

    skipSong: function()
    {
        // Check
        if(MODEL.current_room.skipping)
            return;

        // Check user skip status
        switch(MODEL.my_user.skip)
        {
            case(true): // User skipped in the past
                MODEL.current_room.skip_counter--;
                break;
            case(false): // User hasn't skipped yet
                MODEL.current_room.skip_counter++;
                break;
        }

        // Update skip property
        MODEL.my_user.skip = !MODEL.my_user.skip;

        // Update skip visuals
        this.updatePlaybackInfo();
        this.updateSkipButton();

        // Send skip message
        CONTROLLER.sendSkip();
    },

    updateSuggestionInterface: function()
    {
        // Remove old search
        this.search_result.removeChildren();

        // Parse videos to HTML containers
        const videosHTML = this.parseVideosToHTML([MODEL.my_song]);

        // Append video containers to the search results
        this.search_result.appendChildren(videosHTML);

        // Manipulate video containers
        videosHTML.forEach(video => {

            // Get videoID
            const videoID = video.getAttribute('data-id');

            // Display the suggest icon
            video.get(".title-wrapper .suggestion").style.display = "flex";

            // Set a different vote icon image for the client votes
            if(MODEL.my_song && MODEL.my_song.ID === videoID)
                video.get(".title-wrapper .suggestion img").src = "media/interface/img_suggest_on.png";

            // Show container
            video.show();
        });
    },

    updateVotesInterface: function()
    {
        // Remove old suggestions
        this.vote_result.removeChildren();

        // Get sorted array of songs
        const sorted_songs = MODEL.songs.sort(MODEL.songSorter);

        // Append vote counter to containers
        sorted_songs.forEach(song => song.voteCount = MODEL.suggestions[song.ID].vote_counter);

        // Parse videos to HTML containers
        const videosHTML = this.parseVideosToHTML(sorted_songs);

        // Append video containers to the search results
        this.vote_result.appendChildren(videosHTML);

        // Manipulate video containers
        videosHTML.forEach(video => {

            // Get videoID
            const videoID = video.getAttribute('data-id');

            // Display the vote icon
            video.get(".title-wrapper .votes").style.display = "flex";

            // Get tags
            const votesIcon = video.get(".title-wrapper .votes img");
            const voteCount = video.get(".title-wrapper .votes #vote_counter");

            // Set icon image for each case
            if(MODEL.my_song && MODEL.my_song.ID === videoID) // Client owns the suggestion
                video.get(".title-wrapper .votes img").src = "media/interface/img_heart_my.png"
            else if(MODEL.my_votes.includes(videoID)) // Client has voted the suggestion
                votesIcon.src = "media/interface/img_heart_on.png";
            else // Client hasn't voted yet
                votesIcon.src = "media/interface/img_heart_off.png"

            // Add the number of votes of the song
            voteCount.textContent = MODEL.suggestions[videoID].vote_counter;

            // Show container
            video.show()
        });    
    },

    updateSkipButton: function()
    {
        if(MODEL.current_room.skipping)
        {
            this.skip_button.className = "faded";
        }
        else if(MODEL.my_user.skip)
        {
            this.skip_button.className = "";
            this.skip_button.src = "media/interface/skip_button_on.png";
        }
        else
        {
            this.skip_button.className = "";
            this.skip_button.src = "media/interface/skip_button_off.png";
        } 
    },

    updatePlaybackInfo: function()
    {
        // Set countdown for skipping
        if(MODEL.current_room.skipping && !MODEL.intervals.skipping)
        {
            // Calculate mean time
            const meanTime = performance.now() - MODEL.next_song.arrivalTime;

            // Set an aux variable with playbackTime
            const playbackTime = -(MODEL.next_song.playbackTime + meanTime) / 1000;

            // Check 
            if(playbackTime <= 1)
                return;

            // Calculate integer and decimal parts of playbackTime
            let integerPart = Math.trunc(playbackTime);
            const decimalPart = playbackTime - integerPart;

            // Update playback info
            this.playback_info.textContent = `Skipping in ${Math.round(playbackTime)}s`;

            // Start the interval after some miliseconds of difference
            setTimeout(() => {

                // Update integer part
                integerPart--;

                // Update playback info
                this.playback_info.textContent = `Skipping in ${Math.round(integerPart)}s`;

                // Set a countdown
                MODEL.intervals.skipping = setInterval(() => {

                    // Update integer part
                    integerPart--;

                    // Check
                    if(integerPart < 0)
                        return;

                    // Update playback info
                    this.playback_info.textContent = `Skipping in ${integerPart}s`;
                        
                }, 1000);

            }, decimalPart * 1000);
        }
        // Show loading status
        else if(!CONTROLLER.audio_playing && !MODEL.intervals.loading)
        {
            // Auxiliar var
            let counter = 0;

            // Set loading interval
            MODEL.intervals.loading = setInterval(()=> {

                // Get info message
                let info;
                if(counter % 4 == 0) info = "loading";
                else if (counter % 4 == 1) info = "loading.";
                else if (counter % 4 == 2) info = "loading..";
                else if (counter % 4 == 3) info = "loading...";

                // Update playback info
                this.playback_info.textContent = info; 

                // Update counter
                counter++;
            }, 1000)
        }
        // Show current number of votes
        else if(CONTROLLER.audio_playing)
        {
            // Calculate percent
            const percent = Math.round(100 * MODEL.current_room.skip_counter / MODEL.current_room.num_active_users);
            
            // Update playback info
            this.playback_info.textContent = `${percent}% of skipping`;  
        }
    },

    updatePlaybackInterface: function(update)
    {
        try 
        {
            if(update == "current" || update == "both")
            {    
                // Get current song elements
                const songThumbnail = this.current_song.get(".thumbnail");
                const songTitle = this.current_song.get(".title");
                const songArtist = this.current_song.get(".artist");

                // Get player elements
                const songPlayerThumbnail = this.player.get(".thumbnail");
                const songCurrentTime = this.player.get("#current-time")
                const songDuration = this.player.get("#duration");

                // Format current playback time
                const currentTime = Date.toTime(MODEL.player.currentTime * 1000);

                // Format song duration
                let duration = "00:00:00";
                if(MODEL.current_song)
                {
                    const hours = MODEL.current_song.duration.hours ? MODEL.current_song.duration.hours : "0";
                    const minutes = MODEL.current_song.duration.minutes ? MODEL.current_song.duration.minutes : "0";
                    const seconds = MODEL.current_song.duration.seconds ? MODEL.current_song.duration.seconds : "0";
                    
                    duration = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
                }
        
                // Fill song elements with current song data
                songThumbnail.src = MODEL.current_song ? MODEL.current_song.thumbnails.medium.url : "media/interface/no_song.png";
                songTitle.textContent = MODEL.current_song ? MODEL.current_song.title.resumeByChars(45) : "Current song";
                songArtist.textContent = MODEL.current_song ? MODEL.current_song.publisherChannel.title.resumeByChars(45) : "Song artist";
                
                // Fill player elements with current song data
                songPlayerThumbnail.src = MODEL.current_song ? MODEL.current_song.thumbnails.medium.url : "media/interface/no_song.png";
                songCurrentTime.textContent = currentTime;
                songDuration.textContent = duration;
            }
            if(update == "next" || update == "both")
            {
                // Get current song elements
                const songThumbnail = this.next_song.get(".thumbnail");
                const songTitle = this.next_song.get(".title");
                const songArtist = this.next_song.get(".artist");
        
                // Fill elements with current song data
                songThumbnail.src = MODEL.next_song ? MODEL.next_song.thumbnails.medium.url : "media/interface/no_song.png";
                songTitle.textContent = MODEL.next_song ? MODEL.next_song.title.resumeByChars(45) : "Next song";
                songArtist.textContent = MODEL.next_song ? MODEL.next_song.publisherChannel.title.resumeByChars(45) : "Song artist";                
            }            
        } 
        catch (error) 
        {
            console.error(error);
        }
    },

    // Audio callbacks
    updatePlaybackProgress: function()
    {
        // Get playback info
        let {currentTime, duration} = MODEL.player;
        currentTime = currentTime ?? 0;

        // Estimate song time
        const loadingTime = performance.now() - MODEL.current_song.arrivalTime;
        const time = (MODEL.current_song.playbackTime + loadingTime) / 1000;  // [s]

        // Synchronize
        if(Math.abs(currentTime - time) > CONTROLLER.syncro_diff / 1000)
        {
            // Mute player
            MODEL.player.muted = true;

            // Adjust the player time
            MODEL.player.currentTime = time;

            // Update audio playing controller
            CONTROLLER.audio_playing = false;

            // Set player thumbnail animation to pause
            this.player_thumbnail.classList.replace("playing", "loading");

            // Update playback info
            this.updatePlaybackInfo();
        }
        else if(!CONTROLLER.loading && !CONTROLLER.audio_playing)
        {
            // Restore volume
            MODEL.player.muted = false;

            // Clear loading interval
            clearInterval(MODEL.intervals.loading);
            MODEL.intervals.loading = null;

            // Update audio playing controller
            CONTROLLER.audio_playing = true;

            // Set player thumbnail animation to play
            this.player_thumbnail.classList.replace("loading", "playing");

            // Update playback info
            this.updatePlaybackInfo();
        }

        // Progress bar
        const progressPercent = currentTime > duration ? 100 : (currentTime / duration) * 100;
        this.progress_bar.style.width = `${progressPercent}%`;

        // Timer
        this.playback_timer.textContent = Date.toTime(currentTime * 1000);
    }
}