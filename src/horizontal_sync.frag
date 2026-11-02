#version 300 es

precision highp float;

#ifdef GHOSTTY_UNIFORMS

#extension GL_GOOGLE_include_directive : require
#include "../ghostty.glsl"

#endif // end of the dev setup

const float STRENGTH = 1.35; // [0..1]
const float FREQUENCY = 10.0; // Updates per second [Hz]

float hash(in vec2 p) {
    vec3 p3 = fract(vec3(p.xyx * 0.1031));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/*
* Applies a horizontally oscillating distortion effect with randomly varying
* frequency, intensity and synchronisation
*/
void mainImage(out vec4 fragColour, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy; // [0..1]
    vec2 pxSize = 1.0 / iResolution.xy;
    float frame = floor(iTime * FREQUENCY);

    float strength = clamp(STRENGTH, 0.0, 1.0);
    float syncProbability = pow(strength, 3.0);

    // Max sine wave horizontal displacement
    float maxAmplitude = strength * 60.0 * pxSize.x;

    // Sine angular frequency in radians per screen height
    float freqMin = strength * 5.0;
    float freqMax = freqMin * 5.0;

    // Speed higher than max aplitude will tear pixels
    float syncSpeed = maxAmplitude;

    float randomPrb = hash(vec2(frame, 30.07 + 1937.0));
    float randomStr = hash(vec2(frame, 26.09 + 1983.0));
    float randomFreq = hash(vec2(frame, 26.04 + 1986.0));

    float probability = step(randomPrb, syncProbability);
    float shiftStrength = min(probability, randomStr);

    float freq = mix(freqMin, freqMax, randomFreq);
    float phase = (uv.y + frame * syncSpeed) * freq;
    float shift = sin(phase) * maxAmplitude * shiftStrength;
    uv.x += shift;

    fragColour = texture(iChannel0, uv);
}
