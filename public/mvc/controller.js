/***************** CONTROLLER *****************/

const CONTROLLER = 
{

    // TODO

    init: function()
    {
        // INIT 
        CLIENT.init();
    },

    // DRAW

    // UPDATE

    // UPDATE USER

    // ON MOUSE

    setRoom: function(path)
    {
        //load a GLTF for the room
		MODEL.current_room = new RD.SceneNode({scaling:80,position:[0,-.01,0]});
		MODEL.current_room.loadGLTF(path);
		MODEL.scene.root.addChild( MODEL.current_room );
    },

    setAvatarAssets: function(avatarAssets)
    {
        forEach(avatar in avatarAssets)
        {
            // Create the material for the avatar
            var mat = new RD.Material({
                textures: {
                color: avatar.folder+"/"+avatar.texture }
                });
            
            mat.register(avatar.folder);
            
            // Create pivot point for the avatar
            var character_pivot = new RD.SceneNode({
                position: [-40,-5,0];
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
            MODEL.user_assets.push();
        }
    },

    setObjectAssets: function(objectAssets)
    {
        forEach(object in objectAssets)
        {
            var obj = new RD.SceneNode( {scaling:object.scaling, position:object.position} );
            obj.loadGLTF(object.object);
            MODEL.object_assets.push(obj);
        }

    }
}