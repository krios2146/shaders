#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const vec3 REC_709_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);
const vec3 REC_601_WEIGHTS = vec3(0.299, 0.587, 0.114);

const vec3 FOREGROUND_COLOUR = vec3(0.0, 1.0, 0.0);
const vec3 BACKGROUND_COLOUR = vec3(0.0);

const float SATURATION = 1.75;
const float COLOUR_RETENTION = 0.0;

float luma(in vec3 colour, in vec3 weights) {
    return dot(colour, weights);
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float luma = luma(baseColour.rgb, REC_709_WEIGHTS);

    vec3 foregroundColour = mix(FOREGROUND_COLOUR, vec3(1.0), (1.0 - SATURATION) * 0.5);
    foregroundColour = mix(foregroundColour, baseColour.rgb * foregroundColour / max(luma, 1e-5), COLOUR_RETENTION);

    fragColour = vec4(mix(BACKGROUND_COLOUR, foregroundColour, luma), baseColour.a);
}
