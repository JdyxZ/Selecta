/***************** YOUTUBE DATA API *****************/

// External modules
const {google} = require('googleapis');
const ytdl = require('ytdl-core');

// Our modules
const API_CREDENTIALS = require('../config/API_credentials.js');
const {WORLD} = require('../model/model.js');
const {isString, isArray} = require('../../public/framework/javascript.js');


const YOUTUBE = 
{
    // Client
    Youtube: null,

    // Init
    init: async function()
    {
        this.Youtube = await google.youtube({
            version: "v3",
            auth: API_CREDENTIALS.google.private
        });
    },

    // API methods
    search: async function(query)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
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
            return data;
        } 
        catch(err)
        {
            if(err.errors)
            {
                console.error(`Youtube Utils Error --> Error upon searching for ${query}`, err.errors);
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
            if(!isString(videoIDs) && !isArray(videoIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.videos.list({
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
            if(err.errors)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the videos ${videoIDs}`, err.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error ---> "${err}" upon fetching info of the videos ${videoIDs}`);
                return null;
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
            if(!isString(channelIDs) && !isArray(channelIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.channels.list({
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
            if(err.errors)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the channels ${channelIDs}`, err.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error --> "${err}" upon fetching info of the channels ${channelIDs}`);
                return null;
            }
        }
    },

    getPlaylistsInfo: async function(playlistIDs)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(playlistIDs) && !isArray(playlistIDs)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.playlists.list({
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
            return data;
        } 
        catch(err)
        {
            if(err.errors)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the playlists ${playlistIDs}`, err.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error --> "${err}" upon fetching info of the playlists ${playlistIDs}`);
                return null;
            }
        }
    },

    getPlaylistItems: async function(playlistID)
    {
        try
        {
            // Checks
            if(!this.Youtube) throw "YOUTUBE_NULL_CLIENT";
            if(!isString(playlistID)) throw "YOUTUBE_INVALID_INPUT"

            // Execute
            const response = await this.Youtube.playlistItems.list({
                part: ["snippet", "contentDetails", "id", "status"],
                playlistId: playlistID
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
            return data;
        } 
        catch(err)
        {
            if(err.errors)
            {
                console.error(`Youtube Utils Error --> Error upon fetching info of the playlist ${playlistID}`, err.errors);
                return null;
            }
            else
            {
                console.error(`Youtube Utils Error ---> "${err}" upon fetching items of the playlist ${playlistID}`);
                return null;
            }
        }
    },

    fetchAudioStreams: async function(videoID)
    {
        try
        {
            // Check videoID
            const check = await ytdl.validateURL(videoID);
            if(!check) throw `YOUTUBE_UNABLE_TO_PARSE_${videoID}`;

            // Fetch audio info
            const info = await ytdl.getInfo(videoID);
            const audio_info = await ytdl.chooseFormat(info.formats, {quality: 'highestaudio', filter: 'audioonly'});

            // Check result
            if(audio_info.isEmpty()) throw "YOUTUBE_VIDEO_WITHOUT_AUDIO";

            return ["OK", audio_info];
        }
        catch(err)
        {
            return ["ERROR", err];
        }
    }
    
};

module.exports = YOUTUBE;