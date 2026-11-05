import {
  AdditiveBlending, BufferAttribute, BufferGeometry, PerspectiveCamera, Points,
  Scene, ShaderMaterial, Vector2, WebGLRenderer,
} from 'three';

async function readLogo(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  const scale = 320 / Math.max(image.naturalWidth, image.naturalHeight);
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = [];
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 128) continue;
    const pixel = index / 4;
    pixels.push({
      x: (pixel % canvas.width - canvas.width / 2) * 3.9 / 320,
      y: (canvas.height / 2 - Math.floor(pixel / canvas.width)) * 3.9 / 320,
      color: [data[index] / 255, data[index + 1] / 255, data[index + 2] / 255],
    });
  }
  if (!pixels.length) throw new Error('Le SVG doit contenir une silhouette visible.');
  return pixels;
}

function particleGeometry(count, pixels) {
  let seed = 4538;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const attributes = Object.fromEntries(
    ['position', 'aLogo', 'aSignal', 'aGrowth', 'aColor'].map((name) => [name, new Float32Array(count * 3)]),
  );
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    const angle = random() * Math.PI * 2;
    const radius = 0.28 + Math.sqrt(random()) * 2.15;
    attributes.position.set([
      Math.cos(angle + radius) * radius,
      Math.sin(angle + radius) * radius * 0.77,
      (random() - 0.5) * 2.7,
    ], offset);

    const logo = pixels[Math.floor(random() * pixels.length)];
    attributes.aLogo.set([logo.x, logo.y, 0], offset);
    attributes.aColor.set(logo.color, offset);

    const lane = i % 4;
    const x = (random() - 0.5) * 4.3;
    const y = (lane - 1.5) * 0.66 + Math.sin(x * 2.2 + lane) * 0.19;
    attributes.aSignal.set([x, y + (random() - 0.5) * 0.13, (random() - 0.5) * 0.22], offset);

    const width = random() - 0.5;
    const progress = random();
    const head = progress > 0.7;
    const along = head ? 0.55 + (progress - 0.7) * 4.4 : -2.45 + progress * 4.3;
    const across = width * (head ? 1.85 * (1 - (progress - 0.7) / 0.3) : 0.38);
    attributes.aGrowth.set([0.78 * along - 0.63 * across, 0.63 * along + 0.78 * across, 0], offset);
    seeds[i] = random();
  }
  const geometry = new BufferGeometry();
  for (const [name, values] of Object.entries(attributes)) {
    geometry.setAttribute(name, new BufferAttribute(values, 3));
  }
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  return geometry;
}

const vertexShader = /* glsl */ `
  attribute vec3 aLogo, aSignal, aGrowth, aColor;
  attribute float aSeed;
  uniform float uTime, uMorph, uSize, uPointerActive;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float logo = smoothstep(0.0, 1.0, uMorph);
    float signal = smoothstep(1.0, 2.0, uMorph);
    float growth = smoothstep(2.0, 3.0, uMorph);
    vec3 cloud = position;
    float phase = uTime * 0.17;
    cloud.xy = mat2(cos(phase), sin(phase), -sin(phase), cos(phase)) * cloud.xy;
    cloud.z += sin(uTime + aSeed * 20.0) * 0.12;
    vec3 point = mix(mix(mix(cloud, aLogo, logo), aSignal, signal), aGrowth, growth);
    vec2 delta = point.xy - uPointer;
    float proximity = exp(-dot(delta, delta) * 3.3) * uPointerActive;
    point.xy += delta * proximity * mix(1.4, 0.4, logo * (1.0 - signal));
    point.z += proximity * 0.2;
    vec3 cyan = vec3(0.34, 0.94, 1.0);
    vec3 violet = vec3(0.61, 0.33, 1.0);
    vec3 gold = vec3(1.0, 0.87, 0.26);
    vec3 base = mix(violet, cyan, step(0.62, aSeed));
    base = mix(base, gold, step(0.94, aSeed));
    vColor = mix(mix(mix(base, aColor, logo), cyan, signal), gold, growth);
    vAlpha = (0.43 + 0.4 * aSeed) * (0.87 + 0.13 * sin(uTime * 1.6 + aSeed * 33.0));
    vec4 view = modelViewMatrix * vec4(point, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(uSize * (1.1 + aSeed * 1.3) * 7.0 / -view.z, 1.0, 7.0);
  }
`;
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.12, 1.0, radius)) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export async function mountParticles(host, logoUrl, signal, onContextLost) {
  const pixels = await readLogo(logoUrl);
  if (signal.aborted) return null;

  const renderer = new WebGLRenderer({ alpha: true, powerPreference: 'low-power' });
  const canvas = renderer.domElement;
  const scene = new Scene();
  const camera = new PerspectiveCamera(39, 1, 0.1, 30);
  const coarse = matchMedia('(pointer: coarse)').matches || host.clientWidth < 500;
  const geometry = particleGeometry(coarse ? 4300 : 9000, pixels);
  const state = { morph: 0, orbit: 0.25 };
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: 1 },
    uPointer: { value: new Vector2() }, uPointerActive: { value: 0 },
  };
  const material = new ShaderMaterial({
    uniforms, vertexShader, fragmentShader, transparent: true,
    depthWrite: false, blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  host.append(canvas);

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.position.z = 7.45 * Math.max(1, 1 / camera.aspect);
    camera.updateProjectionMatrix();
    const dpr = Math.min(devicePixelRatio || 1, coarse ? 1.4 : 1.8);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    uniforms.uSize.value = dpr;
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const target = new Vector2();
  let active = 0;
  function move(event) {
    const rect = host.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    active = Number(x >= 0 && x <= 1 && y >= 0 && y <= 1);
    const halfHeight = camera.position.z * Math.tan(camera.fov * Math.PI / 360);
    target.set((x * 2 - 1) * halfHeight * camera.aspect, (1 - y * 2) * halfHeight);
  }
  function release() { active = 0; }
  function lost(event) {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    canvas.hidden = true;
    onContextLost();
  }
  canvas.addEventListener('webglcontextlost', lost);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  const visibility = new IntersectionObserver(([entry]) => {
    renderer.setAnimationLoop(entry.isIntersecting && !canvas.hidden ? draw : null);
  });
  visibility.observe(host);

  function draw() {
    uniforms.uTime.value = performance.now() / 1000;
    uniforms.uMorph.value = state.morph;
    uniforms.uPointer.value.lerp(target, 0.15);
    uniforms.uPointerActive.value += (active - uniforms.uPointerActive.value) * 0.13;
    points.rotation.y = state.orbit;
    renderer.render(scene, camera);
  }
  draw();

  return {
    state,
    dispose() {
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      canvas.removeEventListener('webglcontextlost', lost);
      renderer.setAnimationLoop(null);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
