const float INNER_RADIUS = 0.65;
const float OUTER_RADIUS = 0.8;
const float STRENGTH = 5.0;

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    vec2 centre = abs(uv - 0.5);

    float vignette = 1.0 - smoothstep(INNER_RADIUS, OUTER_RADIUS, length(centre));
    vignette = pow(vignette, STRENGTH);

    fragColour = vec4(baseColour.rgb * vignette, baseColour.a);
}
