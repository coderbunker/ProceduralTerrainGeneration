//Globals
var Altitude = function (x, y) {
    noise.seed(altitude_seed);
	var harmonics = 5;
	var sum = 0;
	for(var i = 0; i < harmonics; i++){
		var freq = 100/(Math.pow(2,i))
		sum += Math.pow(0.5,i+1) * noise.perlin2(x/freq,y/freq,0)
	}
    var val = (sum + 1.0)/2.0;
    if(val >= slvl)//flatten surface a touch to wind erosion
    {
        return ((val - slvl) * val * val) + slvl
    } else return val;
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
    if(value < 0.4)
        return [0,value/2,value,1.0];
    return [value, value, value, 1.0];
};
var altitude_biome_shader = function (x,y){
	var alt = getZ(x,y);
    var moisture = Moisture(x,y);
    var beach = slvl + 0.0005;
    var treeline = 0.7;
    if(alt < slvl)
        return [alt/4+0.2,alt/2+0.2,alt+0.2,1.0];
    
    else if(alt < beach)
    {
        var nw = getZ(x-1,y-1);
        var se = getZ(x+1,y+1);
        var ne = getZ(x+1,y-1);
        var sw = getZ(x-1,y+1);
        var g1 = Math.abs(nw-se)
        var g2 = Math.abs(ne-sw)
        var cg = Math.min(g1,g2);
        var smoothness = 0.005;
        
        if(cg < smoothness)
        {
            var sandiness = (smoothness - cg)/smoothness;
            var squeeze = 0.3;
            sandiness = (sandiness * (1.0 - squeeze)) + (squeeze)
            return [sandiness,sandiness,0.85*sandiness,1.0];
        }
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.2,0.95,0.30,1.0];
        return blend(soil,vega,average(moisture,(1.0-alt)));
    }
    else if(alt < treeline)
    {
        var soil = [alt,(alt)/2,(alt)/3,1.0];
        var vega = [0.15, 0.35, 0.10,1.0];
        return blend(vega,soil,(moisture + moisture + alt) / 3);
    }
    else
        return [alt, alt, alt, 1.0];
}
var relief_shader = function(x,y){
    //Sun is toward the northwest
    var color = altitude_biome_shader(x,y);
    if(getZ(x,y) < slvl) return color;
    
    var contrast = Math.max(
        dotproduct(
            normalize(crossProduct([-0.01,0,getZ(x,y)-getZ(x+1,y)],[0,-0.01,getZ(x,y)-getZ(x,y+1)])),
            normalize([-100,0,100])),
        0);

    
    var sun = [contrast,contrast,contrast,1.0];
    if(x > 300) sun[3]=color[3]=1.0;
    return blend(sun,color,0.75);
}
var altitude_seed = 4;//Math.random();
var moisture_seed = 856;
var active_shader = relief_shader;
var heightmap;
var slvl = 0.40;

//Supporting Code
var viewport = {
    height: 400,
    width: 600,
    buffer: 10,
    zoom: 1,
    translation: {
        x: 0,
        y: 0
    }
}
function transition(value, maximum, start_point, end_point){
    return start_point + (end_point - start_point)*value/maximum
}
function blend(arr1,arr2,amount){
    var result = [];
    if(amount < 0) return arr1;
    if(amount > 1) return arr2;
    for(var i = 0; i < arr1.length; i++){
        result[i] = transition(amount,1.0,arr1[i],arr2[i])
    }
    return result
}
function gamma(array,amount){
    var result = [];
    for(var i = 0; i < array.length; i++)
    {
        return Math.pow(array[i],amount);
    }
    return result;
}
function average(){
    var sum = 0;
    for(var i = 0; i < arguments.length; i ++)
    {
        sum += arguments[i];
    }
    return sum/arguments.length;
}
function crossProduct(v1, v2) {
    var vR = [];
  vR[0] =   ( (v1[1] * v2[2]) - (v1[2] * v2[1]) );
  vR[1] = - ( (v1[0] * v2[2]) - (v1[2] * v2[0]) );
  vR[2] =   ( (v1[0] * v2[1]) - (v1[1] * v2[0]) );
    return vR;
}

function normalize(v1) {
    var vR = [];
  var fMag = Math.sqrt( Math.pow(v1[0], 2) +
                        Math.pow(v1[1], 2) +
                        Math.pow(v1[2], 2)
                      );

  vR[0] = v1[0] / fMag;
  vR[1] = v1[1] / fMag;
  vR[2] = v1[2] / fMag;
	return vR;
}
 function dotproduct(a,b) {
	var n = 0, lim = Math.min(a.length,b.length);
	for (var i = 0; i < lim; i++) n += a[i] * b[i];
	return n;
 }
function getZ(x,y){
    return heightmap[Math.floor(x)][Math.floor(y)];
}
function generateHeightmap(fn){
    heightmap = [];
    for(var i = -viewport.buffer; i < viewport.buffer + viewport.width; i ++)
    {
        heightmap[i] = [];
        for(var j = -viewport.buffer; j < viewport.buffer + viewport.height; j ++)
        {
            heightmap[i][j] = fn(i,j);
        }
    }
}
function draw(height_fn, shader) {
    if(!heightmap) generateHeightmap(height_fn);
    //noise.seed(seed);
    var canvas = document.getElementById("field");
    var ctx = canvas.getContext("2d");
    
    var st = new Date().getTime();
    for (var i = 0; i < viewport.width / viewport.zoom; i++) {
        for (var j = 0; j < viewport.height / viewport.zoom; j++) {
            var x = (i + viewport.translation.x) * viewport.zoom;
            var y = (j + viewport.translation.y) * viewport.zoom;
            var tuple = shader(x, y);
            ctx.fillStyle = 'rgba(' + (100 * tuple[0]) + '%,' + (100 * tuple[1]) + '%,' + (100 * tuple[2]) + '%,' + tuple[3] + ')';
            ctx.fillRect(x, y, viewport.zoom, viewport.zoom);
        }
    }
    console.log("RENDER TIME:",new Date().getTime() - st);
}
draw(Altitude, active_shader);

