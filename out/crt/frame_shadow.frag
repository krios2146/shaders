const float STRENGTH = 1.0; 

const float BORDER_PX = 5.0;
const float FALLOFF_POW = 2.0;

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy; 
    vec4 baseColour = texture(iChannel0, uv);
    vec2 pxSize = 1.0 / iResolution.xy;

    vec2 parabolas = (uv * (1.0 - uv)) * 4.0; 
    float borderParabola = (BORDER_PX * pxSize.x * (1.0 - BORDER_PX * pxSize.x)) * 4.0;

    float shadow = clamp((parabolas.x * parabolas.y) / borderParabola, 0.0, 1.0);
    shadow = pow(shadow, FALLOFF_POW);

    float brightness = mix(1.0, shadow, STRENGTH);

    fragColour = vec4(baseColour.rgb * brightness, baseColour.a);
}
