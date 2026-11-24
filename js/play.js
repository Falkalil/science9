// الألعابُ التفاعليّة وعجلةُ الروليت وأدواتُ الصفّ — العلوم، الثالث المتوسط
// أسئلتُها من بنكِ أسئلةِ الدرسِ الحاليّ (الاختيار من متعدّد، الصواب والخطأ، المصطلحات) ومن أسئلةِ نافس للدرس.
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const store = (() => { const K = 'sci9-play'; let d = {}; try { d = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) {} return { get: (k, v) => d[k] ?? v, set: (k, v) => { d[k] = v; try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} } }; })();
let toastT; function toast(t) { let e = $('#gtoast'); if (!e) { e = document.createElement('div'); e.id = 'gtoast'; document.body.appendChild(e); } e.innerHTML = t; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 2200); }
function star(n = 1, why = '') { store.set('stars', store.get('stars', 0) + n); if (why) toast('⭐ +' + AR(n) + ' ' + why); }

let AC; const muted = () => store.get('mute', false);
function beep(f = 660, d = .12, type = 'sine', v = .15) { if (muted()) return; try { AC ||= new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; g.gain.value = v; g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) {} }
const good = () => { beep(660, .1); setTimeout(() => beep(880, .15), 90); };
const bad = () => beep(180, .25, 'square', .08);
const fanfare = () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .18, 'triangle'), i * 130));

/* ═════════ بنكُ الأسئلة ═════════ */
function bank(L, N) {
  const out = [], V = (L.vocab || []).filter(v => v.key);
  (L.quiz.mcq || []).forEach(m => out.push({ q: strip(m.q), opts: m.o.map(strip), a: m.a, p: m.p }));
  (N ? N.items.filter(i => i.lid === L.id) : []).forEach(m => out.push({ q: strip(m.q), opts: m.o.map(strip), a: m.a, p: m.p, nafes: 1 }));
  (L.quiz.tf || []).forEach(t => out.push({ q: 'صوابٌ أم خطأ: ' + strip(t.q), opts: ['صواب', 'خطأ'], a: t.a ? 0 : 1, p: t.p }));
  if (V.length >= 4) V.forEach(v => { const o = shuf([v.w, ...shuf(V.filter(x => x !== v)).slice(0, 3).map(x => x.w)]); out.push({ q: 'ما المصطلحُ الذي يعني: «' + strip(v.d) + '»؟', opts: o, a: o.indexOf(v.w), p: v.p }); });
  return out;
}
function makeGen(L, N) {
  const B = bank(L, N); let deck = [];
  return () => { if (!B.length) return null; if (!deck.length) deck = shuf(B); const Q = deck.pop(); const ord = shuf(Q.opts.map((_, i) => i)); const tfq = Q.opts.length === 2 && Q.opts[0] === 'صواب'; const o = tfq ? [0, 1] : ord; return { q: Q.q, opts: o.map(i => Q.opts[i]), a: o.indexOf(Q.a), e: Q.p ? 'ص ' + AR(Q.p) : '' }; };
}
const next = gen => { for (let i = 0; i < 5; i++) { const q = gen(); if (q) return q; } return null; };
function qBlock(Q) { return `<div class="gq">${Q.q}</div>`; }
function stage(title, onClose) {
  const d = document.createElement('div'); d.className = 'gstage'; d.innerHTML = `<div class="ghead"><b>${title}</b><span class="gsc"></span><button class="gm" title="الصوت">${muted() ? '🔇' : '🔊'}</button><button class="gx" title="إغلاق">✕</button></div><div class="gbody"></div><div class="gcred">تصميم: أ. هيفاء السلمي</div>`;
  document.body.appendChild(d); document.body.classList.add('gopen');
  const close = () => { d.remove(); document.body.classList.remove('gopen'); d._stop && d._stop(); onClose && onClose(); };
  $('.gx', d).onclick = close; $('.gm', d).onclick = e => { store.set('mute', !muted()); e.target.textContent = muted() ? '🔇' : '🔊'; };
  d._close = close; return { d, body: $('.gbody', d), sc: $('.gsc', d), close };
}
function saveBest(key, g, v) { const b = store.get('gbest', {}); if ((b[key + ':' + g] || 0) < v) { b[key + ':' + g] = v; store.set('gbest', b); return true; } return false; }
function endScreen(S, emoji, msg, again) { fanfare(); S.body.innerHTML = `<div class="gend"><div class="ge">${emoji}</div><h2>${msg}</h2><div class="row c"><button class="btn" data-a="again">🔁 العبْ مرّةً أخرى</button><button class="btn s" data-a="close">إغلاق</button></div></div>`; confetti(S.d); $('[data-a="again"]', S.body).onclick = again; $('[data-a="close"]', S.body).onclick = S.close; }
function confetti(host) { const c = document.createElement('div'); c.className = 'confetti'; c.innerHTML = Array.from({ length: 60 }, () => `<i style="left:${Math.random() * 100}%;background:${pick(['#0da9a6', '#c1b489', '#07a869', '#3d7eb9', '#ffffff', '#e8a33a'])};animation-delay:${Math.random() * .8}s;animation-duration:${1.8 + Math.random() * 1.5}s"></i>`).join(''); host.appendChild(c); setTimeout(() => c.remove(), 4000); }

/* ═════════ لعبةُ بطاقاتِ الذاكرة (المصطلح ↔ التعريف) ═════════ */
let MEM = [];
function memory(S, gen, key, again) {
  const V = shuf(MEM).slice(0, 6); if (V.length < 3) { S.body.innerHTML = '<div class="gq">لا توجدُ مصطلحاتٌ كافية لهذا الدرس.</div>'; return; }
  const cards = shuf(V.flatMap((v, i) => [{ i, t: v.w, k: 'w' }, { i, t: strip(v.d).length > 70 ? strip(v.d).slice(0, 68) + '…' : strip(v.d), k: 'd' }]));
  let open = [], found = 0, moves = 0, lock = false;
  S.body.innerHTML = `<p class="meta c">اقلبْ بطاقتين: طابقِ المصطلحَ مع تعريفِه.</p><div class="mem">${cards.map((c, n) => `<button class="mc ${c.k}" data-n="${n}"><span class="f">؟</span><span class="b">${c.t}</span></button>`).join('')}</div>`;
  const upd = () => S.sc.textContent = `أزواجٌ: ${AR(found)} / ${AR(V.length)} · محاولات: ${AR(moves)}`; upd();
  $$('.mc', S.body).forEach(b => b.onclick = () => { if (lock || b.classList.contains('on') || b.classList.contains('ok')) return; b.classList.add('on'); beep(520, .05); open.push(b);
    if (open.length === 2) { moves++; const [x, y] = open, cx = cards[+x.dataset.n], cy = cards[+y.dataset.n]; lock = true;
      if (cx.i === cy.i && cx.k !== cy.k) { setTimeout(() => { x.classList.add('ok'); y.classList.add('ok'); good(); open = []; lock = false; found++; upd(); if (found === V.length) { saveBest(key, 'memory', Math.max(1, 30 - moves)); star(2, 'ذاكرةٌ قويّة!'); setTimeout(() => endScreen(S, '🧠', `طابقتَ كلَّ المصطلحاتِ في ${AR(moves)} محاولة`, again), 500); } }, 350); }
      else { bad(); setTimeout(() => { x.classList.remove('on'); y.classList.remove('on'); open = []; lock = false; }, 900); } upd(); } });
}

/* ═════════ عجلةُ الأسئلة ═════════ */
function qwheel(B, gen) {
  const n = 12, Qs = Array.from({ length: n }, () => next(gen)).filter(Boolean);
  B.innerHTML = `<div class="wwrap"><div class="wptr">▼</div><canvas width="640" height="640"></canvas><button class="wspin">لُفّ!</button></div><p class="meta c">لُفَّ العجلةَ ليظهرَ سؤالٌ من أسئلةِ الدرس، ثم اخترِ الإجابة.</p>`;
  const cv = $('canvas', B), cx = cv.getContext('2d'); let ang = 0, spinning = false; const cols = ['#15445a', '#0da9a6', '#3d7eb9', '#07a869', '#0b2a38', '#c1b489'];
  const draw = () => { const R = 310, m = Qs.length; cx.clearRect(0, 0, 640, 640); cx.save(); cx.translate(320, 320); cx.rotate(ang);
    Qs.forEach((q, i) => { const a0 = i / m * 2 * Math.PI, a1 = (i + 1) / m * 2 * Math.PI; cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, R, a0, a1); cx.fillStyle = cols[i % cols.length]; cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.stroke();
      cx.save(); cx.rotate((a0 + a1) / 2); cx.fillStyle = i % 6 === 5 ? '#0b2a38' : '#fff'; cx.font = '800 30px Tajawal, sans-serif'; cx.textAlign = 'right'; cx.textBaseline = 'middle'; cx.fillText('سؤال ' + AR(i + 1), R - 18, 0); cx.restore(); });
    cx.restore(); cx.beginPath(); cx.arc(320, 320, 34, 0, 7); cx.fillStyle = '#fff'; cx.fill(); };
  const spin = () => { if (spinning || !Qs.length) return; spinning = true; const m = Qs.length, k = Math.floor(Math.random() * m);
    const target = -Math.PI / 2 - (k + .5) / m * 2 * Math.PI, base = ang - (ang % (2 * Math.PI)), end = base + 2 * Math.PI * (5 + Math.floor(Math.random() * 3)) + ((target - base) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const st = ang, t0 = performance.now(), D = 4200; let lastSeg = -1;
    const f = now => { const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 4); ang = st + (end - st) * e; draw(); const seg = Math.floor(((-(ang + Math.PI / 2)) / (2 * Math.PI) * m % m + m) % m); if (seg !== lastSeg) { lastSeg = seg; beep(1200, .03, 'square', .05); }
      if (p < 1) requestAnimationFrame(f); else { spinning = false; showQ(Qs[k], k); } };
    requestAnimationFrame(f); };
  const showQ = (Q, k) => { const w = document.createElement('div'); w.className = 'winner'; w.innerHTML = `<div class="wq"><small>🎯 سؤال ${AR(k + 1)}</small>${qBlock(Q)}<div class="gopts">${Q.opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('')}</div><div class="row c"><button class="btn s sm" data-a="x">إغلاق</button></div></div>`; B.appendChild(w);
    $$('.gopts button', w).forEach(b => b.onclick = () => { const ok = +b.dataset.i === Q.a; b.classList.add(ok ? 'ok' : 'no'); $$('.gopts button', w)[Q.a].classList.add('ok'); $$('.gopts button', w).forEach(x => x.disabled = true); if (ok) { good(); confetti(w); } else bad(); });
    $('[data-a="x"]', w).onclick = () => w.remove(); fanfare(); };
  $('.wspin', B).onclick = spin; cv.onclick = spin; draw();
}

/* ═════════ تبويبُ الألعاب ═════════ */
const GAMES = [
  ['race', '🏁', 'سباقُ الزمن', 'أجبْ عن أكبرِ عددٍ من الأسئلةِ في ٦٠ ثانية'],
  ['balloon', '🎈', 'فرقعةُ البالونات', 'افرقعِ البالونَ الذي يحملُ الإجابةَ الصحيحةَ قبلَ أن يطير'],
  ['tug', '🪢', 'شدُّ الحبل', 'تحدٍّ بينَ فريقين على السبّورة: الأسرعُ يشدُّ الحبل'],
  ['tf', '✅', 'صحّ أم خطأ', 'قرّرْ بسرعة: هل الإجابةُ المعروضةُ صحيحة؟'],
  ['climb', '🧗', 'تسلّقُ القمّة', '١٠ درجات… كلُّ إجابةٍ صحيحةٍ ترفعُك درجة، والخطأُ يُنزلُك'],
  ['memory', '🧠', 'بطاقاتُ الذاكرة', 'طابقْ كلَّ مصطلحٍ علميٍّ مع تعريفِه'],
];
function tabGames(el, gen, key) {
  const best = store.get('gbest', {});
  el.innerHTML = `<div class="card"><h2>🎮 ألعابُ الدرس</h2><p class="meta">ألعابٌ أسئلتُها من هذا الدرسِ ومن أسئلةِ نافس — تتغيّرُ في كلِّ مرّة، ومناسبةٌ للعرضِ على السبّورةِ الذكيّة.</p>
    <div class="ggrid">${GAMES.map(([k, i, t, d]) => `<button class="gcard g-${k}" data-g="${k}"><span class="gi">${i}</span><b>${t}</b><small>${d}</small>${best[key + ':' + k] ? `<em>🏅 أفضلُ نتيجة: ${AR(best[key + ':' + k])}</em>` : ''}</button>`).join('')}</div>
    <div class="row c"><button class="btn s sm" data-a="tools">🎡 أدواتُ الصفّ (العجلةُ والاختيارُ العشوائيّ)</button></div></div>`;
  $$('.gcard', el).forEach(b => b.onclick = () => playGame(b.dataset.g, gen, key, () => tabGames(el, gen, key)));
  $('[data-a="tools"]', el).onclick = () => openTools(gen);
}
function playGame(g, gen, key, refresh) {
  const G = GAMES.find(x => x[0] === g); const S = stage(G[1] + ' ' + G[2], refresh);
  ({ race, balloon, tug, tf, climb, memory })[g](S, gen, key, () => { S.d._stop && S.d._stop(); playGame(g, gen, key, refresh); S.d.remove(); });
}

function race(S, gen, key, again) {
  let score = 0, t = 60, streak = 0;
  const iv = setInterval(() => { t--; upd(); if (t <= 0) end(); }, 1000); S.d._stop = () => clearInterval(iv);
  const upd = () => { S.sc.innerHTML = `⏱️ ${AR(t)} · ⭐ ${AR(score)}${streak > 2 ? ' · 🔥' + AR(streak) : ''}`; const b = $('.gtime i', S.body); if (b) b.style.width = (t / 60 * 100) + '%'; };
  const ask = () => { const Q = next(gen); if (!Q) return end(); S.body.innerHTML = `<div class="gtime"><i></i></div>${qBlock(Q)}<div class="gopts">${Q.opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('')}</div>`; upd();
    $$('.gopts button', S.body).forEach(b => b.onclick = () => { const ok = +b.dataset.i === Q.a; b.classList.add(ok ? 'ok' : 'no'); if (ok) { score++; streak++; good(); } else { streak = 0; bad(); $$('.gopts button', S.body)[Q.a].classList.add('ok'); } $$('.gopts button', S.body).forEach(x => x.disabled = true); setTimeout(ask, ok ? 350 : 1100); }); };
  const end = () => { clearInterval(iv); const nb = saveBest(key, 'race', score); if (score >= 8) star(2, 'سباقٌ رائع!'); endScreen(S, score >= 10 ? '🏆' : score >= 5 ? '🥇' : '👏', `${AR(score)} إجاباتٍ صحيحة${nb && score ? ' — رقمٌ قياسيٌّ جديد!' : ''}`, again); };
  ask();
}

function balloon(S, gen, key, again) {
  let score = 0, lives = 3, raf, Q, items = [];
  const upd = () => S.sc.innerHTML = `${'❤️'.repeat(lives)}${'🤍'.repeat(3 - lives)} · ⭐ ${AR(score)}`;
  S.body.innerHTML = '<div class="bq"></div><div class="bsky"></div>'; const sky = $('.bsky', S.body);
  const cols = ['#e8503a', '#3a7ae0', '#2f8f6a', '#c03ad8', '#e0a21a'];
  const round = () => {
    cancelAnimationFrame(raf); Q = next(gen); if (!Q) return end(); $('.bq', S.body).innerHTML = qBlock(Q); sky.innerHTML = '';
    const H = sky.clientHeight, W = sky.clientWidth, n = Q.opts.length, sp = .55 + score * .04;
    items = shuf(Q.opts.map((o, i) => i)).map((i, k) => { const b = document.createElement('button'); b.className = 'balloon'; b.style.setProperty('--c', cols[(i + score) % cols.length]); b.innerHTML = `<span>${Q.opts[i]}</span>`; sky.appendChild(b);
      const it = { b, i, x: (k + .5) / n * W, y: H + 40 + Math.random() * 120, v: sp * (.8 + Math.random() * .5), w: Math.random() * 6 }; b.onclick = () => hit(it); return it; });
    let last = performance.now();
    const step = now => { const dt = Math.min(50, now - last) / 16; last = now; let lost = false;
      for (const it of items) { if (it.gone) continue; it.y -= it.v * dt; it.b.style.transform = `translate(${it.x - 60 + Math.sin((it.y + it.w * 40) / 40) * 10}px, ${it.y}px)`; if (it.y < -150) { it.gone = 1; it.b.remove(); if (it.i === Q.a) lost = true; } }
      if (lost) { lives--; bad(); upd(); toast('✗ طارَ البالونُ الصحيح: ' + Q.opts[Q.a]); if (lives <= 0) return end(); return setTimeout(round, 900); }
      raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };
  const hit = it => { if (it.gone) return; if (it.i === Q.a) { it.b.classList.add('pop'); score++; good(); upd(); items.forEach(x => x.gone = 1); cancelAnimationFrame(raf); setTimeout(round, 500); } else { it.b.classList.add('shake'); bad(); it.gone = 1; setTimeout(() => it.b.remove(), 400); lives--; upd(); if (lives <= 0) { cancelAnimationFrame(raf); end(); } } };
  const end = () => { cancelAnimationFrame(raf); const nb = saveBest(key, 'balloon', score); if (score >= 8) star(2, 'بالوناتٌ كثيرة!'); endScreen(S, score >= 10 ? '🎉' : '🎈', `فرقعتَ ${AR(score)} بالونًا${nb && score ? ' — رقمٌ قياسيٌّ جديد!' : ''}`, again); };
  S.d._stop = () => cancelAnimationFrame(raf); upd(); setTimeout(round, 50);
}

function tug(S, gen, key, again) {
  const names = store.get('teams', ['الفريق الأحمر', 'الفريق الأزرق']); let pos = 0, Q, lock = [0, 0], over = false; const WIN = 5;
  S.body.innerHTML = `<div class="tteams"><input value="${names[0]}" data-t="0"><span>ضدّ</span><input value="${names[1]}" data-t="1"></div><div class="rope"><div class="rline"></div><div class="rknot">🎀</div><span class="rr">🧍‍♂️🧍‍♂️</span><span class="rl">🧍‍♂️🧍‍♂️</span></div><div class="tq"></div><div class="tsides"><div class="tside t0"></div><div class="tside t1"></div></div>`;
  $$('.tteams input', S.body).forEach(inp => inp.onchange = () => { names[+inp.dataset.t] = inp.value || names[+inp.dataset.t]; store.set('teams', names); });
  const knot = () => { $('.rknot', S.body).style.transform = `translateX(${pos * 9}%)`; $('.rline', S.body).style.transform = `translateX(${pos * 9}%)`; S.sc.textContent = `${names[0]} ${AR(Math.max(0, pos))} · ${AR(Math.max(0, -pos))} ${names[1]}`; };
  const round = () => { if (over) return; Q = next(gen); if (!Q) return; lock = [0, 0]; $('.tq', S.body).innerHTML = qBlock(Q);
    [0, 1].forEach(t => { const ord = shuf(Q.opts.map((o, i) => i)); const h = $('.t' + t, S.body); h.innerHTML = `<b class="tn">${names[t]}</b><div class="gopts">${ord.map(i => `<button data-i="${i}">${Q.opts[i]}</button>`).join('')}</div>`;
      $$('button', h).forEach(b => b.onclick = () => { if (lock[t] || over) return; if (+b.dataset.i === Q.a) { b.classList.add('ok'); good(); pos += t === 0 ? 1 : -1; knot(); lock = [1, 1]; $$('.tside button', S.body).forEach(x => x.disabled = true);
        if (Math.abs(pos) >= WIN) { over = true; setTimeout(() => endScreen(S, '🏆', `فازَ ${names[pos > 0 ? 0 : 1]}!`, again), 700); } else setTimeout(round, 900); }
        else { b.classList.add('no'); bad(); lock[t] = 1; $$('button', h).forEach(x => x.disabled = true); if (lock[0] && lock[1]) setTimeout(round, 1200); } }); }); };
  knot(); round();
}

function tf(S, gen, key, again) {
  let k = 0, score = 0, tm; const R = 10;
  const ask = () => { clearInterval(tm); if (k >= R) return end(); const Q = next(gen); if (!Q) return end(); k++;
    const truth = Math.random() < .5, shown = truth ? Q.a : pick(Q.opts.map((o, i) => i).filter(i => i !== Q.a));
    S.body.innerHTML = `<div class="gtime"><i></i></div><div class="tfk">${AR(k)} / ${AR(R)}</div>${qBlock(Q)}<div class="tfa">الإجابة: <b>${Q.opts[shown]}</b></div><div class="tfb"><button class="tok" data-v="1">✓ صحيحة</button><button class="tno" data-v="0">✗ خطأ</button></div>`;
    let t = 100; tm = setInterval(() => { t -= 1.25; $('.gtime i', S.body).style.width = t + '%'; if (t <= 0) { clearInterval(tm); bad(); toast('انتهى الوقت!'); setTimeout(ask, 700); } }, 100);
    $$('.tfb button', S.body).forEach(b => b.onclick = () => { clearInterval(tm); const ok = (+b.dataset.v === 1) === truth; b.classList.add(ok ? 'ok' : 'no'); if (ok) { score++; good(); } else { bad(); $('.tfa', S.body).innerHTML += `<div class="meta">الإجابةُ الصحيحة: ${Q.opts[Q.a]}</div>`; } S.sc.textContent = '⭐ ' + AR(score); $$('.tfb button', S.body).forEach(x => x.disabled = true); setTimeout(ask, ok ? 600 : 1600); }); };
  const end = () => { clearInterval(tm); saveBest(key, 'tf', score); if (score >= 9) star(2, 'صحّ أم خطأ: ممتاز!'); endScreen(S, score >= 9 ? '🏆' : score >= 6 ? '👍' : '💪', `${AR(score)} من ${AR(R)}`, again); };
  S.d._stop = () => clearInterval(tm); S.sc.textContent = '⭐ ٠'; ask();
}

function climb(S, gen, key, again) {
  let lv = 0, moves = 0; const TOP = 10;
  const draw = Q => { S.body.innerHTML = `<div class="mtn"><div class="steps">${Array.from({ length: TOP + 1 }, (_, i) => `<i class="${i === TOP ? 'top' : ''} ${i <= lv ? 'on' : ''}">${i === TOP ? '🚩' : AR(i)}</i>`).join('')}</div><div class="climber" style="bottom:${lv / TOP * 88}%">🧗</div></div>${qBlock(Q)}<div class="gopts">${Q.opts.map((o, i) => `<button data-i="${i}">${o}</button>`).join('')}</div>`;
    S.sc.textContent = `الدرجة ${AR(lv)} من ${AR(TOP)} · المحاولات ${AR(moves)}`;
    $$('.gopts button', S.body).forEach(b => b.onclick = () => { moves++; const ok = +b.dataset.i === Q.a; b.classList.add(ok ? 'ok' : 'no'); $$('.gopts button', S.body).forEach(x => x.disabled = true); if (ok) { lv++; good(); } else { lv = Math.max(0, lv - 1); bad(); $$('.gopts button', S.body)[Q.a].classList.add('ok'); }
      if (lv >= TOP) { saveBest(key, 'climb', TOP); star(3, 'وصلتَ إلى القمّة!'); setTimeout(() => endScreen(S, '🏔️', `وصلتَ إلى القمّةِ في ${AR(moves)} محاولة!`, again), 500); } else setTimeout(() => ask(), ok ? 450 : 1300); }); };
  const ask = () => { const Q = next(gen); if (Q) draw(Q); };
  ask();
}

/* ═════════ أدواتُ الصفّ ═════════ */
const getNames = () => store.get('names', []);
const pool = () => { const n = getNames(); return n.length ? n : Array.from({ length: store.get('ncount', 25) }, (_, i) => 'الطالب ' + AR(i + 1)); };
function openTools(gen, standalone) {
  const S = stage('🎡 أدواتُ الصفّ', null); if (standalone) $('.gx', S.d).onclick = () => { if (window.parent !== window) parent.postMessage({ mb: 'close' }, '*'); else history.back(); };
  const tabs = [['wheel', '🎡 عجلةُ الطلاب'], ['qwheel', '🎯 عجلةُ الأسئلة'], ['pick', '🎲 اختيارٌ عشوائيّ'], ['groups', '👥 المجموعات'], ['timer', '⏱️ المؤقّت'], ['names', '📝 الأسماء']];
  if (gen) tabs.splice(2, 0, ['ask', '❓ سؤالٌ عشوائيّ']);
  S.body.innerHTML = `<div class="ttabs">${tabs.map(([k, t]) => `<button data-k="${k}">${t}</button>`).join('')}</div><div class="tbody"></div>`;
  const B = $('.tbody', S.body); let stop = () => {};
  const show = k => { stop(); stop = () => {}; $$('.ttabs button', S.body).forEach(b => b.classList.toggle('on', b.dataset.k === k)); store.set('ttab', k); stop = ({ wheel, pick: picker, groups, timer, names: namesT, ask: askT, qwheel })[k](B, gen) || (() => {}); };
  $$('.ttabs button', S.body).forEach(b => b.onclick = () => show(b.dataset.k)); S.d._stop = () => stop();
  show(getNames().length || store.get('ttab') !== 'names' ? (tabs.some(t => t[0] === store.get('ttab')) ? store.get('ttab') : 'wheel') : 'names');
}
function winnerPop(B, name, extra = '') { const w = document.createElement('div'); w.className = 'winner'; w.innerHTML = `<div><small>🎉 الاختيارُ هو</small><b>${name}</b>${extra}<button class="btn sm">حسنًا</button></div>`; B.appendChild(w); fanfare(); confetti(w); $('button', w).onclick = () => w.remove(); return w; }

function wheel(B) {
  let list = pool(), rem = store.get('wrem', true), used = [];
  B.innerHTML = `<div class="wwrap"><div class="wptr">▼</div><canvas width="640" height="640"></canvas><button class="wspin">لُفّ!</button></div>
    <div class="row c"><label class="chk"><input type="checkbox" ${rem ? 'checked' : ''}> استبعادُ من وقعَ عليه الاختيار</label><button class="btn s sm" data-a="reset">↺ إعادةُ الجميع</button></div><p class="meta c" id="wleft"></p>`;
  const cv = $('canvas', B), cx = cv.getContext('2d'); let ang = 0, spinning = false;
  const cols = ['#15445a', '#0da9a6', '#3d7eb9', '#07a869', '#0b2a38', '#2a7f9e', '#5b8f3a', '#b08a3a'];
  const avail = () => list.filter(n => !used.includes(n));
  const draw = () => { const L = avail(), n = L.length, R = 310; cx.clearRect(0, 0, 640, 640); cx.save(); cx.translate(320, 320); cx.rotate(ang);
    L.forEach((name, i) => { const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI; cx.beginPath(); cx.moveTo(0, 0); cx.arc(0, 0, R, a0, a1); cx.fillStyle = cols[i % cols.length] + (n > 16 && i % 2 ? 'cc' : ''); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.stroke();
      cx.save(); cx.rotate((a0 + a1) / 2); cx.fillStyle = '#fff'; cx.font = `800 ${n > 30 ? 15 : n > 18 ? 19 : 24}px Tajawal, sans-serif`; cx.textAlign = 'right'; cx.textBaseline = 'middle'; cx.shadowColor = '#0006'; cx.shadowBlur = 3; cx.fillText(name.length > 16 ? name.slice(0, 15) + '…' : name, R - 16, 0); cx.restore(); });
    cx.restore(); cx.beginPath(); cx.arc(320, 320, 34, 0, 7); cx.fillStyle = '#fff'; cx.fill(); $('#wleft', B).textContent = `المتبقّي: ${AR(n)} من ${AR(list.length)}`; };
  const spin = () => { const L = avail(); if (spinning || !L.length) return; spinning = true; const n = L.length, k = Math.floor(Math.random() * n);
    const target = -Math.PI / 2 - (k + .5) / n * 2 * Math.PI, base = ang - (ang % (2 * Math.PI)), end = base + 2 * Math.PI * (6 + Math.floor(Math.random() * 3)) + ((target - base) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const st = ang, t0 = performance.now(), D = 4800; let lastSeg = -1;
    const f = now => { const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 4); ang = st + (end - st) * e; draw(); const seg = Math.floor(((-(ang + Math.PI / 2)) / (2 * Math.PI) * n % n + n) % n); if (seg !== lastSeg) { lastSeg = seg; beep(1200, .03, 'square', .05); }
      if (p < 1) requestAnimationFrame(f); else { spinning = false; const name = L[k]; winnerPop(B, name); if ($('.chk input', B).checked) used.push(name); setTimeout(draw, 50); } };
    requestAnimationFrame(f); };
  $('.wspin', B).onclick = spin; cv.onclick = spin; $('.chk input', B).onchange = e => store.set('wrem', e.target.checked); $('[data-a="reset"]', B).onclick = () => { used = []; draw(); };
  draw();
}
function picker(B) {
  const list = pool(); let used = [];
  B.innerHTML = `<div class="pk"><div class="pkcard">؟</div></div><div class="row c"><span>عدد الطلاب:</span><select id="pkn">${[1, 2, 3, 4, 5].map(i => `<option>${AR(i)}</option>`).join('')}</select><button class="btn" data-a="go">🎲 اخترْ</button><button class="btn s sm" data-a="reset">↺</button></div><div class="pkres"></div>`;
  $('[data-a="reset"]', B).onclick = () => { used = []; $('.pkres', B).innerHTML = ''; };
  $('[data-a="go"]', B).onclick = () => { const k = $('#pkn', B).selectedIndex + 1; let av = list.filter(n => !used.includes(n)); if (av.length < k) { used = []; av = list.slice(); } const ch = shuf(av).slice(0, k); const c = $('.pkcard', B); let i = 0;
    const iv = setInterval(() => { c.textContent = pick(list); c.classList.toggle('fl'); beep(500 + i * 25, .04, 'square', .04); if (++i > 22) { clearInterval(iv); c.textContent = ch.join('، '); c.classList.add('win'); setTimeout(() => c.classList.remove('win'), 900); used.push(...ch); fanfare(); $('.pkres', B).innerHTML = `<p class="meta">اختيرَ سابقًا: ${used.map(n => `<span class="pill">${n}</span>`).join(' ')}</p>`; } }, 70 + i); };
}
function groups(B) {
  B.innerHTML = `<div class="row c"><span>عدد المجموعات:</span><select id="gn">${[2, 3, 4, 5, 6, 7, 8].map(i => `<option value="${i}" ${i === store.get('gcount', 4) ? 'selected' : ''}>${AR(i)}</option>`).join('')}</select><button class="btn" data-a="go">👥 وزّعِ الطلاب</button></div><div class="grps"></div>`;
  const cols = ['#e8503a', '#3a7ae0', '#2f8f6a', '#8a4ad8', '#e0a21a', '#d84a9a', '#3aa8a8', '#6a6455'];
  $('[data-a="go"]', B).onclick = () => { const k = +$('#gn', B).value; store.set('gcount', k); const L = shuf(pool()), G = Array.from({ length: k }, () => []); L.forEach((n, i) => G[i % k].push(n));
    $('.grps', B).innerHTML = G.map((g, i) => `<div class="grp" style="--c:${cols[i % cols.length]};animation-delay:${i * .08}s"><b>المجموعة ${AR(i + 1)}</b>${g.map(n => `<span>${n}</span>`).join('')}</div>`).join(''); good(); };
}
function timer(B) {
  let left = store.get('tsec', 120), run = false, iv;
  B.innerHTML = `<div class="tm"><div class="tmd">0:00</div><div class="row c">${[30, 60, 120, 180, 300, 600].map(s => `<button class="btn s sm" data-s="${s}">${s < 60 ? AR(s) + ' ث' : AR(s / 60) + ' د'}</button>`).join('')}</div><div class="row c"><button class="btn" data-a="go">▶ ابدأ</button><button class="btn s" data-a="reset">↺</button><button class="btn s sm" data-a="m">−١٠ث</button><button class="btn s sm" data-a="p">+١٠ث</button></div></div>`;
  let total = left; const d = $('.tmd', B);
  const show = () => { d.textContent = AR(Math.floor(left / 60)) + ':' + AR(String(left % 60).padStart(2, '0')); d.style.setProperty('--p', total ? left / total * 100 : 0); d.classList.toggle('low', left <= 10 && left > 0); };
  const toggle = () => { run = !run; $('[data-a="go"]', B).textContent = run ? '⏸ إيقاف' : '▶ ابدأ'; clearInterval(iv); if (run) iv = setInterval(() => { left--; if (left <= 5 && left > 0) beep(880, .08); show(); if (left <= 0) { clearInterval(iv); run = false; $('[data-a="go"]', B).textContent = '▶ ابدأ'; [0, 300, 600].forEach(t => setTimeout(() => beep(520, .35, 'triangle', .2), t)); d.classList.add('done'); setTimeout(() => d.classList.remove('done'), 3000); } }, 1000); };
  $$('[data-s]', B).forEach(b => b.onclick = () => { left = total = +b.dataset.s; store.set('tsec', left); show(); });
  $('[data-a="go"]', B).onclick = () => { if (left <= 0) left = total; toggle(); };
  $('[data-a="reset"]', B).onclick = () => { clearInterval(iv); run = false; left = total; $('[data-a="go"]', B).textContent = '▶ ابدأ'; show(); };
  $('[data-a="m"]', B).onclick = () => { left = Math.max(0, left - 10); show(); }; $('[data-a="p"]', B).onclick = () => { left += 10; total = Math.max(total, left); show(); };
  show(); return () => clearInterval(iv);
}
function askT(B, gen) {
  B.innerHTML = `<div class="row c"><button class="btn" data-a="go">❓ سؤالٌ جديد</button><button class="btn s" data-a="who">🎲 مَن يُجيب؟</button></div><div class="aq"></div>`;
  $('[data-a="go"]', B).onclick = () => { const Q = next(gen); if (!Q) return; $('.aq', B).innerHTML = `${qBlock(Q)}<div class="gopts">${Q.opts.map((o, i) => `<button data-i="${i}">${'أبجد'[i]}) ${o}</button>`).join('')}</div><div class="row c"><button class="btn s sm" data-a="rev">👁️ أظهرِ الإجابة</button></div>${Q.e ? `<div class="nfe ok" hidden>${Q.e}</div>` : ''}`;
    const rev = () => { $$('.aq .gopts button', B)[Q.a].classList.add('ok'); const e = $('.aq .nfe', B); if (e) e.hidden = false; };
    $$('.aq .gopts button', B).forEach(b => b.onclick = () => { if (+b.dataset.i === Q.a) good(); else { b.classList.add('no'); bad(); } rev(); }); $('[data-a="rev"]', B).onclick = rev; };
  $('[data-a="who"]', B).onclick = () => winnerPop(B, pick(pool()));
  $('[data-a="go"]', B).click();
}
function namesT(B) {
  B.innerHTML = `<div class="card nm"><h3>📝 أسماءُ طلابِ الفصل</h3><p class="meta">اكتبْ كلَّ اسمٍ في سطر (أو الصقِ القائمةَ من ملفِّ Excel). تُحفَظُ الأسماءُ على هذا الجهازِ فقط.</p>
    <textarea rows="10" placeholder="محمد&#10;عبدالله&#10;خالد">${getNames().join('\n')}</textarea>
    <div class="row"><button class="btn" data-a="save">💾 حفظ</button><button class="btn s sm" data-a="clr">مسحُ الأسماء</button></div>
    <p class="meta">أو استعملِ الأرقامَ بدلَ الأسماء: عددُ الطلاب <input type="number" min="2" max="60" value="${store.get('ncount', 25)}" id="ncount" style="width:70px"></p></div>`;
  $('[data-a="save"]', B).onclick = () => { const L = $('textarea', B).value.split(/\n|،|,/).map(s => s.trim()).filter(Boolean); store.set('names', [...new Set(L)]); store.set('ncount', Math.max(2, Math.min(60, +$('#ncount', B).value || 25))); toast(L.length ? `✓ حُفظ ${AR(L.length)} اسمًا` : '✓ ستُستعمَلُ الأرقام'); };
  $('[data-a="clr"]', B).onclick = () => { $('textarea', B).value = ''; store.set('names', []); toast('مُسحتِ الأسماء'); };
}

/* ═════════ التركيب على الكتاب ═════════ */
export function initPlay(LESSONS, opt) {
  const st = document.createElement('style'); st.textContent = opt.css || ''; document.head.appendChild(st);
  const curLesson = () => { const c = window.__book ? window.__book.cur : 1; return LESSONS.find(x => c >= x.from && c <= x.to) || LESSONS.find(x => x.from >= c) || LESSONS[LESSONS.length - 1]; };
  let pane = null;
  const openGames = L => { L = L || curLesson(); MEM = (L.vocab || []).filter(v => v.key); const gen = makeGen(L, opt.nafes);
    const S = stage('🎮 ألعابُ الدرس — ' + L.title.split(': ').pop(), null); pane = S; tabGames(S.body, gen, L.id);
    const sel = document.createElement('select'); sel.className = 'glsel'; sel.innerHTML = LESSONS.map((x, i) => `<option value="${i}" ${x === L ? 'selected' : ''}>${x.title}</option>`).join(''); S.body.prepend(sel);
    sel.onchange = () => { S.close(); openGames(LESSONS[+sel.value]); }; };
  const openT = L0 => { const L = L0 && L0.vocab ? L0 : curLesson(); MEM = (L.vocab || []).filter(v => v.key); openTools(makeGen(L, opt.nafes)); };
  const mk = (id, title, svg, lbl, f) => { const b = document.createElement('button'); b.className = 'tb'; b.id = id; b.title = title; b.innerHTML = svg + `<span class="lbl">${lbl}</span>`; b.onclick = f; return b; };
  const gb = mk('btnGames', 'ألعاب الدرس', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r="1" fill="currentColor"/><circle cx="18.5" cy="14" r="1" fill="currentColor"/></svg>', 'ألعاب', () => openGames());
  const wb = mk('btnWheel', 'عجلة الروليت وأدوات الصف', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>', 'العجلة', openT);
  const anchor = document.getElementById('btnPrac') || document.getElementById('btnLesson'); gb.classList.add('gold'); anchor.after(gb); gb.after(wb);
  const tp = document.getElementById('toolsPop'); if (tp) [['🎡 عجلة الروليت وأدوات الصف', openT], ['🎮 ألعاب الدرس', () => openGames()]].forEach(([t, f]) => { const b = document.createElement('button'); b.textContent = t; tp.prepend(b); b.onclick = () => { tp.classList.remove('open'); f(); }; });
  return { openGames, openTools: openT, isOpen: () => !!document.querySelector('.gstage'), close: () => { const d = document.querySelector('.gstage'); if (d && d._close) d._close(); else if (d) d.remove(); document.body.classList.remove('gopen'); } };
}
