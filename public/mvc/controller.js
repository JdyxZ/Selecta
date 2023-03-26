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
    },

    setAvatarAssets: function(user_assets)
    {
        for(avatar in user_assets)
        {
            // Create the material for the avatar
            var mat = new RD.Material({
                textures: {
                color: avatar.folder + "/" + avatar.texture }
                });
            
            mat.register(avatar.folder);
            
            // Create pivot point for the avatar
            var character_pivot = new RD.SceneNode({
                position: [-40,-5,0]
            });

            // Create a mesh for the avatar
            var avat = new RD.SceneNode({
                scaling: avatar.scale,
                mesh: avatar.folder+"/"+avatar.mesh,
                material: avatar.folder
            });

            var avat_selector = new RD.SceneNode({
                position: [0,20,0],
                mesh: "cube",
                material: avatar.folder,
                scaling: [8,20,8],
                name: avat_selector,
                layers: 0b1000
            });

            character_pivot.addChild( avat_selector );

            character_pivot.addChild(avat);
		    avat.skeleton = new RD.Skeleton();

            // Load the animations

            var animations = CONTROLLER.loadAnimations(avatar.animations,"data/"+avatar.folder+"/");
            MODEL.user_assets[avatar.id] = {"character": avat ,"character_pivot": character_pivot,"animations": animations };
        };
    },

    loadAnimations: function (animations , path)
    {
        res = {};
        for (animation in animations)
        {
            var anim = res[animation] = new RD.SkeletalAnimation();
            anim.load(path+animations[animation]);
        };
        return res;
    },

    setObjectAssets: function(object_assets)
    {
        for(object in object_assets)
        {
            var obj = new RD.SceneNode( {scaling:object.scaling, position:object.position} );
            obj.loadGLTF(object.object);
            MODEL.object_assets.push(obj);
        };

    },

    onUserJoin: function(users)
    {
        // Append new users to users
        MODEL.addUsers(users);
    },

    onUserLeft: function(user_id)
    {
        // Remove user
        MODEL.removeUser(user_id);
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

    onSuggest: function(user, suggestion)
    {
        // Get suggestion IDs
        const old_songID = user.suggestion.songID;
        const new_songID = suggestion.songID;

        // Update the MODEL state
        if(old_songID == undefined)
            MODEL.addSuggestion(user, suggestion);
        else if(new_songID == old_songID)
            MODEL.removeSuggestion(user, suggestion);
        else
            MODEL.updateSuggestion(suggestion, new_songID);
    },

    onVote: function(user, songID)
    {
        // Set aux vars
        const already_voted = songID in user.votes;
        const suggestion = MODEL.suggestions[songID];

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

    onFetchSong: function(songID)
    {
        // TODO: Download song from Youtube
        // TODO: Register the song in the MODEL (current or next song vars)
        
        // When the song is downloaded, notify the system the song is ready to be played
        const message = new Message(MODEL.my_user.id, "SONG_READY", songID, getTime());
        //CLIENT.sendMessage(message);
    },


    onPlaySong: function(type, playbackTime)
    {
        if(type == "current")
        {
            // TODO: play the current song at the indicated playbackTime
        }
        else if (playbackTime > 0)
        {
            // TODO: play the next song at the indicated playbackTime
        }
        else
        {
            // TODO: schedule the playback of the song at the indicated playbackTime
            setTimeout(() => {}, -playbackTime);
        }
    },

    /***************** ACTIONS *****************/

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

}