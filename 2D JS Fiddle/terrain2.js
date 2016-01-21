//Terrain 2
/*
	Random noise is quite boring for our purposes: it is just TV static. So we will change our altitude function.
	We will use a kind of noise called Perlin Noise, which makes local areas of the noise 'smooth'.
	The smoothness we see is dominated by the frequency: we will play with a couple different frequencies.

	Finally, our perlin function outputs in -1.0 -> 1.0, so we have to map it to 0.0 -> 1.0
*/
var Altitude = function (x, y) {

    noise.seed(altitude_seed);
    var freq = 100;
    var sum = noise.perlin2(x/freq,y/freq) 
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