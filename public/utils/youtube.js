/***************** YOUTUBE DATA API *****************/

const YOUTUBE =
{
    // API methods
    search: async function(query)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=search&query=${JSON.stringify(query)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    getVideosInfo: async function(videoIDs)
    {
        
        // Fetch resource
        const response = await fetch(`youtube?action=get_videos_info&videoIDs=${JSON.stringify(videoIDs)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    getChannelsInfo: async function(channelIDs)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=get_channels_info&channelIDs=${JSON.stringify(channelIDs)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    getPlaylistsInfo: async function(playlistIDs)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=get_playlists_info&playlistIDs=${JSON.stringify(playlistIDs)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    getPlaylistItems: async function(playlistID)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=get_playlist_items&playlistID=${JSON.stringify(playlistID)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    getFullVideosInfo: async function(videoIDs)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=get_videos_full_info&videoIDs=${JSON.stringify(videoIDs)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    searchFull: async function(query)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=search_full&query=${JSON.stringify(query)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    },

    fetchAudioStream: async function(videoID)
    {
        // Fetch resource
        const response = await fetch(`youtube?action=get_audio_stream&videoID=${JSON.stringify(videoID)}`);
        const [status, content] = await response.json();

        // Check errors
        if(status === "ERROR")
        {
            console.error(content);
            return null;
        };
        
        // Return content
        return content;
    }
}