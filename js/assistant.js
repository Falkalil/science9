// «مساعد العلوم» داخل الدرس — يجيب من محتوى الدرس والإجاباتِ المدمجة (يعمل دون إنترنت)
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => strip(s).replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/^ال/, '');

const CSS = `
#lesson .botBtn{position:absolute;left:14px;bottom:78px;z-index:18;border:0;border-radius:30px;padding:12px 18px;background:linear-gradient(135deg,#15445a,#3d7eb9);color:#fff;font:inherit;font-weight:800;font-size:16px;box-shadow:0 6px 20px rgba(58,74,200,.45);display:flex;align-items:center;gap:8px}
#lesson .botBtn i{font-style:normal;font-size:24px;animation:bwave 2.4s infinite}@keyframes bwave{0%,80%,100%{transform:none}85%{transform:rotate(-14deg)}92%{transform:rotate(12deg)}}
#lesson.present .botBtn{left:86px}
#lesson .bot{position:absolute;left:12px;bottom:76px;z-index:19;width:min(430px,calc(100% - 24px));height:min(640px,calc(100% - 150px));background:#fff;border-radius:20px;box-shadow:0 14px 50px rgba(20,20,60,.35);display:none;flex-direction:column;overflow:hidden;border:1px solid #d8d2f2}
#lesson .bot.open{display:flex}
#lesson.present .bot{width:min(560px,calc(100% - 24px));font-size:1.15em}
#lesson .bot .bh{background:linear-gradient(135deg,#15445a,#3d7eb9);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px}
#lesson .bot .bh b{flex:1;font-size:17px}#lesson .bot .bh small{display:block;font-size:11px;opacity:.9;font-weight:600}
#lesson .bot .bh button{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:10px;width:34px;height:34px;font-size:16px}
#lesson .bot .ctx{background:#eef4f6;padding:6px 10px;font-size:13px;color:#15445a;display:flex;align-items:center;gap:6px}
#lesson .bot .ctx select{flex:1;font:inherit;font-size:13px;border:1px solid #cfdde3;border-radius:8px;padding:3px;background:#fff;min-width:0}
#lesson .bot .msgs{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px;background:#f6f9fa;-webkit-overflow-scrolling:touch}
#lesson .bot .m{max-width:88%;padding:9px 12px;border-radius:16px;line-height:1.75;font-size:15.5px;word-wrap:break-word}
#lesson .bot .m.u{align-self:flex-start;background:#3d7eb9;color:#fff;border-bottom-right-radius:4px}
#lesson .bot .m.a{align-self:flex-end;background:#fff;border:1px solid #dbe4e9;color:#2a2440;border-bottom-left-radius:4px}
#lesson .bot .m.a b{color:#0b2a38;background:none}
#lesson .bot .m.a ul{margin:4px 0;padding-inline-start:20px}
#lesson .bot .m .opts{display:flex;flex-direction:column;gap:6px;margin-top:8px}
#lesson .bot .m .opts button{border:1px solid #cfdde3;background:#eef4f6;border-radius:10px;padding:8px;font:inherit;font-size:15px;text-align:start}
#lesson .bot .m .opts button.ok{background:#dff5e8;border-color:#0d8f8c}#lesson .bot .m .opts button.no{background:#fde4e1;border-color:#d04a3a}
#lesson .bot .m .why{margin-top:6px;font-size:14px;color:#3a6a4a}
#lesson .bot .chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 10px 4px;border-top:1px solid #eee}
#lesson .bot .chips button{flex:0 0 auto;border:1px solid #cfdde3;background:#eef4f6;color:#0b2a38;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;font-weight:700;white-space:nowrap}
#lesson .bot .in{display:flex;gap:6px;padding:6px 10px 10px}
#lesson .bot .in input{flex:1;min-width:0;border:1px solid #cfdde3;border-radius:14px;padding:9px 12px;font:inherit;font-size:15px}
#lesson .bot .in button{border:0;border-radius:14px;background:#15445a;color:#fff;font-size:18px;width:46px}
#lesson .bot .cmp{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}#lesson .bot .cmp select{flex:1;min-width:120px;font:inherit;font-size:14px;border:1px solid #cfdde3;border-radius:8px;padding:4px}
#lesson .bot .cmp button{border:0;border-radius:10px;background:#15445a;color:#fff;font:inherit;font-weight:800;padding:6px 14px}
#lesson .bot table{border-collapse:collapse;width:100%;font-size:14px;margin-top:6px}#lesson .bot td,#lesson .bot th{border:1px solid #dbe4e9;padding:5px;vertical-align:top}#lesson .bot th{background:#eef4f6}
`;

export function mountAssistant(host, L, getSec, D) {
  if (!document.getElementById('botCSS')) { const s = document.createElement('style'); s.id = 'botCSS'; s.textContent = CSS; document.head.appendChild(s); }
  D = D || {};
  { const canon = t => { const v = L.vocab.find(x => norm(x.w) === norm(t)); return v ? v.w : t; };
    if (D.pairs) D = Object.assign({}, D, { pairs: D.pairs.map(p => [canon(p[0]), canon(p[1]), p[2]]) }); }
  let secIdx = Math.max(0, getSec()), asked = [];
  const btn = document.createElement('button'); btn.className = 'botBtn'; btn.innerHTML = '<i>🤖</i> مساعدُ العلوم'; host.appendChild(btn);
  const box = document.createElement('div'); box.className = 'bot';
  box.innerHTML = `<div class="bh"><span style="font-size:26px">🤖</span><b>مساعدُ العلوم<small>يجيبُ من محتوى الدرس — يعملُ دونَ إنترنت</small></b><button data-clear title="محادثة جديدة">🗑</button><button data-close title="إغلاق">✕</button></div>
    <div class="ctx">📍 نتحدّثُ عن: <select>${L.sections.map((s, i) => `<option value="${i}">${esc(strip(s.title))}</option>`).join('')}</select></div>
    <div class="msgs"></div>
    <div class="chips"><button data-q="why">🤔 لماذا يحدثُ هذا؟</button><button data-q="simple">🧒 اشرحْها بطريقةٍ أسهل</button><button data-q="example">🏠 مثالٌ من حياتنا</button><button data-q="quiz">📝 اختبرْني</button><button data-q="diff">⚖️ الفرقُ بين مفهومين</button></div>
    <div class="in"><input placeholder="اكتبْ مصطلحًا أو سؤالًا عن الدرس…" maxlength="200"><button title="إرسال">➤</button></div>`;
  host.appendChild(box);
  const msgs = box.querySelector('.msgs'), sel = box.querySelector('.ctx select'), inp = box.querySelector('.in input');
  sel.value = secIdx; sel.onchange = () => { secIdx = +sel.value; };
  const S = () => L.sections[secIdx];
  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'm ' + cls; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  const lname = L.title.includes(': ') ? L.title.split(': ')[1] : L.title;
  function greet() {
    msgs.innerHTML = '';
    add('a', `مرحبًا يا بطل! 👋 أنا <b>مساعدُ العلوم</b>. اخترْ من الأزرارِ في الأسفل، أو اكتبْ مصطلحًا من درسِ «${esc(lname)}».<br><small style="color:#777">اخترْ من الأعلى الجزءَ الذي تقرؤه الآن؛ فكلمةُ «هذا» تعودُ إليه.</small>`);
  }
  const sd = () => (D.sections || {})[S().id] || {};
  const pg = () => `<br><small style="color:#6a5a44">📖 ص ${S().pages.map(AR).join('–')}</small>`;
  function answer(kind) {
    const d = sd(), s = S();
    if (d[kind]) return d[kind] + pg();
    // بدائل تلقائية من محتوى الجزء
    if (kind === 'why') return (s.check || []).map(c => `<b>${esc(strip(c.q))}</b><br>${strip(c.a)}`).join('<br><br>') + pg();
    if (kind === 'simple') return s.body.slice(0, 2).map(p => strip(p)).join('<br><br>') + pg();
    const ex = (L.summary || []).map(x => '• ' + strip(x.t)).join('<br>');
    return 'لنتذكّرْ أهمَّ أفكارِ الدرس، ثم ابحثْ حولَك عن مثالٍ عليها:<br>' + ex;
  }
  function freeAnswer(q) {
    const nq = norm(q);
    const faq = (D.faq || []).find(f => f.k.some(k => nq.includes(norm(k))));
    if (faq) return faq.a;
    const words = nq.split(/\s+/).filter(w => w.length > 2);
    const v = L.vocab.filter(v => { const nw = norm(v.w); return nq.includes(nw) || words.some(w => nw.includes(w) && w.length > 3); });
    if (v.length) return v.slice(0, 3).map(x => `<b>${esc(x.w)}</b>: ${strip(x.d)} <small>(ص ${AR(x.p)})</small>`).join('<br><br>');
    // البحث في نصِّ الشرح
    for (const s of L.sections) for (const p of s.body) { const t = strip(p); if (words.filter(w => w.length > 3).some(w => norm(t).includes(w))) return `وجدتُ هذا في جزءِ «${esc(strip(s.title))}»:<br>${t}<br><small style="color:#6a5a44">📖 ص ${s.pages.map(AR).join('–')}</small>`; }
    return `لم أجدْ هذا في الدرس 🤔<br>جرّبْ أن تكتبَ مصطلحًا مثل: ${L.vocab.slice(0, 3).map(v => '«' + esc(v.w) + '»').join('، ')}، أو استخدمِ الأزرارَ في الأسفل.`;
  }
  function renderQuiz(q) {
    const d = add('a', `<b>📝 سؤال:</b> ${esc(q.q)}<div class="opts">${q.o.map((o, i) => `<button data-i="${i}">${'أبجد'[i] || ''}) ${esc(o)}</button>`).join('')}</div><div class="why"></div>`);
    d.querySelectorAll('.opts button').forEach(b => b.onclick = () => {
      if (d.dataset.done) return; d.dataset.done = 1; const ok = +b.dataset.i === q.a;
      b.classList.add(ok ? 'ok' : 'no'); d.querySelectorAll('.opts button')[q.a].classList.add('ok');
      d.querySelector('.why').innerHTML = (ok ? '✅ أحسنت! ' : '❌ ليس تمامًا. ') + esc(q.why || '') + `<br><button class="more" style="margin-top:6px;border:0;border-radius:10px;background:#15445a;color:#fff;padding:6px 12px;font:inherit;font-weight:800">سؤالٌ آخر ←</button>`;
      d.querySelector('.more').onclick = quiz; msgs.scrollTop = msgs.scrollHeight;
    });
  }
  function quiz() {
    add('u', '📝 اختبرْني');
    const Q = L.quiz || {};
    const pool = [...(Q.mcq || []).map(m => ({ q: strip(m.q), o: m.o.map(strip), a: m.a, why: 'راجعْ ص ' + AR(m.p) + '.' })),
      ...(Q.tf || []).map(t => ({ q: 'صوابٌ أم خطأ: ' + strip(t.q), o: ['صواب', 'خطأ'], a: t.a ? 0 : 1, why: (t.fix ? strip(t.fix) + ' ' : '') + '(ص ' + AR(t.p) + ')' })),
      ...L.vocab.filter(v => v.d).map((v, i, arr) => { const others = shuffle(L.vocab.filter(x => x !== v)).slice(0, 2).map(x => x.w); if (others.length < 2) return null; const o = shuffle([v.w, ...others]); return { q: `ما المصطلحُ الذي يعني: «${strip(v.d)}»؟`, o, a: o.indexOf(v.w), why: `${v.w} (ص ${AR(v.p)}).` }; }).filter(Boolean)];
    if (!pool.length) return add('a', 'لا توجدُ أسئلةٌ لهذا الدرس.');
    let left = pool.filter(p => !asked.includes(p.q)); if (!left.length) { asked = []; left = pool; }
    const q = shuffle(left)[0]; asked.push(q.q); renderQuiz(q);
  }
  function diffPicker() {
    const extra = D.extra || {};
    const terms = [...new Set([...(D.pairs || []).flatMap(p => [p[0], p[1]]), ...L.vocab.map(v => v.w)])];
    if (terms.length < 2) return add('a', 'لا توجدُ في هذا الدرسِ مصطلحاتٌ كافيةٌ للمقارنة.');
    const d = add('a', `⚖️ اخترِ المفهومين اللذين تريدُ المقارنةَ بينهما:<div class="cmp"><select>${terms.map(t => `<option>${esc(t)}</option>`).join('')}</select><select>${terms.map((t, i) => `<option ${i === 1 ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><button>قارنْ</button></div>`);
    const [s1, s2] = d.querySelectorAll('select'); const p0 = (D.pairs || [])[0]; if (p0) { s1.value = p0[0]; s2.value = p0[1]; }
    d.querySelector('.cmp button').onclick = () => {
      const a = s1.value, b = s2.value; if (a === b) return;
      add('u', esc(`⚖️ ما الفرقُ بينَ «${a}» و«${b}»؟`));
      const pr = (D.pairs || []).find(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
      const def = t => { const v = L.vocab.find(x => x.w === t); return v ? strip(v.d) : (extra[t] || '—'); };
      add('a', `<table><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr><tr><td>${esc(def(a))}</td><td>${esc(def(b))}</td></tr></table>${pr ? `<div style="margin-top:6px">💡 ${pr[2]}</div>` : '<div style="margin-top:6px;color:#6a5a44">💡 اقرأِ التعريفين، وابحثْ عن كلمةٍ تجعلُ كلَّ مفهومٍ مختلفًا عن الآخر.</div>'}`);
    };
  }
  const LABELS = { why: '🤔 لماذا يحدثُ هذا؟', simple: '🧒 اشرحْها لي بطريقةٍ أسهل', example: '🏠 أعطِني مثالًا من حياتِنا' };
  function run(kind) {
    if (kind === 'quiz') return quiz();
    if (kind === 'diff') return diffPicker();
    add('u', esc(LABELS[kind] + ` (${strip(S().title)})`)); add('a', answer(kind));
  }
  box.querySelectorAll('[data-q]').forEach(b => b.onclick = () => run(b.dataset.q));
  const send = () => { const t = inp.value.trim(); if (!t) return; inp.value = ''; add('u', esc(t)); add('a', freeAnswer(t)); };
  box.querySelector('.in button').onclick = send; inp.onkeydown = e => { if (e.key === 'Enter') send(); };
  box.querySelector('[data-close]').onclick = () => { box.classList.remove('open'); btn.style.display = ''; };
  box.querySelector('[data-clear]').onclick = () => { asked = []; greet(); };
  btn.onclick = () => { const s = getSec(); if (s >= 0) { secIdx = s; sel.value = s; } box.classList.add('open'); btn.style.display = 'none'; };
  greet();
  return { setSection(i) { if (i >= 0) { secIdx = i; sel.value = i; } }, attach(h) { h.appendChild(btn); h.appendChild(box); } };
}
