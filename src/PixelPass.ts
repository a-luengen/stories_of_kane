import * as THREE from 'three';
import { CONFIG } from './config';
import { QUANT_PALETTE } from './render/palette';

const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uLowSize;      // low-res target size incl. border
uniform float uScale;       // integer upscale factor
uniform vec2 uOffset;       // sub-pixel camera remainder (low-res px)
uniform float uBorder;
uniform float uDepthRange;  // far - near
uniform float uPixelSize;   // world units per low-res pixel
uniform float uDepthThreshold;
uniform float uNormalHighlight;
uniform float uOutlineDarken;
uniform vec3 uOutlineColor; // sRGB
uniform bool uOutlines;
uniform bool uQuantize;
uniform vec3 uPalette[PALETTE_SIZE];

float depthAt(ivec2 p) { return texelFetch(tDepth, p, 0).r * uDepthRange; }
vec3 normalAt(ivec2 p) { return texelFetch(tNormal, p, 0).rgb * 2.0 - 1.0; }

vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 quantize(vec3 c) {
  float best = 1e9;
  vec3 res = c;
  for (int i = 0; i < PALETTE_SIZE; i++) {
    vec3 p = uPalette[i];
    vec3 d = c - p;
    float rm = (c.r + p.r) * 0.5;
    float dist = (2.0 + rm) * d.r * d.r + 4.0 * d.g * d.g + (3.0 - rm) * d.b * d.b;
    if (dist < best) { best = dist; res = p; }
  }
  return res;
}

void main() {
  vec2 p = gl_FragCoord.xy / uScale + uBorder + uOffset;
  ivec2 maxP = ivec2(uLowSize) - 1;
  ivec2 ip = clamp(ivec2(floor(p)), ivec2(0), maxP);
  vec3 col = toSRGB(texelFetch(tColor, ip, 0).rgb);

  if (uOutlines) {
    float d = depthAt(ip);
    vec3 n = normalAt(ip);
    vec3 pc = vec3(vec2(ip) * uPixelSize, -d);
    float depthEdge = 0.0;
    float normalEdge = 0.0;
    ivec2 offs[4] = ivec2[](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));
    for (int i = 0; i < 4; i++) {
      ivec2 q = clamp(ip + offs[i], ivec2(0), maxP);
      float dq = depthAt(q);
      float diff = dq - d; // > 0 when the neighbour is farther away
      depthEdge = max(depthEdge, diff);
      vec3 nq = normalAt(q);
      // Convex crease: the neighbour's surface point lies behind this pixel's tangent plane.
      vec3 pq = vec3(vec2(q) * uPixelSize, -dq);
      float convex = step(dot(n, pq - pc), -0.004);
      normalEdge = max(normalEdge, (1.0 - dot(n, nq)) * convex);
    }
    if (depthEdge > uDepthThreshold) {
      col = mix(col * uOutlineDarken, uOutlineColor, 0.45);
    } else if (normalEdge > 0.15) {
      col = col * (1.0 + uNormalHighlight);
    }
  }

  if (uQuantize) col = quantize(col);
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Low-res pixel-art pipeline:
 *  1. render colour into a small target (nearest filtering)
 *  2. render view-space normals + depth (override material) into a second small target
 *  3. full-screen pass: integer upscale with sub-pixel offset, depth/normal edge outlines,
 *     optional palette quantization.
 */
export class PixelPass {
  private colorRT: THREE.WebGLRenderTarget;
  private normalRT: THREE.WebGLRenderTarget;
  private normalMat = new THREE.MeshNormalMaterial();
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly material: THREE.ShaderMaterial;
  private clearColor = new THREE.Color();
  /** Objects omitted from the normal/depth pass (e.g. buildings currently dithered out). */
  readonly normalPassExclude: THREE.Object3D[] = [];
  /** Permanently omitted from the normal/depth pass: tiny bright effects that must never get outlined. */
  readonly unoutlined: THREE.Object3D[] = [];

  constructor() {
    const opts: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      depthBuffer: true,
    };
    this.colorRT = new THREE.WebGLRenderTarget(1, 1, { ...opts, type: THREE.HalfFloatType });
    // Depth for edge detection comes from the normal pass, which skips dithered (faded) occluders,
    // so faded buildings don't sprinkle outlines over everything behind them.
    this.normalRT = new THREE.WebGLRenderTarget(1, 1, opts);
    this.normalRT.depthTexture = new THREE.DepthTexture(1, 1);
    this.normalRT.depthTexture.type = THREE.UnsignedIntType;
    (this.normalMat as THREE.MeshNormalMaterial & { flatShading: boolean }).flatShading = true;

    const r = CONFIG.render;
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      defines: { PALETTE_SIZE: QUANT_PALETTE.length },
      uniforms: {
        tColor: { value: this.colorRT.texture },
        tNormal: { value: this.normalRT.texture },
        tDepth: { value: this.normalRT.depthTexture },
        uLowSize: { value: new THREE.Vector2(1, 1) },
        uScale: { value: 1 },
        uOffset: { value: new THREE.Vector2() },
        uBorder: { value: 1 },
        uDepthRange: { value: CONFIG.camera.far - CONFIG.camera.near },
        uDepthThreshold: { value: r.depthEdgeThreshold },
        uPixelSize: { value: r.unitsPerPixel },
        uNormalHighlight: { value: r.normalEdgeHighlight },
        uOutlineDarken: { value: r.outlineDarken },
        uOutlineColor: { value: srgbVec(r.outlineColor) },
        uOutlines: { value: r.outlines },
        uQuantize: { value: r.paletteQuantize },
        uPalette: { value: QUANT_PALETTE.map(srgbVec) },
      },
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.quadScene.add(quad);
  }

  /** @param lowW,lowH visible low-res size (without border) */
  setSize(lowW: number, lowH: number, scale: number): void {
    const w = lowW + 2;
    const h = lowH + 2;
    this.colorRT.setSize(w, h);
    this.normalRT.setSize(w, h);
    this.material.uniforms.uLowSize.value.set(w, h);
    this.material.uniforms.uScale.value = scale;
  }

  set outlines(v: boolean) {
    this.material.uniforms.uOutlines.value = v;
  }
  get outlines(): boolean {
    return this.material.uniforms.uOutlines.value;
  }
  set quantize(v: boolean) {
    this.material.uniforms.uQuantize.value = v;
  }
  get quantize(): boolean {
    return this.material.uniforms.uQuantize.value;
  }

  render(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    subpixel: THREE.Vector2,
  ): void {
    // Colour + depth (shadow map is refreshed once, here).
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(this.colorRT);
    renderer.render(scene, camera);

    // Normals: skip shadows and background for this pass.
    const bg = scene.background;
    renderer.getClearColor(this.clearColor);
    const clearAlpha = renderer.getClearAlpha();
    scene.background = null;
    scene.overrideMaterial = this.normalMat;
    const hidden = [...this.unoutlined, ...this.normalPassExclude].filter((o) => o.visible);
    for (const o of hidden) o.visible = false;
    renderer.setClearColor(0x8080ff, 1);
    renderer.setRenderTarget(this.normalRT);
    renderer.render(scene, camera);
    for (const o of hidden) o.visible = true;
    scene.overrideMaterial = null;
    scene.background = bg;
    renderer.setClearColor(this.clearColor, clearAlpha);

    this.material.uniforms.uOffset.value.copy(subpixel);
    renderer.setRenderTarget(null);
    renderer.render(this.quadScene, this.quadCam);
  }
}

function srgbVec(hex: number): THREE.Vector3 {
  return new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}
