const float STRENGTH = 1.0; 
const float RADIUS = 0.65; 

const int AMBIENT_COLOUR = 0xFFFFFF;

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 255.0;
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; 
    vec4 baseColour = texture(iChannel0, uv).rgba;

    float strength = clamp(STRENGTH, 0.0, 1.0) * 0.015; 
    float distanceToCentre = distance(uv, vec2(0.5)); 
    float lightFalloff = smoothstep(0.0, RADIUS, distanceToCentre); 
    float lightContribution = (1.0 - lightFalloff) * strength; 

    vec3 ambientColour = mix(baseColour.rgb, hexToRGB(AMBIENT_COLOUR), lightContribution);

    fragColour = vec4(ambientColour, baseColour.a);
}
