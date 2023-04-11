/********************************** HTML FRAMEWORK **********************************/

/***************** DOCUMENT *****************/

Document.prototype.get = function(selector)	{
	try
	{
		// Get query
		const query = this.querySelector(selector);

		if(query == null)
		{
			console.error(`WARNING: Selector '${selector}' has not been found in the DOM. Returning an empty div`);
			return this.createElement("div");
		}
		else
		{
			return query;
		}
	}
	catch(error)
	{
		console.error(error);
		return this.createElement("div");
	}
};

Document.prototype.getAll = function(selector)
{
	try
	{
		// Get query
		const query = this.querySelectorAll(selector);

		if(query == null)
		{
			console.error(`WARNING: Selector '${selector}' has not been found in the DOM. Returning an empty div`);
			return this.createElement("div");
		}
		else
		{
			return query;
		}
	}
	catch(error)
	{
		console.error(error);
		return this.createElement("div");
	}
};

Document.prototype.setProperty = function(key, value)
{
	document.documentElement.style.setProperty(key, value);
}

Document.prototype.removeProperty = function(key)
{
	document.documentElement.style.removeProperty(key);
}

Document.prototype.getPropertyValue = function(key)
{
	document.documentElement.style.getPropertyValue(key);
}

Document.prototype.when = function(event, callback)	{
	document.addEventListener(event, callback);
};

Document.prototype.stop = function(event, callback)	{
	document.removeEventListener(event, callback);
};

/* Document.prototype.stop = function(event, callback)	
{
	// Get listeners
	const listeners = getEventListeners(document)[event];

	// Check
	if(listeners == undefined)
	{
		console.error(`ERROR: Listeners upon the event ${event} in the document do not exist`);
		return;
	}

	// Get listeners callbacks
	const listeners_callbacks = listeners.map(eventSpecs => eventSpecs.listener);

	// Check
	if(!listeners_callbacks.includes(callback))
	{
		console.error(`ERROR: No listener with the name ${callback.name} has been detected upon the event ${event} in the document`);
		return;
	}
	
	document.removeEventListener(event, callback);
};

Document.prototype.stopByName = function(event, callbackName)	
{
	// Get listeners
	const listeners = getEventListeners(document)[event];

	// Check
	if(listeners == undefined)
	{
		console.error(`ERROR: Listeners upon the event ${event} in the document do not exist`);
		return;
	}

	// Filter by name
	const filtered_listeners = listeners.filter(eventSpecs => eventSpecs.listener.name.includes(callbackName));

	// Check
	if(filtered_listeners.length > 1)
	{
		console.error(`ERROR: Several or no listeners with the name ${callbackName} has been detected upon the event ${event} in the element document`);
		return;
	}
	
	document.removeEventListener(event, filtered_listeners[0].listener);
}; */

/***************** HTML ElEMENTS *****************/

HTMLElement.prototype.get = function(selector)	
{
	// Get query
	const query = this.querySelector(selector);

	if (this == null)
	{
		console.error("WARNING: The HTML Element you are trying to use is null");
		return null;
	}
	else if (query == null)
	{
		console.error(`WARNING: Selector '${selector}' has not been found in the following HTML Element:
		\t - tag: ${this.tagName} 
		\t - id: ${this.id ? this.id : 'none'} 
		\t - class: ${this.className ? this.className : 'none'}
		Returning an empty div`);

		console.log(this);

		return this.appendChild(document.createElement("div"));
	}
	else
	{
		return query;
	}
};

HTMLElement.prototype.getAll = function(selector)	
{

	// Get query
	const query = this.querySelectorAll(selector);

	if (this == null)
	{
		console.error("WARNING: The HTML Element you are trying to use is null");
		return null;
	}
	else if (query == null)
	{
		console.error(`WARNING: Selector '${selector}' has not been found in the DOM. Returning an empty div`);
		return this.appendChild(document.createElement("div"));
	}
	else
	{
		return query;
	}

};

HTMLElement.prototype.setProperty = function(key, value)
{
	this.style.setProperty(key, value);
}

HTMLElement.prototype.removeProperty = function(key)
{
	this.style.removeProperty(key);
}

HTMLElement.prototype.getPropertyValue = function(key)
{
	this.style.getPropertyValue(key);
}

HTMLElement.prototype.getName = function()
{
	return `<${this.tagName.toLowerCase()}${this.id != undefined ? ` id="${this.id}"` : " "}${this.classList.length > 0 ? `class="${this.classList.toString()}"` : ""}> ... </${this.tagName.toLowerCase()}>`;
}

HTMLElement.prototype.getParents = function()
{
	let parents = new Array();
	let current_element = this;
	
	while (current_element.parentNode != null)
	{
		let parent = current_element.parentNode;
		parents.push(parent);
		current_element = parent;
	}

	return parents;    
};

HTMLElement.prototype.when = function(event, callback)	
{
	this.addEventListener(event, callback);
};

HTMLElement.prototype.stop = function(event, callback)	
{
	this.removeEventListener(event, callback);
};

/* HTMLElement.prototype.stop = function(event, callback)	
{
	// Get listeners
	const listeners = getEventListeners(this)[event];

	// Check
	if(listeners == undefined)
	{
		console.error(`ERROR: Listeners upon the event ${event} in the element ${this.getName()} do not exist`);
		return;
	}

	// Get listeners callbacks
	const listeners_callbacks = listeners.map(eventSpecs => eventSpecs.listener);

	// Check
	if(!listeners_callbacks.includes(callback))
	{
		console.error(`ERROR: No listener with the name ${callback.name} has been detected upon the event ${event} in the element ${this.getName()}`);
		return;
	}
	
	this.removeEventListener(event, callback);
}

HTMLElement.prototype.stopByName = function(event, callbackName)	
{
	// Get listeners
	const listeners = getEventListeners(this)[event];

	// Check
	if(listeners == undefined)
	{
		console.error(`ERROR: Listeners upon the event ${event} in the element ${this.getName()} do not exist`);
		return;
	}

	// Filter by name
	const filtered_listeners = listeners.filter(eventSpecs => eventSpecs.listener.name.includes(callbackName));

	// Check
	if(filtered_listeners.length != 1)
	{
		console.error(`ERROR: Several or any listener with the name ${callbackName} has been detected upon the event ${event} in the element ${this.getName()}`);
		return;
	}
	
	this.removeEventListener(event, filtered_listeners[0].listener);
} */

HTMLElement.prototype.appendChildren = function(children)
{
	try
	{
		this.append(...children);
	}
	catch(err)
	{
		console.error(err);
		return null;
	}

}

HTMLElement.prototype.removeChildren = function()
{
	this.replaceChildren();
}

HTMLElement.prototype.clone = function()
{
	return this.cloneNode(true);
}

HTMLElement.prototype.visibility = function()
{
	return this.style.display;
};

HTMLElement.prototype.show = function()
{
	this.style.display = "";
};

HTMLElement.prototype.hide = function()
{
	this.style.display = "none";
};

HTMLElement.prototype.toggleVisibility = function()
{
	this.visibility() == "none" ? this.show() : this.hide();
}

HTMLElement.prototype.change_background_color = function(color)
{
	this.style.backgroundColor = color;
};

/***************** HTML METHODS *****************/

dragElement = function(event, element, available_width, available_height)
{

	// Event
	event = event || window.event;
	event.preventDefault();

	// Positions
	var xi, yi, Δx, Δy;

	// Get mouse cursor position at startup
	xi = event.clientX;
	yi = event.clientY;

	// Track mouse motion to perform the transition
	document.onmousemove = (event) => {

		// Event
		event = event || window.event;
		event.preventDefault();

		// Displacement
		Δx = event.clientX - xi;
		Δy = event.clientY - yi;

		// Set div new position
		element.style.left = (element.offsetLeft + Δx).clamp(0, available_width - element.offsetWidth - 50) + "px";
		element.style.top = (element.offsetTop + Δy).clamp(0, available_height - element.offsetHeight - 80) + "px";
		
		//Update intial potition to current potition
		xi = event.clientX;
		yi = event.clientY;

	};

	// Stop moving when the mouse is released
	document.onmouseup = () => {

		document.onmouseup = null;
		document.onmousemove = null;
	}
};

if(typeof(window) == "undefined")
{
 	module.exports = {dragMenu};
}