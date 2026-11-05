#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../../../ghostty_uniforms.glsl"

#endif // end of the dev setup

const float FREQUENCY = 24.0; // Effects FPS

float sqr(in float x) {
    return x * x;
}
int sqr(in int x) {
    return x * x;
}

float luma(in vec3 colour, in vec3 weights) {
    return dot(colour, weights);
}

vec3 toSRGB(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 toLinear(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 255.0;
}

float hash(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash(in vec2 p) {
    vec3 p3 = fract(vec3(p.xyx * 0.1031));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash(in vec3 p) {
    vec3 p3 = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 applyHorizontalSync(in vec2 uv) {
    const float STRENGTH = 0.16; // [0..1]

    vec2 pxSize = 1.0 / iResolution.xy;
    float frame = floor(iTime * FREQUENCY);

    float strength = clamp(STRENGTH, 0.0, 1.0);
    float syncProbability = pow(strength, 3.0);

    // Max sine wave horizontal displacement
    float maxAmplitude = strength * 60.0 * pxSize.x;

    // Sine angular frequency in radians per screen height
    float freqMin = strength * 5.0;
    float freqMax = freqMin * 5.0;

    // Speed higher than max aplitude will tear pixels
    float syncSpeed = maxAmplitude;

    float randomPrb = hash(vec2(frame, 30.07 + 1937.0));
    float randomStr = hash(vec2(frame, 26.09 + 1983.0));
    float randomFreq = hash(vec2(frame, 26.04 + 1986.0));

    float probability = step(randomPrb, syncProbability);
    float shiftStrength = min(probability, randomStr);

    float freq = mix(freqMin, freqMax, randomFreq);
    float phase = (uv.y + frame * syncSpeed) * freq;
    float shift = sin(phase) * maxAmplitude * shiftStrength;
    uv.x += shift;

    return uv;
}

vec2 applyJitter(in vec2 uv, in vec2 coord) {
    const float STRENGTH = 0.1; // [0..1]

    vec2 pxSize = 1.0 / iResolution.xy;

    float frame = floor(iTime * FREQUENCY);

    // Tuned to mimic cool-retro-term
    float amplitudeX = 2.5;
    float amplitudeY = 0.5;
    float blockSize = 2.5;

    vec2 block = floor(coord / blockSize);
    float random = mix(-1.0, 1.0, hash(vec3(frame, block)));

    float xShift = random * amplitudeX * pxSize.x;
    float yShift = random * amplitudeY * pxSize.y;

    uv += vec2(xShift, yShift) * STRENGTH;

    return uv;
}

vec3 applyBloom(in vec3 base, in vec2 uv) {
    const float STRENGTH = 0.5; // [0..1]

    const int SAMPLE_RADIUS = 21;
    const float SIGMA = float(SAMPLE_RADIUS) / 2.5;

    vec2 pxSize = 1.0 / iResolution.xy;

    const int radiusSteps = int(SAMPLE_RADIUS);

    float[radiusSteps + 1] weights;

    for (int i = 0; i <= radiusSteps; i++) {
        weights[i] = exp(-sqr(float(i)) / (2.0 * sqr(SIGMA))); // [0..1]
    }

    vec3 weightedColourSum = vec3(0.0);
    float totalWeight = 0.0;

    for (int x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; x++) {
        for (int y = -SAMPLE_RADIUS + (x + SAMPLE_RADIUS) % 2; y <= SAMPLE_RADIUS; y += 2) {
            if (sqr(x) + sqr(y) > sqr(SAMPLE_RADIUS)) {
                continue;
            }

            vec2 offset = vec2(x, y) * 2.0 + 0.5;
            float weight = weights[abs(x)] * weights[abs(y)];

            weightedColourSum += texture(iChannel0, uv + offset * pxSize).rgb * weight;
            totalWeight += weight;
        }
    }

    vec3 glow = weightedColourSum / totalWeight;
    vec3 bloomColour = base + glow * sqr(STRENGTH);

    return bloomColour;
}

vec3 applyBrightness(in vec3 base) {
    const float BRIGHTNESS = 0.5;
    return toLinear(toSRGB(base) * (BRIGHTNESS + 1.0));
}

vec3 applyStaticNoise(in vec3 base, in vec2 coord) {
    const float STRENGTH = 0.1; // [0..1]

    const float BLOCK_SIZE_PX = 3.0;

    float frame = floor(iTime * FREQUENCY);

    vec2 block = floor(coord / BLOCK_SIZE_PX);

    float noise = hash(vec3(block, frame));
    float offset = STRENGTH * (noise - 0.5);

    vec3 noisyColour = mix(base, base + offset, 0.05);

    return noisyColour;
}

vec3 applyGlowLine(in vec3 base, in vec2 uv) {
    const float STRENGTH = 0.22; // [0..1]

    const float SPEED_PX_SEC = 200.0;
    const float HEIGHT_PX = 250.0;
    const float OFFSCREEN_PX = HEIGHT_PX / 2.0;

    float pxSize = 1.0 / iResolution.y;
    float frame = floor(iTime * FREQUENCY) / FREQUENCY;

    float travelDistance = 1.0 + HEIGHT_PX * pxSize + OFFSCREEN_PX * pxSize;
    float lineY = 1.0 - mod(frame * SPEED_PX_SEC * pxSize, travelDistance);

    // Affect only pixels above the line
    if (uv.y < lineY) {
        return base;
    }

    float glowIntensity = 1.0 - (distance(lineY, uv.y) / (HEIGHT_PX * pxSize));
    float glow = smoothstep(0.0, 1.0, glowIntensity);

    vec3 glowLineColour = base + base * glow * clamp(STRENGTH, 0.0, 1.0) * 5.5;

    return glowLineColour;
}

vec3 applyColourCorrection(in vec3 base, in vec2 uv) {
    const float SATURATION = 1.0; // [0..1]
    const float COLOUR_RETENTION = 0.0; // [0..1]

    const bool CONTRAST_ENABLED = true;
    const float CONTRAST = 0.85; // [0..1]; controls separation between duotone colours

    vec3 WHITE_COLOUR = hexToRGB(0xFFFFFF);
    vec3 FOREGROUND_COLOUR = hexToRGB(0x00D56D);
    vec3 BACKGROUND_COLOUR = hexToRGB(0x000000);
    vec3 WEIGHTS = vec3(0.21, 0.72, 0.04);

    base = toSRGB(base);

    float brightness = clamp(luma(base, WEIGHTS), 0.0, 1.0);

    vec3 saturatedForeground = mix(FOREGROUND_COLOUR, WHITE_COLOUR, (1.0 - SATURATION) * 0.5);

    float blend = CONTRAST_ENABLED ? 0.7 + CONTRAST * 0.3 : 1.0;

    vec3 foregroundColour = mix(BACKGROUND_COLOUR, saturatedForeground, blend);
    vec3 backgroundColour = mix(saturatedForeground, BACKGROUND_COLOUR, blend);

    vec3 retainedColour = mix(foregroundColour, base * foregroundColour / max(brightness, 1e-5), COLOUR_RETENTION);

    return toLinear(clamp(mix(backgroundColour, retainedColour, brightness), 0.0, 1.0));
}

vec3 applyFrameShadow(in vec3 base, in vec2 uv) {
    const float STRENGTH = 0.9;

    const float BORDER_PX = 5.0;
    const float FALLOFF_POW = 2.0;

    vec2 pxSize = 1.0 / iResolution.xy;

    vec2 parabolas = (uv * (1.0 - uv)) * 4.0; // [0..0.25] => [0..1]
    float borderParabola = (BORDER_PX * pxSize.x * (1.0 - BORDER_PX * pxSize.x)) * 4.0;

    float shadow = clamp((parabolas.x * parabolas.y) / borderParabola, 0.0, 1.0);
    shadow = pow(shadow, FALLOFF_POW);

    float brightness = mix(1.0, shadow, STRENGTH);

    return base * brightness;
}

vec3 applyFlicker(in vec3 base) {
    const float STRENGTH = 0.2;

    float random = hash(floor(iTime * FREQUENCY));
    float flicker = 1.0 - random * clamp(STRENGTH, 0.0, 1.0);

    return base * flicker;
}

vec3 applyAmbientLight(in vec3 base, in vec2 uv) {
    const float STRENGTH = 0.3; // [0..1]
    const float RADIUS = 0.65; // [0..1] uv units

    const int AMBIENT_COLOUR = 0xFFFFFF;

    float strength = clamp(STRENGTH, 0.0, 1.0) * 0.015; // [0..0.015]; limit light strength to 1.5%
    float distanceToCentre = distance(uv, vec2(0.5)); // [0..0.7071]
    float lightFalloff = smoothstep(0.0, RADIUS, distanceToCentre); // [0..1]
    float lightContribution = (1.0 - lightFalloff) * strength; // [0..strength]

    vec3 ambientColour = mix(base, hexToRGB(AMBIENT_COLOUR), lightContribution);

    return ambientColour;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 screenUv = fragCoord / iResolution.xy;
    vec4 base = texture(iChannel0, screenUv);

    vec2 contentUv = screenUv;
    vec3 effect = base.rgb;

    // Warp
    contentUv = applyHorizontalSync(screenUv);
    contentUv = applyJitter(contentUv, fragCoord);

    effect = texture(iChannel0, contentUv).rgb;

    // Optics
    effect = applyBloom(effect, contentUv);

    // Light
    effect = applyBrightness(effect);
    effect = applyStaticNoise(effect, fragCoord);
    effect = applyGlowLine(effect, screenUv);

    // Palette
    effect = applyColourCorrection(effect, screenUv);

    // Display
    effect = applyFrameShadow(effect, screenUv);
    effect = applyFlicker(effect);
    effect = applyAmbientLight(effect, screenUv);

    fragColor = vec4(effect, base.a);
}
