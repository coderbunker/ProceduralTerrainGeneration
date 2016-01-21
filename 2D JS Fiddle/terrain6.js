//Terrain 6
/*
    We want a vibrant, green landscape with lots of plants near the coast, but rocky hill tops.
    We can achieve this by choosing a color of green and then blending it with the soil per-pixel.
    We will go straight off of altitude to say how much green should be at each location.
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
var altitude_biome_shader = function (x,y){
    var alt = getZ(x,y);
    if(alt < slvl)
        return [0,alt/2,alt,1.0];
    else
    {
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.15, 0.35, 0.10,1.0];
        return blend(vega,soil,alt);
    }
}
var active_shader = altitude_biome_shader;
var altitude_seed = 4;
var slvl = 0.4;

draw(Altitude, active_shader);