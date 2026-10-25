# Shaders

GLSL shaders for [Ghostty](https://ghostty.org) that try to mimic the look of
[cool-retro-term](https://github.com/Swordfish90/cool-retro-term)

## Dev

1. Install `glsl_analyzer` && `glslang`
2. Configure editor to use `glsl_analyzer` as the LSP && `glslang` as the linter
3. Create a `{name}_dev.frag` file with the "dev header"; see the `_dev` files
4. Strip the "dev header" && the `_dev` suffix; see `.nvim.lua`, which does exactly this
5. Run Ghostty with `ghostty --custom-shader={name}.frag`
6. Ghostty's config reload is mapped to `Ctrl Shift ,` by default

## Usage

Presets are best-effort bundles of a Ghostty config file and a shader file that
try to reproduce the look of cool-retro-term's default profiles

Include a preset Ghostty config file in your Ghostty configuration:

```config
config-file = shaders/presets/ghostty_default_amber.config
```

### Font configuration

The Ghostty config files in the presets include font settings. To use the fonts
specified by a preset, its config file must be included before any other font
options

For example, with this config, Ghostty will prefer "JetBrainsMono Nerd Font" over
the font set in `shaders/presets/ghostty_default_amber.config`:

```config
font-family = "JetBrainsMono Nerd Font"
font-size = 16

config-file = shaders/presets/ghostty_default_amber.config
```

With this config, however, Ghostty will prefer the font set in
`shaders/presets/ghostty_default_amber.config` over "JetBrainsMono Nerd Font":

```config
config-file = shaders/presets/ghostty_default_amber.config

font-family = "JetBrainsMono Nerd Font"
font-size = 16
```

## Limitations

cool-retro-term is a complete terminal emulator, so it has much more control over
its rendering pipeline

### Burn-in

cool-retro-term can retain previous rendered frames because it controls its own
rendering pipeline. This allows it to create effects such as burn-in, which depend
on colours from previous frames

Ghostty's custom shaders only receive the current input texture. They cannot access
previous-frame contents or retain texture state between frames, so this effect
cannot be reproduced directly with Ghostty shaders

### Fonts

1. cool-retro-term bundles its default fonts with the application
2. cool-retro-term can render some fonts at a lower resolution and upscale them
   when rendering
3. cool-retro-term may apply rasterization effects directly to the font rendering

These behaviours cannot be reproduced with shaders alone, and Ghostty's config
does not provide equivalent options for all of them

The presets select matching fonts in Ghostty's config, but they may not look
exactly the same as they do in cool-retro-term

I haven't decided yet what to do with vintage fonts such as `Apple ][`

### Static noise

cool-retro-term uses a separate noise texture and samples it when needed

Ghostty's custom shaders currently have access to only one input texture: the
terminal image. They cannot sample a separate noise texture

The workaround is to use a hash function that produces pseudorandom numbers that
look like random noise

### Bloom

cool-retro-term uses Qt's `FastBlur` effect, which repeatedly downsamples the
terminal texture to produce a very soft blur

Ghostty's custom-shader pipeline does not expose downscaled intermediate textures.
As a result, achieving the same soft blur efficiently is difficult; attempting it
with a large blur kernel at full resolution can be very expensive

The workaround is to blur the terminal image with a Gaussian-like blur that samples
at the corners of four neighbouring pixels. With bilinear texture filtering, each
sample blends nearby texels, effectively covering more than one texel per sample

### Rasterization

cool-retro-term provides a rasterization setting that changes how fonts are rendered

This cannot be achieved with shaders alone, and Ghostty does not provide an
equivalent configuration option

Rasterization effects implemented in shaders only affect the final screen image;
they do not change how the fonts themselves are rendered

### Effects FPS

Some effects have a `RATE` constant that affects the perceived FPS of the effect

Not all effects have it, which is why this section exists. Maybe it will become
obsolete when I add such a constant to all temporal effects

### Screen curvature

This isn't a limitation (at least, I don't see why it couldn't be implemented).
I just don't like how it looks and don't want to implement it
