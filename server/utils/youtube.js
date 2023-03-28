/***************** YOUTUBE DATA API *****************/

const {google} = require('googleapis');
const API_CREDENTIALS = require('../config/API_credentials.js');
const {WORLD} = require('../model/model.js');

const YOUTUBE = 
{
    Youtube: null,

    init: async function()
    {
        Youtube = await google.youtube({
            version: "v3",
            auth: API_CREDENTIALS.google.private
        });
    },

    search: async function(query)
    {
        try
        {
            // Execute
            const response = await Youtube.search.list({
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
            return response.data.items;
        } 
        catch(err)
        {
            console.log(`\nYoutube-API-Error "${err}" upon searching for ${query}`);
            return null;
        }
    },

    getVideoInfo: async function(videoID)
    {
        try
        {
            // Execute
            const response = await Youtube.videos.list({
                part: ["id", "snippet", "contentDetails", "status", "statistics", "player"],
                id: videoID
            });

            // Set aux var
            const video = response.data.items[0];

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
            console.log(`\nYoutube-API-Error "${err}" upon fetching data of video ${videoID}`);
            return null;
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
        try
        {
            // Execute
            const response = await Youtube.channels.list({
                part: ["id", "snippet", "statistics"],
                id: channelID
            });

            // Set aux var
            const channel = response.data.items[0];

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
            console.log(`\nYoutube-API-Error "${err}" upon fetching data of channel ${channelID}`);
            return null;
        }
    },

    getPlaylistInfo: async function(playlistID)
    {
        try
        {
            // Execute
            const response = await Youtube.playlists.list({
                part: ["contentDetails", "id", "player", "snippet", "status"],
                id: playlistID
            });

            // Set aux var
            const playlist = response.data.items[0];

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
            console.log(`\nYoutube-API-Error "${err}" upon fetching data of playlist ${playlistID}`);
            return null;
        }
    },

    getPlaylistItems: async function(playlistID)
    {
        try
        {
            // Execute
            const response = await Youtube.playlistItems.list({
                part: ["snippet", "contentDetails", "id", "status"],
                playlistId: playlistID
            });

            // Set aux var
            const playlist = response.data.items;

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
            console.log(`\nYoutube-API-Error "${err}" upon fetching item data of playlist ${playlistID}`);
            return null;
        }
    }
    
};

module.exports = YOUTUBE;