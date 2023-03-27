
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

/***************** STRING *****************/

String.prototype.toArray = function()
{
	return [this.valueOf()];
};

String.prototype.reverse = function()
{
	return [...this].reverse().join("");	
}

/***************** DATE *****************/

Date.prototype.getTime2 = function() 
{
	return `${this.getHours().toString().padStart(2,"0")}:${this.getMinutes().toString().padStart(2, "0")}`
};

Date.prototype.getDate2 = function() 
{
	return `${this.getDay().toString().padStart(2,"0")}/${this.getMonth().toString().padStart(2, "0")}/${this.getFullYear()}`;
};

/***************** ARRAY *****************/

Array.prototype.getObject = function(constraint)
{
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
};

Array.prototype.getObjects = function(constraint)
{
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
};

Array.prototype.getObjectIndex = function(constraint)
{
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
};

Array.prototype.getObjectsIndexes = function(constraint)
{
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
};

Array.prototype.toObject = function(prefix)
{
	return this.reduce((obj, element, index) => {
		obj[`${prefix}${index}`] = element;
		return obj;
	}, {})
};

Array.prototype.remove = function(elements)
{
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
};

Array.prototype.clone = function()
{
	return this.concat();
};

Array.prototype.isEmpty = function()
{
	return this.length == 0;
};

Array.prototype.pickRandom = function()
{
	return this[Math.floor(Math.random() * this.length)];
}

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
	return structuredClone(this);
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

function getTime()
{
	const date = new Date();
	return date.getTime2();
}

function getDate()
{
	const date = new Date();
	return date.getDate2();
}

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

/*

check({});
check(0);
check(null);
check(undefined);
check("");
check("gol");
check(() => {});
check([]);
check(true);
check(BigInt(9007199254740991));
check(Symbol("foo"));

function check(x)
{
	console.log(isObject(x));
}

*/


if(typeof(window) == "undefined")
{
 	module.exports = {getTime, getDate, getKeyFromValue, isNumber, isString, isBoolean, isArray, isFunction, isObject, outOfRange};
}
 