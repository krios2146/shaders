const float STRENGTH = 0.5; 
const float FREQUENCY = 10.0; 

float hash(in vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; 
    vec2 pxSize = 1.0 / iResolution.xy;

    float frame = floor(iTime * FREQUENCY);

    float amplitudeX = 2.5;
    float amplitudeY = 0.5;
    float blockSize = 2.5;

    vec2 block = floor(fragCoord / blockSize);
    float random = mix(-1.0, 1.0, hash(vec3(frame, block)));

    float xShift = random * amplitudeX * pxSize.x;
    float yShift = random * amplitudeY * pxSize.y;

    uv += vec2(xShift, yShift) * STRENGTH;

    fragColour = texture(iChannel0, uv);
}
