const float STRENGTH = 0.5; 
const float SHIFT_PX = 2.0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; 
    vec2 pxSize = 1.0 / iResolution.xy;

    vec3 leftchannelmask = vec3(0.0, 0.0, 1.0);
    vec3 centrechannelmask = vec3(0.0, 1.0, 0.0);
    vec3 rightchannelmask = vec3(1.0, 0.0, 0.0);

    vec2 offset = vec2(SHIFT_PX * pxSize.x, 0.0);

    vec4 left = texture(iChannel0, uv - offset);
    vec4 centre = texture(iChannel0, uv);
    vec4 right = texture(iChannel0, uv + offset);

    vec3 leftWeights = mix(vec3(0.0), leftchannelmask, STRENGTH);
    vec3 centreWeights = mix(vec3(1.0), centrechannelmask, STRENGTH);
    vec3 rightWeights = mix(vec3(0.0), rightchannelmask, STRENGTH);

    vec3 shifted = left.rgb * leftWeights + centre.rgb * centreWeights + right.rgb * rightWeights;

    fragColor = vec4(shifted, centre.a);
}
