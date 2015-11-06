# Workshop - Procedural Terrain & Population Generation

Learn about common procedural generation using noise and harmonics to quickly and convincingly create virtual landscapes!

## Objectives

- Learn about Noise functions and their various properties
- Familiarity with Uniform, Perlin, and Simplex noise
- Learn concept of harmonics to emulate natural regimes of complexity (fractal noise)
- Successfully render a heightmap, and gain familiarity with its parameters
- Discuss various useful real-world simplifications of climate, fertility, and temperature
- Implement a biome map using multiplied heightmaps of altitude, moisture, and temperature
- Place population centers on the map according to altitude and power distributions
- Discuss further steps and experiment

## Required Materials

- Laptop with internet connection to workshop's Terrain Editor webpage
- Very rudimentary knowledge of Javascript syntax (variable assignment, loops, function invocation)

## Part 1 : Principles of Noisy Procedural Generation

In this section we learn the basics of one of the most powerful tools for generating procedural landscapes: noise functions.

### Motivation: Create natural-looking landscapes and maps

Making convincing maps uses many fundamental techniques in procedural content generation, and quickly shows concerns such as performance, realism, and resolution trade-offs. People also have a pretty good intuition for how a landscape should 'look', which provides a rich source of refinements and thoughts on how the algorithm can be changed.

#### General Structure of Landscape

Landscapes are

#### Natural Formation Processes

#### Randomness as a Stand-In for Complexity

### What is 'Noise'?

#### Random Noise

#### Perlin Noise

#### Simplex Noise

### Order from Noise : Fractal noise and realistic landscapes

#### Landscape is Not Simple Noise: Heirarchy of Processes

#### Noise Harmonics to achieve 'Fractalness'

## Part 2 : Hands-On World Raising

In this section we crack open an editor and try to create a terrain heightmap that might pop out of an atlas.

### 5-min Javascript primer & Brief Explanation of Terrain Editor Panel

#### Basic Syntax Review

#### Terrain Editor usage (Code, Compile, Regenerate)

### Invoking the noise function: 'Too Random World'

#### Generate terrains with Random, Simplex, and Perlin noise functions

#### Playing with altitude shader

### Adding fractal harmonics

#### Uniformly distributed harmonics

#### Improvement: Exponential harmonics

## Part 3 : Terraforming

In this section we see how we can composite multiple random maps to add dimensional information to our world.

### Creating a terrain shader

#### Modify altitude shader to have a 'sea level' cut-off

#### Modify altitude shader to have a 'tree line'

#### Modify altitude shader to 'green' based on distance from 'sea level'

### Creating a temperature map

#### Combining multiple semantic maps to add dimension

#### Add an independent heightmap of temperature, and 'degreen' based on temperature value

### Creating a moisture map

#### Create a moisture map based on a transformation of the terrain map

#### Quick performance considerations

### Compositing multiple layers

#### Defining a composite shader

#### Considerations for weighting of factors

## Part 4 : Populating

In this section we have a bit of fun working with distributing elements (settlements in this case) over a probability field.

### Useful heuristics for population location

### Distributing set number of elements over a probability field

### Populating the map

## Part 5 : Wrap-up

In this section we point to some other avenues of interest

### Erosion

### Change over time

### Voxellation