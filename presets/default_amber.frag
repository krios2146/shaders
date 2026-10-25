float sqr(in float x) {
    return x * x;
}

float luma(in vec3 colour, in vec3 weights) {
    return dot(colour, weights);
}

vec3 linearToSRGB(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 srgbToLinear(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 256.0;
}

float hash1to1(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash2to1(in vec2 p) {
    vec3 p3 = fract(vec3(p.xyx * 0.1031));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash3to1(in vec3 p) {
    vec3 p3 = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 applyHorizontalSync(in vec2 uv, in vec2 coord) {
    const float RATE = 20.0;
    const float PROBABILITY = 0.08;

    const float MAX_AMPLITUDE_PX = 0.5;
    const float SPEED = 1.0;
    const float FREQ_MIN = 2.0;
    const float FREQ_MAX = FREQ_MIN * 10.0;

    const float MAX_SHIFT_PX = 0.5;
    const float BLOCK_SIZE = 5.0;

    vec2 pixelSizeUV = 1.0 / iResolution.xy;
    float frame = floor(iTime * RATE);

    float randomPrb = hash2to1(vec2(frame, 30.07 + 1937.0));
    float randomStr = hash2to1(vec2(frame, 26.09 + 1983.0));
    float randomFreq = hash2to1(vec2(frame, 26.04 + 1986.0));

    float probability = 1.0 - step(PROBABILITY, randomPrb);
    float strength = max(0.0, 1.0 - randomStr) * probability;

    float freq = mix(FREQ_MIN, FREQ_MAX, randomFreq);
    float phase = (uv.y + iTime * SPEED) * freq;
    float shift = sin(phase) * MAX_AMPLITUDE_PX * strength;
    uv.x += shift * pixelSizeUV.x;

    vec2 block = floor(coord / BLOCK_SIZE);
    float direction = hash3to1(vec3(block, frame)) * 2.0 - 1.0;
    shift = direction * MAX_SHIFT_PX * strength;
    uv.x += shift * pixelSizeUV.x;

    return uv;
}

vec2 applyJitter(in vec2 uv, in vec2 coord) {
    const float RATE = 20.0;
    const float AMPLITUDE_X = 2.0;
    const float AMPLITUDE_Y = 0.5;
    const float STRENGTH = 0.3;
    const float BLOCK_SIZE = 2.5;

    float frame = floor(iTime * RATE);
    coord = floor(coord / BLOCK_SIZE);

    vec2 pixelSize = 1.0 / iResolution.xy;

    float hash = mix(-1.0, 1.0, hash3to1(vec3(frame, coord)));
    float xShift = hash * AMPLITUDE_X * pixelSize.x;
    float yShift = hash * AMPLITUDE_Y * pixelSize.y;

    uv += vec2(xShift, yShift) * STRENGTH;
    return uv;
}

vec3 applyRGBShift(in vec2 contentUv) {
    const float STRENGTH = 0.0;
    const float SHIFT_PX = 2.0;

    vec2 pixelSize = 1.0 / iResolution.xy;

    vec3 maxLeftWeights = vec3(0.0, 0.0, 1.0);
    vec3 maxCentreWeights = vec3(0.0, 1.0, 0.0);
    vec3 maxRightWeights = vec3(1.0, 0.0, 0.0);

    vec2 offset = vec2(SHIFT_PX * pixelSize.x, 0.0);

    vec4 left = texture(iChannel0, contentUv - offset);
    vec4 centre = texture(iChannel0, contentUv);
    vec4 right = texture(iChannel0, contentUv + offset);

    vec3 leftWeights = mix(vec3(0.0), maxLeftWeights, STRENGTH);
    vec3 centreWeights = mix(vec3(1.0), maxCentreWeights, STRENGTH);
    vec3 rightWeights = mix(vec3(0.0), maxRightWeights, STRENGTH);

    return left.rgb * leftWeights + centre.rgb * centreWeights + right.rgb * rightWeights;
}

vec3 applyBloom(in vec3 base, in vec2 contentUv) {
    const float SAMPLE_RADIUS = 27.0;
    const float STRENGTH = 0.65;
    const float SIGMA = SAMPLE_RADIUS / 3.0;

    vec2 pxSize = 1.0 / iResolution.xy;
    float tapOffset = 0.5;

    const int radiusSteps = int(SAMPLE_RADIUS);

    float[radiusSteps + 1] weights;

    for (int i = 0; i <= radiusSteps; i++) {
        weights[i] = exp(-sqr(float(i)) / (2.0 * sqr(SIGMA)));
    }

    vec3 sum = vec3(0.0);
    float total = 0.0;

    for (float x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; x++) {
        for (float y = -SAMPLE_RADIUS + mod(x + SAMPLE_RADIUS, 2.0); y <= SAMPLE_RADIUS; y += 2.0) {
            if (sqr(x) + sqr(y) > sqr(SAMPLE_RADIUS)) {
                continue;
            }

            vec2 offset = vec2(x, y) * 2.0 + tapOffset;
            float weight = weights[int(abs(x))] * weights[int(abs(y))];

            sum += texture(iChannel0, contentUv + offset * pxSize).rgb * weight;
            total += weight;
        }
    }

    vec3 glow = sum / total;

    return base + glow * clamp(pow(STRENGTH, 2.0), 0.0, 1.0);
}

vec3 applyStaticNoise(in vec3 base, in vec2 coord) {
    const float INTENSITY = 0.05;
    const float RATE = 20.0;
    const float BLOCK_SIZE = 3.0;

    float noise = hash3to1(vec3(floor(coord / BLOCK_SIZE), floor(iTime * RATE)));

    return base + (INTENSITY * (noise - 0.5));
}

vec3 applyGlowLine(in vec3 base, in vec2 uv) {
    const float SPEED = 0.2;
    const float HEIGHT = 0.065; // uv units
    const float OFFSCREEN = 0.25;
    const float STRENGTH = 1.0;

    float line = 1.0 - mod(iTime * SPEED, 1.0 + OFFSCREEN * 2.0);
    float glow = 0.0;

    if (uv.y >= line) {
        float dist = abs(uv.y - line);
        glow = exp(-dist / HEIGHT);
    }

    return base + base * glow * STRENGTH;
}

vec3 applyColourCorrection(in vec3 base, in vec2 uv) {
    const vec3 GREY_WEIGHTS = vec3(0.21, 0.72, 0.04);

    vec3 FOREGROUND_COLOUR = hexToRGB(0xFF8100);
    vec3 BACKGROUND_COLOUR = hexToRGB(0x000000);

    const float SATURATION = 0.75;
    const float COLOUR_RETENTION = 0.25;

    const bool CONTRAST_ENABLED = true;
    const float CONTRAST = 0.8;

    float brightness = luma(base, GREY_WEIGHTS);

    vec3 saturatedForeground = mix(FOREGROUND_COLOUR, vec3(1.0), (1.0 - SATURATION) * 0.5);

    float blend = CONTRAST_ENABLED ? 0.7 + CONTRAST * 0.3 : 1.0;

    vec3 litColour = mix(BACKGROUND_COLOUR, saturatedForeground, blend);
    vec3 unlitColour = mix(saturatedForeground, BACKGROUND_COLOUR, blend);

    vec3 tinted = mix(litColour, base * litColour / max(brightness, 1e-4), COLOUR_RETENTION);

    return clamp(mix(unlitColour, tinted, clamp(brightness, 0.0, 1.0)), 0.0, 1.0);
}

vec3 applyFlicker(in vec3 base) {
    const float STRENGTH = 0.1;
    const float RATE = 15.0;

    float random = hash1to1(floor(iTime * RATE));
    float flicker = 1.0 - random * STRENGTH;

    return base * flicker;
}

vec3 applyVignette(in vec3 base, in vec2 screenUv) {
    const float INNER_RADIUS = 0.645;
    const float OUTER_RADIUS = 0.8;
    const float STRENGTH = 5.0;

    vec2 centre = abs(screenUv - 0.5);

    float vignette = 1.0 - smoothstep(INNER_RADIUS, OUTER_RADIUS, length(centre));
    vignette = pow(vignette, STRENGTH);

    return base * vignette;
}

vec3 applyAmbientLight(in vec3 base, in vec2 screenUv) {
    const float STRENGTH = 0.3;
    const float RADIUS = 0.75;

    vec3 ambientLightColour = hexToRGB(0xFFBBAA);
    vec2 centre = vec2(0.5);

    float distanceToEdges = 1.0 - distance(screenUv, centre);
    float spotLight = smoothstep(1.0 - RADIUS, 1.0, distanceToEdges);
    float ambientLightStrength = spotLight * STRENGTH * 0.25;

    return base + ambientLightColour * ambientLightStrength;
}

vec3 applyBrightness(in vec3 base) {
    const float BRIGHTNESS = 1.0;

    return base * clamp(BRIGHTNESS + 0.5, 0.5, 1.5);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 screenUv = fragCoord / iResolution.xy;
    vec4 base = texture(iChannel0, screenUv);

    vec2 contentUv = screenUv;
    vec3 effect = base.rgb;

    // Warp
    contentUv = applyHorizontalSync(screenUv, fragCoord);
    contentUv = applyJitter(contentUv, fragCoord);

    // Optics
    effect = applyRGBShift(contentUv);
    effect = applyBloom(effect, contentUv);

    effect = linearToSRGB(effect);

    // Light
    effect = applyBrightness(effect);
    effect = applyStaticNoise(effect, fragCoord);
    effect = applyGlowLine(effect, screenUv);

    // Palette
    effect = applyColourCorrection(effect, screenUv);

    // Display
    effect = applyVignette(effect, screenUv);
    effect = applyFlicker(effect);
    effect = applyAmbientLight(effect, screenUv);

    effect = srgbToLinear(effect);

    fragColor = vec4(effect, base.a);
}
