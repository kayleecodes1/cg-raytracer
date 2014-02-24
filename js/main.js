///////////////////////////////
//                           //
//     UI & File Handling    //
//                           //
///////////////////////////////

// Handle submission of the file form
$('#fileForm').submit(function()
{
	// Retrieve the form data
	var formData = new FormData($('#fileForm').get(0));
	
	// Create and open an XHR
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'upload.php');
	
	// Set up event listener to wait for a response
	xhr.onreadystatechange = function()
	{
		// If the XHR returns with data
		if(xhr.readyState == 4)
		{
			// Render the triangles if it came
			// back without an error
			if(xhr.responseText != 'error')
			{
				parseTextFile(xhr.responseText);
			}
			// Otherwise, report the error
			else
			{
				alert('There was an error reading the file.');
			}
		}
	};
	
	// Send the request
	xhr.send(formData);
	
	// Prevent the form from submitting
	return false;
});

// Parse a text file containing scene data
function parseTextFile(txt)
{
	// Set up the variables
	var viewpoint = null;
	var antialiasing = -1;
	var numLights = -1;
	var lights = [];
	var numSpheres = -1;
	var spheres = [];
	
	// Break the text input into its lines
	var txt_lines = txt.split("\n");
	
	// Process all of the lines of the text input
	for(var i = 0; i < txt_lines.length; i++)
	{
		// The line being parsed
		var line = txt_lines[i];
		
		// Remove any comments from the line
		var comment_index = line.indexOf('//');
		if(comment_index != -1)
		{
			line = line.substring(0, comment_index);
		}
		
		// Trim the line
		line = $.trim(line);
		
		// Attempt to interpret the
		// line if it is not empty
		if(line != '')
		{
			// Catch any errors that occur
			try
			{
				// The elements of the line
				var elements = line.split(/\s+/);
				
				// Read the viewpoint coordinates
				if(viewpoint === null)
				{
					viewpoint = {
						x: parseFloat(elements[0]),
						y: parseFloat(elements[1]),
						z: parseFloat(elements[2])
					};
				}
				// Read the antialiasing option
				else if(antialiasing === -1)
				{
					antialiasing = parseInt(elements[0]);
				}
				// Read the number of lights
				else if(numLights === -1)
				{
					numLights = parseInt(elements[0]);
				}
				// Read the lights
				else if(lights.length < numLights)
				{
					lights.push(new Light(parseFloat(elements[0]),
						parseFloat(elements[1]), parseFloat(elements[2]),
						parseFloat(elements[3]), parseFloat(elements[4]),
						parseFloat(elements[5]))
					);
				}
				// Read the number of spheres
				else if(numSpheres === -1)
				{
					numSpheres = parseInt(elements[0]);
				}
				// Read the spheres
				else if(spheres.length < numSpheres)
				{
					spheres.push(new Sphere(parseFloat(elements[0]),
						parseFloat(elements[1]), parseFloat(elements[2]),
						parseFloat(elements[3]), parseFloat(elements[4]),
						parseFloat(elements[5]), parseFloat(elements[6]),
						parseFloat(elements[7]), parseFloat(elements[8]),
						parseFloat(elements[9]), parseFloat(elements[10]),
						parseFloat(elements[11]), parseFloat(elements[12]))
					);
				}
				// All of the data has been gathered
				else
				{
					break;
				}
			}
			catch(err)
			{
				alert('Error while parsing text file.')
			}
		}
	}
	
	// Create the scene based on the
	// data parsed from the text file
	var scene = new Scene(viewpoint, antialiasing, spheres, lights);
	
	// Render the created scene
	scene.render();
}

// Renders the given pre-made scene text file
function renderScene(n)
{
	// Get the contents of the text file
	// and hand it to the parseTextFile fxn
	$.get("scenes/scene" + n + ".txt", function(d){ parseTextFile(d); });
	
	// Prevent any forms from submitting
	return false;
}

///////////////////////////////
//                           //
//      Global Variables     //
//                           //
///////////////////////////////

// Create the JavaScript canvas
var VIEWPORT_WIDTH = 512;
var VIEWPORT_HEIGHT = 512;
var VIEWPORT = $('#viewport').get(0).getContext('2d');

// The background plane color
var BG_COLOR = {
	r: .5,
	g: .5,
	b: .5
};

///////////////////////////////
//                           //
//          Classes          //
//                           //
///////////////////////////////

// A class to represent a scene
function Scene(viewpoint, antialiasing, spheres, lights)
{
	// The viewpoint for the Scene
	this.viewpoint = viewpoint;
	
	// Antialiasing
	this.antialiasing = antialiasing;
	
	// An array of Spheres in the Scene
	this.spheres = spheres;
	// An array of Lights in the Scene
	this.lights = lights;
	
	// Render this Scene to the viewport
	this.render = function()
	{
		// Clear the viewport
		VIEWPORT.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
		
		// For each scanline in the image ...
		for(var y = 0; y < VIEWPORT_WIDTH; y++)
		{
			// For each pixel in the scanline ...
			for(var x = 0; x < VIEWPORT_HEIGHT; x++)
			{					
				// Get the pixel color
				var pixelColor_final = this.pixelColor(x, y);
				
				// If antialiasing is on, use supersampling
				// to smooth the color of the pixel
				if(this.antialiasing)
				{
					// Generate an array containing the
					// sampled colors from rays surrounding
					// the pixel being sampled (uses a grid
					// algorithm, sampling each corner of
					// pixels and subpixels)
					var colors = [];
					colors.push(this.pixelColor(x - .5, y + .5));
					colors.push(this.pixelColor(x, y + .5));
					colors.push(this.pixelColor(x + .5, y + .5));
					colors.push(this.pixelColor(x - .5, y));
					colors.push(pixelColor_final);
					colors.push(this.pixelColor(x + .5, y));
					colors.push(this.pixelColor(x - .5, y - .5));
					colors.push(this.pixelColor(x, y - .5));
					colors.push(this.pixelColor(x + .5, y - .5));
					
					// Initialize the new rgb values for the pixel
					var r = 0;
					var g = 0;
					var b = 0;
					
					// Add all of the sampled colors together
					for(var i = 0; i < colors.length; i++)
					{
						r = r + colors[i].r;
						g = g + colors[i].g;
						b = b + colors[i].b;
					}
					
					// Average the added colors
					r = r / 9;
					g = g / 9;
					b = b / 9;
					
					// Set the new final color of the pixel
					pixelColor_final = {r: r, g: g, b: b};
				}
				
				// Render the pixel
				VIEWPORT.fillStyle = 'rgb(' +
					Math.floor(pixelColor_final.r * 255) + ',' +
					Math.floor(pixelColor_final.g * 255) + ',' +
					Math.floor(pixelColor_final.b * 255) +
				')';
				VIEWPORT.fillRect(x, y, 1, 1);
			}
		}
	}
	
	// Given a ray, determine the pixel color
	this.pixelColor = function(x, y)
	{
		// The ray from the viewpoint
		// through the given pixel
		var ray = {
			p0: viewpoint,
			p1: {x: x, y: y, z: 0}
		};
		
		// Initialize the closest object
		var closest = null;
		// Initialize the intersection point variable
		var intersection = false;
		// Initialize a variable to track the position
		// along the ray for the most recently checked object
		var t = 1.1;
		
		// For each object in the scene ...
		for(var i = 0; i < this.spheres.length; i++)
		{
			// Find where the ray intersects the current object
			var temp_intersection = raySphereIntersect(ray, this.spheres[i]);
			
			// If the object is intersected and is
			// the closest considered thus far, record
			// the position along the ray and the object
			if(temp_intersection !== false && temp_intersection.t < t)
			{
				closest = i;
				intersection = temp_intersection;
				t = intersection.t;
			}
		}
		
		// An object was intersected
		if(closest !== null)
		{
			// Return the pixel's color as the color
			// of the intersected object, taking
			// lighting into account
			return this.spherePixelColor(closest, intersection);
		}
		// If no object was intersected...
		else
		{
			// Return the pixel's color as the background color
			return this.bgPixelColor(x, y);
		}
	}
	
	// Given a sphere, an array of other spheres in the
	// scene, a point on the sphere, and a light, returns
	// the pixel color for that point as an object
	this.spherePixelColor = function(closest, intersection)
	{
		// The closest sphere, which we're dealing with
		var sphere = this.spheres[closest];
		
		// The x, y, z coordinates of the intersection
		var x = intersection.x;
		var y = intersection.y;
		var z = intersection.z;
		
		// Is the pixel in shadow?
		var inShadow = false;
		
		// The ray from the point on the sphere to the light
		var ray = {
			p0: {x: x, y: y, z: z},
			p1:{x: this.lights[0].lx, y: this.lights[0].ly, z: this.lights[0].lz}
		};
		
		// Intersect the ray with each other sphere in the scene ...
		for(var i = 0; i < this.spheres.length; i++)
		{
			// Skip the sphere we're dealing with
			if(i == closest){ continue; }
			
			// If the ray intersects a sphere,
			// the sphere's pixel is in shadow
			var intersect = raySphereIntersect(ray, this.spheres[i]);
			if(intersect !== false && intersect.t >= 0 && intersect.t <= 1)
			{
				inShadow = true;
				break;
			}
		}
		
		// If the pixel is in shadow, use the ambient color
		if(inShadow)
		{
			// Set the rgb values for the pixel
			var r = (sphere.ka * sphere.r);
			var g = (sphere.ka * sphere.g);
			var b = (sphere.ka * sphere.b);
		}
		// If the pixel is not in shadow, use diffuse shading
		else
		{
			// The normal vector to the sphere from the point
			var n = sphereNormalVector(sphere, x, y, z);
			// The unit vector from the point to the light
			var l = unitVector(x, y, z, this.lights[0].lx, this.lights[0].ly, this.lights[0].lz);
			
			// The lighting factor
			var factor = n.dot(l);
			
			// If there is a non-zero specular
			// coefficient, compute the highlight factor
			if(sphere.ks != 0)
			{
				// The unit vector from the point to the viewpoint
				var v = unitVector(x, y, z, this.viewpoint.x, this.viewpoint.y, this.viewpoint.z);
				// The halfway vector
				var hi = l.add(v);
				var h = hi.multiply(1 / vectorLength(hi));
				// The highlight factor
				var hf = Math.pow(h.dot(n), sphere.e);
			}
			// If the specular coefficient is zero,
			// do not calculate the highlight factor
			else
			{
				var hf = 0;
			}				
			
			// Set the rgb values for the pixel
			var r = (sphere.kd * factor * sphere.r) +
				(sphere.ka * sphere.r) + (sphere.ks * hf);
			var g = (sphere.kd * factor * sphere.g) +
				(sphere.ka * sphere.g) + (sphere.ks * hf);
			var b = (sphere.kd * factor * sphere.b) +
				(sphere.ka * sphere.b) + (sphere.ks * hf);
		}
		
		// Return the pixel's rgb value as an object
		return {r: r, g: g, b: b};
	}
	
	// Given an array of spheres, the x-y coordinate in
	// the viewport, and a light, calculates the background
	// color at that point and returns it as an object
	this.bgPixelColor = function(x, y)
	{
		// The ray from the point on the
		// background to the given light
		var ray = {
			p0: {x: x, y: y, z: 0},
			p1:{x: lights[0].lx, y: lights[0].ly, z: lights[0].lz}
		};
		
		// If the ray does not intersect any spheres,
		// the background pixel is not in shadow
		var r = BG_COLOR.r;
		var g = BG_COLOR.g;
		var b = BG_COLOR.b;
		
		// Intersect the ray with each sphere in the scene ...
		for(var i = 0; i < this.spheres.length; i++)
		{
			// If the ray intersects a sphere,
			// the background pixel is in shadow
			if(raySphereIntersect(ray, this.spheres[i]) !== false)
			{
				var r = BG_COLOR.r / 2;
				var g = BG_COLOR.g / 2;
				var b = BG_COLOR.b / 2;
				break;
			}
		}
		
		// Return the rgb value of the pixel as an object
		return {r: r, g: g, b: b};
	}
}

// A class to represent a sphere
function Sphere(cx, cy, cz, radius, r, g, b, ka, kd, ks, e, kgr, kt)
{
	// X, Y, and Z coordinates
	this.cx = cx;
	this.cy = cy;
	this.cz = cz;
	// Radius
	this.radius = radius;
	// RGB values
	this.r = r;
	this.g = g;
	this.b = b;
	// Light coefficients
	this.ka = ka;	// Ambient light coefficient
	this.kd = kd;	// Diffuse coefficient
	this.ks = ks;	// Specular coefficient
	this.e = e;		// Specular exponent
	this.kgr = kgr;	// Global reflection coefficient
	this.kt = kt;	// Transparency coefficient
}

// A class to represent a light
function Light(lx, ly, lz, r, g, b)
{
	// X, Y, and Z coordinates
	this.lx = lx;
	this.ly = ly;
	this.lz = lz;
	// RGB values
	this.r = r;
	this.g = g;
	this.b = b;
}

///////////////////////////////
//                           //
//      Helper Functions     //
//                           //
///////////////////////////////

//////////////////////
// VISIBLE SURFACES //
//////////////////////

// Given a ray and a sphere, determine the
// corodinates of the their intersection,
// return false if they do not intersect
function raySphereIntersect(ray, sphere)
{
	// The ray sphere intersection calculations
	var p0 = ray.p0;
	var p1 = ray.p1;
	
	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;
	var dz = p1.z - p0.z;
	
	var a = dx * dx + dy * dy + dz * dz;
	var b = 2 * dx * (p0.x - sphere.cx) +
			2 * dy * (p0.y - sphere.cy) +
			2 * dz * (p0.z - sphere.cz);
	var c = sphere.cx * sphere.cx + sphere.cy * sphere.cy +
			sphere.cz * sphere.cz + p0.x * p0.x +
			p0.y * p0.y + p0.z * p0.z +
			-2 * (sphere.cx * p0.x +
					sphere.cy * p0.y +
					sphere.cz * p0.z) -
			sphere.radius * sphere.radius;
	
	var dabc = Math.pow(b, 2) - 4 * a * c;
	
	// There is an intersection
	if(dabc >= 0)
	{
		var t = (-b - Math.sqrt(dabc)) / (2 * a);
		var intersection = {
			x: p0.x + t * dx,
			y: p0.y + t * dy,
			z: p0.z + t * dz,
			t: t
		}
		return intersection;
	}
	// There is no intersection
	else
	{
		return false;
	}
}

// Takes a Sylvester 3D Vector object
// and computes its length / magnitude
function vectorLength(v)
{
	// Determines the length of the
	// given vector and returns it
	return Math.sqrt(
		Math.pow(v.elements[0], 2) +
		Math.pow(v.elements[1], 2) +
		Math.pow(v.elements[2], 2)
	);
}

// Finds the unit normal vector to the
// given sphere from the point x, y, z
function sphereNormalVector(sphere, x, y, z)
{
	var nx = x - sphere.cx;
	var ny = y - sphere.cy;
	var nz = z - sphere.cz;
	var n = Vector.create([
		nx / sphere.radius,
		ny / sphere.radius,
		nz / sphere.radius
	]);
	return n;
}

// Finds a unit vector from the first given
// point to the second given point, return it
function unitVector(x0, y0, z0, x1, y1, z1)
{
	var vi = Vector.create([
		x1 - x0,
		y1 - y0,
		z1 - z0
	]);
	var v = vi.multiply(1 / vectorLength(vi));
	return v;
}