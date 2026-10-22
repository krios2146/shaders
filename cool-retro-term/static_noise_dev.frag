#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float INTENSITY = 0.004;
const float RATE = 24.0;
const float BLOCK_SIZE = 3.0;

float hash(in vec3 p) {
    vec3 p3 = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float noise = hash(vec3(floor(fragCoord / BLOCK_SIZE), floor(iTime * RATE)));

    fragColor = vec4(baseColour.rgb + (INTENSITY * (noise - 0.5)), baseColour.a);
}
