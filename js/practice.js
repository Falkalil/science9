// «تمرّن»: تحدّي اليوم (مراجعةٌ متباعدة + سلسلةُ أيّام) • بطاقاتُ المصطلحات (لايتنر) • تدريبُ نافس (الصف السادس)
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 60000) / 864e5); };
const GN = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'];

const CSS = `
#prac{position:fixed;inset:0;z-index:9500;background:#eef3f5;display:none;flex-direction:column;font-family:Tajawal,sans-serif;direction:rtl;color:#2a2418}
#prac.open{display:flex}
#prac .ph{background:linear-gradient(135deg,#15445a,#3d7eb9);color:#fff;padding:10px 14px;display:flex;align-items:center;gap:10px}
#prac .ph h2{margin:0;font-size:20px;flex:1}
#prac .ph .x{background:rgba(255,255,255,.2);border:0;color:#fff;font-size:24px;width:40px;height:40px;border-radius:12px;cursor:pointer}
#prac .pt{display:flex;gap:6px;padding:8px 10px;background:#fff;border-bottom:1px solid #e6dcc8;overflow-x:auto}
#prac .pt button{flex:1;min-width:110px;border:2px solid #cfdde3;background:#fff;border-radius:14px;padding:8px;font:inherit;font-weight:800;font-size:15px;color:#15445a;cursor:pointer;white-space:nowrap}
#prac .pt button.on{background:#15445a;color:#fff;border-color:#15445a}
#prac .pb{flex:1;overflow:auto;padding:14px;max-width:820px;width:100%;margin:0 auto;box-sizing:border-box}
#prac .cd{background:#fff;border-radius:18px;padding:14px;box-shadow:0 2px 10px rgba(60,40,10,.08);margin-bottom:12px}
#prac .big{font-size:22px;font-weight:800;line-height:1.6}
#prac .opts{display:grid;gap:8px;margin-top:10px}
#prac .opts button{text-align:right;border:2px solid #e2d8c4;background:#fffdf8;border-radius:14px;padding:11px 14px;font:inherit;font-size:17px;font-weight:700;cursor:pointer}
#prac .opts button.sel{border-color:#3d7eb9;background:#e7f1f6}
#prac .opts button.ok{border-color:#0d8f8c;background:#e8f8ef}#prac .opts button.no{border-color:#e0603a;background:#fff0ec}
#prac .fb{margin-top:8px;font-weight:800;min-height:20px}#prac .fb.ok{color:#0b6f55}#prac .fb.no{color:#b0402a}
#prac .btn{border:0;border-radius:14px;padding:11px 18px;font:inherit;font-weight:800;font-size:16px;background:#15445a;color:#fff;cursor:pointer;box-shadow:0 3px 0 #0b2a38}
#prac .btn.g{background:#0d8f8c;box-shadow:0 3px 0 #15445a}#prac .btn.s{background:#fff;color:#15445a;border:2px solid #cfdde3;box-shadow:none}#prac .btn:disabled{opacity:.45}
#prac .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
#prac .fire{font-size:44px;text-align:center}#prac .stk{text-align:center;font-size:20px;font-weight:800;color:#c0501a}
#prac .dots{display:flex;gap:6px;justify-content:center;margin:6px 0}#prac .dots i{width:14px;height:14px;border-radius:50%;background:#e2d8c4;display:block}#prac .dots i.ok{background:#0d8f8c}#prac .dots i.no{background:#e0603a}#prac .dots i.cur{outline:3px solid #15445a}
#prac .meta{font-size:13px;color:#7a6a50;font-weight:700}
#prac .pg{border:1px solid #d9c9a8;background:#fff8ea;border-radius:10px;padding:2px 10px;font:inherit;font-weight:800;font-size:13px;cursor:pointer;color:#7a4a10}
#prac select{font:inherit;font-weight:800;border-radius:12px;border:2px solid #cfdde3;padding:8px;background:#fff;max-width:100%}
#prac .flash{perspective:1200px;height:240px;margin:8px 0;cursor:pointer}
#prac .flash .in{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
#prac .flash.on .in{transform:rotateY(180deg)}
#prac .flash .f,#prac .flash .b{position:absolute;inset:0;backface-visibility:hidden;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;text-align:center;box-sizing:border-box}
#prac .flash .f{background:linear-gradient(135deg,#ff9a3e,#ff7a1e);color:#fff;font-size:30px;font-weight:800}
#prac .flash .b{background:#fff;border:3px solid #ffb06a;transform:rotateY(180deg);font-size:19px;font-weight:700;line-height:1.7}
#prac .flash small{display:block;font-size:13px;opacity:.85;margin-top:8px;font-weight:700}
#prac .boxes{display:flex;gap:6px;justify-content:center;margin:6px 0}#prac .boxes span{background:#f3eefc;border-radius:10px;padding:4px 10px;font-weight:800;font-size:13px;color:#15445a}
#prac .bar{height:14px;background:#eee6d8;border-radius:9px;overflow:hidden;flex:1}#prac .bar i{display:block;height:100%;border-radius:9px}
#prac .bl{display:flex;align-items:center;gap:8px;margin:6px 0;font-weight:700;font-size:14px}#prac .bl span:first-child{min-width:170px}
#prac .tm{background:#fff;border-radius:12px;padding:4px 12px;font-weight:800;color:#15445a}
#prac .nav{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}#prac .nav button{width:34px;height:34px;border-radius:10px;border:2px solid #e2d8c4;background:#fff;font:inherit;font-weight:800;cursor:pointer;font-size:13px}#prac .nav button.ans{background:#e7f1f6;border-color:#9ab8f0}#prac .nav button.cur{border-color:#15445a;background:#15445a;color:#fff}#prac .nav button.fl{box-shadow:inset 0 -4px 0 #ffb000}
#prac .lvl{display:inline-block;font-size:12px;font-weight:800;border-radius:8px;padding:1px 8px;background:#f3eefc;color:#5a3ab0;margin-inline-start:6px}
#prac .rv{border-top:1px solid #eee4d0;padding:8px 0;font-size:15px}
.tb .pbadge{position:absolute;top:2px;left:2px;background:#ff6a1e;color:#fff;border-radius:9px;font-size:11px;padding:0 5px;font-weight:800;line-height:16px}
`;

export function initPractice(LESSONS, opt) {
  const K = opt.key, N = opt.nafes;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(K + '-' + k)) ?? d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(K + '-' + k, JSON.stringify(v)); } catch (e) {} };
  const studied = () => LESSONS.filter(L => { try { return localStorage.getItem(K + '-lesson-' + L.id) !== null; } catch (e) { return false; } });

  // ── بنكُ أسئلةِ الكتاب ──
  const ITEMS = []; const BY = {};
  LESSONS.forEach(L => {
    const V = L.vocab.filter(v => v.w && v.d), add = it => { it.lid = L.id; ITEMS.push(it); BY[it.id] = it; };
    (L.quiz.mcq || []).forEach((m, i) => add({ id: L.id + ':m' + i, q: strip(m.q), o: m.o.map(strip), a: m.a, p: m.p }));
    (L.quiz.tf || []).forEach((t, i) => add({ id: L.id + ':t' + i, q: 'صوابٌ أم خطأ: ' + strip(t.q), o: ['صواب', 'خطأ'], a: t.a ? 0 : 1, p: t.p, why: t.fix ? strip(t.fix) : '' }));
    if (V.length >= 3) V.forEach((v, i) => { const o = shuf([v.w, ...shuf(V.filter(x => x !== v)).slice(0, 2).map(x => x.w)]); add({ id: L.id + ':v' + i, q: 'ما المصطلحُ الذي يعني: «' + strip(v.d) + '»؟', o, a: o.indexOf(v.w), p: v.p }); });
  });

  // ── الواجهة ──
  const btn = document.createElement('button'); btn.className = 'tb'; btn.id = 'btnPrac'; btn.title = 'تمرّن: تحدّي اليوم والبطاقات' + (N ? ' وتدريب نافس' : ''); btn.style.position = 'relative';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg><span class="lbl">تمرّن</span><span class="pbadge" style="display:none"></span>';
  const anchor = document.getElementById('btnLesson'); anchor ? anchor.after(btn) : document.body.appendChild(btn);
  const P = document.createElement('div'); P.id = 'prac'; document.body.appendChild(P);
  const TABS = [['🔥 تحدّي اليوم', daily], ['🃏 بطاقاتُ المصطلحات', cards]]; if (N) TABS.push(['🏁 تدريبُ نافس', nafes]);
  let tab = 0;
  P.innerHTML = `<div class="ph"><h2>🎯 تمرّن — علوم الصف ${GN[opt.grade]}</h2><button class="x" aria-label="إغلاق">×</button></div><div class="pt">${TABS.map((t, i) => `<button data-t="${i}">${t[0]}</button>`).join('')}</div><div class="pb"></div>`;
  const B = P.querySelector('.pb');
  P.querySelector('.x').onclick = close;
  P.querySelectorAll('[data-t]').forEach(b => b.onclick = () => show(+b.dataset.t));
  P.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { close(); opt.goTo(+g.dataset.go); } });
  btn.onclick = () => open();
  function open(t = 0) { P.classList.add('open'); show(t); }
  function close() { P.classList.remove('open'); clearInterval(nTimer); badge(); }
  function show(t) { tab = t; clearInterval(nTimer); P.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', +b.dataset.t === t)); B.scrollTop = 0; TABS[t][1](); }
  function badge() { const s = get('streak', {}), d = get('daily', {}); const b = btn.querySelector('.pbadge'); const due = d.day !== today() || !d.done; b.style.display = (s.n && s.last >= today() - 1) || due ? 'block' : 'none'; b.textContent = due ? '!' : '🔥' + AR(s.n); }
  badge();
  const pgBtn = p => p ? `<button class="pg" data-go="${p}">📖 ص ${AR(p)}</button>` : '';
  const ltitle = id => { const L = LESSONS.find(x => x.id === id); return L ? strip(L.title) : ''; };

  // ══ تحدّي اليوم ══
  function due(srs, t) { return ITEMS.filter(it => srs[it.id] && srs[it.id].due <= t); }
  function makeSet(extra) {
    const t = today(), srs = get('srs', {}), S = studied().map(L => L.id), pool = S.length ? ITEMS.filter(i => S.includes(i.lid)) : ITEMS.filter(i => LESSONS.slice(0, 2).some(L => L.id === i.lid));
    const d = shuf(due(srs, t).filter(i => !S.length || S.includes(i.lid))), fresh = shuf(pool.filter(i => !srs[i.id]));
    const out = []; for (const it of [...d, ...fresh, ...shuf(pool)]) { if (out.length >= 3) break; if (!out.includes(it.id) && !(extra && extra.includes(it.id))) out.push(it.id); }
    return out;
  }
  function daily() {
    const t = today(); let D = get('daily', {});
    if (D.day !== t) { D = { day: t, ids: makeSet(), ans: {}, done: false }; put('daily', D); }
    const s = get('streak', { n: 0, last: -9, best: 0 }), alive = s.last >= t - 1 ? s.n : 0;
    if (D.done) return dailyEnd(D, s);
    const i = D.ids.findIndex(id => !(id in D.ans)), it = BY[D.ids[i]];
    if (!it) { D.done = true; put('daily', D); return daily(); }
    B.innerHTML = `<div class="cd" style="text-align:center"><div class="stk">🔥 سلسلتي: ${AR(alive)} ${alive === 1 ? 'يوم' : 'أيّام'}</div><div class="meta">أجبْ عن ٣ أسئلةٍ كلَّ يوم لتحافظَ على سلسلتِك. الأسئلةُ التي تخطئُ فيها تعودُ إليك لاحقًا.</div>
      <div class="dots">${D.ids.map((id, k) => `<i class="${id in D.ans ? (D.ans[id] ? 'ok' : 'no') : k === i ? 'cur' : ''}"></i>`).join('')}</div></div>
      <div class="cd"><div class="meta">السؤال ${AR(i + 1)} من ٣ · ${ltitle(it.lid)}</div><div class="big">${it.q}</div><div class="opts">${it.o.map((o, k) => `<button data-k="${k}">${o}</button>`).join('')}</div><div class="fb"></div><div class="row" id="dNx"></div></div>`;
    B.querySelectorAll('.opts button').forEach(b => b.onclick = () => {
      if (it.id in D.ans) return; const ok = +b.dataset.k === it.a; D.ans[it.id] = ok; put('daily', D);
      b.classList.add(ok ? 'ok' : 'no'); B.querySelector(`[data-k="${it.a}"]`).classList.add('ok');
      const fb = B.querySelector('.fb'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = (ok ? '✓ أحسنت!' : '✗ الإجابةُ الصحيحة: ' + it.o[it.a]) + (it.why ? '<br>' + it.why : '') + ' ' + pgBtn(it.p);
      const srs = get('srs', {}), c = srs[it.id] || { b: 0 }; c.b = ok ? Math.min(5, c.b + 1) : 1; c.due = today() + [1, 1, 3, 7, 14, 30][c.b]; srs[it.id] = c; put('srs', srs);
      const last = Object.keys(D.ans).length === D.ids.length;
      B.querySelector('#dNx').innerHTML = `<button class="btn">${last ? 'النتيجة 🏁' : 'السؤالُ التالي ←'}</button>`;
      B.querySelector('#dNx button').onclick = () => { if (last && !D.extra) { D.done = true; put('daily', D); const s2 = get('streak', { n: 0, last: -9, best: 0 }); if (s2.last !== t) { s2.n = s2.last === t - 1 ? s2.n + 1 : 1; s2.last = t; s2.best = Math.max(s2.best || 0, s2.n); put('streak', s2); } } else if (last) { D.done = true; put('daily', D); } daily(); };
    });
  }
  function dailyEnd(D, s) {
    const ok = Object.values(D.ans).filter(Boolean).length, n = s.last >= today() - 1 ? s.n : 0, MS = [[3, '🥉', 'ثلاثةُ أيّامٍ متتالية'], [7, '🥈', 'أسبوعٌ كامل'], [14, '🥇', 'أسبوعان'], [30, '🏆', 'شهرٌ كامل']];
    const srs = get('srs', {}), boxes = [0, 0, 0, 0, 0]; Object.values(srs).forEach(c => boxes[Math.max(0, Math.min(4, c.b - 1))]++);
    B.innerHTML = `<div class="cd" style="text-align:center"><div class="fire">🔥</div><div class="stk">سلسلتي: ${AR(n)} ${n === 1 ? 'يوم' : 'أيّام'} · أفضلُ سلسلة: ${AR(s.best || n)}</div>
      <div class="big" style="margin-top:6px">أنجزتَ تحدّي اليوم ✓ — أجبتَ ${AR(ok)} من ${AR(D.ids.length)}</div><div class="meta">عُدْ غدًا لتحدٍّ جديد، فالمراجعةُ المتباعدةُ تثبّتُ المعلومةَ في الذاكرة.</div>
      <div class="row" style="justify-content:center">${MS.map(m => `<span style="font-size:28px;opacity:${(s.best || 0) >= m[0] ? 1 : .2}" title="${m[2]}">${m[1]}</span>`).join('')}</div>
      <div class="meta">أوسمةُ السلسلة: ٣ أيّام 🥉 · ٧ أيّام 🥈 · ١٤ يومًا 🥇 · ٣٠ يومًا 🏆</div></div>
      <div class="cd"><b>صناديقُ المراجعة</b><div class="meta">كلُّ سؤالٍ تجيبُه صحيحًا ينتقلُ إلى صندوقٍ أعلى فيعودُ إليك بعدَ مدّةٍ أطول.</div><div class="boxes">${boxes.map((c, i) => `<span>📦${AR(i + 1)}: ${AR(c)}</span>`).join('')}</div>
      <div class="row"><button class="btn g" id="dMore">💪 تمرّنْ أكثر (٣ أسئلةٍ إضافيّة)</button></div></div>`;
    B.querySelector('#dMore').onclick = () => { const D2 = { day: today(), ids: makeSet(D.ids), ans: {}, done: false, extra: true }; put('daily', D2); daily(); };
  }

  // ══ بطاقاتُ المصطلحات ══
  let cScope = 'studied', cRev = false;
  function cards() {
    const S = studied(), L2 = cScope === 'studied' ? (S.length ? S : LESSONS) : cScope === 'all' ? LESSONS : LESSONS.filter(L => L.id === cScope);
    const box = get('cards', {}); const deck = []; L2.forEach(L => L.vocab.filter(v => v.w && v.d).forEach(v => deck.push({ k: L.id + ':' + v.w, w: v.w, d: strip(v.d), p: v.p, lid: L.id })));
    const counts = [0, 0, 0, 0, 0]; deck.forEach(c => counts[Math.min(4, (box[c.k] || 1) - 1)]++);
    B.innerHTML = `<div class="cd"><div class="row" style="margin:0"><select id="cS"><option value="studied">📚 الدروسُ التي درستُها${S.length ? '' : ' (لم تبدأْ بعد: كلُّ الكتاب)'}</option><option value="all">📕 كلُّ الكتاب</option>${LESSONS.map(L => `<option value="${L.id}">${strip(L.title)}</option>`).join('')}</select>
      <label style="font-weight:800"><input type="checkbox" id="cR" ${cRev ? 'checked' : ''}> ↔ التعريفُ أوّلًا</label></div>
      <div class="boxes">${counts.map((c, i) => `<span title="الصندوق ${AR(i + 1)}">${['🔴', '🟠', '🟡', '🟢', '⭐'][i]} ${AR(c)}</span>`).join('')}</div><div class="meta" style="text-align:center">🔴 جديدةٌ أو صعبة ← ⭐ أتقنتُها. البطاقاتُ التي لم تعرفْها تعودُ إليك في الجلسةِ نفسِها.</div>
      <div class="row" style="justify-content:center"><button class="btn" id="cGo">▶ ابدأ الجلسة (${AR(Math.min(12, deck.length))} بطاقة)</button></div></div>`;
    B.querySelector('#cS').value = cScope; B.querySelector('#cS').onchange = e => { cScope = e.target.value; cards(); };
    B.querySelector('#cR').onchange = e => { cRev = e.target.checked; };
    B.querySelector('#cGo').onclick = () => session(shuf(deck).sort((a, b) => (box[a.k] || 1) - (box[b.k] || 1)).slice(0, 12));
  }
  function session(q) {
    const total = q.length; let known = 0, seen = 0;
    const say = t => { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'ar-SA'; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} };
    function next() {
      if (!q.length) { B.innerHTML = `<div class="cd" style="text-align:center"><div class="fire">🌟</div><div class="big">أنهيتَ الجلسة!</div><p>عرفتَ <b>${AR(known)}</b> من ${AR(total)} من المحاولةِ الأولى، وراجعتَ ${AR(seen)} بطاقة.</p><div class="row" style="justify-content:center"><button class="btn" id="cAg">🔄 جلسةٌ جديدة</button></div></div>`; B.querySelector('#cAg').onclick = cards; return; }
      const c = q[0], front = cRev ? c.d : c.w, back = cRev ? c.w : c.d;
      B.innerHTML = `<div class="cd"><div class="meta" style="text-align:center">بقيَ ${AR(q.length)} · ${ltitle(c.lid)}</div>
        <div class="flash"><div class="in"><div class="f" style="${cRev ? 'font-size:19px;line-height:1.7' : ''}">${front}<small>المسِ البطاقةَ لتقلبَها</small></div><div class="b" style="${cRev ? 'font-size:28px;font-weight:800' : ''}">${back}<small>${pgBtn(c.p)}</small></div></div></div>
        <div class="row" style="justify-content:center"><button class="btn s" id="cSp">🔊</button><button class="btn s" id="cNo" disabled>↺ لم أعرفْها</button><button class="btn g" id="cOk" disabled>✓ عرفتُها</button></div></div>`;
      const f = B.querySelector('.flash'); f.onclick = e => { if (e.target.closest('[data-go]')) return; f.classList.toggle('on'); B.querySelector('#cNo').disabled = B.querySelector('#cOk').disabled = false; };
      B.querySelector('#cSp').onclick = () => say(c.w + '. ' + c.d);
      const box = get('cards', {});
      B.querySelector('#cOk').onclick = () => { seen++; if (!c.miss) known++; box[c.k] = c.miss ? Math.max(1, (box[c.k] || 1)) : Math.min(5, (box[c.k] || 1) + 1); put('cards', box); q.shift(); next(); };
      B.querySelector('#cNo').onclick = () => { seen++; c.miss = true; box[c.k] = 1; put('cards', box); q.shift(); q.splice(Math.min(q.length, 3), 0, c); next(); };
    }
    next();
  }

  // ══ تدريبُ نافس ══
  let nTimer = null, T = null;
  const LVN = ['معرفة', 'تطبيق', 'استدلال'];
  function nafes() {
    clearInterval(nTimer);
    const H = get('nafes', []);
    B.innerHTML = `<div class="cd"><div class="big">🏁 تدريبُ نافس — العلوم</div><p style="margin:4px 0">اختبارٌ قصيرٌ بنمطِ الاختيارِ من متعدّد، يشملُ محتوى كتابِ العلومِ للصفِّ <b>الثالث المتوسط</b> (الجزء الأول)، موزّعًا على مستوياتِ <b>المعرفة</b> و<b>التطبيق</b> و<b>الاستدلال</b>، مع تقريرٍ يبيّنُ نقاطَ القوّةِ والضعف.</p>
      <div class="row">عددُ الأسئلة: <select id="nN"><option value="10">١٠ أسئلة</option><option value="20" selected>٢٠ سؤالًا</option><option value="30">٣٠ سؤالًا</option></select></div>
      <div class="row">المحور: <select id="nA"><option value="-1">كلُّ المحاور</option>${N.ax.map((a, i) => `<option value="${i}">${a}</option>`).join('')}</select></div>
      <div class="row"><label style="font-weight:800"><input type="checkbox" id="nT" checked> ⏱ بمؤقّت (دقيقةٌ ونصف لكلِّ سؤال)</label></div>
      <div class="row"><button class="btn" id="nGo">▶ ابدأ الاختبار</button></div>
      <p class="meta">تصنيفُ المحاورِ والمستوياتِ هنا تقريبيٌّ لأغراضِ التدريب، والأسئلةُ مبنيّةٌ على محتوى كتبِ الفصلِ الدراسيِّ الأوّل.</p></div>
      ${H.length ? `<div class="cd"><b>محاولاتي السابقة</b>${H.slice(-8).reverse().map(h => `<div class="bl"><span>${h.date} · ${AR(h.n)} سؤالًا</span><div class="bar"><i style="width:${h.s}%;background:${h.s >= 85 ? '#0d8f8c' : h.s >= 65 ? '#3d7eb9' : h.s >= 50 ? '#e0a020' : '#e0603a'}"></i></div><b>${AR(h.s)}٪</b></div>`).join('')}</div>` : ''}`;
    B.querySelector('#nGo').onclick = () => start(+B.querySelector('#nN').value, +B.querySelector('#nA').value, B.querySelector('#nT').checked);
  }
  function start(n, ax, timed) {
    const pool = N.items.filter(i => ax < 0 || i.ax === ax), want = [Math.round(n * .45), Math.round(n * .3), 0]; want[2] = n - want[0] - want[1];
    let qs = []; [0, 1, 2].forEach(l => qs.push(...shuf(pool.filter(i => i.lv === l)).slice(0, want[l])));
    if (qs.length < n) qs.push(...shuf(pool.filter(i => !qs.includes(i))).slice(0, n - qs.length));
    if (ax < 0) { /* توازنُ المحاور: لا يزيدُ محورٌ عن نصفِ الاختبار */ }
    qs = shuf(qs).map(it => { const ord = shuf(it.o.map((_, k) => k)); return { ...it, o: ord.map(k => it.o[k]), a: ord.indexOf(it.a) }; });
    T = { qs, ans: qs.map(() => -1), fl: qs.map(() => false), i: 0, left: timed ? n * 90 : 0, timed };
    clearInterval(nTimer); if (timed) nTimer = setInterval(() => { if (!P.classList.contains('open')) return; T.left--; const e = B.querySelector('#nTm'); if (e) e.textContent = '⏱ ' + mmss(T.left); if (T.left <= 0) { clearInterval(nTimer); report(); } }, 1000);
    q();
  }
  const mmss = s => AR(Math.floor(Math.max(0, s) / 60)) + ':' + AR(String(Math.max(0, s) % 60).padStart(2, '0'));
  function q() {
    const it = T.qs[T.i];
    B.innerHTML = `<div class="cd"><div class="row" style="margin:0;justify-content:space-between"><b>السؤال ${AR(T.i + 1)} من ${AR(T.qs.length)}</b>${T.timed ? `<span class="tm" id="nTm">⏱ ${mmss(T.left)}</span>` : ''}</div>
      <div class="nav">${T.qs.map((_, k) => `<button data-n="${k}" class="${k === T.i ? 'cur' : T.ans[k] >= 0 ? 'ans' : ''} ${T.fl[k] ? 'fl' : ''}">${AR(k + 1)}</button>`).join('')}</div></div>
      <div class="cd"><div class="meta">${N.ax[it.ax]}<span class="lvl">${LVN[it.lv]}</span></div><div class="big">${it.q}</div><div class="opts">${it.o.map((o, k) => `<button data-k="${k}" class="${T.ans[T.i] === k ? 'sel' : ''}">${'أبجد'[k]}) ${o}</button>`).join('')}</div>
      <div class="row"><button class="btn s" id="nP" ${T.i ? '' : 'disabled'}>→ السابق</button><button class="btn s" id="nF">${T.fl[T.i] ? '🚩 إلغاءُ التعليم' : '🚩 علّمْ للمراجعة'}</button>${T.i < T.qs.length - 1 ? '<button class="btn" id="nX">التالي ←</button>' : ''}<button class="btn g" id="nE">إنهاءُ الاختبار</button></div></div>`;
    B.querySelectorAll('.opts button').forEach(b => b.onclick = () => { T.ans[T.i] = +b.dataset.k; if (T.i < T.qs.length - 1) { T.i++; } q(); });
    B.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { T.i = +b.dataset.n; q(); });
    B.querySelector('#nP').onclick = () => { T.i--; q(); }; const x = B.querySelector('#nX'); if (x) x.onclick = () => { T.i++; q(); };
    B.querySelector('#nF').onclick = () => { T.fl[T.i] = !T.fl[T.i]; q(); };
    B.querySelector('#nE').onclick = () => { const un = T.ans.filter(a => a < 0).length; if (un && !confirmBox(un)) return; report(); };
  }
  function confirmBox(un) { const e = B.querySelector('#nE'); if (e.dataset.c) return true; e.dataset.c = 1; e.textContent = `لم تُجبْ عن ${AR(un)} — اضغطْ مرّةً أخرى للإنهاء`; return false; }
  function report() {
    clearInterval(nTimer); const qs = T.qs, ok = qs.map((it, k) => T.ans[k] === it.a), sc = Math.round(ok.filter(Boolean).length / qs.length * 100);
    const H = get('nafes', []); const d = new Date(); H.push({ date: AR(d.getDate()) + '/' + AR(d.getMonth() + 1), n: qs.length, s: sc }); put('nafes', H.slice(-20));
    const agg = (key, names) => names.map((nm, i) => { const xs = qs.map((it, k) => [it, ok[k]]).filter(([it]) => it[key] === i); return xs.length ? [nm, Math.round(xs.filter(x => x[1]).length / xs.length * 100), xs.length] : null; }).filter(Boolean);
    const bar = ([nm, p, c]) => `<div class="bl"><span>${nm} <span class="meta">(${AR(c)})</span></span><div class="bar"><i style="width:${p}%;background:${p >= 85 ? '#0d8f8c' : p >= 65 ? '#3d7eb9' : p >= 50 ? '#e0a020' : '#e0603a'}"></i></div><b>${AR(p)}٪</b></div>`;
    const lvl = sc >= 85 ? ['🌟', 'أداءٌ متقدّم', '#0d8f8c'] : sc >= 65 ? ['👍', 'أداءٌ جيّد', '#3d7eb9'] : sc >= 50 ? ['📈', 'يقتربُ من المطلوب', '#c08010'] : ['💪', 'يحتاجُ إلى دعم', '#c0401a'];
    const weak = {}; qs.forEach((it, k) => { if (!ok[k] && !it.x) { const w = (weak[it.g + it.lid] ||= { g: it.g, lt: it.lt, p: it.p, n: 0 }); w.n++; } });
    const wl = Object.values(weak).sort((a, b) => b.n - a.n).slice(0, 6);
    B.innerHTML = `<div class="cd" style="text-align:center"><div class="fire">${lvl[0]}</div><div class="big" style="color:${lvl[2]}">${AR(sc)}٪ — ${lvl[1]}</div><div class="meta">أجبتَ إجابةً صحيحةً عن ${AR(ok.filter(Boolean).length)} من ${AR(qs.length)}</div></div>
      <div class="cd"><b>📊 حسبَ المحور</b>${agg('ax', N.ax).map(bar).join('')}<b style="display:block;margin-top:10px">🧠 حسبَ المستوى المعرفيّ</b>${agg('lv', LVN).map(bar).join('')}</div>
      ${wl.length ? `<div class="cd"><b>📌 دروسٌ أنصحُك بمراجعتِها</b>${wl.map(w => `<div class="rv">• ${w.lt} — <span class="meta">الصف ${GN[w.g]}${w.p ? ' ص ' + AR(w.p) : ''}</span> ${w.g === opt.grade && w.p ? pgBtn(w.p) : ''}</div>`).join('')}</div>` : ''}
      <div class="cd"><b>🔍 مراجعةُ الإجابات</b>${qs.map((it, k) => `<div class="rv">${ok[k] ? '✅' : '❌'} <b>${AR(k + 1)}.</b> ${it.q}<br><span class="meta">الإجابةُ الصحيحة: ${it.o[it.a]}${T.ans[k] >= 0 && !ok[k] ? ' · إجابتُك: ' + it.o[T.ans[k]] : T.ans[k] < 0 ? ' · لم تُجب' : ''} · الصف ${GN[it.g]}</span></div>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn" id="nAg">🔄 اختبارٌ جديد</button></div>`;
    B.querySelector('#nAg').onclick = nafes; B.scrollTop = 0;
  }
  return { open, close, isOpen: () => P.classList.contains('open') };
}
