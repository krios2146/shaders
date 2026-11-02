#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float STRENGTH = 0.5; // [0..1]
const float FREQUENCY = 10.0; // Updates per second [Hz]

float hash(in vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
/*
* Applies a block-based random jitter effect, displacing image samples
* horizontally and vertically
*/
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec2 pxSize = 1.0 / iResolution.xy;

    float frame = floor(iTime * FREQUENCY);

    // Tuned to mimic cool-retro-term
    float amplitudeX = 2.5;
    float amplitudeY = 0.5;
    float blockSize = 2.5;

    vec2 block = floor(fragCoord / blockSize);
    float random = mix(-1.0, 1.0, hash(vec3(frame, block)));

    float xShift = random * amplitudeX * pxSize.x;
    float yShift = random * amplitudeY * pxSize.y;

    uv += vec2(xShift, yShift) * STRENGTH;

    fragColour = texture(iChannel0, uv);
}
