/***************** CONTROLLER *****************/

const CONTROLLER = 
{

    // TODO

    init: function()
    {
        // INIT 
        VIEW.init();
    },

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

    setRoom: function(room)
    {
        // Assign new room
        MODEL.current_room = room;

        // Set room name into the chat TODO
        //room_name.innerText = room.name;
    },

    setMyUser: function(user)
    {
        // Assign my user info to my_user
        MODEL.my_user = user;
    },

    setUsers: function(users)
    {
        // Append new users to users
        users.forEach(user => MODEL.users_obj[user.id] = user);
        MODEL.users_arr = MODEL.users_arr.concat(users);

    },

    onUserLeft: function(user_id)
    {
        const index = MODEL.users_arr.getObjectIndex({id: user_id});

        // Check
        if(index == -1)
        { 
            console.error(`onUserLeft callback --> User id ${user_id} is not in the container`);
            return;  
        }

        // Delete left user from users
        delete MODEL.users_obj.user_id;
        MODEL.users_arr.splice(index, 1);

    },

    onTick: function(sender_id,new_target)
    {
        // Check
        if(!MODEL.users_obj[sender_id])
        {
            console.error(`onTick callback -->The user id ${sender_id} is not registered`);
            return;
        }

        // Set user target
        MODEL.users_obj[sender_id].target = new_target;
    },

    loadAnimations: function ( animations , path)
    {
        res = {};
        for (animation in animations)
        {
            var anim = res[animation] = new RD.SkeletalAnimation();
            anim.load(path+animations[animation]);
        };
        return res;
    },

    setAvatarAssets: function(avatarAssets)
    {
        for(avatar in avatarAssets)
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

    setObjectAssets: function(objectAssets)
    {
        for(object in objectAssets)
        {
            var obj = new RD.SceneNode( {scaling:object.scaling, position:object.position} );
            obj.loadGLTF(object.object);
            MODEL.object_assets.push(obj);
        };

    }
}