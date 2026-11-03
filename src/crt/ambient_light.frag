#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../../ghostty_uniforms.glsl"

#endif // end of the dev setup

const float STRENGTH = 1.0; // [0..1]
const float RADIUS = 0.65; // [0..1] uv units

const int AMBIENT_COLOUR = 0xFFFFFF;

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 255.0;
}

/*
* Shader imitates the physical light source shining on the centre of the screen
*
* This is very simple implementation that doesn't take into account:
* - material reflectance of the screen
* - direction (always centre)
* - inverse-square distance falloff
*
* It also performs color interpolation in sRGB space instead of linear
* color space for simplicity
*/
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float strength = clamp(STRENGTH, 0.0, 1.0) * 0.015; // [0..0.015]; limit light strength to 1.5%
    float distanceToCentre = distance(uv, vec2(0.5)); // [0..0.7071]
    float lightFalloff = smoothstep(0.0, RADIUS, distanceToCentre); // [0..1]
    float lightContribution = (1.0 - lightFalloff) * strength; // [0..strength]

    vec3 ambientColour = mix(baseColour.rgb, hexToRGB(AMBIENT_COLOUR), lightContribution);

    fragColour = vec4(ambientColour, baseColour.a);
}
