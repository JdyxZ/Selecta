/***************** CONTROLLER *****************/

const CONTROLLER = 
{
    // Control variables
    loading: true,
    audio_playing: false,
    syncro_diff: 100, // [ms]

    // Debug
    debug: null,

    /***************** INIT *****************/

    init: function()
    {
        // INIT 
        VIEW.init();
    },
    
    /***************** MESSAGE CALLBACKS *****************/

    setRoom: function(room)
    {
        // Save new room data
        MODEL.current_room = MODEL.current_room.concat(room);

        // Save suggestions
        MODEL.suggestions = MODEL.suggestions.concat(room.suggestions); 

        // Save songs
        MODEL.songs = MODEL.songs.concat(room.songs.values());

        // Force update visuals
        // if(MODEL.current_room.playlist_items && MODEL.my_song)
            // SELECTA.initSuggestionInterface();
    },

    setMyUser: async function(user)
    {
        // Add user info to the MODEL
        MODEL.my_user = user;
        MODEL.my_suggestion = user.suggestion;
        MODEL.my_votes = user.votes;
        MODEL.my_song = user.song;

        // Update active users
        MODEL.current_room.active_users.push(user.id);
        MODEL.current_room.num_active_users++;

        // Animation
        MODEL.my_user.animation = 'idle.skanim'

        // Append user to the VIEW render
        if(!((typeof MODEL.raw_user_assets[user.id] === 'undefined')))
        {
            VIEW.addUser(user);
        }

        // Force update visuals
        // if(MODEL.current_room.playlist_items && MODEL.my_song)
            // SELECTA.initSuggestionInterface();
    },

    createAsset: function(user_asset,user_position,user_rotation,id)
    {
        // Get data
        var asset = user_asset.asset;
            
        var animations = user_asset.animations;
       
        // Create the material for the avatar
        var mat = new RD.Material({
            textures: {
            color: "user_assets/" + asset.folder + "/" + asset.texture }
            });
        
        mat.register(asset.folder);
        
        // Create pivot point for the avatar
        var character_pivot = new RD.SceneNode({
            position: user_position,
            rotation: user_rotation
        });

        // Create a mesh for the avatar
        var avat = new RD.SceneNode({
            scaling: 0.3,
            mesh: "user_assets/"+ asset.folder + "/" + asset.mesh,
            material: "girl2"
        });
        avat.id = "avat";

        avat.skeleton = new RD.Skeleton();

        character_pivot.addChild(avat);
        character_pivot.id = id;
         

        var avat_selector = new RD.SceneNode({
            position: [0,20,0],
            mesh: "cube",
            material: asset.folder,
            scaling: [8,20,8],
            name: "avat_selector",
            layers: 0b1000
        });

        avat_selector.id = "avatselector";

        character_pivot.addChild( avat_selector );
        
        MODEL.scene.root.addChild( character_pivot );
        // Set the character_pivot id to the id of the user
        //character_pivot.id = id;

        // Load the animations
        var animations = CONTROLLER.loadAnimations(animations, "media/assets/user_assets/" + asset.folder + "/");
        
        MODEL.user_assets[id] = {"character": avat ,"character_pivot": character_pivot,"animations": animations };
    },

    setAvatarAssets: function(user_assets)
    {
        for(id in user_assets)
        {
            MODEL.raw_user_assets[id] = user_assets[id];
        };

        VIEW.addUser(MODEL.my_user);

        for(user_id in MODEL.users_obj)
        {
            if((typeof MODEL.users_obj[user_id] === 'undefined'))
                return

            VIEW.addUser(MODEL.users_obj[user_id]);
        }
    },

    loadAnimations: function (animations , path)
    {
        res = {};
        for (aid in animations)
        {
            if (animations.hasOwnProperty(aid))
            {
                var anim = res[animations[aid]] = new RD.SkeletalAnimation();
                anim.load(path+animations[aid]);
            }
            
        };
        return res;
    },

    setObjectAssets: function(object_assets_)
    {
        for(id in object_assets_)
        {
            var object = object_assets_[id].asset;
            var obj = new RD.SceneNode( {scaling:80, position:[0,-.01,0]} );
            obj.loadGLTF("media/assets/object_assets/" + object.object);
            //obj.id = "room";
            MODEL.scene.root.addChild( obj );
            MODEL.object_assets[id] = obj;
        };

    },

    onUserJoin: function(user_data)
    {
        // Append new users to users
        if(isArray(user_data)) MODEL.addUsers(user_data);
        if(isObject(user_data)) MODEL.addUser(user_data);

        // View stuff
        if(isArray(user_data))
        {
            user_data.forEach(user => {if(MODEL.users_obj[user.id].animation !== null) MODEL.users_obj[user.id].animation = 'idle.skanim';});
            user_data.forEach(user => {if(typeof MODEL.raw_user_assets[user.asset] !== 'undefined') VIEW.addUser(user);} );
        }
        else if(isObject(user_data))
        {
            if(MODEL.users_obj[user_data.id].animation !== null) MODEL.users_obj[user_data.id].animation = 'idle.skanim';
            if(typeof MODEL.raw_user_assets[user_data.asset] !== 'undefined') VIEW.addUser(user_data);
        }
    },

    onUserLeft: function(user_id)
    {
        // Remove user
        MODEL.removeUser(user_id);
        VIEW.removeUser(user_id);
    },

    onTick: function(user, model, animation)
    {
        if(user)
        {   
            // Set the pivot of the user
            character_pivot_node = MODEL.scene.root.findNode(user.id);

            // Set user model
            if(model)
            {
                user.model = model; 
                character_pivot_node.position = model['position'];
                character_pivot_node.rotation = model['rotation'];
            } 
            if(animation) user.animation = animation;
        }
        else
        {
            // Set user model
            if(model) user.model = model; 
            if(animation) user.animation = animation;
        }
    },

    onExit: function()
    {
        // TODO
    },

    onSuggest: function(user, song)
    {
        // Get songs
        const oldSong = user.song;
        const newSong = song;

        // Get songs IDs
        const oldSongID = oldSong == undefined ? undefined : oldSong.ID;
        const newSongID = newSong.ID;

        // Update the MODEL state
        if(oldSongID == undefined)
        {
            MODEL.addSuggestion(user, newSongID);
            MODEL.addSong(user, newSong);
        }
        else if(oldSongID == newSongID)
        {
            MODEL.removeSuggestion(user, newSongID);
            MODEL.removeSong(user, newSong);
        }
        else
        {
            MODEL.updateSuggestion(user, oldSongID, newSongID);
            MODEL.updateSong(user, oldSong, newSong);
        }

        // Force update visuals
        SELECTA.updateVotesInterface();
    },

    onVote: function(user, songID)
    {
        // Set aux vars
        const already_voted = user.votes.includes(songID);
        const suggestion = MODEL.getSuggestion(songID);

        // Update MODEL state
        if(already_voted)
        {
            user.votes.remove(songID);
            suggestion.vote_counter--;
        }    
        else
        {
            user.votes = [...user.votes, songID];
            suggestion.vote_counter++;
        }

        // Update interface
        SELECTA.updateVotesInterface();
    },

    onSkip: function(user)
    {
        // Check skip property
        switch(user.skip)
        {
            case(true): // User skipped in the past
                MODEL.current_room.skip_counter--;
                break;
            case(false): // User hasn't skipped yet
                MODEL.current_room.skip_counter++;
                break;
        }

        // Update skip property
        user.skip = !user.skip;

        // Update visuals
        SELECTA.updatePlaybackInfo();
    },

    onPlaySong: function(song)
    {
        // Set the visuals of the next song
        if(song.playbackTime === "next")
        {
            // Update model
            MODEL.next_song = song;

            // Force update visuals
            SELECTA.updatePlaybackInterface("next");
        }
        // Prepare visuals for the song swap
        else if(song.playbackTime === "future")
        {
            // Update model
            MODEL.future_song = song;
        }
        // Play current song
        else if(song.playbackTime >= 0)
        {
            // Update model
            MODEL.current_song = song;

            // Set a loading callback
            if(this.loading) MODEL.player.oncanplaythrough = this.startSystem.bind(this);

            // Estimate song time
            const loadingTime = performance.now() - MODEL.current_song.arrivalTime;
            const time = (MODEL.current_song.playbackTime + loadingTime) / 1000;  // [s]

            // Start loading and playing the song
            MODEL.player.autoplay = true;
            MODEL.player.volume = SELECTA.sliders.music_volume.value;
            MODEL.player.muted = true; // To avoid autoplay restrictions
            MODEL.player.src = song.audioStream.url;
            MODEL.player.currentTime = time;

            // Force update visuals
            SELECTA.updatePlaybackInterface("current");
        }
        // Schedule the next song
        else if (song.playbackTime < 0)
        {
            // Update model
            MODEL.next_song = song;
            MODEL.current_room.skipping = true;

            // Get suggestion
            const suggestion = MODEL.suggestions[song.ID];

            // Remove suggestion
            if(suggestion)
            {
                const userID = suggestion.userID;
                const user = MODEL.my_user.id == userID ? MODEL.my_user : MODEL.users_obj[userID];
                MODEL.removeSuggestion(user, song.ID);
                MODEL.removeSong(user, song);
            }

            // Force update visuals
            SELECTA.updateSuggestionInterface(song.ID);
            SELECTA.updateVotesInterface();
            SELECTA.updatePlaybackInterface("next");
            SELECTA.updatePlaybackInfo();
            SELECTA.updateSkipButton();

            // Initialize aux player to start prelaoding the song
            MODEL.aux_player = new Audio();

            // Estimate song time
            const loadingTime = (performance.now() - MODEL.next_song.arrivalTime) + MODEL.next_song.playbackTime;
            const time = loadingTime / 1000; // [s]
            
            // Start preloading the song 
            MODEL.aux_player.autoplay = true;
            MODEL.player.volume = SELECTA.sliders.music_volume.value;
            MODEL.aux_player.muted = true; // To avoid autoplay restrictions
            MODEL.aux_player.src = song.audioStream.url;
            MODEL.aux_player.currentTime = time;
   
            // Calculate mean time
            const meanTime = performance.now() - song.arrivalTime;

            // Schedule playback
            setTimeout(this.playNextSong.bind(this), -(song.playbackTime + meanTime));
        }
    },

    /***************** SEND METHODS *****************/

    sendTick: function()
    {
        const message = new Message(MODEL.my_user.id, "TICK", {"model":MODEL.my_user.model,"animation":MODEL.my_user.animation}, getTime());
        CLIENT.sendMessage(message);
    },

    sendSuggestion: function(videoID)
    {
        const message = new Message(MODEL.my_user.id, "SUGGEST", videoID, getTime());
        CLIENT.sendMessage(message);
    },

    sendVote: function(videoID)
    {
        const message = new Message(MODEL.my_user.id, "VOTE", videoID, getTime());
        CLIENT.sendMessage(message);
    },

    sendSkip: function()
    {
        const message = new Message(MODEL.my_user.id, "SKIP", MODEL.current_song.ID, getTime());
        CLIENT.sendMessage(message);
    },

    /***************** AUXILIAR METHODS *****************/

    startSystem: function()
    {
        // Check
        if(MODEL.player.readyState != 4)
            return;

        // Deactive callback to avoid bugs
        MODEL.player.oncanplaythrough = null;
        
        // Notify the user the app is ready to run
        SELECTA.loadingOver();
    },
    
    playNextSong: function()
    {
        // Pause old player
        MODEL.player.pause();

        // Remove old and place new event listner 
        MODEL.aux_player.listener = SELECTA.updatePlaybackProgress.bind(SELECTA);
        MODEL.player.stop("timeupdate", MODEL.player.listener);       
        MODEL.aux_player.when("timeupdate", MODEL.aux_player.listener);

        // Assign new player
        MODEL.player = MODEL.aux_player;
        MODEL.aux_player = null;

        // Update song info
        MODEL.current_song = MODEL.next_song;
        MODEL.next_song = MODEL.future_song;
        MODEL.future_song = null;

        // Clear skipping info
        MODEL.resetSkipVotes();
        MODEL.current_room.skipping = false;
        MODEL.current_room.skip_counter = 0;
        clearInterval(MODEL.intervals.skipping);
        MODEL.intervals.skipping = null;

        // Force update visuals
        SELECTA.updatePlaybackInterface("both");
        SELECTA.updatePlaybackInfo();
        SELECTA.updateSkipButton();
    }

}