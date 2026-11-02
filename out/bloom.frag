const float STRENGTH = 0.5; 

const float SAMPLE_RADIUS = 21.0;

const float SIGMA = float(SAMPLE_RADIUS) / 2.5;

float sqr(in float x) {
    return x * x;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; 
    vec4 baseColour = texture(iChannel0, uv);
    vec2 pxSize = 1.0 / iResolution.xy;

    const int radiusSteps = int(SAMPLE_RADIUS);

    float[radiusSteps + 1] weights;

    for (int i = 0; i <= radiusSteps; i++) {
        weights[i] = exp(-sqr(float(i)) / (2.0 * sqr(SIGMA))); 
    }

    vec3 weightedColourSum = vec3(0.0);
    float totalWeight = 0.0;

    for (float x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; x++) {
        for (float y = -SAMPLE_RADIUS + mod(x + SAMPLE_RADIUS, 2.0); y <= SAMPLE_RADIUS; y += 2.0) {
            if (sqr(x) + sqr(y) > sqr(SAMPLE_RADIUS)) {
                continue;
            }

            vec2 offset = vec2(x, y) * 2.0 + 0.5;
            float weight = weights[int(abs(x))] * weights[int(abs(y))];

            weightedColourSum += texture(iChannel0, uv + offset * pxSize).rgb * weight;
            totalWeight += weight;
        }
    }

    vec3 glow = weightedColourSum / totalWeight;
    vec3 bloomColour = baseColour.rgb + glow * clamp(sqr(STRENGTH), 0.0, 1.0);

    fragColor = vec4(bloomColour, baseColour.a);
}
