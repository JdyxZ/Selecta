
/***************** SELECTA *****************/

const SELECTA = 
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
    skipping_time: null // Song time when the skip action should be performed

    // TODO

}