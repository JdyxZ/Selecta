/***************** YOUTUBE DATA API *****************/

const YOUTUBE =
{
    // Client
    Youtube: null,

    // Keys
    keys: null,
    current_key: 0,

    // Quota
    quotaExceeded: false,

    // Client methods
    init: async function(keys)
    {
        // Set keys
        this.key = keys;

        // Get new client
        this.Youtube = await this.getClient(); 
    },

    initClient: function()
    {
        return new Promise((resolve,_) => {
            gapi.load('client', resolve);
        });
    },

    getClient: async function()
    {
        try
        {
            const key = this.keys[this.current_key];
            await this.initClient();
            await gapi.client.init({apiKey: key});
            await gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest");
            return gapi.client.youtube;
        }
        catch(err)
        {
            console.error(err);
            return null;
        }
    },

    setNewAPIKey: function()
    {
        if (this.current_key + 1 >= this.keys.length)
        {
            this.quotaExceeded = true;
            console.error("Youtube-API-Error ---> Youtube DATA API max quota has been reached. You can no longer use the built-in methods of the API");
        }
        else
        {
            this.current_key++;
            gapi.client.setApiKey(this.keys[this.current_key]);
        }
        
    },

    // API methods
    search: async function(query)
    {
        // Check client and quota
        if(!this.Youtube || this.quotaExceeded) return null;

        try
        {
            // Execute
            const response = await this.Youtube.search.list({
                part: ["snippet", "id"],
                q: query,
                type: "video",
                order: "relevance",
                maxResults: 25,
                relevanceLanguage: "ES",
                // videoDuration: "short",
                // videoCategoryId: 10, // stands for music videos
                // videoEmbeddable: true
            });
    
            // Output
            return response.result.items;
        } 
        catch(err)
        {
            if(err.errors && err.errors[0].reason === "quotaExceeded")
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else
            {
                console.error(`\nYoutube-API-Error --> "${err}" upon searching for ${query}`);
                return null;
            }
        }
    },

    getVideoInfo: async function(videoID)
    {
        // Check client and quota
        if(!this.Youtube || this.quotaExceeded) return null;

        try
        {
            // Execute
            const response = await this.Youtube.videos.list({
                part: ["id", "snippet", "contentDetails", "status", "statistics", "player"],
                id: videoID
            });

            // Set aux var
            const video = response.result.items[0];

            // Check
            if(!video) return undefined;

            // Build json response object
            const data =
            {
                ID: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnails: video.snippet.thumbnails,
                publisherChannel: {ID: video.snippet.channelId, name: video.snippet.channelTitle}, 
                publicationTime: video.snippet.publishedAt,
                elapsedTime: Date.elapsedTime(video.snippet.publishedAt),
                categoryID: video.snippet.categoryId,
                live: video.snippet.liveBroadcastContent == "live" ? true : false,
                duration: Date.parsePT(video.contentDetails.duration),
                embeddable: video.status.embeddable,
                viewCount: video.statistics.viewCount,
                likeCount: video.statistics.likeCount,
                commentCount: video.statistics.songCount
            }
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.errors && err.errors[0].reason === "quotaExceeded")
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else
            {
                console.error(`\nYoutube-API-Error ---> "${err}" upon fetching info of the video ${videoID}`);
                return null;
            }
        }
    },

    checkVideoInfo: function(video)
    {
        if(video === undefined) return "YOUTUBE_CHECK_INVALID_VIDEOID";
        if(video === null) return "YOUTUBE_CHECK_SOMETHING_WRONG_HAPPENED";
        if(video.live) return "YOUTUBE_CHECK_LIVE_VIDEO";
        // if(video.duration > WORLD.song_duration_range > 240000) return "YOUTUBE_CHECK_INVALID_DURATION";
        // if(video.categoryID != 10) return "YOUTUBE_CHECK_INVALID_CATEGORY";
        // if(!video.embeddable) return "YOUTUBE_CHECK_NOT_EMBEDABBLE";        
        else return "OK";
    },

    getChannelInfo: async function(channelID)
    {
        // Check client and quota
        if(!this.Youtube || this.quotaExceeded) return null;

        try
        {
            // Execute
            const response = await this.Youtube.channels.list({
                part: ["id", "snippet", "statistics"],
                id: channelID
            });

            // Set aux var
            const channel = response.result.items[0];

            // Check
            if(!channel) return undefined;

            // Build json response object
            const data =
            {
                ID: channel.id,
                title: channel.snippet.title,
                description: channel.snippet.description,
                country: channel.snippet.country,
                publicationTime: channel.snippet.publishedAt,
                thumbnails: channel.snippet.thumbnails,
                viewCount: channel.statistics.viewCount,
                subscriberCount: channel.statistics.subscriberCount,
                videoCount: channel.statistics.videoCount,   
            }
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.errors && err.errors[0].reason === "quotaExceeded")
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else
            {
                console.error(`\nYoutube-API-Error --> "${err}" upon fetching info of the channel ${channelID}`);
                return null;
            }
        }
    },

    getPlaylistInfo: async function(playlistID)
    {
        // Check client and quota
        if(!this.Youtube || this.quotaExceeded) return null;

        try
        {
            // Execute
            const response = await this.Youtube.playlists.list({
                part: ["contentDetails", "id", "player", "snippet", "status"],
                id: playlistID
            });

            // Set aux var
            const playlist = response.result.items[0];

            // Check
            if(!playlist) return undefined;

            // Build json response object
            const data =
            {
                ID: playlist.id,
                title: playlist.snippet.title,
                description: playlist.snippet.description,
                publicationTime: playlist.snippet.publishedAt,
                thumbnails: playlist.snippet.thumbnails,
                privacy: playlist.status.privacyStatus,
                numItems: playlist.contentDetails.itemCount
            }
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.errors && err.errors[0].reason === "quotaExceeded")
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else
            {
                console.error(`\nYoutube-API-Error --> "${err}" upon fetching info of the playlist ${playlistID}`);
                return null;
            }
        }
    },

    getPlaylistItems: async function(playlistID)
    {
        // Check client and quota
        if(!this.Youtube || this.quotaExceeded) return null;

        try
        {
            // Execute
            const response = await this.Youtube.playlistItems.list({
                part: ["snippet", "contentDetails", "id", "status"],
                playlistId: playlistID
            });

            // Set aux var
            const playlist = response.result.items;

            // Check
            if(playlist.length == 0) return undefined;

            // Build json response object
            const data = playlist.map(video => {          
                return {                  
                    ID: video.contentDetails.videoId,
                    position: video.snippet.position,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnails: video.snippet.thumbnails,
                    publisherChannel: {ID: video.snippet.videoOwnerChannelId, name: video.snippet.videoOwnerchannelTitle}, 
                    publicationTime: video.contentDetails.videoPublishedAt,
                    elapsedTime: Date.elapsedTime(video.contentDetails.videoPublishedAt),
                };
            });
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.errors && err.errors[0].reason === "quotaExceeded")
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else
            {
                console.error(`\nYoutube-API-Error ---> "${err}" upon fetching items of the playlist ${playlistID}`);
                return null;
            }
        }
    }
}