//Terrain 12
/*
    We've got something round, but the scale of stuff feels off. Let's change and play with parameters.

        - We'll change the relief scale a bit
        - We'll up the altitude frequency and moisture
        - We'll add a temperature map based on latitude

    We will directly blend in some 'snowiness' based on latitude.
    We also green up the equator using the moisture map and latitude.
    Further, we'll remove the beaches for now.
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
        sum += Math.pow(0.5,i+1) * noise.simplex3(pt3d.x/freq,pt3d.y/freq,pt3d.z/freq)
    }
    var val = (sum + 1.0)/2.0;
    if(val > slvl){
        val = ((val - slvl) * val * val) + slvl
    }
    else val = slvl - ((slvl-val) * ((slvl-val)/slvl))
    return val;
};
var Moisture = function (x, y) {
    noise.seed(moisture_seed);
    var harmonics = 1;
    var sum = 0;
    for(var i = 0; i < harmonics; i++){
        var freq = 35/(Math.pow(2,i))
        sum += Math.pow(0.5,i+1) * noise.simplex3(x/freq,y/freq,0)
    }

    var distance_from_equator  = Math.abs(viewport.height/2 - y);
    var val =  distance_from_equator/(viewport.height/2);

    return ((sum + 1.0)/2.0)*val;
};
var Temperature = function(x, y) {
    var distance_from_equator  = Math.abs(viewport.height/2 - y);
    var val =  distance_from_equator/(viewport.height/2);
    return val * val//quadratic fall off
}
var altitude_shader = function (x, y) {
    var value = getZ(x, y);
    if(value < slvl)
        return [0,value/2,value,1.0];
    return [value, value, value, 1.0];
};
var altitude_biome_shader = function (x,y){
    var alt = getZ(x,y);
    if(alt < slvl)
    {
        if(Temperature(x,y) > alt * 1.2)
            return [1.0,1.0,1.0,1.0];
        else
        {
            var depth = alt / slvl
            return [depth*0.2,depth*0.3,depth*0.4,1.0];
        }
    }
    else
    {
        var moisture = Moisture(x,y);
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.15, 0.35, 0.10,1.0];
        var cold = [1.0, 1.0, 1.0, 1.0];
        return blend(blend(vega,soil,(moisture + moisture + alt) / 3),cold,Temperature(x,y));
    }
}

var relief_shader = function(x,y){
    //Sun is toward the northwest
    var color = altitude_biome_shader(x,y);
    if(getZ(x,y) < slvl) return color;
    
    var contrast = Math.max(
        dotproduct(
            normalize(crossProduct([-0.03,0,getZ(x,y)-getZ(x+1,y)],[0,-0.03,getZ(x,y)-getZ(x,y+1)])),
            normalize([-1,0,1])),
        0);

    
    var sun = [contrast,contrast,contrast,1.0];
    return blend(sun,color,0.75);
}
var active_shader = relief_shader;
var altitude_seed = Math.random();
var moisture_seed = 8;
var slvl = 0.57;
var beach = slvl + 0.005;

draw(Altitude, active_shader);