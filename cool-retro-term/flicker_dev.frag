#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "ghostty.glsl"

#endif // end of the dev setup

const float STRENGTH = 0.4;
const float RATE = 15.0;

float hash(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float random = hash(floor(iTime * RATE));
    float flicker = 1.0 - random * STRENGTH;

    fragColour = vec4(baseColour.rgb * flicker, baseColour.a);
}
