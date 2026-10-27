#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float STRENGTH = 1.4; // [0..1]
const float FREQUENCY = 10.0; // Flicker updates per second

float hash(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float random = hash(floor(iTime * FREQUENCY));
    float flicker = 1.0 - random * clamp(STRENGTH, 0.0, 1.0);

    fragColour = vec4(baseColour.rgb * flicker, baseColour.a);
}
