/***************** MODEL *****************/

const MODEL = 
{
    // User data
    my_user: null,
    my_suggestion: null,
    my_votes: [],
    
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
    current_search: [],
    suggested_songs: [],

    // Audio playback
    current_song: null,
    next_song: null, 
    playback_time: null, // Playback time of the current song
    player: new Audio(),

    // Scene data
    context: null,
    scene: null,
    room_scene: null,
    renderer: null,
    walkarea: null,
    area_camera: null,
    camera: null,

    // Debug
    debug: null,

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
            this.removeSuggestion(suggestion.songID);

        // Remove user 
        this.users_obj.remove(id);
        this.users_arr.splice(index, 1);
    },

    // Suggestion Methods
    getSuggestion: function(suggestionID)
    {
        return this.suggestions[suggestionID];
    },

    addSuggestion: function(user, songID)
    {
        // Create suggestion
        const suggestion = new Suggestion(songID, user.id, 0);

        // Add
        user.suggestion = suggestion;
        this.suggestions[songID] = suggestion;

        // Add to local user
        if(this.my_user == user)
            this.my_suggestion = suggestion;

        // Update counter
        this.suggestion_counter++;
    },
    
    removeSuggestion: function(user, songID)
    {
        // Get suggestion
        const suggestion = this.getSuggestion(songID);

        // Check
        if(suggestion == undefined) return;

        // Remove votes
        this.removeSuggestionVotes(suggestion);

        // Remove
        this.suggestions.remove(suggestion.songID);
        user.suggestion = {};

        // Remove from local user
        if(this.my_user == user)
            this.my_suggestion = null; 

        // Update counter
        this.suggestion_counter--;
    },

    updateSuggestion: function(user, old_songID, new_songID)
    {
        // Check
        if(new_songID == undefined) return;

        // Remove old suggestion
        this.removeSuggestion(user, old_songID);

        // Add new suggestion
        this.addSuggestion(user, new_songID);
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
        return this.suggested_songs.getObject({songID});
    },

    addSong: function(song)
    {
        this.suggested_songs.push(song);
    },

    removeSong: function(songID)
    {
        // Get index of the song
        const index = this.suggested_songs.getObjectIndex({ID: songID});

        // Remove
        if(index != -1)
            this.suggested_songs.splice(index, 1);
    },

    updateSong: function(old_songID, song)
    {
        this.removeSong(old_songID);
        this.addSong(song);
    },

    songSorter: function(song1, song2)
    {
        if(MODEL.suggestions[song1.ID].vote_counter > MODEL.suggestions[song2.ID].vote_counter)
            return -1;
        else if(MODEL.suggestions[song1.ID].vote_counter < MODEL.suggestions[song2.ID].vote_counter)
            return 1;
        else
            return song1.title.localeCompare(song2.title, undefined, { numeric: true });
    },
}

/***************** SUGGESTION *****************/

function Suggestion(songID, userID, vote_counter)
{
    this.songID = songID;
    this.userID = userID;
    this.vote_counter = vote_counter;
}

/***************** MESSAGE *****************/

function Message(sender, type, content, time)
{
    this.sender = sender || ""; //ID
    this.type = type || "ERROR";
    this.content = content || "";
    this.time = time || Date.getTime();
}
