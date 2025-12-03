export const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texCoord = a_texCoord;
    }
`;

export const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;
    uniform float u_time;
    
    // Filter toggles
    uniform bool u_vcrCurve;
    uniform bool u_scanlines;
    uniform bool u_glitch;
    uniform bool u_rgbShift;
    uniform bool u_vignette;

    // VCR Curve
    vec2 curve(vec2 uv) {
        uv = (uv - 0.5) * 2.0;
        uv *= 1.1;	
        uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
        uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
        uv  = (uv / 2.0) + 0.5;
        uv =  uv * 0.92 + 0.04;
        return uv;
    }

    // Random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = v_texCoord;
        
        // 1. VCR Curve
        if (u_vcrCurve) {
            uv = curve(uv);
        }

        // Check bounds after curve
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }

        vec4 color = texture2D(u_image, uv);

        // 2. Glitch Effect
        if (u_glitch) {
            float glitchTime = u_time * 0.5;
            float r = random(vec2(floor(glitchTime), uv.y));
            if (r > 0.98) {
                float offset = (random(vec2(u_time, uv.y)) - 0.5) * 0.05;
                uv.x += offset;
                color = texture2D(u_image, uv);
            }
        }

        // 3. RGB Shift (Chromatic Aberration)
        if (u_rgbShift) {
            float shift = 0.003;
            float r = texture2D(u_image, uv + vec2(shift, 0.0)).r;
            float g = texture2D(u_image, uv).g;
            float b = texture2D(u_image, uv - vec2(shift, 0.0)).b;
            color = vec4(r, g, b, color.a);
        }

        // 4. Scanlines
        if (u_scanlines) {
            float scanline = sin(uv.y * 800.0) * 0.04;
            color.rgb -= scanline;
        }

        // 5. Vignette
        if (u_vignette) {
            float dist = distance(uv, vec2(0.5, 0.5));
            color.rgb *= smoothstep(0.8, 0.2, dist * (1.0 + color.g));
        }

        // Add a slight noise for realism if any retro effect is on
        if (u_vcrCurve || u_scanlines) {
             float noise = random(uv * u_time) * 0.05;
             color.rgb += noise;
        }

        gl_FragColor = color;
    }
`;
