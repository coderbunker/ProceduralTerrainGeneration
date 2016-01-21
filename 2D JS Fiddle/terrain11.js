//Terrain 11
/*
    Let's make this a world-map! To achieve this effect we'll have to

        - Raise the sea level to get continent-shapes
        - Use 3d noise
        - Project onto the map to get convincing distortion (we'll use a rectilinear projection)

    Set slvl to 0.6. 'x' and 'y' are now Latitude and Longitude, so far as we're concerned.

    First we have to make the left and right sides of the map loop. 
    We do this by switching to 3d noise and being clever with the coordinates we pass in.
*/
//Convert a pixel {x,y} to a coordinate {latitude, longitude}
function pxCoordToLatLng(x,y,width,height){
    //assumes width = 2 * height
    return {
        lat : Math.PI * ((y - (height/2)) / height),
        lon : Math.PI*2 * ((x - (width/2)) / width)
    }
}
//Convert a coordinate {latitude, longitude} to a position in 3-space {x,y,z}
function latLngTo3D(lat,lon,rad,alt)
{
    f  = 0 //flattening
    ls = Math.atan(Math.pow((1 - f),2) * Math.tan(lat))

    return {
        x : rad * Math.cos(ls) * Math.cos(lon),
        y : rad * Math.cos(ls) * Math.sin(lon),
        z : rad * Math.sin(ls)
    }
}
var Altitude = function (x, y) {

    noise.seed(altitude_seed);
    var harmonics = 5;
    var sum = 0;
    for(var i = 0; i < harmonics; i++){
        var freq = 100/(Math.pow(2,i))
        var latlng = pxCoordToLatLng(x,y,viewport.width,viewport.height);
        var pt3d = latLngTo3D(latlng.lat,latlng.lon,100);
        sum += Math.pow(0.5,i+1) * noise.perlin3(pt3d.x/freq,pt3d.y/freq,pt3d.z/freq)
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
		sum += Math.pow(0.5,i+1) * noise.simplex3(x/freq,y/freq,0)
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
var slvl = 0.55;
var beach = slvl + 0.005;

draw(Altitude, active_shader);