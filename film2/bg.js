// Live blue background: large soft light masses with folded edges (WebGL), a pure function of time.
// A second canvas carries film grain. Everything is deterministic in t.
const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const BG_FS = `precision highp float;
uniform vec2 R; uniform float T; uniform float E; uniform float L; uniform vec2 F; uniform vec4 K;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=.5, s=0.; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<3;i++){ s+=a*n(p); p=m*p; a*=.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / R; vec2 p = (gl_FragCoord.xy - .5*R) / R.y;
  float t = T * .11;
  // soft warp of space so the edges of the light masses fold like silk
  vec2 w = vec2(fbm(p*1.1 + vec2(0., t*.7)), fbm(p*1.1 + vec2(4.1, -t*.6))) - .5;
  vec2 pw = p + w * .55 + K.xy;
  float fld = 0.;
  for (int i = 0; i < 5; i++) {
    float k = float(i);
    vec2 c = vec2(.78*sin(t*(.50+.13*k) + k*2.1), .42*cos(t*(.41+.11*k) + k*1.37));
    float s = (.34 + .07*sin(k*3.1 + t*.3)) * K.z;
    fld += (.62 + .25*sin(k*1.7)) * exp(-dot(pw-c, pw-c) / (s*s));
  }
  fld = clamp(fld * K.w, 0., 1.6);
  float body = smoothstep(.26, .62, fld);
  float core = smoothstep(.70, 1.25, fld);
  float edge = smoothstep(.30, .42, fld) * (1. - smoothstep(.42, .62, fld));
  vec3 deep  = vec3(0.006, 0.016, 0.048);
  vec3 navy  = vec3(0.016, 0.060, 0.190);
  vec3 brand = vec3(0.102, 0.412, 0.941);   // #1A69F0
  vec3 light = vec3(0.230, 0.540, 1.000);
  vec3 cyan  = vec3(0.102, 0.635, 0.902);   // #1AA2E6, logo gradient end
  vec3 col = mix(deep, navy, smoothstep(.0, .35, fld));
  col = mix(col, brand * (.78 + .30*E), body);
  col = mix(col, light, core * (.38 + .25*E));
  col += cyan * edge * .07;
  // calm zone behind the hero object
  float v = length((uv - F) * vec2(R.x/R.y, 1.));
  col *= mix(1., .55, (1. - smoothstep(.15, .75, v)) * L);
  col *= .62 + .38 * smoothstep(1.25, .25, length(p*vec2(.85,1.)));
  col += (h(gl_FragCoord.xy + fract(T)*91.) - .5) / 255.;
  gl_FragColor = vec4(col, 1.);
}`;
const GR_FS = `precision highp float; uniform vec2 R; uniform float S;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + S) * 43758.5453); }
void main(){ float g = h(gl_FragCoord.xy) + h(gl_FragCoord.xy*1.37+3.1) - 1.; gl_FragColor = vec4(vec3(.5 + g*.5), 1.); }`;

function glProg(canvas, fs) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; for (const n of ['R', 'T', 'E', 'L', 'F', 'S', 'K']) U[n] = gl.getUniformLocation(pr, n);
  return { gl, U };
}
// o: { energy 0..1, focus 0..1 (darken around fx,fy), fx, fy (0..1 of screen), dx, dy (shift of light field), size, gain }
export function makeBackground(bgCanvas, grainCanvas) {
  const B = glProg(bgCanvas, BG_FS), G = glProg(grainCanvas, GR_FS);
  return {
    draw(t, o = {}) {
      const { gl, U } = B; gl.useProgram && 0; gl.viewport(0, 0, bgCanvas.width, bgCanvas.height);
      gl.uniform2f(U.R, bgCanvas.width, bgCanvas.height); gl.uniform1f(U.T, t + 40.0);
      gl.uniform1f(U.E, o.energy ?? 0); gl.uniform1f(U.L, o.focus ?? 0); gl.uniform2f(U.F, o.fx ?? .5, 1 - (o.fy ?? .5));
      gl.uniform4f(U.K, o.dx ?? 0, o.dy ?? 0, o.size ?? 1, o.gain ?? 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const g = G.gl; g.viewport(0, 0, grainCanvas.width, grainCanvas.height);
      g.uniform2f(G.U.R, grainCanvas.width, grainCanvas.height); g.uniform1f(G.U.S, Math.round(t * 60) % 997 * 0.731);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    }
  };
}
