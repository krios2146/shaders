#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float SHIFT_PX = 2.0;
const float STRENGTH = 0.5;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec2 pixelSize = 1.0 / iResolution.xy;

    vec3 maxLeftWeights = vec3(0.0, 0.0, 1.0);
    vec3 maxCentreWeights = vec3(0.0, 1.0, 0.0);
    vec3 maxRightWeights = vec3(1.0, 0.0, 0.0);

    vec2 offset = vec2(SHIFT_PX * pixelSize.x, 0.0);

    vec4 left = texture(iChannel0, uv - offset);
    vec4 centre = texture(iChannel0, uv);
    vec4 right = texture(iChannel0, uv + offset);

    vec3 leftWeights = mix(vec3(0.0), maxLeftWeights, STRENGTH);
    vec3 centreWeights = mix(vec3(1.0), maxCentreWeights, STRENGTH);
    vec3 rightWeights = mix(vec3(0.0), maxRightWeights, STRENGTH);

    vec3 shifted = left.rgb * leftWeights + centre.rgb * centreWeights + right.rgb * rightWeights;

    fragColor = vec4(shifted, centre.a);
}
