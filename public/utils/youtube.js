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

    // Debug
    debug: null,

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
            console.error("Youtube Utils Error ---> Youtube DATA API max quota has been reached. You can no longer use the built-in methods of the API");
        }
        else
        {
            console.log(`Youtube-API-Status --> The key ${this.current_key} has reached the quota limit, swapping to the key ${this.current_key + 1}`);
            this.current_key++;
            gapi.client.setApiKey(this.keys[this.current_key]);
        }
        
    },

    // API methods
    search: async function(query)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(this.quotaExceeded) throw "YOUTUBE_QUOTA_EXCEEDED";
            if(!isString(query)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.search.list({
                part: ["snippet", "id"],
                q: query,
                type: "video",
                order: "relevance",
                maxResults: 25,
                relevanceLanguage: "ES",
            });

            // Set aux var
            const search = response.result.items;

            // Check
            if(search.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = search.map(video => {          
                return {                  
                    ID: video.id.videoId,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnails: video.snippet.thumbnails,
                    publisherChannel: {ID: video.snippet.channelId, name: video.snippet.channelTitle}, 
                    publicationTime: video.snippet.publishedAt,
                    elapsedTime: Date.elapsedTime(video.snippet.publishedAt),
                    categoryID: video.snippet.categoryId,
                    live: video.snippet.liveBroadcastContent == "live" ? true : false,
                };
            });

            // Output
            return data;
        } 
        catch(err)
        {
            if(err.result && err.result.error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
            {
                this.setNewAPIKey();
                return this.search(query);
            }
            else if(err.result)
            {
                console.error(`Youtube Utils Error --> Error upon searching for ${query}`, err.result.error.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error --> "${err}" upon searching for ${query}`);
                return null;
            }
        }
    },

    getVideosInfo: async function(videoIDs)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(this.quotaExceeded) throw "YOUTUBE_QUOTA_EXCEEDED";
            if(!isString(videoIDs) && !isArray(videoIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.videos.list({
                part: ["id", "snippet", "contentDetails", "status", "statistics", "player"],
                id: videoIDs
            });

            // Set aux var
            const videos = response.result.items;

            // Check
            if(videos.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = videos.map(video => {          
                return {   
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
                };
            });
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.result && err.result.error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
            {
                this.setNewAPIKey();
                return this.getVideosInfo(videoIDs);
            }
            else if(err.result)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the videos ${videoIDs}`, err.result.error.errors);
                return [null];
            }
            else
            {
                console.error(`Youtube Utils Error ---> "${err}" upon fetching info of the videos ${videoIDs}`);
                return [null];
            }
        }
    },

    checkVideoInfo: function(video)
    {
        if(video === undefined) return "YOUTUBE_CHECK_INVALID_VIDEOID";
        if(video === null) return "YOUTUBE_CHECK_SOMETHING_WRONG_HAPPENED";
        if(video.live) return "YOUTUBE_CHECK_LIVE_VIDEO";   
        else return "OK";
    },

    getChannelsInfo: async function(channelIDs)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(this.quotaExceeded) throw "YOUTUBE_QUOTA_EXCEEDED";
            if(!isString(channelIDs) && !isArray(channelIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.channels.list({
                part: ["id", "snippet", "statistics"],
                id: channelIDs
            });

            // Set aux var
            const channels = response.result.items;

            // Check
            if(channels.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = channels.map(channel => {
                return {
                    ID: channel.id,
                    title: channel.snippet.title,
                    description: channel.snippet.description,
                    country: channel.snippet.country,
                    publicationTime: channel.snippet.publishedAt,
                    thumbnails: channel.snippet.thumbnails,
                    viewCount: channel.statistics.viewCount,
                    subscriberCount: channel.statistics.subscriberCount,
                    videoCount: channel.statistics.videoCount,   
                };
            });
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.result && err.result.error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
            {
                this.setNewAPIKey();
                return this.getChannelsInfo(channelIDs);
            }
            else if(err.result)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the channels ${channelIDs}`, err.result.error.errors);
                return [null];
            }
            else
            {
                console.error(`Youtube Utils Error --> "${err}" upon fetching info of the channels ${channelIDs}`);
                return [null];
            }
        }
    },

    getPlaylistsInfo: async function(playlistIDs)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(this.quotaExceeded) throw "YOUTUBE_QUOTA_EXCEEDED";
            if(!isString(playlistIDs) && !isArray(playlistIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.playlists.list({
                part: ["contentDetails", "id", "player", "snippet", "status"],
                id: playlistIDs
            });

            // Set aux var
            const playlists = response.result.items;

            // Check
            if(playlists.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = playlists.map(playlist => {
                return {
                    ID: playlist.id,
                    title: playlist.snippet.title,
                    description: playlist.snippet.description,
                    publicationTime: playlist.snippet.publishedAt,
                    thumbnails: playlist.snippet.thumbnails,
                    privacy: playlist.status.privacyStatus,
                    numItems: playlist.contentDetails.itemCount
                }
            });
    
            // Output
            return data;
        } 
        catch(err)
        {
            if(err.result && err.result.error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
            {
                this.setNewAPIKey();
                return this.getPlaylistsInfo(playlistIDs);
            }
            else if(err.result)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the playlists ${playlistIDs}`, err.result.error.errors);
                return [null];
            }
            else
            {
                console.error(`Youtube Utils Error --> "${err}" upon fetching info of the playlists ${playlistIDs}`);
                return [null];
            }
        }
    },

    getPlaylistItems: async function(playlistID)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(this.quotaExceeded) throw "YOUTUBE_QUOTA_EXCEEDED";
            if(!isString(playlistID)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.playlistItems.list({
                part: ["snippet", "contentDetails", "id", "status"],
                playlistId: playlistID
            });

            // Set aux var
            const playlistItems = response.result.items;

            // Check
            if(playlistItems.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = playlistItems.map(video => {          
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
            if(err.result && err.result.error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
            {
                this.setNewAPIKey();
                return this.getPlaylistItems(playlistID);
            }
            else if(err.result)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the playlist ${playlistID}`, err.result.error.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error ---> "${err}" upon fetching items of the playlist ${playlistID}`);
                return null;
            }
        }
    },

    fetchAudioStream: async function(videoID)
    {
        const response = await fetch(`youtubeGetAudioStreams?videoID=${videoID}`);
        const result = await response.json();
        return result;
    }
}