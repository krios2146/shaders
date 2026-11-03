#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../../ghostty_uniforms.glsl"

#endif // end of the dev setup

const float STRENGTH = 1.0; // [0..1]
const float FREQUENCY = 60.0; // Updates per second [Hz]

const float SPEED_PX_SEC = 200.0;
const float HEIGHT_PX = 250.0;
const float OFFSCREEN_PX = HEIGHT_PX / 2.0;

/*
* Applies a vertically moving (top to bottom) glow line that brightens the image
*/
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec4 baseColour = texture(iChannel0, uv);
    float pxSize = 1.0 / iResolution.y;
    float frame = floor(iTime * FREQUENCY) / FREQUENCY;

    float travelDistance = 1.0 + HEIGHT_PX * pxSize + OFFSCREEN_PX * pxSize;
    float lineY = 1.0 - mod(frame * SPEED_PX_SEC * pxSize, travelDistance);

    // Affect only pixels above the line
    if (uv.y < lineY) {
        fragColour = baseColour;
        return;
    }

    float glowIntensity = 1.0 - (distance(lineY, uv.y) / (HEIGHT_PX * pxSize));
    float glow = smoothstep(0.0, 1.0, glowIntensity);

    vec3 glowLineColour = baseColour.rgb + baseColour.rgb * glow * clamp(STRENGTH, 0.0, 1.0) * 5.5;

    fragColour = vec4(glowLineColour, baseColour.a);
}
