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
        users.forEach(user => MODEL.users_obj[user.id] = user);
        MODEL.users_arr = MODEL.users_arr.concat(users);
    },

    onUserLeft: function(user_id, index)
    {
        // Get user data
        const user = MODEL.users_obj[user_id];
        const suggestion = user.suggestion;

        // Remove user suggestion
        if(suggestion)
            suggestions.remove(suggestion.songID);

        // Remove user votes
        user.votes.forEach(vote => {
            suggestions[vote].vote_counter--;
        });

        // Remove user 
        MODEL.users_obj.remove(user_id);
        MODEL.users_arr.splice(index, 1);
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

    onSuggest: function(suggestion)
    {
        // TODO
    },

    onVote: function(songID)
    {
        // TODO
    },

    onFetchSong: function(songID)
    {
        // TODO
    },

    onPlaySong: function(songID, playbackTime)
    {
        // TODO
    },

    /***************** ACTIONS *****************/

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

}