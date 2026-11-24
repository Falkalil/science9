// المختبراتُ الافتراضيّة — مختبرٌ لكلِّ وحدةٍ في كتبِ العلومِ للصفوفِ ١–٦
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

const CSS = `
.vl{margin-top:8px}
.vl .vtabs{display:flex;gap:6px;margin:6px 0 10px;flex-wrap:wrap}
.vl .vtabs button{flex:1;min-width:150px;border:2px solid #3a7ae0;background:#fff;color:#1a4a9a;border-radius:12px;padding:8px;font-weight:800;font:inherit;font-weight:800}
.vl .vtabs button.on{background:#3a7ae0;color:#fff}
.vl .stage{background:linear-gradient(180deg,#dff1ff 0%,#f4fbff 62%,#e9dcc4 62%,#dccaa8 100%);border-radius:16px;border:1px solid #c9dcef;overflow:hidden;position:relative}
.vl .stage svg{display:block;width:100%;height:auto}
.vl .ctl{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.vl .ctl button{border:0;border-radius:12px;padding:10px 14px;font:inherit;font-weight:800;background:#3a7ae0;color:#fff;box-shadow:0 3px 0 #2a5ab0}
.vl .ctl button.w{background:#2aa0d8;box-shadow:0 3px 0 #1a7ab0}.vl .ctl button.g{background:#2f8f6a;box-shadow:0 3px 0 #1f6f50}.vl .ctl button.s{background:#fff;color:#5a4a36;box-shadow:0 3px 0 #d9c9a8;border:1px solid #d9c9a8}
.vl .ctl button:disabled{opacity:.45}
.vl .day{position:absolute;top:8px;right:10px;background:#fff;border-radius:12px;padding:4px 12px;font-weight:800;color:#1a4a9a;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.vl .msg{background:#fffbea;border-top:2px solid #f0d890;padding:8px 14px;font-weight:800;color:#3a2a10;text-align:center;font-size:16px;min-height:24px}
.vl table{width:100%;border-collapse:collapse;margin-top:6px;font-size:15px;background:#fff}
.vl th,.vl td{border:1px solid #d9e4f0;padding:6px;text-align:center}.vl th{background:#eaf3ff;color:#1a4a9a}
.vl .sw{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.vl .sw label{flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:2px solid #cfdcec;border-radius:14px;padding:10px;font-weight:800;cursor:pointer;user-select:none}
.vl .sw label.on{border-color:#2f8f6a;background:#eefaf3}
.vl .sw input{width:20px;height:20px;accent-color:#2f8f6a}
.vl .pred{background:#fff8e6;border:1px dashed #e0a830;border-radius:14px;padding:10px;margin:8px 0}
.vl .health{height:12px;background:#eee;border-radius:9px;overflow:hidden;margin-top:4px}.vl .health i{display:block;height:100%;transition:width .5s,background .5s}
`;

function plantSVG(x, base, h, health, opt = {}) {
  // h: ارتفاع الساق بالبكسل، health: 0..1 (1 سليم)، opt.pale: نقص الضوء
  const droop = (1 - health), bend = droop * 60;
  const green = opt.pale ? mix('#c9c96a', '#5aa83a', health) : mix('#a88a4a', '#4f9a3a', health);
  const top = [x + bend * .6, base - h + droop * h * .25];
  const stem = `<path d="M${x} ${base} Q${x} ${base - h * .6} ${top[0]} ${top[1]}" stroke="${mix('#8a7a4a', '#4f8a32', health)}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const n = Math.max(1, Math.round(h / 40));
  let leaves = '';
  for (let i = 0; i < n; i++) {
    const t = (i + .7) / (n + .4), px = x + (top[0] - x) * t * t, py = base - (base - top[1]) * t, L = 30 + Math.min(i, 3) * 4;
    for (const s of [-1, 1]) {
      const ang = -32 + droop * 85 + (i % 2 ? 6 : -4);
      leaves += `<path d="M0 0 Q${L * .45} ${-L * .38} ${L} 0 Q${L * .45} ${L * .38} 0 0 Z" fill="${green}" stroke="${mix('#7a6a3a', '#3a7a2a', health)}" stroke-width="1.5" transform="translate(${px} ${py}) scale(${s} 1) rotate(${ang})"/><path d="M2 0 L${L * .85} 0" stroke="${mix('#7a6a3a', '#3a7a2a', health)}" stroke-width="1" opacity=".6" transform="translate(${px} ${py}) scale(${s} 1) rotate(${ang})"/>`;
    }
  }
  const flower = h > 120 && health > .7 ? `<g transform="translate(${top[0]} ${top[1] - 6})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="9" ry="5" cx="9" transform="rotate(${a})" fill="#ffd34a"/>`).join('')}<circle r="6" fill="#e08a1a"/></g>` : `<circle cx="${top[0]}" cy="${top[1]}" r="5" fill="${green}"/>`;
  return stem + leaves + flower;
}
function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const pot = (x, y) => `<path d="M${x - 62} ${y} L${x + 62} ${y} L${x + 48} ${y + 78} L${x - 48} ${y + 78} Z" fill="#c8704a" stroke="#9a5030" stroke-width="2"/><rect x="${x - 68}" y="${y - 10}" width="136" height="16" rx="5" fill="#d8805a" stroke="#9a5030" stroke-width="2"/><ellipse cx="${x}" cy="${y - 2}" rx="60" ry="7" fill="#6a4a2a"/>`;
const can = (x, y, on) => on ? `<g transform="translate(${x} ${y}) rotate(-28)"><rect x="-30" y="-18" width="52" height="36" rx="8" fill="#3aa0e0"/><path d="M22 -10 L58 -26 L60 -20 L24 0 Z" fill="#3aa0e0"/><path d="M-30 -10 Q-48 0 -30 12" stroke="#2a80c0" stroke-width="5" fill="none"/></g>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${x + 40 + (i % 3) * 7}" cy="${y + 10 + i * 12}" r="3.5" fill="#4ab0ff"><animate attributeName="cy" from="${y + 6}" to="${y + 90}" dur=".6s" begin="${i * .1}s" repeatCount="indefinite"/></circle>`).join('')}` : '';

export function labLiving(box, api) {
  if (!document.getElementById('vlCSS')) { const s = document.createElement('style'); s.id = 'vlCSS'; s.textContent = CSS; document.head.appendChild(s); }
  let mode = 0;
  box.innerHTML = `<div class="vl"><div class="vtabs"><button data-m="0" class="on">🪴 التجربة ١: النبات والحجر</button><button data-m="1">🔬 التجربة ٢: ماذا يحتاج النبات؟</button></div><div class="vb"></div></div>`;
  const vb = box.querySelector('.vb');
  box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = +b.dataset.m; box.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); (mode ? exp2 : exp1)(); });

  /* ── التجربة ١: نبات وحجر نرويهما أسبوعًا (ص ١٥) ── */
  function exp1() {
    let day = 0, watered = false, wateringAnim = 0, h = 60, health = 1, dry = 0, pred = null, done = false;
    const log = [];
    vb.innerHTML = `
      <div class="pred"><b>١) أتوقّعُ قبلَ أن أبدأ:</b> ماذا سيحدثُ للنباتِ والحجرِ إذا رويتُهما بالماءِ أسبوعًا كاملًا؟
        <div class="chips" style="margin-top:6px">${['النباتُ ينمو، والحجرُ لا يتغيّر', 'النباتُ والحجرُ ينموان معًا', 'لا يتغيّرُ أيٌّ منهما'].map((c, i) => `<button class="chip" data-p="${i}">${c}</button>`).join('')}</div></div>
      <b>٢) أجرّب:</b> أسقي النباتَ والحجرَ ثم أنتقلُ إلى اليومِ التالي. (جرّبْ أيضًا أن تنسى السقيَ يومين!)
      <div class="stage"><svg viewBox="0 0 640 380"></svg><div class="day"></div><div class="msg"></div></div>
      <div class="ctl"><button class="w" id="e1w">💧 أسقي النباتَ والحجر</button><button id="e1d">🌙 مرَّ يوم ←</button><button class="s" id="e1r">🔄 من البداية</button></div>
      <b>٣) أسجّلُ البيانات:</b>
      <table><thead><tr><th>اليوم</th><th>سقيتُ؟</th><th>طولُ النبات</th><th>حالُ النبات</th><th>الحجر</th></tr></thead><tbody id="e1t"><tr><td colspan="5" style="color:#999">ابدأ التجربة…</td></tr></tbody></table>
      <div id="e1c"></div>`;
    const svg = vb.querySelector('svg'), msg = vb.querySelector('.msg'), dayEl = vb.querySelector('.day');
    vb.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { vb.querySelectorAll('[data-p]').forEach(x => x.classList.remove('on')); b.classList.add('on'); pred = +b.dataset.p; });
    function draw() {
      const wet = watered;
      svg.innerHTML = `
        ${pot(180, 280)}${plantSVG(180, 276, h, health)}
        <text x="180" y="372" text-anchor="middle" font-size="20" font-weight="800" fill="#3a2a10">النبات 🌱</text>
        <ellipse cx="460" cy="345" rx="92" ry="16" fill="#9ab8d0" opacity=".55"/><path d="M370 300 Q460 362 550 300 Z" fill="#cfe9ff" stroke="#8ab" stroke-width="2" opacity=".9"/>
        ${wet ? `<path d="M380 304 Q460 352 540 304 Z" fill="#4aa3e8" opacity=".45"/>` : ''}
        <path d="M410 300 Q408 262 440 252 Q478 240 506 262 Q522 280 512 302 Z" fill="${wet ? '#6e6a66' : '#9a948c'}" stroke="#5a554f" stroke-width="2"/>
        <path d="M432 270 Q452 262 470 270" stroke="${wet ? '#5a5652' : '#b8b2aa'}" stroke-width="3" fill="none"/>
        <text x="460" y="372" text-anchor="middle" font-size="20" font-weight="800" fill="#3a2a10">الحجر 🪨</text>
        <g>${can(wateringAnim ? 70 : -200, 120, wateringAnim)}${can(wateringAnim ? 360 : -200, 170, wateringAnim)}</g>
        <circle cx="590" cy="50" r="26" fill="#ffd34a"/>`;
      dayEl.textContent = 'اليوم ' + AR(day) + ' من ٧';
      vb.querySelector('#e1d').disabled = done;
      vb.querySelector('#e1w').disabled = done || watered;
    }
    function row() {
      const st = health > .8 ? '😊 سليمٌ أخضر' : health > .45 ? '😟 بدأ يذبل' : '😢 ذابل';
      log.push(`<tr><td>${AR(day)}</td><td>${watered ? '💧 نعم' : '✗ لا'}</td><td>${AR((h / 20).toFixed(1))} سم</td><td>${st}</td><td>لم يتغيّر</td></tr>`);
      vb.querySelector('#e1t').innerHTML = log.join('');
    }
    vb.querySelector('#e1w').onclick = () => {
      if (watered || done) return; watered = true; wateringAnim = 1; msg.textContent = '💧 سقيتُ النباتَ والحجرَ بالماء'; draw();
      setTimeout(() => { wateringAnim = 0; draw(); }, 1300);
    };
    vb.querySelector('#e1d').onclick = () => {
      if (done) return;
      if (day === 0 && pred === null) { msg.textContent = '✋ اخترْ توقّعَك أوّلًا في الأعلى'; return; }
      day++;
      if (watered) { dry = 0; health = Math.min(1, health + .35); h = Math.min(200, h + 18 * health); msg.textContent = '🌱 النباتُ شربَ الماءَ ونما! أمّا الحجرُ فبقيَ كما هو.'; }
      else { dry++; health = Math.max(.1, health - (dry > 1 ? .35 : .2)); msg.textContent = dry > 1 ? '😢 النباتُ عطشانُ ويذبل! يحتاجُ إلى الماءِ لكي يعيش.' : '😟 نسيتُ السقي… أوراقُ النباتِ بدأتْ تتدلّى.'; }
      row(); watered = false; draw();
      if (day >= 7) finish();
    };
    vb.querySelector('#e1r').onclick = exp1;
    function finish() {
      done = true; draw();
      const grew = h > 90;
      msg.textContent = grew ? '🎉 مرَّ أسبوع: النباتُ نما، والحجرُ لم يتغيّر!' : '⚠ مرَّ أسبوع: النباتُ لم ينمُ جيّدًا لأنّه لم يحصلْ على الماءِ كلَّ يوم.';
      const right = pred === 0;
      vb.querySelector('#e1c').innerHTML = `<div class="card green" style="margin-top:10px"><span class="tag g">٤) أستنتج</span>
        <p>${right ? '✅ توقّعُك صحيح!' : '🤔 توقّعُك يختلفُ عن النتيجة — وهذا جيّد؛ العالِمُ يتعلّمُ من تجربتِه.'}</p>
        <p><b>النبات</b> احتاجَ إلى الماءِ ونما وتغيّر؛ فهو <b>مخلوقٌ حيّ</b>.</p><p><b>الحجر</b> لم ينمُ ولم يتغيّرْ مع أنّنا رويناه؛ فهو <b>شيءٌ غيرُ حيّ</b>.</p>
        ${grew ? '' : '<p>💡 أعِدِ التجربةَ واسقِ النباتَ كلَّ يومٍ لترى الفرق.</p>'}</div>`;
      api.award(grew ? 3 : 1, 'أكملتَ التجربة');
    }
    draw(); msg.textContent = 'اخترْ توقّعَك، ثم اسقِ وانتقلْ يومًا بعد يوم';
  }

  /* ── التجربة ٢: ماذا يحتاج النبات؟ (ص ١٨) ── */
  function exp2() {
    const need = { sun: true, water: true, air: true }; let day = 0, h = 70, health = 1, found = {}, timer = 0;
    const NAMES = { sun: '☀️ ضوءُ الشمس', water: '💧 الماء', air: '🌬️ الهواء' };
    vb.innerHTML = `<p style="margin:4px 0"><b>أستقصي:</b> أطفئُ شرطًا واحدًا، ثم أضغطُ «مرّتْ ٣ أيام» وألاحظُ ماذا يحدثُ للنبات. أكتشفُ الأشياءَ الثلاثةَ التي يحتاجُ إليها النبات.</p>
      <div class="sw">${Object.keys(NAMES).map(k => `<label class="on"><input type="checkbox" data-k="${k}" checked>${NAMES[k]}</label>`).join('')}</div>
      <div class="stage"><svg viewBox="0 0 640 380"></svg><div class="day"></div><div class="msg"></div></div>
      <div style="font-weight:800;margin-top:6px">صحّةُ النبات:</div><div class="health"><i></i></div>
      <div class="ctl"><button class="g" id="e2d">⏩ مرّتْ ٣ أيام</button><button class="s" id="e2r">🔄 نبتةٌ جديدة</button></div>
      <div id="e2f" class="card" style="margin-top:6px"></div>`;
    const svg = vb.querySelector('svg'), msg = vb.querySelector('.msg'), dayEl = vb.querySelector('.day');
    function draw(anim) {
      const dark = !need.sun, jar = !need.air;
      svg.innerHTML = `
        ${dark ? '<rect width="640" height="380" fill="#1a2240" opacity=".55"/>' : '<circle cx="560" cy="60" r="34" fill="#ffd34a"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${560 + Math.cos(i * .785) * 42}" y1="${60 + Math.sin(i * .785) * 42}" x2="${560 + Math.cos(i * .785) * 56}" y2="${60 + Math.sin(i * .785) * 56}" stroke="#ffc020" stroke-width="5" stroke-linecap="round"/>`).join('')}
        ${dark ? '<text x="320" y="72" text-anchor="middle" font-size="20" fill="#fff" font-weight="800">🌑 النبتةُ في غرفةٍ مظلمة</text>' : ''}
        ${pot(320, 280)}${plantSVG(320, 276, h, health, { pale: !need.sun && health < 1 })}
        ${need.water && anim ? can(190, 110, 1) : ''}
        ${!need.water ? `<text x="320" y="372" text-anchor="middle" font-size="18" fill="#a05a20" font-weight="800">التربةُ جافّة 🏜️</text><path d="M268 278 l10 6 l-6 6 M330 279 l8 7 M360 278 l-6 8" stroke="#3a2a10" stroke-width="2"/>` : `<text x="320" y="372" text-anchor="middle" font-size="18" fill="#2a6a2a" font-weight="800">التربةُ رطبة 💧</text>`}
        ${jar ? `<path d="M222 285 L222 70 Q222 40 252 40 L388 40 Q418 40 418 70 L418 285" fill="#cfe9ff" opacity=".35" stroke="#7aa8c8" stroke-width="4"/><rect x="236" y="26" width="168" height="18" rx="6" fill="#7aa8c8"/><text x="320" y="20" text-anchor="middle" font-size="16" fill="#1a4a6a" font-weight="800">برطمانٌ مغلق: لا يدخلُ الهواء</text>` : ''}`;
      dayEl.textContent = 'اليوم ' + AR(day);
      const hb = vb.querySelector('.health i'); hb.style.width = (health * 100) + '%'; hb.style.background = health > .7 ? '#2f8f6a' : health > .4 ? '#e0a830' : '#d04a3a';
    }
    function foundCard() {
      const keys = Object.keys(found);
      vb.querySelector('#e2f').innerHTML = `<span class="tag">📋 ما اكتشفتُه</span>${Object.keys(NAMES).map(k => `<p style="margin:4px 0">${found[k] ? '✅' : '⬜'} النباتُ يحتاجُ إلى ${NAMES[k]}</p>`).join('')}
        ${keys.length === 3 ? '<p class="fb ok" style="display:block">🌟 أحسنت! اكتشفتَ أنّ النباتَ يحتاجُ إلى <b>ضوءِ الشمسِ والماءِ والهواء</b> لكي يعيش (ص ١٨).</p>' : `<p style="color:#6a5a44;margin:4px 0">بقيَ ${AR(3 - keys.length)} — أطفئْ شرطًا آخرَ وجرّب.</p>`}`;
    }
    vb.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { need[c.dataset.k] = c.checked; c.parentElement.classList.toggle('on', c.checked); draw(); msg.textContent = c.checked ? 'أعدتَ ' + NAMES[c.dataset.k] : 'أزلتَ ' + NAMES[c.dataset.k] + ' — ماذا تتوقّع؟'; });
    vb.querySelector('#e2d').onclick = () => {
      clearInterval(timer); const miss = Object.keys(need).filter(k => !need[k]);
      let n = 0; timer = setInterval(() => {
        day++; n++;
        if (!miss.length) { health = Math.min(1, health + .15); h = Math.min(200, h + 12); }
        else health = Math.max(.08, health - .12 * miss.length);
        draw(miss.length === 0 || need.water);
        if (n >= 3) {
          clearInterval(timer);
          if (!miss.length) msg.textContent = '🌱 النباتُ حصلَ على كلِّ ما يحتاجُ إليه فنما!';
          else if (miss.length === 1) { const k = miss[0]; const isNew = !found[k]; found[k] = 1; msg.textContent = { sun: '🥀 بدونِ ضوءِ الشمسِ اصفرّتْ أوراقُ النباتِ وضعُف!', water: '🥀 بدونِ الماءِ ذبلَ النباتُ وتدلّتْ أوراقُه!', air: '🥀 بدونِ الهواءِ ذبلَ النبات!' }[k]; foundCard(); if (isNew) { api.award(1, 'اكتشفتَ حاجةً للنبات'); if (Object.keys(found).length === 3) api.award(2, 'أتممتَ المختبر'); } }
          else msg.textContent = '🥀 أزلتَ أكثرَ من شرط! أطفئْ شرطًا واحدًا فقط لتعرفَ السبب.';
        }
      }, 450);
    };
    vb.querySelector('#e2r').onclick = () => { clearInterval(timer); day = 0; h = 70; health = 1; draw(); msg.textContent = 'نبتةٌ جديدةٌ سليمة 🌱'; };
    draw(); foundCard(); msg.textContent = 'كلُّ الشروطِ متوافرة. أطفئْ واحدًا منها لتجرّب';
  }
  exp1();
}



/* ════════════ إطارُ المختبرات المشترك ════════════ */
const CSS2 = `
.vl .sl{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #d9e4f0;border-radius:12px;padding:8px 12px;margin:6px 0;font-weight:800;flex-wrap:wrap}
.vl .sl input[type=range]{flex:1;min-width:140px;accent-color:#3a7ae0;height:28px}
.vl .sl b{min-width:78px;text-align:center;color:#1a4a9a;background:#eaf3ff;border-radius:9px;padding:2px 8px}
.vl .cards{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.vl .cards button{border:2px solid #cfdcec;background:#fff;border-radius:14px;padding:8px 12px;font:inherit;font-weight:800;font-size:17px;cursor:pointer}
.vl .cards button.sel{border-color:#ff8a1e;background:#fff3e6}.vl .cards button.ok{border-color:#2f8f6a;background:#eefaf3;opacity:.55}
.vl .cards button.bad{animation:vlshake .35s}
@keyframes vlshake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.vl .zones{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.vl .zone{border-radius:16px;min-height:84px;padding:8px;border:3px solid transparent;cursor:pointer;position:relative;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45);font-weight:800}
.vl .zone.hint{border-color:#ffd34a}.vl .zone .in{font-size:28px;line-height:1.25;margin-top:4px;text-shadow:none}
.vl .meters{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:8px 0}
.vl .meters div{background:#fff;border:1px solid #d9e4f0;border-radius:12px;padding:6px;text-align:center;font-weight:800;color:#3a4a5a;font-size:14px}
.vl .meters b{display:block;font-size:22px;color:#1a4a9a}
.vl .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}
.vl .row select{font:inherit;font-weight:800;border-radius:10px;border:2px solid #cfdcec;padding:6px 8px;background:#fff}
.vl .concl{background:#eefaf3;border:1px solid #bfe3cf;border-radius:14px;padding:10px 12px;margin-top:8px;display:none}
.vl .concl.show{display:block}
.vl svg text{font-family:Tajawal,sans-serif;font-weight:800}
`;
function vlCSS() { if (!document.getElementById('vlCSS')) { const s = document.createElement('style'); s.id = 'vlCSS'; s.textContent = CSS; document.head.appendChild(s); } if (!document.getElementById('vlCSS2')) { const s = document.createElement('style'); s.id = 'vlCSS2'; s.textContent = CSS2; document.head.appendChild(s); } }
function shell(box, html) { vlCSS(); box.innerHTML = `<div class="vl">${html}</div>`; return box.firstElementChild; }
function loop(box, fn) { let last = performance.now(); const f = t => { if (!box.isConnected) return; fn(Math.min(.1, (t - last) / 1000)); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); }
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// سؤالُ التوقّع قبلَ التجربة
function predictHTML(q, opts) { return `<div class="pred"><b>🤔 أتوقّعُ أوّلًا:</b> ${q}<div class="cards" data-pred>${opts.map((o, i) => `<button data-p="${i}">${o}</button>`).join('')}</div></div>`; }
function wirePredict(root, cb) { const w = root.querySelector('[data-pred]'); if (!w) return; w.querySelectorAll('button').forEach(b => b.onclick = () => { w.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b)); cb(+b.dataset.p); }); }
function tabs(root, names, fns) { const t = root.querySelector('.vtabs'); t.innerHTML = names.map((n, i) => `<button data-m="${i}" class="${i ? '' : 'on'}">${n}</button>`).join(''); t.querySelectorAll('button').forEach(b => b.onclick = () => { t.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fns[+b.dataset.m](); }); fns[0](); }

/* ════════════ الصف الأول ════════════ */
// ١. أين يعيشُ الحيوان؟ (المواطن)
export function labHabitats(box, api) {
  const H = [
    ['desert', 'الصحراء', 'linear-gradient(160deg,#f3c46a,#d89a3a)', 'حارّةٌ جافّة'],
    ['grass', 'المنطقة العشبية', 'linear-gradient(160deg,#9bd36a,#4f9a3a)', 'أعشابٌ كثيرة'],
    ['forest', 'الغابة', 'linear-gradient(160deg,#3f8a4a,#1f5a2e)', 'أشجارٌ كثيفة'],
    ['lake', 'البحيرة', 'linear-gradient(160deg,#7fd0f0,#3a9ac8)', 'ماءٌ عذب'],
    ['ocean', 'المحيط', 'linear-gradient(160deg,#3a7ae0,#16408a)', 'ماءٌ مالحٌ عميق']];
  const A = [['🐪', 'الجمل', 'desert', 'يتحمّلُ العطشَ وخُفّاهُ لا يغوصانِ في الرمل.'], ['🦎', 'الضبّ', 'desert', 'يختبئُ في جحرِه من حرِّ الصحراء.'], ['🦂', 'العقرب', 'desert', 'يعيشُ تحتَ الصخورِ في الصحراء.'],
    ['🐄', 'البقرة', 'grass', 'تأكلُ الأعشابَ الكثيرة.'], ['🐇', 'الأرنب', 'grass', 'يأكلُ العشبَ ويختبئُ بينَه.'], ['🦓', 'الحمار الوحشي', 'grass', 'يرعى في السهولِ العشبية.'],
    ['🐒', 'القرد', 'forest', 'يتسلّقُ الأشجارَ العالية.'], ['🦉', 'البومة', 'forest', 'تسكنُ في تجاويفِ الأشجار.'], ['🐿️', 'السنجاب', 'forest', 'يجمعُ ثمارَ الأشجار.'],
    ['🦆', 'البطّة', 'lake', 'تسبحُ في الماءِ العذب.'], ['🐸', 'الضفدع', 'lake', 'يضعُ بيضَه في ماءِ البحيرة.'],
    ['🐬', 'الدلفين', 'ocean', 'يعيشُ في البحارِ الواسعة.'], ['🐙', 'الأخطبوط', 'ocean', 'يعيشُ في قاعِ البحر.'], ['🦈', 'القرش', 'ocean', 'يسبحُ في المياهِ المالحة.']];
  const root = shell(box, `<p style="margin:4px 0">المسْ حيوانًا ثم المسِ الموطنَ الذي يعيشُ فيه. أين يجدُ <b>الغذاءَ والماءَ والمأوى</b>؟</p>
    <div class="cards" id="hA"></div><div class="zones" id="hZ"></div><div class="msg" id="hM" style="border-radius:12px;margin-top:8px">اختر حيوانًا 🐾</div>
    <div class="row"><button class="abtn sec" id="hR">🔄 ابدأْ من جديد</button></div><div class="concl" id="hC">🌟 أحسنت! لكلِّ حيوانٍ موطنٌ يجدُ فيه غذاءَه وماءَه ومأواه، وله صفاتٌ تساعدُه على العيشِ فيه.</div>`);
  let sel = null, done = 0, tries = 0;
  const zone = root.querySelector('#hZ'), msg = root.querySelector('#hM');
  function start() {
    sel = null; done = 0; tries = 0; const list = shuf(A).slice(0, 10);
    root.querySelector('#hA').innerHTML = list.map(a => `<button data-a="${A.indexOf(a)}">${a[0]} ${a[1]}</button>`).join('');
    zone.innerHTML = H.map(h => `<div class="zone" data-h="${h[0]}" style="background:${h[2]}">${h[1]}<div style="font-size:13px;opacity:.9">${h[3]}</div><div class="in"></div></div>`).join('');
    root.querySelector('#hC').classList.remove('show'); msg.textContent = 'اختر حيوانًا 🐾';
    root.querySelectorAll('#hA button').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; root.querySelectorAll('#hA button').forEach(x => x.classList.toggle('sel', x === b)); sel = b; msg.textContent = 'أين يعيشُ ' + A[+b.dataset.a][1] + '؟'; });
    zone.querySelectorAll('.zone').forEach(z => z.onclick = () => {
      if (!sel) { msg.textContent = 'اختر حيوانًا أوّلًا 🐾'; return; }
      const a = A[+sel.dataset.a];
      if (a[2] === z.dataset.h) { z.querySelector('.in').textContent += a[0]; sel.classList.remove('sel'); sel.classList.add('ok'); msg.textContent = '✓ ' + a[1] + ': ' + a[3]; sel = null; done++; if (tries === 0) api.award(1); tries = 0;
        if (done === 10) { root.querySelector('#hC').classList.add('show'); api.award(2, 'صنّفتَ الحيواناتِ في مواطنِها'); } }
      else { tries++; sel.classList.add('bad'); setTimeout(() => sel && sel.classList.remove('bad'), 400); msg.textContent = '✗ فكّرْ: هل يجدُ ' + a[1] + ' طعامَه ومأواه في ' + H.find(h => h[0] === z.dataset.h)[1] + '؟'; if (tries >= 2) zone.querySelector(`[data-h="${a[2]}"]`).classList.add('hint'), setTimeout(() => zone.querySelectorAll('.hint').forEach(x => x.classList.remove('hint')), 1200); }
    });
  }
  root.querySelector('#hR').onclick = start; start();
}

// ٢. عدّادُ الماء — كيف أرشّدُ استهلاكي؟
export function labWater(box, api) {
  const ACT = [
    ['🪥', 'تنظيفُ الأسنان', ['الصنبورُ مفتوحٌ طوالَ الوقت', 12], ['أغلقُ الصنبورَ وأستعملُ كوبًا', 1]],
    ['🕌', 'الوضوء', ['الماءُ يجري بقوّة', 7], ['أفتحُ الصنبورَ قليلًا', 2]],
    ['🚿', 'الاستحمام', ['عشرُ دقائق', 90], ['خمسُ دقائق وأغلقُ أثناءَ الصابون', 40]],
    ['🍽️', 'غسلُ الصحون', ['تحتَ ماءٍ جارٍ', 60], ['في حوضٍ ثم الشطف', 20]],
    ['🚗', 'غسلُ السيارة', ['بخرطومِ الماء', 150], ['بدلوٍ وإسفنجة', 20]],
    ['🪴', 'ريُّ النباتات', ['بالخرطومِ وقتَ الظهيرة', 40], ['بالرشّاشِ في المساء', 10]]];
  const root = shell(box, `<p style="margin:4px 0">اخترْ طريقتَك في كلِّ نشاط، وراقبْ <b>خزّانَ الماء</b>: كم لترًا نستهلكُ في يومٍ واحد؟</p>
    <div class="stage"><svg viewBox="0 0 600 230" class="vb"></svg></div>
    <div id="wA"></div><div class="meters"><div>استهلاكي اليوم<b id="wU">٠ لتر</b></div><div>في شهر<b id="wMo">٠ لتر</b></div><div>وفّرتُ<b id="wS">٠٪</b></div></div>
    <div class="concl" id="wC"></div>`);
  const ch = ACT.map(() => -1);
  root.querySelector('#wA').innerHTML = ACT.map((a, i) => `<div class="sl" style="justify-content:space-between"><span style="font-size:22px">${a[0]}</span><span style="flex:1">${a[1]}</span><span class="cards" style="margin:0" data-i="${i}"><button data-c="0">${a[2][0]}</button><button data-c="1">${a[3][0]}</button></span></div>`).join('');
  const max = ACT.reduce((s, a) => s + a[2][1], 0);
  function draw() {
    const used = ch.reduce((s, c, i) => s + (c < 0 ? 0 : ACT[i][c ? 3 : 2][1]), 0), lvl = used / max;
    const all = ch.every(c => c >= 0), saved = all ? Math.round((1 - used / max) * 100) : 0;
    root.querySelector('.vb').innerHTML = `<rect x="0" y="0" width="600" height="230" fill="#eef7ff"/>
      <rect x="60" y="30" width="160" height="170" rx="14" fill="#fff" stroke="#3a7ae0" stroke-width="4"/>
      <rect x="64" y="${196 - 162 * lvl}" width="152" height="${162 * lvl}" rx="10" fill="#4ab0ff" opacity=".85"><animate attributeName="opacity" values=".7;.95;.7" dur="2s" repeatCount="indefinite"/></rect>
      <text x="140" y="22" text-anchor="middle" font-size="16" fill="#1a4a9a">ماءُ يومي</text>
      <text x="140" y="120" text-anchor="middle" font-size="30" fill="#0a2a5a">${AR(used)} لتر</text>
      ${ACT.map((a, i) => { const v = ch[i] < 0 ? 0 : ACT[i][ch[i] ? 3 : 2][1]; return `<text x="${560 - (i % 3) * 110}" y="${80 + Math.floor(i / 3) * 90}" text-anchor="middle" font-size="30">${a[0]}</text><rect x="${520 - (i % 3) * 110}" y="${94 + Math.floor(i / 3) * 90}" width="80" height="10" rx="5" fill="#dde8f4"/><rect x="${520 - (i % 3) * 110}" y="${94 + Math.floor(i / 3) * 90}" width="${80 * v / a[2][1]}" height="10" rx="5" fill="${ch[i] === 1 ? '#2f8f6a' : '#e0603a'}"/><text x="${560 - (i % 3) * 110}" y="${124 + Math.floor(i / 3) * 90}" text-anchor="middle" font-size="13" fill="#3a4a5a">${ch[i] < 0 ? '؟' : AR(v) + ' لتر'}</text>`; }).join('')}`;
    root.querySelector('#wU').textContent = AR(used) + ' لتر'; root.querySelector('#wMo').textContent = AR(used * 30) + ' لتر'; root.querySelector('#wS').textContent = AR(saved) + '٪';
    const c = root.querySelector('#wC');
    if (all) { c.classList.add('show'); c.innerHTML = saved >= 60 ? `🌟 رائع! وفّرتَ ${AR(max - used)} لترًا في يومٍ واحد، أي ${AR((max - used) * 30)} لترٍ في الشهر. <b>الترشيدُ</b> يحفظُ الماءَ لنا ولغيرِنا.` : `💡 يمكنُك أن توفّرَ أكثر! جرّبِ الطرقَ الخضراءَ لتقلّلَ الاستهلاك. كلُّ لترٍ تحفظُه مهمّ.`; if (saved >= 60 && !root._aw) { root._aw = 1; api.award(3, 'رشّدتَ استهلاكَ الماء'); } }
  }
  root.querySelectorAll('[data-i]').forEach(w => w.querySelectorAll('button').forEach(b => b.onclick = () => { ch[+w.dataset.i] = +b.dataset.c; w.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b)); draw(); }));
  draw();
}

/* ════════════ الصف الثاني ════════════ */
// ٣. ماذا تحتاجُ البذرةُ لتنبت؟
export function labGerm(box, api) {
  const CUPS = [['أ', 'ماء ✓ دفء ✓ ضوء ✓', 1, 1, 1], ['ب', 'بلا ماء ✗', 0, 1, 1], ['ج', 'ماء ✓ في الثلّاجة ❄️', 1, 0, 0], ['د', 'ماء ✓ دفء ✓ في الظلام 🌑', 1, 1, 0]];
  const root = shell(box, `<p style="margin:4px 0">زرعنا بذورَ فاصولياءَ في أربعةِ أكواب. ماذا تحتاجُ البذرةُ لكي <b>تنبت</b>؟</p>
    ${predictHTML('أيُّ الأكوابِ ستنبتُ فيها البذور؟', ['أ فقط', 'أ و د', 'أ و ج', 'كلُّها'])}
    <div class="stage"><svg viewBox="0 0 600 260" class="vb"></svg><div class="day" id="gD">اليوم ٠</div></div>
    <div class="ctl"><button id="gN">☀️ مرَّ يوم</button><button class="w" id="gA">⏩ أسبوعٌ كامل</button><button class="s" id="gR">↺ من جديد</button></div>
    <div class="msg" id="gM">توقّعْ ثم اضغطْ «مرَّ يوم».</div><div class="concl" id="gC"></div>`);
  let day = 0, pred = -1; wirePredict(root, p => pred = p);
  const grow = c => c[2] && c[3] ? Math.max(0, day - 2) : 0; // تحتاجُ الماءَ والدفءَ فقط
  function draw() {
    root.querySelector('#gD').textContent = 'اليوم ' + AR(day);
    root.querySelector('.vb').innerHTML = `<rect width="600" height="260" fill="#f4fbff"/><rect x="0" y="200" width="600" height="60" fill="#e9dcc4"/>` + CUPS.map((c, i) => {
      const x = 80 + i * 147, g = grow(c), h = Math.min(110, g * 22), pale = !c[4];
      const dark = !c[4] && c[2] ? `<rect x="${x - 58}" y="20" width="116" height="180" rx="12" fill="#2a2a3a" opacity=".18"/>` : '';
      const cold = !c[3] ? `<text x="${x}" y="40" text-anchor="middle" font-size="26">❄️</text>` : '';
      const seed = `<ellipse cx="${x}" cy="166" rx="13" ry="8" fill="#d8b47a" stroke="#9a7a4a" stroke-width="2"/>`;
      const sprout = g > 0 ? `<path d="M${x} 166 Q${x - 4} ${166 - h / 2} ${x} ${166 - h}" stroke="${pale ? '#d8d070' : '#5aa83a'}" stroke-width="5" fill="none"/><path d="M${x} 166 q-14 10 -22 4 M${x} 166 q12 10 20 6" stroke="#f0e8d0" stroke-width="2" fill="none"/>${h > 40 ? `<ellipse cx="${x - 13}" cy="${166 - h}" rx="14" ry="7" fill="${pale ? '#e0d880' : '#5aa83a'}" transform="rotate(-25 ${x - 13} ${166 - h})"/><ellipse cx="${x + 13}" cy="${166 - h}" rx="14" ry="7" fill="${pale ? '#e0d880' : '#5aa83a'}" transform="rotate(25 ${x + 13} ${166 - h})"/>` : ''}` : '';
      const water = c[2] ? `<rect x="${x - 40}" y="178" width="80" height="18" fill="#9fd8ff" opacity=".8"/>` : '';
      return `${dark}${cold}<path d="M${x - 46} 120 L${x + 46} 120 L${x + 38} 200 L${x - 38} 200 Z" fill="#ffffff" stroke="#9ab" stroke-width="2" opacity=".9"/>${water}<rect x="${x - 40}" y="160" width="80" height="18" fill="#f8f2e4"/>${seed}${sprout}<text x="${x}" y="225" text-anchor="middle" font-size="20" fill="#3a2a10">${c[0]}</text><text x="${x}" y="248" text-anchor="middle" font-size="12" fill="#5a4a36">${c[1]}</text>`;
    }).join('');
  }
  function step(n) {
    if (pred < 0) { root.querySelector('#gM').textContent = '🤔 اخترْ توقّعَك أوّلًا.'; return; }
    for (let i = 0; i < n && day < 7; i++) day++; draw();
    const m = root.querySelector('#gM');
    m.textContent = day < 3 ? 'البذورُ تمتصُّ الماءَ وتنتفخ…' : day < 7 ? 'ظهرَ الجُذَيرُ والساقُ في بعضِ الأكواب! 🌱' : 'مرَّ أسبوع. قارنِ الأكواب.';
    if (day >= 7 && !root._end) { root._end = 1; const ok = pred === 1; const c = root.querySelector('#gC'); c.classList.add('show');
      c.innerHTML = (ok ? '🌟 توقّعُك صحيح! ' : '💡 توقّعُك لم يتحقّق، وهذا جزءٌ من عملِ العلماء. ') + 'نبتتِ البذورُ في الكوبين <b>أ</b> و<b>د</b> فقط؛ لأنّ البذرةَ تحتاجُ إلى <b>الماءِ والدفءِ والهواء</b> لتنبت. أمّا الضوءُ فيحتاجُه النباتُ <b>بعدَ</b> أن يخرجَ من البذرة؛ لذلك نبتةُ الكوبِ «د» صفراءُ شاحبة.'; api.award(ok ? 3 : 1, 'أنهيتَ تجربةَ الإنبات'); }
  }
  root.querySelector('#gN').onclick = () => step(1); root.querySelector('#gA').onclick = () => step(7);
  root.querySelector('#gR').onclick = () => { day = 0; root._end = 0; root.querySelector('#gC').classList.remove('show'); root.querySelector('#gM').textContent = 'اضغطْ «مرَّ يوم».'; draw(); };
  draw();
}

// ٤. أبني سلسلةً غذائيّة، ثم أرى ماذا يحدثُ لو اختفتْ حلقة
export function labChain(box, api) {
  const SETS = [[['☀️', 'الشمس'], ['🌾', 'العشب'], ['🦗', 'الجرادة'], ['🐦', 'العصفور'], ['🦅', 'الصقر']], [['☀️', 'الشمس'], ['🌿', 'النبات'], ['🐇', 'الأرنب'], ['🦊', 'الثعلب']], [['☀️', 'الشمس'], ['🟢', 'الطحالب'], ['🦐', 'الروبيان'], ['🐟', 'السمكة'], ['🦈', 'القرش']]];
  const root = shell(box, `<div class="vtabs"></div><div id="cB"></div>`);
  const B = root.querySelector('#cB');
  function build() {
    const S = pick(SETS); let k = 0, bad = 0;
    B.innerHTML = `<p style="margin:4px 0">رتّبِ السلسلةَ من <b>مصدرِ الطاقة</b> إلى آخرِ مستهلك: المسِ البطاقاتِ بالترتيب.</p><div class="cards" id="cC">${shuf(S).map(s => `<button data-i="${S.indexOf(s)}">${s[0]} ${s[1]}</button>`).join('')}</div>
      <div class="stage" style="background:#f7fbff;min-height:70px;padding:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:20px;font-weight:800" id="cL"></div><div class="msg" id="cM">ابدأْ بمصدرِ الطاقة.</div><div class="row"><button class="abtn sec" id="cN">🔄 سلسلةٌ أخرى</button></div>`;
    B.querySelectorAll('#cC button').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; if (+b.dataset.i === k) { b.classList.add('ok'); B.querySelector('#cL').innerHTML += (k ? ' <span style="color:#e0603a">←</span> ' : '') + `<span>${S[k][0]} ${S[k][1]}</span>`; k++;
      B.querySelector('#cM').textContent = k === 1 ? 'صحيح! الشمسُ مصدرُ الطاقة. ثم من يصنعُ غذاءَه منها؟' : k === 2 ? 'صحيح! النباتُ «منتِج». من يأكلُه؟' : k < S.length ? 'أحسنت! من يأكلُ ' + S[k - 1][1] + '؟' : '🌟 أكملتَ السلسلة! السهمُ يعني: «تنتقلُ الطاقةُ إلى».';
      if (k === S.length) api.award(bad ? 1 : 2, 'رتّبتَ السلسلةَ الغذائيّة'); } else { bad++; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); } });
    B.querySelector('#cN').onclick = build;
  }
  function remove() {
    const N = ['🌾 العشب', '🦗 الجراد', '🐦 العصافير', '🦅 الصقور']; let pop = [100, 60, 30, 8], gone = -1, yr = 0;
    B.innerHTML = `<p style="margin:4px 0">في هذا الوادي سلسلة: 🌾 ← 🦗 ← 🐦 ← 🦅. اخترْ مخلوقًا <b>يختفي</b>، ثم راقبِ الأعدادَ سنةً بعدَ سنة.</p>
      ${predictHTML('لو اختفى الجرادُ، ماذا يحدثُ للعصافير؟', ['تزداد', 'تقلّ', 'لا تتغيّر'])}
      <div class="cards" id="rG">${N.slice(0, 3).map((n, i) => `<button data-g="${i}">❌ ${n}</button>`).join('')}</div>
      <div class="stage"><svg viewBox="0 0 600 240" class="vb"></svg><div class="day" id="rY">السنة ٠</div></div>
      <div class="ctl"><button id="rN">⏭ سنةٌ أخرى</button><button class="s" id="rR">↺ من جديد</button></div><div class="msg" id="rM">اخترْ مخلوقًا يختفي.</div><div class="concl" id="rC"></div>`;
    let pred = -1; wirePredict(B, p => pred = p);
    const draw = () => { B.querySelector('#rY').textContent = 'السنة ' + AR(yr); B.querySelector('.vb').innerHTML = `<rect width="600" height="240" fill="#f7fbff"/>` + N.map((n, i) => { const h = Math.min(170, pop[i] * 1.6), x = 90 + i * 140; return `<rect x="${x - 35}" y="${200 - h}" width="70" height="${h}" rx="8" fill="${['#7cc35a', '#d8b43a', '#8a6ad8', '#c0603a'][i]}" opacity="${gone === i ? .25 : 1}"/><text x="${x}" y="${192 - h}" text-anchor="middle" font-size="16" fill="#223">${AR(Math.round(pop[i]))}</text><text x="${x}" y="225" text-anchor="middle" font-size="15" fill="#223">${n}</text>`; }).join(''); };
    B.querySelectorAll('#rG button').forEach(b => b.onclick = () => { if (gone >= 0) return; gone = +b.dataset.g; pop[gone] = 0; b.classList.add('sel'); B.querySelector('#rM').textContent = 'اختفى ' + N[gone] + '. اضغطْ «سنةٌ أخرى».'; draw(); });
    B.querySelector('#rN').onclick = () => { if (gone < 0) { B.querySelector('#rM').textContent = 'اخترْ مخلوقًا يختفي أوّلًا.'; return; } if (yr >= 4) return; yr++;
      const [g, j, s, h] = pop; pop = [Math.min(160, g + (j < 30 ? 18 : -4)), gone === 1 ? 0 : Math.max(0, j + (g > 60 ? 6 : -12) - (s > 20 ? 8 : 0)), gone === 2 ? 0 : Math.max(0, s + (j > 30 ? 3 : -6)), Math.max(0, h + (s > 15 ? 0 : -2))];
      if (gone === 0) pop[0] = 0; draw();
      if (yr === 4) { const c = B.querySelector('#rC'); c.classList.add('show'); c.innerHTML = 'كلُّ حلقةٍ في السلسلةِ مهمّة؛ عندما يختفي مخلوقٌ <b>يتأثّرُ من يأكلُه</b> (يقلُّ عددُه)، و<b>يزدادُ ما كان يأكلُه</b>.' + (gone === 1 ? (pred === 1 ? ' 🌟 توقّعُك صحيح: قلّتِ العصافيرُ لأنّ غذاءَها اختفى، وازدادَ العشب.' : ' 💡 لاحظ: قلّتِ العصافيرُ لأنّ غذاءَها (الجراد) اختفى، وازدادَ العشب.') : ''); api.award(2, 'درستَ أثرَ اختفاءِ حلقة'); } };
    B.querySelector('#rR').onclick = remove; draw();
  }
  tabs(root, ['🔗 أبني السلسلة', '❌ ماذا لو اختفتْ حلقة؟'], [build, remove]);
}

// ٥. مِمَّ تتكوّنُ التربة؟ — جرّةُ الترسيب
export function labSoilJar(box, api) {
  const SAMPLES = { garden: ['تربةُ الحديقة', [.15, .30, .30, .25]], beach: ['رملُ الشاطئ', [.10, .80, .08, .02]], valley: ['طينُ الوادي', [.05, .20, .65, .10]] };
  const L = [['حصى', '#8a7a6a'], ['رمل', '#e0c080'], ['طين وغرين', '#a07850'], ['دبال (بقايا نباتات)', '#3a2a1a']];
  const root = shell(box, `<p style="margin:4px 0">نضعُ عيّنةَ تربةٍ في جرّةِ ماء، ونرجُّها، ثم ننتظرُ حتى تترسّب. ماذا نرى؟</p>
    <div class="row">العيّنة: <select id="sS">${Object.entries(SAMPLES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select><button class="abtn" id="sG" style="margin:0">🫙 رُجَّ الجرّة</button></div>
    <div class="stage"><svg viewBox="0 0 600 300" class="vb"></svg></div><div class="msg" id="sM">اخترْ عيّنةً ثم رُجَّ الجرّة.</div>
    <table><tr><th>العيّنة</th>${L.map(l => `<th>${l[0]}</th>`).join('')}</tr><tbody id="sT"></tbody></table><div class="concl" id="sC"></div>`);
  const vb = root.querySelector('.vb'); let parts = [], t = 0, running = false; const seen = new Set();
  function jar(inner) { return `<rect width="600" height="300" fill="#f4fbff"/><rect x="200" y="30" width="200" height="250" rx="22" fill="#dff1ff" stroke="#7a9ab0" stroke-width="4"/><rect x="214" y="18" width="172" height="22" rx="6" fill="#c0a070"/>${inner}<path d="M212 60 L212 268" stroke="#fff" stroke-width="6" opacity=".6"/>`; }
  function shake() {
    const s = SAMPLES[root.querySelector('#sS').value]; parts = []; t = 0; running = true;
    const H = s[1].map(f => f * 150), b0 = 268, b1 = b0 - H[0], b2 = b1 - H[1], b3 = b2 - H[2], band = [[b1, b0], [b2, b1], [b3, b2], [52, 66]];
    s[1].forEach((f, li) => { for (let i = 0; i < Math.round(f * 160); i++) parts.push({ li, x: rnd(212, 388), y: rnd(50, 270), ty: rnd(band[li][0] + 2, band[li][1] - 2), r: [6, 3, 1.8, 3.5][li] }); });
    root.querySelector('#sM').textContent = 'الماءُ عكِر… انتظرْ لترى الطبقات ⏳';
  }
  loop(box, dt => {
    if (!running) return; t += dt; const s = SAMPLES[root.querySelector('#sS').value][1];
    // سرعاتُ الترسيب: الحصى أسرع، الدبال يطفو
    const H = s.map(f => f * 150);
    parts.forEach(p => { const sp = [220, 100, 32, 34][p.li] * dt; if (Math.abs(p.ty - p.y) <= sp) p.y = p.ty; else p.y += Math.sign(p.ty - p.y) * sp; if (p.y !== p.ty) p.x += Math.sin(t * 3 + p.y) * dt * 8; });
    const clear = Math.min(1, t / 6);
    vb.innerHTML = jar(`<rect x="204" y="48" width="192" height="226" rx="16" fill="rgba(140,100,60,${.55 * (1 - clear)})"/>` + parts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r}" fill="${L[p.li][1]}"/>`).join('') +
      (t > 6 ? s.map((f, i) => { const y = i === 3 ? 60 : i === 0 ? 268 - H[0] / 2 : i === 1 ? 268 - H[0] - H[1] / 2 : 268 - H[0] - H[1] - H[2] / 2; return `<line x1="160" y1="${y}" x2="204" y2="${y}" stroke="#3a2a1a" stroke-width="1.5"/><text x="155" y="${y + 5}" text-anchor="end" direction="ltr" font-size="15" fill="#3a2a1a">${L[i][0]}</text>`; }).join('') : ''));
    if (t > 6 && running) { running = false; const k = root.querySelector('#sS').value; root.querySelector('#sM').textContent = 'ترسّبتِ الحبيباتُ الكبيرةُ (الثقيلةُ) أوّلًا في الأسفل، وطفا الدبالُ في الأعلى.';
      if (!seen.has(k)) { seen.add(k); root.querySelector('#sT').innerHTML += `<tr><td>${SAMPLES[k][0]}</td>${s.map(f => `<td>${AR(Math.round(f * 100))}٪</td>`).join('')}</tr>`; api.award(1); }
      if (seen.size === 3) { const c = root.querySelector('#sC'); c.classList.add('show'); c.innerHTML = '🌟 التربةُ <b>خليطٌ</b> من فتاتِ الصخورِ (حصى ورملٌ وطين) و<b>الدبالِ</b> والماءِ والهواء. تربةُ الحديقةِ فيها أكثرُ دبالٍ فهي الأنسبُ لنموِّ النبات، والرملُ حبيباتُه كبيرةٌ لا تحفظُ الماء.'; if (!root._a) { root._a = 1; api.award(2, 'قارنتَ أنواعَ التربة'); } } }
  });
  vb.innerHTML = jar('<rect x="204" y="200" width="192" height="74" rx="14" fill="#a07850"/>');
  root.querySelector('#sG').onclick = shake;
}

/* ════════════ الصف الثالث ════════════ */
// ٦. دوراتُ الحياة والتحوّل
export function labMeta(box, api) {
  const pupa = '<svg viewBox="0 0 40 40" style="width:1em;height:1em;vertical-align:-.15em"><ellipse cx="20" cy="22" rx="9" ry="15" fill="#9a8a4a"/><path d="M20 4 L20 9" stroke="#6a5a2a" stroke-width="2"/><path d="M13 18 h14 M13 24 h14 M14 30 h12" stroke="#7a6a3a" stroke-width="1.5"/></svg>';
  const tad = legs => `<svg viewBox="0 0 60 40" style="width:1.3em;height:1em;vertical-align:-.15em"><ellipse cx="18" cy="20" rx="12" ry="10" fill="#4a5a3a"/><path d="M28 20 Q42 10 56 20 Q42 28 28 20" fill="#6a7a5a"/>${legs ? '<path d="M20 28 l-6 8 M24 28 l4 9" stroke="#4a5a3a" stroke-width="3"/>' : ''}<circle cx="12" cy="17" r="2" fill="#fff"/></svg>`;
  const ANI = {
    butterfly: ['الفراشة', 30, [[0, '🥚', 'البيضة', 'تضعُها الأنثى على ورقة نبات'], [4, '🐛', 'اليرقة', 'تأكلُ كثيرًا وتكبرُ وتنسلخ'], [16, pupa, 'العذراء', 'لا تأكلُ ولا تتحرّك، ويحدثُ داخلَها التحوّل'], [26, '🦋', 'الحشرة البالغة', 'تطيرُ وتتكاثر']], 'تحوّلٌ كامل: أربعُ مراحلَ مختلفةِ الشكل'],
    frog: ['الضفدع', 84, [[0, '🫧', 'البيض', 'كتلةٌ هلاميّةٌ في الماء'], [10, tad(0), 'أبو ذنيبة', 'يعيشُ في الماءِ ويتنفّسُ بالخياشيم'], [42, tad(1), 'أبو ذنيبة بأرجل', 'تنمو الأرجلُ ويقصرُ الذيل'], [70, '🐸', 'الضفدع البالغ', 'يتنفّسُ بالرئتين ويعيشُ على اليابسةِ والماء']], 'تحوّلٌ: يتغيّرُ شكلُه كثيرًا من الماءِ إلى اليابسة'],
    chicken: ['الدجاجة', 180, [[0, '🥚', 'البيضة', 'تحتضنُها الدجاجةُ ٢١ يومًا'], [21, '🐣', 'الفقس', 'يخرجُ الكتكوتُ من البيضة'], [30, '🐥', 'الصوص', 'يشبهُ أمَّه لكنّه صغير'], [150, '🐔', 'الدجاجة البالغة', 'تبيضُ فتبدأُ دورةٌ جديدة']], 'لا تحوّل: الصغيرُ يشبهُ أمَّه ويكبرُ فقط'],
    camel: ['الجمل', 2200, [[0, '🤰', 'الحمل', 'ينمو الجنينُ داخلَ الأمِّ نحوَ ١٣ شهرًا'], [390, '🐪', 'الحُوار', 'يولدُ ويرضعُ من أمّه'], [760, '🐫', 'الصغير', 'يأكلُ النباتاتِ ويكبر'], [1800, '🐪', 'الجمل البالغ', 'يتكاثرُ فتبدأُ دورةٌ جديدة']], 'لا تحوّل: يولدُ يشبهُ أبويه']
  };
  const root = shell(box, `<div class="row">المخلوق: <select id="mA">${Object.entries(ANI).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></div>
    <div class="stage" style="background:linear-gradient(180deg,#eaf7ff,#f7fbff);text-align:center;padding:12px"><div id="mI" style="font-size:86px;line-height:1.1;min-height:100px"></div><div id="mN" style="font-size:22px;font-weight:800;color:#1a4a9a"></div><div id="mT" style="font-weight:700;color:#3a4a5a"></div></div>
    <div class="sl">⏱ العمر <input type="range" id="mS" min="0" max="100" value="0"><b id="mV"></b></div>
    <div class="cards" id="mSt"></div><div class="msg" id="mM"></div>
    <div class="pred"><b>🧠 سؤال:</b> أيُّ هذه المخلوقاتِ يمرُّ بـ<b>تحوّلٍ كامل</b> (بيضة ← يرقة ← عذراء ← بالغ)؟<div class="cards" id="mQ">${Object.entries(ANI).map(([k, v]) => `<button data-k="${k}">${v[0]}</button>`).join('')}</div><div id="mQf"></div></div>`);
  const seen = new Set();
  function show() {
    const a = ANI[root.querySelector('#mA').value], d = Math.round(root.querySelector('#mS').value / 100 * a[1]);
    let st = a[2][0]; a[2].forEach(s => { if (d >= s[0]) st = s; });
    root.querySelector('#mI').innerHTML = st[1]; root.querySelector('#mN').textContent = st[2]; root.querySelector('#mT').textContent = st[3];
    root.querySelector('#mV').textContent = AR(d) + ' يومًا';
    root.querySelector('#mSt').innerHTML = a[2].map(s => `<button class="${s === st ? 'sel' : ''}" style="font-size:15px">${s[1]} ${s[2]}</button>`).join('<span style="align-self:center">←</span>');
    root.querySelector('#mM').textContent = a[4];
    const key = root.querySelector('#mA').value + st[2]; if (!seen.has(key)) { seen.add(key); if (seen.size % 4 === 0) api.award(1); }
  }
  root.querySelector('#mA').onchange = () => { root.querySelector('#mS').value = 0; show(); };
  root.querySelector('#mS').oninput = show;
  root.querySelectorAll('#mQ button').forEach(b => b.onclick = () => { const ok = b.dataset.k === 'butterfly'; b.classList.add(ok ? 'ok' : 'bad'); root.querySelector('#mQf').innerHTML = ok ? '✓ صحيح! الفراشةُ تمرُّ بأربعِ مراحلَ مختلفةٍ تمامًا. أمّا الضفدعُ فيتحوّلُ أيضًا لكن بلا مرحلةِ عذراء.' : '✗ حرّكِ المؤشّرَ وابحثْ عن المخلوقِ الذي له مرحلةُ «عذراء».'; if (ok && !root._q) { root._q = 1; api.award(2, 'ميّزتَ التحوّلَ الكامل'); } });
  show();
}

// ٧. التمويه: أنا الطائرُ المفترس!
export function labCamo(box, api) {
  const BG = { sand: ['رمال الصحراء', ['#e8c88a', '#d8b070', '#f0d8a0', '#c8a060']], grass: ['غابة خضراء', ['#4f9a3a', '#3a7a2a', '#6ab04a', '#2f6a22']], snow: ['ثلج', ['#f4f8ff', '#e2ecf8', '#ffffff', '#d4e0f0']] };
  const BUG = [['رملي', '#d8b070'], ['أخضر', '#3f8a32'], ['أبيض', '#eef4fc']];
  const root = shell(box, `<p style="margin:4px 0">أنت <b>طائرٌ جائع</b> 🐦! لديك <b>١٠ ثوانٍ</b> لتصطادَ أكبرَ عددٍ من الحشرات بلمسِها. أيُّ الألوانِ ستنجو؟</p>
    <div class="row">البيئة: <select id="kB">${Object.entries(BG).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select><button class="abtn" id="kGo" style="margin:0">▶ ابدأ الصيد</button></div>
    <div class="stage" style="touch-action:manipulation"><svg viewBox="0 0 600 340" class="vb"></svg><div class="day" id="kT">١٠ ث</div></div>
    <table><tr><th>البيئة</th>${BUG.map(b => `<th>صيدَ من ${b[0]}</th>`).join('')}<th>الأكثرُ نجاةً</th></tr><tbody id="kR"></tbody></table><div class="concl" id="kC"></div>`);
  const vb = root.querySelector('.vb'); let bugs = [], t = 0, run = false, caught = [0, 0, 0]; const envs = new Set();
  function bg(k) { const c = BG[k][1]; let s = `<rect width="600" height="340" fill="${c[0]}"/>`; for (let i = 0; i < 320; i++) s += `<ellipse cx="${(i * 97) % 600}" cy="${(i * 53) % 340}" rx="${6 + i % 9}" ry="${4 + i % 6}" fill="${c[i % 4]}" opacity=".9"/>`; return s; }
  function setup() { const k = root.querySelector('#kB').value; bugs = []; for (let i = 0; i < 36; i++) bugs.push({ c: i % 3, x: rnd(20, 580), y: rnd(20, 320), a: rnd(0, 6.28), alive: true }); vb.innerHTML = `<g id="bg">${bg(k)}</g><g id="bz"></g>`; draw(); }
  function draw() { vb.querySelector('#bz').innerHTML = bugs.map((b, i) => b.alive ? `<g data-b="${i}" transform="translate(${b.x.toFixed(0)} ${b.y.toFixed(0)}) rotate(${(b.a * 57).toFixed(0)})" style="cursor:pointer"><circle r="16" fill="transparent"/><ellipse rx="9" ry="6" fill="${BUG[b.c][1]}" stroke="${BUG[b.c][1]}" stroke-width="1"/><path d="M-4 -6 l-3 -4 M4 -6 l3 -4" stroke="${BUG[b.c][1]}" stroke-width="1.5"/></g>` : '').join(''); }
  vb.addEventListener('pointerdown', e => { if (!run) return; const g = e.target.closest('[data-b]'); if (!g) return; const b = bugs[+g.dataset.b]; if (!b.alive) return; b.alive = false; caught[b.c]++; draw(); });
  root.querySelector('#kGo').onclick = () => { setup(); caught = [0, 0, 0]; t = 10; run = true; root.querySelector('#kGo').disabled = true; };
  loop(box, dt => { if (!run) return; t -= dt; bugs.forEach(b => { if (b.alive) { b.a += rnd(-.3, .3); b.x = Math.max(12, Math.min(588, b.x + Math.cos(b.a) * 14 * dt)); b.y = Math.max(12, Math.min(328, b.y + Math.sin(b.a) * 14 * dt)); } }); if (Math.random() < .2) draw();
    root.querySelector('#kT').textContent = AR(Math.max(0, Math.ceil(t))) + ' ث';
    if (t <= 0) { run = false; root.querySelector('#kGo').disabled = false; draw(); const k = root.querySelector('#kB').value, left = [0, 1, 2].map(c => 12 - caught[c]), best = left.indexOf(Math.max(...left));
      root.querySelector('#kR').innerHTML += `<tr><td>${BG[k][0]}</td>${caught.map(c => `<td>${AR(c)}</td>`).join('')}<td>${BUG[best][0]}</td></tr>`; envs.add(k); api.award(1);
      if (envs.size >= 2 && !root._c) { root._c = 1; const c = root.querySelector('#kC'); c.classList.add('show'); c.innerHTML = '🌟 لاحظتَ أنّ الحشراتِ التي يشبهُ لونُها البيئةَ <b>نجتْ أكثر</b> لأنّك لم ترَها بسهولة. هذا هو <b>التخفّي (التمويه)</b>: تكيّفٌ يساعدُ المخلوقَ على البقاء. ولو تكاثرتِ الناجيةُ لكثرَ لونُها في الجيلِ التالي.'; api.award(2, 'اكتشفتَ أثرَ التمويه'); } } });
  root.querySelector('#kB').onchange = setup; setup();
}

// ٨. التعرية بالماء: ما الذي يحمي التربة؟
export function labErosion(box, api) {
  const RAIN = [['خفيف', 1], ['متوسّط', 2], ['غزير', 3.4]];
  const root = shell(box, `<p style="margin:4px 0">نصبُّ «مطرًا» على تلٍّ من التربة ونقيسُ كمّيّةَ التربةِ التي <b>تجرفُها</b> المياهُ إلى الحوض.</p>
    <div class="sl">🌧️ المطر <input type="range" id="eR" min="0" max="2" step="1" value="1"><b id="eRv"></b></div>
    <div class="sl">⛰️ ميلُ التلّ <input type="range" id="eS" min="10" max="45" step="5" value="25"><b id="eSv"></b></div>
    <div class="sw"><label id="ePl"><input type="checkbox" id="eP"> 🌿 نباتاتٌ تغطّي التربة</label></div>
    <div class="ctl"><button id="eGo">🌧️ أمطِرْ ١٠ ثوانٍ</button></div>
    <div class="stage"><svg viewBox="0 0 600 280" class="vb"></svg></div>
    <table><tr><th>#</th><th>المطر</th><th>الميل</th><th>النباتات</th><th>التربةُ المجروفة</th></tr><tbody id="eT"></tbody></table><div class="concl" id="eC"></div>`);
  const vb = root.querySelector('.vb'); let run = false, t = 0, washed = 0, drops = [], grains = [], n = 0; const tried = new Set();
  const lab = () => { root.querySelector('#eRv').textContent = RAIN[+root.querySelector('#eR').value][0]; root.querySelector('#eSv').textContent = AR(root.querySelector('#eS').value) + '°'; root.querySelector('#ePl').classList.toggle('on', root.querySelector('#eP').checked); };
  function scene() {
    const s = +root.querySelector('#eS').value, plant = root.querySelector('#eP').checked, top = 230 - Math.tan(s * Math.PI / 180) * 300 * .55;
    const loss = Math.min(40, washed / 8);
    return `<rect width="600" height="280" fill="#eef7ff"/><path d="M60 230 L60 ${top + loss * .8} L ${360 - loss} 230 Z" fill="#a07850"/><path d="M60 ${top + loss * .8} L ${360 - loss} 230" stroke="#7a5a3a" stroke-width="4"/>
      ${plant ? Array.from({ length: 12 }, (_, i) => { const x = 70 + i * 24, y = top + loss * .8 + (x - 60) * (230 - top - loss * .8) / (300 - loss); return `<path d="M${x} ${y} q-6 -16 -2 -24 M${x} ${y} q6 -14 4 -22 M${x} ${y} q0 -18 0 -26" stroke="#3f8a32" stroke-width="3" fill="none"/>`; }).join('') : ''}
      <rect x="380" y="200" width="180" height="50" rx="6" fill="#dff1ff" stroke="#7a9ab0" stroke-width="3"/><rect x="383" y="${247 - Math.min(44, washed / 6)}" width="174" height="${Math.min(44, washed / 6)}" fill="#8a6a4a"/><text x="470" y="270" text-anchor="middle" font-size="14" fill="#3a4a5a">الحوض</text>
      ${drops.map(d => `<line x1="${d.x}" y1="${d.y}" x2="${d.x - 3}" y2="${d.y + 10}" stroke="#4ab0ff" stroke-width="2.5"/>`).join('')}${grains.map(g => `<circle cx="${g.x.toFixed(0)}" cy="${g.y.toFixed(0)}" r="3" fill="#7a5a3a"/>`).join('')}`;
  }
  function go() { if (run) return; run = true; t = 0; washed = 0; drops = []; grains = []; root.querySelector('#eGo').disabled = true; }
  loop(box, dt => { if (!run) { if (!vb.innerHTML) vb.innerHTML = scene(); return; } t += dt;
    const r = RAIN[+root.querySelector('#eR').value][1], s = +root.querySelector('#eS').value, plant = root.querySelector('#eP').checked;
    for (let i = 0; i < r * 3; i++) drops.push({ x: rnd(60, 360), y: rnd(-20, 0) }); drops.forEach(d => d.y += 420 * dt); drops = drops.filter(d => d.y < 200);
    const rate = r * r * (s / 25) * (plant ? .15 : 1) * 14; washed += rate * dt;
    if (Math.random() < rate * dt * 2) grains.push({ x: rnd(120, 340), y: rnd(120, 200), v: 0 }); grains.forEach(g => { g.x += 90 * dt; g.y += 40 * dt; }); grains = grains.filter(g => g.x < 470 && g.y < 245);
    vb.innerHTML = scene();
    if (t >= 10) { run = false; drops = []; grains = []; vb.innerHTML = scene(); root.querySelector('#eGo').disabled = false; n++; const key = [root.querySelector('#eR').value, s, plant].join();
      root.querySelector('#eT').innerHTML += `<tr><td>${AR(n)}</td><td>${RAIN[+root.querySelector('#eR').value][0]}</td><td>${AR(s)}°</td><td>${plant ? '🌿 نعم' : 'لا'}</td><td><b>${AR(Math.round(washed))}</b> غرامًا</td></tr>`;
      if (!tried.has(key)) { tried.add(key); api.award(1); }
      const plants = [...tried].some(k => k.endsWith('true')), bare = [...tried].some(k => k.endsWith('false'));
      if (plants && bare && tried.size >= 3 && !root._c) { root._c = 1; const c = root.querySelector('#eC'); c.classList.add('show'); c.innerHTML = '🌟 كلّما <b>زادَ المطرُ</b> و<b>زادَ ميلُ التلّ</b> زادتِ <b>التعرية</b>. أمّا <b>النباتاتُ</b> فتمسكُ التربةَ بجذورِها وتقلّلُ التعريةَ كثيرًا؛ لذلك يزرعُ المزارعونَ المدرّجاتِ في جبالِ الجنوب.'; api.award(2, 'استنتجتَ ما يقلّلُ التعرية'); } } });
  ['#eR', '#eS', '#eP'].forEach(s => root.querySelector(s).oninput = () => { lab(); if (!run) vb.innerHTML = scene(); });
  root.querySelector('#eGo').onclick = go; lab(); vb.innerHTML = scene();
}

/* ════════════ الصف الرابع ════════════ */
// ٩. المجهرُ الافتراضيّ
export function labScope(box, api) {
  const SL = {
    onion: ['قشرة البصل', 'نباتيّة', { wall: 1, nuc: 1, chl: 0, vac: 1 }],
    cheek: ['خلايا باطن الخدّ', 'حيوانيّة', { wall: 0, nuc: 1, chl: 0, vac: 0 }],
    leaf: ['ورقة نبات الإيلوديا', 'نباتيّة', { wall: 1, nuc: 1, chl: 1, vac: 1 }]};
  const root = shell(box, `<p style="margin:4px 0">ضعِ الشريحة، واخترِ قوّةَ التكبير، ثم اضبطِ <b>الوضوح</b> حتى ترى الخلايا. ما الأجزاءُ التي تراها؟</p>
    <div class="row">الشريحة: <select id="oS">${Object.entries(SL).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select>
      <span class="cards" id="oM" style="margin:0">${[4, 10, 40].map((m, i) => `<button data-m="${m}" class="${i === 1 ? 'sel' : ''}">${AR(m)}×</button>`).join('')}</span></div>
    <div class="sl">🔧 ضابطُ الوضوح <input type="range" id="oF" min="0" max="100" value="20"><b id="oFv"></b></div>
    <div class="stage" style="background:#111;display:flex;justify-content:center;padding:10px"><svg viewBox="0 0 300 300" class="vb" style="max-width:340px;border-radius:50%;background:#f8f4e8;box-shadow:0 0 0 10px #333"></svg></div>
    <div class="sw" id="oLbl"><label><input type="checkbox" id="oL"> 🏷 أظهرِ الأسماء</label></div>
    <div class="pred"><b>📋 سجّلْ ملاحظتَك:</b> ما الأجزاءُ الموجودةُ في هذه الخلية؟<div class="cards" id="oQ">${[['wall', 'جدار خلوي'], ['nuc', 'نواة'], ['chl', 'بلاستيدات خضراء'], ['vac', 'فجوة كبيرة']].map(([k, n]) => `<button data-k="${k}">${n}</button>`).join('')}</div><button class="abtn sec" id="oChk">✓ تحقّقْ</button><div id="oFb"></div></div>
    <table><tr><th>الشريحة</th><th>نوع الخلية</th><th>جدار</th><th>بلاستيدات</th></tr><tbody id="oT"></tbody></table><div class="concl" id="oC"></div>`);
  let mag = 10, sel = new Set(); const done = new Set();
  function draw() {
    const k = root.querySelector('#oS').value, P = SL[k][2], f = +root.querySelector('#oF').value, best = { 4: 30, 10: 55, 40: 80 }[mag], blur = Math.abs(f - best) / 9, sc = { 4: .5, 10: 1, 40: 2.3 }[mag], lbl = root.querySelector('#oL').checked;
    root.querySelector('#oFv').textContent = blur < 1 ? 'واضح ✓' : blur < 3 ? 'شبه واضح' : 'ضبابي';
    let g = '';
    let ref = null;
    const cell = (cx, cy, i) => { if (!ref || Math.hypot(cx - 150, cy - 150) < Math.hypot(ref[0] - 150, ref[1] - 150)) ref = [cx, cy, ((i * 37) % 10) / 10]; const w = 70 * sc, h = (k === 'cheek' ? 60 : 36) * sc; const j = ((i * 37) % 10) / 10;
      if (k === 'cheek') return `<path d="M${cx - w / 2} ${cy} q${w * .2} ${-h * .7} ${w / 2} ${-h / 2} q${w * .4} ${h * .1} ${w / 2} ${h / 2} q${-w * .1} ${h * .6} ${-w / 2} ${h / 2} q${-w * .4} ${-h * .1} ${-w / 2} ${-h / 2}z" fill="#f4d8e0" stroke="#c08898" stroke-width="${1.2 * sc}"/><circle cx="${cx + j * 6}" cy="${cy}" r="${5 * sc}" fill="#7a4a8a"/>`;
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${k === 'leaf' ? '#d8f0c0' : '#f6efd8'}" stroke="#8a7a4a" stroke-width="${(P.wall ? 3 : 1) * sc}"/>${P.vac ? `<rect x="${cx - w / 2 + 4 * sc}" y="${cy - h / 2 + 4 * sc}" width="${w - 8 * sc}" height="${h - 8 * sc}" rx="${6 * sc}" fill="#eef6ff" opacity=".7"/>` : ''}<circle cx="${cx - w / 4 + j * 10}" cy="${cy + (j - .5) * h * .3}" r="${5 * sc}" fill="#8a5a3a"/>${P.chl ? Array.from({ length: 7 }, (_, q) => `<ellipse cx="${cx - w / 2 + 8 * sc + (q * w / 7.5)}" cy="${cy + (q % 2 ? -1 : 1) * h * .32}" rx="${4 * sc}" ry="${2.6 * sc}" fill="#2f8f32"/>`).join('') : ''}`; };
    const w = 70 * sc, h = (k === 'cheek' ? 70 : 36) * sc; let i = 0;
    for (let y = 150 - 6 * h; y < 300 + h; y += h) for (let x = 150 - 6 * w + ((y / h) % 2 ? w / 2 : 0); x < 300 + w; x += k === 'cheek' ? w * 1.25 : w) g += cell(x, y, i++);
    let labels = '';
    if (lbl && mag === 40 && ref) { const [cx, cy, j] = ref, cw = 70 * sc, ch = (k === 'cheek' ? 60 : 36) * sc, nx = k === 'cheek' ? cx + j * 6 : cx - cw / 4 + j * 10, ny = k === 'cheek' ? cy : cy + (j - .5) * ch * .3;
      const tag = (x, y, tx, ty, t) => `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#d0302a" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3" fill="#d0302a"/><rect x="${tx - 46}" y="${ty - 12}" width="92" height="22" rx="6" fill="#fff" opacity=".9"/><text x="${tx}" y="${ty + 4}" text-anchor="middle" font-size="13" fill="#a01a10">${t}</text>`;
      labels = tag(nx, ny, 150, 40, 'نواة') + tag(cx + cw / 6, cy - ch / 2, 70, 250, P.wall ? 'جدار خلوي' : 'غشاء خلوي') + (P.chl ? tag(cx - cw / 2 + 8 * sc + 2 * cw / 7.5, cy + ch * .32, 230, 250, 'بلاستيدات') : tag(cx + cw / 5, cy + ch / 5, 230, 250, P.vac ? 'فجوة' : 'سيتوبلازم')); }
    root.querySelector('.vb').innerHTML = `<defs><filter id="ob"><feGaussianBlur stdDeviation="${blur.toFixed(1)}"/></filter><clipPath id="oc"><circle cx="150" cy="150" r="150"/></clipPath></defs><g clip-path="url(#oc)"><g filter="url(#ob)">${g}</g>${blur < 1.5 ? labels : ''}</g>`;
    root.querySelector('#oLbl').style.opacity = mag === 40 ? 1 : .5;
  }
  root.querySelectorAll('#oM button').forEach(b => b.onclick = () => { mag = +b.dataset.m; root.querySelectorAll('#oM button').forEach(x => x.classList.toggle('sel', x === b)); draw(); });
  ['#oS', '#oF', '#oL'].forEach(s => root.querySelector(s).oninput = () => { if (s === '#oS') { sel.clear(); root.querySelectorAll('#oQ button').forEach(x => x.classList.remove('sel', 'ok')); root.querySelector('#oFb').textContent = ''; } draw(); });
  root.querySelectorAll('#oQ button').forEach(b => b.onclick = () => { const k = b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); b.classList.toggle('sel'); });
  root.querySelector('#oChk').onclick = () => { const k = root.querySelector('#oS').value, P = SL[k][2]; const ok = ['wall', 'nuc', 'chl', 'vac'].every(x => !!P[x] === sel.has(x)); const fb = root.querySelector('#oFb');
    if (!ok) { fb.innerHTML = '✗ ليس تمامًا. كبّرْ إلى ٤٠× واضبطِ الوضوحَ وأظهرِ الأسماء، ثم أعدِ المحاولة.'; return; }
    fb.innerHTML = '✓ ملاحظةٌ دقيقة! هذه خليّةٌ <b>' + SL[k][1] + '</b>.'; if (!done.has(k)) { done.add(k); api.award(1); root.querySelector('#oT').innerHTML += `<tr><td>${SL[k][0]}</td><td>${SL[k][1]}</td><td>${P.wall ? '✓' : '✗'}</td><td>${P.chl ? '✓' : '✗'}</td></tr>`; }
    if (done.size === 3 && !root._c) { root._c = 1; const c = root.querySelector('#oC'); c.classList.add('show'); c.innerHTML = '🌟 الخليّةُ النباتيّةُ لها <b>جدارٌ خلويّ</b> يعطيها شكلًا منتظمًا، و<b>بلاستيداتٌ خضراء</b> (في الأجزاءِ الخضراء) تصنعُ الغذاء، أمّا الخليّةُ الحيوانيّةُ فليس لها جدارٌ ولا بلاستيدات. وكلتاهما لها <b>نواةٌ</b> و<b>غشاءٌ</b> و<b>سيتوبلازم</b>.'; api.award(2, 'قارنتَ الخلايا بالمجهر'); } };
  draw();
}

// ١٠. توازنُ النظامِ البيئيّ: العشب والأرانب والثعالب
export function labPopul(box, api) {
  const root = shell(box, `<p style="margin:4px 0">في محميّةٍ: <b>عشبٌ</b> 🌾 تأكلُه <b>الأرانب</b> 🐇، والأرانبُ تأكلُها <b>الثعالب</b> 🦊. غيّرِ الظروفَ وراقبِ الأعدادَ ٣٠ سنة.</p>
    <div class="sl">🦊 عددُ الثعالبِ في البداية <input type="range" id="pF" min="0" max="30" value="10"><b id="pFv"></b></div>
    <div class="sl">🌧️ الأمطار (نموّ العشب) <input type="range" id="pR" min="1" max="3" step="1" value="2"><b id="pRv"></b></div>
    ${predictHTML('لو أزلنا كلَّ الثعالب (صفر)، ماذا يحدثُ للأرانبِ والعشب؟', ['تزدادُ الأرانبُ ثم يقلُّ العشبُ فتقلُّ الأرانب', 'تزدادُ الأرانبُ والعشبُ معًا', 'لا يتغيّرُ شيء'])}
    <div class="ctl"><button id="pGo">▶ شغّلِ المحاكاة</button></div>
    <div class="stage" style="background:#fff"><svg viewBox="0 0 600 260" class="vb"></svg></div><div class="msg" id="pM">اضبطِ الظروفَ ثم شغّلْ.</div><div class="concl" id="pC"></div>`);
  let pred = -1; wirePredict(root, p => pred = p); const runs = new Set();
  const lab = () => { root.querySelector('#pFv').textContent = AR(root.querySelector('#pF').value); root.querySelector('#pRv').textContent = ['', 'قليلة', 'متوسّطة', 'غزيرة'][root.querySelector('#pR').value]; };
  function sim() {
    let G = 600, R = 60, F = +root.querySelector('#pF').value; const rain = +root.querySelector('#pR').value, out = [];
    for (let y = 0; y <= 30; y++) { out.push([G, R, F]); const eat = Math.min(G, R * 4.2), gNew = G + G * .35 * rain / 2 * (1 - G / 1000) - eat; const hunt = Math.min(R, F * 3.2 * R / (R + 40)); const rNew = R + eat / 9 - R * .18 - hunt; const fNew = F + hunt / 6 - F * .22;
      G = Math.max(5, gNew); R = Math.max(0, rNew); F = Math.max(0, fNew); if (R < .5) R = 0; if (F < .5) F = 0; }
    return out;
  }
  function plot(out, upto) {
    const X = i => 50 + i * 17.5, Y = (v, m) => 220 - v / m * 190, ser = [[0, 1000, '#5aa83a', '🌾 العشب'], [1, 200, '#8a6ad8', '🐇 الأرانب'], [2, 40, '#e0603a', '🦊 الثعالب']];
    root.querySelector('.vb').innerHTML = `<rect width="600" height="260" fill="#fff"/><line x1="50" y1="220" x2="580" y2="220" stroke="#99a"/><line x1="50" y1="25" x2="50" y2="220" stroke="#99a"/>${[0, 10, 20, 30].map(y => `<text x="${X(y)}" y="240" text-anchor="middle" font-size="12" fill="#556">${AR(y)}</text>`).join('')}<text x="315" y="256" text-anchor="middle" font-size="12" fill="#556">السنوات</text>` +
      ser.map(([k, m, c, n], j) => `<polyline fill="none" stroke="${c}" stroke-width="3.5" points="${out.slice(0, upto + 1).map((p, i) => X(i) + ',' + Y(Math.min(p[k], m), m).toFixed(1)).join(' ')}"/><rect x="${430}" y="${10 + j * 20}" width="14" height="6" fill="${c}"/><text x="450" y="${18 + j * 20}" font-size="13" fill="#223">${n}</text>`).join('');
  }
  let anim = null;
  root.querySelector('#pGo').onclick = () => { if (anim) return; const out = sim(); let i = 0; anim = setInterval(() => { if (!box.isConnected) return clearInterval(anim); plot(out, i); if (++i > 30) { clearInterval(anim); anim = null; finish(out); } }, 60); };
  function finish(out) {
    const F0 = +root.querySelector('#pF').value, last = out[30], m = root.querySelector('#pM');
    const key = F0 === 0 ? 'none' : F0 > 22 ? 'many' : 'some'; runs.add(key);
    m.textContent = F0 === 0 ? 'بلا ثعالب: ازدادتِ الأرانبُ كثيرًا فأكلتِ العشبَ حتى قلّ، ثم جاعتْ وقلَّ عددُها.' : F0 > 22 ? 'ثعالبُ كثيرة: اصطادتِ الأرانبَ بسرعة، ثم قلّتِ الثعالبُ لقلّةِ الغذاء.' : 'تتذبذبُ الأعدادُ ثم تقتربُ من <b>التوازن</b>.'.replace(/<\/?b>/g, '');
    api.award(1);
    if (runs.has('none') && runs.size >= 2 && !root._c) { root._c = 1; const c = root.querySelector('#pC'); c.classList.add('show'); c.innerHTML = (pred === 0 ? '🌟 توقّعُك صحيح! ' : '') + 'المفترساتُ (الثعالب) تحافظُ على <b>توازنِ</b> النظامِ البيئيّ؛ فهي تمنعُ الأرانبَ من الزيادةِ الكبيرةِ التي تقضي على العشب. وكلُّ تغييرٍ في حلقةٍ يؤثّرُ في <b>الشبكةِ الغذائيّة</b> كلِّها.'; api.award(pred === 0 ? 3 : 2, 'فسّرتَ توازنَ النظامِ البيئيّ'); }
  }
  ['#pF', '#pR'].forEach(s => root.querySelector(s).oninput = lab); lab(); plot(sim(), 0);
}

// ١١. كيف تنتشرُ العدوى في الفصل؟
export function labGerms(box, api) {
  const root = shell(box, `<p style="margin:4px 0">في فصلٍ من <b>٣٠ طالبًا</b>، أُصيبَ طالبٌ واحدٌ بالزكام 🤧. اخترْ عاداتِ الفصل، ثم راقبِ العدوى ١٢ يومًا.</p>
    <div class="sw"><label><input type="checkbox" data-o="wash"> 🧼 غسلُ اليدين</label><label><input type="checkbox" data-o="cover"> 😷 تغطيةُ العطاس</label><label><input type="checkbox" data-o="home"> 🏠 المريضُ يبقى في البيت</label><label><input type="checkbox" data-o="vacc"> 💉 تطعيم نصفِ الطلاب</label></div>
    <div class="ctl"><button id="iGo">▶ ابدأ</button></div>
    <div class="stage" style="background:#fff;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center;padding:10px"><div id="iG" style="display:grid;grid-template-columns:repeat(6,34px);gap:5px;font-size:26px"></div><svg viewBox="0 0 300 180" class="vb" style="max-width:300px;flex:1;min-width:220px"></svg></div>
    <div class="meters"><div>اليوم<b id="iD">٠</b></div><div>مرضى الآن<b id="iN">١</b></div><div>أُصيبوا كلُّهم<b id="iT">١</b></div></div>
    <table><tr><th>العادات</th><th>أُصيبَ كلُّهم</th></tr><tbody id="iR"></tbody></table><div class="concl" id="iC"></div>`);
  const O = () => Object.fromEntries([...root.querySelectorAll('[data-o]')].map(c => [c.dataset.o, c.checked]));
  root.querySelectorAll('[data-o]').forEach(c => c.onchange = () => c.parentElement.classList.toggle('on', c.checked));
  let S = [], day = 0, tm = null, curve = []; const res = [];
  const ico = s => s.st === 'I' ? '🤒' : s.st === 'R' ? '😊' : s.vac ? '🛡️' : '🙂';
  function reset() { const o = O(); S = Array.from({ length: 30 }, (_, i) => ({ st: 'S', d: 0, vac: o.vacc && i % 2 === 1 })); S[14].st = 'I'; S[14].vac = false; day = 0; curve = [1]; draw(); }
  function draw() { root.querySelector('#iG').innerHTML = S.map(s => `<span title="">${ico(s)}</span>`).join(''); const now = S.filter(s => s.st === 'I').length, tot = S.filter(s => s.st !== 'S').length;
    root.querySelector('#iD').textContent = AR(day); root.querySelector('#iN').textContent = AR(now); root.querySelector('#iT').textContent = AR(tot);
    root.querySelector('.vb').innerHTML = `<rect width="300" height="180" fill="#fff"/><line x1="25" y1="160" x2="295" y2="160" stroke="#99a"/><line x1="25" y1="10" x2="25" y2="160" stroke="#99a"/><text x="160" y="176" text-anchor="middle" font-size="11" fill="#556">الأيام</text><polyline fill="none" stroke="#e0603a" stroke-width="3" points="${curve.map((v, i) => (25 + i * 22) + ',' + (160 - v * 5)).join(' ')}"/><text x="30" y="20" font-size="11" fill="#e0603a">المرضى</text>`; }
  function step() {
    const o = O(); let p = .12; if (o.wash) p *= .45; if (o.cover) p *= .6;
    const sick = S.map((s, i) => s.st === 'I' && !(o.home && s.d >= 1) ? i : -1).filter(i => i >= 0);
    S.forEach((s, i) => { if (s.st !== 'S' || s.vac) return; const near = sick.filter(j => Math.abs((j % 6) - (i % 6)) <= 1 && Math.abs(Math.floor(j / 6) - Math.floor(i / 6)) <= 1).length; const far = sick.length - near; const risk = 1 - Math.pow(1 - p, near * 2 + far * .25); if (Math.random() < risk) s.nx = 1; });
    S.forEach(s => { if (s.nx) { s.st = 'I'; s.d = -1; s.nx = 0; } if (s.st === 'I') { s.d++; if (s.d >= 4) s.st = 'R'; } });
    day++; curve.push(S.filter(s => s.st === 'I').length); draw();
  }
  root.querySelector('#iGo').onclick = () => { if (tm) return; reset(); tm = setInterval(() => { if (!box.isConnected) return clearInterval(tm); step(); if (day >= 12) { clearInterval(tm); tm = null; const o = O(), tot = S.filter(s => s.st !== 'S').length, names = [o.wash && '🧼', o.cover && '😷', o.home && '🏠', o.vacc && '💉'].filter(Boolean).join(' ') || 'بلا وقاية';
    res.push([names, tot]); root.querySelector('#iR').innerHTML += `<tr><td>${names}</td><td><b>${AR(tot)}</b> من ٣٠</td></tr>`; api.award(1);
    if (res.length >= 2 && res.some(r => r[0] === 'بلا وقاية') && res.some(r => r[0] !== 'بلا وقاية') && !root._c) { root._c = 1; const c = root.querySelector('#iC'); c.classList.add('show'); c.innerHTML = '🌟 تنتقلُ <b>العدوى</b> بسرعةٍ من المريضِ إلى من حولَه. <b>غسلُ اليدين</b> وتغطيةُ العطاسِ وبقاءُ المريضِ في البيتِ و<b>التطعيمُ</b> تقلّلُ عددَ المصابين كثيرًا، فنحمي أنفسَنا وزملاءنا.'; api.award(2, 'قارنتَ طرقَ الوقايةِ من العدوى'); } } }, 350); };
  reset();
}

/* ════════════ الصف الخامس ════════════ */
// ١٢. دورةُ الماء
export function labWCycle(box, api) {
  const root = shell(box, `<p style="margin:4px 0">غيّرْ <b>حرارةَ الشمس</b> وراقبْ: <b>التبخّر</b> ← <b>التكثّف</b> ← <b>الهطول</b> ← الجريان والتسرّب.</p>
    <div class="sl">☀️ حرارةُ الشمس <input type="range" id="wT" min="1" max="5" value="3"><b id="wTv"></b></div>
    <div class="sw"><label id="wHl"><input type="checkbox" id="wH" checked> ⛰️ هواءٌ باردٌ فوقَ الجبل</label></div>
    <div class="stage"><svg viewBox="0 0 600 300" class="vb"></svg></div>
    <div class="meters"><div>💨 تبخّر<b id="m1">٠</b></div><div>☁️ ماءُ السحابة<b id="m2">٠</b></div><div>🌧️ هطول<b id="m3">٠</b></div><div>🏞️ جريانٌ سطحيّ<b id="m4">٠</b></div><div>⬇️ مياهٌ جوفيّة<b id="m5">٠</b></div></div>
    <div class="msg" id="wM"></div><div class="concl" id="wC"></div>`);
  const vb = root.querySelector('.vb'); let vap = [], drops = [], runoff = [], cloud = 0, E = 0, P = 0, Ro = 0, Gw = 0, cx = 360, seenRain = false, seenHot = false;
  const lab = () => { root.querySelector('#wTv').textContent = ['', 'ضعيفة', 'معتدلة', 'متوسّطة', 'قويّة', 'قويّة جدًّا'][root.querySelector('#wT').value]; root.querySelector('#wHl').classList.toggle('on', root.querySelector('#wH').checked); };
  loop(box, dt => {
    const T = +root.querySelector('#wT').value, cold = root.querySelector('#wH').checked;
    if (Math.random() < T * dt * 2.2) vap.push({ x: rnd(20, 240), y: 250 }); vap.forEach(v => { v.y -= 40 * dt; v.x += 25 * dt; }); vap = vap.filter(v => { if (v.y < 90) { cloud += 1; E++; return false; } return true; });
    cx += ((cold ? 440 : 330) - cx) * dt * .3;
    const raining = cloud > 14 && (cold ? cx > 400 : cloud > 40); if (raining) { seenRain = true; if (Math.random() < dt * 14) { drops.push({ x: rnd(cx - 45, cx + 45), y: 110 }); cloud = Math.max(0, cloud - .6); P++; } }
    drops.forEach(d => d.y += 200 * dt); drops = drops.filter(d => { if (d.y > 170 + (d.x - 330) * .1) { if (Math.random() < .35) Gw++; else { runoff.push({ x: d.x, y: d.y, t: 0 }); Ro++; } return false; } return true; });
    runoff.forEach(r => { r.x -= 60 * dt; r.y = Math.min(250, r.y + 22 * dt); }); runoff = runoff.filter(r => r.x > 240);
    if (T >= 4) seenHot = true;
    const cs = Math.min(1.6, .5 + cloud / 40), gray = Math.min(1, cloud / 45);
    vb.innerHTML = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${['', '#cfe8ff', '#b8dcff', '#a6d2ff', '#9ccdff', '#8ec6ff'][T]}"/><stop offset="1" stop-color="#eef7ff"/></linearGradient></defs><rect width="600" height="300" fill="url(#sky)"/>
      <circle cx="60" cy="50" r="${18 + T * 4}" fill="#ffd34a"><animate attributeName="r" values="${18 + T * 4};${22 + T * 4};${18 + T * 4}" dur="2s" repeatCount="indefinite"/></circle>
      <path d="M0 240 Q120 230 250 245 L250 300 L0 300 Z" fill="#3a8ad8"/><text x="110" y="285" text-anchor="middle" font-size="14" fill="#fff">البحر</text>
      <path d="M240 250 L360 150 L430 110 L520 170 L600 200 L600 300 L240 300 Z" fill="#9a8a6a"/><path d="M400 128 L430 110 L455 128 L430 124 Z" fill="#fff"/>
      <path d="M240 255 L600 255 L600 300 L240 300 Z" fill="#7a6a4a" opacity=".5"/><rect x="300" y="${292 - Math.min(30, Gw / 3)}" width="250" height="${Math.min(30, Gw / 3)}" fill="#4ab0ff" opacity=".55"/><text x="560" y="290" font-size="12" fill="#fff" text-anchor="end">مياهٌ جوفيّة</text>
      <g transform="translate(${cx} 85) scale(${cs})" opacity="${.35 + gray * .65}"><ellipse rx="50" ry="22" fill="${gray > .7 ? '#8a9aaa' : '#fff'}"/><ellipse cx="-30" cy="6" rx="30" ry="18" fill="${gray > .7 ? '#8a9aaa' : '#fff'}"/><ellipse cx="32" cy="6" rx="32" ry="18" fill="${gray > .7 ? '#8a9aaa' : '#fff'}"/></g>
      ${vap.map(v => `<circle cx="${v.x.toFixed(0)}" cy="${v.y.toFixed(0)}" r="3" fill="#fff" opacity=".85"/>`).join('')}${drops.map(d => `<line x1="${d.x}" y1="${d.y}" x2="${d.x - 2}" y2="${d.y + 9}" stroke="#2a8ae0" stroke-width="2.5"/>`).join('')}${runoff.map(r => `<circle cx="${r.x.toFixed(0)}" cy="${r.y.toFixed(0)}" r="3" fill="#2a8ae0"/>`).join('')}
      <text x="150" y="190" font-size="13" fill="#1a4a9a">↑ تبخّر</text><text x="${cx}" y="45" text-anchor="middle" font-size="13" fill="#1a4a9a">تكثّف</text>${raining ? `<text x="${cx + 60}" y="140" font-size="13" fill="#1a4a9a">هطول</text>` : ''}`;
    ['m1', 'm2', 'm3', 'm4', 'm5'].forEach((id, i) => root.querySelector('#' + id).textContent = AR(Math.round([E, cloud, P, Ro, Gw][i])));
    root.querySelector('#wM').textContent = raining ? 'بردَ بخارُ الماءِ فوقَ الجبلِ فتكثّفَ وسقطَ مطرًا 🌧️' : cold ? 'بخارُ الماءِ يصعدُ ويتجمّعُ في السحابة…' : 'السحابةُ تكبرُ لكنّ الهواءَ ليس باردًا بما يكفي للهطول. أعدِ الهواءَ البارد.';
    if (seenRain && seenHot && P > 30 && !root._c) { root._c = 1; const c = root.querySelector('#wC'); c.classList.add('show'); c.innerHTML = '🌟 <b>الشمسُ</b> هي محرّكُ دورةِ الماء: كلّما زادتْ حرارتُها زادَ <b>التبخّر</b>. يبردُ البخارُ في الأعلى فـ<b>يتكثّفُ</b> سحبًا، ثم <b>يهطل</b>، فيجري جزءٌ إلى البحرِ (جريانٌ سطحيّ) ويتسرّبُ جزءٌ إلى باطنِ الأرضِ (مياهٌ جوفيّة)، وتتكرّرُ الدورة.'; api.award(3, 'تتبّعتَ دورةَ الماء'); }
  });
  ['#wT', '#wH'].forEach(s => root.querySelector(s).oninput = lab); lab();
}

// ١٣. تحديدُ المركزِ السطحيِّ للزلزال
export function labQuake(box, api) {
  const ST = [['أ', 110, 90], ['ب', 470, 70], ['ج', 300, 300]];
  const root = shell(box, `<p style="margin:4px 0">سجّلتْ ثلاثُ محطّاتِ رصدٍ زلزالًا. المسافةُ (كم) = <b>الفرقُ بينَ وصولِ الموجتين (ث) × ٨</b>. اضبطْ نصفَ قطرِ دائرةِ كلِّ محطّة، ثم المسْ نقطةَ تقاطعِ الدوائرِ الثلاث.</p>
    <table><tr><th>المحطّة</th><th>فرقُ الوصول</th><th>المسافة</th></tr><tbody id="qT"></tbody></table>
    <div id="qS"></div><div class="stage" style="background:#f4f0e4"><svg viewBox="0 0 600 380" class="vb" style="cursor:crosshair"></svg></div>
    <div class="row"><button class="abtn sec" id="qN">🔄 زلزالٌ جديد</button></div><div class="msg" id="qM">اضبطِ الدوائرَ الثلاث.</div><div class="concl" id="qC"></div>`);
  const vb = root.querySelector('.vb'); let E, r = [0, 0, 0], mark = null, solved = 0; const sc = 1.6; // ١ كم = ١٫٦ بكسل
  function quake() {
    E = [rnd(150, 450), rnd(120, 300)]; mark = null; r = [40, 40, 40];
    const lag = ST.map(s => Math.round(Math.hypot(s[1] - E[0], s[2] - E[1]) / sc / 8));
    root.querySelector('#qT').innerHTML = ST.map((s, i) => `<tr><td>${s[0]}</td><td>${AR(lag[i])} ث</td><td id="qd${i}">؟</td></tr>`).join('');
    root.querySelector('#qS').innerHTML = ST.map((s, i) => `<div class="sl">📡 ${s[0]} <input type="range" min="10" max="320" value="40" data-r="${i}"><b id="qr${i}"></b></div>`).join('');
    root.querySelectorAll('[data-r]').forEach(inp => inp.oninput = () => { r[+inp.dataset.r] = +inp.value; draw(); });
    root.querySelector('#qM').textContent = 'احسبِ المسافة: الفرق × ٨، ثم اضبطِ الدوائر.'; root._lag = lag; draw();
  }
  function draw() {
    const lag = root._lag;
    vb.innerHTML = `<rect width="600" height="380" fill="#f4f0e4"/>${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="380" stroke="#e0d8c0"/><line x1="0" y1="${i * 50}" x2="600" y2="${i * 50}" stroke="#e0d8c0"/>`).join('')}
      <path d="M30 360 L120 300 L60 200 L140 40 L400 20 L570 120 L560 330 L300 370 Z" fill="#e8dcb8" stroke="#c8b890" stroke-width="2"/>
      ${ST.map((s, i) => { const ok = Math.abs(r[i] - lag[i] * 8) <= lag[i] * 8 * .08 + 3; root.querySelector('#qr' + i).textContent = AR(r[i]) + ' كم'; root.querySelector('#qd' + i).textContent = ok ? AR(lag[i] * 8) + ' كم ✓' : '؟'; return `<circle cx="${s[1]}" cy="${s[2]}" r="${r[i] * sc}" fill="none" stroke="${ok ? '#2f8f6a' : ['#3a7ae0', '#e0603a', '#8a6ad8'][i]}" stroke-width="3" stroke-dasharray="${ok ? '0' : '8 6'}"/><path d="M${s[1]} ${s[2] - 14} l-10 18 h20 z" fill="#1a4a9a"/><text x="${s[1]}" y="${s[2] + 22}" text-anchor="middle" font-size="16" fill="#1a4a9a">${s[0]}</text>`; }).join('')}
      ${mark ? `<g transform="translate(${mark[0]} ${mark[1]})"><circle r="9" fill="#e0303a"/><circle r="16" fill="none" stroke="#e0303a" stroke-width="2"/></g>` : ''}
      ${solved && mark ? `<g transform="translate(${E[0]} ${E[1]})"><text font-size="28" text-anchor="middle" y="10">💥</text></g>` : ''}`;
  }
  vb.addEventListener('pointerdown', e => { const pt = vb.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(vb.getScreenCTM().inverse()); mark = [p.x, p.y];
    const lag = root._lag, all = ST.every((s, i) => Math.abs(r[i] - lag[i] * 8) <= lag[i] * 8 * .08 + 3), d = Math.hypot(p.x - E[0], p.y - E[1]), m = root.querySelector('#qM');
    if (!all) { m.textContent = 'اضبطْ أوّلًا الدوائرَ الثلاثَ على المسافاتِ الصحيحة (تصبحُ خضراء).'; draw(); return; }
    if (d < 30) { solved = 1; m.textContent = '🌟 أصبت! هذا هو المركزُ السطحيُّ للزلزال: النقطةُ الوحيدةُ التي تبعدُ المسافةَ الصحيحةَ عن المحطّاتِ الثلاث.'; api.award(2, 'حدّدتَ المركزَ السطحيّ'); if (!root._c) { root._c = 1; const c = root.querySelector('#qC'); c.classList.add('show'); c.innerHTML = 'نحتاجُ إلى <b>ثلاثِ محطّاتٍ على الأقلّ</b>: محطّةٌ واحدةٌ تعطينا دائرةً من الاحتمالات، ومحطّتانِ تعطيانِ نقطتين، والثالثةُ تحدّدُ النقطةَ الصحيحة.'; } }
    else { solved = 0; m.textContent = '✗ ليست هذه. ابحثْ عن النقطةِ التي تلتقي فيها الدوائرُ الثلاثُ معًا.'; } draw(); });
  root.querySelector('#qN').onclick = () => { solved = 0; quake(); }; quake();
}

/* ════════════ الصف السادس ════════════ */
// ١٤. مربّعُ بانيت — وراثةُ لونِ الزهرة
export function labPunnett(box, api) {
  const TR = { color: ['لون زهرة البازلّاء', 'B', 'b', 'بنفسجي 🟣', 'أبيض ⚪'], height: ['طول نبات البازلّاء', 'T', 't', 'طويل 🌿', 'قصير 🌱'] };
  const G = ['XX', 'Xx', 'xx'];
  const root = shell(box, `<div class="row">الصفة: <select id="uT">${Object.entries(TR).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></div>
    <div class="row">الأب 1: <span class="cards" id="u1" style="margin:0"></span></div><div class="row">الأب 2: <span class="cards" id="u2" style="margin:0"></span></div>
    <div class="stage" style="background:#fff;padding:10px"><div id="uP"></div></div>
    ${predictHTML('ما نسبةُ الأبناءِ الذين تظهرُ عليهم الصفةُ المتنحّية؟', ['٠٪', '٢٥٪', '٥٠٪', '١٠٠٪'])}
    <div class="ctl"><button id="uGo">🌱 أنتجْ ١٠٠ نبتة</button></div><div class="stage" style="background:#fff"><svg viewBox="0 0 600 150" class="vb"></svg></div><div class="msg" id="uM">اخترِ الأبوين واملأِ المربّعَ بلمسِ خاناته.</div><div class="concl" id="uC"></div>`);
  let g1 = 1, g2 = 1, pred = -1, filled = 0; const combos = new Set(); wirePredict(root, p => pred = p);
  const T = () => TR[root.querySelector('#uT').value], al = (g, t) => g === 0 ? [t[1], t[1]] : g === 1 ? [t[1], t[2]] : [t[2], t[2]], name = (g, t) => g.replace(/X/g, t[1]).replace(/x/g, t[2]);
  function pick(id, v, set) { root.querySelector(id).innerHTML = G.map((g, i) => `<button data-g="${i}" class="${i === v ? 'sel' : ''}">${name(g, T())}</button>`).join(''); root.querySelectorAll(id + ' button').forEach(b => b.onclick = () => { set(+b.dataset.g); draw(); }); }
  function draw() {
    const t = T(); pick('#u1', g1, v => g1 = v); pick('#u2', g2, v => g2 = v); filled = 0;
    const a = al(g1, t), b = al(g2, t);
    root.querySelector('#uP').innerHTML = `<table style="max-width:360px;margin:auto;font-size:20px"><tr><th></th>${a.map(x => `<th>${x}</th>`).join('')}</tr>${b.map(y => `<tr><th>${y}</th>${a.map(x => { const g = [x, y].sort((p, q) => p === p.toUpperCase() ? -1 : 1).join(''); return `<td data-c="${g}" style="cursor:pointer;height:54px">❔</td>`; }).join('')}</tr>`).join('')}</table>`;
    root.querySelectorAll('[data-c]').forEach(c => c.onclick = () => { if (c.dataset.f) return; c.dataset.f = 1; const g = c.dataset.c, dom = g !== g.toLowerCase(); c.innerHTML = `<b>${g}</b><br><span style="font-size:14px">${dom ? t[3] : t[4]}</span>`; c.style.background = dom ? '#f0e6ff' : '#f4f4f4'; if (++filled === 4) { const rec = [...root.querySelectorAll('[data-c]')].filter(x => x.dataset.c === x.dataset.c.toLowerCase()).length; root.querySelector('#uM').innerHTML = `المتوقّع: <b>${AR(rec * 25)}٪</b> ${t[4]} و<b>${AR(100 - rec * 25)}٪</b> ${t[3]}.`; api.award(1); } });
    root.querySelector('.vb').innerHTML = ''; root.querySelector('#uM').textContent = 'املأِ المربّعَ بلمسِ خاناته.';
  }
  root.querySelector('#uGo').onclick = () => {
    if (filled < 4) { root.querySelector('#uM').textContent = 'املأْ مربّعَ بانيت أوّلًا.'; return; }
    const t = T(), a = al(g1, t), b = al(g2, t); let rec = 0; for (let i = 0; i < 100; i++) { const x = pick2(a), y = pick2(b); if (x === t[2] && y === t[2]) rec++; }
    const exp = [...root.querySelectorAll('[data-c]')].filter(x => x.dataset.c === x.dataset.c.toLowerCase()).length * 25;
    root.querySelector('.vb').innerHTML = `<rect width="600" height="150" fill="#fff"/>${Array.from({ length: 100 }, (_, i) => `<text x="${20 + (i % 25) * 23}" y="${30 + Math.floor(i / 25) * 30}" font-size="18">${i < 100 - rec ? t[3].split(' ')[1] : t[4].split(' ')[1]}</text>`).join('')}`;
    root.querySelector('#uM').innerHTML = `النتيجة: <b>${AR(100 - rec)}</b> ${t[3]} و<b>${AR(rec)}</b> ${t[4]} (المتوقّع ${AR(exp)}٪). النتائجُ الحقيقيّةُ تقتربُ من المتوقّعِ ولا تطابقُه تمامًا.`;
    combos.add(g1 + '' + g2); api.award(1);
    if (g1 === 1 && g2 === 1 && !root._c) { root._c = 1; const c = root.querySelector('#uC'); c.classList.add('show'); c.innerHTML = (pred === 1 ? '🌟 توقّعُك صحيح! ' : '') + 'عندما يحملُ الأبوانِ الجينَ المتنحّي دونَ أن يظهرَ عليهما (<b>' + name('Xx', t) + '</b>)، يظهرُ في نحوِ <b>٢٥٪</b> من الأبناءِ الصفةُ المتنحّية، لأنّ الصفةَ المتنحّيةَ لا تظهرُ إلّا باجتماعِ جينينِ متنحّيين. لهذا قد يختلفُ الابنُ عن أبويه.'; api.award(pred === 1 ? 3 : 2, 'فسّرتَ الوراثةَ بمربّعِ بانيت'); }
  };
  const pick2 = a => a[Math.random() < .5 ? 0 : 1];
  root.querySelector('#uT').onchange = draw; draw();
}

// ١٥. البناءُ الضوئيّ: فقاعاتُ نباتِ الإيلوديا
export function labPhoto(box, api) {
  const COL = [['أبيض', '#fffbe0', 1], ['أحمر', '#ffd0d0', .85], ['أزرق', '#d0dcff', .95], ['أخضر', '#d4ffd4', .15]];
  const root = shell(box, `<p style="margin:4px 0">نباتُ الإيلوديا المائيُّ يُطلقُ فقاعاتِ <b>الأكسجين</b> أثناءَ البناءِ الضوئيّ. عُدَّ الفقاعاتِ في دقيقة وغيّرْ متغيّرًا واحدًا كلَّ مرّة.</p>
    <div class="sl">💡 بُعدُ المصباح <input type="range" id="fD" min="10" max="60" step="10" value="20"><b id="fDv"></b></div>
    <div class="row">لونُ الضوء: <span class="cards" id="fC" style="margin:0">${COL.map((c, i) => `<button data-c="${i}" class="${i ? '' : 'sel'}">${c[0]}</button>`).join('')}</span></div>
    <div class="sw"><label id="fBl"><input type="checkbox" id="fB"> 🧂 إضافةُ صودا الخبز (ثاني أكسيد الكربون)</label></div>
    <div class="stage" style="background:#eef7ff"><svg viewBox="0 0 600 280" class="vb"></svg><div class="day" id="fT"></div></div>
    <div class="ctl"><button id="fGo">⏱ قِسْ دقيقةً واحدة</button></div>
    <table><tr><th>#</th><th>البُعد</th><th>اللون</th><th>صودا</th><th>فقاعات/دقيقة</th></tr><tbody id="fR"></tbody></table><div class="concl" id="fCc"></div>`);
  const vb = root.querySelector('.vb'); let col = 0, bub = [], count = 0, t = -1, n = 0; const tried = new Set();
  const rate = () => { const d = +root.querySelector('#fD').value, I = Math.min(1, 400 / (d * d)); return Math.round(48 * I * COL[col][2] * (root.querySelector('#fB').checked ? 1.6 : 1)); };
  root.querySelectorAll('#fC button').forEach(b => b.onclick = () => { col = +b.dataset.c; root.querySelectorAll('#fC button').forEach(x => x.classList.toggle('sel', x === b)); });
  const lab = () => { root.querySelector('#fDv').textContent = AR(root.querySelector('#fD').value) + ' سم'; root.querySelector('#fBl').classList.toggle('on', root.querySelector('#fB').checked); };
  ['#fD', '#fB'].forEach(s => root.querySelector(s).oninput = lab); lab();
  loop(box, dt => {
    const d = +root.querySelector('#fD').value, R = rate(), lx = 385 + d * 3.4;
    if (Math.random() < R / 60 * dt * 6) { bub.push({ x: rnd(268, 300), y: 200 }); if (t >= 0) count++; }
    bub.forEach(b => { b.y -= 55 * dt; b.x += Math.sin(b.y / 9) * .4; }); bub = bub.filter(b => b.y > 60);
    if (t >= 0) { t += dt * 6; if (t >= 60) { t = -1; n++; const k = [d, col, root.querySelector('#fB').checked].join(); root.querySelector('#fR').innerHTML += `<tr><td>${AR(n)}</td><td>${AR(d)} سم</td><td>${COL[col][0]}</td><td>${root.querySelector('#fB').checked ? '✓' : '✗'}</td><td><b>${AR(count)}</b></td></tr>`; root.querySelector('#fGo').disabled = false; if (!tried.has(k)) { tried.add(k); api.award(1); }
      const ds = new Set([...tried].map(x => x.split(',')[0])), cs = new Set([...tried].map(x => x.split(',')[1]));
      if (ds.size >= 2 && cs.has('3') && !root._c) { root._c = 1; const c = root.querySelector('#fCc'); c.classList.add('show'); c.innerHTML = '🌟 كلّما <b>اقتربَ الضوء</b> (زادتْ شدّتُه) زادَ معدّلُ البناءِ الضوئيِّ فزادتْ فقاعاتُ الأكسجين. و<b>الضوءُ الأخضرُ</b> يعطي فقاعاتٍ قليلة لأنّ الكلوروفيلَ يعكسُه ولا يمتصُّه (لذلك نرى الأوراقَ خضراء)، وإضافةُ <b>ثاني أكسيدِ الكربون</b> تزيدُ المعدّل.'; api.award(3, 'استقصيتَ عواملَ البناءِ الضوئيّ'); } } }
    root.querySelector('#fT').textContent = t >= 0 ? '⏱ ' + AR(Math.floor(t)) + ' ث — ' + AR(count) : '';
    vb.innerHTML = `<rect width="600" height="280" fill="#eef7ff"/><path d="M${lx} 80 L${lx - 40} 140 L${lx + 40} 140 Z" fill="#555"/><circle cx="${lx}" cy="150" r="20" fill="${COL[col][1]}" stroke="#aaa"/><path d="M${lx - 22} 150 L362 150" stroke="${COL[col][1]}" stroke-width="${70 - d}" opacity=".5"/>
      <rect x="200" y="60" width="160" height="200" rx="10" fill="#dff4ff" stroke="#7a9ab0" stroke-width="3"/><rect x="204" y="80" width="152" height="176" fill="#bfe6ff" opacity=".6"/>
      <path d="M280 250 Q276 200 284 160 Q290 130 282 100" stroke="#2f8f32" stroke-width="5" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${282 + (i % 2 ? 10 : -10)}" cy="${240 - i * 16}" rx="12" ry="4" fill="#3f9a3a" transform="rotate(${i % 2 ? -30 : 30} ${282 + (i % 2 ? 10 : -10)} ${240 - i * 16})"/>`).join('')}
      ${bub.map(b => `<circle cx="${b.x.toFixed(0)}" cy="${b.y.toFixed(0)}" r="4" fill="#fff" stroke="#9ac" stroke-width="1"/>`).join('')}<text x="120" y="270" font-size="13" fill="#3a4a5a">١ ثانية = ١٠ ثوانٍ</text>`;
  });
  root.querySelector('#fGo').onclick = () => { if (t >= 0) return; t = 0; count = 0; root.querySelector('#fGo').disabled = true; };
}

// ١٦. المناخُ والمناطقُ الحيويّة
export function labBiome(box, api) {
  const B = [
    ['tundra', 'التندرا', '#e8eef4', '#c8d4dc', 'تربةٌ متجمّدة، أعشابٌ قصيرةٌ وأشنات، لا أشجار. 🦌', ''],
    ['taiga', 'التايجا', '#d8e8e0', '#6a8a6a', 'شتاءٌ طويلٌ بارد، غاباتُ صنوبريّاتٍ دائمةِ الخضرة. 🐻', '🌲'],
    ['desert', 'الصحراء', '#f8e4b8', '#e0b870', 'أمطارٌ قليلةٌ جدًّا، نباتاتٌ تخزّنُ الماء. 🐪', '🌵'],
    ['grass', 'الأراضي العشبيّة', '#e8f4c8', '#b8d870', 'أمطارٌ متوسّطة، أعشابٌ كثيرةٌ وأشجارٌ قليلة. 🦓', '🌾'],
    ['decid', 'الغابة النفضيّة', '#e4f0d8', '#6aa04a', 'أربعةُ فصول، أشجارٌ تُسقطُ أوراقَها في الخريف. 🦌', '🌳'],
    ['rain', 'الغابة المطيرة', '#d8f0d8', '#2f7a3a', 'حارّةٌ ممطرةٌ طوالَ العام، أكثرُ المناطقِ تنوّعًا. 🦜', '🌴']];
  const classify = (T, P) => T < -4 ? 0 : P < 250 ? 2 : T < 4 ? 1 : P < 700 ? 3 : (T >= 20 && P >= 1800) ? 5 : P >= 700 ? 4 : 3;
  const TASKS = [[1, 'اضبطِ المناخَ لتحصلَ على <b>التايجا</b>'], [5, 'اضبطْ لتحصلَ على <b>الغابة المطيرة</b>'], [2, 'اضبطْ لتحصلَ على <b>الصحراء</b>'], [0, 'اضبطْ لتحصلَ على <b>التندرا</b>']];
  const root = shell(box, `<p style="margin:4px 0">يحدّدُ <b>المناخ</b> — متوسّطُ الحرارةِ وكمّيّةُ الأمطار — نوعَ <b>المنطقةِ الحيويّة</b>. حرّكِ المؤشّرين:</p>
    <div class="sl">🌡️ متوسّطُ الحرارة <input type="range" id="bT" min="-15" max="30" value="15"><b id="bTv"></b></div>
    <div class="sl">🌧️ الأمطارُ السنويّة <input type="range" id="bP" min="0" max="3000" step="50" value="500"><b id="bPv"></b></div>
    <div class="stage"><svg viewBox="0 0 600 230" class="vb"></svg></div><div class="msg" id="bM"></div>
    <div class="pred" id="bQ"></div><div class="concl" id="bC"></div>`);
  let task = 0; const seen = new Set();
  function draw() {
    const T = +root.querySelector('#bT').value, P = +root.querySelector('#bP').value, k = classify(T, P), b = B[k];
    root.querySelector('#bTv').textContent = AR(T) + '° س'; root.querySelector('#bPv').textContent = AR(P) + ' ملم';
    const n = [0, 9, 4, 3, 7, 12][k], snow = T < 0;
    root.querySelector('.vb').innerHTML = `<rect width="600" height="230" fill="${b[2]}"/><rect y="160" width="600" height="70" fill="${b[3]}"/>${snow ? Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 71) % 600}" cy="${(i * 37) % 150}" r="2.5" fill="#fff"/>`).join('') : ''}${P > 1500 ? Array.from({ length: 20 }, (_, i) => `<line x1="${(i * 53) % 600}" y1="${(i * 29) % 140}" x2="${(i * 53) % 600 - 4}" y2="${(i * 29) % 140 + 12}" stroke="#6ab0e0" stroke-width="2"/>`).join('') : ''}
      ${k === 0 ? Array.from({ length: 14 }, (_, i) => `<path d="M${20 + i * 42} 170 q5 -10 10 0" stroke="#8a9a6a" stroke-width="3" fill="none"/>`).join('') : Array.from({ length: n }, (_, i) => `<text x="${30 + (i * 560 / n)}" y="${175 - (i % 2) * 14}" font-size="${k === 5 ? 54 : 44}">${b[5]}</text>`).join('')}
      <rect x="150" y="12" width="300" height="34" rx="12" fill="#fff" opacity=".92"/><text x="300" y="36" text-anchor="middle" font-size="20" fill="#1a3a2a">${b[1]}</text>`;
    root.querySelector('#bM').textContent = b[4];
    if (!seen.has(k)) { seen.add(k); if (seen.size > 1) api.award(1); }
    const q = root.querySelector('#bQ');
    if (task < TASKS.length) { q.innerHTML = '🎯 مهمّة ' + AR(task + 1) + ' من ' + AR(TASKS.length) + ': ' + TASKS[task][1]; if (k === TASKS[task][0]) { api.award(1); task++; q.innerHTML += ' ✓'; setTimeout(draw, 700); } }
    else if (!root._c) { root._c = 1; q.innerHTML = '🏆 أنجزتَ كلَّ المهمّات!'; const c = root.querySelector('#bC'); c.classList.add('show'); c.innerHTML = '🌟 <b>الأمطارُ</b> تحدّدُ هل تنمو أشجارٌ أم أعشابٌ أم نباتاتٌ صحراويّة، و<b>الحرارةُ</b> تحدّدُ نوعَها: من التندرا الباردةِ إلى الغابةِ المطيرةِ الحارّة. لذلك تتشابهُ المناطقُ الحيويّةُ ذاتُ المناخِ المتشابهِ في أيِّ مكانٍ من العالم.'; api.award(2, 'ربطتَ المناخَ بالمناطقِ الحيويّة'); }
  }
  ['#bT', '#bP'].forEach(s => root.querySelector(s).oninput = draw); draw();
}

/* ════════════ الربطُ بالدروس ════════════ */
export const LABS = { living: labLiving, habitats: labHabitats, water: labWater, germ: labGerm, chain: labChain, soiljar: labSoilJar, meta: labMeta, camo: labCamo, erosion: labErosion, scope: labScope, popul: labPopul, germs: labGerms, wcycle: labWCycle, quake: labQuake, punnett: labPunnett, photo: labPhoto, biome: labBiome };
export const LAB_FOR = {
  landhab1: { lab: 'habitats', title: 'أين يعيشُ الحيوان؟', intro: 'صنّفِ الحيواناتِ في مواطنِها، وفكّرْ: ماذا يجدُ كلُّ حيوانٍ في موطنِه؟' },
  save1: { lab: 'water', title: 'عدّادُ الماءِ في يومي', intro: 'كيف أرشّدُ استهلاكي للماء؟ اخترْ وقارنْ.' },
  seeds2: { lab: 'germ', title: 'ماذا تحتاجُ البذرةُ لتنبت؟', intro: 'تجربةٌ بأربعةِ أكوابٍ نغيّرُ في كلٍّ منها شرطًا واحدًا.' },
  chains2: { lab: 'chain', title: 'السلسلةُ الغذائيّة: أبني وأجرّب', intro: 'رتّبْ حلقاتِ السلسلة، ثم اكتشفْ ماذا يحدثُ لو اختفتْ حلقة.' },
  soil2: { lab: 'soiljar', title: 'جرّةُ التربة: مِمَّ تتكوّنُ التربة؟', intro: 'نرجُّ عيّناتٍ مختلفةً من التربةِ في الماءِ ونراقبُ طبقاتِها.' },
  animalcycle3: { lab: 'meta', title: 'دوراتُ الحياةِ والتحوّل', intro: 'حرّكْ مؤشّرَ العمرِ وقارنْ دوراتِ حياةِ مخلوقاتٍ مختلفة.' },
  adapt3: { lab: 'camo', title: 'لعبةُ التمويه: أنا الطائرُ المفترس', intro: 'اصطدِ الحشرات، واكتشفْ أيُّ الألوانِ تنجو في كلِّ بيئة.' },
  weather3: { lab: 'erosion', title: 'التعريةُ بالماء', intro: 'ما الذي يزيدُ جرفَ التربة؟ وما الذي يحميها؟' },
  cells4: { lab: 'scope', title: 'المجهرُ الافتراضيّ', intro: 'افحصْ ثلاثَ شرائحَ وقارنْ بينَ الخلايا النباتيّةِ والحيوانيّة.' },
  relations4: { lab: 'popul', title: 'توازنُ النظامِ البيئيّ', intro: 'محاكاةُ العلاقةِ بينَ العشبِ والأرانبِ والثعالب عبرَ السنين.' },
  infection4: { lab: 'germs', title: 'كيف تنتشرُ العدوى في الفصل؟', intro: 'قارنْ أثرَ عاداتِ الوقايةِ في عددِ المصابين.' },
  ecocycles: { lab: 'wcycle', title: 'دورةُ الماءِ في الطبيعة', intro: 'غيّرْ حرارةَ الشمسِ وتتبّعْ رحلةَ قطرةِ الماء.' },
  processes: { lab: 'quake', title: 'أين مركزُ الزلزال؟', intro: 'استخدمْ بياناتِ ثلاثِ محطّاتِ رصدٍ لتحديدِ المركزِ السطحيّ.' },
  heredity: { lab: 'punnett', title: 'مربّعُ بانيت: أتوقّعُ صفاتِ الأبناء', intro: 'اخترِ الأبوين، واملأِ المربّع، ثم قارنِ التوقّعَ بنتائجِ ١٠٠ نبتة.' },
  plantlife: { lab: 'photo', title: 'فقاعاتُ البناءِ الضوئيّ', intro: 'استقصِ أثرَ شدّةِ الضوءِ ولونِه وثاني أكسيدِ الكربون.' },
  biomes: { lab: 'biome', title: 'المناخُ يصنعُ المنطقةَ الحيويّة', intro: 'اضبطِ الحرارةَ والأمطارَ وأنجزِ المهمّات.' }
};
