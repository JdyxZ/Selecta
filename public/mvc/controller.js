/***************** CONTROLLER *****************/

const CONTROLLER = 
{
    // Vars
    loading: true,

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
        MODEL.current_room = room;

        // Save suggestions
        MODEL.suggestions = MODEL.suggestions.concat(room.suggestions); 

        // Save songs
        MODEL.songs = MODEL.songs.concat(room.songs.values());
    },

    setMyUser: async function(user)
    {
        // Add user info to the MODEL
        MODEL.my_user = user;
        MODEL.my_suggestion = user.suggestion;
        MODEL.my_votes = user.votes;
        MODEL.my_song = user.song;

        // Animation
        MODEL.my_user.animation = 'idle.skanim'

        // Append user to the VIEW render
        if(!((typeof MODEL.raw_user_assets[user.id] === 'undefined')))
        {
            VIEW.addUser(user);
        }

        // Force update visuals
        if(MODEL.my_song)
            SELECTA.updateSuggestionInterface();
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

    onUserJoin: function(users)
    {
        // Append new users to users
        MODEL.addUsers(users);
        users.forEach(user =>{ if(!((typeof MODEL.raw_user_assets[user.asset] === 'undefined'))) VIEW.addUser(user) } );
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

        SELECTA.updateVotesInterface();
    },

    onPlaySong: function(song, playbackTime, timestamp)
    {
        // Adjust latency
        const latency = Date.getTime() - timestamp;
        playbackTime += latency;

        // Update parameter
        const update = playbackTime >= 0 ? "current" : "next";

        // Play current song
        if(playbackTime >= 0)
        {
            // Update model
            MODEL.current_song = song;

            // Force update visuals
            SELECTA.updatePlaybackInterface(update);

            // Play song
            MODEL.player.src = song.audioStream.url;
            MODEL.player.currentTime = playbackTime == 0 ? playbackTime : playbackTime / 1000; // [s]
            MODEL.player.play();
        }
        // Schedule the next song
        else if (playbackTime < 0)
        {
            // Update model
            MODEL.next_song = song;

            // Force update visuals
            SELECTA.updatePlaybackInterface(update);

            // Preload the song in an auxiliar player
            const aux_player = new Audio(song.audioStream.url);
            aux_player.load();

            // Schedule playback
            setTimeout(() => {

                // Start and set new player
                MODEL.player.pause();
                aux_player.play();
                MODEL.player = aux_player;

                // Force update visuals
                SELECTA.updatePlaybackInterface("both");

            }, -playbackTime);
        }
    },

    // Send methods
    sendReady:function()
    {
        const message = new Message(MODEL.my_user.id, "READY", "", getTime());
        CLIENT.sendMessage(message);
    },

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
    }

    /***************** ACTIONS *****************/

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

}