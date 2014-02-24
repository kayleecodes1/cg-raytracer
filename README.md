# Computer Graphics (CS4300) Assignment 6 - Fall 2012

For this assignment I just used the standard HTML5 canvas functionality. I also used jQuery and a library called Sylvester that does some matrix math which I used for computing cross products and various other things.

Any errors when reading files will be reported in the Javascript console of your browser (Ctrl + Shift + J in Google Chrome) or displayed in a pop-up using JavaScript's alert() function.

Links to the sample files are provided (which are in the /scenes directory) and clicking the 'Render' button next to each one will render that file. If you'd like to test any custom files, make sure to match the format of the files in /scenes.

The sample files include R, G, B inputs for Lights, however all lights will be white. Multi-colored lighting has not been implemented. On a similar note, numLights is a parameter in the sample files but it must be set to one. The raytracer has not been set up to handle multiple lights or no lights.

Also, the sample files include kgr (coefficient of global reflection) and kt (coefficient of transparency) as parameters for the spheres. This functionality has not yet been implemented, either, and these values will have no effect on the scene, though they are required.

One advanced feature that I DID implement is antialiasing. This attribute can be set to 0 (false) or 1 (true). If set to true, each pixel will be oversampled. The raytracer will shoot a grid of rays around the target pixel and average the sampled colors together. The effect is quite noticable. This is demonstrated by scene3.txt and scene4.txt. Scene 4 is a non-antialiased version of Scene 3.