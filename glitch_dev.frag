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

const float ROW_HEIGHT = 5.0;
const float RATE = 20.0;

const float AMPLITUDE_X = 50.0;
const float STEP = 20.0;

const float ANCHOR_ROWS = 5.0;
const float ROUGHNESS = 0.1;

const float TRESHOLD = 0.55;

// NOTE: I have no idea what is happening here,
// but it doesn't look like a horizontal sync from the cool-retro-term
// that I wanted to recreate

// FIX: Naming is awful
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    vec2 pixelSize = 1.0 / iResolution.xy;
    float frame = floor(iTime * RATE);
    float rowIdx = floor(fragCoord.y / ROW_HEIGHT);

    float t = rowIdx / ANCHOR_ROWS;
    float cell = floor(t);
    float f = fract(t);

    float a = (hash2to1(vec2(cell, frame)) * 2.0 - 1.0);
    float b = hash2to1(vec2(cell + 1.0, frame)) * 2.0 - 1.0;

    float v = mix(a, b, f);

    float rough = (hash2to1(vec2(rowIdx, frame)) * 2.0 - 1.0) * ROUGHNESS;

    float gate = step(1.0 - TRESHOLD, hash2to1(vec2(frame, 7.0)));
    float shift = round((v + rough) * AMPLITUDE_X / STEP) * STEP * gate;

    uv.x += shift * pixelSize.x;

    vec4 baseColour = texture(iChannel0, uv).rgba;
    fragColour = baseColour;
}
