// نموذج الصدوع ثلاثي الأبعاد (من الدرس التجريبي «الزلازل»)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let box = null, RZ = false;
function fallback(msg) {
  const d = document.createElement('div'); d.className = 'fallback';
  d.innerHTML = '<p>تعذّر تشغيل النموذج ثلاثي الأبعاد على هذا الجهاز' + (msg ? '' : '') + '. استخدم الشكل ٢ المجاور.</p>'; box.appendChild(d);
}
function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

const STRATA = [ // من الأعلى إلى الأسفل — ألوان تقريبية من الشكل ٢
  { t: .16, c: 0x5f9a3a }, { t: .34, c: 0xc9a46a }, { t: .28, c: 0x8a6a48 }, { t: .3, c: 0xd8c79a }, { t: .26, c: 0x6f6a66 }, { t: .36, c: 0x9a7a5a }, { t: .3, c: 0x5d5552 }
];
let state = { type: 'normal', s: 0, target: 0, plane: false, playing: false };
let renderer, scene, camera, controls, hang, foot, planeMesh, arrows = [], labels = [], raf = 0, running = false;

function material(c, top) { return new THREE.MeshStandardMaterial({ color: c, roughness: top ? .95 : .85, metalness: 0, flatShading: !top }); }

function noiseTex(base) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  x.fillStyle = '#' + base.toString(16).padStart(6, '0'); x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.07)'; x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// بناء نصف كتلة: side = -1 (يسار: الجدار السفلي) أو +1 (يمين: الجدار العلوي)، dip بالدرجات (٩٠ للانزلاقي)
function buildBlock(side, dip) {
  const g = new THREE.Group(); const W = 2.4, Dz = 2.6; const cot = 1 / Math.tan(dip * Math.PI / 180);
  const xf = y => -y * cot; // مستوى الصدع يمر بـ (0,0) عند السطح
  let y = 0;
  STRATA.forEach((L, i) => {
    const y1 = y, y2 = y - L.t; y = y2;
    const sh = new THREE.Shape();
    if (side < 0) { sh.moveTo(-W, y2); sh.lineTo(xf(y2), y2); sh.lineTo(xf(y1), y1); sh.lineTo(-W, y1); }
    else { sh.moveTo(xf(y2), y2); sh.lineTo(W, y2); sh.lineTo(W, y1); sh.lineTo(xf(y1), y1); }
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: Dz, bevelEnabled: false }); geo.translate(0, 0, -Dz / 2);
    const m = new THREE.Mesh(geo, i === 0 ? new THREE.MeshStandardMaterial({ map: noiseTex(L.c), roughness: .95 }) : new THREE.MeshStandardMaterial({ map: noiseTex(L.c), roughness: .88 }));
    m.castShadow = m.receiveShadow = true; g.add(m);
  });
  // نهر صغير على السطح (كما في الشكل) + أشجار
  const river = new THREE.Mesh(new THREE.BoxGeometry(side < 0 ? W : W, .012, .14), new THREE.MeshStandardMaterial({ color: 0x3a8fc4, roughness: .3, metalness: .1 }));
  river.position.set(side * W / 2 + (side < 0 ? 0 : 0), .006, .35); g.add(river);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2f6b2a, roughness: .9 }), trunk = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  for (let k = 0; k < 7; k++) {
    const tx = side * (0.35 + Math.random() * (W - .55)), tz = -1.1 + Math.random() * 2.2; if (Math.abs(tz - .35) < .18) continue;
    const t = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(.07, .2, 7), treeMat); c.position.y = .16; const s = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .07, 5), trunk); s.position.y = .035;
    t.add(c, s); t.position.set(tx, 0, tz); t.traverse(o => o.castShadow = true); g.add(t);
  }
  return g;
}

function arrow(from, dir, len, col = 0xc8402c) {
  const a = new THREE.ArrowHelper(dir.clone().normalize(), from, len, col, .22, .14);
  a.line.material.linewidth = 3; return a;
}

function build() {
  [hang, foot, planeMesh, ...arrows].forEach(o => o && scene.remove(o)); arrows = [];
  labels.forEach(l => l.el.remove()); labels = [];
  const dip = state.type === 'strike' ? 90 : 60;
  foot = buildBlock(-1, dip); hang = buildBlock(1, dip); scene.add(foot, hang);
  // مستوى الصدع
  const H = STRATA.reduce((a, b) => a + b.t, 0), cot = state.type === 'strike' ? 0 : 1 / Math.tan(dip * Math.PI / 180);
  const pg = new THREE.PlaneGeometry(2.7, H / Math.sin(dip * Math.PI / 180) + .02);
  planeMesh = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }));
  planeMesh.rotation.y = Math.PI / 2; planeMesh.rotation.z = 0;
  planeMesh.position.set(H / 2 * cot, -H / 2, 0);
  if (state.type !== 'strike') planeMesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), (Math.PI / 2 - dip * Math.PI / 180));
  planeMesh.visible = state.plane; scene.add(planeMesh);
  // أسهم القوى
  const y = .35;
  if (state.type === 'normal') { arrows.push(arrow(new THREE.Vector3(-1.4, y, 0), new THREE.Vector3(-1, 0, 0), .9), arrow(new THREE.Vector3(1.4, y, 0), new THREE.Vector3(1, 0, 0), .9)); }
  else if (state.type === 'reverse') { arrows.push(arrow(new THREE.Vector3(-3.3, y, 0), new THREE.Vector3(1, 0, 0), .9), arrow(new THREE.Vector3(3.3, y, 0), new THREE.Vector3(-1, 0, 0), .9)); }
  else { arrows.push(arrow(new THREE.Vector3(-1.2, y, -1.9), new THREE.Vector3(0, 0, -1), .8), arrow(new THREE.Vector3(1.2, y, 1.9), new THREE.Vector3(0, 0, 1), .8)); }
  arrows.forEach(a => scene.add(a));
  const force = { normal: 'شدّ', reverse: 'ضغط', strike: 'قصّ' }[state.type];
  arrows.forEach(a => addLabel(force, a.position.clone().add(new THREE.Vector3(0, .28, 0)), true));
  if (state.type !== 'strike') { addLabel('الجدار العلوي', new THREE.Vector3(1.5, -.9, 1.32), false, () => hang.position); addLabel('الجدار السفلي', new THREE.Vector3(-1.5, -.9, 1.32), false, () => foot.position); }
  else { addLabel('الكتلة (أ)', new THREE.Vector3(1.5, -.9, 1.32), false, () => hang.position); addLabel('الكتلة (ب)', new THREE.Vector3(-1.5, -.9, 1.32), false, () => foot.position); }
  addLabel('مستوى الصدع', new THREE.Vector3(.05, .5, 1.4), false, () => new THREE.Vector3(0, 0, 0), () => state.plane);
  apply();
}
function addLabel(t, p, force, offF, visF) { const el = document.createElement('div'); el.className = 'lab3' + (force ? ' force' : ''); el.textContent = t; box.appendChild(el); labels.push({ el, p, offF, visF }); }

function apply() {
  const s = state.s * .38; const dip = 60 * Math.PI / 180;
  hang.position.set(0, 0, 0); foot.position.set(0, 0, 0);
  if (state.type === 'normal') hang.position.set(s * Math.cos(dip), -s * Math.sin(dip), 0);
  else if (state.type === 'reverse') hang.position.set(-s * Math.cos(dip), s * Math.sin(dip), 0);
  else { hang.position.z = s * .8; foot.position.z = -s * .8; }
}

function placeLabels() {
  const r = box.getBoundingClientRect();
  labels.forEach(l => {
    const p = l.p.clone(); if (l.offF) p.add(l.offF());
    p.project(camera); const vis = p.z < 1 && (!l.visF || l.visF());
    l.el.style.display = vis ? 'block' : 'none';
    l.el.style.left = ((p.x + 1) / 2 * r.width) + 'px'; l.el.style.right = 'auto'; l.el.style.top = ((1 - p.y) / 2 * r.height) + 'px';
    l.el.style.transform = 'translate(-50%,-50%)';
  });
}

const CAM = () => { const a = camera.aspect, k = a < 1.5 ? Math.min(2.1, 1.5 / a) : 1; return new THREE.Vector3(4.2 * k, 3.2 * k, 5.6 * k); };
function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); const was = camera.aspect; camera.aspect = w / h; camera.updateProjectionMatrix(); if (Math.abs(was - camera.aspect) > .05) camera.position.copy(CAM()); }

function frame() {
  if (!running) return; raf = requestAnimationFrame(frame);
  if (!box.isConnected || !box.offsetParent) return;
  if (renderer.domElement.width === 0 || box.clientWidth !== renderer.domElement.clientWidth) resize();
  const d = state.target - state.s; if (Math.abs(d) > .001) { state.s += d * .06; apply(); }
  else if (state.playing) { state.target = state.target > .5 ? 0 : 1; }
  controls.update(); renderer.render(scene, camera); placeLabels();
}

async function init() {
  if (!hasGL()) { fallback(); return; }
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  box.prepend(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1.6, .1, 100); camera.position.set(4.2, 3.2, 5.6);
  scene.add(new THREE.HemisphereLight(0xdfefff, 0x3a2a1a, .9));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(4, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); sun.shadow.bias = -.0005; scene.add(sun);
  const fill = new THREE.DirectionalLight(0x9fd0ff, .6); fill.position.set(-5, 2, -3); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 48), new THREE.ShadowMaterial({ opacity: .3 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -2.15; ground.receiveShadow = true; scene.add(ground);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, -.8, 0); controls.minDistance = 3.5; controls.maxDistance = 18; controls.enablePan = false;
  camera.aspect = 9; build(); resize(); state.target = 1; frame();
  document.querySelectorAll('#fSeg button').forEach(b => b.addEventListener('click', () => { state.type = b.dataset.f; state.s = 0; state.target = 1; build(); }));
  document.getElementById('f3play').onclick = () => { state.playing = !state.playing; document.getElementById('f3play').textContent = state.playing ? 'إيقاف الحركة' : 'تشغيل الحركة'; if (state.playing) state.target = 1; };
  document.getElementById('f3plane').onclick = () => { state.plane = !state.plane; planeMesh.visible = state.plane; };
  document.getElementById('f3reset').onclick = () => { camera.position.copy(CAM()); controls.target.set(0, -.8, 0); state.s = 0; state.target = 0; state.playing = false; document.getElementById('f3play').textContent = 'تشغيل الحركة'; apply(); };
  if (!RZ) { RZ = true; window.addEventListener('resize', () => renderer && box && box.isConnected && resize()); }
  window.__f3 = { ok: true };
}

export function fault3dStart(el) {
  fault3dStop(); box = el; if (!box) return;
  state = { type: 'normal', s: 0, target: 0, plane: false, playing: false }; arrows = []; labels = [];
  running = true; init();
}
export function fault3dStop() {
  running = false; cancelAnimationFrame(raf);
  if (renderer) { try { renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); renderer.domElement.remove(); } catch (e) {} renderer = null; }
  if (controls) { try { controls.dispose(); } catch (e) {} controls = null; }
}
