// المحاكيات التفاعلية لدروس العلوم – الثالث المتوسط (تعمل دون إنترنت)
// كلُّ محاكاةٍ: SIMS[name](host, { award, AR })
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/\./g, '٫');
const CSS = `
#lessonApp .xsim{background:linear-gradient(160deg,#0f3446,#0a2533);color:#dbeaf0;border-radius:18px;padding:14px;margin:12px 0;box-shadow:0 8px 24px rgba(10,40,55,.18)}
#lessonApp .xsim h4{margin:0 0 4px;color:#fff;font-size:18px;display:flex;align-items:center;gap:8px}
#lessonApp .xsim h4 .tg{font-size:12px;background:rgba(13,169,166,.2);color:#8fe3e0;border:1px solid rgba(13,169,166,.4);border-radius:99px;padding:1px 10px}
#lessonApp .xsim .en{font-size:12px;background:#f4efdc;color:#7a6a2c;border-radius:99px;padding:1px 10px;font-weight:800}
#lessonApp .xsim p.hint{margin:2px 0 8px;font-size:14px;color:#a9cbd6}
#lessonApp .xsim canvas,#lessonApp .xsim svg{width:100%;display:block;border-radius:12px;background:#071c26}
#lessonApp .xsim .ctl{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0}
#lessonApp .xsim .ctl label{font-weight:800;font-size:14px;min-width:90px}
#lessonApp .xsim .ctl output{font-weight:800;color:#8fe3e0;min-width:60px}
#lessonApp .xsim input[type=range]{flex:1;min-width:140px;accent-color:#0da9a6}
#lessonApp .xsim .seg{display:flex;gap:6px;flex-wrap:wrap}
#lessonApp .xsim .seg button,#lessonApp .xsim .sb{border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#e6f2f5;border-radius:10px;padding:7px 12px;font:inherit;font-weight:800;font-size:14px;cursor:pointer}
#lessonApp .xsim .seg button.on,#lessonApp .xsim .sb.p{background:#0da9a6;border-color:#0da9a6;color:#fff}
#lessonApp .xsim .out{background:rgba(255,255,255,.06);border-radius:12px;padding:8px 12px;margin-top:8px;font-weight:700;line-height:1.8}
#lessonApp .xsim .out b{color:#c1b489}
#lessonApp .xsim .ok{color:#7ee0b4}#lessonApp .xsim .no{color:#ffb4a8}
#lessonApp .xsim .kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:8px}
#lessonApp .xsim .kv div{background:rgba(255,255,255,.06);border-radius:12px;padding:8px;text-align:center}#lessonApp .xsim .kv b{display:block;font-size:22px;color:#fff}
#lessonApp .xsim .seg{background:none;border:0;padding:0;border-radius:0}
#lessonApp .xsim .ctl label{color:#dbeaf0}
#lessonApp .xsim h4{font-size:18px}
`;
function box(host, title, hint, enrich) {
  if (!document.getElementById('simCSS')) { const s = document.createElement('style'); s.id = 'simCSS'; s.textContent = CSS; document.head.appendChild(s); }
  const d = document.createElement('div'); d.className = 'xsim';
  d.innerHTML = `<h4>🧪 ${title} <span class="tg">محاكاة تفاعلية</span>${enrich ? '<span class="en">إثراء</span>' : ''}</h4>${hint ? `<p class="hint">${hint}</p>` : ''}`;
  host.appendChild(d); return d;
}
function canvas(d, w = 800, h = 360) { const c = document.createElement('canvas'); c.width = w; c.height = h; d.appendChild(c); return [c, c.getContext('2d')]; }
// حلقةُ رسمٍ تتوقّفُ تلقائيًّا عند إزالةِ العنصر
function loop(el, f) { let t0 = performance.now(); const step = now => { if (!el.isConnected) return; f((now - t0) / 1000); requestAnimationFrame(step); }; requestAnimationFrame(step); }
const html = (d, s) => { d.insertAdjacentHTML('beforeend', s); return d.lastElementChild; };

export const SIMS = {
  /* ── الارتداد المرن ── */
  rebound(host, api) {
    const d = box(host, 'الارتدادُ المرنُ وتراكمُ الإجهاد', 'زِدِ الإجهادَ تدريجيًّا وراقبْ تشوّهَ الصخرِ وتراكمَ الطاقة… ماذا يحدثُ عند تجاوزِ حدِّ المرونة؟');
    const [c, g] = canvas(d, 800, 300);
    const ctl = html(d, '<div class="ctl"><label>الإجهاد</label><input type="range" min="0" max="100" value="0"><output>٠٪</output><button class="sb">↺ إعادة</button></div>');
    const out = html(d, '<div class="out">الطاقةُ المختزنة: <b>٠٪</b></div>');
    const r = ctl.querySelector('input'); let broke = false, tb = 0, done = false;
    ctl.querySelector('button').onclick = () => { broke = false; r.value = 0; r.disabled = false; upd(); };
    const upd = () => { ctl.querySelector('output').textContent = AR(r.value) + '٪'; if (!broke && +r.value >= 90) { broke = true; tb = performance.now(); r.disabled = true; if (!done) { done = true; api.award && api.award(1, 'شاهدتَ الارتدادَ المرن'); } }
      out.innerHTML = broke ? '💥 <b>تكسّرَ الصخرُ!</b> عادتِ الكتلتان إلى شكلِهما (ارتدادٌ مرن) وتحرّرتِ الطاقةُ فجأةً على صورةِ <b>موجاتٍ زلزالية</b>.' : `الطاقةُ المختزنة: <b>${AR(r.value)}٪</b> — الصخرُ يتشوّهُ تشوّهًا مرنًا${+r.value > 70 ? ' (اقتربَ من حدِّ المرونة!)' : ''}`; };
    r.oninput = upd; upd();
    loop(c, () => { const s = broke ? 0 : +r.value / 100, W = 800, H = 300, x0 = 400; g.clearRect(0, 0, W, H);
      const off = broke ? 34 : 0, shake = broke ? Math.max(0, 1 - (performance.now() - tb) / 1500) * Math.sin(performance.now() / 25) * 6 : 0;
      for (const side of [-1, 1]) { g.save(); g.translate(shake, 0); g.beginPath(); const dy = side * off;
        for (let i = 0; i <= 40; i++) { const y = 40 + i * 5.5, bend = s * 40 * Math.sin(Math.PI * (y - 40) / 220) * side; if (i === 0) g.moveTo(x0 + bend, y + dy); else g.lineTo(x0 + bend, y + dy); }
        g.lineTo(side < 0 ? 60 : 740, 260 + dy); g.lineTo(side < 0 ? 60 : 740, 40 + dy); g.closePath();
        const gr = g.createLinearGradient(0, 40, 0, 260); gr.addColorStop(0, '#7a8f5a'); gr.addColorStop(.12, '#b88a5a'); gr.addColorStop(.5, '#a07048'); gr.addColorStop(1, '#6e4a30'); g.fillStyle = gr; g.fill();
        g.strokeStyle = 'rgba(0,0,0,.25)'; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(side < 0 ? 60 : 740, 40 + k * 44 + dy); g.lineTo(x0 + s * 40 * Math.sin(Math.PI * k * 44 / 220) * side, 40 + k * 44 + dy); g.stroke(); }
        g.restore(); }
      g.fillStyle = '#fff'; g.font = '800 20px Tajawal'; g.textAlign = 'center';
      if (!broke) { g.fillStyle = '#ffcf3a'; g.fillText('⟵ قوة', 140, 30); g.fillText('قوة ⟶', 660, 285); }
      else { const t = (performance.now() - tb) / 1000; for (let k = 0; k < 4; k++) { const R = (t * 160 + k * 60) % 400; g.strokeStyle = `rgba(255,120,80,${Math.max(0, 1 - R / 400)})`; g.lineWidth = 3; g.beginPath(); g.arc(x0, 150, R, 0, 7); g.stroke(); } }
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(20, 270, 760, 14); g.fillStyle = broke ? '#ff7a50' : '#0da9a6'; g.fillRect(20, 270, 760 * (broke ? 0 : s), 14); });
  },
  /* ── أنواع الصدوع ── */
  faults(host, api) {
    const d = box(host, 'أنواعُ الصدوعِ والقوى المسبِّبةُ لها', 'اخترْ نوعَ القوة ثم اضغطْ «حرّك» لترى كيف تتحرّكُ الكتلُ على جانبي مستوى الصدع.');
    const seg = html(d, '<div class="seg"><button data-k="0" class="on">قوى الشدّ ← صدع عادي</button><button data-k="1">قوى الضغط ← صدع عكسي</button><button data-k="2">قوى القصّ ← صدع انزلاقي</button><button class="sb p" data-go>▶ حرّك</button></div>');
    const [c, g] = canvas(d, 800, 340); const out = html(d, '<div class="out"></div>');
    let k = 0, t = 0, run = false, seen = new Set();
    const TX = ['الصدعُ العادي: قوى <b>الشدّ</b> تُبعدُ الكتلتين، فتنزلقُ الكتلةُ الواقعةُ فوقَ مستوى الصدعِ المائلِ <b>إلى أسفل</b>.', 'الصدعُ العكسي: قوى <b>الضغط</b> تقرّبُ الكتلتين، فتتحرّكُ الكتلةُ الواقعةُ فوقَ مستوى الصدعِ <b>إلى أعلى</b>.', 'الصدعُ الانزلاقي (الجانبي): قوى <b>القصّ</b> تحرّكُ الكتلتين <b>جانبيًّا</b> في اتجاهين متعاكسين (منظرٌ من أعلى وجانب).'];
    seg.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = +b.dataset.k; t = 0; run = false; seg.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); out.innerHTML = TX[k]; });
    seg.querySelector('[data-go]').onclick = () => { t = 0; run = true; seen.add(k); if (seen.size === 3) api.award && api.award(1, 'جرّبتَ أنواعَ الصدوعِ الثلاثة'); };
    out.innerHTML = TX[0];
    const block = (pts, top, side) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); const gr = g.createLinearGradient(0, 80, 0, 320); gr.addColorStop(0, '#6f9a4a'); gr.addColorStop(.08, '#c99a6a'); gr.addColorStop(.4, '#a87a4a'); gr.addColorStop(.7, '#8a5f3a'); gr.addColorStop(1, '#5e3f28'); g.fillStyle = gr; g.fill(); g.strokeStyle = '#2a1a0e'; g.lineWidth = 2; g.stroke(); };
    const arrow = (x, y, dx, dy, col = '#ff5a3a') => { g.strokeStyle = g.fillStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, y + dy); g.stroke(); const a = Math.atan2(dy, dx); g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx - 16 * Math.cos(a - .5), y + dy - 16 * Math.sin(a - .5)); g.lineTo(x + dx - 16 * Math.cos(a + .5), y + dy - 16 * Math.sin(a + .5)); g.fill(); };
    loop(c, dt => { if (run) t = Math.min(1, t + 1 / 90); const m = t * 40; g.clearRect(0, 0, 800, 340);
      if (k < 2) { const dir = k === 0 ? 1 : -1; // الجدار المعلّق فوق المستوى المائل
        block([[60, 100], [440, 100], [340, 320], [60, 320]], 0);
        g.save(); g.translate(k === 0 ? m * .45 : -m * .45, dir * m); block([[440, 100], [740, 100], [740, 320], [340, 320]], 1); g.restore();
        g.setLineDash([8, 6]); g.strokeStyle = '#ffcf3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(450, 80); g.lineTo(330, 335); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#ffcf3a'; g.font = '800 18px Tajawal'; g.textAlign = 'center'; g.fillText('مستوى الصدع', 480, 70);
        if (k === 0) { arrow(150, 60, -80, 0); arrow(650, 60, 80, 0); } else { arrow(70, 60, 80, 0); arrow(730, 60, -80, 0); }
        arrow(600, 210, 0, dir * 50, '#8fe3e0');
      } else { // منظر علويّ مائل
        g.save(); g.translate(0, 0);
        const top = (y0, s) => { g.beginPath(); g.moveTo(80 + s, y0); g.lineTo(720 + s, y0); g.lineTo(760 + s, y0 + 110); g.lineTo(120 + s, y0 + 110); g.closePath(); g.fillStyle = '#7fa65a'; g.fill(); g.strokeStyle = '#2a1a0e'; g.stroke(); g.fillStyle = '#a87a4a'; g.fillRect(120 + s, y0 + 110, 640, 40); g.strokeRect(120 + s, y0 + 110, 640, 40); };
        top(40, -m * 2); top(170, m * 2); g.restore();
        g.strokeStyle = '#4a6fa5'; g.lineWidth = 8; g.beginPath(); g.moveTo(300 - m * 2, 95); g.lineTo(300 - m * 2, 150); g.moveTo(300 + m * 2, 170); g.lineTo(300 + m * 2, 240); g.stroke();
        g.fillStyle = '#ffcf3a'; g.font = '800 18px Tajawal'; g.textAlign = 'center'; g.fillText('مستوى الصدع', 400, 166);
        arrow(560, 30, -90, 0); arrow(560, 320, 90, 0);
      } });
  },
  /* ── الموجات الزلزالية ── */
  waves(host, api) {
    const d = box(host, 'كيف تتحرّكُ جزيئاتُ الصخرِ مع كلِّ موجة؟', 'اخترْ نوعَ الموجة وراقبْ حركةَ الجزيئات (النقاط) بالنسبةِ إلى اتجاهِ انتقالِ الموجة (من اليسارِ إلى اليمين).');
    const seg = html(d, '<div class="seg"><button data-k="P" class="on">موجات أولية P</button><button data-k="S">موجات ثانوية S</button><button data-k="L">موجات سطحية</button><button data-k="R">سباق الموجات</button></div>');
    const [c, g] = canvas(d, 800, 320); const out = html(d, '<div class="out"></div>'); let k = 'P', seen = new Set(['P']);
    const TX = { P: 'الموجةُ <b>الأولية P</b>: طوليّة — تهتزُّ الجزيئاتُ إلى الأمامِ والخلفِ <b>في اتجاهِ</b> انتقالِ الموجة، وهي <b>الأسرع</b>.', S: 'الموجةُ <b>الثانوية S</b>: مستعرضة — تهتزُّ الجزيئاتُ <b>عموديًّا</b> على اتجاهِ انتقالِ الموجة، وهي أبطأُ من الأولية.', L: 'الموجةُ <b>السطحية</b>: الأبطأُ والأطول — حركةٌ معقّدةٌ إلى أعلى وأسفل ومن جانبٍ إلى آخر، و<b>تسبّبُ معظمَ الدمار</b>.', R: 'سباقٌ من البؤرة: تصلُ <b>P</b> أوّلًا ثم <b>S</b> ثم <b>الموجاتُ السطحية</b> — والفرقُ بين وصولِ P وS يزدادُ مع المسافة.' };
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { k = b.dataset.k; seen.add(k); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); out.innerHTML = TX[k]; if (seen.size === 4) api.award && api.award(1, 'قارنتَ بين الموجاتِ الزلزالية'); });
    out.innerHTML = TX.P;
    loop(c, t => { g.clearRect(0, 0, 800, 320); g.font = '800 16px Tajawal'; g.textAlign = 'center';
      if (k === 'R') { const v = { P: 6, S: 3.5, L: 2.5 }, cols = { P: '#3d9be8', S: '#e8873a', L: '#e84a5a' }, tt = (t * 30) % 140;
        g.fillStyle = '#c99a6a'; g.fillRect(40, 140, 720, 30); g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(60, 155, 12, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillText('البؤرة', 60, 200);
        g.fillStyle = '#fff'; g.fillRect(745, 120, 10, 70); g.fillText('محطة الرصد', 740, 110);
        Object.entries(v).forEach(([n, s], i) => { const x = Math.min(740, 60 + s * tt); g.fillStyle = cols[n]; g.beginPath(); g.arc(x, 70 + i * 0, 0, 0, 7); g.fill(); g.fillRect(60, 225 + i * 28, x - 60, 18); g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText(n === 'L' ? 'سطحية' : n, 50 + 0, 239 + i * 28); g.textAlign = 'center'; });
        return; }
      const n = 26, rows = 5;
      for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const x0 = 40 + i * 28, y0 = 70 + r * 45, ph = (x0 / 120 - t * 2.4); let dx = 0, dy = 0;
        if (k === 'P') dx = 10 * Math.sin(ph * 2 * Math.PI / 2.2); else if (k === 'S') dy = 14 * Math.sin(ph * 2 * Math.PI / 2.2); else { const a = Math.exp(-r * .5); dx = 12 * a * Math.cos(ph * 2 * Math.PI / 3.2); dy = 16 * a * Math.sin(ph * 2 * Math.PI / 3.2); }
        g.fillStyle = r === 2 && i === 13 ? '#ffcf3a' : k === 'P' ? '#3d9be8' : k === 'S' ? '#e8873a' : '#e84a5a'; g.beginPath(); g.arc(x0 + dx, y0 + dy, r === 2 && i === 13 ? 7 : 5, 0, 7); g.fill(); }
      g.fillStyle = '#8fe3e0'; g.fillText('اتجاهُ انتقالِ الموجة ⟵⟵', 400, 30); });
  },
  /* ── تحديد المركز السطحي ── */
  epicenter(host, api) {
    const d = box(host, 'حدّدِ المركزَ السطحيَّ للزلزال', 'لكلِّ محطةٍ فرقُ زمنِ وصولِ الموجتين S وP. حرّكِ المنزلقَ لتحويلِ الفرقِ إلى مسافة (من منحنى الشكل ٥: كلُّ دقيقةٍ ≈ ٨٠٠ كم تقريبًا)، فتُرسَمُ دائرة. أين تلتقي الدوائرُ الثلاث؟');
    const [c, g] = canvas(d, 800, 420);
    const ST = [{ n: 'المحطة أ', x: 170, y: 120 }, { n: 'المحطة ب', x: 640, y: 110 }, { n: 'المحطة ج', x: 420, y: 370 }], E = { x: 380, y: 190 }, KM = 10; // ١ بكسل = ١٠ كم
    ST.forEach(s => { s.d = Math.hypot(s.x - E.x, s.y - E.y) * KM; s.lag = s.d / 800; s.r = 0; });
    const ctl = html(d, `<div>${ST.map((s, i) => `<div class="ctl"><label>${s.n}: فرقُ الزمن <b style="color:#ffcf3a">${AR(s.lag.toFixed(1))} د</b></label><input type="range" min="0" max="4000" step="50" value="0" data-i="${i}"><output>٠ كم</output></div>`).join('')}</div>`);
    const out = html(d, '<div class="out">حوّلْ فرقَ الزمنِ لكلِّ محطةٍ إلى مسافةٍ نصفِ قطرِ الدائرة.</div>'); let won = false;
    ctl.querySelectorAll('input').forEach(r => r.oninput = () => { const s = ST[+r.dataset.i]; s.r = +r.value; r.nextElementSibling.textContent = AR(r.value) + ' كم';
      const ok = ST.every(s => Math.abs(s.r - s.d) < 160); out.innerHTML = ok ? '🎯 <b>أحسنت!</b> التقتِ الدوائرُ الثلاثُ في نقطةٍ واحدة: هذا هو <b>المركزُ السطحيُّ للزلزال</b>.' : `المسافاتُ الصحيحةُ = فرقُ الزمن × ٨٠٠ كم تقريبًا. ${ST.filter(s => Math.abs(s.r - s.d) < 160).length ? '✓ ' + AR(ST.filter(s => Math.abs(s.r - s.d) < 160).length) + ' من ٣ صحيحة' : ''}`;
      if (ok && !won) { won = true; api.award && api.award(2, 'حدّدتَ المركزَ السطحيّ'); } });
    loop(c, () => { g.clearRect(0, 0, 800, 420); g.fillStyle = '#0d3a50'; g.fillRect(0, 0, 800, 420); g.strokeStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < 800; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 420); g.stroke(); } for (let y = 0; y < 420; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(800, y); g.stroke(); }
      const cols = ['#ff7a50', '#3d9be8', '#7ee0b4'];
      ST.forEach((s, i) => { g.strokeStyle = cols[i]; g.lineWidth = 3; g.beginPath(); g.arc(s.x, s.y, s.r / KM, 0, 7); g.stroke(); g.fillStyle = cols[i]; g.fillRect(s.x - 7, s.y - 7, 14, 14); g.fillStyle = '#fff'; g.font = '800 16px Tajawal'; g.textAlign = 'center'; g.fillText(s.n, s.x, s.y - 14); });
      if (won) { g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(E.x, E.y, 9 + Math.sin(performance.now() / 150) * 3, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillText('المركز السطحي', E.x, E.y + 30); }
      g.fillStyle = '#a9cbd6'; g.font = '600 13px Tajawal'; g.textAlign = 'left'; g.fillText('مقياس الرسم: مربع = ٤٠٠ كم', 10, 410); });
  },
  /* ── رختر ── */
  richter(host, api) {
    const d = box(host, 'حاسبةُ المقارنةِ على مقياسِ رختر', 'كلُّ زيادةٍ بدرجةٍ واحدة = سعةُ موجةٍ أكبرُ ١٠ مرّات، وطاقةٌ أكبرُ ٣٢ مرّةً تقريبًا (كما في الكتاب).');
    const ctl = html(d, '<div><div class="ctl"><label>الزلزال الأول</label><input type="range" min="3" max="9" step="0.1" value="6.5" data-i="0"><output></output></div><div class="ctl"><label>الزلزال الثاني</label><input type="range" min="3" max="9" step="0.1" value="7.5" data-i="1"><output></output></div></div>');
    const kv = html(d, '<div class="kv"><div>الفرق<b id="rd"></b></div><div>نسبةُ سعةِ الموجة<b id="ra"></b></div><div>نسبةُ الطاقةِ المتحرّرة<b id="re"></b></div></div>');
    const [c, g] = canvas(d, 800, 160); const R = ctl.querySelectorAll('input'); let n = 0;
    const fmt = x => x >= 1e6 ? AR(x.toExponential(1)) : AR(Math.round(x).toLocaleString('en').replace(/,/g, '٬'));
    const upd = () => { const a = +R[0].value, b = +R[1].value, dd = Math.abs(b - a); R[0].nextElementSibling.textContent = AR(a.toFixed(1)); R[1].nextElementSibling.textContent = AR(b.toFixed(1));
      kv.querySelector('#rd').textContent = AR(dd.toFixed(1)) + ' درجة'; kv.querySelector('#ra').textContent = '× ' + fmt(Math.pow(10, dd)); kv.querySelector('#re').textContent = '× ' + fmt(Math.pow(32, dd));
      g.clearRect(0, 0, 800, 160); [a, b].forEach((m, i) => { const w = 40 + (m - 3) / 6 * 700; g.fillStyle = i ? '#e8873a' : '#3d9be8'; g.fillRect(60, 30 + i * 60, w, 40); g.fillStyle = '#fff'; g.font = '800 18px Tajawal'; g.textAlign = 'left'; g.fillText(AR(m.toFixed(1)), 70 + w, 58 + i * 60); }); if (++n === 6) api.award && api.award(1, 'قارنتَ بين قوّتي زلزالين'); };
    R.forEach(r => r.oninput = upd); upd();
  },
  /* ── التسونامي ── */
  tsunami(host, api) {
    const d = box(host, 'رحلةُ موجةِ التسونامي نحو الشاطئ', 'اضغطْ «أطلقِ الزلزال» وتابعْ سرعةَ الموجةِ وارتفاعَها وهي تنتقلُ من المياهِ العميقةِ إلى الشاطئ.', true);
    const ctl = html(d, '<div class="ctl"><button class="sb p">🌊 أطلقِ الزلزال</button></div>'); const [c, g] = canvas(d, 800, 300);
    const out = html(d, '<div class="out">في المحيطِ المفتوح: سرعةٌ تصلُ إلى ٩٥٠ كم/ساعة وارتفاعٌ أقلُّ من متر — وقربَ الشاطئ: تتباطأُ ويصلُ ارتفاعُها إلى ٣٠ مترًا. <span class="en">إثراء: سرعةُ الموجةِ في الماءِ الضحلِ ≈ √(الجاذبية × العمق)</span></div>');
    let x = -1, done = false; ctl.querySelector('button').onclick = () => { x = 0; };
    const depth = X => X < 520 ? 7000 : Math.max(10, 7000 * (1 - (X - 520) / 230));
    loop(c, () => { g.clearRect(0, 0, 800, 300); const sky = g.createLinearGradient(0, 0, 0, 120); sky.addColorStop(0, '#1c5a73'); sky.addColorStop(1, '#2a7f9e'); g.fillStyle = sky; g.fillRect(0, 0, 800, 300);
      if (x >= 0) x = Math.min(760, x + (depth(x) > 500 ? 2.2 : 1 + depth(x) / 600));
      const H = X => { if (x < 0) return 0; const dd = X - x, base = depth(x) < 500 ? 8 + (1 - depth(x) / 500) * 70 : 6; return base * Math.exp(-(dd * dd) / (depth(x) < 500 ? 900 : 4000)); };
      g.beginPath(); g.moveTo(0, 300); for (let X = 0; X <= 800; X += 4) g.lineTo(X, 130 - H(X)); g.lineTo(800, 300); g.fillStyle = '#1e6f9a'; g.fill();
      g.beginPath(); g.moveTo(0, 300); for (let X = 0; X <= 800; X += 4) g.lineTo(X, 300 - (X < 520 ? 20 : 20 + (X - 520) / 230 * 170)); g.lineTo(800, 300); g.fillStyle = '#c99a6a'; g.fill();
      g.fillStyle = '#e8d8b0'; g.fillRect(750, 100, 50, 40); g.fillStyle = '#fff'; g.fillRect(760, 80, 12, 20); g.fillRect(778, 74, 12, 26);
      g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(80, 282, 7, 0, 7); g.fill(); g.font = '800 15px Tajawal'; g.textAlign = 'center'; g.fillText('بؤرة الزلزال', 80, 270);
      if (x >= 0) { const dep = depth(x), v = Math.min(950, Math.sqrt(9.8 * dep) * 3.6), h = dep < 500 ? Math.min(30, 1 + (1 - dep / 500) * 29) : .8;
        out.innerHTML = `العمقُ ≈ <b>${AR(Math.round(dep))} م</b> · السرعةُ ≈ <b>${AR(Math.round(v))} كم/ساعة</b> · الارتفاعُ ≈ <b>${AR(h.toFixed(1))} م</b>${x >= 760 ? ' — 💥 <b>تكسّرتِ الموجةُ على الشاطئ!</b>' : ''} <span class="en">إثراء: السرعة ≈ √(الجاذبية × العمق)</span>`;
        if (x >= 760 && !done) { done = true; api.award && api.award(1, 'تتبّعتَ موجةَ التسونامي'); } } });
  },
};

/* ═════════ الفصل الثاني: البراكين والصفائح ═════════ */
Object.assign(SIMS, {
  volcano(host, api) {
    const d = box(host, 'ما الذي يحدّدُ طريقةَ ثورانِ البركان؟', 'غيّرْ نسبةَ السيليكا وكميةَ الغازاتِ في الصهارة، ثم اضغطْ «ثوران» لتشاهدَ النتيجة.');
    const ctl = html(d, '<div><div class="ctl"><label>السيليكا</label><input type="range" min="0" max="100" value="20" data-k="s"><output></output></div><div class="ctl"><label>الغازات وبخار الماء</label><input type="range" min="0" max="100" value="20" data-k="g"><output></output></div><div class="ctl"><button class="sb p">🌋 ثوران</button></div></div>');
    const [c, g] = canvas(d, 800, 340); const out = html(d, '<div class="out"></div>'); const R = ctl.querySelectorAll('input'); let t0 = -1, parts = [], tried = new Set();
    const lv = () => ({ s: +R[0].value, g: +R[1].value });
    const kind = () => { const { s, g } = lv(); const v = s * .6 + g * .4; return v < 35 ? 0 : v < 62 ? 1 : 2; };
    const TX = ['<b>ثورانٌ هادئ</b>: لابةٌ بازلتيةٌ سائلة (قليلةُ السيليكا) تتدفّقُ بسهولةٍ وتنتشرُ بعيدًا — يتكوّنُ <b>بركانٌ درعيٌّ</b> واسعٌ قليلُ الانحدار.', '<b>ثورانٌ متوسّطُ الشدّة</b>: تُقذَفُ موادُّ صلبةٌ تتكدّسُ قربَ الفوهة — يتكوّنُ <b>بركانٌ مخروطيٌّ</b> صغيرٌ شديدُ الانحدار.', '<b>ثورانٌ انفجاريٌّ عنيف</b>: صهارةٌ لزجةٌ غنيةٌ بالسيليكا تحبسُ الغازاتِ حتى ينفجرَ الضغط — رمادٌ ومقذوفاتٌ وطبقاتٌ من اللابة: <b>بركانٌ مركّب</b>.'];
    const upd = () => { R.forEach(r => r.nextElementSibling.textContent = AR(r.value) + '٪'); out.innerHTML = 'التوقّع: ' + TX[kind()]; };
    R.forEach(r => r.oninput = upd); upd();
    ctl.querySelector('button').onclick = () => { t0 = performance.now(); parts = []; tried.add(kind()); if (tried.size === 3) api.award && api.award(2, 'جرّبتَ الأنواعَ الثلاثةَ للثوران'); };
    loop(c, () => { const k = kind(), t = t0 < 0 ? 0 : (performance.now() - t0) / 1000; g.clearRect(0, 0, 800, 340);
      const sky = g.createLinearGradient(0, 0, 0, 340); sky.addColorStop(0, '#1c5a73'); sky.addColorStop(1, '#0b2a38'); g.fillStyle = sky; g.fillRect(0, 0, 800, 340);
      const H = [70, 150, 210][k], Wd = [330, 150, 230][k]; g.beginPath(); g.moveTo(400 - Wd - 60, 330); g.quadraticCurveTo(400 - Wd * .5, 330 - H * .6, 385, 330 - H); g.lineTo(415, 330 - H); g.quadraticCurveTo(400 + Wd * .5, 330 - H * .6, 400 + Wd + 60, 330); g.closePath();
      const gr = g.createLinearGradient(0, 330 - H, 0, 330); gr.addColorStop(0, '#5a4a40'); gr.addColorStop(1, '#3a2a22'); g.fillStyle = gr; g.fill();
      if (k === 2) { g.strokeStyle = 'rgba(255,255,255,.12)'; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(400 - Wd * i / 5 - 30, 330 - H * (1 - i / 5)); g.lineTo(400 + Wd * i / 5 + 30, 330 - H * (1 - i / 5)); g.stroke(); } }
      g.fillStyle = '#ff5a1a'; g.fillRect(396, 330 - H, 8, H); g.fillStyle = '#ff7a2a'; g.beginPath(); g.ellipse(400, 334, 70, 12, 0, 0, 7); g.fill();
      if (t0 >= 0 && t < 6) { if (k === 0) { const L = Math.min(1, t / 3); g.fillStyle = '#ff6a1a'; g.beginPath(); g.moveTo(385, 330 - H); g.quadraticCurveTo(400 - Wd * .5 * L, 330 - H * .6 * L + 4, 400 - (Wd + 40) * L, 330); g.lineTo(400 + (Wd + 40) * L, 330); g.quadraticCurveTo(400 + Wd * .5 * L, 330 - H * .6 * L + 4, 415, 330 - H); g.fill(); }
        else { if (parts.length < (k === 2 ? 260 : 120)) for (let i = 0; i < (k === 2 ? 8 : 4); i++) parts.push({ x: 400, y: 330 - H, vx: (Math.random() - .5) * (k === 2 ? 9 : 5), vy: -(k === 2 ? 9 : 6) - Math.random() * (k === 2 ? 6 : 3), r: k === 2 ? 2 + Math.random() * 7 : 2 + Math.random() * 4, ash: k === 2 && Math.random() < .6 });
          parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.ash ? .02 : .25; if (p.y > 330) { p.y = 330; p.vx = 0; p.vy = 0; } g.fillStyle = p.ash ? 'rgba(160,150,140,.55)' : '#ff8a3a'; g.beginPath(); g.arc(p.x, p.y, p.ash ? p.r * 2.5 : p.r, 0, 7); g.fill(); }); } }
      g.fillStyle = '#fff'; g.font = '800 18px Tajawal'; g.textAlign = 'center'; g.fillText(['بركان درعي', 'بركان مخروطي', 'بركان مركب'][k], 400, 28); });
  },
  plates(host, api) {
    const d = box(host, 'حدودُ الصفائح: ماذا يحدثُ عند كلِّ نوع؟', 'اخترْ نوعَ الحدّ لتشاهدَ حركةَ الصفيحتين وما يتكوّنُ عندها.');
    const seg = html(d, '<div class="seg"><button data-k="0" class="on">حدود متباعدة</button><button data-k="1">حدود متقاربة</button><button data-k="2">حدود جانبية</button></div>');
    const [c, g] = canvas(d, 800, 320); const out = html(d, '<div class="out"></div>'); let k = 0, seen = new Set([0]);
    const TX = ['<b>تباعد</b>: تبتعدُ الصفيحتان فتتكوّنُ <b>حفرُ الانهدام</b> وتصعدُ الصهارةُ من الستار (ثورانُ شقوق، لابةٌ بازلتية) — مثلُ البحرِ الأحمر.', '<b>تقارب</b>: تغوصُ الصفيحةُ المحيطيةُ الأكثفُ أسفلَ الأخرى، فتنصهرُ الصخورُ وتتكوّنُ <b>البراكينُ المركّبة</b> وزلازلُ عميقةُ البؤرة — مثلُ الحزامِ الناريِّ للمحيطِ الهادي.', '<b>جانبية (تحويلية)</b>: تنزلقُ الصفيحتان بمحاذاةِ بعضِهما، فتعلقان ثم تنزلقان فجأةً مسبّبتين <b>الزلازل</b> دون براكين غالبًا.'];
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { k = +b.dataset.k; seen.add(k); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); out.innerHTML = TX[k]; if (seen.size === 3) api.award && api.award(1, 'تعرّفتَ أنواعَ حدودِ الصفائح'); });
    out.innerHTML = TX[0];
    loop(c, t => { g.clearRect(0, 0, 800, 320); g.fillStyle = '#e8873a'; g.fillRect(0, 200, 800, 120); g.fillStyle = '#c96a2a'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(100 * i + 50 + Math.sin(t + i) * 10, 270, 30, 0, 7); g.fill(); }
      g.fillStyle = '#fff'; g.font = '700 14px Tajawal'; g.textAlign = 'center'; g.fillText('الغلاف المائع (الستار)', 700, 305);
      const m = (t * 12) % 60;
      if (k === 0) { g.fillStyle = '#6f8f5a'; g.fillRect(0, 120, 380 - m, 80); g.fillRect(420 + m, 120, 380 - m, 80); g.fillStyle = '#ff5a1a'; g.beginPath(); g.moveTo(380 - m, 200); g.lineTo(420 + m, 200); g.lineTo(400, 140 + Math.sin(t * 4) * 6); g.fill(); arrowC(g, 260, 100, -60); arrowC(g, 540, 100, 60); }
      else if (k === 1) { g.fillStyle = '#2a6f9e'; g.save(); g.beginPath(); g.moveTo(0, 150); g.lineTo(380 + m, 150); g.lineTo(520 + m, 300); g.lineTo(480 + m, 300); g.lineTo(360 + m, 200); g.lineTo(0, 200); g.fill(); g.restore(); g.fillStyle = '#7a8f5a'; g.beginPath(); g.moveTo(400, 200); g.lineTo(400, 110); g.lineTo(460, 70); g.lineTo(520, 110); g.lineTo(800, 110); g.lineTo(800, 200); g.fill();
        g.fillStyle = '#ff5a1a'; g.beginPath(); g.moveTo(450, 75); g.lineTo(470, 75); g.lineTo(500, 260); g.lineTo(480, 260); g.fill(); g.fillStyle = 'rgba(170,160,150,.6)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(460 + Math.sin(t * 2 + i) * 20, 60 - ((t * 30 + i * 12) % 60), 10 + i * 2, 0, 7); g.fill(); } arrowC(g, 200, 135, 70); g.fillStyle = '#fff'; g.fillText('صفيحة محيطية', 150, 180); g.fillText('صفيحة قارية', 650, 160); }
      else { g.fillStyle = '#6f8f5a'; g.fillRect(0, 100, 800, 48); g.fillStyle = '#5f7f4a'; g.fillRect(0, 152, 800, 48); g.fillStyle = '#3a5a8a'; const s = Math.sin(t * 2) > .9 ? 18 : 0; g.fillRect(300 - m - s, 100, 14, 48); g.fillRect(300 + m + s, 152, 14, 48); arrowC(g, 200, 85, -70); arrowC(g, 600, 225, 70); if (s) { g.strokeStyle = '#ffcf3a'; g.lineWidth = 3; for (let r = 10; r < 60; r += 16) { g.beginPath(); g.arc(400, 150, r, 0, 7); g.stroke(); } } }
    });
    function arrowC(g, x, y, dx) { g.strokeStyle = g.fillStyle = '#ffcf3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, y); g.stroke(); g.beginPath(); g.moveTo(x + dx + Math.sign(dx) * 12, y); g.lineTo(x + dx, y - 8); g.lineTo(x + dx, y + 8); g.fill(); }
  },
  ptime(host, api) {
    const d = box(host, 'احسبْ زمنَ وصولِ موجاتِ P', 'اخترِ الوسطَ والمسافة: الزمن = المسافة ÷ السرعة (القشرة ٦ كم/ث، الستار العلوي ٨ كم/ث — من الكتاب).');
    const ctl = html(d, '<div><div class="seg"><button data-v="6" class="on">القشرة (٦ كم/ث)</button><button data-v="8">الستار العلوي (٨ كم/ث)</button></div><div class="ctl"><label>المسافة</label><input type="range" min="50" max="1000" step="50" value="100"><output></output></div></div>');
    const kv = html(d, '<div class="kv"><div>المسافة<b id="pd"></b></div><div>السرعة<b id="pv"></b></div><div>الزمن<b id="pt"></b></div></div>'); let v = 6, n = 0; const r = ctl.querySelector('input');
    const upd = () => { const dd = +r.value; r.nextElementSibling.textContent = AR(dd) + ' كم'; kv.querySelector('#pd').textContent = AR(dd) + ' كم'; kv.querySelector('#pv').textContent = AR(v) + ' كم/ث'; kv.querySelector('#pt').textContent = AR((dd / v).toFixed(1)) + ' ث'; if (++n === 5) api.award && api.award(1, 'حسبتَ زمنَ وصولِ الموجات'); };
    ctl.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { v = +b.dataset.v; ctl.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b)); upd(); }); r.oninput = upd; upd();
  },
  convection(host, api) {
    const d = box(host, 'تياراتُ الحملِ الحراريِّ في الستار', 'شغّلِ التسخينَ وراقبْ صعودَ المادةِ الساخنةِ ونزولَ الباردة، وكيف تتحرّكُ الصفائحُ فوقَها.');
    const ctl = html(d, '<div class="ctl"><label>حرارة اللب</label><input type="range" min="0" max="100" value="60"><output></output></div>'); const [c, g] = canvas(d, 800, 340); const r = ctl.querySelector('input'); let done = false;
    const P = Array.from({ length: 140 }, (_, i) => ({ a: Math.random() * Math.PI * 2, c: i % 2, rr: .3 + Math.random() * .6 }));
    let off = 0; r.oninput = () => { r.nextElementSibling.textContent = AR(r.value) + '٪'; if (!done && +r.value > 85) { done = true; api.award && api.award(1, 'شغّلتَ تياراتِ الحمل'); } }; r.oninput();
    loop(c, () => { const s = +r.value / 100; g.clearRect(0, 0, 800, 340); g.fillStyle = '#e8873a'; g.fillRect(0, 60, 800, 260); g.fillStyle = '#ffd04a'; g.fillRect(0, 300, 800, 40); g.fillStyle = '#5a3a20'; g.font = '800 16px Tajawal'; g.textAlign = 'center'; g.fillText('اللب (مصدر الحرارة)', 400, 326);
      off += s * 1.2; g.fillStyle = '#6f8f5a'; g.fillRect(-20 - off % 0, 30, 390, 30); g.fillRect(430, 30, 390, 30); g.fillStyle = '#fff'; g.fillText('صفيحة ⟵', 200 - (off % 40) * 0, 52); g.fillText('⟶ صفيحة', 600, 52);
      P.forEach(p => { p.a += .01 * s * (p.c ? 1 : -1); const cx = p.c ? 600 : 200, rx = 170 * p.rr, ry = 100 * p.rr; const x = cx + Math.cos(p.a) * rx, y = 180 + Math.sin(p.a) * ry; const hot = (y - 80) / 220; g.fillStyle = `rgb(${200 + 55 * hot | 0},${80 + 120 * hot | 0},${40})`; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); });
      g.fillStyle = '#fff'; g.font = '700 14px Tajawal'; g.fillText('تصعدُ الساخنة ↑', 400, 120); g.fillText('↓ تنزلُ الباردة', 60, 200); g.fillText('↓ تنزلُ الباردة', 740, 200); });
  },
});

/* ═════════ الفصل الأول: طبيعة العلم ═════════ */
Object.assign(SIMS, {
  citydata(host, api) {
    const d = box(host, 'تطبيقُ العلوم: استخلاصُ النتائجِ من جدولِ البيانات', 'توقّعٌ: «المدينةُ التي عددُ سكانِها أكبرُ تكونُ مساحتُها أكبر». مثّلِ البياناتِ بالأعمدة، ثم قرّرْ: هل تدعمُ البياناتُ التوقّع؟ (المصدر: الهيئة العامة للإحصاء — كما في الكتاب ص ٢٧)');
    const D = [['مكة المكرمة', 1675368, 550], ['المدينة المنورة', 1180770, 589], ['الرياض', 5254560, 1798], ['جدة', 3456259, 1500], ['الدمام', 903597, 800]];
    const seg = html(d, '<div class="seg"><button data-k="1" class="on">عدد السكان</button><button data-k="2">المساحة (كم²)</button><button data-k="3">الكثافة (نسمة/كم²)</button></div>');
    const [c, g] = canvas(d, 800, 320); const q = html(d, '<div class="out">هل تدعمُ البياناتُ التوقّع؟ <span class="seg" style="display:inline-flex"><button data-a="1">نعم تمامًا</button><button data-a="0">ليس تمامًا</button></span><div id="cq"></div></div>');
    let k = 1; const val = (r, k) => k === 3 ? r[1] / r[2] : r[k];
    const draw = () => { g.clearRect(0, 0, 800, 320); const mx = Math.max(...D.map(r => val(r, k))); D.forEach((r, i) => { const h = val(r, k) / mx * 220, x = 700 - i * 140; g.fillStyle = ['#0da9a6', '#3d7eb9', '#c1b489', '#07a869', '#8fb6c2'][i]; g.fillRect(x - 40, 260 - h, 80, h); g.fillStyle = '#fff'; g.font = '800 15px Tajawal'; g.textAlign = 'center'; g.fillText(r[0], x, 285); g.fillText(AR(Math.round(val(r, k)).toLocaleString('en').replace(/,/g, '٬')), x, 250 - h); }); };
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { k = +b.dataset.k; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    q.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const ok = b.dataset.a === '0'; q.querySelector('#cq').innerHTML = ok ? '<span class="ok">✔ صحيح.</span> البياناتُ لا تدعمُ التوقّعَ تمامًا: مكةُ المكرمةُ سكانُها أكثرُ من الدمامِ لكنّ مساحتَها أصغر (٥٥٠ كم² مقابل ٨٠٠ كم²)؛ لذا نضعُ توقّعًا جديدًا ونجمعُ بياناتٍ أخرى.' : '<span class="no">✘ راجعْ.</span> قارنْ مكةَ المكرمة (١٬٦٧٥٬٣٦٨ نسمة، ٥٥٠ كم²) بالدمام (٩٠٣٬٥٩٧ نسمة، ٨٠٠ كم²).'; if (ok) api.award && api.award(1, 'حلّلتَ جدولَ البيانات'); });
    draw();
  },
  si(host, api) {
    const d = box(host, 'محوّلُ وحداتِ النظامِ العالميِّ (SI)', 'اخترِ الكمية، ثم حوّلْ بين الوحدات كما في الجدول ١ (ص ٣٠).');
    const U = { 'الطول': [['ملليمتر', .001], ['سنتيمتر', .01], ['متر', 1], ['كيلومتر', 1000]], 'حجم السائل': [['ملّيلتر', .001], ['لتر', 1]], 'الكتلة': [['ملجرام', .000001], ['جرام', .001], ['كيلوجرام', 1], ['طن', 1000]] };
    const ui = html(d, `<div><div class="seg">${Object.keys(U).map((k, i) => `<button data-k="${k}" class="${i ? '' : 'on'}">${k}</button>`).join('')}</div><div class="ctl"><input type="number" value="1" step="any" style="width:120px;font:inherit;font-weight:800;border-radius:10px;border:0;padding:6px"><select id="u1"></select> = <b id="sr" style="font-size:20px;color:#8fe3e0"></b><select id="u2"></select></div></div>`);
    let k = 'الطول', n = 0; const inp = ui.querySelector('input'), s1 = ui.querySelector('#u1'), s2 = ui.querySelector('#u2');
    [s1, s2].forEach(s => s.style.cssText = 'font:inherit;font-weight:800;border-radius:10px;padding:6px');
    const fill = () => { const o = U[k].map((u, i) => `<option value="${i}">${u[0]}</option>`).join(''); s1.innerHTML = o; s2.innerHTML = o; s1.value = U[k].length - 1; s2.value = 0; calc(); };
    const calc = () => { const a = U[k][+s1.value][1], b = U[k][+s2.value][1], v = (+inp.value || 0) * a / b; ui.querySelector('#sr').textContent = AR(+v.toPrecision(10) + ''); if (++n === 6) api.award && api.award(1, 'حوّلتَ بين الوحدات'); };
    ui.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = b.dataset.k; ui.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); fill(); });
    [inp, s1, s2].forEach(e => e.oninput = calc); fill();
  },
  variables(host, api) {
    const d = box(host, 'صمّمْ تجربةً: أثرُ المضادّاتِ الحيويةِ على نموِّ البكتيريا', 'أضفْ مضادًّا حيويًّا إلى الطبقين (أ) و(ب)، واتركِ الطبقَ الثالثَ عيّنةً ضابطة، ثم احتضنِ الأطباقَ وقارنْ (الشكل ١٦).');
    const ui = html(d, '<div class="ctl"><label>الطبق أ</label><select data-p="0"><option value="-">بلا مضاد</option><option value="x">مضاد حيوي ١</option><option value="y">مضاد حيوي ٢</option></select><label>الطبق ب</label><select data-p="1"><option value="-">بلا مضاد</option><option value="x">مضاد حيوي ١</option><option value="y" selected>مضاد حيوي ٢</option></select><label>الطبق الضابط</label><b>بلا مضاد</b><button class="sb p">⏱ احتضنْ ٤٨ ساعة</button></div>');
    ui.querySelector('select').value = 'x'; ui.querySelectorAll('select').forEach(s => s.style.cssText = 'font:inherit;font-weight:800;border-radius:10px;padding:5px');
    const [c, g] = canvas(d, 800, 260); const out = html(d, '<div class="out">المتغيّرُ المستقلّ: <b>نوعُ المضادِّ الحيوي</b> · المتغيّرُ التابع: <b>نموُّ البكتيريا</b> · الثوابت: <b>درجةُ الحرارة، الزمن، كميةُ البكتيريا</b></div>');
    let t = 0, run = false; const eff = { '-': 1, x: .15, y: .55 }; const dots = Array.from({ length: 3 }, () => Array.from({ length: 220 }, () => [Math.random() * 2 * Math.PI, Math.sqrt(Math.random()) * 95, Math.random()]));
    ui.querySelector('button').onclick = () => { t = 0; run = true; };
    loop(c, () => { if (run) t = Math.min(1, t + .01); g.clearRect(0, 0, 800, 260); const S = [...ui.querySelectorAll('select')].map(s => s.value).concat('-'); const L = ['أ', 'ب', 'العينة الضابطة'];
      S.forEach((s, i) => { const x = 650 - i * 250; g.fillStyle = '#e8efe8'; g.beginPath(); g.arc(x, 120, 105, 0, 7); g.fill(); g.strokeStyle = '#9ab'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#c8b46a';
        dots[i].forEach(([a, r, q]) => { if (q < t * eff[s]) { g.beginPath(); g.arc(x + Math.cos(a) * r, 120 + Math.sin(a) * r, 4, 0, 7); g.fill(); } }); g.fillStyle = '#fff'; g.font = '800 16px Tajawal'; g.textAlign = 'center'; g.fillText(L[i] + (s === 'x' ? ' (مضاد ١)' : s === 'y' ? ' (مضاد ٢)' : ''), x, 250); });
      if (t >= 1 && run) { run = false; out.innerHTML = 'النتيجة: البكتيريا نمتْ بكثافةٍ في <b>العيّنةِ الضابطة</b>، وأقلَّ مع المضادّ ٢، وأقلَّ بكثيرٍ مع <b>المضادّ ١</b> ← المضادُّ ١ أكثرُ فاعليةً في هذه المحاكاة. <span class="en">بياناتٌ افتراضيةٌ للتوضيح</span>'; api.award && api.award(1, 'صمّمتَ تجربةً مضبوطة'); } });
  },
});

/* ═════════ الفصل الثالث: الخلية ═════════ */
Object.assign(SIMS, {
  diffuse(host, api) {
    const d = box(host, 'الانتشارُ حتى الاتزان', 'أضفْ جزيئاتٍ إلى الجهةِ اليمنى وراقبْ انتقالَها عبر الغشاءِ حتى يتساوى العدد. غيّرْ درجةَ الحرارةِ لترى أثرَها في السرعة.');
    const ctl = html(d, '<div class="ctl"><button class="sb p">➕ أضفْ ٨٠ جزيئًا</button><label>درجة الحرارة</label><input type="range" min="1" max="10" value="4"><output></output></div>');
    const [c, g] = canvas(d, 800, 280); const out = html(d, '<div class="out"></div>'); const r = ctl.querySelector('input'); let P = [], done = false;
    ctl.querySelector('button').onclick = () => { for (let i = 0; i < 80; i++) P.push({ x: 420 + Math.random() * 360, y: 20 + Math.random() * 240, vx: Math.random() - .5, vy: Math.random() - .5 }); done = false; };
    r.oninput = () => r.nextElementSibling.textContent = ['', 'باردة جدًّا', 'باردة', 'باردة', 'معتدلة', 'معتدلة', 'دافئة', 'دافئة', 'ساخنة', 'ساخنة', 'ساخنة جدًّا'][r.value]; r.oninput();
    loop(c, () => { const s = +r.value * .6; g.clearRect(0, 0, 800, 280); g.fillStyle = '#0f3446'; g.fillRect(0, 0, 800, 280); g.fillStyle = '#e8873a'; for (let y = 0; y < 280; y += 22) { if (y % 44) continue; g.fillRect(396, y, 8, 18); }
      let L = 0; P.forEach(p => { p.vx += (Math.random() - .5) * .6 * s; p.vy += (Math.random() - .5) * .6 * s; p.vx *= .9; p.vy *= .9; p.x += p.vx; p.y += p.vy; if (p.y < 5 || p.y > 275) p.vy *= -1, p.y = Math.max(5, Math.min(275, p.y)); if (p.x < 5 || p.x > 795) p.vx *= -1, p.x = Math.max(5, Math.min(795, p.x)); if (p.x < 400) L++; g.fillStyle = '#ff6ad5'; g.beginPath(); g.arc(p.x, p.y, 4, 0, 7); g.fill(); });
      const R = P.length - L; if (P.length) { out.innerHTML = `اليسار: <b>${AR(L)}</b> · اليمين: <b>${AR(R)}</b> ${Math.abs(L - R) <= P.length * .08 ? '— ✅ <b>اتزان</b>: العددُ النسبيُّ متساوٍ تقريبًا (تستمرُّ الحركةُ لكنّ الانتقالَ الصافيَ يتوقّف).' : '— الانتقالُ الصافي من التركيزِ المرتفعِ إلى المنخفض…'}`; if (!done && Math.abs(L - R) <= P.length * .08 && P.length >= 80) { done = true; api.award && api.award(1, 'وصلتَ إلى حالةِ الاتزان'); } } else out.innerHTML = 'اضغطْ «أضفْ» لتبدأ.'; });
  },
  osmosis(host, api) {
    const d = box(host, 'الخاصيةُ الأسموزية: خليةٌ نباتيةٌ في محاليلَ مختلفة', 'اخترْ تركيزَ الملحِ في المحلولِ المحيطِ بالخلية، وراقبْ حركةَ الماءِ وحجمَ الغشاءِ البلازمي (الشكل ٣).');
    const seg = html(d, '<div class="seg"><button data-k="0">ماء عذب</button><button data-k="1" class="on">تركيز مساوٍ للخلية</button><button data-k="2">ماء مالح مركّز</button></div>');
    const [c, g] = canvas(d, 800, 300); const out = html(d, '<div class="out"></div>'); let k = 1, s = 1, seen = new Set([1]);
    const TX = ['الماءُ يدخلُ الخلية ← يمتلئُ الفجوةُ ويضغطُ الغشاءُ على الجدارِ الخلوي (الجزرُ يصبحُ صلبًا). الخليةُ الحيوانيةُ في هذه الحالةِ قد تنفجر!', 'الماءُ يدخلُ ويخرجُ بمقاديرَ متساوية ← اتزان.', 'الماءُ يخرجُ من الخلية ← يبتعدُ الغشاءُ البلازميُّ عن الجدارِ الخلوي فتذبلُ (كالجزرِ في الماءِ المالح).'];
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { k = +b.dataset.k; seen.add(k); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); out.innerHTML = TX[k]; if (seen.size === 3) api.award && api.award(1, 'فهمتَ الخاصيةَ الأسموزية'); }); out.innerHTML = TX[1];
    loop(c, t => { const target = [1.08, 1, .62][k]; s += (target - s) * .02; g.clearRect(0, 0, 800, 300); g.fillStyle = ['#bfe6ff', '#cfe8d8', '#f3e3b0'][k]; g.fillRect(0, 0, 800, 300);
      g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < (k === 2 ? 60 : k === 1 ? 25 : 4); i++) { g.fillRect((i * 97 + 30) % 800, (i * 53 + 20) % 300, 6, 6); }
      g.strokeStyle = '#3a7a3a'; g.lineWidth = 10; g.strokeRect(260, 50, 280, 200); g.fillStyle = '#9fd49f'; const w = 260 * s, h = 180 * s; g.beginPath(); g.roundRect ? g.roundRect(400 - w / 2, 150 - h / 2, w, h, 20) : g.rect(400 - w / 2, 150 - h / 2, w, h); g.fill(); g.strokeStyle = '#2a6a2a'; g.lineWidth = 3; g.stroke();
      g.fillStyle = '#7a4aa8'; g.beginPath(); g.arc(400 - w * .2, 150, 22 * Math.min(1, s), 0, 7); g.fill(); g.fillStyle = 'rgba(80,140,230,.45)'; g.beginPath(); g.ellipse(400 + w * .15, 150, 60 * s, 50 * s, 0, 0, 7); g.fill();
      g.fillStyle = '#1a5ab0'; g.font = '800 30px Tajawal'; g.textAlign = 'center'; const ph = (t * 60) % 60; if (k === 0) { g.fillText('→', 200 + ph * .4, 150); g.fillText('←', 600 - ph * .4, 150); } if (k === 2) { g.fillText('←', 230 - ph * .4, 150); g.fillText('→', 570 + ph * .4, 150); }
      g.fillStyle = '#0b2a38'; g.font = '700 15px Tajawal'; g.fillText('الجدار الخلوي', 400, 40); g.fillText('■ جزيئات الملح', 700, 285); });
  },
  photoeq(host, api) {
    const d = box(host, 'عُدَّ الذرّاتِ في معادلةِ البناءِ الضوئي', 'غيّرِ المعاملاتِ (الأعدادَ أمامَ الجزيئات) حتى تتساوى ذرّاتُ C وH وO في الطرفين — ٦CO₂ + ٦H₂O ← C₆H₁₂O₆ + ٦O₂');
    const ui = html(d, `<div class="ctl" style="justify-content:center;font-size:20px;font-weight:800;direction:ltr"><input type="number" min="1" max="9" value="1" data-i="0" style="width:52px"> CO₂ + <input type="number" min="1" max="9" value="1" data-i="1" style="width:52px"> H₂O → C₆H₁₂O₆ + <input type="number" min="1" max="9" value="1" data-i="2" style="width:52px"> O₂</div>`);
    ui.querySelectorAll('input').forEach(i => i.style.cssText += ';font:inherit;border-radius:8px;border:0;padding:4px;text-align:center');
    const kv = html(d, '<div class="kv"></div>'); const out = html(d, '<div class="out"></div>'); let won = false;
    const upd = () => { const [a, b, e] = [...ui.querySelectorAll('input')].map(x => +x.value || 0); const L = { C: a, H: 2 * b, O: 2 * a + b }, R = { C: 6, H: 12, O: 6 + 2 * e };
      kv.innerHTML = ['C', 'H', 'O'].map(x => `<div>${x}<b class="${L[x] === R[x] ? 'ok' : 'no'}">${AR(L[x])} ⟷ ${AR(R[x])}</b></div>`).join('');
      const ok = ['C', 'H', 'O'].every(x => L[x] === R[x]); out.innerHTML = ok ? '✅ <b>متوازنة!</b> قبل التفاعل وبعده: C = ٦، H = ١٢، O = ١٨ — الذرّاتُ لا تُفنى ولا تُستحدث، بل يُعادُ ترتيبُها.' : 'المتفاعلات ⟷ النواتج: اجعلِ الأعدادَ متساويةً لكلِّ عنصر.'; if (ok && !won) { won = true; api.award && api.award(2, 'وازنتَ معادلةَ البناءِ الضوئي'); } };
    ui.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  },
  chromo(host, api) {
    const d = box(host, 'حاسبةُ الكروموسومات: من الأبوين إلى الأبناء', 'اخترِ المخلوقَ لترى عددَ الكروموسوماتِ في الخلايا الجسميةِ والجنسيةِ والبويضةِ المخصبة.');
    const O = [['الإنسان', 46, 46], ['ذبابة الفاكهة', 8, 8], ['الأسد', 48, 48], ['البغل (حمار ٦٢ × فرس ٦٤)', 62, 64]];
    const seg = html(d, `<div class="seg">${O.map((o, i) => `<button data-i="${i}" class="${i ? '' : 'on'}">${o[0]}</button>`).join('')}</div>`);
    const kv = html(d, '<div class="kv"></div>'); const out = html(d, '<div class="out"></div>'); const seen = new Set([0]);
    const show = i => { const [n, a, b] = O[i]; kv.innerHTML = `<div>خلية جسمية (الأب)<b>${AR(a)}</b></div><div>خلية جسمية (الأم)<b>${AR(b)}</b></div><div>خلية جنسية (أحادية)<b>${AR(a / 2)} و ${AR(b / 2)}</b></div><div>البويضة المخصبة<b>${AR(a / 2 + b / 2)}</b></div>`;
      out.innerHTML = a === b ? `الانقسامُ المنصّفُ يُنصّفُ العدد (${AR(a)} ← ${AR(a / 2)})، والإخصابُ يعيدُه (${AR(a / 2)} + ${AR(b / 2)} = ${AR(a)}).` : `البغلُ يحملُ ${AR(a / 2)} من الحمارِ و${AR(b / 2)} من الفرس = <b>${AR(a / 2 + b / 2)}</b> (عددٌ فرديّ)؛ فلا تتزاوجُ الكروموسوماتُ في أزواجٍ متماثلةٍ أثناءَ الانقسامِ المنصّف ← البغلُ عقيم.`; };
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { seen.add(+b.dataset.i); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); show(+b.dataset.i); if (seen.size === 4) api.award && api.award(1, 'حسبتَ أعدادَ الكروموسومات'); }); show(0);
  },
});

/* ═════════ الفصل الرابع: الوراثة ═════════ */
Object.assign(SIMS, {
  dnapair(host, api) {
    const d = box(host, 'ابنِ السلسلةَ المقابلةَ في DNA', 'اضغطْ على كلِّ قاعدةٍ فارغةٍ في السلسلةِ الجديدة لتختارَ القاعدةَ المكمّلة: A ↔ T و G ↔ C.');
    const B = ['A', 'T', 'G', 'C'], comp = { A: 'T', T: 'A', G: 'C', C: 'G' }, col = { A: '#e84a5a', T: '#3d9be8', G: '#07a869', C: '#e8a33a' };
    let seq = [], ans = [], won = false;
    const ui = html(d, '<div><div class="ctl"><button class="sb p">🔀 سلسلةٌ جديدة</button><button class="sb" data-m="rna">نسخُ RNA بدلًا من DNA</button></div><div id="dn" style="display:grid;gap:6px;direction:ltr"></div></div>'); const out = html(d, '<div class="out"></div>'); let rna = false;
    const draw = () => { const g = ui.querySelector('#dn'); g.style.gridTemplateColumns = `repeat(${seq.length},1fr)`;
      g.innerHTML = seq.map(b => `<div style="background:${col[b]};color:#fff;border-radius:10px;padding:10px 0;text-align:center;font-weight:900;font-size:20px">${b}</div>`).join('') + seq.map(() => '<div style="text-align:center;color:#8fe3e0">┃</div>').join('') + ans.map((a, i) => `<button data-i="${i}" style="border:2px dashed #8fe3e0;background:${a ? col[a === 'U' ? 'T' : a] : 'transparent'};color:#fff;border-radius:10px;padding:10px 0;font-weight:900;font-size:20px;cursor:pointer">${a || '?'}</button>`).join('');
      g.querySelectorAll('button').forEach(b => b.onclick = () => { const i = +b.dataset.i, opts = rna ? ['A', 'U', 'G', 'C'] : B; ans[i] = opts[(opts.indexOf(ans[i]) + 1) % 4]; draw(); check(); }); };
    const want = b => rna ? (b === 'A' ? 'U' : comp[b]) : comp[b];
    const check = () => { const ok = seq.every((b, i) => ans[i] === want(b)); const n = seq.filter((b, i) => ans[i] === want(b)).length;
      out.innerHTML = ok ? `✅ <b>صحيح!</b> السلسلةُ الأصلية ${seq.join('')} ← ${rna ? 'RNA' : 'المقابلة'} ${ans.join('')}${rna ? ' (حلَّ اليوراسيل U محلَّ الثايمين T)' : ''}` : `صحيح: ${AR(n)} من ${AR(seq.length)}`; if (ok && !won) { won = true; api.award && api.award(2, 'بنيتَ السلسلةَ المكمّلة'); } };
    const fresh = () => { seq = Array.from({ length: 6 }, () => B[Math.floor(Math.random() * 4)]); ans = seq.map(() => ''); won = false; draw(); check(); };
    ui.querySelector('.sb.p').onclick = fresh; ui.querySelector('[data-m]').onclick = e => { rna = !rna; e.target.classList.toggle('p', rna); e.target.textContent = rna ? 'العودة إلى DNA' : 'نسخُ RNA بدلًا من DNA'; ans = seq.map(() => ''); draw(); check(); };
    fresh();
  },
  punnett(host, api) {
    const d = box(host, 'مربعُ بانيت التفاعلي', 'اخترِ الطرازَ الجينيَّ لكلِّ أبٍ، فيُملأُ المربعُ وتُحسَبُ نسبُ الطرزِ الجينيةِ والشكلية.');
    const G = ['TT', 'Tt', 'tt'];
    const ui = html(d, `<div class="ctl"><label>الأب الأول</label><div class="seg" data-p="0">${G.map((x, i) => `<button data-g="${x}" class="${i === 1 ? 'on' : ''}">${x}</button>`).join('')}</div><label>الأب الثاني</label><div class="seg" data-p="1">${G.map((x, i) => `<button data-g="${x}" class="${i === 1 ? 'on' : ''}">${x}</button>`).join('')}</div></div><div class="ctl"><label>الصفة</label><select><option value="0">طول الساق في البازلاء (T طويل سائد، t قصير)</option><option value="1">لون البذور (Y أصفر سائد، y أخضر)</option><option value="2">لون شعر القطط (B أسود سائد، b أشقر)</option></select></div>`);
    ui.querySelector('select').style.cssText = 'font:inherit;font-weight:800;border-radius:10px;padding:6px;max-width:100%';
    const box2 = html(d, '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:center"><table id="pq" style="border-collapse:collapse;direction:ltr;font-size:24px;font-weight:900"></table><div class="kv" id="pr" style="flex:1;min-width:240px"></div></div>');
    const TR = [['T', 'طويل', 'قصير'], ['Y', 'أصفر', 'أخضر'], ['B', 'أسود', 'أشقر']]; let P = ['Tt', 'Tt'], n = 0;
    ui.querySelectorAll('.seg').forEach(s => s.querySelectorAll('button').forEach(b => b.onclick = () => { P[+s.dataset.p] = b.dataset.g; s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); upd(); }));
    ui.querySelector('select').onchange = upd;
    function upd() { const t = TR[+ui.querySelector('select').value], L = t[0], l = L.toLowerCase(); const a = P[0].replace(/T/g, L).replace(/t/g, l), b = P[1].replace(/T/g, L).replace(/t/g, l);
      const cell = (x, y) => [x, y].sort((p, q) => (p === L ? 0 : 1) - (q === L ? 0 : 1)).join('');
      const kids = [...a].flatMap(x => [...b].map(y => cell(x, y))); const cnt = {}; kids.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
      const td = 'border:2px solid #8fe3e0;width:64px;height:56px;text-align:center';
      box2.querySelector('#pq').innerHTML = `<tr><td style="${td};border:0"></td>${[...a].map(x => `<td style="${td};color:#c1b489">${x}</td>`).join('')}</tr>` + [...b].map(y => `<tr><td style="${td};color:#c1b489">${y}</td>${[...a].map(x => `<td style="${td};background:${cell(x, y).includes(L) ? 'rgba(13,169,166,.35)' : 'rgba(232,135,58,.35)'};color:#fff">${cell(x, y)}</td>`).join('')}</tr>`).join('');
      const dom = kids.filter(k => k.includes(L)).length;
      box2.querySelector('#pr').innerHTML = Object.entries(cnt).map(([k, v]) => `<div>${k}<b>${AR(v * 25)}٪</b></div>`).join('') + `<div>${t[1]} (سائد)<b>${AR(dom * 25)}٪</b></div><div>${t[2]} (متنحٍّ)<b>${AR((4 - dom) * 25)}٪</b></div>`;
      if (++n === 5) api.award && api.award(2, 'استعملتَ مربعَ بانيت'); }
    upd();
  },
});

/* ═════════ الفصل الخامس: تركيب الذرة ═════════ */
const ELN = ['', 'الهيدروجين H', 'الهيليوم He', 'الليثيوم Li', 'البريليوم Be', 'البورون B', 'الكربون C', 'النيتروجين N', 'الأكسجين O', 'الفلور F', 'النيون Ne', 'الصوديوم Na', 'المغنيسيوم Mg', 'الألومنيوم Al', 'السيليكون Si', 'الفوسفور P', 'الكبريت S', 'الكلور Cl', 'الأرجون Ar', 'البوتاسيوم K', 'الكالسيوم Ca'];
Object.assign(SIMS, {
  rutherford(host, api) {
    const d = box(host, 'تجربةُ رذرفورد: صفيحةُ الذهب', 'أطلقْ جسيماتِ ألفا نحو صفيحةِ الذهب، وقارنْ بين ما توقّعَه نموذجُ طومسون وما حدثَ فعلًا (النموذجُ النووي).');
    const seg = html(d, '<div class="seg"><button data-k="t">نموذج طومسون (المتوقّع)</button><button data-k="r" class="on">النموذج النووي (ما حدث)</button><button class="sb p" data-go>☢ أطلقْ ٤٠ جسيمًا</button></div>');
    const [c, g] = canvas(d, 800, 320); const out = html(d, '<div class="out"></div>'); let k = 'r', P = [], st = { s: 0, d: 0, b: 0 }, shots = 0;
    seg.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = b.dataset.k; P = []; st = { s: 0, d: 0, b: 0 }; seg.querySelectorAll('[data-k]').forEach(x => x.classList.toggle('on', x === b)); });
    seg.querySelector('[data-go]').onclick = () => { for (let i = 0; i < 40; i++) P.push({ x: 20 - i * 18, y: 40 + Math.random() * 240, vx: 6, vy: 0, done: false }); if (++shots === 2) api.award && api.award(1, 'أجريتَ تجربةَ رذرفورد'); };
    const nuclei = []; for (let y = 50; y < 300; y += 50) nuclei.push([400, y]);
    loop(c, () => { g.clearRect(0, 0, 800, 320); g.fillStyle = '#e8c35a'; g.fillRect(392, 20, 16, 280);
      nuclei.forEach(([x, y]) => { if (k === 'r') { g.fillStyle = '#ff6a3a'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } else { g.fillStyle = 'rgba(255,120,90,.25)'; g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); } });
      P.forEach(p => { if (p.x > 380 && p.x < 420 && !p.hit) { p.hit = true; if (k === 'r') { const n = nuclei.reduce((a, b) => Math.abs(b[1] - p.y) < Math.abs(a[1] - p.y) ? b : a); const dy = p.y - n[1]; if (Math.abs(dy) < 3) { p.vx = -6; st.b++; } else if (Math.abs(dy) < 9) { p.vy = Math.sign(dy) * 4; st.d++; } else st.s++; } else { p.vy = (Math.random() - .5) * .4; st.s++; } }
        p.x += p.vx; p.y += p.vy; if (p.x > -10 && p.x < 810) { g.fillStyle = '#7ee0ff'; g.beginPath(); g.arc(p.x, p.y, 3.5, 0, 7); g.fill(); } });
      P = P.filter(p => p.x > -400 && p.x < 820 && p.y > -10 && p.y < 330);
      out.innerHTML = `اخترقتْ دون انحراف: <b>${AR(st.s)}</b> · انحرفتْ: <b>${AR(st.d)}</b> · ارتدّتْ: <b>${AR(st.b)}</b> — ${k === 'r' ? 'الارتدادُ النادرُ يدلُّ على <b>نواةٍ صغيرةٍ كثيفةٍ موجبة</b>، والاختراقُ الكبيرُ يدلُّ على أنّ معظمَ الذرّةِ <b>فراغ</b>.' : 'في نموذجِ طومسون الشحنةُ الموجبةُ موزّعة، فلا تكفي لصدِّ جسيماتِ ألفا: لا ارتدادَ متوقَّع.'}`; });
  },
  atombuild(host, api) {
    const d = box(host, 'ابنِ ذرّتَك: البروتونات والنيوترونات والإلكترونات', 'غيّرْ أعدادَ الجسيماتِ وراقبْ: اسمَ العنصر، والعددَ الذرّي، والعددَ الكتلي، والشحنة، والنظير.');
    const ctl = html(d, '<div><div class="ctl"><label>البروتونات p⁺</label><input type="range" min="1" max="20" value="6" data-k="p"><output></output></div><div class="ctl"><label>النيوترونات n⁰</label><input type="range" min="0" max="22" value="6" data-k="n"><output></output></div><div class="ctl"><label>الإلكترونات e⁻</label><input type="range" min="0" max="22" value="6" data-k="e"><output></output></div></div>');
    const [c, g] = canvas(d, 800, 260); const kv = html(d, '<div class="kv"></div>'); const R = {}; ctl.querySelectorAll('input').forEach(r => R[r.dataset.k] = r); const seen = new Set();
    const upd = () => { const p = +R.p.value, n = +R.n.value, e = +R.e.value; Object.values(R).forEach(r => r.nextElementSibling.textContent = AR(r.value)); const q = p - e;
      kv.innerHTML = `<div>العنصر<b>${ELN[p]}</b></div><div>العدد الذري<b>${AR(p)}</b></div><div>العدد الكتلي<b>${AR(p + n)}</b></div><div>النظير<b>${ELN[p].split(' ')[0]}-${AR(p + n)}</b></div><div>الشحنة<b>${q === 0 ? 'متعادلة' : (q > 0 ? '+' : '−') + AR(Math.abs(q))}</b></div>`; seen.add(p); if (seen.size === 4) api.award && api.award(1, 'بنيتَ ذرّاتِ عناصرَ مختلفة'); };
    Object.values(R).forEach(r => r.oninput = upd); upd();
    loop(c, t => { const p = +R.p.value, n = +R.n.value, e = +R.e.value; g.clearRect(0, 0, 800, 260); const N = p + n;
      for (let i = 0; i < N; i++) { const a = i * 2.4, r = 5 * Math.sqrt(i); g.fillStyle = i % 2 === 0 && Math.floor(i / 2) < p || i % 2 && Math.floor(i / 2) >= n ? '#e84a4a' : '#9aa3ad'; g.beginPath(); g.arc(400 + Math.cos(a) * r, 130 + Math.sin(a) * r, 6, 0, 7); g.fill(); }
      const per = [2, 8, 8, 8]; let left = e; for (let s = 0; left > 0; s++) { const cnt = Math.min(left, per[s]); left -= cnt; const rr = 45 + s * 28; g.strokeStyle = 'rgba(143,182,194,.35)'; g.beginPath(); g.ellipse(400, 130, rr * 2.2, rr, 0, 0, 7); g.stroke(); for (let i = 0; i < cnt; i++) { const a = t * (1.2 / (s + 1)) + i / cnt * 6.283; g.fillStyle = '#3aa0e0'; g.beginPath(); g.arc(400 + Math.cos(a) * rr * 2.2, 130 + Math.sin(a) * rr, 4.5, 0, 7); g.fill(); } } });
  },
  halflife(host, api) {
    const d = box(host, 'محاكاةُ عمرِ النصف', 'اخترِ النظير، وحرّكِ الزمنَ لترى الكتلةَ المتبقّية: الكتلةُ المتبقّية = الكتلةُ في البداية ÷ ٢^(عدد فترات عمر النصف).');
    const I = [['اليود-١٣١', 8, 'يوم', 4], ['الثوريوم-٢٣٤', 24, 'يوم', 64], ['التريتيوم (الهيدروجين-٣)', 12.5, 'سنة', 20], ['الرادون-٢٢٢', 3.8, 'يوم', 50], ['الكربون-١٤', 5730, 'سنة', 100]];
    const ui = html(d, `<div><div class="seg">${I.map((x, i) => `<button data-i="${i}" class="${i ? '' : 'on'}">${x[0]}</button>`).join('')}</div><div class="ctl"><label>الزمن</label><input type="range" min="0" max="6" step="0.05" value="0"><output></output></div></div>`);
    const [c, g] = canvas(d, 800, 260); const kv = html(d, '<div class="kv"></div>'); let k = 0, n = 0; const r = ui.querySelector('input');
    ui.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { k = +b.dataset.i; ui.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('on', x === b)); upd(); });
    const fmt = v => AR((Math.round(v * 1000) / 1000).toString());
    function upd() { const [nm, h, u, m0] = I[k], f = +r.value, time = f * h, m = m0 / Math.pow(2, f); r.nextElementSibling.textContent = fmt(time) + ' ' + u;
      kv.innerHTML = `<div>عمر النصف<b>${fmt(h)} ${u}</b></div><div>عدد الفترات<b>${fmt(f)}</b></div><div>الكتلة في البداية<b>${fmt(m0)} جم</b></div><div>الكتلة المتبقّية<b>${fmt(m)} جم</b></div>`;
      g.clearRect(0, 0, 800, 260); g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.moveTo(60, 20); g.lineTo(60, 230); g.lineTo(780, 230); g.stroke();
      g.strokeStyle = '#0da9a6'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= 6; x += .05) { const X = 60 + x / 6 * 720, Y = 230 - 200 / Math.pow(2, x); x ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke(); g.lineWidth = 1;
      for (let i = 0; i <= 6; i++) { const X = 60 + i / 6 * 720; g.fillStyle = '#a9cbd6'; g.font = '700 13px Tajawal'; g.textAlign = 'center'; g.fillText(AR(i), X, 250); g.fillText(fmt(m0 / Math.pow(2, i)), X, 222 - 200 / Math.pow(2, i)); }
      const X = 60 + f / 6 * 720, Y = 230 - 200 / Math.pow(2, f); g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(X, Y, 8, 0, 7); g.fill(); if (++n === 8) api.award && api.award(1, 'استكشفتَ عمرَ النصف'); }
    r.oninput = upd; upd();
  },
});
SIMS.isotope = SIMS.atombuild;

/* ═════════ الفصل السادس: الجدول الدوري ═════════ */
const PT = 'H هيدروجين|He هيليوم|Li ليثيوم|Be بريليوم|B بورون|C كربون|N نيتروجين|O أكسجين|F فلور|Ne نيون|Na صوديوم|Mg مغنيسيوم|Al ألومنيوم|Si سيليكون|P فوسفور|S كبريت|Cl كلور|Ar أرجون|K بوتاسيوم|Ca كالسيوم|Sc سكانديوم|Ti تيتانيوم|V فاناديوم|Cr كروم|Mn منجنيز|Fe حديد|Co كوبالت|Ni نيكل|Cu نحاس|Zn خارصين|Ga جاليوم|Ge جرمانيوم|As زرنيخ|Se سيلينيوم|Br بروم|Kr كريبتون|Rb روبيديوم|Sr سترونشيوم|Y إتريوم|Zr زركونيوم|Nb نيوبيوم|Mo موليبدينوم|Tc تكنيتيوم|Ru روثينيوم|Rh روديوم|Pd بلاديوم|Ag فضة|Cd كادميوم|In إنديوم|Sn قصدير|Sb أنتيمون|Te تيلوريوم|I يود|Xe زينون|Cs سيزيوم|Ba باريوم|La لانثانوم|Ce سيريوم|Pr براسيوديميوم|Nd نيوديميوم|Pm بروميثيوم|Sm ساماريوم|Eu يوروبيوم|Gd جادولينيوم|Tb تيربيوم|Dy ديسبروسيوم|Ho هولميوم|Er إربيوم|Tm ثوليوم|Yb إتيربيوم|Lu لوتيتيوم|Hf هافنيوم|Ta تنتالوم|W تنجستون|Re رينيوم|Os أوزميوم|Ir إيريديوم|Pt بلاتين|Au ذهب|Hg زئبق|Tl ثاليوم|Pb رصاص|Bi بزموت|Po بولونيوم|At أستاتين|Rn رادون|Fr فرانسيوم|Ra راديوم|Ac أكتينيوم|Th ثوريوم|Pa بروتاكتينيوم|U يورانيوم|Np نبتونيوم|Pu بلوتونيوم|Am أميريسيوم|Cm كوريوم|Bk بركيليوم|Cf كاليفورنيوم|Es أينشتاينيوم|Fm فيرميوم|Md مندليفيوم|No نوبليوم|Lr لورنسيوم|Rf رذرفورديوم|Db دوبنيوم|Sg سيبورجيوم|Bh بوريوم|Hs هاسيوم|Mt مايتنريوم|Ds دارمشتاتيوم|Rg رونتجينيوم|Cn كوبرنيسيوم|Nh نيهونيوم|Fl فليروفيوم|Mc موسكوفيوم|Lv ليفرموريوم|Ts تينيسين|Og أوجانيسون'.split('|').map(s => s.split(' '));
const MASS = [1.008, 4.003, 6.941, 9.012, 10.811, 12.011, 14.007, 15.999, 18.998, 20.180, 22.990, 24.305, 26.982, 28.086, 30.974, 32.065, 35.453, 39.948, 39.098, 40.078]; // من الكتاب ص ١٨٠–١٨١
const METALLOID = [5, 14, 32, 33, 51, 52, 84, 117], NONMETAL = [1, 2, 6, 7, 8, 9, 10, 15, 16, 17, 18, 34, 35, 36, 53, 54, 85, 86, 118];
const GAS = [1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86], LIQ = [35, 80], SYN = z => z === 43 || z === 61 || z >= 93;
function ptPos(z) { // [الدورة، المجموعة] أو [صف f، عمود]
  const P = [[1, 1], [2, 3], [3, 11], [4, 19], [5, 37], [6, 55], [7, 87]];
  if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
  if (z >= 58 && z <= 71) return [9, z - 58 + 4]; if (z >= 90 && z <= 103) return [10, z - 90 + 4];
  let per = 0; for (let i = P.length - 1; i >= 0; i--) if (z >= P[i][1]) { per = P[i][0]; break; }
  const s = P[per - 1][1], k = z - s;
  if (per <= 3) return [per, k < 2 ? k + 1 : k + 11];
  if (per <= 5) return [per, k + 1];
  if (k < 3) return [per, k + 1]; return [per, z - (per === 6 ? 72 : 104) + 4];
}
const cat = z => METALLOID.includes(z) ? 'شبه فلز' : NONMETAL.includes(z) ? 'لافلز' : 'فلز';
const famOf = (z, g) => z === 1 ? 'لافلز (المجموعة ١)' : g === 1 ? 'الفلزات القلوية' : g === 2 ? 'الفلزات القلوية الأرضية' : (z >= 58 && z <= 71) ? 'اللانثانيدات' : (z >= 90 && z <= 103) ? 'الأكتينيدات' : g >= 3 && g <= 12 ? 'العناصر الانتقالية' : g === 13 ? 'عائلة البورون' : g === 14 ? 'مجموعة الكربون' : g === 15 ? 'مجموعة النيتروجين' : g === 16 ? 'عائلة الأكسجين' : g === 17 ? 'الهالوجينات' : 'الغازات النبيلة';
Object.assign(SIMS, {
  ptable(host, api) {
    const d = box(host, 'الجدولُ الدوريُّ التفاعلي', 'المسْ أيَّ عنصرٍ لترى مفتاحَه، واستخدمِ الأزرارَ لتلوينِ الجدولِ حسب نوعِ العنصرِ أو المنطقة أو الحالة. جرّبْ «تحدّي الموقع»!');
    const seg = html(d, '<div class="seg"><button data-m="cat" class="on">فلز / لافلز / شبه فلز</button><button data-m="zone">المناطق</button><button data-m="state">حالة المادة</button><button data-m="quiz">🎯 تحدّي الموقع</button></div>');
    const grid = html(d, '<div style="display:grid;grid-template-columns:repeat(18,1fr);gap:2px;direction:ltr;margin-top:8px;font-family:Tajawal,Arial"></div>');
    const info = html(d, '<div class="out">المسْ عنصرًا…</div>'); let mode = 'cat', target = 0, score = 0, tries = 0;
    const colr = z => { const [p, g] = ptPos(z); if (mode === 'zone') return p >= 9 ? '#7a5aa8' : (g >= 3 && g <= 12) ? '#3d7eb9' : '#0da9a6'; if (mode === 'state') return GAS.includes(z) ? '#e84a5a' : LIQ.includes(z) ? '#3aa0e0' : SYN(z) ? '#8a8a8a' : '#c1b489'; const c = cat(z); return c === 'فلز' ? '#5a9fc8' : c === 'لافلز' ? '#e8c34a' : '#7cc06a'; };
    const cells = [];
    for (let z = 1; z <= 118; z++) { const [p, g] = ptPos(z); const b = document.createElement('button'); b.style.cssText = `grid-row:${p > 7 ? p + 1 : p};grid-column:${g};border:0;border-radius:4px;padding:2px 0;font:800 clamp(8px,1.6vw,13px) Tajawal,Arial;color:#0b2a38;cursor:pointer;min-height:26px;line-height:1.1`; b.innerHTML = `<small style="display:block;font-size:.7em;opacity:.8">${z}</small>${PT[z - 1][0]}`; b.onclick = () => pick(z); grid.appendChild(b); cells[z] = b; }
    const gap = document.createElement('div'); gap.style.cssText = 'grid-row:8;grid-column:1/19;height:6px'; grid.appendChild(gap);
    const paint = () => cells.forEach((b, z) => { if (b) { b.style.background = colr(z); b.style.outline = ''; } });
    function pick(z) { const [p, g] = ptPos(z), [sym, nm] = PT[z - 1]; const per = p > 7 ? (p === 9 ? 6 : 7) : p;
      if (mode === 'quiz') { tries++; const ok = z === target; if (ok) score++; cells[target].style.outline = '3px solid #ffcf3a'; info.innerHTML = (ok ? '✅ <b>صحيح!</b> ' : `✘ اخترتَ ${nm}. الصحيحُ مظلّلٌ بالأصفر. `) + `النتيجة: ${AR(score)} من ${AR(tries)} <button class="sb p" id="qn">التالي</button>`; info.querySelector('#qn').onclick = ask; if (score === 5) api.award && api.award(2, 'أتقنتَ مواقعَ العناصر'); return; }
      info.innerHTML = `<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="background:${colr(z)};color:#0b2a38;border-radius:10px;padding:8px 14px;text-align:center;min-width:90px;direction:ltr"><small>${z}</small><div style="font-size:30px;font-weight:900">${sym}</div><small>${MASS[z - 1] ? MASS[z - 1].toFixed(3) : 'انظر ص ١٨٠–١٨١'}</small></div><div><b style="font-size:20px">${nm}</b><br>العدد الذري: <b>${AR(z)}</b> · الدورة: <b>${AR(per)}</b>${p > 7 ? '' : ` · المجموعة: <b>${AR(g)}</b>`}<br>${cat(z)} · ${famOf(z, p > 7 ? 0 : g)} · ${GAS.includes(z) ? 'غاز' : LIQ.includes(z) ? 'سائل' : 'صلب'}${SYN(z) ? ' (مُصنَّع)' : ''} في درجة حرارة الغرفة</div></div>`; }
    function ask() { const pool = [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 27, 28, 29, 30, 35, 47, 53, 79, 80, 82, 92]; target = pool[Math.floor(Math.random() * pool.length)]; paint(); info.innerHTML = `🎯 أين يقعُ عنصرُ <b>${PT[target - 1][1]}</b>؟ المسْه في الجدول.`; }
    seg.querySelectorAll('button').forEach(b => b.onclick = () => { mode = b.dataset.m; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); paint(); if (mode === 'quiz') { score = 0; tries = 0; ask(); } else info.innerHTML = { cat: '🟦 فلز · 🟨 لافلز · 🟩 شبه فلز', zone: '🟩 العناصر الممثلة (١، ٢، ١٣–١٨) · 🟦 العناصر الانتقالية (٣–١٢) · 🟪 الانتقالية الداخلية', state: '🟥 غاز · 🟦 سائل · 🟨 صلب · ⬜ مُصنَّع' }[mode]; });
    paint(); info.innerHTML = '🟦 فلز · 🟨 لافلز · 🟩 شبه فلز — المسْ عنصرًا لتعرضَ مفتاحَه.';
  },
  periodicity(host, api) {
    const d = box(host, 'الدورية: عددُ ذرّاتِ الكلورِ والأكسجينِ التي تتّحدُ مع العناصر ١–٢٠', 'لاحظِ النمطَ المتكرّرَ في كلِّ دورة (مستوحى من الرسم البياني ص ١٨٣). المسْ عمودًا لترى المركّب.', true);
    const CL = [1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2], OX = [.5, 0, .5, 1, 1.5, 2, 1.5, 1, .5, 0, .5, 1, 1.5, 2, 1.5, 1, .5, 0, .5, 1];
    const F = ['HCl / H₂O', '—', 'LiCl / Li₂O', 'BeCl₂ / BeO', 'BCl₃ / B₂O₃', 'CCl₄ / CO₂', 'NCl₃ / N₂O₃', 'OCl₂', 'ClF / F₂O', '—', 'NaCl / Na₂O', 'MgCl₂ / MgO', 'AlCl₃ / Al₂O₃', 'SiCl₄ / SiO₂', 'PCl₃ / P₂O₃', 'SCl₂', 'Cl₂O', '—', 'KCl / K₂O', 'CaCl₂ / CaO'];
    const [c, g] = canvas(d, 800, 300); const out = html(d, '<div class="out">الخطُّ الأخضر: الكلور · الخطُّ الأحمر: الأكسجين.</div>'); let sel = -1, n = 0;
    const X = i => 50 + i * 37, Y = v => 260 - v * 55;
    const draw = () => { g.clearRect(0, 0, 800, 300); g.strokeStyle = 'rgba(255,255,255,.12)'; for (let v = 0; v <= 4; v++) { g.beginPath(); g.moveTo(40, Y(v)); g.lineTo(790, Y(v)); g.stroke(); g.fillStyle = '#a9cbd6'; g.font = '700 12px Tajawal'; g.fillText(AR(v), 22, Y(v) + 4); }
      [[CL, '#07a869'], [OX, '#e84a5a']].forEach(([A, col]) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); A.forEach((v, i) => i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v))); g.stroke(); A.forEach((v, i) => { g.fillStyle = col; g.beginPath(); g.arc(X(i), Y(v), 4, 0, 7); g.fill(); }); }); g.lineWidth = 1;
      PT.slice(0, 20).forEach((e, i) => { g.fillStyle = i === sel ? '#ffcf3a' : '#e6f2f5'; g.font = '800 13px Tajawal'; g.textAlign = 'center'; g.fillText(e[0], X(i), 285); });
      [[2, 9], [10, 17]].forEach(([a, b]) => { g.fillStyle = 'rgba(13,169,166,.08)'; g.fillRect(X(a) - 15, 20, X(b) - X(a) + 30, 245); }); g.textAlign = 'left'; };
    c.onclick = e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 800; sel = Math.max(0, Math.min(19, Math.round((x - 50) / 37))); draw(); out.innerHTML = `<b>${PT[sel][1]} (${PT[sel][0]})</b>: يتّحدُ مع <b>${AR(CL[sel])}</b> ذرّة كلور، ومع <b>${AR(OX[sel])}</b> ذرّة أكسجين لكلِّ ذرّة — ${F[sel]} <span class="en">إثراء: صيغٌ شائعة</span>`; if (++n === 5) api.award && api.award(1, 'اكتشفتَ دوريةَ الخصائص'); };
    draw();
  },
});
