//Terrain 10
/*
    In the same way we overlay light, we can also overlay other information.
    In real life, proximity to sea level isn't a guarantee of vegetation, so lets add a 'moisture' layer.
    We can then use this noise to modulate how green areas of the map are, irrespective of elevation.

    While we're at it, let's smooth the terrain a bit using a multiplicative approach.
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
    if(val > slvl){
        val = (val - slvl) * val + slvl
    }
    return val;
};
var Moisture = function (x, y) {
    noise.seed(moisture_seed);
	var harmonics = 1;
	var sum = 0;
	for(var i = 0; i < harmonics; i++){
		var freq = 250/(Math.pow(2,i))
		sum += Math.pow(0.5,i+1) * noise.simplex2(x/freq,y/freq,0)
	}
	return (sum + 1.0)/2.0;
};
var altitude_shader = function (x, y) {
    var value = getZ(x, y);
    if(value < slvl)
        return [0,value/2,value,1.0];
    return [value, value, value, 1.0];
};
var altitude_biome_shader = function (x,y){
    var alt = getZ(x,y);
    if(alt < slvl)
        return [0,alt/2,alt,1.0];

    if(alt < beach)
    {
        var nw = getZ(x-1,y-1);
        var se = getZ(x+1,y+1);
        var ne = getZ(x+1,y-1);
        var sw = getZ(x-1,y+1);
        var g1 = Math.abs(nw-se)
        var g2 = Math.abs(ne-sw)
        var cg = Math.min(g1,g2);
        var smoothness = 0.0015;
        
        if(cg < smoothness)
        {
            var sandiness = (smoothness - cg)/smoothness;
            var squeeze = 0.3;
            sandiness = (sandiness * (1.0 - squeeze)) + (squeeze)
            return [sandiness,sandiness,0.85*sandiness,1.0];
        }
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.15, 0.35, 0.10,1.0];
        return blend(vega,soil,alt);
    }
    else
    {
    	var moisture = Moisture(x,y);
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.15, 0.35, 0.10,1.0];
        return blend(vega,soil,(moisture + moisture + alt) / 3);
    }
}

var relief_shader = function(x,y){
    //Sun is toward the northwest
    var color = altitude_biome_shader(x,y);
    if(getZ(x,y) < slvl) return color;
    
    var contrast = Math.max(
        dotproduct(
            normalize(crossProduct([-0.01,0,getZ(x,y)-getZ(x+1,y)],[0,-0.01,getZ(x,y)-getZ(x,y+1)])),
            normalize([-1,0,1])),
        0);

    
    var sun = [contrast,contrast,contrast,1.0];
    return blend(sun,color,0.75);
}
var active_shader = relief_shader;
var altitude_seed = 4;
var moisture_seed = 8;
var slvl = 0.4;
var beach = slvl + 0.005;

draw(Altitude, active_shader);