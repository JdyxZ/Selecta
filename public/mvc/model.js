/***************** MODEL *****************/

const MODEL = 
{
    // User data
    my_user: null,
    my_suggestion: null,
    my_votes: null,

    // Room data
    current_room: null,
    users_obj: {},
    users_arr: [],
    suggestions: {},

    // Assets data
    user_assets : {}, // User skins
    object_assets: {}, // Furniture and scene assets of all the rooms (they must identify the room they belong to)

    // Audio playback
    current_song: null,
    next_song: null, 
    playback_time: null, // Playback time of the current song
    skipping_time: null, // Song time when the skip action should be performed

    // Scene data
    context: null,
    scene: null,
    renderer: null,
    camera: null,

    // Methods
    addSuggestion: function(user_id, song_id)
    {
        // Get user
        const user = this.users_obj[user_id];

        // Add
        user.suggestion = suggestion;
        this.suggestions[song_id] = suggestion;
    },

    removeSuggestion: function(song_id)
    {
        // Get suggestion
        const suggestion = this.suggestions[song_id];

        // Check
        if(suggestion == undefined) return;

        // Get user
        const user = this.users_obj[suggestion.userID];
        
        // Remove
        this.suggestions.remove(song_id);
        user.remove(suggestion);
        user.suggestion = {};

        // Remove votes for the removed suggestion
        this.removeSuggestionVotes(room_id, song_id);

    },

    updateSuggestion: function(old_songID, new_songID)
    {
        // Get suggestion
        const suggestion = this.suggestions[old_songID];

        // Check
        if(suggestion == undefined) return;

        // Update
        suggestion.songID = new_songID;
        suggestion.vote_counter = 0;

        // Remove votes for the updated suggestion
        this.removeSuggestionVotes(new_songID);
    },

    removeSuggestionVotes(song_id)
    {
        // Get suggestion
        const suggestion = this.suggestions[old_songID];

        // Check
        if(suggestion == undefined) return;

        // Reset counter
        suggestion.vote_counter = 0;

        // Remove votes
        users_arr.forEach(user => {
            user.votes.remove(song_id);
        })
    },
}