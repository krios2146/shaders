#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "ghostty.glsl"

#endif

const float GAMMA = 2.2;

const vec3 REC_709_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);
const vec3 REC_601_WEIGHTS = vec3(0.299, 0.587, 0.114);

const float LUMINANCE_THRESHOLD = 0.1;

const float BLUR_RADIUS = 3.0;

const float BLUR_OFFSET_START = BLUR_RADIUS * -1.0;
const float BLUR_OFFSET_END = BLUR_RADIUS;

const float SIGMA = BLUR_RADIUS / 3.0;

// aka encode
vec3 toSRGB(in vec3 colour) {
    return pow(colour, vec3(1.0 / GAMMA));
}

// aka decode
vec3 toLinear(in vec3 colour) {
    return pow(colour, vec3(GAMMA));
}

float luminance(in vec3 colour, in vec3 weights) {
    return dot(colour, weights);
}

float weight(in float x, in float y) {
    return exp(-1.0 * (x * x + y * y) / (2.0 * pow(SIGMA, 2.0)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;
    baseColour = vec4(toLinear(baseColour.rgb), baseColour.a);

    vec3 accumulator = vec3(0.0);
    float accumulatorWeights = 0.0;

    for (float x = BLUR_OFFSET_START; x <= BLUR_OFFSET_END; x++) {
        float xOffset = x / iResolution.x;
        for (float y = BLUR_OFFSET_START; y <= BLUR_OFFSET_END; y++) {
            float yOffset = y / iResolution.y;

            vec4 colour = texture(iChannel0, vec2(xOffset + uv.x, yOffset + uv.y));
            colour = vec4(toLinear(colour.rgb), colour.a);

            float lum = step(LUMINANCE_THRESHOLD, luminance(colour.rgb, REC_709_WEIGHTS));

            float weight = weight(x, y);
            accumulatorWeights += weight;
            accumulator += colour.rgb * lum * weight;
        }
    }

    accumulator = accumulator / accumulatorWeights;
    baseColour = vec4(baseColour.rgb + accumulator, baseColour.a);

    fragColor = vec4(toSRGB(baseColour.rgb), baseColour.a);
}
