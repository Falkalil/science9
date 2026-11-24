// مجسّمات الوحدة الثالثة: الأرض ومواردها
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, lerp, clamp, ease, terrain, strataTexture, proxy, smooth, fbm, tree, pine, cloud, arrowTube, house, noiseTexture, fbm3, tissueBump, organGeo, creature } from './kit.js';

const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const fmtNum = n => ar(Math.round(n).toLocaleString('en-US'));

/* ───────────── ص ١٤٦–١٤٧: معالم سطح الأرض ───────────── */
export function landformsModel(api, variant = 0) {
  const root = new THREE.Group();
  const W = 18, D = 10;
  const rv = [[-8, -3.2], [-6.4, -2], [-5.2, -.4], [-4.6, 1.2], [-4.4, 2.6], [-4.3, 3.6]]; // النهر الرئيس
  const trib = [[-2.2, -1.4], [-3.4, -.3], [-4.8, .5]];
  const rv2 = [[5.2, -1.4], [4.25, -.6], [3.6, .3], [2.6, .6], [1.4, .2]]; // نهر الشلال إلى البحيرة
  const dSeg = (x, z, pts) => { let m = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; const vx = bx - ax, vz = bz - az; const t = clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)); m = Math.min(m, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return m; };
  const g2 = (x, z, cx, cz, sx, sz) => Math.exp(-((x - cx) ** 2 / sx + (z - cz) ** 2 / sz));
  function h(x, z) {
    let y = .5 + (fbm(x * .5 + 7, z * .5) - .5) * .25;
    y += 4.2 * g2(x, z, -7.2, -3.6, 3, 2.6);          // جبل
    y += 2.6 * g2(x, z, -4.4, -4.3, 2, 1.4);          // جبل ثانٍ (الوادي بينهما)
    y += 1.1 * g2(x, z, -6.2, -.6, .8, .8);           // تل
    y += .35 * Math.max(0, Math.sin(x * 3.2 + z * 1.4)) * smooth(-2.5, -1.2, z) * g2(x, z, -.4, -3.8, 4, 1.2) * 2; // كثبان الصحراء
    // هضبة بجوانب شديدة
    const pl = smooth(.75, .55, Math.max(Math.abs(x - 6) / 3.2, Math.abs(z + 2.4) / 2.1)); y = lerp(y, 2.6 + (fbm(x, z) - .5) * .1, pl);
    // خانق يشق الهضبة
    y -= 2.2 * smooth(.45, .1, Math.abs(x - 7.1 + .25 * Math.sin(z * 2))) * smooth(-4.6, -3.8, z) * smooth(-.1, -.9, z);
    // بحيرة
    y = lerp(y, -.25, smooth(1.3, .7, Math.hypot((x - .9) / 1.6, z - .1)));
    // النهر والرافد
    y -= .45 * smooth(.38, .1, dSeg(x, z, rv)) + .3 * smooth(.25, .06, dSeg(x, z, trib)) + .3 * smooth(.25, .06, dSeg(x, z, rv2)) * (1 - pl);
    // البحر والشاطئ والجرف
    const coastZ = 3.3 + .4 * Math.sin(x * .8);
    const cliff = smooth(3.2, 4.4, x);
    const shore = cliff > .5 ? smooth(coastZ - .15, coastZ + .05, z) : smooth(coastZ - 1, coastZ + .6, z);
    y = lerp(y + cliff * .9 * smooth(0, 2, z), -1.0, shore);
    // الدلتا
    y = lerp(y, .02 + .05 * Math.sin(x * 9) * Math.cos(z * 7), g2(x, z, -4.4, 3.9, .7, .35) * .9);
    return y;
  }
  function col(x, z, y) {
    if (y < -.1) return '#d8c690';
    if (y < .12) return '#e3d29a';
    const desert = g2(x, z, -.4, -3.8, 5, 1.6); if (desert > .35) return desert > .6 ? '#e2c27a' : '#c9b06a';
    if (y > 3.0) return '#8a7f74';
    if (y > 2.2 && Math.abs(x - 6) < 3.3) return '#7f9a52';
    if (Math.abs(x + 1.6) < 1.5 && z > .8 && z < 2.6) return ((Math.floor(x * 2) + Math.floor(z * 2)) % 2) ? '#b9b25a' : '#8ea24a';
    if (x > 2.2 && x < 3.8 && z > 2) return '#e3d29a';
    return y > 1.6 ? '#4f7f3a' : '#5f9a45';
  }
  const st = strataTexture([['#6e4b2e', 1], ['#8d6a45', 1], ['#a3825a', 1], ['#7a5636', 1]]);
  const land = terrain({ w: W, d: D, nx: 220, nz: 130, h, color: col, bottom: -2.2, top: 4.5, sideTex: st }); root.add(land);
  let seaLevel = 0;
  const seaM = mat('#2f86c9', { transparent: true, opacity: .82, roughness: .12 });
  const sea = mesh(new THREE.PlaneGeometry(W, D), seaM, [0, 0, 0], [-Math.PI / 2, 0, 0]); root.add(sea);
  const seaBox = mesh(new THREE.BoxGeometry(W, 1, 3), glass('#2f86c9', .45), [0, -.5, D / 2 - 1.5]); root.add(seaBox);
  const lake = mesh(new THREE.CircleGeometry(1, 40), mat('#3f98d6', { roughness: .1 }), [.9, .02, .1], [-Math.PI / 2, 0, 0]); lake.scale.set(1.9, 1.15, 1); root.add(lake);
  const wM = mat('#3f98d6', { roughness: .15, emissive: '#1a5f9a', emissiveIntensity: .15 });
  const toV = pts => pts.map(([x, z]) => V(x, h(x, z) + .32, z));
  const river = tube(toV(rv), .16, wM, 60, 6); river.scale.y = .25; root.add(river);
  const tribT = tube(toV(trib), .1, wM, 40, 6); tribT.scale.y = .25; root.add(tribT);
  const river2 = tube(rv2.map(([x, z], i) => V(x, i === 0 ? 2.62 : h(x, z) + .3, z)), .12, wM, 40, 6); river2.scale.y = .3; root.add(river2);
  // الشلال
  const fall = mesh(new THREE.PlaneGeometry(.5, 2.2), mat('#e8f6ff', { transparent: true, opacity: .85, side: 2, emissive: '#bfe6ff', emissiveIntensity: .3 }), [4.5, 1.5, -.85], [0, .55, 0]); root.add(fall);
  const mist = new Flow(root, '#ffffff', .06, 40); mist.addPath(curve([[4.6, 2.5, -.8], [4.3, 1.4, -.6], [4.0, .6, -.4]]), .7); mist.rate = 0;
  const flowP = new Flow(root, '#bfe6ff', .07, 80); flowP.addPath(curve(toV(rv).map(v => v.clone().add(V(0, .05, 0)))), .15); flowP.addPath(curve(toV(trib)), .25); flowP.rate = 0;
  // أشجار
  for (let i = 0; i < 60; i++) { const x = -8.5 + Math.random() * 7, z = -1 + Math.random() * 3.5; const y = h(x, z); if (y < .2 || y > 2 || dSeg(x, z, rv) < .5) continue; const t = pine(.45); t.position.set(x, y, z); root.add(t); }
  const P = (id, name, info, pos, size, cat, sh) => ({ id, name, info, cat, objs: [proxy(root, pos, size, sh)], at: anchor(root, [pos[0], pos[1] + size[1] / 2 + .1, pos[2]]) });
  const parts = [
    P('mountain', 'جبل', 'الجبل منطقة مرتفعة كثيرًا فوق سطح الأرض.', [-7.2, 2.4, -3.6], [3, 4.4, 3], 'land'),
    P('hill', 'تلّ', 'التلّ أقل ارتفاعًا من الجبل، وأكثر استدارة.', [-6.2, 1.1, -.6], [1.6, 1.2, 1.6], 'land'),
    P('valley', 'وادٍ', 'الوادي منطقة منخفضة تمتد بين جبلين أو تلّين.', [-5.6, 1.4, -4.4], [1.2, 1.2, 1.4], 'land'),
    P('desert', 'صحراء', 'الصحراء أرض واسعة يندر هطول الأمطار عليها.', [-.4, .8, -3.7], [4, .8, 1.8], 'land'),
    P('plain', 'سهل', 'السهل منطقة واسعة منبسطة.', [-1.6, .6, 1.7], [3, .4, 1.8], 'land'),
    P('plateau', 'هضبة', 'الهضبة منطقة منبسطة أكثر ارتفاعًا من الأراضي المحيطة.', [5.4, 2.7, -2.4], [3.5, .6, 3.6], 'land'),
    P('canyon', 'الخانق (وادٍ سحيق)', 'الخانق (الوادي السحيق) وادٍ ضيق، جوانبه عالية وشديدة الانحدار.', [7.1, 1.7, -2.4], [.8, 1.6, 3.4], 'land'),
    P('cliff', 'جُرف', 'الجرف الجانب الحاد الميل من الصخور أو التربة.', [6.4, .2, 3.3], [4, 1.2, .6], 'land'),
    P('beach', 'شاطئ', 'الشاطئ أرض على امتداد حافة المسطحات المائية.', [.8, .15, 3.4], [3.6, .3, .7], 'land'),
    P('dunes', 'كثبان رملية', 'الكثبان الرملية كومة أو نتوء من الرمال.', [2.8, .4, 2.6], [1.2, .5, .8], 'land'),
    P('sea', 'بحر', 'البحر أو المحيط مساحة واسعة مغطاة بالمياه المالحة.', [0, -.1, 4.4], [12, .3, 1.4], 'water'),
    P('coast', 'ساحل', 'الساحل خط تلتقي عنده اليابسة مع الماء.', [5.2, .1, 3.9], [2, .4, .4], 'water'),
    { id: 'river', name: 'نهر', info: 'النهر مساحة طبيعية لجريان الماء وانتقاله.', cat: 'water', objs: [river], at: anchor(root, [-5.2, h(-5.2, -.4) + .5, -.4]) },
    { id: 'trib', name: 'رافد', info: 'الرافد نهر صغير أو جدول ماء يصب في نهر كبير.', cat: 'water', objs: [tribT], at: anchor(root, [-3.2, h(-3.2, -.4) + .5, -.4]) },
    { id: 'fall', name: 'شلال', info: 'الشلال تيار من المياه الطبيعية يسقط من مكان مرتفع.', cat: 'water', objs: [fall], at: anchor(root, [4.4, 2.8, -.7]) },
    { id: 'lake', name: 'بحيرة', info: 'البحيرة مساحة من المياه تحيط بها الأراضي اليابسة.', cat: 'water', objs: [lake], at: anchor(root, [.9, .4, .1]) },
    P('mouth', 'مصب النهر', 'المصب ملتقى مياه النهر ومياه المحيطات أو البحار.', [-4.4, .2, 3.3], [.7, .4, .5], 'water'),
    P('delta', 'الدلتا', 'الدلتا أرض لها شكل المثلث تتشكل عند مصب النهر.', [-4.4, .1, 4.0], [1.6, .3, .8], 'water')
  ];
  let filter = 0;
  parts.forEach(p => p.hidden = () => (filter === 1 && p.cat !== 'land') || (filter === 2 && p.cat !== 'water'));
  const pageBox = variant ? [2, -1, -4.5, 9, 3, 5] : [-9, -1, -5, 4, 3, 5];
  return {
    root, parts, pageBox,
    update(dt) { mist.update(dt); flowP.update(dt); },
    cam: { pos: variant ? [8, 7, 11] : [-3, 8, 12], target: variant ? [4.5, 1, 0] : [-2, .6, 0] },
    inpage: variant ? { pos: [6, 5, 11], target: [5.5, 1, 0] } : { pos: [-3, 6.5, 11], target: [-2.5, .8, 0] },
    controls: [
      { type: 'seg', label: 'اعرض أسماء', options: ['الكل', 'معالم اليابسة', 'المعالم المائية'], value: 0, on: i => { filter = i; } },
      { type: 'slider', label: 'منسوب مياه البحر', min: -10, max: 10, step: 1, value: 0, fmt: v => v === 0 ? 'طبيعي' : v > 0 ? 'مرتفع' : 'منخفض', on: v => { seaLevel = v * .05; sea.position.y = seaLevel; seaBox.scale.y = 1 + v * .1; seaBox.position.y = -.5 + seaLevel / 2; if (v >= 6) api.toast('ارتفع منسوب البحر فغمر الماء الشاطئ والدلتا، وتغيّر خط الساحل.'); } },
      { type: 'button', label: 'شغّل جريان المياه', toggle: true, on: on => { flowP.rate = on ? 10 : 0; mist.rate = on ? 12 : 0; if (!on) { flowP.clear(); mist.clear(); } } }
    ],
    quiz: variant ? [
      { q: 'ما اسم المعلم المحاذي لحافة البحر حيث تلتقي اليابسة بالماء؟', a: 'coast' },
      { q: 'المس المنطقة المنبسطة الأكثر ارتفاعًا من الأراضي المحيطة.', a: 'plateau' },
      { q: 'المس تيار المياه الذي يسقط من مكان مرتفع.', a: 'fall' },
      { q: 'المس الوادي الضيق ذا الجوانب العالية الشديدة الانحدار.', a: 'canyon' },
      { q: 'المس الجانب الحاد الميل من الصخور عند البحر.', a: 'cliff' }
    ] : [
      { q: 'المس المنطقة المرتفعة كثيرًا فوق سطح الأرض.', a: 'mountain' },
      { q: 'المس ما هو أقل ارتفاعًا من الجبل وأكثر استدارة.', a: 'hill' },
      { q: 'المس الأرض التي لها شكل المثلث عند مصب النهر.', a: 'delta' },
      { q: 'المس النهر الصغير الذي يصب في نهر كبير.', a: 'trib' },
      { q: 'المس المنطقة الواسعة المنبسطة.', a: 'plain' },
      { q: 'المس مساحة المياه التي تحيط بها اليابسة.', a: 'lake' }
    ]
  };
}

/* ───────────── ص ١٤٨: معالم قاع المحيط ───────────── */
export function oceanModel(api) {
  const root = new THREE.Group();
  const W = 16, D = 5;
  const prof = x => {
    if (x > 6) return 1.0;                                  // القارة
    if (x > 3.6) return lerp(-.25, -.55, (6 - x) / 2.4) - smooth(6, 5.8, x) * 0;   // الرصيف
    if (x > 2.4) return lerp(-.55, -2.7, ease((3.6 - x) / 1.2)); // المنحدر
    if (x > .6) return lerp(-2.7, -3.15, (2.4 - x) / 1.8);  // المرتفع
    if (x > -1.6) return -3.2;                              // السهل
    if (x > -4.6) { const t = (x + 3.1) / 1.5; const ridge = 1.5 * Math.exp(-t * t * 1.2); const rift = .55 * Math.exp(-((((x + 3.1) / .18)) ** 2)); return -3.2 + ridge - rift; } // ظهر المحيط
    if (x > -6.0) return -3.2;
    if (x > -7.0) { const t = (x + 6.5) / .5; return -3.2 - 1.8 * Math.exp(-t * t * 1.5); } // الأخدود
    return lerp(-1.5, 1.2, smooth(-7.0, -8, x));             // اليابسة البعيدة
  };
  let smH = 1.6;
  const seamount = (x, z) => smH * Math.exp(-((x + .4) ** 2 + (z + .5) ** 2) / .45);
  const h = (x, z) => prof(x) + seamount(x, z) + (fbm(x * 1.2, z * 1.2) - .5) * .15 + (x < -1.6 && x > -4.6 ? .2 * Math.sin(z * 2) * Math.exp(-((((x + 3.1) / .6)) ** 2)) : 0);
  const col = (x, z, y) => x > 6 ? '#6a9a45' : x < -7.3 && y > 0 ? '#5f8f3a' : y > -0.7 ? '#b9c49a' : y > -2.8 ? '#98ad8a' : '#a8b8a0';
  const st = strataTexture([['#7a2a14', 1.4], ['#a3502a', .6], ['#8a6a46', .6], ['#b39a72', .8], ['#9c8a6a', .4]]);
  let land = null;
  function build() { if (land) root.remove(land); land = terrain({ w: W, d: D, nx: 220, nz: 60, h, color: col, bottom: -6, top: 1.5, sideTex: st }); root.add(land); }
  build();
  // البركان في الأخدود والجزيرة البركانية
  const plume = new Flow(root, '#e8e8e8', .09, 60); plume.addPath(curve([[-7.4, 1.2, 0], [-7.6, 2.2, .2], [-7.2, 3.2, 0]]), .4); plume.rate = 5;
  const lava = tube([[-6.6, -6, 0], [-6.9, -4.5, 0], [-7.2, -2.5, 0], [-7.4, .9, 0]], .12, mat('#ff6a1a', { emissive: '#ff4400', emissiveIntensity: .8 }), 30, 8); root.add(lava);
  const waterM = glass('#4aa8d8', .35); let wl = 0;
  const water = mesh(new THREE.BoxGeometry(13.4, 1, D), waterM, [-.7, 0, 0]); root.add(water);
  function setWater(v) { wl = v; const top = -v * .55; const H = top + 5.2; water.scale.y = Math.max(.001, H); water.position.y = top - H / 2; water.visible = H > .02; }
  setWater(0);
  const P = (id, name, info, pos, size, extra) => Object.assign({ id, name, info, objs: [proxy(root, pos, size)], at: anchor(root, [pos[0], pos[1] + size[1] / 2 + .15, pos[2] + D / 2 - .2]) }, extra || {});
  const parts = [
    P('cont', 'القارة', 'القارة جزء من اليابسة يرتفع فوق سطح الماء.', [6.8, 1.0, 0], [1.6, .6, D]),
    P('shelf', 'الرصيف القاري', 'الرصيف القاري شريط يحاذي شواطئ القارة، وهو يميل ميلًا خفيفًا، ويمتد من خط الشاطئ حتى حافة المنحدر، حيث يصير الانحدار شديدًا.', [4.8, -.4, 0], [2.4, .4, D]),
    P('slope', 'المنحدر القاري', 'المنحدر القاري يبدأ من حافة الرصيف، حيث يتزايد العمق سريعًا، ويتزايد انحدار السطح نحو قاع المحيط.', [3.0, -1.6, 0], [1.3, 2.2, D]),
    P('rise', 'المرتفع القاري', 'المرتفع القاري منطقة ذات ميل خفيف تلي المنحدر القاري.', [1.5, -2.9, 0], [1.8, .4, D]),
    P('plain', 'سهول قاعية منبسطة', 'سهول قاعية منبسطة: سهول شاسعة تعدّ أكثر مناطق قاع المحيط انبساطًا، وتشكّل ٤/١٠ من مساحة قاعه.', [-.5, -3.15, 1.4], [2.2, .3, 2]),
    P('ridge', 'ظهر المحيط', 'ظهر المحيط سلسلة جبلية طويلة تحت الماء، يخترقها بشكل طولي وادٍ متصدّع يكون على قمة هذه الجبال.', [-3.1, -2.3, 0], [2.6, 1.6, D]),
    P('seamount', 'الجبال البحرية', 'الجبال البحرية جبال ترتفع من قاع المحيط من دون أن تعلو فوق سطح المياه. فإذا ارتفعت فوق سطح الماء سميت جزرًا بركانية.', [-.4, -2.2, -.5], [1.4, 1.8, 1.4], { hidden: () => smH > 3.2 }),
    P('island', 'الجزر البركانية', 'إذا ارتفعت الجبال البحرية فوق سطح الماء سميت جزرًا بركانية.', [-.4, -.4, -.5], [1.4, 1.2, 1.4], { hidden: () => smH <= 3.2 }),
    P('trench', 'الأخدود', 'الأخاديد البحرية أعمق مناطق قاع المحيط، تتميز بطولها الكبير وعرضها الضيق.', [-6.5, -4.4, 0], [.9, 1.4, D]),
    { id: 'volcano', name: 'البركان', info: 'تحدث معظم البراكين بمحاذاة حدود الصفائح الأرضية سواء على اليابسة أو في قاع المحيط.', objs: [lava], at: anchor(root, [-7.0, -3.0, D / 2 + .1]) }
  ];
  parts.find(p => p.id === 'seamount').at.position.z = .3; parts.find(p => p.id === 'island').at.position.z = .3;
  return {
    root, parts,
    update(dt) { plume.update(dt); },
    cam: { pos: [1, 4.5, 13], target: [-.5, -1.6, 0] }, inpage: { pos: [-1, 3.6, 12.5], target: [-.4, -1.6, 0] },
    controls: [
      { type: 'slider', label: 'اسحب مياه المحيط', min: 0, max: 10, step: 1, value: 0, fmt: v => v ? (v * 10) + '٪' : 'ممتلئ', on: v => setWater(v) },
      { type: 'slider', label: 'ارتفاع الجبل البحري', min: 0, max: 10, step: 1, value: 3, fmt: v => smH > 3.2 ? 'جزيرة بركانية' : 'جبل بحري', on: v => { smH = .6 + v * .35; build(); api.refreshParts(); if (smH > 3.2) api.toast('ارتفع الجبل البحري فوق سطح الماء فأصبح جزيرة بركانية.'); } }
    ],
    quiz: [
      { q: 'المس أعمق مناطق قاع المحيط.', a: 'trench' },
      { q: 'المس الشريط الذي يحاذي شواطئ القارة ويميل ميلًا خفيفًا.', a: 'shelf' },
      { q: 'ماذا نطلق على الجزء المستوي من قاع المحيط؟ المسه.', a: 'plain' },
      { q: 'المس السلسلة الجبلية الطويلة التي يخترقها وادٍ متصدع.', a: 'ridge' },
      { q: 'المس المنطقة التي يزداد فيها العمق سريعًا بعد الرصيف.', a: 'slope' }
    ]
  };
}

/* ───────────── ص ١٥٠: طبقات الأرض ───────────── */
export function layersModel(api) {
  const root = new THREE.Group();
  // نسيج سطح الأرض: محيطات ويابسة
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  const img = g.createImageData(1024, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 1024; x++) { const lon = x / 1024 * 8, lat = y / 512 * 4; const n = fbm(lon + Math.sin(lat), lat * 1.3, 5) + .12 * Math.cos(lat * 1.6); const i = (y * 1024 + x) * 4; const polar = y < 30 || y > 482;
    let r, gg, b; if (polar) { r = gg = b = 240; } else if (n > .56) { const d = fbm(lon * 3, lat * 3); r = 70 + d * 120; gg = 120 + d * 50; b = 50; if (Math.abs(y - 256) < 70 && d > .55) { r = 200; gg = 170; b = 110; } } else { r = 20; gg = 70 + n * 60; b = 150 + n * 70; }
    img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); const earthTex = new THREE.CanvasTexture(c); earthTex.colorSpace = THREE.SRGBColorSpace;
  const L = [
    { id: 'inner', name: 'اللب الداخلي', r: .95, col: '#fff3c4', info: 'يقع اللب أسفل الستار السفلي، ويشكّل الكتلة المركزية للأرض، وهو يتألف من نطاق خارجي سائل يسمّى اللب الخارجي، ونطاق داخلي صلب يسمّى اللب الداخلي.', state: 'صلب' },
    { id: 'outer', name: 'اللب الخارجي', r: 1.75, col: '#ffc832', info: 'اللب الخارجي نطاق خارجي سائل من لب الأرض.', state: 'سائل' },
    { id: 'lower', name: 'الستار السفلي', r: 2.6, col: '#ff8c1a', info: 'المنطقة التي تلي القشرة الأرضية تسمّى الستار، وينقسم الستار إلى قسمين: الستار العلوي والستار السفلي.', state: '' },
    { id: 'upper', name: 'الستار العلوي', r: 2.92, col: '#e8622a', info: 'الستار العلوي هو القسم العلوي من الستار. ويتكوّن الغلاف الصخري للأرض من القشرة الأرضية وجزء من الستار العلوي.', state: '' },
    { id: 'crust', name: 'القشرة الأرضية', r: 3.0, col: '#9a5a32', info: 'يسمّى الجزء الصخري (الصلب) من سطح الأرض القشرة الأرضية، ويتضمّن القارات وقيعان المحيطات.', state: 'صلب' }
  ];
  let gap = Math.PI / 2;
  const shells = new THREE.Group(), faces = new THREE.Group(); root.add(shells, faces);
  const mats = L.map((l, i) => i === L.length - 1 ? mat('#ffffff', { map: earthTex, roughness: .8 }) : mat(l.col, { roughness: .6, emissive: l.col, emissiveIntensity: i < 2 ? .35 : .12 }));
  const faceMats = L.map(l => mat(l.col, { side: THREE.DoubleSide, roughness: .7, emissive: l.col, emissiveIntensity: .15 }));
  const layerObjs = L.map(() => []);
  function build() {
    shells.clear(); faces.clear(); layerObjs.forEach(a => a.length = 0);
    const ph0 = .3;
    L.forEach((l, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(l.r, 72, 48, ph0 + gap, Math.PI * 2 - gap), mats[i]); shells.add(s); layerObjs[i].push(s);
      const rin = i ? L[i - 1].r : 0;
      for (const ph of [ph0, ph0 + gap]) { const f = new THREE.Mesh(new THREE.RingGeometry(rin, l.r, 64, 1, -Math.PI / 2, Math.PI), faceMats[i]); f.rotation.y = Math.PI - ph - Math.PI / 2 + Math.PI / 2; f.rotation.y = Math.PI + ph; faces.add(f); layerObjs[i].push(f); }
    });
    // الحدّ بين الستار والقشرة: نسيج
    if (parts) { L.forEach((l, i) => parts[i].objs = layerObjs[i]); parts.find(p => p.id === 'litho').objs = [...layerObjs[4], ...layerObjs[3]]; parts.find(p => p.id === 'astheno').objs = [...layerObjs[2]]; }
  }
  const atm = mesh(new THREE.SphereGeometry(3.35, 48, 32), new THREE.MeshStandardMaterial({ color: '#8fd0ff', transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide }));
  root.add(atm);
  const hydro = mesh(new THREE.SphereGeometry(3.02, 64, 48, .3 + Math.PI / 2, Math.PI * 1.5), mat('#2a72c8', { transparent: true, opacity: .0 }));
  const probe = mesh(new THREE.SphereGeometry(.12, 16, 12), mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: .7 })); probe.visible = false; root.add(probe);
  let parts = null;
  parts = [
    ...L.map((l, i) => ({ id: l.id, name: l.name, info: l.info + (l.state ? `\nحالته: ${l.state}.` : ''), objs: [], at: anchor(root, [0, 0, 0]) })),
    { id: 'hydro', name: 'الغلاف المائي', info: 'أمّا الغلاف المائي فيشمل المياه في الحالتين: الصلبة والسائلة، ومنها المحيطات والأنهار والبحيرات والجليديات. ويغطّي الماء حوالي ٧/١٠ من سطح الأرض.', objs: [proxy(root, [-1.4, 1.2, -2.4], [1.2, 1.2, .4])], at: anchor(root, [-1.4, 1.9, -2.5]) },
    { id: 'atm', name: 'الغلاف الجوي', info: 'يحيط بالأرض غطاء غازي يسمّى الغلاف الجوي، ويحوي جميع الغازات الموجودة على سطح الأرض.', objs: [atm], at: anchor(root, [-2.1, 2.6, 0]) },
    { id: 'litho', name: 'الغلاف الصخري', info: 'يتكوّن الغلاف الصخري للأرض من القشرة الأرضية وجزء من الستار العلوي.', objs: [], at: anchor(root, [0, 0, 0]), hidden: () => true },
    { id: 'astheno', name: 'الغلاف المائع', info: 'يلي الغلاف الصخري طبقة من الصخور المنصهرة أُطلق عليها الغلاف المائع.', objs: [], at: anchor(root, [0, 0, 0]), hidden: () => true }
  ];
  // مواضع الأسماء على وجه القطع
  const labelR = [.45, 1.35, 2.2, 2.78, 3.0];
  function placeLabels() { const ph = .3; const mids = [.45, 1.35, 2.18, 2.76, 2.96]; const betas = [-.1, .25, .55, .9, 1.2]; L.forEach((l, i) => { const r = mids[i], b = betas[i]; parts[i].at.position.set(-Math.cos(ph) * r * Math.cos(b), r * Math.sin(b), Math.sin(ph) * r * Math.cos(b)); }); }
  build(); placeLabels();
  root.rotation.x = .25;
  let depth = -1;
  return {
    root, parts,
    update(dt) { shells.rotation.y = faces.rotation.y = 0; },
    cam: { pos: [-6.5, 3.2, 7.5], target: [0, 0, 0] }, inpage: { pos: [-6, 2.6, 7.8], target: [0, 0, 0] },
    controls: [
      { type: 'slider', label: 'حجم القطع في الأرض', min: 10, max: 180, step: 5, value: 90, fmt: v => ar(v) + '°', on: v => { gap = v / 180 * Math.PI; build(); placeLabels(); api.refreshParts(); } },
      { type: 'slider', label: 'انزل نحو مركز الأرض', min: 0, max: 100, step: 1, value: 0, fmt: v => v ? (v < 3 ? 'القشرة' : v < 14 ? 'الستار العلوي' : v < 42 ? 'الستار السفلي' : v < 70 ? 'اللب الخارجي' : 'اللب الداخلي') : 'السطح', on: v => {
        const r = 3 * (1 - v / 100); const ph = .3 + gap / 2; probe.visible = v > 0; probe.position.set(-Math.cos(ph) * r, 0, Math.sin(ph) * r);
        const k = L.findIndex(l => r <= l.r + 1e-6); const l = L[k < 0 ? 4 : k]; const name = l.name; if (name !== depth) { depth = name; api.toast(`أنت الآن في: ${name}${l.state ? ' — ' + l.state : ''}`); } } },
      { type: 'button', label: 'أخفِ الغلاف الجوي', toggle: true, on: on => { atm.visible = !on; } }
    ],
    quiz: [
      { q: 'المس النطاق السائل من لبّ الأرض.', a: 'outer' },
      { q: 'المس الجزء الصخري الصلب من سطح الأرض.', a: 'crust' },
      { q: 'المس النطاق الصلب في مركز الأرض.', a: 'inner' },
      { q: 'المس الطبقة التي تلي القشرة مباشرة.', a: 'upper' },
      { q: 'المس الغطاء الغازي الذي يحيط بالأرض.', a: 'atm' }
    ]
  };
}

/* ───────────── ص ١٥١: حركة الصفائح ───────────── */
let _mtnM = null;
export function platesModel(api) {
  const root = new THREE.Group();
  const D = 4, TH = .7;
  const asth = mesh(new THREE.BoxGeometry(14, 1.6, D), mat('#c8442a', { roughness: .7, emissive: '#7a1a0a', emissiveIntensity: .35, bumpMap: tissueBump('vein', 14), bumpScale: 2 }), [0, -1.5, 0]); root.add(asth);
  const plateTex = strataTexture([['#7a5a3a', 1], ['#9a7a52', 1], ['#6a4a2e', 1]]);
  function plate(w) { const g = new THREE.Group(); const b = mesh(new THREE.BoxGeometry(w, TH, D), [mat('#fff', { map: plateTex }), mat('#fff', { map: plateTex }), mat('#6aa04a'), mat('#6a4a2e'), mat('#fff', { map: plateTex }), mat('#fff', { map: plateTex })]); g.add(b); g.userData.body = b;
    const tg = new THREE.PlaneGeometry(w, D, 90, 50); tg.rotateX(-Math.PI / 2); { const P = tg.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color(); for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), e = Math.min(1, (w / 2 - Math.abs(x)) * 4, (D / 2 - Math.abs(z)) * 4); const h = Math.max(0, fbm3(x * .7 + w, 0, z * .7) * .28 + .05) * Math.max(0, e); P.setY(i, h); c.set('#6c9a46').lerp(new THREE.Color('#9a8a5a'), THREE.MathUtils.clamp(h * 4, 0, 1) * .6).lerp(new THREE.Color('#4f7a34'), Math.max(0, fbm3(x * 3, 1, z * 3)) * .8); col.set([c.r, c.g, c.b], i * 3); } tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals(); }
    const top = new THREE.Mesh(tg, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .9, bumpMap: tissueBump('pore', 15), bumpScale: 3 })); top.position.y = TH / 2 + .005; top.receiveShadow = true; g.add(top); return g; }
  const L = plate(5.6), R = plate(5.6); root.add(L, R); L.position.y = R.position.y = -.35;
  const magmaM = mat('#ff5a1a', { emissive: '#ff3a00', emissiveIntensity: .9, roughness: .4 });
  const magma = mesh(new THREE.BoxGeometry(1, 1, D), magmaM); root.add(magma);
  const ocean = mesh(new THREE.BoxGeometry(1, 1, D), glass('#2f86c9', .7)); root.add(ocean);
  const floorM = mat('#5a5a6a'); const floor = mesh(new THREE.BoxGeometry(1, .2, D), floorM); root.add(floor);
  const mtn = [L, R].map(p => { const m = new THREE.Group(); for (let i = 0; i < 6; i++) m.add(mesh(organGeo(1, v => { const y = v.y; v.y = (v.y + 1) / 2 - .5; const r = (.5 - v.y) * (1 + fbm3(v.x * 3 + i, v.y * 3, v.z * 3) * .35); v.x *= r * (.55 + i % 3 * .1); v.z *= r * (.55 + i % 3 * .1); }, 32, 24), _mtnM || (_mtnM = mat('#7e7060', { bumpMap: tissueBump('vein', 16), bumpScale: 5, roughness: .95 })), [0, 0, -D / 2 + .4 + i * .65])); p.add(m); return m; });
  const arrows = [L, R].map((p, k) => { const a = mesh(new THREE.ConeGeometry(.22, .6, 12), mat('#e8323a'), [0, TH / 2 + .35, D / 2 - .5], [0, 0, k ? -Math.PI / 2 : Math.PI / 2]); p.add(a); return a; });
  const conv = new Flow(root, '#ffb070', .07, 120); conv.rate = 6;
  for (const s of [-1, 1]) conv.addPath(curve([[0, -2.2, 0], [0, -.8, 0], [s * 2.5, -.95, .3], [s * 5, -1.6, .3], [s * 4, -2.25, 0], [s * 1, -2.25, 0], [0, -2.2, 0]]), .1);
  let t = 2, conv2 = false;
  function apply() {
    const sep = conv2 ? 0 : t * .32; const half = sep / 2;
    L.position.x = -(2.8 + half); R.position.x = 2.8 + half;
    magma.visible = !conv2 && t > .2; const mh = conv2 ? 0 : clamp(t / 1.2) * .9; magma.scale.set(Math.max(.15, sep * .9 + .15), Math.max(.01, mh), 1); magma.position.set(0, -.7 + mh / 2 - .45, 0);
    const oc = !conv2 && sep > .6; ocean.visible = floor.visible = oc; ocean.scale.set(sep, .6, 1); ocean.position.set(0, -.2, 0); floor.scale.set(sep, 1, 1); floor.position.set(0, -.55, 0);
    const mH = conv2 ? clamp(t / 6) * 2.6 : clamp((t - 4) / 6) * 1.8; mtn.forEach((m, k) => { m.visible = mH > .05; m.position.set(k ? 2.4 : -2.4, TH / 2 + mH / 2 - .05, 0); m.scale.set(1, Math.max(.01, mH), 1); });
    if (conv2) { L.position.x = -(2.8 - clamp(t / 6) * .3); R.position.x = 2.8 - clamp(t / 6) * .3; mtn[0].position.x = 2.4; mtn[1].visible = false; }
    arrows[0].rotation.z = conv2 ? -Math.PI / 2 : Math.PI / 2; arrows[1].rotation.z = conv2 ? Math.PI / 2 : -Math.PI / 2;
  }
  apply();
  const parts = [
    { id: 'litho', name: 'الغلاف الصخري', info: 'يتكوّن الغلاف الصخري للأرض من القشرة الأرضية وجزء من الستار العلوي. وينقسم الغلاف الصخري الصلب إلى ألواح ضخمة تسمّى صفائح.', objs: [L.userData.body, R.userData.body], at: anchor(L, [-1.2, TH / 2 + .1, D / 2 - .3]) },
    { id: 'astheno', name: 'الغلاف المائع', info: 'يلي الغلاف الصخري طبقة من الصخور المنصهرة أُطلق عليها الغلاف المائع. ولأن الغلاف المائع يتكوّن من مواد منصهرة تسمّى الصهارة (الماجما) فإنه يشكّل سطحًا لزجًا يتيح للصفائح الانزلاق فوقه.', objs: [asth], at: anchor(root, [-4.5, -1.2, D / 2]) },
    { id: 'magma', name: 'اندفاع الصهارة', info: 'إذا اندفعت الصهارة بين صفيحتين فإنهما تنزلقان مبتعدة إحداهما عن الأخرى.', objs: [magma], at: anchor(root, [0, -.4, D / 2]), hidden: () => conv2 || t < .3 },
    { id: 'rift', name: 'الصدع', info: 'أطلق العلماء اسم الصدع على الحد الذي يفصل الصفيحتين.', objs: [proxy(root, [0, 0, 0], [.6, 1.2, D])], at: anchor(root, [0, .5, -D / 2 + .3]) },
    { id: 'ocean', name: 'المحيط', info: 'تأخذ منطقة الصدع في الاتساع لتشكّل عبر ملايين السنين محيطًا صغيرًا يستمر في الاتساع مع الزمن.', objs: [ocean], at: anchor(root, [0, .2, D / 2 - .2]), hidden: () => conv2 || t * .32 < .6 },
    { id: 'mtn', name: 'مناطق جبلية', info: 'أما في الجهة الثانية فتقترب الصفيحة المنزلقة من صفائح أخرى، وقد تنثني لتشكّل مناطق جبلية.', objs: mtn.flatMap(m => m.children), at: anchor(root, [3.6, 1.6, 0]), hidden: () => !mtn[0].visible }
  ];
  const steps = [
    { t: '(١) اندفاع الصهارة', d: 'تندفع الصهارة من الغلاف المائع إلى الحد بين صفيحتين.', v: 1 },
    { t: '(٢) تباعد الصفيحتين وتكوّن المحيط', d: 'تنزلق الصفيحتان مبتعدة إحداهما عن الأخرى، وتأخذ منطقة الصدع في الاتساع لتشكّل محيطًا صغيرًا.', v: 4 },
    { t: '(٣) تتسع المحيطات وتتكوّن الجبال', d: 'تندفع الصهارة بين الصفائح، فتتسع المحيطات وتتكوّن الجبال.', v: 10 }
  ];
  return {
    root, parts,
    update(dt) { conv.update(dt); magmaM.emissiveIntensity = .7 + .3 * Math.sin(performance.now() / 300); },
    cam: { pos: [0, 4.2, 10.5], target: [0, -.6, 0] }, inpage: { pos: [0, 3.2, 10], target: [0, -.6, 0] },
    controls: [
      { type: 'steps', steps, value: -1, on: i => { conv2 = false; t = steps[i].v; apply(); api.setControl(1, t); api.refreshParts(); } },
      { type: 'slider', label: 'ملايين السنين', min: 0, max: 10, step: .5, value: 2, fmt: v => `${ar(v)} — اتساع ≈ ${fmtNum(v * 20)} كم`, on: v => { t = v; apply(); } },
      { type: 'seg', label: 'نوع الحركة', options: ['تباعد', 'تقارب'], value: 0, on: i => { conv2 = !!i; apply(); api.toast(i ? 'تقترب الصفيحة المنزلقة من صفيحة أخرى وتنثني لتشكّل مناطق جبلية.' : 'تتحرك شبه الجزيرة العربية نحو الشمال الشرقي، فيتسع البحر الأحمر تدريجيًّا بمعدل ٢ سم كل سنة؛ أي نحو ٢٠ كم كل مليون سنة.'); } }
    ],
    quiz: [
      { q: 'المس الحد الذي يفصل الصفيحتين.', a: 'rift' },
      { q: 'المس الطبقة اللزجة التي تنزلق فوقها الصفائح.', a: 'astheno' },
      { q: 'المس الصفائح (الغلاف الصخري).', a: 'litho' },
      { q: 'المس ما يدفع الصفيحتين للتباعد.', a: 'magma' }
    ]
  };
}

/* ───────────── ص ١٥٧: البؤرة والمركز السطحي والصدع ───────────── */
export function quakeModel(api) {
  const root = new THREE.Group();
  const W = 9, D = 6;
  const halves = [];
  const st = strataTexture([['#b8885a', 1], ['#c99a6a', 1], ['#a87a4a', 1]]);
  const hq = (x, z) => 1.0 + 1.6 * Math.exp(-((x - .4) ** 2 + (z) ** 2 / 4) / 2) * (fbm(x * .8, z * .8) + .4) + (fbm(x * 2, z * 2) - .5) * .3;
  for (const s of [-1, 1]) {
    const h = hq;
    const g = terrain({ w: W, d: D / 2, nx: 100, nz: 40, h: (x, z) => h(x, z + s * D / 4), color: (x, z, y) => y > 2.4 ? '#c9b26a' : y > 1.6 ? '#7a9a3a' : '#5f8a35', bottom: -4, top: 3, sideTex: st });
    g.position.z = s * D / 4; root.add(g); halves.push(g);
  }
  const fault = mesh(new THREE.PlaneGeometry(W, 5.4), mat('#5a3a20', { side: 2, transparent: true, opacity: .55 }), [0, -1.3, 0]); root.add(fault);
  const faultLine = mesh(new THREE.BoxGeometry(.05, 5.6, .03), mat('#2a1a0a'), [.4, -1.3, D / 2 + .02], [0, 0, .12]); root.add(faultLine);
  const houses = []; for (const [x, z] of [[-3, -1.8], [-2, 2], [2.4, -2.1], [3.3, 1.6]]) { const hs = house(.45); hs.position.set(x, 1.15, z); root.add(hs); houses.push(hs); }
  let depth = 5, mag = 6, energy = 0, pushing = false, quakeT = -1;
  const focus = mesh(new THREE.OctahedronGeometry(.2), mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: .9 })); root.add(focus);
  const epi = mesh(new THREE.OctahedronGeometry(.18), mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: .9 })); root.add(epi);
  const dash = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: '#ff3030', dashSize: .15, gapSize: .1 })); root.add(dash);
  const waves = []; for (let i = 0; i < 5; i++) { const w = mesh(new THREE.TorusGeometry(1, .035, 6, 80), new THREE.MeshBasicMaterial({ color: '#ff5a2a', transparent: true, opacity: 0, depthWrite: false })); w.visible = false; root.add(w); waves.push(w); }
  const arrowsG = new THREE.Group(); root.add(arrowsG);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; const ar2 = new THREE.Group(); ar2.add(mesh(new THREE.CylinderGeometry(.05, .05, .9, 8), mat('#e8323a'), [0, .45, 0]), mesh(new THREE.ConeGeometry(.14, .3, 10), mat('#e8323a'), [0, 1.0, 0])); ar2.rotation.z = a; arrowsG.add(ar2); }
  const meter = mesh(new THREE.BoxGeometry(.3, 1, .3), mat('#ffb020', { emissive: '#ff8a00', emissiveIntensity: .5 }), [W / 2 + .5, 0, D / 2 - .3]); root.add(meter);
  const meterFrame = mesh(new THREE.BoxGeometry(.4, 3.1, .4), glass('#ffffff', .25), [W / 2 + .5, 0, D / 2 - .3]); root.add(meterFrame);
  const FZ = D / 2 + .03;
  function place() { const y = -.3 - depth * .35; focus.position.set(.4, y, FZ); epi.position.set(.4, hq(.4, D / 4) + .12, FZ); dash.geometry.setFromPoints([focus.position, epi.position]); dash.computeLineDistances(); arrowsG.position.copy(focus.position); }
  place();
  function trigger() { quakeT = 0; energy = 0; }
  const parts = [
    { id: 'fault', name: 'الصدع', info: 'تحدث الزلازل بقدرة الله عزّ وجلّ في مناطق الصدوع. تتحرك الصفائح الأرضية بثبات وبطء، فإذا حدث وتوقفت صفيحتان متجاورتان عن الحركة نتيجة تماسّهما في منطقة محددة نشأ عن ذلك طاقة مختزنة تستمر في الازدياد.', objs: [fault, faultLine], at: anchor(root, [-3.8, 1.4, 0]) },
    { id: 'focus', name: 'بؤرة الزلزال', info: 'يسمّى موقع حدوث الزلزال تحت سطح الأرض بؤرة الزلزال. وتنتشر الأمواج الزلزالية من بؤرة الزلزال في جميع الاتجاهات.', objs: [focus], at: anchor(focus, [0, .25, .3]) },
    { id: 'epi', name: 'المركز السطحي', info: 'عندما تصل الأمواج الزلزالية إلى سطح الأرض فإنها تنتشر من نقطة تقع أعلى البؤرة مباشرة؛ هذه النقطة تسمّى المركز السطحي للزلزال.', objs: [epi], at: anchor(epi, [0, .25, 0]) },
    { id: 'waves', name: 'الأمواج الزلزالية', info: 'عندما تصبح الطاقة أكبر من قدرة الصخور على التحمل تتكسّر صخور منطقة التماس، وتتحرّر الصفائح متحركة بشكل سريع ومفاجئ، وتنطلق الطاقة المختزنة على شكل أمواج عنيفة تسبّب اهتزاز القشرة الأرضية. تسمّى الأمواج المسبّبة له الأمواج الزلزالية.', objs: arrowsG.children.flatMap(a => a.children), at: anchor(arrowsG, [1.1, 0, .3]) },
    { id: 'energy', name: 'الطاقة المختزنة', info: 'تستمر الطاقة المختزنة في الازدياد حتى تصل إلى حدٍّ معيّن تصبح الطاقة عنده أكبر من قدرة الصخور على التحمل.', objs: [meter, meterFrame], at: anchor(root, [W / 2 + .5, 1.8, D / 2 - .3]) }
  ];
  return {
    root, parts,
    update(dt, t) {
      if (pushing && quakeT < 0) { energy += dt * .22; halves[0].position.x = -energy * .15; halves[1].position.x = energy * .15; if (energy >= 1) trigger(); }
      meter.scale.y = Math.max(.01, energy * 3); meter.position.y = -1.5 + energy * 1.5;
      if (quakeT >= 0) {
        quakeT += dt; const k = quakeT;
        if (k < .15) { halves[0].position.x = lerp(halves[0].position.x, .35, .5); halves[1].position.x = lerp(halves[1].position.x, -.35, .5); }
        const amp = Math.pow(1.6, mag - 5) * .03 * Math.max(0, 1 - k / 3);
        root.position.set(Math.sin(t * 60) * amp, Math.sin(t * 47) * amp * .5, Math.cos(t * 53) * amp);
        houses.forEach((hs, i) => { hs.rotation.z = Math.sin(t * 40 + i) * amp * 3; if (mag >= 7 && k > 1) hs.rotation.x = Math.min(1.3, (k - 1) * 1.2) * (i % 2 ? 1 : -1); });
        waves.forEach((w, i) => { const r = (k * 3 - i * .7); w.visible = r > 0 && r < 7; w.position.copy(focus.position); w.scale.setScalar(Math.max(.01, r)); w.material.opacity = .9 * (1 - r / 7); });
        if (k > 3.5) { quakeT = -1; root.position.set(0, 0, 0); waves.forEach(w => w.visible = false); pushing && (energy = 0); }
      }
      arrowsG.children.forEach((a, i) => a.scale.setScalar(1 + .15 * Math.sin(t * 4 + i)));
    },
    cam: { pos: [6.5, 5, 9], target: [0, -.4, 0] }, inpage: { pos: [-5.5, 4, 9], target: [0, -.4, 0] },
    controls: [
      { type: 'button', label: 'حرّك الصفيحتين (اختزان الطاقة)', toggle: true, on: on => { pushing = on; if (on) api.toast('الصفيحتان متماسّتان: تزداد الطاقة المختزنة… راقب المؤشّر.'); } },
      { type: 'button', label: 'أحدث الزلزال الآن', on: trigger },
      { type: 'slider', label: 'عمق البؤرة', min: 1, max: 10, step: 1, value: 5, fmt: v => v <= 3 ? 'قريبة من السطح' : v <= 7 ? 'متوسطة' : 'عميقة', on: v => { depth = v; place(); } },
      { type: 'slider', label: 'قوة الزلزال (مقياس رختر)', min: 2, max: 9, step: 1, value: 6, fmt: v => v > 5 ? `${ar(v)} — طاقته ${fmtNum(Math.pow(30, v - 5))} ضعف زلزال قوته ٥` : v < 5 ? `${ar(v)} — أضعف من زلزال قوته ٥` : ar(5), on: v => { mag = v; } }
    ],
    quiz: [
      { q: 'المس موقع حدوث الزلزال تحت سطح الأرض.', a: 'focus' },
      { q: 'المس النقطة على سطح الأرض التي تقع أعلى البؤرة مباشرة.', a: 'epi' },
      { q: 'المس الصدع.', a: 'fault' }
    ]
  };
}

/* ───────────── ص ١٥٨: تحديد المركز السطحي للزلزال ───────────── */
export function epicenterModel(api) {
  const root = new THREE.Group();
  const MW = 10.8, MD = 7.74, S = .01; // ١ وحدة = ١٠٠ بكسل على الخريطة
  const tex = new THREE.TextureLoader().load((window.__IMG && window.__IMG['pages/map158.webp']) || 'pages/map158.webp'); tex.colorSpace = THREE.SRGBColorSpace;
  const board = mesh(new THREE.BoxGeometry(MW, .3, MD), [mat('#8a6a46'), mat('#8a6a46'), mat('#fff', { map: tex, roughness: .9 }), mat('#5a4030'), mat('#8a6a46'), mat('#8a6a46')], [0, -.15, 0]); root.add(board);
  const KM = 4.13; // كم لكل بكسل تقريبًا
  const P = (px, py) => V((px - 540) * S, 0, (py - 387) * S);
  const E = P(369, 446);
  const st = [
    { id: 's1', name: 'المحطة ١ (الرياض)', pos: P(575, 461), col: '#2e9a4a' },
    { id: 's2', name: 'المحطة ٢ (بغداد)', pos: P(515, 235), col: '#3a5ad0' },
    { id: 's3', name: 'المحطة ٣ (عمّان)', pos: P(331, 277), col: '#8a4a1a' }
  ];
  st.forEach(s => { s.true = Math.round(s.pos.distanceTo(E) / S * KM / 10) * 10; s.r = 0;
    s.pin = new THREE.Group(); s.pin.position.copy(s.pos); s.pin.add(mesh(new THREE.CylinderGeometry(.03, .03, .7, 8), mat('#333'), [0, .35, 0]), mesh(new THREE.SphereGeometry(.13, 16, 12), mat(s.col, { emissive: s.col, emissiveIntensity: .3 }), [0, .72, 0])); root.add(s.pin);
    s.ring = mesh(new THREE.TorusGeometry(1, .025, 8, 160), mat(s.col, { emissive: s.col, emissiveIntensity: .5 }), [s.pos.x, .03, s.pos.z], [Math.PI / 2, 0, 0]); s.ring.visible = false; root.add(s.ring); });
  const star = mesh(new THREE.OctahedronGeometry(.16), mat('#ff2020', { emissive: '#ff0000', emissiveIntensity: 1 }), [E.x, .25, E.z]); star.visible = false; root.add(star);
  const waves = [0, 1, 2].map(() => { const w = mesh(new THREE.TorusGeometry(1, .03, 6, 120), new THREE.MeshBasicMaterial({ color: '#ff5030', transparent: true, opacity: .8 }), [E.x, .04, E.z], [Math.PI / 2, 0, 0]); w.visible = false; root.add(w); return w; });
  let solved = false, wt = -1;
  function check() { const ok = st.every(s => Math.abs(s.r - s.true) <= 30); if (ok && !solved) { solved = true; star.visible = true; api.toast('أحسنت! نقطة تقاطع الدوائر الثلاث هي المركز السطحي للزلزال.'); api.refreshParts(); } if (!ok && solved) { solved = false; star.visible = false; } }
  const parts = [
    ...st.map(s => ({ id: s.id, name: s.name, info: 'محطة رصد تسجّل الأمواج الزلزالية بجهاز يسمّى السيزموجراف (السيزمومتر). ويُحسب من زمن وصول الأمواج إليها بُعدها عن المركز السطحي للزلزال.', objs: s.pin.children, at: anchor(s.pin, [0, .95, 0]) })),
    { id: 'epi', name: 'المركز السطحي للزلزال', info: 'نرسم على الخريطة لكلٍّ من مواقع المحطات الثلاث دائرة مركزها موقع المحطة، ونصف قطرها المسافة التي قطعتها الأمواج الزلزالية، فتكون نقطة تقاطع هذه الدوائر الثلاث المركز السطحي للزلزال.', objs: [star], at: anchor(star, [0, .3, 0]), hidden: () => !solved },
    { id: 'redsea', name: 'البحر الأحمر', info: 'يتسع البحر الأحمر تدريجيًّا بسبب حركة الصفيحة العربية نحو الشمال الشرقي، وتقع على امتداده مناطق نشاط زلزالي.', objs: [proxy(root, [P(330, 470).x, .05, P(330, 470).z], [.5, .1, 1.6])], at: anchor(root, [P(320, 520).x, .2, P(320, 520).z]) }
  ];
  return {
    root, parts,
    update(dt) {
      st.forEach(s => { s.ring.visible = s.r > 0; s.ring.scale.setScalar(Math.max(.001, s.r / KM * S)); });
      if (wt >= 0) { wt += dt; waves.forEach((w, i) => { const r = (wt - i * .25) * 1.6; w.visible = r > 0 && r < 3; w.scale.setScalar(Math.max(.01, r)); w.material.opacity = .8 * (1 - r / 3); }); st.forEach(s => { const d = s.pos.distanceTo(E); const hit = wt * 1.6 > d && wt * 1.6 < d + .3; s.pin.children[1].scale.setScalar(hit ? 1.8 : 1); }); if (wt > 3) { wt = -1; waves.forEach(w => w.visible = false); } }
      star.rotation.y += dt * 2;
    },
    cam: { pos: [0, 8.5, 6], target: [0, 0, .3] }, inpage: { pos: [0, 9, 4], target: [0, 0, .2] },
    controls: [
      { type: 'button', label: 'أطلق زلزالًا (لاحظ وصول الأمواج)', on: () => { wt = 0; api.toast('تصل الأمواج أولًا إلى أقرب محطة ثم إلى الأبعد؛ ومن زمن الوصول تُحسب المسافة.'); } },
      ...st.map((s, i) => ({ type: 'slider', label: `دائرة ${s.name} — البعد المرصود ${fmtNum(s.true)} كم`, min: 0, max: 1500, step: 10, value: 0, fmt: v => fmtNum(v) + ' كم', on: v => { s.r = v; check(); } }))
    ],
    quiz: [
      { q: 'المس المحطة التي في الرياض.', a: 's1' },
      { q: 'المس المحطة التي في بغداد.', a: 's2' },
      { q: 'المس المحطة التي في عمّان.', a: 's3' }
    ]
  };
}

/* ───────────── ص ١٥٩: التسونامي ───────────── */
export function tsunamiModel(api) {
  const root = new THREE.Group();
  const W = 14, D = 4;
  const floorY = x => x < 3 ? lerp(-3.2, -.6, smooth(-6, 3, x)) - .3 * Math.exp(-((x + 4) ** 2) / .5) : lerp(-.6, .5, smooth(3, 4.5, x));
  const st = strataTexture([['#8a6a46', 1], ['#a3825a', 1], ['#c9a878', 1]]);
  const ground = terrain({ w: W, d: D, nx: 160, nz: 20, h: (x, z) => floorY(x) + (fbm(x, z) - .5) * .1, color: (x, z, y) => y > .35 ? '#7aa84a' : y > -.1 ? '#e8d6a0' : '#c2ad80', bottom: -4, top: 1, sideTex: st }); root.add(ground);
  for (const [x, z] of [[5.3, -1.3], [5.8, .4], [6.4, -.6], [5.6, 1.4], [6.6, 1.1]]) { const p = new THREE.Group(); p.add(tube([[0, 0, 0], [.08, .7, 0], [.18, 1.3, 0]], .05, mat('#8a6a3a'), 10, 5)); for (let k = 0; k < 6; k++) p.add(mesh(new THREE.ConeGeometry(.12, .8, 4), mat('#3f8f32'), [.18 + Math.cos(k) * .3, 1.3, Math.sin(k) * .3], [Math.sin(k) * 1.2, 0, Math.cos(k) * 1.2 + 1.57])); p.position.set(x, floorY(x), z); root.add(p); }
  const huts = []; for (const [x, z] of [[4.6, .9], [4.9, -.9]]) { const hs = house(.4); hs.position.set(x, floorY(x), z); root.add(hs); huts.push(hs); }
  const nx = 200; const wg = new THREE.PlaneGeometry(W, D, nx, 6); wg.rotateX(-Math.PI / 2);
  const base = wg.attributes.position.array.slice();
  const water = mesh(wg, mat('#2f9fc0', { transparent: true, opacity: .8, roughness: .1, side: 2 })); root.add(water);
  const body = mesh(new THREE.BoxGeometry(9.5, 1, D), glass('#2f86c9', .35), [-2.25, -1.6, 0]); body.scale.y = 3.2; root.add(body);
  const focus = mesh(new THREE.OctahedronGeometry(.2), mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: .9 }), [-4, floorY(-4) - .6, 0]); root.add(focus);
  const rings = [0, 1, 2].map(() => { const r = mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: '#ff6a3a', transparent: true, opacity: 0, depthWrite: false })); r.visible = false; root.add(r); return r; });
  const epi = mesh(new THREE.OctahedronGeometry(.15), mat('#ff2a2a', { emissive: '#ff0000', emissiveIntensity: .9 }), [-4, .25, 0]); root.add(epi);
  let strength = 6, distKm = 1000, wt = -1, x0 = -4;
  const depthAt = x => Math.max(.05, -floorY(x));
  function trigger() { wt = 0; huts.forEach(h => h.rotation.set(0, 0, 0)); }
  const parts = [
    { id: 'focus', name: 'بؤرة الزلزال', info: 'عند حدوث الزلازل في قاع المحيط تتحرك الأمواج في جميع الاتجاهات بسرعة عالية جدًّا.', objs: [focus], at: anchor(focus, [0, .3, .4]) },
    { id: 'epi', name: 'المركز السطحي للزلزال', info: 'المركز السطحي للزلزال نقطة تقع أعلى البؤرة مباشرة.', objs: [epi], at: anchor(epi, [0, .3, 0]) },
    { id: 'wave', name: 'موجات تسونامي', info: 'تتحرك الأمواج بسرعة عالية جدًّا تتراوح بين ٥٠٠ و ١٠٠٠ كيلومتر في الساعة، حاملة معها طاقة هائلة القوة، وعند اقترابها من السواحل والمناطق القريبة من الشاطئ حيث المياه الضحلة، يصبح حجم المياه التي تتحرك بفعل الطاقة الزلزالية أقل كثيرًا مما كانت عليه في عمق المحيط، فيزداد ارتفاع الأمواج بشكل مفاجئ، وتتحول إلى أمواج عملاقة تصطدم بالشاطئ وتسبّب الدمار. وتسمّى هذه الأمواج التسونامي.', objs: [water], at: anchor(root, [-1, .9, -D / 2 + .3]) },
    { id: 'shore', name: 'الشاطئ', info: 'المياه الضحلة قرب الشاطئ تجعل ارتفاع الموجة يزداد بشكل مفاجئ.', objs: [proxy(root, [4.2, .3, 0], [1.6, .5, D])], at: anchor(root, [4.2, .7, D / 2 - .3]) }
  ];
  return {
    root, parts,
    update(dt, t) {
      const p = wg.attributes.position; let crest = -99;
      if (wt >= 0) { wt += dt; crest = x0; let x = x0, tt = 0; while (tt < wt && x < 6) { x += Math.sqrt(depthAt(x)) * .9 * .02 / .02 * .02 * 1.8; tt += .02; } crest = x; }
      for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; let y = .04 * Math.sin(x * 3 + t * 2 + z);
        if (wt >= 0) { const d = depthAt(x), A0 = strength * .05, A = A0 * Math.pow(3.2 / d, .55), L = .5 + Math.sqrt(d) * .55; const u = (x - crest) / L; y += A * Math.exp(-u * u) * (x < crest + .1 ? 1 : 1) * Math.min(1, wt * 2); if (x > 3.6 && crest > 3.6) y = Math.max(y, -floorY(x) * 0 + floorY(x) + A * .6 * Math.exp(-((((x - crest) / 1.2)) ** 2))) ; }
        if (x > 3.8) y = Math.max(y, floorY(x) - .02) - (wt < 0 ? .3 : 0);
        p.setY(i, y); }
      p.needsUpdate = true; wg.computeVertexNormals();
      rings.forEach((r, i) => { const k = wt >= 0 ? wt * 2 - i * .4 : -1; r.visible = k > 0 && k < 2.5; r.position.copy(focus.position); r.scale.setScalar(Math.max(.01, k)); r.material.opacity = .45 * (1 - k / 2.5); });
      if (wt >= 0 && crest > 4.3 && strength >= 5) huts.forEach((h, i) => h.rotation.z = -Math.min(1.4, (crest - 4.3) * 1.5));
      if (wt > 9) wt = -1;
    },
    cam: { pos: [-1, 4, 10.5], target: [0, -.6, 0] }, inpage: { pos: [-.5, 2.6, 10.5], target: [0, -.7, 0] },
    controls: [
      { type: 'button', label: 'أحدث زلزالًا في قاع المحيط', on: trigger },
      { type: 'slider', label: 'قوة الزلزال', min: 1, max: 10, step: 1, value: 6, fmt: v => v < 4 ? 'ضعيف' : v < 7 ? 'قوي' : 'قوي جدًّا', on: v => { strength = v; } },
      { type: 'slider', label: 'بُعد الزلزال عن الشاطئ (كم)', min: 100, max: 3000, step: 100, value: 1000, fmt: v => `${fmtNum(v)} كم — تصل الموجة خلال ${ar((v / 1000).toFixed(1))} إلى ${ar((v / 500).toFixed(1))} ساعة`, on: v => { distKm = v; } }
    ],
    quiz: [
      { q: 'المس بؤرة الزلزال في قاع المحيط.', a: 'focus' },
      { q: 'المس موجات التسونامي.', a: 'wave' },
      { q: 'المس المنطقة التي يزداد عندها ارتفاع الموجة بشكل مفاجئ.', a: 'shore' }
    ]
  };
}

/* ───────────── ص ١٦٠: مقطع عرضي في بركان ───────────── */
export function volcanoModel(api) {
  const root = new THREE.Group();
  let H = 3.2; const R = 4.6;
  const vol = new THREE.Group(); root.add(vol);
  const ground = mesh(new THREE.CylinderGeometry(7, 7, .3, 64, 1, false, Math.PI / 2, Math.PI), mat('#c9b8a0', { roughness: 1 }), [0, -.15, 0]); root.add(ground);
  const crust = mesh(new THREE.BoxGeometry(14, 3.2, .05), mat('#fff', { map: strataTexture([['#7a6a5a', 1], ['#9a8a76', 1], ['#7a6a5a', 1], ['#b0a08a', 1]]) }), [0, -1.9, 0]); root.add(crust);
  const chamber = mesh(new THREE.SphereGeometry(1, 32, 20), mat('#ff5a1a', { emissive: '#ff3a00', emissiveIntensity: .9 }), [0, -2.4, .04]); chamber.scale.set(2.6, .8, .05); root.add(chamber);
  const conduitM = mat('#ff6a1a', { emissive: '#ff4000', emissiveIntensity: .9, bumpMap: tissueBump('vein', 13), bumpScale: 2, roughness: .4 });
  let conduit, side, cone, face, sideCone;
  function build() {
    vol.clear();
    const prof = []; for (let i = 0; i <= 30; i++) { const t = i / 30; const r = lerp(R, .45, t); prof.push(new THREE.Vector2(r, H * Math.pow(t, .85) + (t > .97 ? -.15 : 0))); }
    const cg = new THREE.LatheGeometry(prof, 128, Math.PI / 2, Math.PI); { const P = cg.attributes.position, v = new THREE.Vector3(), col = new Float32Array(P.count * 3), c = new THREE.Color(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const r = Math.hypot(v.x, v.z), an = Math.atan2(v.z, v.x), edge = THREE.MathUtils.smoothstep(Math.abs(v.z) / Math.max(r, .01), 0, .2), hy = v.y / H; const k = 1 + edge * ((fbm3(v.x * .9, v.y * .9, v.z * .9) * .07) + Math.abs(Math.sin(an * 16 + fbm3(v.x, v.y, v.z) * 3)) * .035 * (1 - hy)); v.x *= k; v.z *= k; P.setXYZ(i, v.x, v.y, v.z);
      c.set('#8a7c6c').lerp(new THREE.Color('#5e544c'), THREE.MathUtils.smoothstep(hy, .45, .95)); if (hy < .35 && fbm3(v.x * 3, v.y * 3, v.z * 3) > .1) c.lerp(new THREE.Color('#6f7a4a'), .55); col.set([c.r, c.g, c.b], i * 3); } cg.setAttribute('color', new THREE.BufferAttribute(col, 3)); cg.computeVertexNormals(); }
    cone = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .95, side: 2, bumpMap: noiseTexture('#b8a892', '#5f5248', 3000, 256, 256, 3), bumpScale: 4 })); vol.add(cone);
    // وجه القطع بطبقات
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) { const X = (x / 512 * 2 - 1) * R, Y = (1 - y / 256) * H; const surf = H * Math.pow(clamp(1 - (Math.abs(X) - .45) / (R - .45)), 1 / .85); const d = surf - Y; const band = Math.floor(d / .22) % 2; g.fillStyle = d < 0 ? 'rgba(0,0,0,0)' : band ? '#9a8a78' : '#7a6c5e'; g.fillRect(x, y, 1, 1); }
    const ft = new THREE.CanvasTexture(c); ft.colorSpace = THREE.SRGBColorSpace;
    face = mesh(new THREE.PlaneGeometry(2 * R, H), new THREE.MeshStandardMaterial({ map: ft, transparent: true, alphaTest: .5, side: 2 }), [0, H / 2, 0]); vol.add(face);
    conduit = tube([[0, -2.2, .06], [.1, -.8, .06], [-.05, H * .5, .06], [0, H - .1, .06]], .22, conduitM, 30, 10); vol.add(conduit);
    side = tube([[.2, -.2, .07], [1.2, .6, .07], [2.3, H * .38, .07]], .12, conduitM, 20, 8); vol.add(side);
    sideCone = mesh(new THREE.ConeGeometry(.6, .5, 24, 1, true, Math.PI / 2, Math.PI), mat('#a89882', { side: 2 }), [2.3, H * .38 - .05, 0]); vol.add(sideCone);
  }
  build();
  const lava = new Flow(root, '#ff7a1a', .17, 200), ash = new Flow(root, '#5a5450', .26, 200), lavaFlow = new Flow(root, '#ff5a10', .15, 160);
  function paths() { lava.paths = []; ash.paths = []; lavaFlow.paths = []; for (let i = 0; i < 8; i++) { const a = (Math.random() - .5) * 2.4; lava.addPath(curve([[0, H, 0], [a * .5, H + 1.6 + Math.random(), Math.random() * .6], [a, H + .4, Math.random()]]), .7); ash.addPath(curve([[0, H, 0], [a * .3, H + 2, .2], [a * .8 + .8, H + 4.5, .3]]), .25); }
    for (const s of [-1, 1]) lavaFlow.addPath(curve([[0, H, .2], [s * 1.5, H * .65, 1.2], [s * 3.2, H * .25, 1.1], [s * 4.4, .1, .6]]), .18); ash.addPath(curve([[2.3, H * .38, 0], [2.8, H * .38 + 1.5, .2], [3.6, H * .38 + 3, .2]]), .3); }
  paths();
  let erupt = false, type = 0, count = 0;
  function setErupt(on) { erupt = on; [lava, ash, lavaFlow].forEach(f => { f.rate = on ? (f === ash ? 30 : 24) : 0; if (!on) f.clear(); }); }
  setErupt(false);
  function heat() { const k = type === 0 ? 1 : type === 1 ? .45 : 0; conduitM.emissiveIntensity = .9 * k; conduitM.color.set(k ? '#ff6a1a' : '#4a3a34'); chamber.material.emissiveIntensity = .9 * k; chamber.material.color.set(k ? '#ff5a1a' : '#5a4038'); }
  const parts = [
    { id: 'crater', name: 'فوهة البركان', info: 'البركان فتحة في القشرة الأرضية تخرج منها الصهارة والغازات والرماد البركاني إلى سطح الأرض. وعند حدوث انفجار بركاني تتراكم اللابة حول فوهة البركان، ويتكوّن شكل مخروطي تكون الفوهة في قمته.', objs: [proxy(root, [0, H, 0], [1.2, .5, 1.2])], at: anchor(root, [0, H + .5, 0]) },
    { id: 'vent2', name: 'فوهة جانبية', info: 'قد يكون للبركان أكثر من فوهة.', objs: [sideCone], at: anchor(root, [2.3, H * .38 + .45, 0]) },
    { id: 'chamber', name: 'مخزن الصهارة', info: 'مخزن الصهارة مكان تتجمع فيه الصهارة تحت البركان، ومنه تندفع إلى أعلى.', objs: [chamber], at: anchor(root, [-1.8, -2.1, .1]) },
    { id: 'cone', name: 'المخروط', info: 'مع تكرار الانفجارات البركانية يزداد تراكم المواد، ويزداد ارتفاع المخروط.', objs: [cone, face], at: anchor(root, [-2.6, 1.2, .1]) },
    { id: 'lava', name: 'لابة', info: 'تسمّى الصهارة عندما تصل إلى سطح الأرض لابة.', objs: [conduit], at: anchor(root, [.35, H * .55, .1]) },
    { id: 'ash', name: 'الرماد البركاني', info: 'تخرج من البركان الصهارة والغازات والرماد البركاني.', objs: [proxy(root, [.6, H + 3, .2], [1.6, 2.4, 1])], at: anchor(root, [1.2, H + 3.6, .2]), hidden: () => !erupt }
  ];
  const types = ['البراكين النشطة: لا تزال الصهارة تندفع منها حتى وقتنا هذا، وتلك التي اندفعت حديثًا.', 'البراكين الساكنة: توقفت عن الثوران، لكنها قد تعود فتثور من وقت إلى آخر. ومنها بركان أيسلندا الذي عاد للثوران عام ١٤٣١هـ بعد سكون دام ٢٠٠ عام تقريبًا.', 'البراكين الهامدة: توقف اندفاع الصهارة منها، ولا يُتوقع أن تثور مرة أخرى.'];
  return {
    root, parts,
    update(dt) { [lava, ash, lavaFlow].forEach(f => f.update(dt)); },
    cam: { pos: [0, 3.5, 13.5], target: [0, .8, 0] }, inpage: { pos: [0, 2.6, 12.5], target: [0, .4, 0] },
    controls: [
      { type: 'button', label: '🌋 ثوران', toggle: true, on: on => { if (on && type === 2) { api.toast('البركان الهامد لا يُتوقع أن يثور مرة أخرى.'); return; } setErupt(on); if (on) { count++; } } },
      { type: 'slider', label: 'عدد مرات الثوران', min: 0, max: 8, step: 1, value: 2, fmt: v => ar(v), on: v => { H = 2.4 + v * .4; build(); paths(); setErupt(erupt); heat(); parts.find(p => p.id === 'cone').objs = [cone, face]; parts.find(p => p.id === 'lava').objs = [conduit]; parts.find(p => p.id === 'vent2').objs = [sideCone]; parts[0].objs[0].position.y = H; parts[0].at.position.y = H + .5; parts[1].at.position.y = H * .38 + .45; api.refreshParts(); if (v >= 6) api.toast('مع تكرار الانفجارات البركانية يزداد تراكم المواد، ويزداد ارتفاع المخروط.'); } },
      { type: 'seg', label: 'نوع البركان', options: ['نشط', 'ساكن', 'هامد'], value: 0, on: i => { type = i; heat(); if (i === 2) setErupt(false); api.toast(types[i]); } }
    ],
    quiz: [
      { q: 'كم فتحة في هذا البركان؟ المس الفوهة الجانبية.', a: 'vent2' },
      { q: 'المس مخزن الصهارة.', a: 'chamber' },
      { q: 'المس فوهة البركان الرئيسة في القمة.', a: 'crater' },
      { q: 'ماذا تسمّى الصهارة عندما تصل إلى سطح الأرض؟ المسها.', a: 'lava' }
    ]
  };
}

/* ───────────── ص ١٧٧: مراحل تكوّن الوقود الأحفوري ───────────── */
export function fossilModel(api) {
  const root = new THREE.Group();
  const CW = 3.6, D = 2.6;
  function column(y) { const g = new THREE.Group(); g.position.y = y; root.add(g); return g; }
  const coalC = column(3.0), oilC = column(-3.0);
  const frame = (g) => g.add(mesh(new THREE.BoxGeometry(CW + .1, 5.6, D + .1), glass('#ffffff', .1), [0, -.3, 0]));
  frame(coalC); frame(oilC);
  const sedTex = strataTexture([['#c9a878', 1], ['#b8956a', 1], ['#d4b88a', 1], ['#a8855a', 1]]);
  const base = (g, c) => g.add(mesh(new THREE.BoxGeometry(CW, .8, D), mat(c, { bumpMap: tissueBump('vein', 16), bumpScale: 4, roughness: .95 }), [0, -2.7, 0]));
  base(coalC, '#8a7a6a'); base(oilC, '#8a7a6a');
  // الفحم
  const swampW = mesh(new THREE.BoxGeometry(CW, .9, D), glass('#2f86c9', .55), [0, 0, 0]); coalC.add(swampW);
  const reeds = new THREE.Group(); coalC.add(reeds); const reedM = mat('#5f9a32', { bumpMap: tissueBump('vein', 9), bumpScale: 2 }), catM = mat('#6a3a1e', { bumpMap: tissueBump('pore', 9), bumpScale: 3 }); for (let i = 0; i < 18; i++) { const r = new THREE.Group(); r.position.set((Math.random() - .5) * (CW - .4), 0, (Math.random() - .5) * (D - .4)); r.rotation.set((Math.random() - .5) * .3, 0, (Math.random() - .5) * .3); r.add(mesh(new THREE.CylinderGeometry(.012, .03, 1.4, 8), reedM)); if (i % 3 === 0) r.add(mesh(new THREE.CapsuleGeometry(.045, .2, 6, 10), catM, [0, .62, 0])); else { const lf = mesh(new THREE.PlaneGeometry(.05, 1.1, 1, 6), mat('#6aa83a', { side: 2 }), [.03, .1, 0], [0, i, .15]); r.add(lf); } reeds.add(r); }
  for (let i = 0; i < 4; i++) reeds.add(mesh(new THREE.CircleGeometry(.18, 12), mat('#5fa83a', { side: 2 }), [(Math.random() - .5) * 2, 0, (Math.random() - .5) * 1.4], [-Math.PI / 2, 0, 0]));
  const peat = mesh(new THREE.BoxGeometry(CW, 1, D), mat('#5a3a1e', { roughness: 1, bumpMap: tissueBump('vein', 21), bumpScale: 4 }), [0, 0, 0]); coalC.add(peat);
  const coalSed = mesh(new THREE.BoxGeometry(CW, 1, D), mat('#fff', { map: sedTex }), [0, 0, 0]); coalC.add(coalSed);
  // النفط والغاز
  const seaW = mesh(new THREE.BoxGeometry(CW, 1, D), glass('#2f86c9', .55), [0, 0, 0]); oilC.add(seaW);
  const critters = new THREE.Group(); oilC.add(critters); for (let i = 0; i < 26; i++) { const c = creature(['🦐', '🐟', '🪼', '🦠', '🐌'][i % 5], .22 + (i % 3) * .05) || mesh(new THREE.SphereGeometry(.05, 6, 5), mat('#d8e8c0')); c.position.set((Math.random() - .5) * (CW - .3), 0, (Math.random() - .5) * (D - .3)); c.rotation.y = Math.random() * 6; critters.add(c); }
  const deadL = mesh(new THREE.BoxGeometry(CW, 1, D), mat('#6a5a3a', { bumpMap: tissueBump('pore', 22), bumpScale: 4 }), [0, 0, 0]); oilC.add(deadL);
  const oilSed = mesh(new THREE.BoxGeometry(CW, 1, D), mat('#fff', { map: sedTex }), [0, 0, 0]); oilC.add(oilSed);
  const oilPool = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat('#1e1610', { roughness: .08, metalness: .2, clearcoat: 1, clearcoatRoughness: .05 }), [0, 0, 0]); oilPool.scale.set(1.5, .45, 1.1); oilC.add(oilPool);
  const gasPool = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e8e8f0', { transparent: true, opacity: .85 }), [0, 0, 0]); gasPool.scale.set(1.1, .3, .8); oilC.add(gasPool);
  const heatGlow = mesh(new THREE.BoxGeometry(CW, .3, D), new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0 }), [0, -3.0, 0]); oilC.add(heatGlow);
  const rigs = new THREE.Group(); oilC.add(rigs); for (const x of [-.8, .8]) { const r = new THREE.Group(); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; r.add(mesh(new THREE.CylinderGeometry(.02, .02, 1.3, 4), mat('#555'), [Math.cos(a) * .15, .6, Math.sin(a) * .15], [Math.sin(a) * .2, 0, -Math.cos(a) * .2])); } r.add(mesh(new THREE.CylinderGeometry(.025, .025, 3, 6), mat('#333'), [0, -1.2, 0])); r.position.x = x; rigs.add(r); }
  const press = [coalC, oilC].map(g => { const a = new THREE.Group(); for (const x of [-1, 0, 1]) a.add(mesh(new THREE.ConeGeometry(.15, .4, 10), mat('#e8323a'), [x, 0, D / 2 + .2], [Math.PI, 0, 0])); g.add(a); return a; });
  let t = 0, extracted = 0;
  function stack(items, y0) { let y = y0; for (const [m, h] of items) { m.visible = h > .005; m.scale.y = Math.max(.001, h); m.position.y = y + h / 2; y += h; } return y; }
  function apply() {
    const s1 = clamp(t), s2 = clamp(t - 1), s3 = clamp(t - 2);
    // الفحم: مخلوقات ميتة ← خث ← رسوبيات ← فحم
    const peatH = lerp(.15, .9, s1) * lerp(1, .45, s3);
    peat.material.color.set(new THREE.Color('#5a3a1e').lerp(new THREE.Color('#121212'), s3)); peat.material.metalness = s3 * .3; peat.material.roughness = 1 - s3 * .6;
    const sedH = s2 * 2.2 + s3 * .3;
    let top = stack([[peat, peatH], [coalSed, sedH]], -2.3);
    swampW.visible = true; swampW.scale.y = .9; swampW.position.y = top + .45; reeds.position.y = top + .4; reeds.visible = s2 < .5; reeds.scale.y = 1 - s1 * .5;
    press[0].position.y = top + 1.1; press[0].visible = s2 > .3;
    // النفط
    const deadH = lerp(.05, .35, s1); const osH = s2 * 2.0 + s3 * .3;
    top = stack([[deadL, deadH * (1 - s3 * .6)], [oilSed, osH]], -2.3);
    seaW.scale.y = 1.2; seaW.position.y = top + .6; critters.children.forEach((c, i) => c.position.y = top + .1 + ((i * .37 + (1 - s1) * 1.1) % 1.1));
    critters.visible = s2 < .8;
    oilPool.visible = s3 > .05; oilPool.position.y = -2.3 + deadH * .4 + .2; oilPool.scale.y = .45 * s3 * (1 - extracted); gasPool.visible = s3 > .4; gasPool.position.y = oilPool.position.y + .45 * s3 * (1 - extracted) - .02; gasPool.scale.y = .3 * s3 * (1 - extracted * .8);
    heatGlow.material.opacity = s3 * .6 * (s3 < 1 ? 1 : .5);
    press[1].position.y = top + 1.3; press[1].visible = s2 > .3;
    rigs.visible = t >= 2.9; rigs.position.y = top;
  }
  apply();
  const steps = [
    { t: '١ – البداية', d: 'نباتات المستنقعات في جهة، ومخلوقات بحرية في جهة أخرى.', v: 0 },
    { t: '١ – المخلوقات الميتة تكوّن الخث / سقوط المخلوقات البحرية الميتة إلى قاع البحر', d: 'المخلوقات الميتة تكوّن الخث. وتسقط المخلوقات البحرية الميتة إلى قاع البحر.', v: 1 },
    { t: '٢ – تراكم الرسوبيات فوق الخث / دفن المخلوقات في الرسوبيات', d: 'تتراكم الرسوبيات فوق الخث، والمخلوقات الميتة تُدفن في الرسوبيات.', v: 2 },
    { t: '٣ – تحوّل الخث إلى فحم حجري / الضغط والحرارة يشكلان النفط والغاز', d: 'يتحوّل الخث إلى فحم حجري بفعل الضغط، والضغط والحرارة يشكّلان النفط والغاز.', v: 3 }
  ];
  const parts = [
    { id: 'coalT', name: 'مراحل تكوّن الفحم', info: '١ المخلوقات الميتة تكوّن الخث. ٢ تراكم الرسوبيات فوق الخث. ٣ تحوّل الخث إلى فحم حجري بفعل الضغط.', objs: [coalC.children[0]], at: anchor(coalC, [0, 2.65, 0]) },
    { id: 'oilT', name: 'مراحل تكوّن النفط والغاز', info: '١ سقوط المخلوقات البحرية الميتة إلى قاع البحر. ٢ المخلوقات الميتة تدفن في الرسوبيات. ٣ الضغط والحرارة يشكّلان النفط والغاز.', objs: [oilC.children[0]], at: anchor(oilC, [0, 2.65, 0]) },
    { id: 'peat', name: 'الخث', info: 'المخلوقات الميتة تكوّن الخث.', objs: [peat], at: anchor(peat, [0, .6, D / 2]), hidden: () => t > 2.6 },
    { id: 'coal', name: 'فحم حجري', info: 'يتحوّل الخث إلى فحم حجري بفعل الضغط.', objs: [peat], at: anchor(peat, [0, .6, D / 2]), hidden: () => t <= 2.6 },
    { id: 'sed', name: 'الرسوبيات', info: 'تتراكم الرسوبيات فوق الخث، وتُدفن المخلوقات الميتة في الرسوبيات.', objs: [coalSed, oilSed], at: anchor(coalSed, [0, .1, D / 2]), hidden: () => t < 1.3 },
    { id: 'marine', name: 'المخلوقات البحرية الميتة', info: 'تسقط المخلوقات البحرية الميتة إلى قاع البحر.', objs: [deadL, ...critters.children], at: anchor(deadL, [0, .6, D / 2]) },
    { id: 'oil', name: 'النفط', info: 'الضغط والحرارة يشكّلان النفط والغاز. ويعدّ الوقود الأحفوري مورد الطاقة الرئيس في الحياة المعاصرة.', objs: [oilPool], at: anchor(oilPool, [1.3, .3, .4]), hidden: () => t < 2.1 },
    { id: 'gas', name: 'الغاز', info: 'يتكوّن الغاز مع النفط بفعل الضغط والحرارة.', objs: [gasPool], at: anchor(gasPool, [-.9, .6, .4]), hidden: () => t < 2.5 },
    { id: 'press', name: 'الضغط', info: 'يتحول الخث إلى فحم بفعل الضغط الناتج عن تراكم الرسوبيات فوقه.', objs: press.flatMap(p => p.children), at: anchor(press[0], [0, .4, D / 2 + .2]), hidden: () => t < 1.3 }
  ];
  return {
    root, parts,
    update(dt) { rigs.children.forEach((r, i) => r.rotation.y += dt * (extracting ? 2 : 0)); if (extracting && extracted < 1) { extracted = Math.min(1, extracted + dt * .12); apply(); if (extracted >= 1) { extracting = false; api.toast('نفد النفط! الوقود الأحفوري مورد طاقة غير متجدّد؛ يحتاج إلى ملايين السنين ليعاد إنتاجه، لذا تجب حمايته وإدارته بكل حكمة.'); } } },
    cam: { pos: [5, 2, 13], target: [0, 0, 0] }, inpage: { pos: [2.2, 1.5, 14], target: [0, 0, 0] }, fitPop: 1.2,
    controls: [
      { type: 'steps', steps, value: 0, on: i => { t = steps[i].v; extracted = 0; apply(); api.setControl(1, t); api.refreshParts(); } },
      { type: 'slider', label: 'مرور الزمن (ملايين السنين)', min: 0, max: 3, step: .05, value: 0, fmt: v => v < .5 ? 'البداية' : v < 1.5 ? 'مرحلة ١' : v < 2.5 ? 'مرحلة ٢' : 'مرحلة ٣', on: v => { t = v; apply(); } },
      { type: 'button', label: 'استخرج النفط', on: () => { if (t < 2.9) return api.toast('لم يتكوّن النفط بعد؛ حرّك الزمن إلى المرحلة ٣.'); extracting = true; } }
    ],
    quiz: [
      { q: 'المس ما تكوّنه المخلوقات الميتة في المستنقع. (المرحلة ١)', a: 'peat' },
      { q: 'المس الرسوبيات المتراكمة. (المرحلة ٢)', a: 'sed' },
      { q: 'المس النفط. (المرحلة ٣)', a: 'oil' }
    ]
  };
  var extracting;
}

/* ───────────── ص ١٨٦: محطات معالجة المياه ───────────── */
export function treatmentModel(api) {
  const root = new THREE.Group();
  const lakeG = new THREE.Group(); lakeG.position.set(4.2, 2.2, -1.2); root.add(lakeG);
  lakeG.add(mesh(organGeo(1, v => { v.y = Math.max(-1, Math.min(0, v.y)) * .6 + .3 * (v.y > 0 ? 0 : 0); v.x *= 1.4; v.z *= 1.4; v.multiplyScalar(1 + fbm3(v.x * 2, v.y * 2, v.z * 2) * .08); }, 48, 24), mat('#7a5a3a', { bumpMap: tissueBump('pore', 45), bumpScale: 4, roughness: .95 }), [0, -.02, 0]));
  lakeG.add(mesh(new THREE.CircleGeometry(1.3, 48), new THREE.MeshPhysicalMaterial({ color: '#3f7f86', roughness: .04, clearcoat: 1, clearcoatRoughness: .02, bumpMap: tissueBump('vein', 46), bumpScale: .4 }), [0, .01, 0], [-Math.PI / 2, 0, 0]));
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI; const p = pine(.45, '#3f7a3a'); p.position.set(Math.cos(a + Math.PI) * 1.25, 0, -Math.sin(a) * 1.0); lakeG.add(p); }
  const pipeM = mat('#9aa0a6', { metalness: .85, roughness: .28, clearcoat: .6 });
  const path = [V(4.2, 2.0, -.1), V(4.0, 1.5, .4), V(3.1, 1.6, .6), V(2.2, 1.55, .8), V(1.3, 1.1, 1.0), V(.3, .6, 1.4), V(-.6, .4, 1.8), V(-1.6, .1, 2.0), V(-3.2, .1, 2.0), V(-4.4, .4, 1.8)];
  root.add(tube(path.map(p => p.clone().add(V(0, -.18, 0))), .08, pipeM, 120, 10));
  const screens = new THREE.Group(); screens.position.set(2.6, 1.7, .7); root.add(screens);
  screens.add(mesh(new THREE.BoxGeometry(1.2, .1, .6), mat('#cfcfd4', { metalness: .5 }), [0, 0, 0])); for (let i = 0; i < 9; i++) screens.add(mesh(new THREE.CylinderGeometry(.015, .015, .6, 4), mat('#666'), [-.5 + i * .125, .06, 0], [Math.PI / 2, 0, 0]));
  const tank = (r, h, pos, col) => { const g = new THREE.Group(); g.position.set(...pos); g.add(mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), glass('#d8d8dc', .55, { side: 2 }))); g.add(mesh(new THREE.CircleGeometry(r, 40), mat('#9a9a9e'), [0, -h / 2, 0], [-Math.PI / 2, 0, 0])); const w = mesh(new THREE.CylinderGeometry(r * .97, r * .97, h * .8, 40), mat(col, { transparent: true, opacity: .8 }), [0, -h * .1, 0]); g.add(w); g.userData.w = w; root.add(g); return g; };
  const coag = tank(.75, .8, [1.4, 1.0, 1.0], '#7a8a5a');
  const sludge = mesh(new THREE.CylinderGeometry(.7, .72, .12, 40), mat('#5a4a2a'), [0, -.33, 0]); coag.add(sludge);
  const sed = new THREE.Group(); sed.position.set(.3, .6, 1.4); root.add(sed);
  sed.add(mesh(new THREE.BoxGeometry(1.6, .45, 1.1), glass('#d8d8dc', .5)), mesh(new THREE.BoxGeometry(1.5, .35, 1.0), mat('#6aa8a0', { transparent: true, opacity: .8 }), [0, -.02, 0]));
  const sedLayer = mesh(new THREE.BoxGeometry(1.5, .06, 1.0), mat('#a89070'), [0, -.18, 0]); sed.add(sedLayer);
  const filt = new THREE.Group(); filt.position.set(-.4, .1, 1.7); root.add(filt); filt.add(mesh(new THREE.BoxGeometry(.7, .25, .5), mat('#c8c8cc', { metalness: .4 }))); for (let i = 0; i < 6; i++) filt.add(mesh(new THREE.BoxGeometry(.02, .22, .48), mat('#555'), [-.3 + i * .12, 0, 0]));
  const chl = new THREE.Group(); chl.position.set(-1.8, -.1, 2.6); root.add(chl); chl.add(mesh(new THREE.CylinderGeometry(.35, .35, .6, 24), mat('#b8b8bc', { metalness: .5 }))); for (let k = 0; k < 3; k++) chl.add(mesh(new THREE.TorusGeometry(.355, .02, 6, 30), mat('#888'), [0, -.2 + k * .2, 0], [Math.PI / 2, 0, 0]));
  const store = tank(1.1, .7, [-4.6, .45, 1.8], '#4ab8e0');
  const tap = new THREE.Group(); tap.position.set(-5.9, .55, 1.8); root.add(tap); tap.add(mesh(new THREE.CylinderGeometry(.05, .05, .5, 8), mat('#444'), [0, -.15, 0]), mesh(new THREE.CylinderGeometry(.05, .05, .4, 8), mat('#444'), [.15, .1, 0], [0, 0, Math.PI / 2]));
  const basePlate = mesh(new THREE.BoxGeometry(12.5, .1, 6), mat('#c9c4b8', { bumpMap: tissueBump('pore', 47), bumpScale: 2.5, roughness: .9 }), [-.6, -.45, .6]); root.add(basePlate);
  const water = new Flow(root, '#7a6a3a', .07, 220); water.rate = 9; const wc = curve(path); water.addPath(wc, .07);
  const debris = []; for (let i = 0; i < 10; i++) { const d = mesh(i % 2 ? organGeo(.06, v => { v.y *= .15; v.x *= 1.6; }, 12, 8) : new THREE.CylinderGeometry(.03, .035, .14, 12), mat(['#e0a03a', '#c83a3a', '#8a6a3a', '#e8e8e8'][i % 4], { side: 2 }), [2.6 + (Math.random() - .5) * 1, 1.8, .7 + (Math.random() - .5) * .4]); d.visible = false; root.add(d); debris.push(d); }
  const bugs = []; for (let i = 0; i < 14; i++) { const b = mesh(new THREE.CapsuleGeometry(.025, .07, 3, 6), mat('#3aaa3a', { emissive: '#1a8a1a', emissiveIntensity: .6 })); b.visible = false; root.add(b); bugs.push({ m: b, t: Math.random() }); }
  const on = { screen: true, coag: true, sed: true, filt: true, dis: true };
  const stageT = { screen: .27, coag: .4, sed: .53, filt: .64, dis: .77 };
  const C = { raw: new THREE.Color('#7a6a3a'), a: new THREE.Color('#7a8a5a'), b: new THREE.Color('#6aa8a0'), c: new THREE.Color('#5ab8d0'), d: new THREE.Color('#4ab8e0') };
  water.mat.vertexColors = false;
  function quality() { let q = 0; if (on.screen) q++; if (on.coag) q++; if (on.sed) q++; if (on.filt) q++; return q; }
  function apply() {
    debris.forEach(d => d.visible = on.screen); sludge.visible = on.coag; sedLayer.visible = on.sed;
    const q = quality(); const out = C.raw.clone().lerp(C.d, q / 4); store.userData.w.material.color.copy(out);
    coag.userData.w.material.color.copy(C.raw.clone().lerp(C.d, (on.screen ? 1 : 0) / 4 + (on.coag ? .1 : 0)));
  }
  apply();
  const parts = [
    { id: 'lake', name: 'بحيرة أو خزان مياه اصطناعي', info: 'تتلوث موارد المياه – سواء الجوفية منها أو السطحية – وهي مشكلة ذات أبعاد خطيرة. وتنقى مياه الصرف الصحي في محطات خاصة تسمّى محطات معالجة المياه.', objs: lakeG.children.slice(0, 2), at: anchor(lakeG, [0, .5, 0]) },
    { id: 'screen', name: 'سلسلة مصافٍ (التصفية)', info: 'تبدأ المعالجة بمرحلة التصفية، التي يتم فيها التخلص من المواد الكبيرة الحجم، ومنها الخضار والفواكه والكرتون والأقمشة، باستعمال سلسلة من المصافي.', objs: screens.children, at: anchor(screens, [0, .3, 0]) },
    { id: 'coag', name: 'التخثير', info: 'ثم تضاف مواد لزجة لتلتصق بها جميع الأوساخ، وتسمّى هذه المرحلة التخثير.', objs: coag.children, at: anchor(coag, [0, .6, 0]) },
    { id: 'sed', name: 'الترسيب', info: 'ثم تدخل المياه حوض الترسيب؛ حيث يترسّب الحصى الصغير والرمل والمواد التي تخثّرت.', objs: sed.children, at: anchor(sed, [0, .4, 0]) },
    { id: 'filt', name: 'الترشيح', info: 'تدخل المياه بعد ذلك إلى سلسلة من أجهزة الترشيح والتنقية (الفلاتر) للتخلص من أي شوائب متبقية في المياه، وتسمّى هذه المرحلة الترشيح.', objs: filt.children, at: anchor(filt, [0, .3, 0]) },
    { id: 'dis', name: 'التعقيم', info: 'ثم تمر المياه بالمرحلة الأخيرة، وهي التعقيم؛ حيث يتم قتل البكتيريا الموجودة في المياه بإضافة الكلور.', objs: chl.children, at: anchor(chl, [0, .5, 0]) },
    { id: 'store', name: 'التخزين', info: 'ثم تخزّن المياه إلى حين استعمالها. ولا تستعمل هذه المياه لأغراض الشرب، ولكن لري أنواع معيّنة من المزروعات أو لتصريفها إلى البحار بحيث لا تسبّب ضررًا للمخلوقات الحية البحرية.', objs: store.children, at: anchor(store, [0, .55, 0]) }
  ];
  const steps = ['screen', 'coag', 'sed', 'filt', 'dis', 'store'].map(id => { const p = parts.find(x => x.id === id); return { t: p.name, d: p.info, id }; });
  const tog = (k, label) => ({ type: 'button', label, toggle: true, on: v => { on[k] = !v; apply(); api.toast(v ? 'لاحظ المياه الواصلة إلى الخزان: كيف تغيّرت بعد تعطيل هذه المرحلة؟' : ''); } });
  return {
    root, parts,
    update(dt, t) {
      water.update(dt);
      const q = quality();
      water.items.forEach(m => { const u = m.userData.t; let c = C.raw.clone(); let k = 0; if (u > stageT.screen && on.screen) k++; if (u > stageT.coag && on.coag) k += .5; if (u > stageT.sed && on.sed) k += 1.5; if (u > stageT.filt && on.filt) k++; c.lerp(C.d, k / 4); if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = 1; } m.material.color.copy(c); m.material.emissive.copy(c); });
      const showBugs = !on.dis; bugs.forEach((b, i) => { b.t = (b.t + dt * .05) % 1; const u = .78 + b.t * .22; b.m.visible = showBugs || u < .78; b.m.position.copy(wc.getPointAt(Math.min(1, showBugs ? u : .6 + b.t * .17))).add(V(0, .12, 0)); b.m.rotation.z += dt * 3; });
    },
    cam: { pos: [-.5, 6.2, 9.5], target: [-.4, .6, .8] }, inpage: { pos: [-.4, 5, 10], target: [-.3, .6, .6] },
    controls: [
      { type: 'steps', steps, value: -1, on: i => api.select(steps[i].id) },
      tog('sed', 'عطّل مرحلة الترسيب'), tog('filt', 'عطّل مرحلة الترشيح'), tog('dis', 'عطّل مرحلة التعقيم')
    ],
    legend: [['#7a6a3a', 'مياه ملوثة'], ['#4ab8e0', 'مياه معالجة'], ['#3aaa3a', 'بكتيريا']],
    quiz: [
      { q: 'في أي مرحلة يتم التخلص من المواد الكبيرة الحجم؟', a: 'screen' },
      { q: 'المس المرحلة التي يتم فيها قتل البكتيريا بإضافة الكلور.', a: 'dis' },
      { q: 'المس المرحلة التي يترسّب فيها الحصى الصغير والرمل.', a: 'sed' },
      { q: 'المس المرحلة التي تضاف فيها مواد لزجة لتلتصق بها الأوساخ.', a: 'coag' },
      { q: 'المس أجهزة الترشيح (الفلاتر).', a: 'filt' }
    ]
  };
}
