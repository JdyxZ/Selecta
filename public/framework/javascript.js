
/********************************** JAVASCRIPT FRAMEWORK **********************************/

/***************** NUMBER *****************/

Number.prototype.clamp = function(min, max) 
{
	return Math.min(Math.max(this.valueOf(), min), max);
};

Number.prototype.lerp = function(target, step) 
{
	const origin = this.valueOf();
	return origin * (1 - step) + target * step;
};

Number.prototype.toArray = function()
{
	return [this.valueOf()];
}

Number.prototype.format = function()
{
	if(this < 1000)
	{
		return this;
	}
	const units = ['K', 'M', 'B', 'T'];
	let i = 0;
	let num = this / 1000;
	while (num >= 1000 && i < units.length - 1) {
		num /= 1000;
	  	i++;
	}
	return num.toFixed(1).replace(/\.0$/, '') + units[i];
}

/***************** STRING *****************/

String.prototype.toArray = function()
{
	return [this.valueOf()];
};

String.prototype.reverse = function()
{
	return [...this].reverse().join("");	
}

String.prototype.resumeByChars = function(num_chars)
{
	return this.slice(0, num_chars).trimEnd()  + '...';
}

String.prototype.resumeByWords = function(num_words)
{
	return this.split(' ').slice(0, num_words).join(' ').trimEnd() + '...';
}

String.prototype.removeLineBreaks = function()
{
	return this.replace(/(\r\n|\n|\r)/gm, "");
}

String.prototype.toNumber = function()
{
	return Number(this);
}

/***************** DATE *****************/

Date.getTime = function()
{
	const date = new Date();
	return date.getTime();
}

Date.getDate = function()
{
	const date = new Date();
	return date.getDate();
}

Date.parsePT = function(str)
{
	// Declare regex expressions
	const main_regex = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d+[HMS])(\d+H)?(\d+M)?(\d+S)?)?$/gm;
	const years_regex = /(\d+)Y/;
	const months_regex = /(?<=P|\dY)(\d+)M/;
	const weeks_regex = /(\d+)W/;
	const days_regex = /(\d+)D/;
	const hours_regex = /(\d+)H/;
	const minutes_regex = /(?<=T|\dH)(\d+)M/;
	const seconds_regex = /(\d+(?:\.\d+)?)S/;

	// Check
	if(!main_regex.test(str)) throw `Invalid string ${str} to parse to PT format`;

	// Apply match
	const years = str.match(years_regex);
	const months = str.match(months_regex);
	const weeks = str.match(weeks_regex);
	const days = str.match(days_regex);
	const hours = str.match(hours_regex);
	const minutes = str.match(minutes_regex);
	const seconds = str.match(seconds_regex);

	// Build response object
	const response = 
	{
		years: years == null ? years : years[1],
		months: months == null ? months : months[1],
		weeks: weeks == null ? weeks : weeks[1],
		days: days == null ? days : days[1],
		hours: hours == null ? hours : hours[1],
		minutes: minutes == null ? minutes : minutes[1], 
		seconds: seconds == null ? seconds : seconds[1],
		totalMiliseconds: 
			(years == null ? 0 : years[1] * 1000 * 60 * 60 * 24 * 365) + 
			(months == null ? 0 : months[1] * 1000 * 60 * 60 * 24 * 30) + 
			(weeks == null ? 0 : weeks[1] * 1000 * 60 * 60 * 24 * 7) + 
			(days == null ? 0 : days[1] * 1000 * 60 * 60 * 24) + 
			(hours == null ? 0 : hours[1] * 1000 * 60 * 60) + 
			(minutes == null ? 0 : minutes[1] * 1000 * 60) + 
			(seconds == null ? 0 : seconds[1] * 1000),
	}

	// Output
	return response;
}

Date.toDate = function(ms)
{
	// Build response object
	const response = 
	{
		years: ms / (1000 * 60 * 60 * 24 * 365), 
		months: ms / (1000 * 60 * 60 * 24 * 30), 
		weeks: ms / (1000 * 60 * 60 * 24 * 7), 
		days: ms / (1000 * 60 * 60 * 24), 
		hours: ms / (1000 * 60 * 60), 
		minutes: ms / (1000 * 60), 
		seconds: ms / (1000)
	}

	// Output
	return response;
}

Date.elapsedTime = function(time)
{
	return Date.toDate(new Date() - new Date(time));
}

/***************** ARRAY *****************/

function setArrayProperty(property, value)
{
	const descriptor =
	{
		writable: true, 
		enumerable: false,
		value
	};

	Object.defineProperty(Array.prototype, property, descriptor);
};

setArrayProperty("getObject", function(constraint) { 
	
	// Check that constraint is an object
	if(!isObject(constraint))
	{
		console.error(`WARNING: The input value "${constraint}" in method Array.getObject() is not an object. Returning null`);
		return null;
	}

	// Search for the object
	for (const element of this)
    {
		// If not an object, skip
		if(!isObject(element))
			continue;

		// Look for a match
		const match = constraint.entries().every( ([key,value]) => element[key] === value );

		// If found return object info
		if(match)
			return element;
    };

	// Otherwise return null to let the user know that the object hasn't been found
	return null;
});

setArrayProperty("getObjects", function(constraint) { 
	
	// Check that constraint is an object
	if(!isObject(constraint))
	{
		console.error(`WARNING: The input value "${constraint}" in method Array.getObject() is not an object. Returning []`);
		return [];
	}

	// Search for the objects
	this.reduce((acc, element) => {

		// If not an object, skip
		if(!isObject(element))
			return acc;

		// Look for a match
		const match = constraint.entries().every( ([key,value]) => element[key] === value );

		// If found append object info
		if(match)
			return [...acc, element];

	}, [])

	// Otherwise return an empty array to let the user know that no object has been found
	return [];
});

setArrayProperty("getObjectIndex", function(constraint) { 

	// Check that constraint is an object
	if(!isObject(constraint))
	{
		console.error(`WARNING: The input value "${constraint}" in method Array.getObject() is not an object. Returning -1`);
		return -1;
	}

	// Search for the object
	for (const [index, element] of this.entries())
	{
		// If not an object, skip
		if(!isObject(element))
			continue;

		// Look for a match
		const match = constraint.entries().every( ([key,value]) => element[key] === value );

		// If found return object info
		if(match)
			return index;
	};

	// Otherwise return -1 to let the user know that the object hasn't been found
	return -1;
});

setArrayProperty("getObjectsIndexes", function(constraint) { 

	// Check that constraint is an object
	if(!isObject(constraint))
	{
		console.error(`WARNING: The input value "${constraint}" in method Array.getObject() is not an object. Returning []`);
		return [];
	}

	// Search for the objects indexes
	this.reduce((acc, element, index) => {

		// If not an object, skip
		if(!isObject(element))
			return acc;

		// Look for a match
		const match = constraint.entries().every( ([key,value]) => element[key] === value );

		// If found append object index
		if(match)
			return [...acc, index];
			
	}, [])

	// Otherwise return an empty array to let the user know that no object has been found
	return [];

});

setArrayProperty("contains", function(constraints) 
{ 
	// Set proper format
	if(!isArray(constraints)) constraints = [constraints];

	// Arrays
	let functions = [];
	let literals = [];

	// Split constraints into an array of functions and an array of elements
	for(const element of this)
	{
		if(isFunction(element)) functions.push(element.prototype);
		else
		{
			literals.push(element);
			functions.push(element.__proto__);
		} 
	}

	// Iterate through the elements of the array
	for(const constraint of constraints)
	{
		// Set auxiliar booleans
		const compareFunctions = isFunction(constraint) && !functions.includes(constraint.prototype);
		const compareLiterals = !isFunction(constraint) && !literals.includes(constraint);

		// Return false if constraints doesn't apply
		if(compareFunctions || compareLiterals)
			return false;
	}

	// Otherwise return true
	return true;
});

setArrayProperty("containsStrict", function(elements) 
{ 
	// Set proper format
	if(!isArray(constraints)) constraints = [constraints];

	// Arrays
	let functions = [];
	let literals = [];

	// Split constraints into an array of functions and an array of elements
	for(const constraint of constraints)
	{
		if(isFunction(constraint)) functions.push(constraint.prototype);
		else literals.push(constraint)
	}

	// Iterate through the elements of the array
	for(const element of this)
	{
		// Set auxiliar booleans
		const compareFunctions = isFunction(element) && !functions.includes(element.prototype);
		const compareLiterals = !isFunction(element) && !literals.includes(element) && !functions.includes(element.__proto__);

		// Return false if constraints doesn't apply
		if(compareFunctions || compareLiterals)
			return false;
	}

	// Otherwise return true
	return true;
});

setArrayProperty("remove", function(elements) { 

	// Checkings
	if (isNumber(elements) || isString(elements)) elements = elements.toArray();

	// Filter
	elements.forEach( element =>
	{
		const index = this.indexOf(element);
		if(index != -1) this.splice(index, 1);
	});

	// Output
	return this;

});

setArrayProperty("toObject", function(prefix) { 

	return this.reduce((obj, element, index) => {
		obj[`${prefix}${index}`] = element;
		return obj;
	}, {})

});

setArrayProperty("pushSafe", function(element) {
	if(!this.includes(element))
		this.push(element);
});

setArrayProperty("isEmpty", function() {
	return this.length == 0;
});

setArrayProperty("pickRandom", function() { 
	return this[Math.floor(Math.random() * this.length)];
});

/***************** OBJECT *****************/

function setObjectProperty(property, value)
{
	const descriptor =
	{
		writable: true, 
		enumerable: false,
		value
	};

	Object.defineProperty(Object.prototype, property, descriptor);
};

setObjectProperty("owns", function(property) { 
	if(!isString(property)) throw "Property must be a string";
	return Object.prototype.hasOwnProperty.call(this, property)
});

setObjectProperty("keys", function() { 
	return Object.keys(this);
});

setObjectProperty("values", function() { 
	return Object.values(this);
});

setObjectProperty("entries", function() { 
	return Object.entries(this);
});

setObjectProperty("clone", function() { 
	if(isArray(this)) return this.concat();
	else return structuredClone(this);
});

setObjectProperty("concat", function(obj) { 
	if(!isObject(obj)) throw "You have to pass a valid object";
	return {...this, ...obj};
});

setObjectProperty("remove", function(property) { 
	if(this[property] == undefined) throw `Property ${property} does not exist in the object`;
	else delete this[property];
});

setObjectProperty("isEmpty", function() { 
	for(const key in this) 
	{
      	if (this.owns(key)) return false;
    }

    return true;
});

 /***************** FUNCTIONS *****************/

function getKeyFromValue(arr, value)
{
	const result = arr.entries().filter(([_, current_value]) => current_value == value);

	switch(result.length)
	{
		case 0:
			return result;
		case 1:
			return result[0][1];
		default:
			throw Error("The array you are trying to filter hasn't unique values");
			return result;
	}
	
};

function outOfRange(value, range)
{
	return value < range[0] || value > range[1];
};

function isNumber(x)
{
	return typeof(x) === 'number';
};

function isString(x)
{
	return typeof(x) === 'string';
};

function isBoolean(x)
{
	return typeof(x) === 'boolean';
};

function isArray(x)
{
	return Array.isArray(x);
};

function isFunction(x)
{
	return typeof x === "function";
};

function isObject(x)
{
	return typeof x === 'object' && x !== null && !isArray(x);
};

function joinTime(obj) 
{
	// Time units
	const timeUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];
	
	// Reduce
	let time = timeUnits.reduce((acc, unit) => {
		const number = obj[unit]
		if (number) 
		{
			let str = number.toString();
			if(number < 10) str = "0" + str
			acc.push(str);
		}
		return acc;
	}, []).join(':');

	// Last check
	if(time.length == 2) time = "00:" + time;

	// Output
	return time;
}

function getBiggestTime(obj) 
{
	const timeUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];
	for (let i = 0; i < timeUnits.length; i++) {
	  const unit = timeUnits[i];
	  if (obj[unit] && obj[unit] > 1) {
		return `${Math.floor(obj[unit])} ${unit}`;
	  }
	}
  }

if(typeof(window) == "undefined")
{
 	module.exports = {getKeyFromValue, isNumber, isString, isBoolean, isArray, isFunction, isObject, outOfRange, joinTime, getBiggestTime};
}
 