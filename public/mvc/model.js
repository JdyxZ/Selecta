/***************** MODEL *****************/

const MODEL = 
{
    // User data
    my_user: null,
    my_suggestion: null,
    my_votes: null,

    temp: null,
    
    // Room data
    current_room: null,
    users_obj: {},
    users_arr: [],
    suggestions: {},
    songs: {},

    // Assets data
    user_assets : {}, // User skins
    object_assets: {}, // Furniture and scene assets of all the rooms (they must identify the room they belong to)

    // Audio playback
    current_song: null,
    next_song: null, 
    playback_time: null, // Playback time of the current song
    skipping_time: null, // Song time when the skip action should be performed
    player: new Audio(),

    // Scene data
    context: null,
    scene: null,
    renderer: null,
    camera: null,

    // User Methods
    getUser: function(id)
    {
        return this.users_obj[id];
    },

    addUser: function(user)
    {
        this.users_obj[user.id] = user;
        this.users_arr.append(user);
    },

    addUsers: function(users)
    {
        users.forEach(user => this.users_obj[user.id] = user);
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

    // Song methods
    getSong: function(songID)
    {
        return this.songs[songID];
    },

    addSong: function(song)
    {
        this.songs[song.ID] = song;
    },

    removeSong: function(songID)
    {
        this.songs.remove(songID);
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
    this.time = time || getTime();
}
