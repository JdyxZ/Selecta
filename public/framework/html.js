/********************************** HTML FRAMEWORK **********************************/

/***************** HTML ElEMENTS *****************/

if(typeof(Document) != "undefined")
{
	Document.prototype.get = function(selector)	{

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
	};

	Document.prototype.getAll = function(selector)
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
	};

	Document.prototype.when = function(event, callback)	{
		document.addEventListener(event, callback);
	};

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
	
	HTMLElement.prototype.visibility = function()
	{
		return this.style.display;
	};

	HTMLElement.prototype.get = function(selector)	{

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

	HTMLElement.prototype.getAll = function(selector)	{

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

	HTMLElement.prototype.when = function(event, callback)	{
		this.addEventListener(event, callback);
	};

	HTMLElement.prototype.show = function()
	{
		this.style.display = "";
	};

	HTMLElement.prototype.hide = function()
	{
		this.style.display = "none";
	};

	HTMLElement.prototype.change_background_color = function(color)
	{
		this.style.backgroundColor = color;
	};

};

/***************** HTML METHODS *****************/

dragElement = function(element, event, available_width, available_height)
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
}

if(typeof(window) == "undefined")
{
 	module.exports = {dragMenu};
}