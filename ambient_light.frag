const float STRENGTH = 1.0;
const float RADIUS = 0.65;

const float AMBIENT_R = 1.0;
const float AMBIENT_G = 1.0;
const float AMBIENT_B = 1.0;

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    vec2 centre = vec2(0.5);
    vec3 ambientLightColour = vec3(AMBIENT_R, AMBIENT_G, AMBIENT_B);

    // inverted distance from current coordinates in uv to the center of the screen 1..0
    float distanceToEdges = 1.0 - distance(uv, centre);
    float spotLight = smoothstep(1.0 - RADIUS, 1.0, distanceToEdges);
    // reduce intensity of the light with last multiplication
    float ambientLightStrength = spotLight * STRENGTH * 0.015;

    vec3 ambientColour = mix(baseColour.rgb, ambientLightColour, ambientLightStrength);

    fragColour = vec4(ambientColour, baseColour.a);
}
