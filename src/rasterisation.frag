#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

#define SCAN_LINES  0
#define PIXEL       1
#define SUB_PIXEL   2

#define RASTERISATION_TYPE SUB_PIXEL // SCAN_LINES | PIXEL | SUB_PIXEL

const float STRENGTH = 1.0; // [0..1]

const float VIRT_PX_SIZE = 5.0; // [x..]; x >= 1, preferably >= 3

/*
* Applies a configurable CRT-style rasterisation effect with selectable
* scanline, pixel-grid and RGB subpixel rendering modes
*/
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec4 baseColour = texture(iChannel0, uv);

    vec2 virtualResolution = iResolution.xy / VIRT_PX_SIZE;

    #if RASTERISATION_TYPE != SUB_PIXEL
    vec3 foregroundColour = baseColour.rgb * (1.0 + STRENGTH * (1.0 - baseColour.rgb));
    vec3 backgroundColour = baseColour.rgb * (1.0 - STRENGTH * (1.0 - baseColour.rgb));
    #endif

    vec2 cellCoord = abs(fract(uv * virtualResolution) * 2.0 - 1.0);

    #if RASTERISATION_TYPE == SCAN_LINES
    float mask = smoothstep(0.0, 1.0, 1.0 - cellCoord.y);

    #elif RASTERISATION_TYPE == PIXEL
    float gap = log(VIRT_PX_SIZE) / VIRT_PX_SIZE;
    float mask = step(gap, 1.0 - max(cellCoord.x, cellCoord.y));

    #elif RASTERISATION_TYPE == SUB_PIXEL
    const float PI = 3.14159265359;
    const float CONTRAST = 0.0; // [0..1]

    vec2 angle = fract(uv * virtualResolution) * 2.0 * PI; // [0..2π]
    vec3 peaks = vec3(0.0, 2.0, 4.0) * (PI / 3.0); // [0, 2π/3, 4π/3] == [0/3, 1/3, 2/3]
    vec3 waves = cos(vec3(angle.x) - peaks) / 2.0 + 0.5; // [-1..1] => [0..1]
    vec3 factors = mix(vec3(1.0 - CONTRAST), vec3(1.0), waves);

    baseColour.rgb *= factors;

    vec3 foregroundColour = baseColour.rgb * (1.0 + STRENGTH * (1.0 - baseColour.rgb));
    vec3 backgroundColour = baseColour.rgb * (1.0 - STRENGTH * (1.0 - baseColour.rgb));

    float mask = smoothstep(0.0, 1.0, 1.0 - cellCoord.y);
    #else
    #error invalid RASTERISATION_TYPE
    #endif

    vec3 rasterisationColour = mix(backgroundColour, foregroundColour, mask);

    fragColour = vec4(rasterisationColour, baseColour.a);
}
