const float SPEED = 0.2;
const float HEIGHT = 0.065; // uv units
const float OFFSCREEN = 0.25;
const float STRENGTH = 2.0;

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float line = 1.0 - mod(iTime * SPEED, 1.0 + OFFSCREEN * 2.0);
    float glow = 0.0;

    // affect only pixels above the line
    if (uv.y >= line) {
        float dist = abs(uv.y - line);
        glow = exp(-dist / HEIGHT);
    }

    fragColour = baseColour + baseColour * glow * STRENGTH;
}
