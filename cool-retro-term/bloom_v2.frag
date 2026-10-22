const float STRENGTH = 0.25;
const float QUALITY = 1.0;

const float SAMPLE_RADIUS = 21.0;
const float SIGMA = SAMPLE_RADIUS / 3.0;

float sqr(in float x) {
    return x * x;
}

vec3 blurAtScale(vec2 uv, vec2 pxSize, float radius) {
    vec3 sum = vec3(0.0);
    float total = 0.0;

    for (float x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; x++) {
        for (float y = -SAMPLE_RADIUS; y <= SAMPLE_RADIUS; y++) {
            vec2 offset = vec2(x, y) * pxSize * radius;

            float r2 = sqr(x) + sqr(y);

            // sample inside the circle shape
            if (r2 > sqr(SAMPLE_RADIUS)) {
                continue;
            }

            float w = exp(-r2 / (2.0 * sqr(SIGMA)));

            sum += texture(iChannel0, uv + offset).rgb * w;
            total += w;
        }
    }

    return sum / total;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv);
    vec2 pixelSize = 1.0 / iResolution.xy;

    float q = clamp(QUALITY, 0.0, 1.0);

    vec3 glow1 = blurAtScale(uv, pixelSize, mix(1.0, 2.0, q));
    vec3 glow2 = blurAtScale(uv, pixelSize, mix(2.0, 4.0, q));
    vec3 glow3 = blurAtScale(uv, pixelSize, mix(3.0, 6.0, q));
    vec3 glow4 = blurAtScale(uv, pixelSize, mix(4.0, 8.0, q));

    vec3 glow = glow1 * 0.45 + glow2 * 0.25 + glow3 * 0.15 + glow4 * 0.15;

    vec3 result = baseColour.rgb + glow * STRENGTH;

    fragColor = vec4(result, baseColour.a);
}
