// مجسّمات الصف السادس (١): الخلية والوراثة
import { creature } from './kit.js';
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tissue, fbm3, vesselGeo, organGeo, vessel, reseed } from './kit.js';

/* ── أدوات ── */
function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
export function emo(ch, s = 1, bg = null) {
  const cr = creature(ch, s); if (cr) return cr;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); }
  g.font = '92px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); sp.scale.set(s, s, 1); return sp;
}
function drawTxt(c, str, color, bg) {
  const g0 = c.getContext('2d'); g0.font = 'bold 72px Tajawal,Arial,sans-serif'; const w = Math.max(256, Math.ceil(g0.measureText(str).width) + 70);
  if (c.width !== w) c.width = w; const g = c.getContext('2d'); g.clearRect(0, 0, c.width, 128);
  if (bg) { g.fillStyle = bg; rr(g, 6, 14, w - 12, 100, 30); g.fill(); }
  g.fillStyle = color; g.font = 'bold 72px Tajawal,Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText(str, w / 2, 68); return w;
}
export function txt(str, s = 1, color = '#222', bg = 'rgba(255,255,255,.92)') {
  const c = document.createElement('canvas'); c.height = 128; const w = drawTxt(c, str, color, bg);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); sp.scale.set(s * w / 128, s, 1); sp.renderOrder = 5; sp.userData.ts = { s, bg }; return sp;
}
function setTxt(sp, str, color = '#222') {
  const c = sp.material.map.image; const w = drawTxt(c, str, color, sp.userData.ts ? sp.userData.ts.bg : 'rgba(255,255,255,.92)');
  sp.material.map.dispose(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; sp.material.map = t; sp.material.needsUpdate = true;
  const s = sp.userData.ts ? sp.userData.ts.s : sp.scale.y; sp.scale.set(s * w / 128, s, 1);
}
export { setTxt };
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
// كروموسوم على شكل X (كروماتيدان) أو مفرد
const _chG = {};
function chromo(color, len = .5, dup = true) {
  const g = new THREE.Group(); const m = tissue(color, { kind: 'pore', bumpScale: 2.2, roughness: .5, clearcoat: .4 });
  const geo = _chG[len] || (_chG[len] = organGeo(1, v => { const y = v.y; v.y *= len / 2 + .05; const k = (1 - .35 * Math.exp(-Math.pow(y / .12, 2))) * (1 + fbm3(v.x * 6, v.y * 30, v.z * 6) * .18); v.x *= .055 * k; v.z *= .055 * k; v.x += Math.sin(y * 3) * .012; }, 20, 40));
  const a = mesh(geo, m); a.rotation.z = dup ? .32 : 0; g.add(a);
  const b = mesh(geo, m); b.rotation.z = -.32; b.visible = dup; g.add(b);
  g.add(mesh(new THREE.SphereGeometry(.045, 12, 10), tissue('#3a3040', { kind: 'pore' }))); g.userData = { a, b }; return g;
}

/* ═════════ ١) الخلية الحيوانية / النباتية (ص ٣٤–٣٥) ═════════ */
function wobble(g, amp = .05, freq = 1) { const P = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const n = fbm3(v.x * freq + 3, v.y * freq, v.z * freq); v.multiplyScalar(1 + n * amp); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
function roundBox(w, h, d, r) { const g = new THREE.BoxGeometry(w, h, d, 24, 16, 16), P = g.attributes.position, v = new THREE.Vector3(), hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r; for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const c = new THREE.Vector3(Math.max(-hw, Math.min(hw, v.x)), Math.max(-hh, Math.min(hh, v.y)), Math.max(-hd, Math.min(hd, v.z))); const dir = v.clone().sub(c); if (dir.lengthSq() > 1e-9) v.copy(c).add(dir.setLength(r)); v.multiplyScalar(1 + fbm3(v.x * .8, v.y * .8, v.z * .8) * .015); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
export function cellModel(api, variant = 0) {
  const root = new THREE.Group(); let plant = variant === 1, open = true;
  const cyt = tissue('#f6c8d6', { transparent: true, opacity: .32, side: 2, depthWrite: false, kind: 'pore', bumpScale: .6, roughness: .2 }), cytP = tissue('#bfe7a0', { transparent: true, opacity: .3, side: 2, depthWrite: false, kind: 'pore', bumpScale: .6, roughness: .2 });
  // غشاء الخلية الحيوانية (كرة مفتوحة)
  const memA = mesh(wobble(new THREE.SphereGeometry(2.2, 64, 48, 0, Math.PI * 1.45), .05, .7), cyt); memA.scale.set(1.15, .78, 1); root.add(memA);
  const memAfull = mesh(wobble(new THREE.SphereGeometry(2.2, 64, 48), .05, .7), cyt); memAfull.scale.copy(memA.scale); root.add(memAfull);
  // الخلية النباتية: صندوق مستدير + جدار
  const boxG = roundBox(4.6, 2.6, 3.2, .35); const memP = mesh(boxG, cytP); root.add(memP);
  const wall = mesh(roundBox(4.85, 2.85, 3.45, .4), tissue('#7fb24a', { transparent: true, opacity: .3, side: 2, depthWrite: false, kind: 'vein', bumpScale: 1.5 })); root.add(wall);
  const wallEdge = new THREE.Group(); root.add(wallEdge);
  // النواة
  const nucleus = new THREE.Group(); root.add(nucleus);
  const env = mesh(wobble(new THREE.SphereGeometry(.72, 48, 36), .04, 2), tissue('#b06ac0', { transparent: true, opacity: .5, depthWrite: false, kind: 'pore', bumpScale: 1.2 })); nucleus.add(env);
  const nucleolus = mesh(new THREE.SphereGeometry(.26, 20, 16), tissue('#6a2a7a')); nucleolus.position.set(.18, .1, .1); nucleus.add(nucleolus);
  const chromos = []; for (let i = 0; i < 6; i++) { const t = tube([[(Math.random() - .5) * .9, (Math.random() - .5) * .9, (Math.random() - .5) * .9], [(Math.random() - .5) * .9, (Math.random() - .5) * .9, (Math.random() - .5) * .9], [(Math.random() - .5) * .9, (Math.random() - .5) * .9, (Math.random() - .5) * .9]].map(p => V(...p).clampLength(0, .55)), .03, mat(['#3a5bd9', '#d93a6a', '#e0a020'][i % 3]), 24, 6); nucleus.add(t); chromos.push(t); }
  // الميتوكندريا
  const mitos = []; const mitoM = tissue('#e8742c', { roughness: .45 }), cristM = tissue('#ffd1a6');
  const mitoPos = [[-1.2, .3, .6], [1.3, -.3, .5], [.4, .5, -1.1], [-.6, -.5, -.9], [1.6, .45, -.4]];
  for (const p of mitoPos) { const g = new THREE.Group(); const body = mesh(wobble(new THREE.CapsuleGeometry(.17, .42, 10, 20), .06, 4), mitoM); body.rotation.z = Math.PI / 2; g.add(body); for (let k = -2; k <= 2; k++) { const c = mesh(new THREE.TorusGeometry(.1, .018, 6, 14, Math.PI), cristM, [k * .09, 0, .12]); g.add(c); } g.position.set(...p); g.rotation.set(Math.random() * 2, Math.random() * 2, 0); root.add(g); mitos.push(body); }
  // الفجوات
  const vacA = [], vacM = tissue('#7ec8f0', { transparent: true, opacity: .55, depthWrite: false, bumpScale: .3 });
  for (const p of [[-1.5, -.3, -.3], [.9, .9, .3], [-.3, .9, .9]]) { const v = mesh(new THREE.SphereGeometry(.24, 18, 14), vacM, p); root.add(v); vacA.push(v); }
  const bigVac = mesh(new THREE.SphereGeometry(1, 28, 20), tissue('#86d0f5', { transparent: true, opacity: .45, depthWrite: false, bumpScale: .3 }), [.9, 0, .1]); bigVac.scale.set(1.25, .85, 1.05); root.add(bigVac);
  // البلاستيدات الخضراء
  const chloros = []; const chM = tissue('#2f9a3a', { roughness: .35 }), granM = tissue('#1d6b25');
  for (let i = 0; i < 9; i++) { const g = new THREE.Group(); const b = mesh(wobble(new THREE.SphereGeometry(.24, 28, 20), .05, 5), chM); b.scale.set(1.6, .7, 1); g.add(b); for (let k = -1; k <= 1; k++) g.add(mesh(new THREE.CylinderGeometry(.07, .07, .12, 12), granM, [k * .14, 0, 0])); g.position.set(-2 + (i % 5) * .95 + (Math.random() - .5) * .2, (i < 5 ? 1.0 : -1.0) + (Math.random() - .5) * .2, (i % 2 ? 1.1 : -1.1)); g.rotation.y = Math.random() * 3; root.add(g); chloros.push(b); }
  // الشبكة الإندوبلازمية وأجسام جولجي والرايبوسومات والأجسام المحلّلة
  const er = tube(Array.from({ length: 14 }, (_, i) => { const a = i / 13 * Math.PI * 1.6 - .3; return [Math.cos(a) * (.95 + (i % 2) * .12), Math.sin(a) * (.95 + (i % 2) * .12) * .8, .15 * Math.sin(i)]; }), .07, tissue('#8fa6e8', { kind: 'pore' }), 80, 8); er.geometry = vesselGeo(er.userData.curve.points, .09, .06, 160, 10, .35); root.add(er);
  const golgi = new THREE.Group(); for (let k = 0; k < 4; k++) golgi.add(mesh(new THREE.TorusGeometry(.38 - k * .03, .05, 8, 24, Math.PI * .9), tissue('#f2c84a'), [0, k * .1, 0], [Math.PI / 2, 0, 0])); golgi.position.set(-1.3, -.2, .9); root.add(golgi);
  const ribos = []; const riM = tissue('#4a2d8a'); for (let i = 0; i < 40; i++) { const r = mesh(new THREE.SphereGeometry(.035, 6, 5), riM, [(Math.random() - .5) * 3.4, (Math.random() - .5) * 1.8, (Math.random() - .5) * 2.2]); root.add(r); ribos.push(r); }
  const lysos = []; for (const p of [[.6, -.8, .9], [-.9, .7, -.6]]) { const l = mesh(new THREE.SphereGeometry(.13, 12, 10), tissue('#c9405a'), p); root.add(l); lysos.push(l); }
  function apply() {
    memA.visible = !plant && open; memAfull.visible = !plant && !open; memP.visible = plant; wall.visible = wallEdge.visible = plant;
    chloros.forEach(c => c.parent.visible = plant); bigVac.visible = plant; vacA.forEach(v => v.visible = !plant);
    nucleus.position.set(plant ? -.8 : 0, plant ? .1 : 0, plant ? -.2 : 0);
    api.refreshParts && api.refreshParts();
  }
  const parts = [
    { id: 'mem', name: 'الغشاء البلازمي', info: 'لكلِّ خليةٍ غشاءٌ بلازميٌّ يحيطُ بها، ويعطيها شكلَها المميّز، ويسمحُ بدخولِ الموادِّ وخروجِها من الخلية.', objs: [memA, memAfull, memP], at: anchor(root, [2.2, 1.1, .9]) },
    { id: 'nuc', name: 'النواة', info: 'تعملُ النواةُ بوصفِها مركزَ تحكّمٍ في الخلية؛ حيث تنظّمُ التفاعلاتِ الكيميائيةَ فيها، وتخزّنُ المعلوماتِ الضروريةَ لانقسامِ الخلية.', objs: [env, nucleolus], at: anchor(nucleus, [0, .8, 0]) },
    { id: 'chr', name: 'الكروموسومات', info: 'يوجدُ في النواةِ أشرطةٌ طويلةٌ من الأحماضِ النوويةِ تسمّى الكروموسومات، تخزّنُ المعلوماتِ اللازمةَ لتنفيذِ كافّةِ الأنشطة، وتنقلُها إلى خلايا النسلِ الجديد.', objs: chromos, at: anchor(nucleus, [-.3, -.3, .5]) },
    { id: 'cyto', name: 'السيتوبلازم', info: 'مادةٌ تشبهُ الهلامَ بينَ النواةِ والغشاءِ البلازميّ، تحتوي على كميةٍ كبيرةٍ من الماء، ويوجدُ فيه أجزاءُ الخليةِ الداخليةُ والموادُّ الكيميائية.', objs: ribos.slice(0, 1), at: anchor(root, [-1.8, -.9, 1.1]) },
    { id: 'mito', name: 'الميتوكندريا', info: 'الميتوكندريا مصدرُ طاقةِ الخلية، وهي أجسامٌ على شكلِ عصيٍّ تقومُ بعمليةِ التنفّسِ الهوائيّ.', objs: mitos, at: anchor(root, [1.3, -.1, .8]) },
    { id: 'vac', name: 'الفجوات', info: 'تراكيبُ تشبهُ الكيس، تخزّنُ الماءَ والغذاء، كما تقومُ بخزنِ بعضِ الفضلات، والفجواتُ في الخليةِ النباتيةِ أكبرُ منها في الخليةِ الحيوانية.', objs: [...vacA, bigVac], at: anchor(root, [.9, .7, .6]) },
    { id: 'er', name: 'الشبكة الإندوبلازمية', info: 'شبكةٌ من الأغشيةِ حولَ النواة، تنتقلُ عبرَها الموادُّ داخلَ الخلية، وتلتصقُ بها الرايبوسومات.', objs: [er], at: anchor(root, [-.9, .55, .2]) },
    { id: 'golgi', name: 'أجسام جولجي', info: 'أكياسٌ مسطّحةٌ متراصّة، تجمّعُ الموادَّ وتغلّفُها لتُنقلَ إلى داخلِ الخليةِ أو خارجِها.', objs: golgi.children, at: anchor(golgi, [0, .45, 0]) },
    { id: 'ribo', name: 'الرايبوسومات', info: 'تراكيبُ صغيرةٌ جدًّا في السيتوبلازم، تُصنعُ فيها البروتينات.', objs: ribos, at: anchor(root, [.2, -.95, -.6]) },
    { id: 'lyso', name: 'الأجسام المحلّلة', info: 'أكياسٌ صغيرةٌ تحتوي موادَّ تحلّلُ الفضلاتِ والأجزاءَ التالفةَ في الخلية.', objs: lysos, at: anchor(root, [.6, -.95, .9]) },
    { id: 'wall', name: 'الجدار الخلوي', info: 'طبقةٌ صلبةٌ تحيطُ بالغشاءِ البلازميّ، وتدعمُ الخليةَ النباتية، وتعطيها شكلَها، وتحميها من الظروفِ البيئية.', objs: [wall], at: anchor(root, [2.4, 1.4, -1.7]), hidden: () => !plant },
    { id: 'chl', name: 'البلاستيدات الخضراء', info: 'توجدُ في أوراقِ النباتاتِ وسيقانِها، وتقومُ بصنعِ الغذاء؛ إذ تمتصُّ طاقةَ الضوءِ عن طريقِ صبغةٍ خضراءَ تسمّى الكلوروفيل، وهي التي تُكسِبُ النباتاتِ لونَها الأخضر.', objs: chloros, at: anchor(root, [-1.1, 1.15, 1.1]), hidden: () => !plant }
  ];
  apply();
  let t = 0;
  return {
    root, parts,
    update(dt) { t += dt; nucleus.rotation.y = Math.sin(t * .3) * .2; mitos.forEach((m, i) => m.parent.rotation.x += dt * .2 * (i % 2 ? 1 : -1)); },
    cam: { pos: [3.2, 3.2, 6.4], target: [0, 0, 0] }, inpage: { pos: [0, 2.2, 7], target: [0, -.1, 0] }, fit: .95,
    controls: [
      { type: 'seg', label: 'نوع الخلية', options: ['خلية حيوانية', 'خلية نباتية'], value: variant, on: k => { plant = k === 1; apply(); api.toast(plant ? 'تنفردُ الخليةُ النباتيةُ بالجدارِ الخلويِّ والبلاستيداتِ الخضراء، وفجوتُها كبيرة.' : 'الخليةُ الحيوانيةُ: غشاءٌ بلازميٌّ ونواةٌ وسيتوبلازمٌ وميتوكندريا وفجواتٌ صغيرة.'); } },
      { type: 'button', label: 'أغلق / افتح الغشاء', toggle: true, on: on => { open = !on; apply(); } }
    ],
    quiz: [
      { q: 'المس مركزَ التحكّمِ في الخلية.', a: 'nuc' },
      { q: 'المس مصدرَ الطاقةِ في الخلية.', a: 'mito' },
      { q: 'المس التركيبَ الذي يسمحُ بدخولِ الموادِّ وخروجِها.', a: 'mem' },
      { q: 'المس التراكيبَ التي تخزّنُ الماءَ والغذاء.', a: 'vac' },
      { q: 'اختر «خلية نباتية» ثم المس التراكيبَ التي تصنعُ الغذاء.', a: 'chl' }
    ]
  };
}

/* ═════════ ٢) الانتشار والخاصية الأسموزية (ص ٣٦–٣٧) ═════════ */
export function diffusionModel(api) {
  const root = new THREE.Group(); let mode = 0, speed = 1, balanced = false;
  const W = 5, H = 2.4, D = 2;
  const tank = mesh(new THREE.BoxGeometry(W, H, D), glass('#cfe9ff', .18, { side: 2 }), [0, 0, 0]); root.add(tank);
  root.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)), new THREE.LineBasicMaterial({ color: '#5a8ab0' })));
  // الغشاء البلازمي في المنتصف (صفّان من الرؤوس)
  const memb = new THREE.Group(); root.add(memb); const headM = mat('#f2b632'), tailM = mat('#e8d48a');
  for (let y = -H / 2 + .1; y < H / 2; y += .2) for (let z = -D / 2 + .1; z < D / 2; z += .2) { if (((y + 5) * 7 | 0) % 3 === 0 && ((z + 5) * 9 | 0) % 2 === 0) continue; memb.add(mesh(new THREE.SphereGeometry(.08, 8, 6), headM, [-.14, y, z])); memb.add(mesh(new THREE.SphereGeometry(.08, 8, 6), headM, [.14, y, z])); }
  const core = mesh(new THREE.BoxGeometry(.16, H, D), mat('#f5e7b0', { transparent: true, opacity: .7 })); memb.add(core);
  const N = 70; const small = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 10, 8), mat('#3c8de0'), N);
  const bigN = 14; const big = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 14, 10), mat('#e04a4a'), bigN);
  root.add(small, big); const dm = new THREE.Object3D();
  let P = [];
  function reset() {
    balanced = false; P = [];
    for (let i = 0; i < N; i++) { const left = mode === 0 ? Math.random() < .9 : Math.random() < .3; P.push({ p: V((left ? -1 : 1) * (.3 + Math.random() * (W / 2 - .45)), (Math.random() - .5) * (H - .3), (Math.random() - .5) * (D - .3)), v: V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(.8 + Math.random() * .6), big: false }); }
    for (let i = 0; i < bigN; i++) P.push({ p: V(.3 + Math.random() * (W / 2 - .5), (Math.random() - .5) * (H - .4), (Math.random() - .5) * (D - .4)), v: V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(.4), big: true });
    big.visible = mode === 1; small.material.color.set(mode === 0 ? '#7dc3ff' : '#3c8de0');
  }
  reset();
  const lblL = txt('', .45, '#1d5fa8'); lblL.position.set(-W / 4, H / 2 + .45, 0); root.add(lblL);
  const lblR = txt('', .45, '#1d5fa8'); lblR.position.set(W / 4, H / 2 + .45, 0); root.add(lblR);
  let acc = 0, tLab = 0;
  const parts = [
    { id: 'memb', name: 'الغشاء البلازمي', info: 'تنتقلُ الموادُّ عبرَ الغشاءِ البلازميِّ للخلية؛ فيسمحُ بمرورِ الجزيئاتِ الصغيرةِ كالماءِ والأكسجين، ويمنعُ مرورَ الجزيئاتِ الكبيرة.', objs: [core], at: anchor(root, [0, H / 2 - .1, D / 2]) },
    { id: 'high', name: 'منطقة التركيز المرتفع', info: 'في النقلِ السلبيِّ تنتقلُ الموادُّ من منطقةِ التركيزِ المرتفعِ إلى منطقةِ التركيزِ المنخفضِ من دونِ الحاجةِ إلى طاقة.', objs: [proxy(root, [-W / 4, 0, 0], [W / 2 - .2, H - .2, D - .2], 'box')], at: anchor(root, [-W / 2 + .3, -H / 2 + .2, D / 2]) },
    { id: 'low', name: 'منطقة التركيز المنخفض', info: 'تستمرُّ عمليةُ الانتشارِ إلى أن يتساوى تركيزُ الموادِّ على جانبَي الغشاء، فيحدثُ الاتزان.', objs: [proxy(root, [W / 4, 0, 0], [W / 2 - .2, H - .2, D - .2], 'box')], at: anchor(root, [W / 2 - .3, -H / 2 + .2, D / 2]) },
    { id: 'water', name: 'جزيئات الماء', info: 'الخاصيةُ الأسموزيةُ هي انتقالُ جزيئاتِ الماءِ عبرَ الغشاءِ البلازميّ من المناطقِ التي يكونُ تركيزُه فيها أكبرَ إلى المناطقِ التي يكونُ تركيزُه فيها أقلّ.', objs: [small], at: anchor(root, [-1.4, .8, .4]) },
    { id: 'sugar', name: 'جزيئات كبيرة (سكر)', info: 'بعضُ الجزيئاتِ كبيرةٌ لا تستطيعُ عبورَ الغشاءِ البلازميّ، فيتحرّكُ الماءُ نحوَها حتى يتساوى التركيز.', objs: [big], at: anchor(root, [1.4, -.6, .4]), hidden: () => mode !== 1 }
  ];
  return {
    root, parts,
    update(dt) {
      dt = Math.min(dt, .05) * speed; let L = 0, R = 0;
      P.forEach((q, i) => {
        q.p.addScaledVector(q.v, dt);
        for (const [k, lim] of [['y', H / 2 - .1], ['z', D / 2 - .1]]) if (Math.abs(q.p[k]) > lim) { q.p[k] = Math.sign(q.p[k]) * lim; q.v[k] *= -1; }
        if (Math.abs(q.p.x) > W / 2 - .1) { q.p.x = Math.sign(q.p.x) * (W / 2 - .1); q.v.x *= -1; }
        const side = Math.sign(q.p.x - q.v.x * dt);
        if (Math.abs(q.p.x) < .2 && side !== Math.sign(q.p.x || 1)) { if (q.big || Math.random() < .35) { q.p.x = side * .2; q.v.x *= -1; } }
        if (Math.random() < .02) q.v.applyAxisAngle(V(0, 1, 0).normalize(), (Math.random() - .5)).applyAxisAngle(V(1, 0, 0), (Math.random() - .5));
        dm.position.copy(q.p); dm.updateMatrix();
        if (q.big) big.setMatrixAt(i - N, dm.matrix); else { small.setMatrixAt(i, dm.matrix); q.p.x < 0 ? L++ : R++; }
      });
      small.instanceMatrix.needsUpdate = true; big.instanceMatrix.needsUpdate = true;
      tLab += dt; if (tLab > .4) { tLab = 0; setTxt(lblL, AR(L) + ' جزيئًا'); setTxt(lblR, AR(R) + ' جزيئًا'); }
      const eq = mode === 0 ? Math.abs(L - R) <= 6 : R >= L * 1.7;
      if (eq && !balanced) { balanced = true; api.toast(mode === 0 ? 'تساوى التركيزُ تقريبًا على جانبَي الغشاء: حدثَ الاتزان، وتستمرُّ الجزيئاتُ في الحركةِ في الاتجاهين.' : 'انتقلَ الماءُ نحوَ الجهةِ الأكثرِ تركيزًا بالسكرِ (الأقلِّ تركيزًا بالماء) لأنّ السكرَ لا يعبرُ الغشاء.'); }
    },
    cam: { pos: [0, 2.6, 7.5], target: [0, 0, 0] }, inpage: { pos: [0, 1.6, 7.8], target: [0, .1, 0] },
    controls: [
      { type: 'seg', label: 'العملية', options: ['الانتشار', 'الخاصية الأسموزية'], value: 0, on: k => { mode = k; reset(); api.toast(k === 0 ? 'الانتشار: جزيئاتُ الأكسجينِ تنتقلُ من التركيزِ المرتفعِ إلى المنخفضِ دونَ طاقة.' : 'الخاصيةُ الأسموزية: جزيئاتُ الماءِ (أزرق) تعبرُ الغشاء، والسكرُ (أحمر) لا يعبر.'); } },
      { type: 'slider', label: 'سرعة الجزيئات (درجة الحرارة)', min: .3, max: 3, step: .1, value: 1, fmt: v => v < .8 ? 'بطيئة' : v < 1.8 ? 'متوسطة' : 'سريعة', on: v => speed = v },
      { type: 'button', label: '↺ أعد التجربة', on: () => reset() }
    ],
    legend: [['#3c8de0', 'جزيئات صغيرة (ماء/أكسجين)'], ['#e04a4a', 'جزيئات كبيرة (سكر)']],
    quiz: [
      { q: 'المس الغشاءَ الذي تعبرُه الجزيئات.', a: 'memb' },
      { q: 'من أين تبدأُ الجزيئاتُ الانتقال؟ المسها.', a: 'high' },
      { q: 'اختر «الخاصية الأسموزية» ثم المس الجزيئاتِ التي لا تستطيعُ عبورَ الغشاء.', a: 'sugar' }
    ]
  };
}

/* ═════════ ٣) البناء الضوئي والتنفس الخلوي (ص ٣٨–٣٩) ═════════ */
export function photosynModel(api) {
  const root = new THREE.Group(); let light = 8, mode = 0;
  const sun = mesh(new THREE.SphereGeometry(.6, 24, 16), mat('#ffd23a', { emissive: '#ffb000', emissiveIntensity: .9 }), [-3.2, 2.6, 0]); root.add(sun);
  const rays = new THREE.Group(); root.add(rays); for (let i = 0; i < 5; i++) { const r = mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), mat('#ffe27a', { emissive: '#ffcf3a', emissiveIntensity: .7, transparent: true, opacity: .8 })); r.position.set(-2 + i * .12, 1.6 - i * .05, -.4 + i * .2); r.rotation.z = .9; rays.add(r); }
  // البلاستيدة الخضراء
  const chl = new THREE.Group(); root.add(chl);
  const outer = mesh(wobble(new THREE.SphereGeometry(1.4, 56, 40), .04, 1.5), tissue('#5cb84a', { kind: 'pore', transparent: true, opacity: .4, depthWrite: false, side: 2, roughness: .3, bumpScale: .8 })); outer.scale.set(1.7, .85, 1); chl.add(outer);
  const grana = []; const gM = tissue('#1f7a28', { kind: 'pore', bumpScale: 1, roughness: .4 });
  for (let k = 0; k < 7; k++) { const g = new THREE.Group(); const n = 3 + (k % 3); for (let j = 0; j < n; j++) g.add(mesh(new THREE.CylinderGeometry(.26, .26, .07, 20), gM, [0, j * .09, 0])); g.position.set(-1.6 + k * .55, -.25 + (k % 2) * .2, (k % 3 - 1) * .35); chl.add(g); grana.push(...g.children); }
  // الميتوكندريا (للتنفس)
  const mito = new THREE.Group(); const mb = mesh(wobble(new THREE.CapsuleGeometry(.5, 1.3, 16, 32), .05, 2), tissue('#e0703a', { kind: 'pore', bumpScale: 1.2 })); mb.rotation.z = Math.PI / 2; mito.add(mb); for (let k = -3; k <= 3; k++) mito.add(mesh(new THREE.TorusGeometry(.3, .04, 6, 16, Math.PI), mat('#ffd1a6'), [k * .2, 0, .32])); mito.position.set(2.8, -1.7, 0); root.add(mito);
  const co2 = new Flow(root, '#9a9a9a', .07, 40), h2o = new Flow(root, '#3c8de0', .07, 40), o2 = new Flow(root, '#bfe8ff', .07, 40), glu = new Flow(root, '#f2c11a', .09, 30);
  const P = { co2: curve([[-3.5, -1.6, .6], [-2.4, -.8, .5], [-1.2, -.2, .3]]), h2o: curve([[-1, -2.6, 0], [-.6, -1.5, .2], [-.2, -.3, .2]]), o2: curve([[.6, .4, .3], [1.6, 1.4, .3], [3, 2.3, .3]]), glu: curve([[1, -.2, .2], [2, -.9, .1], [2.7, -1.5, 0]]) };
  const R = { o2: curve([[3.6, .2, .3], [3.3, -.8, .3], [2.9, -1.5, 0]]), glu: curve([[1, -.2, .2], [2, -.9, .1], [2.7, -1.5, 0]]), co2: curve([[3, -1.8, .2], [3.6, -2.4, .4], [4.3, -2.6, .5]]), h2o: curve([[2.6, -1.9, -.2], [2.2, -2.6, -.3], [1.6, -3, -.3]]) };
  const lbl = { co2: txt('ثاني أكسيد الكربون', .32, '#555'), h2o: txt('ماء', .32, '#1d5fa8'), o2: txt('أكسجين', .32, '#2a7ab0'), glu: txt('جلوكوز', .32, '#9a6a00') };
  for (const k in lbl) root.add(lbl[k]);
  function apply() {
    co2.clear(); h2o.clear(); o2.clear(); glu.clear(); co2.paths = []; h2o.paths = []; o2.paths = []; glu.paths = [];
    if (mode === 0) { co2.addPath(P.co2, .45); h2o.addPath(P.h2o, .45); o2.addPath(P.o2, .4); glu.addPath(P.glu, .4); lbl.co2.position.set(-3.4, -1.9, .6); lbl.h2o.position.set(-1.3, -2.8, 0); lbl.o2.position.set(3, 2.6, .3); lbl.glu.position.set(2.1, -.6, .2); }
    else { o2.addPath(R.o2, .45); glu.addPath(R.glu, .45); co2.addPath(R.co2, .4); h2o.addPath(R.h2o, .4); lbl.o2.position.set(3.6, .5, .3); lbl.glu.position.set(1.8, -.4, .2); lbl.co2.position.set(4.4, -2.9, .5); lbl.h2o.position.set(1.3, -3.2, -.3); }
    const k = light / 10; sun.material.emissiveIntensity = .2 + k; rays.visible = light > 0; const r = mode === 0 ? k * 4 : 3; co2.rate = h2o.rate = o2.rate = glu.rate = r;
  }
  apply();
  const parts = [
    { id: 'sun', name: 'ضوء الشمس', info: 'يُستخدمُ ضوءُ الشمسِ في البناءِ الضوئيِّ لإنتاجِ الغذاءِ على شكلِ سكرِ الجلوكوز. ثاني أكسيد الكربون + ماء ←(ضوء)← سكر الجلوكوز + الأكسجين.', objs: [sun], at: anchor(sun, [0, .8, 0]) },
    { id: 'chl', name: 'البلاستيدة الخضراء', info: 'تتمُّ عمليةُ البناءِ الضوئيِّ داخلَ البلاستيداتِ الخضراءِ التي تحتوي صبغةَ الكلوروفيل، وتقومُ بالتقاطِ الطاقةِ الشمسية.', objs: [outer], at: anchor(chl, [0, 1.25, 0]) },
    { id: 'gran', name: 'الكلوروفيل (الأقراص الخضراء)', info: 'صبغةٌ خضراءُ تمتصُّ طاقةَ الضوء، وهي التي تُكسِبُ النباتاتِ لونَها الأخضر.', objs: grana, at: anchor(chl, [.6, -.5, .6]) },
    { id: 'mito', name: 'الميتوكندريا', info: 'تستخلصُ الخلايا الطاقةَ من سكرِ الجلوكوزِ بالتنفّسِ الخلويِّ في الميتوكندريا بوجودِ الأكسجين، وينتجُ الماءُ وثاني أكسيدِ الكربون.', objs: [mb], at: anchor(mito, [0, .7, 0]) },
    { id: 'co2', name: 'ثاني أكسيد الكربون', info: 'مادةٌ متفاعلةٌ في البناءِ الضوئيّ، وناتجةٌ (فضلات) من التنفّسِ الخلويّ.', objs: [proxy(root, [-2.6, -1, .5], [.8, .8, .8])], at: anchor(root, [-2.6, -1.3, .5]) },
    { id: 'o2', name: 'الأكسجين', info: 'ينتجُ الأكسجينُ في البناءِ الضوئيِّ ويُطرَدُ إلى الهواء، ويستهلكُه التنفّسُ الخلويّ.', objs: [proxy(root, [2, 1.6, .3], [.8, .8, .8])], at: anchor(root, [2, 1.9, .3]) },
    { id: 'glu', name: 'سكر الجلوكوز', info: 'الغذاءُ الناتجُ عن البناءِ الضوئيّ، تخزّنُ فيه الطاقة، وتحرّرُها الخليةُ بالتنفّسِ الخلويّ.', objs: [proxy(root, [2, -.9, .1], [.7, .7, .7])], at: anchor(root, [2, -1.2, .1]) }
  ];
  return {
    root, parts,
    update(dt) { co2.update(dt); h2o.update(dt); o2.update(dt); glu.update(dt); grana.forEach((g, i) => g.material.emissive?.setScalar(0)); chl.rotation.y = Math.sin(performance.now() / 3000) * .15; },
    cam: { pos: [0, 1, 9], target: [.3, -.2, 0] }, inpage: { pos: [0, 0, 9.5], target: [0, -.2, 0] },
    controls: [
      { type: 'seg', label: 'العملية', options: ['البناء الضوئي', 'التنفس الخلوي'], value: 0, on: k => { mode = k; apply(); api.toast(k === 0 ? 'البناءُ الضوئيّ: يدخلُ ثاني أكسيدِ الكربونِ والماء، ويخرجُ الجلوكوزُ والأكسجين (يحتاجُ إلى ضوء).' : 'التنفّسُ الخلويّ: يدخلُ الجلوكوزُ والأكسجينُ إلى الميتوكندريا، فتتحرّرُ الطاقةُ ويخرجُ ثاني أكسيدِ الكربونِ والماء (في الضوءِ أو الظلام).'); } },
      { type: 'slider', label: 'شدّة الضوء', min: 0, max: 10, step: 1, value: 8, fmt: v => v === 0 ? 'ظلام' : v < 5 ? 'خافت' : 'ساطع', on: v => { light = v; apply(); if (v === 0 && mode === 0) api.toast('في الظلامِ يتوقّفُ البناءُ الضوئيّ، لكنّ التنفّسَ الخلويَّ يستمرّ.'); } }
    ],
    legend: [['#9a9a9a', 'ثاني أكسيد الكربون'], ['#3c8de0', 'ماء'], ['#bfe8ff', 'أكسجين'], ['#f2c11a', 'جلوكوز']],
    quiz: [
      { q: 'المس التركيبَ الذي يحدثُ فيه البناءُ الضوئيّ.', a: 'chl' },
      { q: 'المس الصبغةَ التي تمتصُّ طاقةَ الضوء.', a: 'gran' },
      { q: 'المس الغذاءَ الناتجَ عن البناءِ الضوئيّ.', a: 'glu' },
      { q: 'أين يحدثُ التنفّسُ الخلويّ؟ المسه.', a: 'mito' }
    ]
  };
}

/* ═════════ ٤) النقل النشط والبلعمة (ص ٤٠) ═════════ */
export function activeModel(api) {
  const root = new THREE.Group(); let step = -1;
  const W = 6;
  // الغشاء (طبقتان من الرؤوس)
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(.11, 8, 6), mat('#f2b632'), 2 * 30 * 8); const dm = new THREE.Object3D(); let n = 0;
  for (const y of [.18, -.18]) for (let i = 0; i < 30; i++) for (let j = 0; j < 8; j++) { const x = -W / 2 + i * .2; if (Math.abs(x - .1) < .3) { dm.scale.setScalar(.001); } else dm.scale.setScalar(1); dm.position.set(x, y, -1 + j * .25 + (i % 2) * .1); dm.updateMatrix(); heads.setMatrixAt(n++, dm.matrix); }
  root.add(heads); const core = mesh(new THREE.BoxGeometry(W, .3, 2), mat('#f5e7b0', { transparent: true, opacity: .6 })); root.add(core);
  // مضخّة بروتينية
  const pump = new THREE.Group(); const pM = mat('#7a4ad0', { roughness: .4 }); const pa = mesh(new THREE.CylinderGeometry(.22, .28, .9, 16), pM, [-.18, 0, 0]); const pb = mesh(new THREE.CylinderGeometry(.22, .28, .9, 16), pM, [.38, 0, 0]); pump.add(pa, pb); pump.position.set(0, 0, 0); root.add(pump);
  // الجسيمات: داخل الخلية (أسفل) تركيز مرتفع، خارجها منخفض
  const pM2 = mat('#2bb673'); const pts = [];
  for (let i = 0; i < 18; i++) { const inside = i < 14; const m = mesh(new THREE.SphereGeometry(.1, 10, 8), pM2, [(Math.random() - .5) * (W - .8), inside ? -.6 - Math.random() * 1.2 : .6 + Math.random() * 1.2, (Math.random() - .5) * 1.6]); root.add(m); pts.push({ m, inside }); }
  const atp = mesh(new THREE.SphereGeometry(.18, 14, 10), mat('#ffde3a', { emissive: '#ffb000', emissiveIntensity: .8 }), [.1, -.8, .4]); atp.visible = false; root.add(atp);
  // البلعمة
  const big = mesh(new THREE.DodecahedronGeometry(.45, 1), mat('#b7652a', { flatShading: true }), [2.2, 1.4, 0]); root.add(big);
  const pocket = mesh(new THREE.SphereGeometry(.7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass('#f2b632', .5, { side: 2 }), [2.2, .15, 0]); pocket.rotation.x = Math.PI; pocket.visible = false; root.add(pocket);
  const vesicle = mesh(new THREE.SphereGeometry(.72, 24, 16), glass('#f2b632', .4), [2.2, -1.2, 0]); vesicle.visible = false; root.add(vesicle);
  const lOut = txt('خارج الخلية: تركيز منخفض', .32, '#1d6b3a'); lOut.position.set(-1.5, 2.2, 0); root.add(lOut);
  const lIn = txt('داخل الخلية: تركيز مرتفع', .32, '#1d6b3a'); lIn.position.set(-1.5, -2.3, 0); root.add(lIn);
  let anim = null;
  function pumpOne() {
    const c = pts.find(p => !p.inside); if (!c) return api.toast('لم يبقَ جزيءٌ في الخارج؛ تمَّ ضخُّها كلِّها إلى الداخلِ رغمَ ارتفاعِ تركيزِها هناك.');
    anim = { c, t: 0, from: c.m.position.clone() }; atp.visible = true; api.toast('النقلُ النشط: تستخدمُ الخليةُ الطاقةَ لنقلِ الجزيءِ من التركيزِ المنخفضِ (خارجًا) إلى التركيزِ المرتفعِ (داخلًا).');
  }
  function setStep(i) {
    step = i; big.visible = i < 2; pocket.visible = i === 1; vesicle.visible = i === 2;
    big.position.set(2.2, i === 0 ? 1.4 : .45, 0); if (i === 2) { big.visible = true; big.position.set(2.2, -1.2, 0); }
  }
  setStep(0);
  const parts = [
    { id: 'mem', name: 'الغشاء البلازمي', info: 'تنتقلُ الموادُّ عبرَ الغشاءِ البلازميّ؛ وعندما يحتاجُ انتقالُها إلى طاقةٍ يحدثُ نقلٌ نشط.', objs: [core], at: anchor(root, [-2.6, .3, 1]) },
    { id: 'pump', name: 'مضخّة النقل النشط', info: 'تحتاجُ الخليةُ إلى الطاقةِ لنقلِ الأملاحِ المعدنيةِ والموادِّ الغذائيةِ إلى داخلِها وخارجِها؛ فالخليةُ العصبيةُ تحتاجُ إلى النقلِ النشطِ لضخِّ البوتاسيومِ داخلَ الخليةِ والصوديومِ خارجَها.', objs: [pa, pb], at: anchor(pump, [.1, .7, 0]) },
    { id: 'energy', name: 'الطاقة', info: 'النقلُ النشطُ يحتاجُ إلى طاقةٍ من الخلية، بخلافِ الانتشارِ والخاصيةِ الأسموزية.', objs: [atp], at: anchor(atp, [0, .3, 0]), hidden: () => !atp.visible },
    { id: 'big', name: 'مادة كبيرة الحجم', info: 'بعضُ الموادِّ حجمُها كبيرٌ جدًّا لا تمرُّ في الغشاءِ بالنقلِ النشطِ أو السلبيّ؛ فتقومُ الخليةُ بإحاطتِها بغشاءٍ بلازميٍّ وتكوينِ جيبٍ حولَها، وتسمّى هذه العمليةُ البلعمة.', objs: [big], at: anchor(big, [0, .6, 0]) },
    { id: 'ves', name: 'جيب (البلعمة)', info: 'يتكوّنُ جيبٌ من الغشاءِ البلازميِّ حولَ المادةِ الكبيرة، كما في طريقةِ ابتلاعِ الأميبا لغذائها.', objs: [pocket, vesicle], at: anchor(root, [2.2, -.4, .8]), hidden: () => step < 1 }
  ];
  return {
    root, parts,
    update(dt) {
      if (anim) { anim.t += dt * .7; const t = ease(anim.t); const mid = V(.1, 0, 0); const to = V((Math.random() - .5) * 0 + .1 - 1.5 + Math.random() * 0, -1.2, .2);
        anim.c.m.position.copy(t < .5 ? anim.from.clone().lerp(mid, t * 2) : mid.clone().lerp(V(anim.from.x * .5, -1.1 - anim.from.y * .3, anim.from.z), (t - .5) * 2)); atp.scale.setScalar(1 - t * .6);
        if (anim.t >= 1) { anim.c.inside = true; anim = null; atp.visible = false; atp.scale.setScalar(1); } }
      pts.forEach(p => { if (anim && anim.c === p) return; p.m.position.x += Math.sin(performance.now() / 700 + p.m.id) * .002; });
    },
    cam: { pos: [0, 1.5, 8], target: [0, -.1, 0] }, inpage: { pos: [0, .8, 8.2], target: [0, 0, 0] },
    controls: [
      { type: 'button', label: '⚡ اضخْ جزيئًا إلى الداخل (نقل نشط)', on: pumpOne },
      { type: 'steps', value: 0, steps: [{ t: '١- مادة كبيرة قرب الخلية', d: 'بعضُ الموادِّ كالبروتيناتِ والبكتيريا كبيرةٌ لا تعبرُ الغشاء.' }, { t: '٢- الغشاء يحيط بالمادة', d: 'يحيطُ الغشاءُ البلازميُّ بالمادةِ مكوّنًا جيبًا حولَها.' }, { t: '٣- تكوّن الجيب داخل الخلية', d: 'ينغلقُ الجيبُ وتدخلُ المادةُ إلى الخلية، وتسمّى العمليةُ البلعمة.' }], on: i => setStep(i) }
    ],
    quiz: [
      { q: 'المس التركيبَ الذي يضخُّ الموادَّ باستخدامِ الطاقة.', a: 'pump' },
      { q: 'المس المادةَ التي لا تعبرُ الغشاءَ إلا بالبلعمة.', a: 'big' },
      { q: 'المس الغشاءَ البلازميّ.', a: 'mem' }
    ]
  };
}

/* ═════════ ٥) دورة الخلية (ص ٥٢) ═════════ */
export function cellcycleModel(api) {
  const root = new THREE.Group(); let ph = 0, auto = true;
  const ringG = mesh(new THREE.TorusGeometry(2.6, .12, 10, 80, Math.PI * 1.45), mat('#2c4fa8'), [0, 0, 0], [0, 0, Math.PI * .28]); root.add(ringG);
  const ringD = mesh(new THREE.TorusGeometry(2.6, .12, 10, 40, Math.PI * .45), mat('#d9475a'), [0, 0, 0], [0, 0, -Math.PI * .2]); root.add(ringD);
  const head = mesh(new THREE.ConeGeometry(.28, .5, 16), mat('#2c4fa8'), [0, 0, 0]); root.add(head);
  const cM = tissue('#ec95a2', { kind: 'pore', bumpScale: 1.2, roughness: .4 }), nM = tissue('#9a2a4a', { kind: 'pore', bumpScale: 1.5 });
  const cell = new THREE.Group(); const body = mesh(wobble(new THREE.SphereGeometry(.5, 40, 28), .22, 2.2), cM, null, null, [1, 1, .55]); const nuc = mesh(wobble(new THREE.SphereGeometry(.17, 24, 16), .08, 3), nM, [0, 0, .12]); cell.add(body, nuc); root.add(cell);
  const twin = new THREE.Group(); const b2 = mesh(wobble(new THREE.SphereGeometry(.5, 40, 28), .22, 2.6), cM, null, null, [1, 1, .55]); const n2 = mesh(wobble(new THREE.SphereGeometry(.17, 24, 16), .08, 3), nM, [0, 0, .12]); twin.add(b2, n2); root.add(twin);
  const ghosts = []; for (let i = 0; i < 9; i++) { const a = Math.PI * .5 - i / 9 * Math.PI * 2; const g = mesh(wobble(new THREE.SphereGeometry(.22 + (i % 3) * .05, 28, 20), .25, 2 + i * .3), tissue('#f2b0bb', { kind: 'pore', transparent: true, opacity: .7 }), [Math.cos(a) * 1.5, Math.sin(a) * 1.5, -.2]); root.add(g); ghosts.push(g); }
  const lG = txt('نموّ الخلية', .45, '#2c4fa8'); lG.position.set(.6, 3.2, 0); root.add(lG);
  const lD = txt('انقسام الخلية', .45, '#d9475a'); lD.position.set(.5, -3.2, 0); root.add(lD);
  const lP = txt('التهيّؤ للانقسام', .38, '#7a3a4a'); lP.position.set(.4, -.9, 0); root.add(lP);
  function apply() {
    const a = Math.PI * .5 - ph * Math.PI * 2; const r = 2.6; cell.position.set(Math.cos(a) * r, Math.sin(a) * r, .2);
    head.position.set(Math.cos(a - .25) * r, Math.sin(a - .25) * r, 0); head.rotation.z = a - Math.PI;
    if (ph < .78) { const s = .5 + ph * 1.1; cell.scale.setScalar(s); twin.visible = false; body.scale.set(1, 1, 1); }
    else { const k = (ph - .78) / .22; cell.scale.setScalar(1.36 - k * .6); twin.visible = k > .35; twin.position.copy(cell.position).add(V(Math.cos(a + Math.PI / 2) * k * 1, Math.sin(a + Math.PI / 2) * k * 1, 0)); twin.scale.copy(cell.scale); body.scale.set(1 + (k < .4 ? k : 0), 1, 1); }
  }
  apply();
  const parts = [
    { id: 'grow', name: 'نموّ الخلية', info: 'تنمو الخلايا لفترةٍ زمنيةٍ محدّدة، ثم تتوقّفُ عن النموّ. وكلّما نمتِ الخليةُ ازدادَ حجمُها وازدادتْ كميةُ الموادِّ التي تحتاجُ إلى تبادلِها مع الوسطِ الخارجيّ.', objs: [ringG], at: anchor(root, [-2.2, 1.5, 0]) },
    { id: 'div', name: 'انقسام الخلية', info: 'بعدَ أن يكتملَ نموُّها تموتُ بعضُ الخلايا، وينقسمُ بعضُها الآخرُ لينتجَ خلايا جديدةً لتعويضِ الخلايا الميتة.', objs: [ringD], at: anchor(root, [1.9, -1.9, 0]) },
    { id: 'cell', name: 'الخلية', info: 'نموُّ الخلايا وانقسامُها عمليتانِ مستمرّتان، وهما مرحلتانِ من دورةِ الخلية. ويقومُ جسمُ الإنسانِ باستبدالِ جميعِ خلايا الدمِ الحمراءِ كلَّ ١٢٠ يومًا تقريبًا.', objs: [body, nuc, b2, n2], at: anchor(cell, [0, .7, 0]) }
  ];
  return {
    root, parts,
    update(dt) { if (auto) { ph = (ph + dt * .07) % 1; apply(); } },
    cam: { pos: [0, 0, 9], target: [0, 0, 0] }, inpage: { pos: [0, 0, 8.6], target: [0, 0, 0] },
    controls: [
      { type: 'slider', label: 'مرحلة دورة الخلية', min: 0, max: 99, step: 1, value: 0, fmt: v => v < 70 ? 'نموّ' : v < 78 ? 'تهيّؤ للانقسام' : 'انقسام', on: v => { auto = false; ph = v / 100; apply(); } },
      { type: 'button', label: '▶ / ❚❚ تشغيل الدورة', on: () => { auto = !auto; } },
      { type: 'button', label: '🦠 دورة البكتيريا (كل ٢٠ دقيقة)', on: () => api.toast('خليةٌ بكتيريةٌ تنتجُ خليتينِ كلَّ ٢٠ دقيقة: بعدَ ساعةٍ ٨ خلايا، وبعدَ ساعتينِ ٦٤ خلية، وخلالَ ساعاتٍ قليلةٍ ملايينُ الخلايا.') }
    ],
    quiz: [
      { q: 'المس مرحلةَ النموِّ في دورةِ الخلية.', a: 'grow' },
      { q: 'المس مرحلةَ الانقسام.', a: 'div' }
    ]
  };
}

/* ═════════ ٦) الانقسام المتساوي (ص ٥٤–٥٥) ═════════ */
export function mitosisModel(api) {
  const root = new THREE.Group(); let step = 0, plant = false, tStep = 1, prev = 0;
  const cyto = mesh(wobble(new THREE.SphereGeometry(1.6, 64, 44), .05, 1.2), tissue('#f0bccb', { kind: 'pore', transparent: true, opacity: .32, depthWrite: false, side: 2, roughness: .3, bumpScale: .8 })); root.add(cyto);
  const box = mesh(new THREE.BoxGeometry(3.4, 2.6, 2.6), glass('#bfe7a0', .25, { side: 2 })); root.add(box);
  const env = mesh(wobble(new THREE.SphereGeometry(.85, 40, 28), .05, 2), tissue('#a774c8', { kind: 'pore', transparent: true, opacity: .33, depthWrite: false, roughness: .3 })); root.add(env);
  const env2 = [mesh(new THREE.SphereGeometry(.6, 24, 16), glass('#9a5ac0', .35)), mesh(new THREE.SphereGeometry(.6, 24, 16), glass('#9a5ac0', .35))]; env2.forEach(e => root.add(e));
  const chroma = new THREE.Group(); root.add(chroma); for (let i = 0; i < 4; i++) chroma.add(tube([[-.5, (i - 1.5) * .2, .1], [-.1, (i - 1.5) * .25 + .2, -.2], [.3, (i - 1.5) * .2 - .1, .2], [.5, (i - 1.5) * .22, 0]], .025, mat(['#3a5bd9', '#3a5bd9', '#d93a6a', '#d93a6a'][i]), 20, 6));
  const cols = ['#3a5bd9', '#5a7be9', '#d93a6a', '#e95a8a'];
  const chs = cols.map(c => { const g = chromo(c, .42); root.add(g); return g; });
  const sisters = cols.map(c => { const g = chromo(c, .42, false); root.add(g); return g; });
  const spindle = new THREE.Group(); root.add(spindle); for (let i = 0; i < 9; i++) { const a = (i - 4) * .13; spindle.add(tube([[-1.5, 0, 0], [0, Math.sin(a) * 1.1, Math.cos(a) * .3], [1.5, 0, 0]], .008, mat('#888'), 20, 4)); }
  const plate = mesh(new THREE.BoxGeometry(.06, 2.6, 2.6), mat('#4f8f2a'), [0, 0, 0]); root.add(plate);
  const L = [[-.1, .55, 0], [.3, .2, .2], [-.3, -.2, -.1], [.15, -.5, .2]];
  function pose(s) {
    const mid = [[0, .6, 0], [0, .2, 0], [0, -.2, 0], [0, -.6, 0]];
    chs.forEach((g, i) => { g.visible = s >= 1 && s < 3; const p = s < 2 ? L[i] : mid[i]; g.position.set(...p); g.rotation.set(0, 0, s >= 2 ? Math.PI / 2 : i); });
    sisters.forEach((g, i) => { g.visible = s >= 3; const x = s === 3 ? -1.05 : -1.25; g.position.set(i % 2 ? -x : x, mid[i][1] * .9, 0); g.rotation.z = Math.PI / 2; });
    chroma.visible = s === 0; env.visible = s === 0 || s === 1; env.material.opacity = s === 1 ? .15 : .35;
    spindle.visible = s === 2 || s === 3; env2.forEach((e, k) => { e.visible = s === 4; e.position.set(k ? 1.25 : -1.25, 0, 0); });
    const stretch = s >= 3 ? 1.35 : 1; cyto.scale.set(stretch, s === 4 ? .82 : 1, 1); box.scale.set(stretch, 1, 1);
    cyto.visible = !plant; box.visible = plant; plate.visible = plant && s === 4;
    if (!plant && s === 4) { cyto.scale.set(1.35, .7, .9); }
  }
  // للانقسام: نُظهر نسخة ثانية من الكروماتيدات في الجهة الأخرى
  const sisters2 = cols.map(c => { const g = chromo(c, .42, false); root.add(g); return g; });
  function apply() { pose(step); sisters2.forEach((g, i) => { g.visible = step >= 3; g.position.set(i % 2 ? (step === 3 ? -1.05 : -1.25) : (step === 3 ? 1.05 : 1.25), [.6, .2, -.2, -.6][i] * .9, 0); g.rotation.z = Math.PI / 2; }); }
  apply();
  const steps = [
    { t: '١- النواة واضحة', d: 'تشاهَدُ النواةُ بوضوح، وعندَ بدءِ الانقسامِ المتساوي يتضاعفُ عددُ الكروموسوماتِ في نواةِ الخلية.' },
    { t: '٢- الكروموسومات مرئية', d: 'تصبحُ الكروموسوماتُ مرئية، ويبدأُ الغلافُ المحيطُ بالنواةِ في التلاشي.' },
    { t: '٣- الاصطفاف في الوسط', d: 'تصطفُّ الكروموسوماتُ المتضاعفةُ عندَ وسطِ الخلية.' },
    { t: '٤- الانفصال إلى الطرفين', d: 'تنفصلُ الكروموسوماتُ المتضاعفةُ بعضُها عن بعض، وتبدأُ الحركةَ في اتّجاهينِ متضادّين، وتستطيلُ الخلية.' },
    { t: '٥- خليتان جديدتان', d: 'يتكوّنُ غلافٌ نوويٌّ حولَ كلِّ مجموعةٍ من الكروموسومات، بعدَ ذلك ينقسمُ السيتوبلازمُ وينتجُ خليتان تماثلُ كلٌّ منهما الخليةَ الأصلية.' }
  ];
  const parts = [
    { id: 'nuc', name: 'النواة (الغلاف النووي)', info: 'تحتوي النواةُ على الكروموسومات، ويتلاشى غلافُها في بدايةِ الانقسامِ ثم يتكوّنُ غلافانِ جديدانِ في النهاية.', objs: [env, ...env2], at: anchor(root, [0, 1, .3]), hidden: () => step === 2 || step === 3 },
    { id: 'chr', name: 'الكروموسومات المتضاعفة', info: 'تضاعفُ الخليةُ كروموسوماتِها حتى يكونَ لديها مجموعةٌ ثانيةٌ مماثلة، ثم تنقسمُ الخلية.', objs: chs.flatMap(g => g.children), at: anchor(root, [0, .9, .2]), hidden: () => step < 1 || step > 2 },
    { id: 'spin', name: 'الخيوط التي تسحب الكروموسومات', info: 'تمتدُّ خيوطٌ من طرفَي الخليةِ تساعدُ على اصطفافِ الكروموسوماتِ في الوسطِ ثم انفصالِها إلى الطرفين.', objs: spindle.children, at: anchor(root, [1.2, .4, 0]), hidden: () => !spindle.visible },
    { id: 'cell', name: 'الخلية (السيتوبلازم)', info: 'في الخلايا الحيوانيةِ يضيقُ الغشاءُ البلازميُّ إلى الداخلِ من وسطِ الخلية، أمّا في الخلايا النباتيةِ فتتكوّنُ صفيحةٌ خلويةٌ تفصلُ بينَ الخليتينِ الجديدتين.', objs: [cyto, box], at: anchor(root, [-1.6, 1.2, .5]) },
    { id: 'plate', name: 'الصفيحة الخلوية', info: 'بسببِ وجودِ جدارٍ خلويٍّ حولَ الخليةِ النباتيةِ تتكوّنُ صفيحةٌ خلويةٌ تشبهُ امتدادًا للجدارِ الخلويِّ تفصلُ بينَ الخليتينِ الجديدتين.', objs: [plate], at: anchor(root, [0, 1.4, 0]), hidden: () => !plate.visible }
  ];
  return {
    root, parts,
    update(dt) { root.rotation.y = Math.sin(performance.now() / 4000) * .25; },
    cam: { pos: [0, 1.2, 6.5], target: [0, 0, 0] }, inpage: { pos: [0, .5, 6.2], target: [0, 0, 0] },
    controls: [
      { type: 'steps', value: 0, steps, on: i => { step = i; apply(); api.refreshParts && api.refreshParts(); } },
      { type: 'seg', label: 'نوع الخلية', options: ['حيوانية', 'نباتية'], value: 0, on: k => { plant = k === 1; apply(); } },
      { type: 'button', label: '🔢 عدد الكروموسومات', on: () => api.toast('لو بدأتِ الخليةُ بـ ٤ كروموسومات (كما في المجسّم) فكلُّ خليةٍ ناتجةٍ فيها ٤ أيضًا. وفي الإنسان: ٤٦ ← ٤٦ في كلِّ خلية.') }
    ],
    quiz: [
      { q: 'انتقل إلى الخطوة ٣ ثم المس الخيوطَ التي تسحبُ الكروموسومات.', a: 'spin' },
      { q: 'المس الغلافَ النوويَّ في الخطوةِ الأولى أو الأخيرة.', a: 'nuc' },
      { q: 'اختر «نباتية» والخطوةَ ٥ ثم المس ما يفصلُ بينَ الخليتين.', a: 'plate' }
    ]
  };
}

/* ═════════ ٧) الانقسام المنصّف (ص ٥٦) ═════════ */
export function meiosisModel(api) {
  const root = new THREE.Group(); let step = 0;
  const cellM = tissue('#8fcf5a', { kind: 'pore', transparent: true, opacity: .55, depthWrite: false, bumpScale: 1, roughness: .3, transmission: .2 }), cellG = wobble(new THREE.SphereGeometry(.75, 48, 32), .06, 1.6);
  const stages = [];
  function cellAt(x, y, contents) { const g = new THREE.Group(); const c = mesh(cellG, cellM); g.add(c); contents.forEach(([col, dx, dy, rz, dup]) => { const k = chromo(col, .3, dup); k.position.set(dx, dy, .1); k.rotation.z = rz; k.scale.setScalar(.9); g.add(k); }); g.position.set(x, y, 0); return { g, c }; }
  const B = '#3a5bd9', R = '#d93a6a', B2 = '#7a9af0', R2 = '#f07a9a';
  const S = [
    [cellAt(0, 0, [[B, -.25, .2, .3, false], [B2, .25, .2, -.3, false], [R, -.2, -.25, .1, false], [R2, .2, -.25, -.2, false]])],
    [cellAt(0, 0, [[B, -.25, .2, 0, true], [B2, .25, .2, 0, true], [R, -.2, -.25, 0, true], [R2, .2, -.25, 0, true]])],
    [cellAt(0, 0, [[B, -.12, .2, Math.PI / 2, true], [B2, .12, .2, Math.PI / 2, true], [R, -.12, -.2, Math.PI / 2, true], [R2, .12, -.2, Math.PI / 2, true]])],
    [cellAt(-1, 0, [[B, 0, .2, Math.PI / 2, true], [R2, 0, -.2, Math.PI / 2, true]]), cellAt(1, 0, [[B2, 0, .2, Math.PI / 2, true], [R, 0, -.2, Math.PI / 2, true]])],
    [cellAt(-2.4, .9, [[B, 0, .15, 0, false], [R2, 0, -.2, 0, false]]), cellAt(-.8, .9, [[B, 0, .15, 0, false], [R2, 0, -.2, 0, false]]), cellAt(.8, -.9, [[B2, 0, .15, 0, false], [R, 0, -.2, 0, false]]), cellAt(2.4, -.9, [[B2, 0, .15, 0, false], [R, 0, -.2, 0, false]])]
  ];
  S.forEach((arr, i) => { const grp = new THREE.Group(); arr.forEach(o => grp.add(o.g)); root.add(grp); stages.push(grp); });
  const counter = txt('', .42, '#2c4fa8'); counter.position.set(0, 2.1, 0); root.add(counter);
  const counts = ['خلية أصلية: ٤ كروموسومات', 'تضاعفت الكروموسومات', 'اصطفّت في أزواج', 'الانقسام الأول: خليتان', 'الانقسام الثاني: ٤ خلايا × ٢ كروموسوم'];
  function apply() { stages.forEach((g, i) => g.visible = i === step); setTxt(counter, counts[step].split(':')[0]); }
  apply();
  const steps = [
    { t: '١- الخلية الأصلية', d: 'خليةٌ جنسيةٌ أصليةٌ فيها مجموعتانِ من الكروموسومات (من الأبِ والأمّ).' },
    { t: '٢- تضاعف الكروموسومات', d: 'خلالَ الأطوارِ المبكرةِ من الانقسامِ المنصّفِ يتمُّ نسخُ الكروموسوماتِ وتضاعفُها.' },
    { t: '٣- اصطفاف أزواج الكروموسومات', d: 'تصطفُّ الكروموسوماتُ في أزواجٍ في وسطِ الخلية.' },
    { t: '٤- الانقسام الأول', d: 'تبتعدُ أزواجُ الكروموسوماتِ بعضُها عن بعض، وتنقسمُ الخليةُ إلى خليتين.' },
    { t: '٥- الانقسام الثاني', d: 'تبتعدُ الكروموسوماتُ بعضُها عن بعض، وتنقسمُ كلُّ خلية؛ فتنتجُ أربعُ خلايا، في كلٍّ منها نصفُ العددِ الأصليِّ من الكروموسومات.' }
  ];
  const parts = [
    { id: 'orig', name: 'الخلية الأصلية', info: 'تحتوي معظمُ خلايا جسمِ الإنسانِ على ٤٦ كروموسومًا. وفي الانقسامِ المنصّفِ تنقسمُ النواةُ مرّتين.', objs: S[0][0].g.children.concat(S[1][0].g.children, S[2][0].g.children).filter(o => o.isMesh), at: anchor(root, [0, .9, 0]), hidden: () => step > 2 },
    { id: 'first', name: 'خليتا الانقسام الأول', info: 'بعدَ الانقسامِ الأوّلِ تتكوّنُ خليتان، تحملُ كلٌّ منهما أحدَ كروموسومَي كلِّ زوج.', objs: S[3].map(o => o.c), at: anchor(root, [0, .9, 0]), hidden: () => step !== 3 },
    { id: 'gametes', name: 'الخلايا الجنسية (الأمشاج)', info: 'كلُّ خليةٍ جنسيةٍ في الإنسانِ تحتوي على ٢٣ كروموسومًا؛ فإذا اتّحدَ المشيجُ المذكّرُ مع المؤنّثِ تكوّنتْ خليةٌ مخصبةٌ تحتوي على ٤٦ كروموسومًا.', objs: S[4].map(o => o.c), at: anchor(root, [0, 1.8, 0]), hidden: () => step !== 4 }
  ];
  return {
    root, parts,
    update(dt) { stages[step].children.forEach((g, i) => g.rotation.y = Math.sin(performance.now() / 1500 + i) * .3); },
    cam: { pos: [0, .5, 8], target: [0, 0, 0] }, inpage: { pos: [0, 0, 8], target: [0, 0, 0] },
    controls: [
      { type: 'steps', value: 0, steps, on: i => { step = i; apply(); api.refreshParts && api.refreshParts(); } },
      { type: 'button', label: '🧬 احسب عدد الكروموسومات', on: () => api.toast('في الإنسان: خليةٌ أصليةٌ ٤٦ ← أربعُ خلايا جنسيةٍ في كلٍّ منها ٢٣. وعندَ الإخصاب: ٢٣ + ٢٣ = ٤٦ في الخليةِ المخصبة.') }
    ],
    quiz: [
      { q: 'انتقل إلى الخطوة ٥ ثم المس الخلايا الجنسيةَ الناتجة.', a: 'gametes' },
      { q: 'انتقل إلى الخطوة ٤ ثم المس خليتَي الانقسامِ الأوّل.', a: 'first' }
    ]
  };
}

/* ═════════ ٨) تلقيح البازلاء (مربّع الوراثة) (ص ٦٧) ═════════ */
export function punnettModel(api) {
  const root = new THREE.Group(); let pa = 'PP', pb = 'pp';
  function flower(purple) { const g = new THREE.Group(); const c = purple ? '#a23cc8' : '#f4f4f4'; const pm = mat(c, { roughness: .45 }); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const p = mesh(new THREE.SphereGeometry(.22, 16, 10), pm, [Math.cos(a) * .2, Math.sin(a) * .2, 0]); p.scale.set(1, 1, .35); g.add(p); } g.add(mesh(new THREE.SphereGeometry(.1, 12, 8), mat('#f2c84a'), [0, 0, .08])); g.add(mesh(new THREE.CylinderGeometry(.025, .025, .6, 6), mat('#3f8f2a'), [0, -.4, -.05])); g.userData.petals = g.children.slice(0, 5); return g; }
  const parentA = flower(true); parentA.position.set(-1.8, 2.2, 0); root.add(parentA);
  const parentB = flower(false); parentB.position.set(1.8, 2.2, 0); root.add(parentB);
  const lA = txt('PP', .4, '#222'); lA.position.set(-1.8, 1.45, 0); root.add(lA); const lB = txt('pp', .4, '#222'); lB.position.set(1.8, 1.45, 0); root.add(lB);
  const x = txt('×', .4, '#c00'); x.position.set(0, 2.2, 0); root.add(x);
  // مربّع بانيت 2x2
  const grid = new THREE.Group(); root.add(grid); grid.position.set(0, -.9, 0);
  const cells = []; for (let i = 0; i < 4; i++) { const r = i >> 1, c = i & 1; const tile = mesh(new THREE.BoxGeometry(1.3, 1.3, .08), mat('#fffbe8'), [(c - .5) * 1.4, (.5 - r) * 1.4, -.1]); grid.add(tile); const f = flower(true); f.scale.setScalar(.75); f.position.set((c - .5) * 1.4, (.5 - r) * 1.4 + .15, 0); grid.add(f); const l = txt('Pp', .3); l.position.set((c - .5) * 1.4, (.5 - r) * 1.4 - .45, .1); grid.add(l); cells.push({ f, l, tile }); }
  const gaL = [txt('P', .3, '#a23cc8'), txt('P', .3, '#a23cc8')], gbL = [txt('p', .3, '#555'), txt('p', .3, '#555')];
  gaL.forEach((s, i) => { s.position.set(-1.9, -.9 + (.5 - i) * 1.4, 0); root.add(s); }); gbL.forEach((s, i) => { s.position.set((i - .5) * 1.4, .55, 0); root.add(s); });
  const ratio = txt('', .38, '#2a6a2a'); ratio.position.set(0, -2.7, 0); root.add(ratio);
  function setFlower(f, purple) { f.userData.petals.forEach(p => p.material = mat(purple ? '#a23cc8' : '#f4f4f4', { roughness: .45 })); }
  function apply() {
    setFlower(parentA, pa.includes('P')); setFlower(parentB, pb.includes('P')); setTxt(lA, pa); setTxt(lB, pb);
    const A = pa.split(''), Bb = pb.split(''); gaL.forEach((s, i) => setTxt(s, A[i], A[i] === 'P' ? '#a23cc8' : '#555')); gbL.forEach((s, i) => setTxt(s, Bb[i], Bb[i] === 'P' ? '#a23cc8' : '#555'));
    let pur = 0; cells.forEach((c, i) => { const g = [A[i >> 1], Bb[i & 1]].sort().join(''); const purple = g.includes('P'); if (purple) pur++; setFlower(c.f, purple); setTxt(c.l, g, purple ? '#a23cc8' : '#555'); });
    setTxt(ratio, `${AR(pur)} أرجواني : ${AR(4 - pur)} أبيض`);
  }
  apply();
  const parts = [
    { id: 'dom', name: 'صفة سائدة (أزهار أرجوانية)', info: 'الصفةُ السائدةُ صفةٌ تمنعُ صفةً أخرى من الظهور، ويُرمزُ لها بالحرفِ الكبير (P). فالنباتُ الذي يحملُ جينًا واحدًا على الأقلِّ للون الأرجوانيِّ تكونُ أزهارُه أرجوانية.', objs: parentA.userData.petals, at: anchor(parentA, [0, .45, 0]) },
    { id: 'rec', name: 'صفة متنحّية (أزهار بيضاء)', info: 'الصفةُ المتنحّيةُ صفةٌ تحجبُها صفةٌ سائدة، ويُرمزُ لها بالحرفِ الصغير (p)، ولا تظهرُ إلا إذا اجتمعَ جينانِ متنحّيان pp.', objs: parentB.userData.petals, at: anchor(parentB, [0, .45, 0]) },
    { id: 'off', name: 'الأبناء (الجيل الناتج)', info: 'يرثُ كلُّ ابنٍ جينًا من الأبِ وآخرَ من الأمّ. والنباتُ الذي يحملُ جينَ الصفةِ السائدةِ وجينَ المتنحّيةِ (Pp) يسمّى نباتًا هجينًا.', objs: cells.map(c => c.tile), at: anchor(grid, [0, 1.6, 0]) }
  ];
  const opts = ['PP', 'Pp', 'pp'];
  return {
    root, parts,
    update(dt) { parentA.rotation.y = Math.sin(performance.now() / 1200) * .3; parentB.rotation.y = -parentA.rotation.y; },
    cam: { pos: [0, .2, 8.2], target: [0, -.2, 0] }, inpage: { pos: [0, 0, 8.2], target: [0, -.1, 0] },
    controls: [
      { type: 'steps', value: 0, steps: [{ t: 'جيل الآباء: PP × pp', d: 'لقّحَ مندلُ بازلاءَ أرجوانيةَ الأزهارِ مع بازلاءَ بيضاءِ الأزهار.' }, { t: 'الجيل الأول: Pp × Pp', d: 'جاءَ جميعُ أبناءِ الجيلِ الأوّلِ بأزهارٍ أرجوانية (Pp)، ثم لقّحَ مندلُ نباتينِ منها.' }, { t: 'الجيل الثاني', d: 'ظهرتْ صفةُ الأزهارِ البيضاءِ مرّةً أخرى؛ أي أنّها لم تختفِ وإنّما منعَتْها من الظهورِ الصفةُ السائدة: ٣ أرجوانية : ١ بيضاء.' }], on: i => { if (i === 0) { pa = 'PP'; pb = 'pp'; } else { pa = 'Pp'; pb = 'Pp'; } apply(); api.setControl(1, opts.indexOf(pa)); api.setControl(2, opts.indexOf(pb)); } },
      { type: 'seg', label: 'جينات الأب', options: opts, value: 0, on: k => { pa = opts[k]; apply(); } },
      { type: 'seg', label: 'جينات الأم', options: opts, value: 2, on: k => { pb = opts[k]; apply(); } }
    ],
    quiz: [
      { q: 'المس النباتَ الذي يحملُ الصفةَ المتنحّية.', a: 'rec' },
      { q: 'المس الأبناءَ في مربّعِ الوراثة.', a: 'off' },
      { q: 'المس النباتَ ذا الصفةِ السائدة.', a: 'dom' }
    ]
  };
}

/* ═════════ ٩) مستويات التنظيم: القلب والرئتان (ص ٢٦–٢٧) ═════════ */
export function organsModel(api) {
  const root = new THREE.Group(); let lvl = 3, t = 0;
  const muscleM = tissue('#c8424e', { kind: 'vein', bumpScale: 1.6, roughness: .42 }); reseed(27);
  // خلية عضلية قلبية (مخطّطة متفرّعة)
  const cellG = new THREE.Group(); const mc = mesh(organGeo(1, v => { v.x *= 1.05; v.y *= .2; v.z *= .2; const k = 1 - Math.pow(Math.abs(v.x) / 1.05, 4) * .5; v.y *= k; v.z *= k; v.y += Math.sin(v.x * 3) * .03; }, 64, 32), muscleM); cellG.add(mc);
  for (const s of [-1, 1]) cellG.add(vessel([[s * .75, .05, 0], [s * 1.05, .3, .02], [s * 1.3, .45, 0]], .09, .06, muscleM, 16, 10));
  cellG.add(mesh(organGeo(.07, v => { v.x *= 1.6; }), tissue('#5a1a3a', { kind: 'pore' }), [-.15, 0, .13]), mesh(organGeo(.07, v => { v.x *= 1.6; }), tissue('#5a1a3a', { kind: 'pore' }), [.2, 0, .13])); root.add(cellG);
  // نسيج عضلي قلبي
  const tis = new THREE.Group(); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const c = mesh(organGeo(1, v => { v.x *= .7; v.y *= .12; v.z *= .12; v.y += Math.sin(v.x * 4 + i) * .02; }, 40, 20), muscleM); c.position.set((j % 2) * .3 + (i % 2) * .15, (i - 2.5) * .24, j * .24 - .24); tis.add(c); } root.add(tis);
  // القلب
  const heart = new THREE.Group(); const hShape = v => { const y = v.y; const s = y < 0 ? 1 + y * .55 : 1 - y * y * .08; v.x *= s * 1.05; v.z *= s * .9; v.y *= 1.25; v.multiplyScalar(1 + fbm3(v.x * 3 + 1, v.y * 3, v.z * 3) * .05); return v; };
  const hInner = new THREE.Group(); hInner.rotation.set(.2, -.3, .45); heart.add(hInner);
  const lv = mesh(organGeo(.8, hShape, 96, 72), tissue('#9a1f26', { bumpScale: .9 })); const rv = mesh(organGeo(.38, v => v.multiplyScalar(1 + fbm3(v.x * 5, v.y * 5, v.z * 5) * .07)), tissue('#6e2240'), [-.6, .82, .05], null, [1, .8, .9]); const apex = mesh(organGeo(.36, v => v.multiplyScalar(1 + fbm3(v.x * 5 + 3, v.y * 5, v.z * 5) * .07)), tissue('#7a1a24'), [.55, .82, .05], null, [1, .8, .9]); hInner.add(lv, rv, apex);
  const corA = tissue('#c0141f'), corV = tissue('#2c49b0'); const cor = (pts, r, m) => hInner.add(vessel(pts.map(p => hShape(V(...p).multiplyScalar(.8 * 1.03))), r, r * .4, m, 40, 8));
  cor([[0, .3, .42], [.05, 0, .44], [.12, -.3, .33], [.08, -.5, .15]], .035, corA); cor([[.2, .28, .35], [.35, 0, .2], [.32, -.3, .05]], .03, corA); cor([[-.25, .28, .33], [-.32, 0, .25], [-.25, -.35, .1]], .03, corA); cor([[.05, .25, .43], [-.08, -.1, .43], [-.05, -.45, .25]], .028, corV);
  const red = tissue('#c0141f', { kind: 'pore', bumpScale: .4 }), blue = tissue('#2a45a8', { kind: 'pore', bumpScale: .4 });
  const aorta = vessel([[.15, .85, .2], [.1, 1.6, .15], [-.15, 2.0, -.05], [-.55, 1.85, -.2], [-.5, 1.0, -.4], [-.4, -.5, -.4]], .2, .17, red, 60, 14); aorta.add(vessel([[-.05, 1.95, 0], [-.05, 2.7, 0]], .08, .07, red, 12, 10), vessel([[-.3, 1.98, -.1], [-.45, 2.7, -.1]], .07, .06, red, 12, 10));
  const pulm = vessel([[-.15, .8, .45], [-.25, 1.45, .4], [-.7, 1.55, .25], [-1.3, 1.35, 0]], .17, .12, blue, 40, 12); pulm.add(vessel([[-.25, 1.45, .4], [.6, 1.5, .2], [1.3, 1.35, 0]], .13, .11, blue, 30, 12));
  const vena = vessel([[-.7, -.6, .1], [-.85, .4, .2], [-.9, 1.4, .2], [-.95, 2.7, .1]], .17, .16, blue, 40, 12);
  heart.add(aorta, pulm, vena); root.add(heart);
  // الرئتان: فصوصٌ ونسيجٌ إسفنجيّ ورديّ
  const lungs = new THREE.Group(); const lM = tissue('#d9908e', { kind: 'vein', bumpScale: 2.4, roughness: .55, clearcoat: .3, sheen: .8 });
  const lungGeo = s => organGeo(1, v => { const t = v.y + 1; v.x *= (.72 + t * .26) * (v.x * s < 0 ? .5 : 1); v.z *= .85; v.y *= 1.6 - (v.y > 0 ? v.y * .45 : 0); if (v.x * s < 0 && v.y < 0) v.x *= 1 + v.y * .5; const f = Math.abs(v.y + v.x * s * .6 + (s > 0 ? .1 : .3)); v.multiplyScalar((1 + fbm3(v.x * 4 + s, v.y * 4, v.z * 4) * .05) * (f < .04 ? .96 : 1)); if (s > 0) { const f2 = Math.abs(v.y - .35 - v.x * .2); if (f2 < .03 && v.x > 0) v.multiplyScalar(.97); } }, 96, 72);
  const L1 = mesh(lungGeo(1), lM, [-1.45, .45, -.5]), L2 = mesh(lungGeo(-1), lM, [1.55, .45, -.5]); L1.scale.x = -1;
  const trM = tissue('#ecd6c6', { kind: 'pore', bumpScale: .5 }); const trachea = vessel([[0, 3.4, -.4], [0, 2.3, -.4]], .16, .15, trM, 20, 14);
  for (let i = 0; i < 9; i++) trachea.add(mesh(new THREE.TorusGeometry(.165, .025, 8, 28), trM, [0, 2.4 + i * .11, -.4], [Math.PI / 2, 0, 0]));
  const br1 = vessel([[0, 2.3, -.4], [-.8, 1.9, -.4], [-1.5, 1.4, -.4]], .12, .08, trM, 20, 10), br2 = vessel([[0, 2.3, -.4], [.8, 1.9, -.4], [1.6, 1.4, -.4]], .12, .08, trM, 20, 10);
  lungs.add(L1, L2, trachea, br1, br2); root.add(lungs);
  const vessels = new THREE.Group(); for (const [s, c] of [[1, red], [-1, blue]]) vessels.add(vessel([[s * .4, -1, 0], [s * 1, -2, .2], [s * .8, -3, .3]], .08, .05, c, 20, 8)); root.add(vessels);
  const title = txt('', .45, '#7a1a2a'); title.position.set(0, -3.4, 0); root.add(title);
  const names = ['خلية', 'نسيج', 'عضو', 'جهاز حيوي'];
  function apply() { cellG.visible = lvl === 0; tis.visible = lvl === 1; heart.visible = lvl >= 2; lungs.visible = lvl === 3; vessels.visible = lvl === 3; setTxt(title, names[lvl]); api.refreshParts && api.refreshParts(); }
  apply();
  const parts = [
    { id: 'cell', name: 'خلية عضلية', info: 'تشبهُ الخلايا لَبِناتِ البناء، وفي المخلوقاتِ المتعدّدةِ الخلايا تقومُ كلُّ خليةٍ بوظيفةٍ خاصّة.', objs: [mc], at: anchor(cellG, [0, .4, 0]), hidden: () => lvl !== 0 },
    { id: 'tissue', name: 'النسيج العضلي', info: 'تقومُ مجموعةُ الخلايا المتشابهةِ معًا بالوظيفةِ نفسِها، وتشكّلُ نسيجًا. والنسيجُ العضليُّ يتكوّنُ من أليافٍ تحرّكُ العظامَ وتضخُّ الدم.', objs: tis.children, at: anchor(tis, [0, .9, 0]), hidden: () => lvl !== 1 },
    { id: 'heart', name: 'القلب (عضو)', info: 'العضوُ مجموعةٌ من نسيجينِ مختلفينِ أو أكثر تعملُ معًا للقيامِ بوظيفةٍ محدّدة. والقلبُ عضوٌ يعتمدُ في وظيفتِه على نسيجٍ عضليٍّ ونسيجٍ عصبيٍّ ونسيجٍ ضامّ.', objs: [lv, rv, apex], at: anchor(heart, [.6, .4, .6]), hidden: () => lvl < 2 },
    { id: 'vessel', name: 'الأوعية الدموية', info: 'يتكوّنُ جهازُ الدورانِ من القلبِ والأوعيةِ الدمويةِ والدم، ويقومُ بنقلِ الأكسجينِ والموادِّ الغذائيةِ إلى الخلايا، والتخلّصِ من الفضلات.', objs: [aorta, pulm, vena, ...vessels.children], at: anchor(root, [-.3, 2, .2]), hidden: () => lvl < 2 },
    { id: 'lungs', name: 'الرئتان', info: 'يعتمدُ جسمُ الإنسانِ على الرئتينِ وبقيةِ أعضاءِ الجهازِ التنفسيِّ للحصولِ على الأكسجينِ بشكلٍ كافٍ.', objs: [L1, L2], at: anchor(root, [-1.7, 1.8, 0]), hidden: () => lvl !== 3 }
  ];
  return {
    root, parts,
    update(dt) { t += dt; const b = 1 + Math.max(0, Math.sin(t * 7)) * .06; heart.scale.setScalar(b); const br = 1 + Math.sin(t * 1.5) * .05; L1.scale.set(-br, br, br); L2.scale.setScalar(br); tis.children.forEach((c, i) => c.scale.x = 1 - Math.max(0, Math.sin(t * 3 + i)) * .12); },
    cam: { pos: [0, .8, 9], target: [0, .2, 0] }, inpage: { pos: [0, .5, 9.5], target: [0, .3, 0] },
    controls: [
      { type: 'steps', value: 3, steps: names.map((n, i) => ({ t: (i + 1) + '- ' + n, d: [parts[0].info, parts[1].info, parts[2].info, parts[3].info][i] })), on: i => { lvl = i; apply(); } }
    ],
    quiz: [
      { q: 'المس العضوَ الذي يضخُّ الدم.', a: 'heart' },
      { q: 'المس العضوَ الذي يزوّدُ الجسمَ بالأكسجين.', a: 'lungs' },
      { q: 'انتقل إلى «نسيج» ثم المس النسيجَ العضليّ.', a: 'tissue' }
    ]
  };
}
