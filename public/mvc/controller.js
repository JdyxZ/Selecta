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

        VIEW.addUser(user.id)
    },

    setAvatarAssets: function(user_assets)
    {
        for(id in user_assets)
        {
            // Get data
            var asset = user_assets[id].asset;
            var animations = user_assets[id].animations;

            // Create the material for the avatar
            var mat = new RD.Material({
                textures: {
                color: asset.folder + "/" + asset.texture }
                });
            console.log(asset.folder);
            mat.register(asset.folder);
            
            // Create pivot point for the avatar
            var character_pivot = new RD.SceneNode({
                position: [-40,-5,0]
            });

            // Create a mesh for the avatar
            var avat = new RD.SceneNode({
                scaling: asset.scale,
                mesh: asset.folder + "/" + asset.mesh,
                material: asset.folder
            });

            var avat_selector = new RD.SceneNode({
                position: [0,20,0],
                mesh: "cube",
                material: asset.folder,
                scaling: [8,20,8],
                name: avat_selector,
                layers: 0b1000
            });

            character_pivot.addChild( avat_selector );

            character_pivot.addChild(avat);
		    avat.skeleton = new RD.Skeleton();

            // Load the animations
            var animations = CONTROLLER.loadAnimations(animations, "media/assets/user_assets/" + asset.folder + "/");
            MODEL.user_assets[id] = {"character": avat ,"character_pivot": character_pivot,"animations": animations };
        };
    },

    loadAnimations: function (animations , path)
    {
        res = {};
        for (id in animations)
        {
            var anim = res[animations[id]] = new RD.SkeletalAnimation();
            anim.load(path+animations[id]);
        };
        return res;
    },

    setObjectAssets: function(object_assets)
    {
        for(id in object_assets)
        {
            var object = object_assets[id].asset;
            var obj = new RD.SceneNode( {scaling:80, position:[0,-.01,0]} );
            obj.loadGLTF("media/assets/object_assets/" + object.object);
            MODEL.scene.root.addChild( obj );
            MODEL.object_assets[id] = obj;
        };

    },

    onUserJoin: function(users)
    {
        // Append new users to users
        MODEL.addUsers(users);
        users.forEach(user => VIEW.addUser(user.id));
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

    onFetchSong: function(song)
    {
        // TODO: Download song from Youtube (stream)
        // TODO: Register the song in the MODEL (current or next song vars)

        // Remove suggestion
        // Remove song from songs obj and place song into current_song, next_song var
        
        // When the song is downloaded, notify the system the song is ready to be played
        const message = new Message(MODEL.my_user.id, "SONG_READY", song.ID, getTime());
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