/***************** MODEL *****************/

const MODEL = 
{
    // User data
    my_user: null,
    my_suggestion: null,
    my_votes: [],

    temp: null,
    
    // Room data
    current_room: null,
    users_obj: {},
    users_arr: [],
    suggestions: {},
    suggestion_counter: 0,

    // Assets data
    raw_user_assets: {}, // User assets templates
    user_assets : {}, // User skins
    object_assets: {}, // Furniture and scene assets of all the rooms (they must identify the room they belong to)

    // Interface data
    // current_search: [],
    songs: [], // suggested_videos

    // Audio playback
    current_song: null,
    next_song: null, 
    playback_time: null, // Playback time of the current song
    skipping_time: null, // Song time when the skip action should be performed
    player: new Audio(),

    // Scene data
    context: null,
    scene: null,
    room_scene: null,
    renderer: null,
    camera: null,
    walkarea: null,
    camarea: null,

    // User Methods
    getUser: function(id)
    {
        return this.users_obj[id];
    },

    addUser: function(user)
    {
        this.users_obj[user.id] = user;user
        this.users_arr.append(user);
    },

    addUsers: function(users)
    {
        users.forEach(user => this.users_obj[user.id] = user);
        users.forEach(user => { if (this.users_obj[user.id].animation !== null) this.users_obj[user.id].animation = 'idle.skanim';});
          
        this.users_arr = this.users_arr.concat(users);
    },

    removeUser: function(id)
    {
        // Get user index in array
        const index = this.users_arr.getObjectIndex({id: id});

        // Check
        if(index == -1)
        { 
            console.error(`onUserLeft callback --> User id ${id} is not in the users array`);
            return;  
        }
        
        // Get user data
        const user = this.users_obj[id];
        const suggestion = user.suggestion;

        // Remove user suggestion
        if(suggestion.songID)
            this.suggestions.remove(suggestion.songID);

        // Remove user votes
        user.votes.forEach(vote => {
            this.suggestions[vote].vote_counter--;
        });

        // Remove user 
        this.users_obj.remove(id);
        this.users_arr.splice(index, 1);
    },

    createSuggestion: function(songID,userID,vote_counter)
    {
        const suggestion = 
        {
            "songID": songID,
            "userID": userID,
            "vote_counter": vote_counter
        }

        MODEL.suggestions[songID] = suggestion;

        return suggestion;
    },

    // Suggestion Methods
    getSuggestion: function(suggestionID)
    {
        return this.suggestions[suggestionID];
    },

    addSuggestion: function(user, suggestion)
    {
        // Add
        user.suggestion = suggestion;
        this.suggestions[suggestion.songID] = suggestion;

        // Add it to the DOM
        this.updateSuggestionInterface();
    },
    
    removeSuggestion: function(user, suggestion)
    {
        // Check
        if(suggestion == undefined) return;

        // Remove votes
        this.removeSuggestionVotes(suggestion);

        // Remove
        this.suggestions.remove(suggestion.songID);
        user.suggestion = {};
    },

    updateSuggestion: function(suggestion, new_songID)
    {
        // Check
        if(suggestion == undefined) return;

        // Remove votes
        this.removeSuggestionVotes(suggestion);

        // Update
        suggestion.songID = new_songID;
    },

    removeSuggestionVotes(suggestion)
    {
        // Check
        if(suggestion == undefined) return;

        // Reset counter
        suggestion.vote_counter = 0;

        // Remove votes
        this.users_arr.forEach(user => {
            user.votes.remove(suggestion.songID);
        })
    },

    updateSuggestionInterface: function()
    {
        // Remove all suggestions
        SELECTA.vote_result.removeChildren();

        // First add my suggestion
        if(this.my_suggestion !== null)
            SELECTA.loadSongToDom(this.my_suggestion);

        // Then all the other suggestions
        for (sug in MODEL.suggestions) 
        {
            if (typeof MODEL.suggestions[sug] !== 'function') {
              // Cargar la song a la dom
            }
        }
    },

    createSong: function(id,src_image,duration,title,viewCount,likeCount,commentCount,publicationDate,channel_src,channel_title,channel_subscriberCount,channel_viewCount,channel_videos,channel_publicationDate,description,language)
    {
        const song = 
        {
            "id":id,
            "thumbnails":src_image,
            "duration":duration,
            "language":language,
            "title":title,
            "viewCount":viewCount,
            "likeCount":likeCount,
            "commentCount":commentCount,
            "elapsedTime":publicationDate,
            "channel_thumbnails":channel_src,
            "channel_title":channel_title,
            "channel_subscriberCount":channel_subscriberCount,
            "channel_viewCount":channel_viewCount,
            "channel_videoCount":channel_videos,
            "channel_elapsedTime":channel_publicationDate,
            "description":description,
        };
        
        MODEL.songs[id] = song;
    },

    // Song methods
    getSong: function(songID)
    {
        return this.songs[songID];
    },

    addSong: function(song)
    {
        this.songs[song.id] = song;
    },

    removeSong: function(songID)
    {
        if (this.songs.hasOwnProperty(songID))
            delete this.songs[songID];
    },

    updateSong: function(old_songID, song)
    {
        this.removeSong(old_songID);
        this.addSong(song);
    }
}

/***************** MESSAGE *****************/

function Message(sender, type, content, time)
{
    this.sender = sender || ""; //ID
    this.type = type || "ERROR";
    this.content = content || "";
    this.time = time || Date.getTime();
}
