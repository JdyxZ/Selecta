/***************** YOUTUBE DATA API *****************/

// External modules
const {google} = require('googleapis');
const ytdl = require('ytdl-core');
const needle = require('needle');

// Our modules
const API_CREDENTIALS = require('../config/API_credentials.js');
const {WORLD} = require('../model/model.js');
const {isString, isArray} = require('../../public/framework/javascript.js');


const YOUTUBE = 
{
    // Client
    privateClient: null,
    publicClient: null,

    // Keys
    private_key: API_CREDENTIALS.google.private,
    public_keys: API_CREDENTIALS.google.public,
    current_public_key: 0,

    // Quota
    quotaExceeded: false,

    // Debug
    debug: null,

    // Init
    init: async function()
    {
        this.privateClient = await this.getClient(this.private_key);
        this.publicClient = await this.getClient(this.public_keys[this.current_public_key]);
    },

    // Get client
    getClient: function(key)
    {
        try
        {
            return google.youtube({
                version: "v3",
                auth: key
            });
        }
        catch(error)
        {
            console.error(error);
            return null;
        }
    },

    // Set new public key
    setNewPublicKey: async function()
    {
        if (this.current_public_key + 1 >= this.public_keys.length)
        {
            this.quotaExceeded = true;
            console.log(`ERROR --> Youtube Utils Error: Clients have run out of public keys`);
            const error_message = "Youtube DATA API max quota has been reached. You can no longer use the built-in methods of the API";
            return ["ERROR", error_message];
        }
        else
        {
            console.log(`EVENT --> Youtube API status: The key ${this.current_public_key} has reached the quota limit, swapping to the key ${this.current_public_key + 1}`);
            this.current_public_key++;
            this.publicClient = await this.getClient(this.public_keys[this.current_public_key]);
            return ["OK", null];
        }
        
    },

    // Error manager
    errorHandler: function(error, action, params)
    {
        if(params.type === "public" && error.errors && error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
        {
            // Try to set new public key
            const check = this.setNewPublicKey();

            // Check
            if(check[0] === "ERROR") return check;

            // Otherwise return the result of the action
            const method = this.actionMap[action].bind(this);

            // Call the method
            return method(...params.values());
        }
        else if(params.type === "private" && error.errors && error.errors.getObjectIndex({reason: "quotaExceeded"}) != -1)
        {
            const error_message = "ERROR --> Youtube Utils Error: Private api key has reached max quota limit. Youtube methods won't be no longer available during the next 24 hours.";
            return ["ERROR", error_message];
        }
        else if(error.errors)
        {
            // Build error message
            const error_description = `\n\nAction: ${action} \nParams: ${JSON.stringify(params)} \nErrors: \n${JSON.stringify(error.errors, null, 4)}`;
            const error_message = `\nERROR --> Youtube Utils Error: ${error_description.indent(4)}\n\n`;

            // Output error
            return ["ERROR", error_message];
        }
        else
        {
            // Build error message
            const error_message = `ERROR --> Youtube Utils Error: \nAction: ${action} \nParams: ${JSON.stringify(params)} \nErrors: ${error}`;

            // Output error
            return ["ERROR", error_message];
        }
    },

    // API methods
    search: async function(query, type)
    {
        try
        {
            // Get proper client
            const Youtube = type === "public" ? this.publicClient : type === "private" ? this.privateClient : null;

            // Checks
            if(!Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(query) || !query || !query.trim()) throw "YOUTUBE_INVALID_INPUT";

            // Execute
            const response = await Youtube.search.list({
                part: ["snippet", "id"],
                q: query,
                type: "video",
                order: "relevance",
                maxResults: 50,
                relevanceLanguage: "ES",
            });

            // Set aux var
            const search = response.data.items;

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
            return ["OK", data];
        } 
        catch(error)
        {         
            return this.errorHandler(error, "search", {query, type});
        }
    },

    getVideosInfo: async function(videoIDs, type)
    {
        try
        {
            // Get proper client
            const Youtube = type === "public" ? this.publicClient : type === "private" ? this.privateClient : null;

            // Checks
            if(!Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(videoIDs) && !isArray(videoIDs) || !videoIDs) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await Youtube.videos.list({
                part: ["id", "snippet", "contentDetails", "status", "statistics", "player"],
                id: videoIDs
            });

            // Set aux var
            const videos = response.data.items;

            // Check
            if(videos.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = videos.map(video => {          
                return {   
                    ID: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description.removeLineBreaks(),
                    thumbnails: video.snippet.thumbnails,
                    publisherChannel: {ID: video.snippet.channelId, name: video.snippet.channelTitle}, 
                    publicationDate: video.snippet.publishedAt,
                    elapsedTime: Date.elapsedTime(video.snippet.publishedAt),
                    categoryID: video.snippet.categoryId,
                    live: video.snippet.liveBroadcastContent == "live" ? true : false,
                    language: video.snippet.defaultAudioLanguage,
                    duration: Date.parsePT(video.contentDetails.duration),
                    embeddable: video.status.embeddable,
                    viewCount: video.statistics.viewCount,
                    likeCount: video.statistics.likeCount,
                    commentCount: video.statistics.commentCount
                };
            });
    
            // Output
            return ["OK", data];
        } 
        catch(error)
        {
            return this.errorHandler(error, "get_videos_info", {videoIDs, type});
        }
    },

    getChannelsInfo: async function(channelIDs, type)
    {
        try
        {
            // Get proper client
            const Youtube = type === "public" ? this.publicClient : type === "private" ? this.privateClient : null;

            // Checks
            if(!Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(channelIDs) && !isArray(channelIDs) || !channelIDs) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await Youtube.channels.list({
                part: ["id", "snippet", "statistics"],
                id: channelIDs
            });

            // Set aux var
            const channels = response.data.items;

            // Check
            if(channels.length == 0) throw "YOUTUBE_EMPTY_RESPONSE";

            // Build json response object
            const data = channels.map(channel => {
                return {
                    ID: channel.id,
                    title: channel.snippet.title,
                    description: channel.snippet.description.removeLineBreaks(),
                    country: channel.snippet.country,
                    publicationTime: channel.snippet.publishedAt,
                    elapsedTime: Date.elapsedTime(channel.snippet.publishedAt),
                    thumbnails: channel.snippet.thumbnails,
                    viewCount: channel.statistics.viewCount,
                    subscriberCount: channel.statistics.subscriberCount,
                    videoCount: channel.statistics.videoCount,   
                };
            });
    
            // Output
            return ["OK", data];
        } 
        catch(error)
        {
            return this.errorHandler(error, "get_channels_info", {channelIDs, type});
        }
    },

    getPlaylistsInfo: async function(playlistIDs, type)
    {
        try
        {
            // Get proper client
            const Youtube = type === "public" ? this.publicClient : type === "private" ? this.privateClient : null;

            // Checks
            if(!Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(playlistIDs) && !isArray(playlistIDs) || !playlistIDs) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await Youtube.playlists.list({
                part: ["contentDetails", "id", "player", "snippet", "status"],
                id: playlistIDs
            });

            // Set aux var
            const playlists = response.data.items;

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
            return ["OK", data];
        } 
        catch(error)
        {
            return this.errorHandler(error, "get_playlists_info", {playlistIDs, type});
        }
    },

    getPlaylistItems: async function(playlistID, type)
    {
        try
        {
            // Get proper client
            const Youtube = type === "public" ? this.publicClient : type === "private" ? this.privateClient : null;

            // Checks
            if(!Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(playlistID) || !playlistID) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await Youtube.playlistItems.list({
                part: ["snippet", "contentDetails", "id", "status"],
                playlistId: playlistID,
                maxResults: 50
            });

            // Set aux var
            const playlistItems = response.data.items;

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
            return ["OK", data];
        } 
        catch(error)
        {
            return this.errorHandler(error, "get_playlist_items", {playlistID, type});
        }
    },

    getVideosFullInfo: async function(videoIDs, type)
    {
        // Fetch video data with Youtube API
        const [videosStatus, videosData] = await this.getVideosInfo(videoIDs, type);

        // Check
        if(videosStatus === "ERROR") return [videosStatus, videosData];

        // Get IDs of the channels of the videos
        const channelsIDs = videosData.map(video => video.publisherChannel.ID);
        
        // Fetch channel data of the videos with Youtube API
        const [channelsStatus, channelsData] = await this.getChannelsInfo(channelsIDs, type);

        // Check
        if(channelsStatus === "ERROR") return [channelsStatus, channelsData];

        // Assign channel data to each video
        videosData.forEach(video => video.publisherChannel = channelsData.getObject({ID: video.publisherChannel.ID}));

        // Return info
        return ["OK", videosData];
    },

    searchFull: async function(query, type)
    {
        // Search videos with the API
        const [searchStatus, searchData] = await this.search(query, type);

        // Check
        if(searchStatus === "ERROR") return [searchStatus, searchData];

        // Get IDs of the videos
        const videoIDs = searchData.map(video => video.ID);

        // Get full video data of the results of the search
        const [videosStatus, videosData] = await this.getVideosFullInfo(videoIDs, type);

        // Check
        if(videosStatus === "ERROR") return [videosStatus, videosData];

        // Filter search result
        const filteredVideos = videosData.filter(this.videoFilter);

        // Return info
        return ["OK", filteredVideos];
    },

    fetchAudioStreams: async function(videoID)
    {
        try
        {            
            // Check videoID
            const check = await ytdl.validateID(videoID);
            if(!check) throw `YOUTUBE_UNABLE_TO_PARSE_${videoID}`;

            // Fetch audio info
            const info = await ytdl.getInfo(videoID);
            const audio_info = await ytdl.chooseFormat(info.formats, {quality: 'highestaudio', filter: 'audioonly'});

            // Check result
            if(audio_info.isEmpty()) throw "YOUTUBE_VIDEO_WITHOUT_AUDIO";

            return ["OK", audio_info];
        }
        catch(error)
        {
            return ["ERROR", err];
        }
    },

    // Auxiliar methods
    videoFilter: function(video)
    {
        // Checks
        if(video.live) return false; 
        if(!video.duration.totalMiliseconds.isRanged([60 * 1000, 36000 * 1000])) return false;
        return true;
    },

    checkVideo: async function(videoID)
    {
        // Check videoID
        if(videoID == undefined) return "YOUTUBE_CHECK_INVALID_VIDEO";

        // Validate ID
        const validID = await ytdl.validateID(videoID)
        if(!validID) return  "YOUTUBE_CHECK_INVALID_VIDEO_ID";

        // Get video duration and live properties
        const videoInfo = await ytdl.getInfo(videoID);
        const duration = videoInfo.videoDetails.lengthSeconds;
        const live = videoInfo.videoDetails.isLiveContent;

        // Validate duration and live
        if(live) return "YOUTUBE_CHECK_LIVE_VIDEO";   
        if(duration.isRanged([60, 36000])) return "YOUTUBE_INVALID_VIDEO_DURATION";

        // Return OK
        return "OK";
    }
    
};

// Define Action <-> Method map inside YOUTUBE object
YOUTUBE.actionMap =
{
    "search": YOUTUBE.search,
    "get_videos_info": YOUTUBE.getVideosInfo,
    "get_channels_info": YOUTUBE.getChannelsInfo,
    "get_playlists_info": YOUTUBE.getPlaylistsInfo,
    "get_playlist_items": YOUTUBE.getPlaylistItems,
    "get_videos_full_info": YOUTUBE.getVideosFullInfo,
    "search_full": YOUTUBE.searchFull,
    "get_audio_stream": YOUTUBE.getAudioStream
};

module.exports = YOUTUBE;