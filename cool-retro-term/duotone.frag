const vec3 REC_709_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);
const vec3 REC_601_WEIGHTS = vec3(0.299, 0.587, 0.114);
const vec3 COOL_RETRO_TERM_WEIGHTS = vec3(0.21, 0.72, 0.04);

const float SATURATION = 1.75;
const float COLOUR_RETENTION = 0.0;

const bool CONTRAST_ENABLED = true;
const float CONTRAST = 0.8;

float luma(in vec3 colour, in vec3 weights) {
    return dot(colour, weights);
}

vec3 hexToRGB(in int hex) {
    int r = hex >> (2 * 8) & 0x0000FF;
    int g = hex >> (1 * 8) & 0x0000FF;
    int b = hex >> (0 * 8) & 0x0000FF;
    return vec3(r, g, b) / 256.0;
}

vec3 toSRGB(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 toLinear(in vec3 c) {
    c = clamp(c, 0.0, 1.0);
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    vec4 baseColour = texture(iChannel0, uv).rgba;

    baseColour.rgb = toSRGB(baseColour.rgb);

    vec3 WHITE_COLOUR = hexToRGB(0xFFFFFF);
    vec3 FOREGROUND_COLOUR = hexToRGB(0x00FF00);
    vec3 BACKGROUND_COLOUR = hexToRGB(0x000000);

    float brightness = clamp(luma(baseColour.rgb, COOL_RETRO_TERM_WEIGHTS), 0.0, 1.0);

    vec3 saturatedForeground = mix(FOREGROUND_COLOUR, WHITE_COLOUR, (1.0 - SATURATION) * 0.5);

    float blend = CONTRAST_ENABLED ? 0.7 + CONTRAST * 0.3 : 1.0;

    vec3 foregroundColour = mix(BACKGROUND_COLOUR, saturatedForeground, blend);
    vec3 backgroundColour = mix(saturatedForeground, BACKGROUND_COLOUR, blend);

    vec3 tinted = mix(foregroundColour, baseColour.rgb * foregroundColour / max(brightness, 1e-5), COLOUR_RETENTION);

    fragColour = vec4(toLinear(clamp(mix(backgroundColour, tinted, brightness), 0.0, 1.0)), baseColour.a);
}
