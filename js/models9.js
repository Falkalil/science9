// مجسّماتٌ جديدةٌ للثالث المتوسط: جزيءُ DNA ونماذجُ الذرّة — مطابقةٌ لأشكالِ الكتاب (DNA ص ١٢٣، نماذج الذرّة ص ١٥٠–١٥٨)
import { THREE, mat, mesh, anchor, V } from './kit.js';
import { txt } from './models6a.js';

const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: .32, clearcoat: .6, clearcoatRoughness: .2, sheen: .3 }, o));

/* ═════════ جزيءُ DNA: سلّمٌ حلزونيّ (الشكل في ص ١٢٣ بألوانِه) ═════════ */
export function dnaModel(api) {
  const root = new THREE.Group();
  // ألوانُ الكتاب: سكّر (بنفسجي)، فوسفات (برتقالي)، أدنين (أحمر)، ثايمين (أزرق)، جوانين (أخضر)، سايتوسين (أصفر)
  const C = { sugar: '#6a4ab0', phos: '#f08a2a', A: '#e84a4a', T: '#3aa0e0', G: '#5cbf4a', C: '#f2c53a' };
  const N = 22, rise = .34, R = 1.15, turn = Math.PI * 2 / 10;
  const seq = 'ATGCGTACCTAGGCTAATCGGA'.split(''); const comp = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const sugarM = phys(C.sugar), phosM = phys(C.phos), baseM = Object.fromEntries(['A', 'T', 'G', 'C'].map(b => [b, phys(C[b], { roughness: .4 })]));
  const sGeo = new THREE.SphereGeometry(.2, 20, 14), pGeo = new THREE.SphereGeometry(.15, 16, 12);
  const strands = [new THREE.Group(), new THREE.Group()], rungs = new THREE.Group(); root.add(strands[0], strands[1], rungs);
  const byBase = { A: [], T: [], G: [], C: [] }, sugars = [], phosphs = [];
  const pt = (i, side) => { const a = i * turn + side * Math.PI * .78; return V(Math.cos(a) * R, (i - N / 2) * rise, Math.sin(a) * R); };
  for (const side of [0, 1]) {
    const pts = []; for (let i = 0; i < N; i++) pts.push(pt(i, side));
    const curveS = new THREE.CatmullRomCurve3(pts); const tube = new THREE.Mesh(new THREE.TubeGeometry(curveS, N * 8, .07, 10, false), phys(side ? '#8a6ad0' : '#7a5ac0', { roughness: .5 })); strands[side].add(tube);
    for (let i = 0; i < N; i++) { const s = mesh(sGeo, sugarM, pts[i].toArray()); strands[side].add(s); sugars.push(s);
      if (i < N - 1) { const m = pts[i].clone().lerp(pts[i + 1], .5); const p = mesh(pGeo, phosM, m.toArray()); strands[side].add(p); phosphs.push(p); } }
  }
  for (let i = 0; i < N; i++) {
    const a = pt(i, 0), b = pt(i, 1), mid = a.clone().lerp(b, .5), b1 = seq[i], b2 = comp[b1];
    for (const [from, base] of [[a, b1], [b, b2]]) {
      const len = from.distanceTo(mid) - .2, dir = mid.clone().sub(from).normalize();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, len, 14), baseM[base]); cyl.position.copy(from.clone().add(dir.clone().multiplyScalar(.2 + len / 2))); cyl.quaternion.setFromUnitVectors(V(0, 1, 0), dir); rungs.add(cyl); byBase[base].push(cyl);
    }
    const h = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: .3 })); h.position.copy(mid); rungs.add(h);
  }
  // لافتاتُ الحروف على بعض الدرجات
  [2, 5, 9, 13, 17].forEach(i => { const L = txt(seq[i] + '–' + comp[seq[i]], .32, '#0b2a38'); L.position.copy(pt(i, 0).clone().lerp(pt(i, 1), .5)).add(V(0, .22, 0)); rungs.add(L); });
  root.rotation.z = .12;
  let spin = true, unzip = 0, unzipT = 0;
  const parts = [
    { id: 'sugar', name: 'السكّر (منقوص الأكسجين)', info: 'يتكوّنُ جانبا السلّمِ الحلزونيِّ من تعاقبِ <b>السكّرِ الخماسيِّ المنقوصِ الأكسجين</b> ومجموعةِ الفوسفات.', objs: sugars.slice(0, 22), at: anchor(strands[0], pt(N - 2, 0).toArray()) },
    { id: 'phos', name: 'الفوسفات', info: 'مجموعاتُ <b>الفوسفات</b> تتعاقبُ مع السكّرِ لتكوّنَ جانبي السلّم.', objs: phosphs, at: anchor(strands[1], pt(3, 1).clone().lerp(pt(4, 1), .5).toArray()) },
    { id: 'A', name: 'أدنين A', info: 'قاعدةٌ نيتروجينيةٌ ترتبطُ دائمًا مع <b>الثايمين T</b>.', objs: byBase.A, at: anchor(rungs, pt(0, 0).clone().lerp(pt(0, 1), .3).toArray()) },
    { id: 'T', name: 'ثايمين T', info: 'قاعدةٌ نيتروجينيةٌ ترتبطُ دائمًا مع <b>الأدنين A</b>. (في RNA يحلُّ اليوراسيل U محلَّه.)', objs: byBase.T, at: anchor(rungs, pt(1, 0).clone().lerp(pt(1, 1), .3).toArray()) },
    { id: 'G', name: 'جوانين G', info: 'قاعدةٌ نيتروجينيةٌ ترتبطُ دائمًا مع <b>السايتوسين C</b>.', objs: byBase.G, at: anchor(rungs, pt(2, 0).clone().lerp(pt(2, 1), .3).toArray()) },
    { id: 'C', name: 'سايتوسين C', info: 'قاعدةٌ نيتروجينيةٌ ترتبطُ دائمًا مع <b>الجوانين G</b>.', objs: byBase.C, at: anchor(rungs, pt(3, 0).clone().lerp(pt(3, 1), .3).toArray()) },
  ];
  return {
    root, parts,
    update(dt) { if (spin) root.rotation.y += dt * .35; if (unzipT) { unzip = Math.min(1, unzip + dt * .5); strands[0].position.x = -unzip * 1.4; strands[1].position.x = unzip * 1.4; rungs.children.forEach(r => r.scale.setScalar(Math.max(.001, 1 - unzip))); } else if (unzip > 0) { unzip = Math.max(0, unzip - dt * .8); strands[0].position.x = -unzip * 1.4; strands[1].position.x = unzip * 1.4; rungs.children.forEach(r => r.scale.setScalar(Math.max(.001, 1 - unzip))); } },
    cam: { pos: [0, 0, 11.5], target: [0, 0, 0] }, inpage: { pos: [0, 0, 11], target: [0, 0, 0] },
    controls: [
      { type: 'button', label: '⟲ إيقاف/تشغيل الدوران', on: () => { spin = !spin; } },
      { type: 'button', label: '🧬 افصلِ السلسلتين (بدءُ التضاعف)', toggle: true, on: v => { unzipT = v ? 1 : 0; if (v) api.toast('خطوة ١: إنزيمٌ يفصلُ السلسلتين، ثم ترتبطُ قواعدُ جديدةٌ بكلِّ سلسلة (A–T، G–C).'); } },
    ],
    quiz: [{ q: 'المسِ القاعدةَ التي ترتبطُ مع الأدنين.', a: 'T' }, { q: 'المسْ مكوّنًا من جانبي السلّم.', a: 'sugar' }, { q: 'المسِ القاعدةَ التي ترتبطُ مع السايتوسين.', a: 'G' }],
  };
}

/* ═════════ نماذجُ الذرّة (ص ١٥٠–١٥٨): بور والسحابة الإلكترونية ═════════ */
export function atomModel(api, variant = 0) {
  const root = new THREE.Group();
  const protM = phys('#e84a4a'), neutM = phys('#9aa3ad'), elecM = phys('#3aa0e0', { emissive: '#1a60a0', emissiveIntensity: .5 });
  const nuc = new THREE.Group(); root.add(nuc);
  let Z = variant === 1 ? 6 : 3, Nn = variant === 1 ? 6 : 4; // ليثيوم (بور) أو كربون (السحابة)
  const pGeo = new THREE.SphereGeometry(.28, 20, 14);
  let protons = [], neutrons = [], electrons = [], shells = [], cloud = null, mode = variant === 1 ? 'cloud' : 'bohr';
  function build() {
    nuc.clear(); protons = []; neutrons = [];
    const n = Z + Nn, pts = []; for (let i = 0; i < n; i++) { const k = i + .5, phi = Math.acos(1 - 2 * k / n), th = Math.PI * (1 + Math.sqrt(5)) * k, r = .42 * Math.cbrt(n) * .9; pts.push(V(Math.cos(th) * Math.sin(phi) * r, Math.cos(phi) * r, Math.sin(th) * Math.sin(phi) * r)); }
    pts.forEach((p, i) => { const isP = i % 2 === 0 ? protons.length < Z : neutrons.length >= Nn; const m = mesh(pGeo, isP ? protM : neutM, p.toArray()); nuc.add(m); (isP ? protons : neutrons).push(m); });
    shells.forEach(s => root.remove(s.g)); shells = []; electrons = []; if (cloud) { root.remove(cloud); cloud = null; }
    const per = [2, 8, 18]; let left = Z;
    if (mode === 'bohr') for (let k = 0; left > 0; k++) { const g = new THREE.Group(); root.add(g); const r = 1.7 + k * 1.15; const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .02, 8, 96), mat('#8fb6c2', { transparent: true, opacity: .6 })); ring.rotation.x = Math.PI / 2; g.add(ring); const cnt = Math.min(left, per[k]); left -= cnt; const es = []; for (let i = 0; i < cnt; i++) { const e = mesh(new THREE.SphereGeometry(.14, 16, 12), elecM, [0, 0, 0]); g.add(e); es.push(e); electrons.push(e); } shells.push({ g, r, es, sp: 1.2 / (k + 1) }); }
    else { const n2 = 1600, pos = new Float32Array(n2 * 3); for (let i = 0; i < n2; i++) { const r = 1.0 + Math.pow(Math.random(), 1.8) * 3.2, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1); pos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); cloud = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#5ab8f0', size: .06, transparent: true, opacity: .55, depthWrite: false })); root.add(cloud); }
    api.refreshParts && api.refreshParts();
  }
  build();
  const parts = [
    { id: 'p', name: 'البروتونات (+)', info: 'جسيماتٌ موجبةُ الشحنةِ في النواة؛ <b>عددُها هو العددُ الذرّي</b> ويحدّدُ نوعَ العنصر.', get objs() { return protons; }, at: anchor(nuc, [0, .9, 0]) },
    { id: 'n', name: 'النيوترونات (متعادلة)', info: 'جسيماتٌ متعادلةُ الشحنةِ في النواةِ كتلتُها قريبةٌ من كتلةِ البروتون، اكتشفَها شادويك. عددُ البروتونات + النيوترونات = <b>العددُ الكتلي</b>.', get objs() { return neutrons; }, at: anchor(nuc, [0, -.9, 0]) },
    { id: 'e', name: 'الإلكترونات (−)', info: 'جسيماتٌ سالبةُ الشحنةِ كتلتُها صغيرةٌ جدًّا، تتحرّكُ حولَ النواة: في مستوياتِ طاقةٍ محدّدة (نموذج بور) أو في سحابةٍ إلكترونية (النموذج الحديث).', get objs() { return mode === 'bohr' ? electrons : (cloud ? [cloud] : []); }, at: anchor(root, [2.2, 1.6, 0]) },
  ];
  const EL = [['الهيدروجين', 1, 0], ['الهيليوم', 2, 2], ['الليثيوم', 3, 4], ['الكربون', 6, 6], ['النيتروجين', 7, 7], ['الأكسجين', 8, 8], ['الصوديوم', 11, 12]];
  return {
    root, parts,
    update(dt, t) { nuc.rotation.y += dt * .4; shells.forEach(s => s.es.forEach((e, i) => { const a = t * s.sp + i / s.es.length * Math.PI * 2; e.position.set(Math.cos(a) * s.r, 0, Math.sin(a) * s.r); })); shells.forEach((s, k) => { s.g.rotation.x = .35 + k * .25; s.g.rotation.z = k * .4; }); if (cloud) cloud.rotation.y += dt * .2; },
    cam: { pos: [0, 2.2, 10], target: [0, 0, 0] }, inpage: { pos: [0, 1.5, 9.5], target: [0, 0, 0] },
    controls: [
      { type: 'seg', label: 'النموذج', options: ['نموذج بور', 'السحابة الإلكترونية'], value: variant === 1 ? 1 : 0, on: k => { mode = k ? 'cloud' : 'bohr'; build(); } },
      { type: 'seg', label: 'العنصر', options: EL.map(e => e[0]), value: variant === 1 ? 3 : 2, on: k => { Z = EL[k][1]; Nn = EL[k][2]; build(); api.toast(`${EL[k][0]}: ${AR(Z)} بروتون، ${AR(Nn)} نيوترون، ${AR(Z)} إلكترون — العدد الكتلي ${AR(Z + Nn)}`); } },
    ],
    quiz: [{ q: 'المسِ الجسيماتِ التي يحدّدُ عددُها نوعَ العنصر.', a: 'p' }, { q: 'المسِ الجسيماتِ المتعادلةَ الشحنة.', a: 'n' }],
  };
}

export const BUILD9 = { dna: dnaModel, atom: atomModel };
