//Terrain 4
/*
    Now that we have some useful complexity in our noise, let's begin the work of making it look like a map.
    The easiest thing to do will be to color the low lying areas the color of water.
    We can change color by having differently proportioned RGB values.
    Play around with `slvl` and see how we can move the 'sea level' up and down, getting different looks.
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
    if(value < slvl)
        return [0,value/2,value,1.0];
    return [value, value, value, 1.0];
};
var active_shader = altitude_shader;
var altitude_seed = 4;
var slvl = 0.4;

draw(Altitude, active_shader);