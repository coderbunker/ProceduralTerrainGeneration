//Terrain 1
/*
	We start out with a completely random field of noise. This demo already has some
	stuff working behind the scenes. In principle though, our javascript must:

		- Provide a heightmap function that provides a percentage (Range: 0.0 -> 1.0)
		- Provide a shading function that returns an RGBA color array in percentage (Range: [0.0 -> 1.0, ...])

	Our heightmap function `Altitude` takes a x-y coordinate and returns a random number between 0 and 1.
	Our altitude shader returns an opaque gray color whose tone is equal to the altitude of the location.
*/

var Altitude = function (x, y) {
    return Math.random();
};
var altitude_shader = function (x, y) {
    var value = getZ(x, y);
    return [value, value, value, 1.0];
};
var heightmap = undefined;
var active_shader = altitude_shader;

draw(Altitude, active_shader);

