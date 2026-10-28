'use client';

import { useEffect, useRef } from 'react';

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float terrain(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 turn = mat2(1.62, 1.18, -1.18, 1.62);

    for (int octave = 0; octave < 5; octave++) {
      value += noise(p) * amplitude;
      p = turn * p;
      amplitude *= 0.48;
    }

    return value;
  }

  float elevation(vec2 p, float time) {
    vec2 drift = vec2(time * 0.018, -time * 0.011);
    vec2 fold = vec2(terrain(p * 1.45 + 2.1), terrain(p * 1.45 - 3.6));
    float land = terrain(p * 3.1 + fold * 1.2 + drift);
    return land + 0.055 * sin(p.x * 2.4 - p.y * 2.2 + time * 0.035);
  }

  void main() {
    vec2 point = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    point += u_pointer * 0.055;

    float time = u_time;
    float height = elevation(point, time);
    float epsilon = 0.006;
    float slopeX = elevation(point + vec2(epsilon, 0.0), time) - height;
    float slopeY = elevation(point + vec2(0.0, epsilon), time) - height;
    vec3 normal = normalize(vec3(-slopeX * 14.0, -slopeY * 14.0, 0.42));
    vec3 lightDirection = normalize(vec3(-0.5, 0.62, 0.64));

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float contour = 1.0 - smoothstep(0.025, 0.075, abs(fract(height * 7.2) - 0.5));
    float specular = pow(max(dot(reflect(-lightDirection, normal), vec3(0.0, 0.0, 1.0)), 0.0), 20.0);
    float edgeShade = 1.0 - smoothstep(0.12, 0.82, length(point * vec2(0.88, 1.06)));

    vec3 graphite = vec3(0.035, 0.047, 0.049);
    vec3 steel = vec3(0.23, 0.31, 0.32);
    vec3 silver = vec3(0.76, 0.84, 0.82);
    vec3 mint = vec3(0.34, 0.84, 0.78);
    vec3 surface = mix(graphite, steel, clamp(diffuse * 0.76 + height * 0.19, 0.0, 0.86));
    surface += silver * specular * 0.6;
    surface = mix(surface, mint, contour * smoothstep(0.2, 0.9, diffuse) * 0.29);
    surface *= edgeShade;
    surface += graphite * (1.0 - edgeShade) * 0.82;

    gl_FragColor = vec4(surface, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function TerritoryShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false });
    if (!canvas || !gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    const resolution = gl.getUniformLocation(program, 'u_resolution');
    const pointer = gl.getUniformLocation(program, 'u_pointer');
    const time = gl.getUniformLocation(program, 'u_time');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let start = performance.now();
    let lastPaint = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
      width = Math.max(1, Math.round(rect.width * pixelRatio));
      height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
    };

    const draw = (now: number) => {
      if (!reducedMotion.matches && now - lastPaint < 1000 / 30) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      resize();
      const elapsed = reducedMotion.matches ? 0 : (now - start) / 1000;
      lastPaint = now;
      gl.uniform1f(time, elapsed);
      gl.uniform2f(pointer, pointerRef.current.x, pointerRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    draw(start);

    const onMotionPreferenceChange = () => {
      window.cancelAnimationFrame(frame);
      start = performance.now();
      if (reducedMotion.matches) draw(start);
      else frame = window.requestAnimationFrame(draw);
    };
    reducedMotion.addEventListener('change', onMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(frame);
      reducedMotion.removeEventListener('change', onMotionPreferenceChange);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="territory-shader" role="img" aria-label="A slowly shifting metallic topographic map with captured territory contours" />;
}
