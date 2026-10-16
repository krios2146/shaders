const float RATE = 20.0;
const float PROBABILITY = 0.95;

const float MAX_AMPLITUDE_PX = 60.0;
const float SPEED = 1.0;
const float FREQ_MIN = 2.0;
const float FREQ_MAX = FREQ_MIN * 10.0;

const float MAX_SHIFT_PX = 5.0;
const float BLOCK_SIZE = 5.0;

float hash2to1(in vec2 p) {
    vec3 p3 = fract(vec3(p.xyx * 0.1031));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash3to1(in vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
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

    vec2 block = floor(fragCoord / BLOCK_SIZE);
    float direction = hash3to1(vec3(block, frame)) * 2.0 - 1.0;
    shift = direction * MAX_SHIFT_PX * strength;
    uv.x += shift * pixelSizeUV.x;

    fragColour = texture(iChannel0, uv);
}
