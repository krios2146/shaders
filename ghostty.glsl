#define CURSORSTYLE_BLOCK 0
#define CURSORSTYLE_BLOCK_HOLLOW 1
#define CURSORSTYLE_BAR 2
#define CURSORSTYLE_UNDERLINE 3
#define CURSORSTYLE_LOCK 4

uniform sampler2D iChannel0; // A texture containing the current terminal screen
uniform vec3 iResolution; // Output texture size, [width, height, 1] (in px)
uniform float iTime; // Time in seconds since first frame was rendered
uniform float iTimeDelta; // Time in seconds since previous frame was rendered
uniform int iFrame; // Number of frames that have been rendered so far

uniform vec4 iCurrentCursor; // xy is the -X, +Y corner of the cursor, zw is its width and height
uniform vec4 iPreviousCursor;
uniform vec4 iCurrentCursorColor;
uniform vec4 iPreviousCursorColor;
uniform vec4 iCurrentCursorStyle;
uniform vec4 iPreviousCursorStyle;
uniform vec4 iCursorVisible;
uniform float iTimeCursorChange; // use iTime - iTimeCursorChange for time since
uniform float iTimeFocus; // use iTime - iTimeFocus for time since
uniform int iFocus; // 1 = focused, 0 = unfocused

uniform vec3 iPalette[256]; // RGB in [0,1]. 0-15 ANSI, 16-231 6x6x6 color cube, 232-255 grayscale
uniform vec3 iBackgroundColor;
uniform vec3 iForegroundColor;
uniform vec3 iCursorColor;
uniform vec3 iCursorText;
uniform vec3 iSelectionBackgroundColor;
uniform vec3 iSelectionForegroundColor;
