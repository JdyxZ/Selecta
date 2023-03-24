/***************** VIEW *****************/

const VIEW = 
{
    // TODO: Aquí va el rendeer loop

    init: function()
    {
        MODEL.context = GL.create({width: window.innerWidth, height:window.innerHeight});

        // Create the renderer instance
        renderer = new RD.Renderer(MODEL.context);
        
        // Set the folder where all the assets are contained 
		renderer.setDataFolder("data");
		renderer.autoload_assets = true;

        // Append the renderer to the canvas
        document.body.appendChild(renderer.canvas);

        // Creathe the scene
		MODEL.scene = new RD.Scene();

		// Create and set the camera with harcoded values
		MODEL.camera = new RD.Camera();
		MODEL.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		MODEL.camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

        // Set the color to clean the scene
        MODEL.bg_color = [0.1,0.1,0.1,1];

        // Main draw function
		MODEL.context.ondraw = function(){

            // Shape data from the canvas
			gl.canvas.width = document.body.offsetWidth;
			gl.canvas.height = document.body.offsetHeight;
			gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

            // Obtain avatar and camera positions
			var campos = MODEL.character_pivot.localToGlobal([0,60,-70]);
			var camtarget = MODEL.character_pivot.localToGlobal([0,10,70]);

            // Compute the smooth camera
			var smoothtarget = vec3.lerp( vec3.create(), MODEL.camera.target, camtarget, 0.02 );

            // Update the camera
			MODEL.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
			MODEL.amera.lookAt( campos, smoothtarget, [0,1,0] );

			// Clear the scene
			renderer.clear(MODEL.bg_color);

			// Set the scene
			renderer.render(MODEL.scene, MODEL.camera, null, 0b11 );
		}

        // Main update function
		MODEL.context.onupdate = function(dt)
		{
			// Just in case
			MODEL.scene.update(dt);

            // Necessary data to update
			var t = getTime();
			var anim = MODEL.animations.idle;
			var time_factor = 1;

			// Check the keys for moving
			if(gl.keys["UP"])
			{
                // Set the pivot to walk forward
				MODEL.character_pivot.moveLocal([0,0,1]);

                // Set the walking animation
				anim = animations.walking;
			}
			else if(gl.keys["DOWN"])
			{
                // Set the pivot to walk backwards
				MODEL.character_pivot.moveLocal([0,0,-1]);

                // Set the walking animation and timefactor
				anim = animations.walking;
				time_factor = -1;
			}

            // Check the keys for rotating
			if(gl.keys["LEFT"])
            {
                // Set the pivot to rotate left
				MODEL.character_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
            }
			else if(gl.keys["RIGHT"])
            {
                // Set the pivot to rotate right
                MODEL.character_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);
            }
			
			// Deafult keys numbers for dances
			if(gl.keys["1"])
            {
                // Set dancing animation if exists
                if(animations.dancing)
                    anim = animations.dancing;
            }
			if(gl.keys["2"])
            {
                // Set dancing animation if exists
                if(animations.macarena)
                    anim = animations.macarena;
            }
				
			var pos = MODEL.character_pivot.position;
			var nearest_pos = MODEL.walkarea.adjustPosition( pos );
			MODEL.character_pivot.position = nearest_pos;

			//move bones in the skeleton based on animation
			anim.assignTime( t * 0.001 * time_factor );
			//copy the skeleton in the animation to the character
			MODEL.character.skeleton.copyFrom( anim.skeleton );
		}

        // Function to slighly move the camera
        MODEL.context.onmousemove = function(e)
		{
            // If its dragging
			if(e.dragging)
			{
				MODEL.camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
			}
		}

        // Function to control 'zoom'
        MODEL.context.onmousewheel = function(e)
		{
			//move camera forward
			MODEL.camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
		}

		// Capture mouse events
		MODEL.context.captureMouse(true);
		MODEL.context.captureKeys();

		// Launch loop
		MODEL.context.animate();
    }
}