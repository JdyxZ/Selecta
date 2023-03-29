/***************** CONTROLLER *****************/

const CONTROLLER = 
{

    // Vars

    /***************** INIT *****************/

    init: function()
    {
        // INIT 
        VIEW.init();
    },
    
    /***************** MESSAGE CALLBACKS *****************/

    setRoom: function(room)
    {
        // Assign new room
        MODEL.current_room = room;
    },

    setMyUser: function(user)
    {
        // Assign my user info to my_user
        MODEL.my_user = user;

        if(!((typeof MODEL.raw_user_assets[user.id] === 'undefined')))
        {
            VIEW.addUser(user);
        }
    },

    createAsset: function(user_asset,user_position,id)
    {
        // Get data
        var asset = user_asset.asset;
            
        var animations = user_asset.animations;
       
        // Create the material for the avatar
        var mat = new RD.Material({
            textures: {
            color: "user_assets/"+asset.folder + "/" + asset.texture }
            });
        
        mat.register(asset.folder);
        
        // Create pivot point for the avatar
        var character_pivot = new RD.SceneNode({
            position: user_position
        });

        // Create a mesh for the avatar
       
        var avat = new RD.SceneNode({
            scaling: 0.3,
            mesh: "user_assets/"+asset.folder + "/" + asset.mesh,
            material: "girl2"
        });

        avat.id = "avat1";
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

        avat.id = "avat";

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
        //console.log(user_assets);
        for(id in user_assets)
        {
            MODEL.raw_user_assets[id] = user_assets[id];
        };

        VIEW.addUser(MODEL.my_user);

        for(user_id in MODEL.users_arr)
        {
            if (MODEL.users_arr.hasOwnProperty(user_id))
            {
                VIEW.addUser(MODEL.users_obj[user_id]);
            };
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
        users.forEach(user =>{ if(!(MODEL.user_assets[user.id] === 'undefined')) VIEW.addUser(user) } );
    },

    onUserLeft: function(user_id)
    {
        // Remove user
        MODEL.removeUser(user_id);
        VIEW.removeUser(user_id);
    },

    onTick: function(user, model, animation)
    {
        // Set user model
        if(model) user.model = model; 
        if(animation) user.animation = animation;
    },

    onExit: function()
    {
        // TODO
    },

    onSuggest: function(user, suggestion, song)
    {
        // Get suggestion IDs
        const old_songID = user.suggestion.songID;
        const new_songID = song.ID;

        // Update the MODEL state
        if(old_songID == undefined)
        {
            MODEL.addSuggestion(user, suggestion);
            MODEL.addSong(song);
        }
        else if(new_songID == old_songID)
        {
            MODEL.removeSuggestion(user, suggestion);
            MODEL.removeSong(new_songID);
        }
        else
        {
            MODEL.updateSuggestion(suggestion, new_songID);
            MODEL.updateSong(old_songID, song);
        }
    },

    onVote: function(user, songID)
    {
        // Set aux vars
        const already_voted = songID in user.votes;
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
    },

    onPlaySong: function(song, playbackTime, timestamp)
    {
        // Adjust latency
        const latency = Date.getTime() - timestamp;
        playbackTime += latency;

        // Play current song
        if(playbackTime > 0)
        {
            // Update model
            MODEL.current_song = song;

            // TODO: Force update visuals

            // Play song
            MODEL.player.src = song.audioStream.url;
            MODEL.player.time = playbackTime;
            MODEL.player.play();
        }
        // Schedule the next song
        else if (playbackTime < 0)
        {
            // Update model
            MODEL.next_song = song;

            // TODO: Force update visuals

            // Preload the song in an auxiliar player
            const aux_player = new Audio(song.audioStream.url);
            aux_player.load();

            // Schedule playback
            setTimeout(() => {
                MODEL.player.pause();
                aux_player.play();
                MODEL.player = aux_player;
            }, -playbackTime);
        }
    },

    /***************** ACTIONS *****************/

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

}