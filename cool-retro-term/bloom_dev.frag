#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif

const float STRENGTH = 0.5;

// PERFORMANCE: Produces (2n + 1)² samples per pixel without optimisations
// Let SAMPLE_RADIUS    = 21
// (2 × 21 + 1)² = 43²  = 1849          samples per pixel
// 1920 × 1080          = 2_073_600     pixels
// 2_073_600 × 1849     = 3_834_086_400 samples per single frame
const float SAMPLE_RADIUS = 21.0;

const float SIGMA = SAMPLE_RADIUS / 2.5; // Gaussian weight spread in sample grid steps

float sqr(in float x) {
    return x * x;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv);
    vec2 pxSize = 1.0 / iResolution.xy;

    // HACK: Half-pixel shift enables sample to land on the shared corner of four texels.
    // Exploits Ghostty's bilinear filtering
    float tapOffset = 0.5;

    const int radiusSteps = int(SAMPLE_RADIUS);

    float[radiusSteps + 1] weights;

    // PERFORMANCE: Precomputing weights exploiting properties:
    // 1. exp(−(x²+y²)/(2σ²)) == exp(−x²/(2σ²)) × exp(−y²/(2σ²))
    // 2. weights are symmetric i.e. weights[−i] == weights[i]
    for (int i = 0; i <= radiusSteps; i++) {
        weights[i] = exp(-sqr(float(i)) / (2.0 * sqr(SIGMA)));
    }

    vec3 sum = vec3(0.0);
    float total = 0.0;

    for (float x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; x++) {
        // PERFORMANCE: Initialise y such that x + y is even, then step by 2.
        // Processing samples in checkerboard pattern, shedding 50% of the samples
        for (float y = -SAMPLE_RADIUS + mod(x + SAMPLE_RADIUS, 2.0); y <= SAMPLE_RADIUS; y += 2.0) {
            // PERFORMANCE: Process only samples inside the circle
            // Sheds ~21% (1 - π/4) of samples
            if (sqr(x) + sqr(y) > sqr(SAMPLE_RADIUS)) {
                continue;
            }

            vec2 offset = vec2(x, y) + tapOffset * 2.0;
            float weight = weights[int(abs(x))] * weights[int(abs(y))];

            sum += texture(iChannel0, uv + offset * pxSize).rgb * weight;
            total += weight;
        }
    }

    vec3 glow = sum / total;

    fragColor = vec4(baseColour.rgb + glow * clamp(pow(STRENGTH, 2.0), 0.0, 1.0), baseColour.a);
}
