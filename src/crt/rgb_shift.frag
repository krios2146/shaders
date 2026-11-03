#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../../ghostty_uniforms.glsl"

#endif // end of the dev setup

const float STRENGTH = 0.5; // [0..1]
const float SHIFT_PX = 2.0;

/*
 * Applies an RGB channel separation effect by shifting the red and blue
 * channels horizontally in opposite directions while keeping green centred
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec2 pxSize = 1.0 / iResolution.xy;

    vec3 leftchannelmask = vec3(0.0, 0.0, 1.0);
    vec3 centrechannelmask = vec3(0.0, 1.0, 0.0);
    vec3 rightchannelmask = vec3(1.0, 0.0, 0.0);

    vec2 offset = vec2(SHIFT_PX * pxSize.x, 0.0);

    vec4 left = texture(iChannel0, uv - offset);
    vec4 centre = texture(iChannel0, uv);
    vec4 right = texture(iChannel0, uv + offset);

    vec3 leftWeights = mix(vec3(0.0), leftchannelmask, STRENGTH);
    vec3 centreWeights = mix(vec3(1.0), centrechannelmask, STRENGTH);
    vec3 rightWeights = mix(vec3(0.0), rightchannelmask, STRENGTH);

    vec3 shifted = left.rgb * leftWeights + centre.rgb * centreWeights + right.rgb * rightWeights;

    fragColor = vec4(shifted, centre.a);
}
