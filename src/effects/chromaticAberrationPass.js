import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const subtleCinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: [window.innerWidth, window.innerHeight] },
    amount: { value: 0.0018 },
    vignette: { value: 0.34 },
    noise: { value: 0.022 },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float amount;
    uniform float vignette;
    uniform float noise;
    varying vec2 vUv;

    float random(vec2 value) {
      return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 center = vUv - 0.5;
      vec2 offset = center * amount;

      float red = texture2D(tDiffuse, vUv + offset).r;
      float green = texture2D(tDiffuse, vUv).g;
      float blue = texture2D(tDiffuse, vUv - offset).b;
      vec3 color = vec3(red, green, blue);

      float edge = 1.0 - smoothstep(vignette, 0.82, length(center));
      float grain = (random(vUv * resolution.xy) - 0.5) * noise;
      color = color * mix(0.68, 1.0, edge) + grain;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export function createChromaticAberrationPass() {
  return new ShaderPass(subtleCinematicShader);
}
