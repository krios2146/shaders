#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../../ghostty_uniforms.glsl"

#endif // end of the dev setup

const float STRENGTH = 0.1; // [0..1]

const float FREQUENCY = 10.0; // Updates per second [Hz]
const float BLOCK_SIZE_PX = 3.0;

float hash(in vec3 p) {
    vec3 p3 = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/*
* Applies monochromatic, spatially uniform noise to the image
*
* TODO: Make noise spatially non-uniform: decrease block size and effect strength
* with increasing distance from the screen centre
*/
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec4 baseColour = texture(iChannel0, uv);

    float frame = floor(iTime * FREQUENCY);
    vec2 block = floor(fragCoord / BLOCK_SIZE_PX);

    float noise = hash(vec3(block, frame));
    float offset = STRENGTH * (noise - 0.5);

    vec3 noisyColour = mix(baseColour.rgb, baseColour.rgb + offset, 0.05);

    fragColor = vec4(noisyColour, baseColour.a);
}
