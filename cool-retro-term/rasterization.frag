const float STRENGTH = 1.0;
const float VIRT_PX_SIZE = 5.0;
const float SUBPIXELS = 5.0;

vec3 scanLines(in vec3 baseColour, in vec2 virtualRes, in vec2 uv) {
    vec3 brightColour = baseColour * (1.0 + STRENGTH * (1.0 - baseColour));
    vec3 darkColour = baseColour * (1.0 - STRENGTH * (1.0 - baseColour));

    vec2 coord = fract(uv * virtualRes) * 2.0 - 1.0;
    float mask = 1.0 - abs(coord.y);

    return mix(darkColour, brightColour, mask);
}

vec3 pixel(in vec3 baseColour, in vec2 virtualRes, in vec2 uv) {
    vec3 brightColour = baseColour * (1.0 + STRENGTH * (1.0 - baseColour));
    vec3 darkColour = baseColour * (1.0 - STRENGTH * (1.0 - baseColour));

    vec2 coord = pow(fract(uv * virtualRes) * 2.0 - 1.0, vec2(2.0));
    float mask = 1.0 - coord.x - coord.y;

    return mix(darkColour, baseColour, mask);
}

vec3 subPixel(in vec3 baseColour, in vec2 virtualRes, in vec2 uv) {
    vec3 offsets = vec3(3.141592654) * vec3(0.5, 0.5 - 2.0 / 3.0, 0.5 - 4.0 / 3.0);

    vec2 omega = vec2(3.141592654) * vec2(2.0) * virtualRes;
    vec2 angle = uv * omega;
    vec3 xfactors = (SUBPIXELS + sin(angle.x + offsets)) / (SUBPIXELS + 1.0);

    baseColour *= xfactors;

    vec3 brightColour = baseColour * (1.0 + STRENGTH * (1.0 - baseColour));
    vec3 darkColour = baseColour * (1.0 - STRENGTH * (1.0 - baseColour));

    vec2 coords = fract(uv * virtualRes) * 2.0 - vec2(1.0);
    float mask = 1.0 - abs(coords.y);

    return mix(darkColour, baseColour, mask);
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    vec2 virtualResolution = iResolution.xy / VIRT_PX_SIZE;

    fragColour = vec4(pixel(baseColour.rgb, virtualResolution, uv), baseColour.a);
}
