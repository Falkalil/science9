// أدوات مشتركة لبناء المجسّمات
import * as THREE from 'three';
export { THREE };

/* ── واقعيّة: خريطةُ نتوءاتٍ دقيقةٍ مشتركة + بيئةُ إضاءةِ استوديو ── */
let _bump = null;
export function microBump() { if (_bump) return _bump; const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
  const h = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const n = (x, y) => { const X = Math.floor(x), Y = Math.floor(y), fx = x - X, fy = y - Y, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = 16; const H = (a, b) => h(((a % w) + w) % w, ((b % w) + w) % w);
    return H(X, Y) * (1 - u) * (1 - v) + H(X + 1, Y) * u * (1 - v) + H(X, Y + 1) * (1 - u) * v + H(X + 1, Y + 1) * u * v; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const x = i / S * 16, y = j / S * 16; const v = n(x, y) * .55 + n(x * 2, y * 2) * .3 + n(x * 4, y * 4) * .15; const k = (j * S + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = v * 255; im.data[k + 3] = 255; }
  g.putImageData(im, 0, 0); _bump = new THREE.CanvasTexture(c); _bump.wrapS = _bump.wrapT = THREE.RepeatWrapping; return _bump; }
let _env = null;
/** بيئةُ استوديو (صورةٌ بانوراميّة) تُحوَّلُ تلقائيًّا لكلِّ مُصيِّر؛ تعطي انعكاساتٍ وإضاءةً ناعمة */
export function studioEnv() { if (_env) return _env; const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#c9d3e2'); gr.addColorStop(.45, '#8a93a3'); gr.addColorStop(.55, '#6b6458'); gr.addColorStop(1, '#2e2a26'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const box = (x, y, w, h, col, blur) => { g.filter = `blur(${blur}px)`; g.fillStyle = col; g.fillRect(x, y, w, h); g.filter = 'none'; };
  box(200, 18, 120, 40, '#ffffff', 6); box(40, 70, 60, 70, '#fff1e0', 8); box(400, 60, 70, 80, '#dfe9ff', 8); box(0, 120, 512, 10, '#f4f4f4', 10);
  _env = new THREE.CanvasTexture(c); _env.mapping = THREE.EquirectangularReflectionMapping; _env.colorSpace = THREE.SRGBColorSpace; return _env; }
export function realRenderer(r) { r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.12; r.outputColorSpace = THREE.SRGBColorSpace; return r; }
export function realScene(scene) { scene.environment = studioEnv(); scene.environmentIntensity = .9; return scene; }

export function mat(color, o = {}) {
  const base = { color, roughness: 0.55, metalness: 0.0, clearcoat: .18, clearcoatRoughness: .45, sheen: .25, sheenRoughness: .6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .5) };
  if (!o.flatShading && !o.map && !o.vertexColors && o.bump !== false) { base.bumpMap = microBump(); base.bumpScale = .35; }
  else if (o.map && !o.bumpMap && o.bump !== false && o.map.isCanvasTexture) { base.bumpMap = o.map; base.bumpScale = 2.5; }
  const q = Object.assign({}, o); delete q.bump;
  return new THREE.MeshPhysicalMaterial(Object.assign(base, q));
}
export function glass(color, opacity = 0.35, o = {}) {
  return new THREE.MeshPhysicalMaterial(Object.assign({ color, transparent: true, opacity, roughness: 0.12, clearcoat: 1, clearcoatRoughness: .1, depthWrite: false }, o));
}
export function mesh(geo, material, pos, rot, scale) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) (typeof scale === 'number') ? m.scale.setScalar(scale) : m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function tube(points, r, material, seg = 48, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, radial, false), material);
  m.castShadow = true; m.userData.curve = curve;
  return m;
}
export function curve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new THREE.Vector3(...p)));
}
export function anchor(parent, pos) {
  const a = new THREE.Object3D(); a.position.set(...pos); parent.add(a); return a;
}
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// نسيج خلايا مرسوم للطبقات
export function cellTexture(base, line, cols = 8, rows = 8, jitter = 0.25, w = 256, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.strokeStyle = line; g.lineWidth = 2;
  const cw = w / cols, ch = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const off = (j % 2) * cw * 0.5;
    const x = i * cw + off + (Math.random() - .5) * cw * jitter, y = j * ch + (Math.random() - .5) * ch * jitter;
    g.beginPath(); g.ellipse(x, y, cw * 0.48, ch * 0.46, 0, 0, Math.PI * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function noiseTexture(c1, c2, n = 2500, w = 256, h = 256, size = 5) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = c1; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { g.fillStyle = Math.random() < .5 ? c2 : c1; g.globalAlpha = Math.random() * .5; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * size + 1, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// جسيمات تتحرك على مسارات (ماء، سكر، حبوب لقاح...)
export class Flow {
  constructor(parent, color, radius = 0.04, max = 80) {
    this.items = []; this.parent = parent; this.rate = 1; this.acc = 0; this.on = true;
    this.geo = new THREE.SphereGeometry(radius, 10, 8);
    this.mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: .3 });
    this.max = max; this.paths = [];
  }
  addPath(c, speed = 0.25, weight = 1) { this.paths.push({ c, speed, weight }); return this; }
  spawn() {
    if (!this.paths.length || this.items.length >= this.max) return;
    const tot = this.paths.reduce((s, p) => s + p.weight, 0); let r = Math.random() * tot, p = this.paths[0];
    for (const q of this.paths) { r -= q.weight; if (r <= 0) { p = q; break; } }
    const m = new THREE.Mesh(this.geo, this.mat); m.userData = { p, t: 0 };
    this.parent.add(m); this.items.push(m);
  }
  update(dt) {
    if (this.on) { this.acc += dt * this.rate; while (this.acc > 1) { this.acc -= 1; this.spawn(); } }
    for (let i = this.items.length - 1; i >= 0; i--) {
      const m = this.items[i], u = m.userData; u.t += dt * u.p.speed;
      if (u.t >= 1) { this.parent.remove(m); this.items.splice(i, 1); continue; }
      m.position.copy(u.p.c.getPointAt(u.t));
    }
  }
  clear() { for (const m of this.items) this.parent.remove(m); this.items = []; }
}

export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(x, a = 0, b = 1) { return Math.max(a, Math.min(b, x)); }
export function ease(t) { t = clamp(t); return t * t * (3 - 2 * t); }

// ── تضاريس: سطح بارتفاعات وألوان، مع جوانب طبقات ──
export function strataTexture(bands, w = 64, h = 512) {
  // bands: [[color, thickness], ...] من الأسفل إلى الأعلى
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tot = bands.reduce((s, b) => s + b[1], 0); let y = h;
  for (const [col, t] of bands) { const hh = t / tot * h; g.fillStyle = col; g.fillRect(0, y - hh, w, hh + 1); y -= hh; }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .12})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 8, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
export function terrain({ w, d, nx = 120, nz = 80, h, color, bottom = -2, top = 4, sideTex = null, sideColor = '#8b6a46', sides = [true, true, true, true] }) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, d, nx, nz); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, cols = new Float32Array(p.count * 3), col = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = h(x, z); p.setY(i, y); col.set(color(x, z, y)).multiplyScalar(.9 + (fbm3(x * 1.7, y * 1.7, z * 1.7) + 1) * .11); cols.set([col.r, col.g, col.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const surf = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .9, flatShading: false, sheen: .2, bumpMap: tissueBump('pore', 50), bumpScale: 2.2 })); surf.receiveShadow = true; g.add(surf);
  const sm = sideTex ? new THREE.MeshStandardMaterial({ map: sideTex, roughness: .95, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color: sideColor, roughness: .95, side: THREE.DoubleSide });
  const edges = [[-w / 2, -d / 2, w / 2, -d / 2, nx], [w / 2, -d / 2, w / 2, d / 2, nz], [w / 2, d / 2, -w / 2, d / 2, nx], [-w / 2, d / 2, -w / 2, -d / 2, nz]];
  edges.forEach(([x0, z0, x1, z1, n], k) => {
    if (!sides[k]) return; const pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = h(x, z); pos.push(x, y, z, x, bottom, z); uv.push(t * 4, (y - bottom) / (top - bottom), t * 4, 0); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    g.add(new THREE.Mesh(sg, sm));
  });
  const bot = new THREE.Mesh(new THREE.PlaneGeometry(w, d), sm); bot.rotation.x = Math.PI / 2; bot.position.y = bottom; g.add(bot);
  g.userData.surf = surf; return g;
}
// جسم غير مرئي تقريبًا لتحديد منطقة يمكن لمسها
export function proxy(parent, pos, size, shape = 'sphere') {
  const geo = shape === 'box' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(.5, 20, 14);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(...pos); m.scale.set(...size); parent.add(m); return m;
}
export function smooth(e0, e1, x) { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }
export function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
export function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi; const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export function fbm(x, z, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, z * f); a *= .5; f *= 2; } return s; }
const _gc = {}; const _G = (k, f) => _gc[k] || (_gc[k] = f());
export function tree(s = 1, leaf = '#3f8f32', trunk = '#7a5230') {
  const g = new THREE.Group(); const bark = _G('barkM' + trunk, () => tissue(trunk, { kind: 'vein', bumpScale: 2.2, roughness: .9, clearcoat: 0, sheen: 0 }));
  g.add(mesh(_G('trunk', () => vesselGeo([[0, 0, 0], [.02, .3, 0], [-.02, .62, .01]], .1, .055, 16, 10, .08)), bark));
  const lm = (() => new THREE.MeshPhysicalMaterial({ color: leaf, roughness: .75, sheen: .8, sheenColor: new THREE.Color(leaf).lerp(new THREE.Color('#ffffcc'), .5), bumpMap: tissueBump('pore', 4), bumpScale: 3 }))();
  const lm2 = lm.clone(); lm2.color = new THREE.Color(leaf).multiplyScalar(.78);
  const blob = k => _G('crown' + k, () => organGeo(1, v => v.multiplyScalar(1 + fbm3(v.x * 2.3 + k, v.y * 2.3, v.z * 2.3) * .28), 28, 20));
  [[0, .88, 0, .42, 0], [.22, 1.06, .1, .32, 1], [-.2, 1.0, -.08, .3, 2], [.02, 1.2, -.1, .27, 1], [-.08, .82, .22, .26, 2]].forEach(([x, y, z, r, k], i) => g.add(mesh(blob(k), i % 2 ? lm2 : lm, [x, y, z], null, [r, r * .92, r])));
  g.scale.setScalar(s); return g;
}
export function pine(s = 1, leaf = '#2f6e34') { const g = new THREE.Group(); g.add(mesh(_G('ptrunk', () => vesselGeo([[0, 0, 0], [0, .45, 0]], .07, .04, 8, 8, .06)), _G('pbark', () => tissue('#6b4a2e', { kind: 'vein', bumpScale: 2, roughness: .9, clearcoat: 0, sheen: 0 })))); const lm = _G('pleaf' + leaf, () => new THREE.MeshPhysicalMaterial({ color: leaf, roughness: .8, sheen: .6, sheenColor: new THREE.Color('#d8f0c0'), bumpMap: tissueBump('vein', 6), bumpScale: 3 })); for (let i = 0; i < 4; i++) g.add(mesh(_G('pcone' + i, () => { const c = new THREE.ConeGeometry(.4 - i * .08, .5, 20, 6), P = c.attributes.position, v = new THREE.Vector3(); for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k); const r = Math.hypot(v.x, v.z); if (r > .01) { const f = 1 + fbm3(v.x * 6 + i, v.y * 6, v.z * 6) * .25 + Math.sin(Math.atan2(v.z, v.x) * 9) * .06; v.x *= f; v.z *= f; } if (v.y < -.2) v.y -= r * .25; P.setXYZ(k, v.x, v.y, v.z); } c.computeVertexNormals(); return c; }), lm, [0, .5 + i * .26, 0])); g.scale.setScalar(s); return g; }
export function cloud(s = 1, color = '#ffffff') { const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color, roughness: 1, transparent: true, opacity: .93, sheen: 1, sheenColor: new THREE.Color('#ffffff'), depthWrite: false }); const geo = _G('cloud', () => organGeo(1, v => v.multiplyScalar(1 + fbm3(v.x * 2.5, v.y * 2.5, v.z * 2.5) * .18), 32, 22)); for (const [x, y, z, r] of [[0, 0, 0, .7], [.7, -.1, .1, .55], [-.7, -.1, 0, .55], [.3, .35, -.1, .5], [-.3, .3, .1, .5], [1.2, -.2, 0, .4], [-1.2, -.2, -.1, .4]]) g.add(mesh(geo, m, [x, y, z], null, [r, r * .85, r])); g.scale.setScalar(s); g.userData.mat = m; return g; }
export function arrowTube(points, r, color, headLen = .35) {
  const g = new THREE.Group(); const c = curve(points); const m = mat(color, { roughness: .5, emissive: color, emissiveIntensity: .15 });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 10), m));
  const end = c.getPoint(1), tan = c.getTangent(1); const h = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, headLen, 16), m); h.position.copy(end); h.quaternion.setFromUnitVectors(V(0, 1, 0), tan); g.add(h);
  g.userData.curve = c; return g;
}
export function house(s = 1) { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(1, .7, .8), mat('#f2efe6'), [0, .35, 0])); const roof = mesh(new THREE.ConeGeometry(.82, .45, 4), mat('#2f7f8a'), [0, .92, 0], [0, Math.PI / 4, 0]); roof.scale.set(1, 1, .85); g.add(roof); g.add(mesh(new THREE.BoxGeometry(.14, .4, .14), mat('#9a5b3a'), [.28, 1.05, 0])); g.add(mesh(new THREE.BoxGeometry(.22, .3, .02), mat('#7a4a2a'), [0, .15, .41])); for (const x of [-.3, .3]) g.add(mesh(new THREE.BoxGeometry(.18, .16, .02), mat('#8ec5e8'), [x, .45, .41])); g.scale.setScalar(s); g.userData.chimney = V(.28 * s, 1.25 * s, 0); return g; }
export function deer(s = 1, c = '#9a6a3d') { const g = new THREE.Group(); const d = creature('🦌', 1.15 * s); d.rotation.y = 0; g.add(d); d.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(d); d.position.y = -b.min.y; return g; }

/* ═════════ أدواتُ المجسّماتِ الواقعيّة ═════════ */
const _h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
export function noise3(x, y, z) { const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), fx = x - X, fy = y - Y, fz = z - Z, u = f => f * f * (3 - 2 * f);
  let r = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) r += _h3(X + i, Y + j, Z + k) * (i ? u(fx) : 1 - u(fx)) * (j ? u(fy) : 1 - u(fy)) * (k ? u(fz) : 1 - u(fz)); return r * 2 - 1; }
export const fbm3 = (x, y, z) => noise3(x, y, z) * .6 + noise3(x * 2.1, y * 2.1, z * 2.1) * .28 + noise3(x * 4.3, y * 4.3, z * 4.3) * .12;
const _tex = {};
/** خريطةُ نسيجٍ عضويّ (عروقٌ دقيقةٌ أو مسامّ) */
export function tissueBump(kind = 'vein', seed = 1) { const key = kind + seed; if (_tex[key]) return _tex[key]; const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), img = x.createImageData(S, S), w = 8;
  const T = (a, b, s) => { const P = (p, q) => _h3(((p % w) + w) % w, ((q % w) + w) % w, s); const A = Math.floor(a), B = Math.floor(b), fa = a - A, fb = b - B, ua = fa * fa * (3 - 2 * fa), ub = fb * fb * (3 - 2 * fb); return P(A, B) * (1 - ua) * (1 - ub) + P(A + 1, B) * ua * (1 - ub) + P(A, B + 1) * (1 - ua) * ub + P(A + 1, B + 1) * ua * ub; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const u = i / S * w, v = j / S * w; let n = T(u, v, seed) * .6 + T(u * 2, v * 2, seed) * .3 + T(u * 4, v * 4, seed) * .1;
    if (kind === 'vein') n = Math.max(n * .7, 1 - Math.abs(T(u * 1.5 % w, v * 1.5 % w, seed + 3) - .5) * 10); if (kind === 'pore') n = n > .62 ? .2 : n;
    const k = (j * S + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = n * 255; img.data[k + 3] = 255; }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return (_tex[key] = t); }
/** خامةٌ عضويّةٌ رطبة (أنسجة، أعضاء) */
export function tissue(color, o = {}) { return new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: .38, clearcoat: .7, clearcoatRoughness: .25, sheen: .5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .55), bumpMap: tissueBump(o.kind || 'vein', o.seed || 1), bumpScale: .8 }, o.kind ? Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'kind' && k !== 'seed')) : o)); }
/** وعاءٌ أو أنبوبٌ عضويٌّ يضيقُ تدريجيًّا */
export function vesselGeo(pts, r0, r1, seg = 60, rad = 14, wob = .05) { const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p : new THREE.Vector3(...p)), false, 'centripetal'); const g = new THREE.TubeGeometry(c, seg, 1, rad, false), P = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) { const t = i / seg, ctr = c.getPointAt(t), r = (r0 + (r1 - r0) * Math.pow(t, .8)) * (1 + wob * Math.sin(t * 37 + r0 * 50));
    for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(P, k).sub(ctr).multiplyScalar(r).add(ctr); P.setXYZ(k, v.x, v.y, v.z); } }
  g.computeVertexNormals(); g.userData = { curve: c }; return g; }
export function vessel(pts, r0, r1, material, seg, rad, wob) { const g = vesselGeo(pts, r0, r1, seg, rad, wob), m = new THREE.Mesh(g, material); m.castShadow = true; m.userData.curve = g.userData.curve; return m; }
/** دمجُ أشكالٍ كثيرةٍ في شكلٍ واحد */
export function mergeGeos(geos) { let n = 0, ni = 0; geos.forEach(g => { if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]); n += g.attributes.position.count; ni += g.index.count; }); const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx = new Uint32Array(ni); let o = 0, oi = 0;
  geos.forEach(g => { pos.set(g.attributes.position.array, o * 3); if (!g.attributes.normal) g.computeVertexNormals(); nor.set(g.attributes.normal.array, o * 3); const I = g.index.array; for (let i = 0; i < I.length; i++) idx[oi + i] = I[i] + o; o += g.attributes.position.count; oi += I.length; });
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setIndex(new THREE.BufferAttribute(idx, 1)); return G; }
let _rs = 7; export const srnd = () => (_rs = (_rs * 16807) % 2147483647) / 2147483647; export const reseed = s => { _rs = s; };
/** تفرّعاتٌ عضويّة (شعيرات، أعصاب، جذور) تُضافُ إلى قائمةِ أشكال */
export function twigs(list, from, dir, len, r, depth, spread = 1.1, seg = 8) { if (depth <= 0 || r < .004) return; const n = 2 + (srnd() < .4 ? 1 : 0), R = () => new THREE.Vector3(srnd() - .5, srnd() - .5, srnd() - .5);
  for (let i = 0; i < n; i++) { const d = dir.clone().add(R().multiplyScalar(spread)).normalize(), l = len * (.6 + srnd() * .5);
    const mid = from.clone().addScaledVector(d, l * .5).add(R().multiplyScalar(l * .25)), end = from.clone().addScaledVector(d, l);
    list.push(vesselGeo([from, mid, end], r, r * .55, seg, 6)); twigs(list, end, d, len * .7, r * .62, depth - 1, spread, seg); } }
/** شكلٌ كرويٌّ مُشوَّهٌ بدالّة (لصنعِ الأعضاء) */
export function organGeo(r, fn, ws = 64, hs = 48) { const g = new THREE.SphereGeometry(r, ws, hs), P = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); fn(v); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
/** رقمٌ أخضرُ في دائرةٍ صفراء (كما في الكتاب) */
export function badge(n, size = .26, fill = '#ffe94a', ring = '#3cb44a', ink = '#1d6b27') { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = fill; x.beginPath(); x.arc(48, 48, 44, 0, 7); x.fill(); x.lineWidth = 7; x.strokeStyle = ring; x.stroke();
  x.fillStyle = ink; x.font = '700 54px Tahoma'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]), 48, 52);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.setScalar(size); sp.renderOrder = 11; sp.userData.glow = true; return sp; }
/** أسهمٌ متحرّكةٌ على مسار (مخروطاتٌ تنزلق) */
export class ArrowFlow { constructor(parent, paths, color = '#36c24a', size = 1) { this.g = new THREE.Group(); parent.add(this.g); this.items = []; const m = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: .35, roughness: .3, clearcoat: 1 }); const geo = new THREE.ConeGeometry(.045 * size, .12 * size, 18); geo.rotateX(Math.PI / 2);
    paths.forEach(p => { const c = p.isCurve ? p : new THREE.CatmullRomCurve3(p.map(q => new THREE.Vector3(...q))), L = c.getLength(), n = Math.max(3, Math.round(L / (.22 * size)));
      const line = new THREE.Mesh(new THREE.TubeGeometry(c, 40, .012 * size, 8, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5 })); line.renderOrder = 6; line.userData.glow = true; this.g.add(line);
      for (let i = 0; i < n; i++) { const a = new THREE.Mesh(geo, m); a.renderOrder = 6; a.userData.glow = true; this.g.add(a); this.items.push({ a, c, t: i / n }); } }); }
  update(dt, sp = .25) { if (!this.g.visible) return; const f = new THREE.Vector3(0, 0, 1); for (const it of this.items) { it.t = (it.t + dt * sp) % 1; it.a.position.copy(it.c.getPointAt(it.t)); it.a.quaternion.setFromUnitVectors(f, it.c.getTangentAt(it.t)); it.a.scale.setScalar(Math.min(it.t / .08, (1 - it.t) / .08, 1)); } } }
/** خلايا دمٍ (أقراصٌ مقعّرة) تجري داخلَ أوعية: flows = [{c, r0, r1}] */
export class CellFlow { constructor(parent, flows, color, n) { const g = new THREE.SphereGeometry(1, 16, 10), P = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const r = Math.hypot(v.x, v.z); v.y *= .35 * (.55 + r * r * .9); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals();
    this.im = new THREE.InstancedMesh(g, new THREE.MeshPhysicalMaterial({ color, roughness: .3, clearcoat: 1, emissive: color, emissiveIntensity: .4 }), n); this.im.userData.glow = true; this.d = []; this.o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const f = flows[i % flows.length]; this.d.push({ ...f, t: srnd(), off: new THREE.Vector3(srnd() - .5, srnd() - .5, srnd() - .5), rot: new THREE.Euler(srnd() * 6, srnd() * 6, 0), k: .8 + srnd() * .3 }); } parent.add(this.im); }
  update(dt, sp = .5) { if (!this.im.visible) return; const o = this.o; this.d.forEach((d, i) => { d.t = (d.t + dt * sp / d.c.getLength()) % 1; const r = d.r0 + (d.r1 - d.r0) * Math.pow(d.t, .8);
    o.position.copy(d.c.getPointAt(d.t)).addScaledVector(d.off, r * .9); o.rotation.copy(d.rot); o.rotation.x += d.t * 20; o.scale.setScalar(d.hide && d.hide() ? 0 : Math.min(.045, r * .45) * d.k); o.updateMatrix(); this.im.setMatrixAt(i, o.matrix); }); this.im.instanceMatrix.needsUpdate = true; } }

/* ═════════ مكتبةُ مخلوقاتٍ ثلاثيّةِ الأبعاد (بدلَ الرموزِ التعبيريّةِ المسطّحة) ═════════ */
const _C = c => new THREE.Color(c);
function _part(geo, colorFn, o = {}) { const P = geo.attributes.position, col = new Float32Array(P.count * 3), v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); c.copy(colorFn(v)); col.set([c.r, c.g, c.b], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial(Object.assign({ vertexColors: true, roughness: o.rough ?? .75, sheen: o.sheen ?? .9, sheenRoughness: .5, sheenColor: _C(o.sheenColor || '#fff4e6'), clearcoat: o.coat ?? 0, clearcoatRoughness: .3, bumpMap: tissueBump(o.bump || 'pore', 9), bumpScale: o.bumpScale ?? .6 }, o.m || {}))); }
const ell = (rx, ry, rz, fn) => organGeo(1, v => { v.x *= rx; v.y *= ry; v.z *= rz; if (fn) fn(v); }, 40, 28);
const solid = c => () => _C(c);
const belly = (top, bot, y0 = 0) => v => _C(top).lerp(_C(bot), THREE.MathUtils.smoothstep(-v.y, y0 - .05, y0 + .25));
const stripes = (a, b, f = 12, base) => v => (Math.sin(v.x * f + Math.sin(v.y * 6) * 1.5) > .55 ? _C(b) : base ? base(v) : _C(a));
const spots = (a, b, f = 7, t = .35) => v => (noise3(v.x * f, v.y * f, v.z * f) > t ? _C(b) : _C(a));
function _place(g, m, p, r, s) { if (p) m.position.set(...p); if (r) m.rotation.set(...r); if (s) (typeof s === 'number') ? m.scale.setScalar(s) : m.scale.set(...s); m.castShadow = true; g.add(m); return m; }
const eyeM = new THREE.MeshPhysicalMaterial({ color: '#0d0a08', roughness: .05, clearcoat: 1 });
function eyes(g, x, y, z, r = .045) { for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), eyeM); e.position.set(x, y, s * z); g.add(e); } }
function legs(g, pts, h, r, colorFn, o) { for (const [x, z] of pts) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[0, 0, 0], [0, -h * .5, 0], [.02, -h, 0]], r, r * .7, 10, 10, .02), colorFn, o), [x, 0, s * z]); }
/** رباعيُّ أرجل عامّ */
function quad(o) { const g = new THREE.Group(), c = o.color, fn = o.pattern || belly(c, o.belly || c), m = { sheenColor: o.sheen || '#fff4e6' };
  const L = o.len || 1, H = o.h || .55, W = o.w || .38;
  _place(g, _part(ell(L / 2, H / 2, W / 2, v => { if (o.hump) v.y += Math.max(0, Math.cos(v.x * 3)) * o.hump * (v.y > 0 ? 1 : 0); v.y += v.x * (o.tilt || 0); }), fn, m), [0, 0, 0]);
  const nk = o.neck || 0, hx = L / 2 + (o.headF ?? .05), hy = H * .25 + nk;
  if (nk > .1) _place(g, _part(vesselGeo([[L * .35, H * .2, 0], [hx - .05, hy * .6, 0], [hx, hy, 0]], (o.neckR || .1), (o.neckR || .1) * .8, 16, 12, .02), fn, m));
  const hr = o.head || .2; const head = new THREE.Group(); head.position.set(hx, hy, 0); g.add(head);
  _place(head, _part(ell(hr * (o.snout || 1.4), hr, hr * .85, v => { if (v.x > 0) { const k = 1 - v.x / (hr * (o.snout || 1.4)) * (o.snoutTaper ?? .45); v.y *= k; v.z *= k; } }), o.headPattern || fn, m), [0, 0, 0], [0, 0, o.headTilt || -.15]);
  eyes(head, hr * .55, hr * .35, hr * .55, hr * .17);
  _place(head, new THREE.Mesh(new THREE.SphereGeometry(hr * .14, 12, 10), eyeM), [hr * (o.snout || 1.4) * .95, -hr * .05, 0]);
  if (o.ears) for (const s of [-1, 1]) _place(head, _part(ell(.05, o.ears, .025), solid(o.earColor || c), m), [-hr * .1, hr * .8 + o.ears * .7, s * hr * .45], [s * .25, 0, o.earBack ?? .25]);
  if (o.bigEars) for (const s of [-1, 1]) _place(head, _part(ell(.04, o.bigEars, o.bigEars * .9), solid(c), m), [-hr * .3, 0, s * hr * .9], [0, s * .3, 0]);
  if (o.horns) for (const s of [-1, 1]) _place(head, _part(vesselGeo([[0, 0, 0], [-.05, o.horns * .6, s * .05], [-.15, o.horns, s * .08]], .03, .01, 12, 8), solid('#5b4a3a'), { rough: .4 }), [-hr * .2, hr * .7, s * hr * .3]);
  if (o.antlers) for (const s of [-1, 1]) { const a = []; twigs(a, V(-hr * .2, hr * .8, s * hr * .3), V(-.2, 1, s * .4), .25, .025, 3, .9); _place(head, _part(mergeGeos(a), solid('#7a5a3a'))); }
  if (o.trunk) _place(head, _part(vesselGeo([[hr * 1.2, 0, 0], [hr * 1.6, -hr * .8, 0], [hr * 1.5, -hr * 2.2, 0], [hr * 1.8, -hr * 2.6, 0]], hr * .3, hr * .12, 30, 12, .06), fn, m));
  if (o.mane) _place(head, _part(ell(hr * 1.3, hr * 1.4, hr * 1.25, v => v.multiplyScalar(1 + noise3(v.x * 14, v.y * 14, v.z * 14) * .15)), solid(o.mane), { bumpScale: 3 }), [-hr * .45, 0, 0]);
  const lh = o.legH || H * .9, lx = L * .32; legs(g, [[lx, W * .3], [-lx, W * .3]].map(([x, z]) => [x, z]), lh, o.legR || .06, o.legColor ? solid(o.legColor) : fn, m); g.children.slice(-4).forEach(l => l.position.y = -H * .2);
  if (o.tail) _place(g, _part(vesselGeo([[-L / 2, 0, 0], [-L / 2 - o.tail * .5, H * (o.tailUp ?? .2), 0], [-L / 2 - o.tail, H * (o.tailUp ?? .2) * 1.8, 0]], o.tailR || .05, o.tailR2 ?? .02, 20, 10, .05), o.tailColor ? solid(o.tailColor) : fn, m));
  if (o.bushy) _place(g, _part(ell(.18, .38, .14, v => v.multiplyScalar(1 + noise3(v.x * 12, v.y * 12, v.z * 12) * .12)), fn, { bumpScale: 3 }), [-L / 2 - .1, H * .4, 0], [0, 0, -.35]);
  if (o.puff) _place(g, _part(ell(.09, .09, .09), solid('#ffffff'), { bumpScale: 3 }), [-L / 2, H * .1, 0]);
  return g; }
function bird(o) { const g = new THREE.Group(), c = o.color, fn = o.pattern || belly(c, o.belly || c); const m = { sheenColor: '#ffffff', bump: 'pore', bumpScale: .8 };
  _place(g, _part(ell(.42, .3, .28, v => { if (v.x < 0) v.y += v.x * .25; }), fn, m), [0, 0, 0], [0, 0, o.upright ? .9 : .15]);
  const hy = o.upright ? .38 : .22, hx = o.upright ? .12 : .38; const head = new THREE.Group(); head.position.set(hx, hy, 0); g.add(head);
  _place(head, _part(ell(.2, .19, .18), o.headColor ? solid(o.headColor) : fn, m)); eyes(head, o.owl ? .14 : .1, .05, o.owl ? .08 : .12, o.owl ? .05 : .032);
  if (o.owl) for (const s of [-1, 1]) _place(head, new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), new THREE.MeshPhysicalMaterial({ color: '#f2b12a', roughness: .1, clearcoat: 1 })), [.13, .05, s * .075]);
  const bk = o.beak || .14; _place(head, _part(new THREE.ConeGeometry(.045, bk, 16), solid(o.beakColor || '#e8a030'), { rough: .4, coat: .6 }), [.18 + bk * .4, -.02, 0], [0, 0, -Math.PI / 2 - (o.hook ? .5 : 0)]);
  if (o.comb) _place(head, _part(ell(.08, .07, .02), solid('#d42020')), [.02, .2, 0]);
  for (const s of [-1, 1]) _place(g, _part(ell(.3, .08, .17, v => { if (v.x < 0) v.z *= 1 + v.x * .8; }), o.wingColor ? solid(o.wingColor) : fn, m), [-.05, .05, s * .26], [s * .15, 0, -.15 + (o.spread ? s * .9 : 0)]);
  _place(g, _part(ell(.22, .04, .12), o.wingColor ? solid(o.wingColor) : fn, m), [-.48, -.05, 0], [0, 0, .3]);
  for (const s of [-1, 1]) _place(g, _part(vesselGeo([[0, 0, 0], [0, -.15, 0], [.06, -.22, 0]], .022, .015, 8, 8), solid(o.legColor || '#c88a30'), { rough: .4 }), [0, -.22, s * .08]);
  return g; }
function fish(o) { const g = new THREE.Group(), c = o.color, fn = o.pattern || belly(c, o.belly || '#f4f1ea'); const m = { rough: .25, coat: 1, sheen: .3, bump: 'pore', bumpScale: .5 };
  const L = o.len || 1; _place(g, _part(ell(L / 2, o.h || .22, o.w || .12, v => { if (v.x < 0) { const k = 1 + v.x / L * 1.2; v.y *= k; v.z *= k; } }), fn, m));
  _place(g, _part(ell(.12, o.tailH || .2, .02, v => { v.x -= Math.abs(v.y) * .5; }), fn, m), [-L / 2 - .05, 0, 0]);
  _place(g, _part(ell(.12, o.fin || .1, .015), fn, m), [0, (o.h || .22) * .9, 0], [0, 0, -.4]);
  eyes(g, L * .36, (o.h || .22) * .25, (o.w || .12) * .75, .028);
  if (o.flipper) for (const s of [-1, 1]) _place(g, _part(ell(.12, .03, .07), fn, m), [L * .15, -(o.h || .22) * .5, s * (o.w || .12)], [s * .5, 0, -.4]);
  return g; }
function bug(o) { const g = new THREE.Group(), c = o.color; const m = { rough: .3, coat: 1, sheen: .2, bump: 'pore', bumpScale: .4 };
  _place(g, _part(ell(o.abd || .3, .14, .14), o.pattern || solid(c), m), [-.2, 0, 0]);
  _place(g, _part(ell(.12, .1, .1), solid(o.thorax || c), m), [.05, .02, 0]); _place(g, _part(ell(.1, .09, .09), solid(o.thorax || c), m), [.2, .04, 0]); eyes(g, .26, .07, .06, .03);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[0, 0, 0], [(i - 1) * .06, .06, s * .12], [(i - 1) * .12 + (o.hop && i === 0 ? -.2 : 0), -.12, s * .18]], .016, .01, 10, 6), solid(o.legColor || '#3a2a1a'), m), [.05, -.02, 0]);
  if (o.hop) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[.05, 0, s * .08], [-.15, .2, s * .12], [-.38, -.1, s * .13]], .025, .012, 12, 8), solid(c), m));
  for (const s of [-1, 1]) _place(g, _part(vesselGeo([[.27, .08, s * .03], [.4, .25, s * .08], [.5, .35, s * .1]], .008, .004, 10, 5), solid('#2a1a0a'), m));
  if (o.wings) for (const s of [-1, 1]) _place(g, new THREE.Mesh(organGeo(1, v => { v.x *= .35; v.y *= .02; v.z *= .45; }), new THREE.MeshPhysicalMaterial({ color: o.wings, roughness: .4, sheen: 1, transparent: true, opacity: .95, side: 2 })), [0, .12, s * .38], [s * -.25, 0, 0]);
  if (o.shell) _place(g, _part(ell(.26, .16, .2, v => { if (v.y < 0) v.y *= .2; }), spots(o.shell, '#111111', 9), { rough: .15, coat: 1 }), [-.1, .03, 0]);
  return g; }
function snake(c = '#6a8a2a') { const g = new THREE.Group(), pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([.6 - t * 1.2, .02, Math.sin(t * 10) * .18 * (1 - t * .3)]); } pts.push([pts[pts.length - 1][0] - .02, .02, pts[pts.length - 1][2]]);
  _place(g, _part(vesselGeo(pts.map(p => V(...p)), .07, .015, 120, 14, .02), v => (Math.sin(v.x * 40) > .6 ? _C(c).multiplyScalar(.6) : _C(c)), { rough: .3, coat: .8 })); _place(g, _part(ell(.11, .06, .08), solid(c), { coat: .8 }), [.66, .03, 0]); eyes(g, .7, .07, .05, .016); return g; }
function frog() { const g = new THREE.Group(), fn = belly('#4f9a2a', '#e8e4b0'); const m = { rough: .2, coat: 1, sheen: .2 };
  _place(g, _part(ell(.32, .2, .26, v => { if (v.x > 0) v.y *= 1 - v.x * .5; }), spots('#4f9a2a', '#2f6a1a', 6), m), [0, 0, 0], [0, 0, .35]); _place(g, _part(ell(.18, .1, .2), fn, m), [.28, .08, 0]);
  for (const s of [-1, 1]) { _place(g, new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 12), eyeM), [.3, .18, s * .1]); _place(g, _part(ell(.2, .07, .08), solid('#4f9a2a'), m), [-.2, -.12, s * .22], [0, s * .4, 0]); _place(g, _part(vesselGeo([[.1, -.05, s * .12], [.18, -.2, s * .18], [.26, -.22, s * .22]], .03, .02, 10, 8), solid('#4f9a2a'), m)); }
  return g; }
function lizard(c = '#a8834a') { const g = new THREE.Group(), fn = spots(c, '#6a4a2a', 9); const m = { rough: .5, coat: .4 }; _place(g, _part(ell(.32, .08, .1), fn, m)); _place(g, _part(ell(.13, .06, .07, v => { if (v.x > 0) { v.y *= 1 - v.x * 2; } }), fn, m), [.4, .02, 0]); eyes(g, .43, .05, .05, .015);
  _place(g, _part(vesselGeo([[-.3, 0, 0], [-.6, 0, .1], [-.9, 0, -.05]], .06, .008, 30, 10), fn, m)); for (const x of [.18, -.18]) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[x, 0, s * .08], [x + .05, -.03, s * .18], [x + .08, -.08, s * .22]], .025, .015, 8, 6), fn, m)); return g; }
function turtle() { const g = new THREE.Group(); _place(g, _part(ell(.4, .2, .32, v => { if (v.y < 0) v.y *= .25; }), v => (noise3(v.x * 8, v.y * 8, v.z * 8) > .2 ? _C('#5a4a2a') : _C('#7a6a3a')), { rough: .3, coat: .8, bumpScale: 2 }));
  const sk = belly('#8a9a5a', '#c8c89a'); _place(g, _part(ell(.14, .09, .1), sk), [.45, 0, 0]); eyes(g, .52, .04, .06, .015); for (const x of [.25, -.25]) for (const s of [-1, 1]) _place(g, _part(ell(.1, .04, .07), sk), [x, -.05, s * .3]); return g; }
function snail() { const g = new THREE.Group(); const sp = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 5, r = .22 * Math.exp(-a * .16); sp.push(V(Math.cos(a) * r, .2 + Math.sin(a) * r, (i / 60) * .08)); }
  _place(g, _part(vesselGeo(sp.reverse(), .015, .13, 120, 16, 0), v => (Math.sin(v.length() * 60) > .5 ? _C('#8a5a2a') : _C('#c89a5a')), { rough: .3, coat: .9 })); _place(g, _part(ell(.35, .07, .1, v => { if (v.x > 0) v.y *= 1 + v.x; }), solid('#a89a80'), { coat: .8, rough: .2 }), [0, -.05, 0]);
  for (const s of [-1, 1]) { _place(g, _part(vesselGeo([[.3, .05, s * .03], [.36, .2, s * .06]], .012, .008, 6, 6), solid('#a89a80'))); _place(g, new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), eyeM), [.36, .21, s * .06]); } return g; }
function worm(c = '#c97a7a') { const g = new THREE.Group(), pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(V(.5 - t, Math.abs(Math.sin(t * 7)) * .05, Math.sin(t * 6) * .1)); } _place(g, _part(vesselGeo(pts, .04, .03, 100, 12, .12), v => (Math.sin(v.x * 70) > .7 ? _C(c).multiplyScalar(.8) : _C(c)), { rough: .2, coat: 1 })); return g; }
function butterfly() { const g = new THREE.Group(); _place(g, _part(ell(.25, .04, .04), solid('#2a1a0a'))); const wm = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .5, sheen: 1, side: 2 });
  for (const s of [-1, 1]) for (const [x, r] of [[.07, .3], [-.12, .22]]) { const geo = organGeo(1, v => { v.x *= r * .8; v.y *= .01; v.z *= r; }); const m = _part(geo, v => (Math.hypot(v.x, v.z) > r * .8 ? _C('#1a1a1a') : noise3(v.x * 20, 0, v.z * 20) > .45 ? _C('#ffffff') : _C('#f08a1a'))); m.material = wm; _place(g, m, [x, .02, s * r * 1.05], [s * -.4, 0, 0]); }
  for (const s of [-1, 1]) _place(g, _part(vesselGeo([[.22, .02, s * .02], [.35, .15, s * .08]], .006, .004, 6, 5), solid('#1a1a1a'))); return g; }
function mushroom() { const g = new THREE.Group(); _place(g, _part(vesselGeo([[0, -.3, 0], [0, 0, 0], [0, .1, 0]], .09, .07, 10, 14), solid('#f2eadc'), { bumpScale: .4 })); _place(g, _part(ell(.32, .2, .32, v => { if (v.y < 0) v.y *= .15; }), spots('#c8281e', '#ffffff', 9), { coat: .8, rough: .3 }), [0, .1, 0]); return g; }
function microbe() { const g = new THREE.Group(); _place(g, _part(ell(.35, .15, .15, v => v.multiplyScalar(1 + noise3(v.x * 8, v.y * 8, v.z * 8) * .05)), solid('#7fbf4a'), { m: { transparent: true, opacity: .85 }, coat: 1, rough: .2 })); const f = []; for (let i = 0; i < 8; i++) twigs(f, V(-.3 + i * .08, 0, 0), V(srnd() - .5, 1, srnd() - .5), .25, .006, 1, .5); _place(g, _part(mergeGeos(f), solid('#5a8a2a'))); return g; }
function sprout(big) { const g = new THREE.Group(); _place(g, _part(vesselGeo([[0, -.35, 0], [.02, 0, 0], [0, .3, 0]], .025, .018, 12, 8), solid('#5a9a2a'))); const leaf = organGeo(1, v => { v.x *= .22; v.y *= .02; v.z *= .1; v.y += v.x * v.x * .8; });
  const n = big ? 7 : 2; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; _place(g, _part(leaf.clone(), v => _C('#4f9a2a').lerp(_C('#9ad04a'), Math.abs(v.x) * 2), { bump: 'vein', bumpScale: 2 }), [Math.cos(a) * .18, (big ? -.25 + i * .07 : .25), Math.sin(a) * .18], [0, -a, .3]); } return g; }
const CREATURES = {
  '🐇': () => quad({ color: '#9a7a5a', belly: '#e8dccb', len: .8, h: .5, head: .2, ears: .28, earColor: '#c8a888', legH: .25, puff: 1, snout: 1.2 }),
  '🐭': () => quad({ color: '#8a8a8a', belly: '#d8d0c8', len: .6, h: .3, head: .15, bigEars: .08, legH: .12, tail: .6, tailR: .018, tailR2: .008, tailColor: '#d8a8a8', tailUp: 0, snout: 1.6 }),
  '🐁': () => CREATURES['🐭'](), '🐹': () => quad({ color: '#d89a5a', belly: '#f6ead8', len: .55, h: .4, head: .18, bigEars: .06, legH: .1, snout: 1.1 }),
  '🐿️': () => quad({ color: '#a8602a', belly: '#f0dcc0', len: .55, h: .4, head: .16, ears: .08, legH: .18, bushy: 1, tilt: .3, snout: 1.3 }),
  '🦌': () => quad({ color: '#a8703a', belly: '#f0e0c8', len: 1, h: .45, head: .16, neck: .5, neckR: .09, ears: .1, legH: .75, legR: .035, antlers: 1, tail: .12, tailColor: '#ffffff', snout: 1.6 }),
  '🦊': () => quad({ color: '#d8602a', belly: '#f6f0e8', len: .85, h: .38, head: .17, ears: .12, legH: .35, legColor: '#3a2a1a', tail: .55, tailR: .09, tailR2: .06, tailUp: .1, snout: 1.9, snoutTaper: .7 }),
  '🐪': () => quad({ color: '#c8a070', len: 1.1, h: .5, head: .15, neck: .45, neckR: .1, headF: .25, legH: .85, legR: .05, hump: .35, tail: .3, tailR: .025, snout: 1.8 }),
  '🐫': () => quad({ color: '#c8a070', len: 1.1, h: .5, head: .15, neck: .45, neckR: .1, headF: .25, legH: .85, legR: .05, hump: .3, tail: .3, tailR: .025, snout: 1.8 }),
  '🐄': () => quad({ color: '#f4f0ea', pattern: spots('#f4f0ea', '#2a2a2a', 5, .1), len: 1.2, h: .6, head: .2, horns: .12, ears: .06, legH: .55, legR: .07, tail: .5, tailR: .025, snout: 1.6 }),
  '🐐': () => quad({ color: '#e8e0d4', len: .9, h: .45, head: .16, horns: .2, ears: .07, legH: .5, legR: .045, tail: .1, snout: 1.6 }),
  '🐅': () => quad({ color: '#e0781a', pattern: stripes('#e0781a', '#1a1a1a', 14, belly('#e0781a', '#f6f0e8')), len: 1.2, h: .5, head: .24, ears: .06, legH: .45, legR: .08, tail: .8, tailR: .04, tailUp: .3, snout: 1.15 }),
  '🐆': () => quad({ color: '#d8a84a', pattern: spots('#d8a84a', '#3a2a1a', 9), len: 1.1, h: .45, head: .2, ears: .06, legH: .5, legR: .06, tail: .8, tailR: .035, tailUp: .3, snout: 1.15 }),
  '🦁': () => quad({ color: '#d8a85a', belly: '#f0dcb0', len: 1.2, h: .55, head: .24, ears: .06, mane: '#8a5a2a', legH: .5, legR: .08, tail: .8, tailR: .035, tailUp: .3, snout: 1.2 }),
  '🐻': () => quad({ color: '#6a4a2a', len: 1.1, h: .65, head: .26, ears: .07, legH: .4, legR: .12, snout: 1.4 }),
  '🐘': () => quad({ color: '#8a8a8e', len: 1.3, h: .8, head: .35, bigEars: .32, trunk: 1, legH: .6, legR: .16, tail: .3, tailR: .03, snout: 1.1 }),
  '🦒': () => quad({ color: '#e0a84a', pattern: spots('#e8b860', '#8a4a1a', 6), len: 1, h: .5, head: .14, neck: 1.3, neckR: .08, headF: .2, horns: .1, ears: .07, legH: 1.1, legR: .045, tail: .4, tailR: .02, snout: 1.8 }),
  '🦓': () => quad({ color: '#ffffff', pattern: stripes('#f6f6f6', '#151515', 18), len: 1.1, h: .55, head: .18, neck: .4, neckR: .1, ears: .1, legH: .7, legR: .05, tail: .4, tailR: .025, snout: 1.8 }),
  '🐈': () => quad({ color: '#d89a5a', pattern: stripes('#d89a5a', '#a8602a', 16), len: .8, h: .35, head: .17, ears: .1, legH: .35, legR: .04, tail: .6, tailR: .035, tailUp: .6, snout: 1.05 }),
  '🐃': () => quad({ color: '#3a3a3a', len: 1.2, h: .65, head: .22, horns: .25, legH: .55, legR: .08, tail: .4, snout: 1.5 }),
  '🦝': () => quad({ color: '#8a8a8a', len: .8, h: .4, head: .17, ears: .07, legH: .3, tail: .5, tailR: .07, pattern: stripes('#8a8a8a', '#2a2a2a', 14), snout: 1.5 }),
  '🐦': () => bird({ color: '#8a6a4a', belly: '#e8d8c0', beak: .1, beakColor: '#3a3a3a' }), '🐥': () => bird({ color: '#f6d64a', beak: .08, legColor: '#e89a2a' }), '🐣': () => bird({ color: '#f6d64a', beak: .08 }),
  '🦅': () => bird({ color: '#5a3a1a', headColor: '#f6f2ea', beak: .16, hook: 1, beakColor: '#f2c22a', spread: 1 }), '🦉': () => bird({ color: '#8a6a4a', belly: '#d8c0a0', owl: 1, upright: 1, beak: .07, hook: 1, beakColor: '#6a5a4a' }),
  '🐔': () => bird({ color: '#f4f0ea', comb: 1, beak: .1, beakColor: '#f2b22a' }), '🦜': () => bird({ color: '#2aa84a', headColor: '#f2d22a', wingColor: '#1a6ad8', beak: .12, hook: 1, beakColor: '#2a2a2a' }),
  '🐧': () => bird({ color: '#1a1a22', belly: '#ffffff', upright: 1, beak: .1 }), '🦆': () => bird({ color: '#8a6a4a', headColor: '#1a7a3a', beak: .14, beakColor: '#f2c22a' }), '🦢': () => bird({ color: '#ffffff', beak: .12, beakColor: '#f28a2a' }), '🦩': () => bird({ color: '#f28aa0', beak: .14, upright: 1 }),
  '🐟': () => fish({ color: '#4a8ad8', belly: '#e8eef4' }), '🐠': () => fish({ color: '#f28a1a', pattern: stripes('#f28a1a', '#ffffff', 10), h: .3 }), '🦈': () => fish({ color: '#6a7a8a', len: 1.6, h: .22, fin: .25, tailH: .35, flipper: 1 }),
  '🐬': () => fish({ color: '#6a8aa8', len: 1.4, h: .2, fin: .18, flipper: 1 }), '🐋': () => fish({ color: '#3a4a6a', len: 2, h: .4, w: .3, fin: .06, tailH: .3, flipper: 1 }),
  '🐛': () => worm('#7ac83a'), '🪱': () => worm(), '🐍': () => snake(), '🐸': () => frog(), '🦎': () => lizard(), '🐢': () => turtle(), '🐌': () => snail(), '🦋': () => butterfly(), '🍄': () => mushroom(), '🦠': () => microbe(),
  '🦗': () => bug({ color: '#5a9a2a', abd: .38, hop: 1, legColor: '#4a7a2a' }), '🐜': () => bug({ color: '#3a1a0a', abd: .2, thorax: '#3a1a0a' }), '🐞': () => bug({ color: '#c8281e', shell: '#d0261e', thorax: '#151515' }), '🦟': () => bug({ color: '#3a3a3a', abd: .25, wings: '#dfe8f0' }), '🐝': () => bug({ color: '#f2b22a', pattern: stripes('#f2b22a', '#1a1a1a', 30), wings: '#e8f0f8' }),
  '🌱': () => sprout(), '🌿': () => sprout(true), '🌳': () => tree(.9), '🌲': () => pine(.9),
};
function crust(o) { const g = new THREE.Group(), c = o.color, m = { rough: .3, coat: 1, sheen: .2, bumpScale: .4 }; const segs = o.segs || 6;
  for (let i = 0; i < segs; i++) _place(g, _part(ell(.09, .08 - i * .006, .1 - i * .008), solid(c), m), [.2 - i * .1, o.curl ? -i * i * .006 : 0, 0]);
  _place(g, _part(ell(.2, .12, .13), solid(c), m), [.35, .02, 0]); eyes(g, .5, .08, .05, .02); for (const s of [-1, 1]) _place(g, _part(vesselGeo([[.5, .05, s * .03], [.8, .2, s * .15], [1.1, .1, s * .25]], .008, .003, 10, 5), solid(c), m));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[.35 - i * .06, -.05, s * .06], [.35 - i * .06, -.12, s * .16], [.33 - i * .06, -.18, s * .2]], .012, .008, 6, 5), solid(c), m));
  if (o.claws) for (const s of [-1, 1]) { _place(g, _part(vesselGeo([[.45, 0, s * .1], [.6, .02, s * .22], [.75, .04, s * .25]], .03, .03, 8, 8), solid(c), m)); _place(g, _part(ell(.12, .05, .07), solid(c), m), [.85, .04, s * .26]); }
  _place(g, _part(ell(.1, .02, .12, v => { v.x -= Math.abs(v.z) * .3; }), solid(c), m), [.2 - segs * .1, o.curl ? -segs * segs * .006 : 0, 0]); return g; }
function crab() { const g = new THREE.Group(), c = '#d8502a', m = { rough: .3, coat: 1, bumpScale: .5 }; _place(g, _part(ell(.32, .12, .26), spots(c, '#b8381a', 9), m));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) _place(g, _part(vesselGeo([[-.1 + i * .07, 0, s * .2], [-.12 + i * .08, .1, s * .42], [-.15 + i * .1, -.15, s * .52]], .025, .015, 8, 6), solid(c), m));
  for (const s of [-1, 1]) { _place(g, _part(vesselGeo([[.2, 0, s * .15], [.38, .06, s * .25]], .04, .04, 6, 8), solid(c), m)); _place(g, _part(ell(.14, .08, .08), solid(c), m), [.48, .08, s * .27]); _place(g, new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), eyeM), [.3, .16, s * .06]); } return g; }
function scorpion() { const g = crust({ color: '#c8a050', segs: 5, claws: 1 }); const t = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * .9; t.push(V(-.3 - Math.sin(a) * .3, (1 - Math.cos(a)) * .3, 0)); } _place(g, _part(vesselGeo(t, .05, .025, 40, 10, .1), solid('#c8a050'), { coat: 1 })); _place(g, _part(new THREE.ConeGeometry(.03, .1, 10), solid('#3a2a1a')), [-.3, .62, 0], [0, 0, 2.2]); return g; }
function octopus(c = '#c8503a', jelly) { const g = new THREE.Group(), m = jelly ? { m: { transparent: true, opacity: .6 }, coat: 1, rough: .1 } : { coat: 1, rough: .2 };
  _place(g, _part(ell(.28, jelly ? .2 : .32, .28, v => { if (jelly && v.y < 0) v.y *= .2; }), jelly ? solid(c) : spots(c, '#a83a2a', 10), m), [0, .3, 0]); if (!jelly) eyes(g, .2, .32, .14, .04);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(V(Math.cos(a) * (.18 + t * (jelly ? .05 : .4)), .15 - t * (jelly ? .6 : .3) + (jelly ? 0 : Math.sin(t * 5) * .05), Math.sin(a) * (.18 + t * (jelly ? .05 : .4)) + (jelly ? Math.sin(t * 9 + i) * .04 : 0))); } _place(g, _part(vesselGeo(pts, jelly ? .012 : .05, .008, 30, 8, .02), solid(c), m)); } return g; }
function coral() { const g = new THREE.Group(), a = []; reseed(17); for (let i = 0; i < 4; i++) twigs(a, V((i - 1.5) * .15, -.4, 0), V((i - 1.5) * .2, 1, 0), .3, .06, 4, .7, 6); _place(g, _part(mergeGeos(a), v => _C('#f0705a').lerp(_C('#f8c0a0'), THREE.MathUtils.clamp(v.y + .3, 0, 1)), { bumpScale: 2 })); return g; }
function flower(petal = '#f0c020', center = '#6a3a1a', n = 12) { const g = new THREE.Group(); _place(g, _part(vesselGeo([[0, -.5, 0], [.03, -.1, 0], [0, .2, 0]], .025, .02, 12, 8), solid('#4f8a2a'))); const pg = organGeo(1, v => { v.x *= .14; v.y *= .012; v.z *= .05; });
  const hd = new THREE.Group(); hd.position.set(0, .24, 0); hd.rotation.x = 1.05; g.add(hd); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; _place(hd, _part(pg.clone(), solid(petal), { sheen: 1 }), [Math.cos(a) * .15, 0, Math.sin(a) * .15], [0, -a, .25]); } _place(hd, _part(ell(.09, .04, .09), spots(center, '#3a1a0a', 30), { bumpScale: 2 }), [0, .01, 0]);
  for (const s of [-1, 1]) _place(g, _part(organGeo(1, v => { v.x *= .14; v.y *= .015; v.z *= .06; }), solid('#4f9a2a'), { bump: 'vein' }), [s * .12, -.2, 0], [0, 0, s * .4]); return g; }
function palm() { const g = new THREE.Group(); _place(g, _part(vesselGeo([[0, -.6, 0], [.05, 0, 0], [.15, .5, 0]], .07, .05, 30, 12, .02), v => (Math.sin(v.y * 60) > .3 ? _C('#8a6a4a') : _C('#6a4a2a')), { bumpScale: 2 }));
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = V(Math.cos(a), 0, Math.sin(a)); _place(g, _part(organGeo(1, v => { v.x *= .32; v.y *= .015; v.z *= .07; v.y -= v.x * v.x * 2.2 + (v.x > 0 ? 0 : 0); v.z *= 1 + Math.sin(v.x * 40) * .5; }), solid('#3f8a2a'), { bump: 'vein' }), [.15 + d.x * .3, .48, d.z * .3], [0, -a, .1]); }
  for (let i = 0; i < 4; i++) _place(g, _part(ell(.04, .05, .04), solid('#8a5a1a'), { coat: .5 }), [.15 + Math.cos(i * 1.6) * .06, .42, Math.sin(i * 1.6) * .06]); return g; }
function cactus() { const g = new THREE.Group(), rib = v => { const a = Math.atan2(v.z, v.x); const k = 1 + Math.cos(a * 12) * .06; v.x *= k; v.z *= k; }, fn = v => _C('#4f8a3a').lerp(_C('#6aa84a'), (Math.cos(Math.atan2(v.z, v.x) * 12) + 1) * .3), m = { coat: .5, rough: .4 };
  _place(g, _part(organGeo(1, v => { v.x *= .14; v.z *= .14; v.y *= .6; rib(v); }), fn, m), [0, 0, 0]); for (const s of [-1, 1]) { _place(g, _part(vesselGeo([[0, -.05, 0], [s * .22, -.05, 0], [s * .25, .25, 0]], .08, .07, 16, 16, 0), fn, m)); _place(g, _part(organGeo(.08, v => {}), fn, m), [s * .25, .26, 0]); } return g; }
function grain() { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const a = (i - 2) * .12, x = (i - 2) * .06; _place(g, _part(vesselGeo([[x, -.5, 0], [x + a * .3, 0, 0], [x + a, .3, 0]], .012, .008, 12, 6), solid('#c8a850'))); for (let k = 0; k < 10; k++) for (const s of [-1, 1]) _place(g, _part(ell(.025, .045, .02), solid('#d8b860'), { coat: .3 }), [x + a + s * .025, .3 + k * .035, 0], [0, 0, -s * .4]); } return g; }
function egg() { const g = new THREE.Group(); _place(g, _part(organGeo(1, v => { v.x *= .22; v.z *= .22; v.y *= .3; if (v.y > 0) { v.x *= 1 - v.y * .5; v.z *= 1 - v.y * .5; } }), solid('#f2e6d0'), { coat: .6, rough: .35, sheen: .2 })); return g; }
Object.assign(CREATURES, {
  '🦐': () => crust({ color: '#f0805a', curl: 1, segs: 6 }), '🦞': () => crust({ color: '#c83a2a', claws: 1, segs: 6 }), '🦀': crab, '🦂': scorpion, '🐙': () => octopus(), '🪼': () => octopus('#c8a8f0', 1), '🪸': coral,
  '🌸': () => flower('#f6b8c8', '#f2d060', 5), '🌻': () => flower('#f2c020', '#5a3a1a', 16), '🌼': () => flower('#f6e070', '#e8a020', 10), '🌺': () => flower('#e83a4a', '#f2d060', 5), '🥀': () => flower('#8a2a3a', '#4a1a1a', 6),
  '🌴': palm, '🌵': cactus, '🌾': grain, '🥚': egg,
  '🐻‍❄': () => quad({ color: '#f6f2ea', len: 1.1, h: .6, head: .22, ears: .05, legH: .4, legR: .12, snout: 1.6 }), '🦭': () => fish({ color: '#8a8a82', pattern: spots('#9a9a92', '#6a6a62', 10), len: 1.2, h: .22, w: .2, fin: .01, tailH: .12, flipper: 1 }),
  '🐒': () => quad({ color: '#8a5a2a', belly: '#d8b090', len: .55, h: .4, head: .17, bigEars: .05, legH: .45, legR: .04, tail: .7, tailR: .025, tailUp: .8, snout: 1, tilt: .5 }),
  '🐑': () => quad({ color: '#efe8dc', pattern: v => _C('#efe8dc').multiplyScalar(.9 + noise3(v.x * 30, v.y * 30, v.z * 30) * .15), headPattern: solid('#3a3030'), len: .9, h: .6, head: .15, ears: .06, legH: .4, legR: .04, legColor: '#3a3030', snout: 1.4 }),
  '🐴': () => quad({ color: '#7a4a2a', len: 1.2, h: .55, head: .18, neck: .5, neckR: .11, ears: .09, legH: .75, legR: .055, tail: .5, tailR: .06, tailColor: '#2a1a0a', tailUp: -.4, snout: 2 }),
  '🐺': () => quad({ color: '#8a8a8a', belly: '#d8d8d0', len: .95, h: .42, head: .18, ears: .11, legH: .45, legR: .05, tail: .5, tailR: .07, tailR2: .04, tailUp: -.1, snout: 1.8, snoutTaper: .6 }),
  '🐊': () => { const g = lizard('#4a6a3a'); g.scale.set(1.6, 1, 1.3); return g; }, '🐼': () => quad({ color: '#f4f2ee', pattern: v => (Math.abs(v.x) < .2 ? _C('#1a1a1a') : _C('#f4f2ee')), len: 1, h: .6, head: .25, ears: .07, earColor: '#1a1a1a', legH: .35, legR: .12, legColor: '#1a1a1a', snout: 1.2 }),
  '🦇': () => { const g = bird({ color: '#3a2a2a', beak: .03, beakColor: '#3a2a2a', spread: 1 }); return g; }, '🪰': () => bug({ color: '#2a2a2a', abd: .2, wings: '#d0d8e0' }), '🕷': () => { const g = bug({ color: '#2a1a1a', abd: .3 }); return g; },
});
CREATURES['🐯'] = CREATURES['🐅']; CREATURES['🐱'] = CREATURES['🐈']; CREATURES['🦣'] = CREATURES['🐘'];
/** مخلوقٌ ثلاثيُّ الأبعادِ بحجمٍ يناسبُ s، أو null إن لم يتوفّر */
export function creature(ch, s = 1) { const f = CREATURES[ch] || CREATURES[ch.replace(/️/g, '')] || CREATURES[ch + '️']; if (!f) return null; reseed(ch.codePointAt(0) % 997 + 3);
  const inner = f(), g = new THREE.Group(); g.add(inner); const b = new THREE.Box3().setFromObject(inner), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  const k = s * .9 / Math.max(sz.x, sz.y, sz.z * .7); inner.scale.setScalar(k); inner.position.copy(c).multiplyScalar(-k); g.rotation.y = -.45; g.userData.creature = true; return g; }
