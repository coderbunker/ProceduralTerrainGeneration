//Terrain 3
/*
	Perlin noise straight out of the function still doesn't have too much complexity to it.
	Here, we will add up perlin noise of different frequencies, and weigh each frequency at different strengths.
	We will choose a quadratic distribution of harmonics: we double the frequency and halve its weight each step.
	This has the convenient property of converging to a total weight of 1.0 without us having to normalize.
*/
var Altitude = function (x, y) {

    noise.seed(altitude_seed);
	var harmonics = 5;
	var sum = 0;
	for(var i = 0; i < harmonics; i++){
		var freq = 100/(Math.pow(2,i))
		sum += Math.pow(0.5,i+1) * noise.perlin2(x/freq,y/freq,0)
	}
    var val = (sum + 1.0)/2.0;
    return val;
};
var altitude_shader = function (x, y) {
    var value = getZ(x, y);
    return [value, value, value, 1.0];
};
var active_shader = altitude_shader;
var altitude_seed = 4;

draw(Altitude, active_shader);