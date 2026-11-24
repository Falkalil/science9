import * as THREE from 'three';
import { realRenderer, realScene } from './kit.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BOOK, TOC, MODELS, toPdf, toPrinted } from './data.js';
import * as M4 from './models4.js';
import * as A from './models6a.js';
import * as G9 from './models9.js';
import { L9 } from './lessons9.js';
import { initPlay } from './play.js';
const LESSONS = [...L9].sort((a, b) => a.from - b.from);
import { initLessons } from './lesson.js';
import { initPractice } from './practice.js';
import { NAFES } from './nafes.js';

const BUILD = { layers: M4.layersModel, plates: M4.platesModel, quake: M4.quakeModel, epicenter: M4.epicenterModel, tsunami: M4.tsunamiModel, volcano: M4.volcanoModel,
  cell: A.cellModel, diffusion: A.diffusionModel, photosyn: A.photosynModel, active: A.activeModel, cellcycle: A.cellcycleModel, mitosis: A.mitosisModel, meiosis: A.meiosisModel, punnett: A.punnettModel, ...G9.BUILD9 };
const PW = BOOK.w, PH = BOOK.h, AR = PW / PH, N = BOOK.pages;
const $ = s => document.querySelector(s);
const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const src = n => { const p = `pages/${String(n).padStart(3, '0')}.webp`; return (window.__IMG && window.__IMG[p]) || p; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const byPdf = {}; MODELS.forEach(m => { m.pdf = toPdf(m.page); (byPdf[m.pdf] ||= []).push(m); });
const pageLabel = n => n >= 6 ? 'ص ' + ar(toPrinted(n)) : (n === 1 ? 'الغلاف' : n === 5 ? 'المحتويات' : 'المقدمة');

/* ═════════ تخطيط الكتاب ═════════ */
let mode = 'single', cur = 2, onPage = () => {};
const NOTE = { on: false }, PZ = { s: 1, x: 0, y: 0, busy: false };
let renderNotes = () => {}; // cur: صفحة الملف المعروضة (الأولى/اليمنى)
cur = 1;
try { const s = +localStorage.getItem('sci9-p2'); if (s >= 1 && s <= N) cur = s; } catch (e) {}
if (/^#p\d+$/.test(location.hash)) cur = clamp(+location.hash.slice(2), 1, N);
const book = $('#book'), wrap = $('#bookWrap'), stage = $('#stage');
let pageWpx = 300;
function layout() {
  const vw = innerWidth, vh = stage.clientHeight;
  mode = (vw >= 900 && vw / vh > 1.12) ? 'spread' : 'single';
  const tilt = stage.classList.contains('tilted');
  const usableH = vh * (tilt ? .9 : .97), usableW = vw * (mode === 'spread' ? .96 : .94);
  let ph = usableH, pw = ph * AR;
  const cols = mode === 'spread' ? 2 : 1;
  if (pw * cols > usableW) { pw = usableW / cols; ph = pw / AR; }
  pageWpx = pw;
  wrap.style.width = book.style.width = (pw * cols) + 'px'; wrap.style.height = book.style.height = ph + 'px'; book.style.setProperty('--ph', ph + 'px');
}
// الغلاف وحده، ثم الصفحات الزوجية على اليمين والفردية على اليسار كما في الكتاب المطبوع
const spreadOf = n => n <= 1 ? 0 : Math.floor(n / 2);
const spreadPages = k => k === 0 ? [1, null] : [2 * k, 2 * k + 1 <= N ? 2 * k + 1 : null];

function makePage(n) {
  const el = document.createElement('div'); el.className = 'page';
  if (!n) { el.style.background = '#f7f1e3'; return el; }
  const img = new Image(); img.className = 'pg'; img.decoding = 'async'; img.src = src(n); img.alt = 'صفحة ' + n; el.appendChild(img);
  if (n === 1) el.insertAdjacentHTML('beforeend', '<svg class="credit" viewBox="0 0 600 60" style="position:absolute;left:25%;width:50%;top:90.6%;pointer-events:none;overflow:visible"><rect x="120" y="6" width="360" height="48" rx="24" fill="#15445a"/><text x="300" y="39" text-anchor="middle" direction="rtl" font-family="Tajawal,sans-serif" font-size="26" font-weight="800" fill="#fff">تصميم: أ. هيفاء السلمي</text></svg>');
  for (const m of (byPdf[n] || [])) {
    const [x0, y0, x1, y1] = m.cover;
    const h = document.createElement('div'); h.className = 'hot'; h.dataset.model = m.id;
    Object.assign(h.style, { left: x0 / PW * 100 + '%', top: y0 / PH * 100 + '%', width: (x1 - x0) / PW * 100 + '%', height: (y1 - y0) / PH * 100 + '%', background: m.bg });
    const c = document.createElement('canvas'); h.appendChild(c);
    h.insertAdjacentHTML('beforeend', '<span class="badge">ثلاثي الأبعاد</span><span class="tapHint">المسني</span>');
    el.appendChild(h);
    for (const k of m.keep) el.appendChild(patch(n, k));
  }
  const hc = document.createElement('canvas'); hc.className = 'hlc'; hc.dataset.p = n; el.appendChild(hc); requestAnimationFrame(() => drawHL(hc));
  el.dataset.p = n; renderNotes(el, n);
  return el;
}
function patch(n, [x0, y0, x1, y1]) {
  const p = document.createElement('div'); p.className = 'patch'; const w = x1 - x0, h = y1 - y0;
  Object.assign(p.style, { left: x0 / PW * 100 + '%', top: y0 / PH * 100 + '%', width: w / PW * 100 + '%', height: h / PH * 100 + '%', backgroundImage: `url(${src(n)})`, backgroundSize: `${PW / w * 100}% ${PH / h * 100}%`, backgroundPosition: `${x0 / (PW - w) * 100}% ${y0 / (PH - h) * 100}%` });
  return p;
}
const slots = {};
function slot(cls, n) {
  const s = document.createElement('div'); s.className = 'slot ' + cls; s.appendChild(makePage(n)); book.appendChild(s); slots[cls] = s; return s;
}
function setSlot(cls, n) { const s = slots[cls]; s.innerHTML = ''; s.appendChild(makePage(n)); }
function render() {
  book.innerHTML = ''; for (const k in slots) delete slots[k];
  if (mode === 'spread') { const [r, l] = spreadPages(spreadOf(cur)); cur = r; slot('R', r); slot('L', l); }
  else slot('S', cur);
  const fl = document.createElement('div'); fl.id = 'flipper'; fl.innerHTML = '<div class="face front"></div><div class="face back"></div>'; book.appendChild(fl);
  updateNum(); preload();
}
function updateNum() {
  const t = mode === 'spread' ? (() => { const [r, l] = spreadPages(spreadOf(cur)); return l && r >= 6 ? 'ص ' + ar(toPrinted(r)) + '–' + ar(toPrinted(l)) : (l ? pageLabel(r) + ' – ' + pageLabel(l) : pageLabel(r)); })() : pageLabel(cur);
  $('#pnum').textContent = t;
  try { localStorage.setItem('sci9-p2', cur); } catch (e) {}
  onPage(cur);
  try { history.replaceState(null, '', '#p' + toPrinted(cur)); } catch (e) {}
}
function preload() { for (const d of [-2, -1, 1, 2, 3, 4]) { const n = cur + d; if (n >= 1 && n <= N) { const i = new Image(); i.src = src(n); } } }

/* ═════════ تقليب الصفحات ═════════ */
let flip = null;
function canGo(dir) { if (mode === 'spread') { const k = spreadOf(cur) + dir; return k >= 0 && spreadPages(k)[0] <= N; } const n = cur + dir; return n >= 1 && n <= N; }
function beginFlip(dir) {
  if (flip || !canGo(dir)) return null;
  const fl = $('#flipper'), front = fl.querySelector('.front'), back = fl.querySelector('.back');
  front.innerHTML = back.innerHTML = ''; front.className = 'face front'; back.className = 'face back';
  let f = { dir, p: 0 };
  if (mode === 'spread') {
    const k = spreadOf(cur), [r, l] = spreadPages(k);
    if (dir > 0) { const [r2, l2] = spreadPages(k + 1); setSlot('L', l2); front.appendChild(makePage(l)); back.appendChild(makePage(r2)); front.classList.add('L'); back.classList.add('R');
      Object.assign(fl.style, { left: '0', width: '50%', transformOrigin: '100% 50%' }); f.angle = p => p * 180; f.end = () => { setSlot('R', r2); cur = r2; }; f.undo = () => setSlot('L', l); }
    else { const [r0, l0] = spreadPages(k - 1); setSlot('R', r0); front.appendChild(makePage(r)); back.appendChild(makePage(l0)); front.classList.add('R'); back.classList.add('L');
      Object.assign(fl.style, { left: '50%', width: '50%', transformOrigin: '0% 50%' }); f.angle = p => -p * 180; f.end = () => { setSlot('L', l0); cur = r0; }; f.undo = () => setSlot('R', r); }
  } else {
    Object.assign(fl.style, { left: '0', width: '100%', transformOrigin: '100% 50%' });
    if (dir > 0) { const n = cur; setSlot('S', n + 1); front.appendChild(makePage(n)); back.appendChild(makePage(null)); f.angle = p => p * 178; f.end = () => { cur = n + 1; }; f.undo = () => setSlot('S', n); }
    else { const n = cur; front.appendChild(makePage(n - 1)); back.appendChild(makePage(null)); f.angle = p => (1 - p) * 178; f.end = () => { setSlot('S', n - 1); cur = n - 1; }; f.undo = () => {}; }
  }
  front.insertAdjacentHTML('beforeend', '<div class="shade"></div>'); back.insertAdjacentHTML('beforeend', '<div class="shade"></div>');
  fl.style.display = 'block'; flip = f; setFlip(0); return f;
}
function setFlip(p) {
  const f = flip; f.p = p; const fl = $('#flipper'); const a = f.angle(p);
  fl.style.transform = `rotateY(${a}deg)`;
  const s = Math.abs(Math.sin(a * Math.PI / 180));
  fl.querySelectorAll('.shade').forEach((el, i) => el.style.background = `linear-gradient(${i ? 270 : 90}deg, rgba(0,0,0,${.32 * s}), rgba(0,0,0,${.08 * s}) 40%, rgba(255,255,255,${.12 * s}) 70%, rgba(0,0,0,${.15 * s}))`);
  if (mode === 'single') fl.style.opacity = Math.abs(a) > 120 ? clamp((178 - Math.abs(a)) / 58) : 1;
}
function finishFlip(complete, dur = 520) {
  const f = flip; if (!f) return; const p0 = f.p, p1 = complete ? 1 : 0, t0 = performance.now();
  const step = now => {
    const k = clamp((now - t0) / (dur * Math.abs(p1 - p0) + 1)); setFlip(p0 + (p1 - p0) * easeIO(k));
    if (k < 1) return requestAnimationFrame(step);
    const fl = $('#flipper'); fl.style.display = 'none'; fl.style.opacity = 1;
    if (complete) f.end(); else f.undo();
    fl.querySelector('.front').innerHTML = fl.querySelector('.back').innerHTML = '';
    flip = null; updateNum(); preload();
  };
  requestAnimationFrame(step);
}
function go(dir) { if (lifted) return; if (beginFlip(dir)) finishFlip(true, 650); }
function goTo(n) {
  n = clamp(n, 1, N); if (flip) return;
  if (mode === 'spread' ? spreadOf(n) === spreadOf(cur) : n === cur) return;
  const dir = n > cur ? 1 : -1;
  if (Math.abs(n - cur) <= (mode === 'spread' ? 2 : 1)) return go(dir);
  // انتقال سريع: نقلب ورقة واحدة بعد تبديل المحتوى
  cur = mode === 'spread' ? spreadPages(spreadOf(clamp(n - dir * 2, 1, N)))[0] : n - dir; cur = clamp(cur, 1, N); render(); go(dir);
  if (!flip) { cur = n; render(); }
}
// السحب بالإصبع (اتجاه الكتاب العربي: السحب نحو اليمين = الصفحة التالية)
let drag = null;
book.addEventListener('pointerdown', e => { if (lifted || flip || HL.on || NOTE.on || PZ.busy) return; drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, started: false, hot: e.target.closest('.hot') }; });
addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.started && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy)) { if (beginFlip(dx > 0 ? 1 : -1)) { drag.started = true; drag.dir = dx > 0 ? 1 : -1; } else drag = null; }
  if (drag && drag.started) setFlip(clamp(drag.dir * dx / (pageWpx * (mode === 'spread' ? 1.4 : 1.1)), 0, 1));
});
addEventListener('pointerup', e => {
  if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
  if (d.started) { const v = (e.clientX - d.x) / (performance.now() - d.t); finishFlip(flip.p > .32 || Math.abs(v) > .6 && Math.sign(v) === d.dir); return; }
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10 && d.hot) openModel(d.hot.dataset.model, d.hot);
});
addEventListener('pointercancel', () => { if (drag && drag.started && flip) finishFlip(false); drag = null; });
addEventListener('keydown', e => { if (lifted) { if (e.key === 'Escape') closeModel(); return; } if (e.key === 'ArrowLeft') go(1); if (e.key === 'ArrowRight') go(-1); });
$('#btnNext').onclick = () => go(1); $('#btnPrev').onclick = () => go(-1);
$('#btnFlat').onclick = () => { const t = stage.classList.toggle('tilted'); stage.classList.toggle('flat', !t); $('#btnFlat').classList.toggle('on', !t); $('#flatLbl').textContent = t ? 'مسطّح' : 'مائل'; layout(); };
addEventListener('resize', () => { const m = mode; layout(); if (m !== mode) render(); if (lifted) sizeLift(); redrawHL(); });

/* ═════════ الفهرس وقائمة المجسّمات ═════════ */
function openDrawer(id) { $('#scrim').style.display = 'block'; $(id).classList.add('open'); }
function closeDrawers() { $('#scrim').style.display = 'none'; document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open')); }
$('#scrim').onclick = closeDrawers; document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeDrawers);
$('#btnToc').onclick = $('#pnum').onclick = () => openDrawer('#tocD'); $('#btnModels').onclick = () => openDrawer('#modD');
$('#tocList').innerHTML = TOC.map(u => `<div class="unit">${u.t}</div>` + u.items.map(([t, p, c]) => `<div class="ti ${c || ''}" data-p="${p}"><span>${t}</span><b>${ar(p)}</b></div>`).join('')).join('');
$('#tocList').onclick = e => { const it = e.target.closest('.ti'); if (!it) return; closeDrawers(); setTimeout(() => goTo(toPdf(+it.dataset.p)), 250); };
$('#gotoBtn').onclick = () => { const v = parseInt(String($('#gotoIn').value).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))); if (v >= 1) { closeDrawers(); setTimeout(() => goTo(toPdf(v)), 250); } };
const UNITS = { 1: 'الوحدة الأولى: طبيعة العلم وتغيرات الأرض', 2: 'الوحدة الثانية: أسس الحياة', 3: 'الوحدة الثالثة: كيمياء المادة' };
$('#modList').innerHTML = [1, 2, 3].map(u => `<div class="unit">${UNITS[u]}</div>` + MODELS.filter(m => m.unit === u).map(m => { const [x0, y0, x1, y1] = m.cover, w = x1 - x0, h = y1 - y0, s = Math.max(w, h); return `<div class="mi" data-id="${m.id}"><div class="th" style="background-image:url(${src(m.pdf)});background-size:${PW / s * 100}% auto;background-position:${x0 / (PW - s) * 100}% ${y0 / (PH - s) * 100}%"></div><div><div class="tt">${m.title}</div><div class="ss">ص ${ar(m.page)} · ${m.lesson}</div></div></div>`; }).join('')).join('');
$('#modList').onclick = e => { const it = e.target.closest('.mi'); if (!it) return; const m = MODELS.find(x => x.id === it.dataset.id); closeDrawers();
  setTimeout(() => { goTo(m.pdf); const wait = () => { if (flip) return setTimeout(wait, 120); const h = book.querySelector(`.slot .hot[data-model="${m.id}"]`); if (h) setTimeout(() => openModel(m.id, h), 200); }; wait(); }, 260); };

/* ═════════ التكبير للقراءة ═════════ */
let zl = 1;
function openZoom() {
  const pages = mode === 'spread' ? spreadPages(spreadOf(cur)).filter(Boolean) : [cur];
  $('#zin').innerHTML = pages.map(n => `<img src="${src(n)}" alt="">`).join(''); zl = 1; applyZoom(); $('#zoom').style.display = 'flex';
}
function applyZoom() { const cols = $('#zin').children.length; const base = Math.min(innerWidth - 20, (innerHeight - 70) * AR * cols) / cols; [...$('#zin').children].forEach(i => i.style.width = (base * zl - 4) + 'px'); $('#zPct').textContent = ar(Math.round(zl * 100)) + '٪'; }
$('#btnZoom').onclick = openZoom; $('#zClose').onclick = () => $('#zoom').style.display = 'none';
$('#zIn').onclick = () => { zl = Math.min(4, zl + .5); applyZoom(); }; $('#zOut').onclick = () => { zl = Math.max(1, zl - .5); applyZoom(); };
{ const pts = new Map(); let d0 = 0, z0 = 1; const zs = $('#zs');
  zs.addEventListener('pointerdown', e => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = zl; } });
  zs.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); zl = clamp(z0 * d / d0, 1, 4); applyZoom(); } });
  const up = e => pts.delete(e.pointerId); zs.addEventListener('pointerup', up); zs.addEventListener('pointercancel', up);
  zs.addEventListener('dblclick', () => { zl = zl > 1 ? 1 : 2.2; applyZoom(); }); }

/* ═════════ المجسّمات: البناء والعرض داخل الصفحة ═════════ */
const rPage = realRenderer(new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false }));
rPage.setPixelRatio(1); rPage.setSize(1024, 1024, false); rPage.setClearColor(0x000000, 0);
const insts = {};
function boxOf(root) { const b = new THREE.Box3(); root.updateMatrixWorld(true); root.traverseVisible(o => { if (o.isMesh && !o.userData.glow) { o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } }); return b; }
function fitCam(cam, dirFrom, dirTo, box, aspect, pad = 1.08) {
  const s = box.getBoundingSphere(new THREE.Sphere()); const dir = new THREE.Vector3(...dirFrom).sub(new THREE.Vector3(...dirTo)).normalize();
  const vf = cam.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * aspect);
  const d = s.radius * pad / Math.sin(Math.min(vf, hf) / 2);
  cam.aspect = aspect; cam.position.copy(s.center).add(dir.multiplyScalar(d)); cam.lookAt(s.center); cam.updateProjectionMatrix(); return s.center.clone();
}
function getInst(id) {
  if (insts[id]) return insts[id];
  const def = MODELS.find(m => m.id === id);
  const scene = new THREE.Scene();
  realScene(scene); scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8060, .75));
  const dl = new THREE.DirectionalLight(0xffffff, 1.9); dl.position.set(5, 9, 7); scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0xfff0d8, .6); dl2.position.set(-6, 2, -4); scene.add(dl2);
  const inst = { id, def, scene, ctrlSetters: [], stepSetter: null, anims: [] };
  inst.api = {
    toast: t => showToast(t), flyTo: (p, t) => lifted === inst && flyTo(p, t), refreshParts: () => { if (!inst.m) return; buildPick(inst); if (lifted === inst) buildLabels(inst); },
    setControl: (i, v) => inst.ctrlSetters[i] && inst.ctrlSetters[i](v), setStep: i => inst.stepSetter && inst.stepSetter(i),
    animate: (fn, a, b, secs) => inst.anims.push({ fn, a, b, secs, t: 0 }),
    select: pid => { if (lifted === inst) selectPart(inst.m.parts.find(p => p.id === pid) || null); }
  };
  const m = BUILD[def.build || id](inst.api, def.variant || 0); inst.m = m; scene.add(m.root);
  const [x0, y0, x1, y1] = def.cover; inst.aspect = (x1 - x0) / (y1 - y0);
  inst.pageCam = new THREE.PerspectiveCamera(35, inst.aspect, .1, 200);
  inst.box = m.pageBox ? new THREE.Box3(new THREE.Vector3(...m.pageBox.slice(0, 3)), new THREE.Vector3(...m.pageBox.slice(3))) : boxOf(m.root);
  inst.pageCenter = fitCam(inst.pageCam, m.inpage.pos, m.inpage.target, inst.box, inst.aspect, m.fit || 0.9);
  buildPick(inst);
  insts[id] = inst; return inst;
}
function tickInst(inst, dt, t) {
  for (let i = inst.anims.length - 1; i >= 0; i--) { const a = inst.anims[i]; a.t += dt; const k = clamp(a.t / a.secs); a.fn(a.a + (a.b - a.a) * k); if (k >= 1) inst.anims.splice(i, 1); }
  inst.m.update(dt, t);
}
let last = performance.now(), acc = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (lifted) { liftFrame(dt, t); return; }
  acc += dt; if (acc < 1 / 30) return; const dd = acc; acc = 0;
  const hots = book.querySelectorAll('.hot');
  const done = new Set();
  hots.forEach(h => {
    const inst = getInst(h.dataset.model); if (!done.has(inst)) { tickInst(inst, dd, t); done.add(inst); }
    const r = inst.m.root; r.rotation.y = Math.sin(t * .55) * .22; r.position.y = (r.userData.y0 ??= r.position.y) + Math.sin(t * 1.3) * .06;
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    let w = Math.round(h.offsetWidth * dpr), hh = Math.round(h.offsetHeight * dpr); const s = Math.min(1, 1024 / Math.max(w, hh)); w = Math.max(2, Math.round(w * s)); hh = Math.max(2, Math.round(hh * s));
    const c = h.firstChild; if (c.width !== w || c.height !== hh) { c.width = w; c.height = hh; }
    rPage.setViewport(0, 1024 - hh, w, hh); rPage.setScissor(0, 1024 - hh, w, hh); rPage.setScissorTest(true);
    rPage.clear(); rPage.render(inst.scene, inst.pageCam);
    const g = c.getContext('2d'); g.clearRect(0, 0, w, hh); g.drawImage(rPage.domElement, 0, 0, w, hh, 0, 0, w, hh);
  });
}

/* ═════════ المجسّم المرفوع إلى وسط الشاشة ═════════ */
const v3 = $('#v3'), liftEl = $('#lift');
const rLift = realRenderer(new THREE.WebGLRenderer({ antialias: true, alpha: true })); rLift.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); v3.prepend(rLift.domElement);
const cam = new THREE.PerspectiveCamera(38, 1, .05, 300);
const ctl = new OrbitControls(cam, rLift.domElement); ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.enablePan = false; ctl.rotateSpeed = .8;
let lifted = null, srcHot = null, camAnim = null, selected = null, labelsOn = true, quiz = null;
function sizeLift() { const w = innerWidth, h = innerHeight; rLift.setSize(w, h, false); cam.aspect = w / h;
  if (w >= 700) cam.setViewOffset(w, h, -Math.min(190, w * .14), 0, w, h); else cam.setViewOffset(w, h, 0, h * .17, w, h);
  cam.updateProjectionMatrix(); }
function popupPose(inst) {
  const m = inst.m, aspect = innerWidth / innerHeight; const c = new THREE.PerspectiveCamera(38, aspect, .05, 300);
  const box = boxOf(m.root); const tgt = fitCam(c, m.cam.pos, m.cam.target, box, aspect, m.fitPop || (innerWidth < 700 ? 1.08 : 0.98));
  return { p: c.position.clone(), tgt };
}
function openModel(id, hot) {
  if (lifted || flip) return; const inst = getInst(id); lifted = inst; srcHot = hot;
  liftEl.style.display = 'block'; sizeLift(); hot.classList.add('lifted');
  const r = hot.getBoundingClientRect(); const s = Math.min(r.width / innerWidth, r.height / innerHeight);
  v3.style.transition = 'none'; v3.style.background = inst.def.bg;
  v3.style.transform = `translate(${r.left + r.width / 2 - innerWidth * s / 2}px, ${r.top + r.height / 2 - innerHeight * s / 2}px) scale(${s})`;
  inst.m.root.rotation.y = 0; if (inst.m.root.userData.y0 !== undefined) inst.m.root.position.y = inst.m.root.userData.y0;
  // تبدأ الكاميرا من زاوية الصفحة ثم تتحرك
  cam.position.copy(inst.pageCam.position); ctl.target.copy(inst.pageCenter); cam.lookAt(ctl.target);
  const pose = popupPose(inst); flyTo(pose.p.toArray(), pose.tgt.toArray(), 900);
  ctl.minDistance = pose.p.distanceTo(pose.tgt) * .3; ctl.maxDistance = pose.p.distanceTo(pose.tgt) * 2.5;
  requestAnimationFrame(() => requestAnimationFrame(() => { v3.style.transition = 'transform .75s cubic-bezier(.2,.8,.2,1.05), border-radius .75s'; v3.style.transform = 'none'; v3.style.borderRadius = '0px'; liftEl.classList.add('show'); }));
  $('#ttl').innerHTML = `${inst.def.title}<small>${inst.def.lesson} · ص ${ar(inst.def.page)}</small>`;
  buildControls(inst); buildLabels(inst); selectPart(null); endQuiz(); setCmp(false); showToast('');
  labelsOn = true; $('#bLabels').classList.add('on');
}
function closeModel() {
  if (!lifted) return; const inst = lifted; endQuiz(); selectPart(null); showToast(''); setCmp(false);
  const r = srcHot.getBoundingClientRect(); const s = Math.min(r.width / innerWidth, r.height / innerHeight);
  liftEl.classList.remove('show'); v3.style.borderRadius = '18px';
  v3.style.transform = `translate(${r.left + r.width / 2 - innerWidth * s / 2}px, ${r.top + r.height / 2 - innerHeight * s / 2}px) scale(${s})`;
  flyTo(inst.pageCam.position.toArray(), inst.pageCenter.toArray(), 700);
  setTimeout(() => { liftEl.style.display = 'none'; srcHot.classList.remove('lifted'); lifted = null; $('#labels').innerHTML = ''; }, 760);
}
function flyTo(p, t, ms = 900) { camAnim = { p0: cam.position.clone(), t0: ctl.target.clone(), p1: new THREE.Vector3(...p), t1: new THREE.Vector3(...t), s: performance.now(), ms }; }
const tmpV = new THREE.Vector3();
function liftFrame(dt, t) {
  tickInst(lifted, dt, t);
  if (camAnim) { const k = easeIO(clamp((performance.now() - camAnim.s) / camAnim.ms)); cam.position.lerpVectors(camAnim.p0, camAnim.p1, k); ctl.target.lerpVectors(camAnim.t0, camAnim.t1, k); if (k >= 1) camAnim = null; }
  ctl.enabled = !camAnim; ctl.update();
  rLift.render(lifted.scene, cam);
  // الأسماء
  const w = innerWidth, h = innerHeight;
  for (const L of lifted.labels || []) {
    const part = L.part, hid = !labelsOn && part !== selected || (part.hidden && part.hidden()) || quiz;
    if (hid) { L.el.style.display = 'none'; continue; }
    part.at.getWorldPosition(tmpV).project(cam);
    if (tmpV.z > 1) { L.el.style.display = 'none'; continue; }
    L.el.style.display = 'block'; L.el.style.left = ((tmpV.x + 1) / 2 * w) + 'px'; L.el.style.top = ((1 - tmpV.y) / 2 * h) + 'px';
  }
}
// الالتقاط باللمس
function buildPick(inst) {
  inst.meshPart = new Map(); inst.pickables = [];
  for (const part of inst.m.parts) for (const o of part.objs) o.traverse(x => { if (x.isMesh && !x.userData.glow) { if (!inst.meshPart.has(x)) { inst.meshPart.set(x, []); inst.pickables.push(x); } inst.meshPart.get(x).push(part); } });
}
function buildLabels(inst) {
  const box = $('#labels'); box.innerHTML = ''; inst.labels = inst.m.parts.map(part => { const el = document.createElement('div'); el.className = 'plabel'; el.textContent = part.name; el.onclick = e => { e.stopPropagation(); onPart([part]); }; box.appendChild(el); return { el, part }; });
}
const ray = new THREE.Raycaster(); let pd = null;
rLift.domElement.addEventListener('pointerdown', e => { pd = { x: e.clientX, y: e.clientY, t: performance.now() }; });
rLift.domElement.addEventListener('pointerup', e => {
  if (!pd || !lifted) return; const moved = Math.hypot(e.clientX - pd.x, e.clientY - pd.y); pd = null; if (moved > 7) return;
  ray.setFromCamera({ x: e.clientX / innerWidth * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1 }, cam);
  const hits = ray.intersectObjects(lifted.pickables, false).filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
  for (const h of hits) { const ps = (lifted.meshPart.get(h.object) || []).filter(p => !(p.hidden && p.hidden())); if (ps.length) return onPart(ps); }
  if (!quiz) selectPart(null);
});
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: .42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide });
const badMat = glowMat.clone(); badMat.color.set(0xff3b30);
let glows = [];
function glow(part, m = glowMat) { for (const o of part.objs) o.traverse(x => { if (x.isMesh && !x.userData.glow) { const g = new THREE.Mesh(x.geometry, m); g.userData.glow = true; g.raycast = () => {}; x.add(g); glows.push(g); } }); }
function clearGlow() { glows.forEach(g => g.parent && g.parent.remove(g)); glows = []; }
function selectPart(part) {
  selected = part; clearGlow(); (lifted?.labels || []).forEach(L => L.el.classList.toggle('sel', L.part === part));
  if (!part) { $('#info').style.display = 'none'; return; }
  glow(part); $('#info h3').textContent = part.name; $('#info p').textContent = part.info; $('#info').style.display = 'block';
}
function onPart(ps) { if (quiz) return quizAnswer(ps); selectPart(ps[0]); }
$('#infoX').onclick = () => selectPart(null);
$('#bRet').onclick = closeModel;
$('#bLabels').onclick = () => { labelsOn = !labelsOn; $('#bLabels').classList.toggle('on', labelsOn); };
// رسم الكتاب للمقارنة
function setCmp(on) {
  $('#bCmp').classList.toggle('on', on); $('#cmp').style.display = on ? 'block' : 'none'; if (!on || !lifted) return;
  const d = lifted.def, [x0, y0, x1, y1] = d.cover, w = x1 - x0, h = y1 - y0; const el = $('#cmpI');
  Object.assign(el.style, { aspectRatio: `${w}/${h}`, backgroundImage: `url(${src(d.pdf)})`, backgroundSize: `${PW / w * 100}% ${PH / h * 100}%`, backgroundPosition: `${x0 / (PW - w) * 100}% ${y0 / (PH - h) * 100}%`, maxHeight: '52vh', width: w / h < .7 ? 'auto' : '100%', height: w / h < .7 ? '52vh' : 'auto', margin: '0 auto' });
  $('#cmpP').textContent = 'ص ' + ar(d.page);
}
$('#bCmp').onclick = () => setCmp($('#cmp').style.display !== 'block');
// رسائل قصيرة
let toastT = 0;
function showToast(t) { const el = $('#toast'); clearTimeout(toastT); if (!t) { el.style.display = 'none'; return; } el.textContent = t; el.style.display = 'block'; toastT = setTimeout(() => el.style.display = 'none', 7000); }
// لوحة التحكم الخاصة بكل درس
function buildControls(inst) {
  const b = $('#ctlB'); b.innerHTML = ''; inst.ctrlSetters = []; inst.stepSetter = null;
  inst.m.controls.forEach((c, i) => {
    const row = document.createElement('div'); row.className = 'cr';
    if (c.type === 'slider') {
      row.innerHTML = `<label>${c.label} <span></span></label><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}">`;
      const inp = row.querySelector('input'), sp = row.querySelector('span'); const show = v => sp.textContent = typeof c.fmt(v) === 'number' ? ar(c.fmt(v)) : String(c.fmt(v)).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
      show(+c.value); inp.oninput = () => { show(+inp.value); c.on(+inp.value); }; inst.ctrlSetters[i] = v => { inp.value = v; show(v); };
    } else if (c.type === 'button') {
      row.innerHTML = `<button class="cb">${c.label}</button>`; const btn = row.firstChild; let on = false;
      btn.onclick = () => { if (c.toggle) { on = !on; btn.classList.toggle('on', on); c.on(on); } else c.on(); };
    } else if (c.type === 'seg') {
      row.innerHTML = `<label>${c.label}</label><div class="seg">${c.options.map((o, k) => `<button class="${k === c.value ? 'on' : ''}">${o}</button>`).join('')}</div>`;
      inst.ctrlSetters[i] = k => row.querySelectorAll('.seg button').forEach((x, j) => x.classList.toggle('on', j === k)); row.querySelectorAll('.seg button').forEach((bt, k) => bt.onclick = () => { row.querySelectorAll('.seg button').forEach(x => x.classList.remove('on')); bt.classList.add('on'); c.on(k); });
    } else if (c.type === 'steps') {
      row.classList.add('steps'); let idx = c.value, play = 0;
      row.innerHTML = `<div class="st"></div><div class="sd"></div><div class="nav"><button data-a="p">→ السابق</button><button data-a="play">▶ تشغيل</button><button data-a="n">التالي ←</button></div><div class="dots">${c.steps.map(() => '<i></i>').join('')}</div>`;
      const paint = () => { row.querySelector('.st').textContent = idx < 0 ? 'خطوة بخطوة' : c.steps[idx].t; row.querySelector('.sd').textContent = idx < 0 ? 'اضغط «التالي» أو «تشغيل» لمتابعة العملية خطوة بخطوة.' : c.steps[idx].d; row.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k === idx)); };
      const set = k => { idx = clamp(k, 0, c.steps.length - 1); paint(); c.on(idx); };
      inst.stepSetter = k => { idx = k; paint(); };
      const stop = () => { clearInterval(play); play = 0; row.querySelector('[data-a=play]').textContent = '▶ تشغيل'; };
      row.querySelector('[data-a=p]').onclick = () => { stop(); set(idx - 1); }; row.querySelector('[data-a=n]').onclick = () => { stop(); set(idx + 1); };
      row.querySelector('[data-a=play]').onclick = e => { if (play) return stop(); e.target.textContent = '❚❚ إيقاف'; if (idx >= c.steps.length - 1 || idx < 0) set(0); else set(idx + 1); play = setInterval(() => { if (idx >= c.steps.length - 1 || !lifted) return stop(); set(idx + 1); }, 4200); };
      paint();
    }
    b.appendChild(row);
  });
  if (inst.m.legend) { const lg = document.createElement('div'); lg.className = 'legend'; lg.innerHTML = inst.m.legend.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join(''); b.appendChild(lg); }
  $('#ctl').classList.toggle('min', innerWidth < 700 && innerHeight < 700);
}
$('#ctlH').onclick = () => { $('#ctl').classList.toggle('min'); $('#ctlA').textContent = $('#ctl').classList.contains('min') ? '▴' : '▾'; };
// «اختبرني»
function startQuiz() { if (!lifted) return; selectPart(null); quiz = { i: 0, score: 0, qs: lifted.m.quiz, wait: false }; $('#bQuiz').classList.add('on'); paintQuiz(); }
function endQuiz() { quiz = null; $('#quiz').style.display = 'none'; $('#bQuiz').classList.remove('on'); clearGlow(); }
function paintQuiz(fb) {
  const q = quiz, el = $('#quiz'); el.style.display = 'block';
  if (q.i >= q.qs.length) { const n = q.qs.length; el.innerHTML = `<div class="qh"><span>اختبرني</span><span>انتهى</span></div><div class="qq">درجتك: ${ar(q.score)} من ${ar(n)} ${q.score === n ? '🌟 ممتاز!' : q.score >= n / 2 ? '👍 أحسنت' : '— حاول مرة أخرى'}</div><div class="qb"><button id="qAgain">أعد الاختبار</button><button id="qEnd">إنهاء</button></div>`; $('#qAgain').onclick = startQuiz; $('#qEnd').onclick = endQuiz; return; }
  el.innerHTML = `<div class="qh"><span>اختبرني</span><span>السؤال ${ar(q.i + 1)} من ${ar(q.qs.length)} · الدرجة ${ar(q.score)}</span></div><div class="qq">${q.qs[q.i].q}</div><div class="qf">${fb || '<span style="color:#7a6a55;font-weight:600">المس الجزء الصحيح في المجسّم.</span>'}</div><div class="qb"><button id="qEnd">إنهاء الاختبار</button></div>`;
  $('#qEnd').onclick = endQuiz;
}
function quizAnswer(ps) {
  const q = quiz; if (q.wait) return; const want = q.qs[q.i].a; const right = ps.some(p => p.id === want);
  const target = lifted.m.parts.find(p => p.id === want); clearGlow();
  if (right) { q.score++; glow(target); paintQuiz(`<span class="ok">✓ إجابة صحيحة: ${target.name}</span>`); }
  else { glow(ps[0], badMat); glow(target); paintQuiz(`<span class="no">✗ هذا «${ps[0].name}». الإجابة الصحيحة مضيئة: ${target.name}</span>`); }
  q.wait = true; setTimeout(() => { if (quiz !== q) return; q.wait = false; q.i++; clearGlow(); paintQuiz(); }, right ? 1300 : 2300);
}
$('#bQuiz').onclick = () => quiz ? endQuiz() : startQuiz();

/* ═════════ البدء ═════════ */
/* ═════════ قلم التظليل ═════════ */
const HL = { on: false, color: '#ffe14d', w: 'm', straight: true, erase: false, data: {}, hist: [] };
try { HL.data = JSON.parse(localStorage.getItem('sci9-hl') || '{}'); } catch (e) {}
const HLW = { s: .016, m: .026, l: .04 };
const saveHL = () => { try { localStorage.setItem('sci9-hl', JSON.stringify(HL.data)); } catch (e) {} };
function drawHL(c, live) {
  const r = c.getBoundingClientRect(); if (!r.width) return; const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr); if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const g = c.getContext('2d'); g.clearRect(0, 0, W, H); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const s of [...(HL.data[c.dataset.p] || []), ...(live ? [live] : [])]) { g.strokeStyle = s.c; g.lineWidth = s.w * H; g.beginPath(); s.pts.forEach(([x, y], i) => i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)); if (s.pts.length === 1) g.lineTo(s.pts[0][0] * W + .5, s.pts[0][1] * H); g.stroke(); }
}
function redrawHL() { document.querySelectorAll('canvas.hlc').forEach(c => drawHL(c)); }
let hlStroke = null, hlCanvas = null;
book.addEventListener('pointerdown', e => {
  if (!HL.on) return; const c = e.target.closest('canvas.hlc'); if (!c) return; e.preventDefault();
  const r = c.getBoundingClientRect(), p = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  hlCanvas = c; c.setPointerCapture(e.pointerId);
  if (HL.erase) { hlStroke = { erase: true }; eraseAt(c, p); return; }
  hlStroke = { c: HL.color, w: HLW[HL.w], pts: [p], y0: p[1] };
});
book.addEventListener('pointermove', e => {
  if (!hlStroke || !hlCanvas) return; const r = hlCanvas.getBoundingClientRect(); let p = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  if (hlStroke.erase) return eraseAt(hlCanvas, p);
  if (HL.straight) { p = [p[0], hlStroke.y0]; hlStroke.pts = [hlStroke.pts[0], p]; } else hlStroke.pts.push(p);
  drawHL(hlCanvas, hlStroke);
});
const hlEnd = () => { if (!hlStroke || !hlCanvas) return; if (!hlStroke.erase) { const k = hlCanvas.dataset.p; (HL.data[k] ||= []).push({ c: hlStroke.c, w: hlStroke.w, pts: hlStroke.pts }); HL.hist.push(k); saveHL(); } hlStroke = null; redrawHL(); hlCanvas = null; };
book.addEventListener('pointerup', hlEnd); book.addEventListener('pointercancel', hlEnd);
function eraseAt(c, [x, y]) { const k = c.dataset.p, a = HL.data[k]; if (!a) return; const n = a.length; HL.data[k] = a.filter(s => !s.pts.some(([px, py], i) => { const q = s.pts[i + 1]; if (!q) return Math.hypot(px - x, (py - y) * 1.3) < .02; const vx = q[0] - px, vy = q[1] - py, t = Math.max(0, Math.min(1, ((x - px) * vx + (y - py) * vy) / (vx * vx + vy * vy || 1))); return Math.hypot(px + vx * t - x, (py + vy * t - y) * 1.3) < s.w * .8 + .008; })); if (HL.data[k].length !== n) { saveHL(); redrawHL(); } }
function setHL(on) { if (on && NOTE.on) setNote(false); HL.on = on; document.body.classList.toggle('hl', on); if (on) { stage.classList.remove('tilted'); stage.classList.add('flat'); $('#btnFlat').classList.add('on'); $('#flatLbl').textContent = 'مائل'; layout(); redrawHL(); } }
$('#btnHL').onclick = () => setHL(!HL.on); $('#hlDone').onclick = () => setHL(false);
document.querySelectorAll('#hlBar .sw').forEach(s => s.onclick = () => { document.querySelectorAll('#hlBar .sw').forEach(x => x.classList.remove('on')); s.classList.add('on'); HL.color = s.dataset.c; HL.erase = false; $('#hlErase').classList.remove('on'); });
document.querySelectorAll('#hlBar [data-w]').forEach(b => b.onclick = () => { document.querySelectorAll('#hlBar [data-w]').forEach(x => x.classList.remove('on')); b.classList.add('on'); HL.w = b.dataset.w; });
$('#hlStraight').onclick = () => { HL.straight = !HL.straight; $('#hlStraight').classList.toggle('on', HL.straight); };
$('#hlErase').onclick = () => { HL.erase = !HL.erase; $('#hlErase').classList.toggle('on', HL.erase); };
$('#hlUndo').onclick = () => { const k = HL.hist.pop(); if (k && HL.data[k]?.length) { HL.data[k].pop(); saveHL(); redrawHL(); } };
let clearArm = 0;
$('#hlClear').onclick = () => { const b = $('#hlClear'); if (!clearArm) { clearArm = 1; b.textContent = 'اضغط للتأكيد'; b.style.background = '#e8323a'; b.style.color = '#fff'; setTimeout(() => { clearArm = 0; b.textContent = 'مسح الصفحة'; b.style.background = ''; b.style.color = ''; }, 2500); return; }
  clearArm = 0; b.textContent = 'مسح الصفحة'; b.style.background = ''; b.style.color = ''; document.querySelectorAll('.slot canvas.hlc').forEach(c => delete HL.data[c.dataset.p]); saveHL(); redrawHL(); };


/* ═════════ الكتابة على الكتاب ═════════ */
const NS = { s: .016, m: .022, l: .032 };
Object.assign(NOTE, { color: '#1a4fd0', size: 'm', bg: false, data: {} });
try { NOTE.data = JSON.parse(localStorage.getItem('sci9-notes') || '{}'); } catch (e) {}
const saveNotes = () => { try { localStorage.setItem('sci9-notes', JSON.stringify(NOTE.data)); } catch (e) {} };
function noteEl(n, d, idx) {
  const el = document.createElement('div'); el.className = 'note' + (d.bg ? ' bg' : ''); el.dataset.i = idx;
  Object.assign(el.style, { left: (d.x * 100) + '%', top: (d.y * 100) + '%', color: d.c, fontSize: `calc(var(--ph) * ${NS[d.s] || NS.m})` });
  const tx = document.createElement('span'); tx.className = 'nt'; tx.textContent = d.t; tx.contentEditable = NOTE.on ? 'plaintext-only' : 'false'; if (tx.contentEditable !== 'plaintext-only') tx.contentEditable = NOTE.on ? 'true' : 'false'; el.appendChild(tx);
  el.insertAdjacentHTML('beforeend', '<button class="nx" title="حذف">✕</button><button class="ng" title="تحريك">✥</button>');
  tx.addEventListener('input', () => { d.t = tx.innerText; saveNotes(); });
  tx.addEventListener('blur', () => { if (!tx.innerText.trim()) { const a = NOTE.data[n]; const k = a.indexOf(d); if (k >= 0) a.splice(k, 1); saveNotes(); el.remove(); } });
  el.querySelector('.nx').addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); const a = NOTE.data[n]; const k = a.indexOf(d); if (k >= 0) a.splice(k, 1); saveNotes(); el.remove(); });
  const g = el.querySelector('.ng');
  g.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); g.setPointerCapture(e.pointerId); const pr = el.parentElement.getBoundingClientRect(); const er = el.getBoundingClientRect(); const ox = e.clientX - er.left, oy = e.clientY - er.top;
    const mv = ev => { d.x = Math.max(0, Math.min(.95, (ev.clientX - ox - pr.left) / pr.width)); d.y = Math.max(0, Math.min(.97, (ev.clientY - oy - pr.top) / pr.height)); el.style.left = d.x * 100 + '%'; el.style.top = d.y * 100 + '%'; };
    const up = () => { g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); saveNotes(); }; g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up); });
  return el;
}
renderNotes = (pageEl, n) => { pageEl.querySelectorAll('.note').forEach(x => x.remove()); (NOTE.data[n] || []).forEach((d, i) => pageEl.appendChild(noteEl(n, d, i))); };
const rerenderNotes = () => document.querySelectorAll('#book .page[data-p]').forEach(pg => renderNotes(pg, +pg.dataset.p));
book.addEventListener('pointerdown', e => {
  if (!NOTE.on || PZ.busy || e.target.closest('.note')) return; const pg = e.target.closest('.slot .page[data-p]'); if (!pg) return;
  e.preventDefault(); e.stopPropagation(); const r = pg.getBoundingClientRect(); const n = +pg.dataset.p;
  const d = { x: Math.max(0, Math.min(.92, (e.clientX - r.left) / r.width - .01)), y: Math.max(0, Math.min(.95, (e.clientY - r.top) / r.height - .012)), t: '', c: NOTE.color, s: NOTE.size, bg: NOTE.bg };
  (NOTE.data[n] ||= []).push(d); const el = noteEl(n, d, NOTE.data[n].length - 1); pg.appendChild(el);
  setTimeout(() => el.querySelector('.nt').focus(), 30);
}, true);
function setNote(on) { if (on && HL.on) setHL(false); NOTE.on = on; document.body.classList.toggle('nt', on); if (on) { stage.classList.remove('tilted'); stage.classList.add('flat'); $('#btnFlat').classList.add('on'); $('#flatLbl').textContent = 'مائل'; layout(); } else document.activeElement?.blur?.(); rerenderNotes(); }
$('#btnNote').onclick = () => setNote(!NOTE.on); $('#noteDone').onclick = () => setNote(false);
document.querySelectorAll('#noteBar .nc').forEach(b => b.onclick = () => { document.querySelectorAll('#noteBar .nc').forEach(x => x.classList.remove('on')); b.classList.add('on'); NOTE.color = b.dataset.c; });
document.querySelectorAll('#noteBar [data-ns]').forEach(b => b.onclick = () => { document.querySelectorAll('#noteBar [data-ns]').forEach(x => x.classList.remove('on')); b.classList.add('on'); NOTE.size = b.dataset.ns; });
$('#noteBg').onclick = () => { NOTE.bg = !NOTE.bg; $('#noteBg').classList.toggle('on', NOTE.bg); };

/* ═════════ قائمة الأدوات على الجوال ═════════ */
$('#btnTools').onclick = e => { e.stopPropagation(); $('#toolsPop').classList.toggle('open'); $('#flatLbl2').textContent = $('#flatLbl').textContent; };
document.querySelectorAll('#toolsPop button').forEach(b => b.onclick = () => { $('#toolsPop').classList.remove('open'); $('#' + b.dataset.t).click(); });
addEventListener('pointerdown', e => { if (!e.target.closest('#toolsPop,#btnTools')) $('#toolsPop').classList.remove('open'); });

/* ═════════ تكبير الصفحة بالأصابع ═════════ */
const pz = $('#pz'), ptrs = new Map(); let pinch = null, pan = null, lastTap = { t: 0, x: 0, y: 0 };
function applyPZ(anim) { pz.classList.toggle('anim', !!anim); if (PZ.s <= 1.01) { PZ.s = 1; PZ.x = 0; PZ.y = 0; }
  const r = stage.getBoundingClientRect(), w = pz.offsetWidth * PZ.s, h = pz.offsetHeight * PZ.s, L = pz.offsetLeft, T = pz.offsetTop;
  if (PZ.s > 1) { PZ.x = Math.min(r.width * .45 - L, Math.max(r.width * .55 - L - w, PZ.x)); PZ.y = Math.min(r.height * .45 - T, Math.max(r.height * .55 - T - h, PZ.y)); }
  pz.style.transform = PZ.s === 1 ? '' : `translate(${PZ.x}px,${PZ.y}px) scale(${PZ.s})`; document.body.classList.toggle('zoomed', PZ.s > 1);
  if (PZ.s > 1 && stage.classList.contains('tilted')) { stage.classList.remove('tilted'); stage.classList.add('flat'); $('#btnFlat').classList.add('on'); $('#flatLbl').textContent = 'مائل'; }
  if (anim) setTimeout(() => { pz.classList.remove('anim'); redrawHL(); }, 320); }
function zoomAt(s, cx, cy, anim) { const sr = stage.getBoundingClientRect(); const ox = sr.left + pz.offsetLeft, oy = sr.top + pz.offsetTop; const k = s / PZ.s; PZ.x = cx - ox - (cx - ox - PZ.x) * k; PZ.y = cy - oy - (cy - oy - PZ.y) * k; PZ.s = s; applyPZ(anim); }
const cancelOthers = () => { if (drag) { if (drag.started && flip) finishFlip(false); drag = null; } hlStroke = null; hlCanvas = null; };
stage.addEventListener('pointerdown', e => {
  if (lifted) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: PZ.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; pan = null; PZ.busy = true; cancelOthers(); redrawHL(); e.stopPropagation(); return; }
  if (ptrs.size === 1 && PZ.s > 1.01 && !HL.on && !NOTE.on && !e.target.closest('.hot,.note')) { pan = { x: e.clientX, y: e.clientY, px: PZ.x, py: PZ.y, moved: false }; PZ.busy = true; e.stopPropagation(); }
  if (ptrs.size === 1 && !HL.on && !NOTE.on && !e.target.closest('.hot,.note')) { const now = performance.now(); if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) { lastTap.t = 0; pan = null; if (drag) drag = null; PZ.busy = true; if (PZ.s > 1.05) { PZ.s = 1; applyPZ(true); } else zoomAt(2.2, e.clientX, e.clientY, true); e.stopPropagation(); setTimeout(() => PZ.busy = false, 50); return; } lastTap = { t: now, x: e.clientX, y: e.clientY }; }
}, true);
stage.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const s = clamp(pinch.s * d / pinch.d, 1, 4); zoomAt(s, pinch.mx, pinch.my); PZ.x += mx - pinch.mx; PZ.y += my - pinch.my; pinch.mx = mx; pinch.my = my; applyPZ(); e.stopPropagation(); return; }
  if (pan) { const dx = e.clientX - pan.x, dy = e.clientY - pan.y; if (Math.hypot(dx, dy) > 4) pan.moved = true; PZ.x = pan.px + dx; PZ.y = pan.py + dy; applyPZ(); e.stopPropagation(); }
}, true);
const ptrUp = e => { ptrs.delete(e.pointerId); if (pinch && ptrs.size < 2) { pinch = null; redrawHL(); if (ptrs.size === 1) { const [p] = [...ptrs.values()]; pan = PZ.s > 1.01 ? { x: p.x, y: p.y, px: PZ.x, py: PZ.y, moved: true } : null; } }
  if (!ptrs.size) { pan = null; setTimeout(() => { PZ.busy = false; }, 30); } };
stage.addEventListener('pointerup', ptrUp, true); stage.addEventListener('pointercancel', ptrUp, true);
stage.addEventListener('wheel', e => { if (!e.ctrlKey || lifted) return; e.preventDefault(); zoomAt(clamp(PZ.s * Math.exp(-e.deltaY * .01), 1, 4), e.clientX, e.clientY); }, { passive: false });
$('#zReset').onclick = () => { PZ.s = 1; applyPZ(true); };

/* ═════════ الدروس التفاعلية ═════════ */
function openModelById(id) {
  const m = MODELS.find(x => x.id === id); if (!m) return; if (lifted) closeModel();
  goTo(m.pdf); const wait = () => { if (flip) return setTimeout(wait, 120); const h = book.querySelector(`.slot .hot[data-model="${m.id}"]`); if (h) setTimeout(() => openModel(m.id, h), 250); }; setTimeout(wait, 300);
}
const LS = initLessons(LESSONS, { src, PW, PH, goTo: n => { if (lifted) closeModel(); setTimeout(() => goTo(toPdf(n)), lifted ? 800 : 0); }, openModel: openModelById, closeModel: () => { if (lifted) closeModel(); } });
const PR = initPractice(LESSONS, { key: 'sci9', grade: 9, goTo: n => { if (LS.isOpen()) LS.close(); goTo(toPdf(n)); }, nafes: NAFES });
const PL = initPlay(LESSONS, { nafes: NAFES });
onPage = n => LS.update(n);
$('#btnLesson').onclick = () => { const l = LESSONS.find(x => cur >= x.from && cur <= x.to) || LESSONS[0]; LS.open(l); };
$('#tocList').insertAdjacentHTML('afterbegin', `<div class="unit" style="background:#3d7eb9">الدروس التفاعلية</div>` + LESSONS.map((l, i) => `<div class="ti ch" data-lesson="${i}"><span>▶ ${l.title}</span><b>${ar(l.from)}</b></div>`).join(''));
$('#tocList').addEventListener('click', e => { const it = e.target.closest('[data-lesson]'); if (!it) return; e.stopPropagation(); closeDrawers(); LS.open(LESSONS[+it.dataset.lesson]); }, true);

layout(); render();
const first = new Image(); first.onload = first.onerror = () => { const l = $('#loading'); l.style.opacity = 0; setTimeout(() => l.remove(), 500); }; first.src = src(cur);
requestAnimationFrame(loop);
function backStep() {
  const cz = document.querySelector('.clipz'); if (cz) { cz.remove(); return true; }
  if ($('#zoom').style.display === 'flex') { $('#zoom').style.display = 'none'; return true; }
  if ($('#toolsPop').classList.contains('open')) { $('#toolsPop').classList.remove('open'); return true; }
  if (document.querySelector('.drawer.open')) { closeDrawers(); return true; }
  if (lifted) { closeModel(); return true; }
  if (PL.isOpen()) { PL.close(); return true; }
  if (PR.isOpen()) { PR.close(); return true; }
  if (LS.isOpen()) { LS.close(); return true; }
  return false;
}
window.__book = { back: backStep, openById: id => openModelById(id), goTo, openModel, getInst, go, cam, THREE, get lifted() { return lifted; }, get cur() { return cur; }, get mode() { return mode; } };
addEventListener('hashchange', () => { if (/^#p\d+$/.test(location.hash)) { if (lifted) closeModel(); const n = clamp(+location.hash.slice(2), 1, N); flip = null; cur = n; render(); } });
