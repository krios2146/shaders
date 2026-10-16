#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "ghostty.glsl"

#endif // end of the dev setup

float hash2to1(in vec2 p) {
    vec3 p3 = fract(vec3(p.xyx * 0.1031));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash3to1(in vec3 p3) {
    p3 = fract(p3 * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// for lineJitter only
const float ROW_HEIGHT = 2.0;

const float RATE = 20.0;
const float AMPLITUDE_X = 1.75;
const float AMPLITUDE_Y = 0.5;
const float STRENGTH = 0.5;
const float BLOCK_SIZE = 2.5;

void lineJitter(inout vec2 uv, in float y) {
    float line = floor(y / ROW_HEIGHT);
    float frame = floor(iTime * RATE);

    vec2 pixelSize = 1.0 / iResolution.xy;
    // hashing & turning 0..1 to -1..1
    // without this pixels will shift only to the right and half the range
    float hash = mix(-1.0, 1.0, hash2to1(vec2(line, frame)));
    float shift = hash * AMPLITUDE_X * pixelSize.x;

    uv.x += shift * STRENGTH;
}

void fullJitter(inout vec2 uv, in vec2 xy) {
    float frame = floor(iTime * RATE);

    vec2 pixelSize = (1.0 / iResolution.xy);
    // hashing & turning 0..1 to -1..1
    // without this pixels will shift only to the right and half the range
    float hash = mix(-1.0, 1.0, hash3to1(vec3(frame, xy)));
    float xShift = hash * AMPLITUDE_X * pixelSize.x;
    float yShift = hash * AMPLITUDE_Y * pixelSize.y;

    uv += vec2(xShift, yShift) * STRENGTH;
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    fullJitter(uv, floor(fragCoord / BLOCK_SIZE));

    vec4 baseColour = texture(iChannel0, uv).rgba;
    fragColour = baseColour;
}
