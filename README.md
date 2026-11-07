# Shaders

Collection of GLSL shaders for [Ghostty](https://ghostty.org)

## Dev

1. Install `glsl_analyzer` && `glslang`
2. Configure editor to use `glsl_analyzer` as the LSP && `glslang` as the linter
3. Create a `.frag` with the 'dev header';
   See other files in `/src`
4. Strip the "dev header" && comments, move result to `/out`;
   See `.nvim.lua`, which does exactly this
5. Run Ghostty with `ghostty --custom-shader={name}.frag`
6. Ghostty's config reload is mapped to `Ctrl Shift ,` by default
