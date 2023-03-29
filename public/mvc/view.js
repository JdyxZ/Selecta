/***************** VIEW *****************/

const VIEW = 
{
    // TODO: Aquí va el rendeer loop
    canvas_parent: null,

    setWalkarea: function()
    {
        walkarea = new WalkArea();

		// Pista walkarea
		walkarea.addRect([-160,0,-190],300,260);
		
		// Pista walkarea vip
		walkarea.addRect([70,0,70],70,70);

		// Pista bar 1 walkarea
		walkarea.addRect([-245,0,-190],85,35);

		//Pista bar 1.1 walarea
		walkarea.addRect([-190,0,-155],30,30);

		// Pista bar 2 walkarea
		walkarea.addRect([-175,0,70],80,75);

		// Pista bar 2.1 walkarea
		walkarea.addRect([-220,0,115],45,30);

		// Pista bar 2.2 walkarea
		walkarea.addRect([-235,0,115],15,15);

		// Pista bar 2.3 walkarea
		walkarea.addRect([-195,0,100],20,15);
		MODEL.walkarea = walkarea;

    },

    init: function()
    {
        VIEW.canvas_parent = document.get("#Selecta");
        MODEL.context = GL.create({width: window.innerWidth, height:window.innerHeight});

        // Create the renderer instance
        MODEL.renderer = new RD.Renderer(MODEL.context);
        
        // Set the folder where all the assets are contained 
		MODEL.renderer.setDataFolder("media/assets");
		MODEL.renderer.autoload_assets = true;

        // Append the renderer to the canvas
        VIEW.canvas_parent.appendChild(MODEL.renderer.canvas);

        // Creathe the scene
		MODEL.scene = new RD.Scene();

		// Create and set the camera with harcoded values
		MODEL.camera = new RD.Camera();
		MODEL.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		MODEL.camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

        // Set the color to clean the scene
        MODEL.bg_color = [0.1,0.1,0.1,1];

        VIEW.setWalkarea();

        // Main draw function
		MODEL.context.ondraw = VIEW.draw;

        // Main update function
		MODEL.context.onupdate = VIEW.update;

        // Function to slighly move the camera
        MODEL.context.onmousemove = VIEW.move_mouse;

        // Function to control 'zoom'
        MODEL.context.onmousewheel = VIEW.move_mouse_wheel;

		// Capture mouse events
		MODEL.context.captureMouse(true);
		MODEL.context.captureKeys();

		// Launch loop
		MODEL.context.animate();
    },

    move_mouse_wheel: function(e)
    {
        //move camera forward
        MODEL.camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );

    },

    move_mouse: function(e)
    {
        // If its dragging
        if(e.dragging)
        {
            MODEL.camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
        }
    },
    
    addUser: function(user)
    {
        //console.log(MODEL.user_assets[user.id]);
        const id = user.id;

        // Get the corresponding user asset
        var asset = MODEL.raw_user_assets[user.asset];
        //console.log(MODEL.raw_user_assets);

        // Create the asset instance
        CONTROLLER.createAsset(asset,[-40,-5,0],id);
        
        // We add the node to the scene
            
    },

    removeUser: function(id)
    {
        CONTROLLER.scene.root.removeChild( MODEL.user_assets[id].character_pivot );
    },

    draw: function()
    {
    
        // Shape data from the canvas
        gl.canvas.width = VIEW.canvas_parent.offsetWidth;
        gl.canvas.height = VIEW.canvas_parent.offsetHeight;
        gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
        
        
        // Check if the my_user is initialized
        if(!MODEL.my_user)
        return
        
        // Check if the assets are loaded
        if(!MODEL.user_assets[MODEL.my_user.asset])
            return  

        // Obtain avatar and camera positions
        var campos = MODEL.user_assets[MODEL.my_user.asset].character_pivot.localToGlobal([0,60,-70]);
        var camtarget = MODEL.user_assets[MODEL.my_user.asset].character_pivot.localToGlobal([0,10,70]);

        // Compute the smooth camera
        var smoothtarget = vec3.lerp( vec3.create(), MODEL.camera.target, camtarget, 0.02 );

        // Update the camera
        MODEL.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
        MODEL.camera.lookAt( campos, smoothtarget, [0,1,0] );

        // Clear the scene
        MODEL.renderer.clear(MODEL.bg_color);

        // Set the sceneanimation

        //console.log(MODEL.room_scene);
        MODEL.renderer.render(MODEL.scene, MODEL.camera, null, 0b11 );
    },

    update: function(dt) 
    {
        
        // Check if the my_user is initialized
        if(!MODEL.my_user)
            return

        // Check if the assets are loaded
        if(!MODEL.user_assets[MODEL.my_user.asset])
            return      
        
        // Just in case
        MODEL.scene.update(dt);

        // Necessary data to update
        var t = getTime();
        var anim = MODEL.user_assets[MODEL.my_user.asset].animations['idle.skanim'];
        var time_factor = 1;

        // Check the keys for moving
        if(gl.keys["UP"])
        {
            // Set the pivot to walk forward
            MODEL.user_assets[MODEL.my_user.asset].character_pivot.moveLocal([0,0,1]);

            // Set the walking animation
            anim = MODEL.user_assets[MODEL.my_user.asset].animations['walking.skanim'];
        }

        else if(gl.keys["DOWN"])
        {
            // Set the pivot to walk backwards
            MODEL.user_assets[MODEL.my_user.asset].character_pivot.moveLocal([0,0,-1]);

            // Set the walking animation and timefactor for the skeleton (walking animation inverse)
            anim = MODEL.user_assets[MODEL.my_user.asset].animations['walking.skanim'];
            time_factor = -1;
        }

        // Check the keys for rotating
        if(gl.keys["LEFT"])
        {
            // Set the pivot to rotate left
            MODEL.user_assets[MODEL.my_user.asset].character_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
        }
        
        else if(gl.keys["RIGHT"])
        {
            // Set the pivot to rotate right
            MODEL.user_assets[MODEL.my_user.asset].character_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);
        }
        
        // Deafult keys numbers for dances
        if(gl.keys["1"])
        {
            // Set dancing animation if exists
            if(MODEL.user_assets[MODEL.my_user.asset].animations['macarena.skanim'])
                anim = MODEL.user_assets[MODEL.my_user.asset].animations['macarena.skanim'];
        }
        if(gl.keys["2"])
        {
            // Set dancing animation if exists
            if(MODEL.user_assets[MODEL.my_user.asset].animations['dance2.skanim'])
                anim = MODEL.user_assets[MODEL.my_user.asset].animations['dance2.skanim'];
        }
        
        // In case the avatar is outside the boundingbox we calculate the near position
        var pos = MODEL.user_assets[MODEL.my_user.asset].character_pivot.position;
        var nearest_pos = MODEL.walkarea.adjustPosition( pos );
        MODEL.user_assets[MODEL.my_user.asset].character_pivot.position = nearest_pos;

        // Move bones in the skeleton based on animation
        anim.assignTime( t * 0.001 * time_factor );
        
        // Copy the skeleton in the animation to the character
        MODEL.user_assets[MODEL.my_user.asset].character.skeleton.copyFrom( anim.skeleton );
    }
}