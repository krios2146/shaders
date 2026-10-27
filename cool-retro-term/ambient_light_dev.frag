#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float STRENGTH = 0.2; // [0..1]
const float RADIUS = 0.65; // [0..1] uv units

const int AMBIENT_COLOUR = 0xFFFFFF;

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 256.0;
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    vec2 centre = vec2(0.5);
    float strength = clamp(STRENGTH, 0.0, 1.0) * 0.015; // Scale light strength to 1.5% of its maximum

    float distanceToEdges = 1.0 - distance(uv, centre);
    float ambientLight = smoothstep(1.0 - RADIUS, 1.0, distanceToEdges) * strength;

    vec3 ambientColour = mix(baseColour.rgb, hexToRGB(AMBIENT_COLOUR), ambientLight);

    fragColour = vec4(ambientColour, baseColour.a);
}
