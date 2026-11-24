// الدرس التفاعلي (تصميم درس «الزلازل» التجريبي) فوق الكتاب الموضوع على المكتب — العلوم، الثالث المتوسط
// مولَّد بالسكربت scripts/build_lessonapp.py من: la/head.js + محاكيات الدرس التجريبي + la/engine.js
import { SIMS } from './sims9.js';
import { QD, QHTML } from './quakes9.js';
import { fault3dStart, fault3dStop } from './fault9.js';
import { CHX } from './chapx9.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/\./g, '٫');
const fx = (n, d = 1) => AR((Math.round(n * 10 ** d) / 10 ** d).toFixed(d));
const fmtInt = n => AR(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let SP = 'sci9la:';
const store = {
  get(k, d) { try { const v = localStorage.getItem(SP + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(SP + k, JSON.stringify(v)); } catch (e) {} }
};
const COL = { navy: '#15445a', teal: '#0da9a6', green: '#07a869', gold: '#c1b489', blue: '#3d7eb9', P: '#2f6fb0', S: '#d0672a', red: '#c8402c', Pl: '#7fb2ea', Sl: '#f3a06b' };
function canvasFit(cv, hRatio) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth || cv.parentElement.clientWidth || 600;
  if (!cv.dataset.h) cv.dataset.h = cv.getAttribute('height') || 300;
  const h = hRatio ? Math.round(w * hRatio) : (+cv.dataset.h);
  if (cv._w !== w || cv._h !== h) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px'; cv._w = w; cv._h = h; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
const visible = el => !!(el && el.isConnected && el.offsetParent !== null);
let LOOPS = [];
function loop(el, fn) { LOOPS.push({ el, fn }); }
let lastT = performance.now(), ticking = false;
function tick(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t;
  LOOPS = LOOPS.filter(L => L.el && L.el.isConnected);
  if (LA.open) for (const L of LOOPS) if (visible(L.el)) { try { L.fn(dt, t / 1000); } catch (e) { console.error(e); L.el = null; } }
  requestAnimationFrame(tick);
}
let D = null;
let S = { pts: 0, done: {}, seen: {} };
const LA = { open: false };
function award(key, n = 10) {
  if (S.done[key]) return false;
  S.done[key] = 1; S.pts += n; store.set('done', S.done); store.set('pts', S.pts);
  const el = $('#pts'); if (el) { el.textContent = AR(S.pts) + ' نقطة'; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  return true;
}

const LA_CSS = "\n#lessonApp{\n  --navy:#15445a;--navy-d:#0b2a38;--navy-dd:#071c26;--teal:#0da9a6;--green:#07a869;--gold:#c1b489;--blue:#3d7eb9;\n  --pw:#2f6fb0;--sw:#d0672a;--red:#c8402c;\n  --ink:#0f2530;--ink2:#3c5563;--muted:#6b8290;--line:#dbe4e9;--bg:#eef3f5;--card:#ffffff;--soft:#f6f9fa;\n  --r:16px;--sh:0 1px 2px rgba(10,40,55,.06),0 8px 24px rgba(10,40,55,.07);\n  --side:268px;--top:64px;\n}\n#lessonApp *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n#lessonApp{position:fixed;inset:0;z-index:50;display:none;font-family:'Tajawal',system-ui,sans-serif;color:var(--ink);background:var(--bg);font-size:17px;line-height:1.75;touch-action:auto;user-select:text;-webkit-user-select:text}\n#lessonApp.open{display:block;animation:la-fade .3s}\n#lessonApp button,#lessonApp input,#lessonApp select,#lessonApp textarea{font-family:inherit;font-size:inherit;color:inherit}\n#lessonApp button{cursor:pointer}\n#lessonApp h1,#lessonApp h2,#lessonApp h3,#lessonApp h4{margin:0;line-height:1.35}\n#lessonApp img{max-width:100%;display:block}\n#lessonApp .num{font-feature-settings:\"tnum\"}\n\n/* ── الشريط العلوي ── */\n#lessonApp #ltop{position:fixed;inset:0 0 auto 0;height:var(--top);background:var(--navy-dd);color:#fff;display:flex;align-items:center;gap:14px;padding:0 16px;z-index:40;border-bottom:1px solid rgba(255,255,255,.06)}\n#lessonApp #ltop .brand{display:flex;align-items:center;gap:12px;min-width:0}\n#lessonApp #ltop .logo{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--teal),var(--navy));display:grid;place-items:center;flex:none}\n#lessonApp #ltop .t1{font-weight:800;font-size:19px;white-space:nowrap}\n#lessonApp #ltop .t2{font-size:12.5px;color:#9fc3cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#lessonApp #ltop .sp{flex:1}\n#lessonApp .prog{display:flex;align-items:center;gap:10px;font-size:13px;color:#bcd6de}\n#lessonApp .prog .bar{width:120px;height:6px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}\n#lessonApp .prog .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--green));transition:width .5s}\n#lessonApp .pts{background:rgba(193,180,137,.16);color:var(--gold);border:1px solid rgba(193,180,137,.35);border-radius:99px;padding:3px 12px;font-weight:800;font-size:13px;white-space:nowrap}\n#lessonApp .pts.pop{animation:la-pop .5s}\n@keyframes la-pop{50%{transform:scale(1.18)}}\n#lessonApp .tbtn{display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#e6f2f5;font-weight:700;font-size:14px;white-space:nowrap}\n#lessonApp .tbtn:hover{background:rgba(255,255,255,.12)}\n#lessonApp .tbtn svg{width:19px;height:19px;flex:none}\n#lessonApp #menuBtn{display:none}\n\n/* ── القائمة الجانبية ── */\n#lessonApp #lnav{position:fixed;top:var(--top);bottom:0;right:0;width:var(--side);background:var(--navy-d);color:#cfe2e8;overflow-y:auto;padding:16px 12px 80px;z-index:30;transition:transform .35s}\n#lessonApp #lnav .lbl{font-size:12px;letter-spacing:.3px;color:#7fa6b3;padding:4px 10px 8px;font-weight:700}\n#lessonApp #lnav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:11px;color:inherit;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:2px;cursor:pointer;position:relative}\n#lessonApp #lnav a .n{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:13px;font-weight:800;background:rgba(255,255,255,.06);color:#8fb6c2;flex:none}\n#lessonApp #lnav a:hover{background:rgba(255,255,255,.05)}\n#lessonApp #lnav a.on{background:rgba(13,169,166,.16);color:#fff}\n#lessonApp #lnav a.on .n{background:var(--teal);color:#fff}\n#lessonApp #lnav a.done .n{background:rgba(7,168,105,.25);color:#7ee0b4}\n#lessonApp #lnav a .pg{margin-inline-start:auto;font-size:11.5px;color:#6f95a2;font-weight:600}\n#lessonApp #lnav a.nafes{margin-top:10px;border:1px solid rgba(193,180,137,.3)}\n#lessonApp #lnav a.nafes .n{background:rgba(193,180,137,.2);color:var(--gold)}\n#lessonApp #lnav .foot{margin-top:22px;padding:12px;border-top:1px solid rgba(255,255,255,.07);font-size:12.5px;color:#7fa6b3}\n\n/* ── المحتوى ── */\n#lessonApp #lmain{position:fixed;top:var(--top);bottom:0;right:var(--side);left:0;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth}\n#lessonApp .wrap{max-width:1120px;margin:0 auto;padding:26px 28px 120px}\n#lessonApp .sec{display:none;animation:la-secIn .45s ease}\n#lessonApp .sec.active{display:block}\n@keyframes la-secIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\n#lessonApp .shead{display:flex;align-items:flex-end;gap:16px;margin-bottom:20px;flex-wrap:wrap}\n#lessonApp .shead .k{font-size:13px;font-weight:800;color:var(--teal);letter-spacing:.3px}\n#lessonApp .shead h2{font-size:32px;font-weight:800;color:var(--navy-d)}\n#lessonApp .shead p{margin:4px 0 0;color:var(--ink2);max-width:720px}\n#lessonApp .shead .sp{flex:1}\n#lessonApp .pchip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700;color:var(--navy);cursor:pointer}\n#lessonApp .pchip:hover{border-color:var(--teal);color:var(--teal)}\n#lessonApp .pchip svg{width:16px;height:16px}\n#lessonApp .grid{display:grid;gap:18px}\n#lessonApp .g2{grid-template-columns:1fr 1fr}\n#lessonApp .g3{grid-template-columns:repeat(3,1fr)}\n#lessonApp .g32{grid-template-columns:3fr 2fr}\n#lessonApp .g23{grid-template-columns:2fr 3fr}\n#lessonApp .card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;box-shadow:var(--sh);min-width:0}\n#lessonApp .card h3{font-size:19px;font-weight:800;color:var(--navy-d);margin-bottom:8px;display:flex;align-items:center;gap:8px}\n#lessonApp .card h3 .tag{margin-inline-start:auto}\n#lessonApp .card.dark{background:linear-gradient(160deg,#0f3446,#0a2533);color:#dbeaf0;border-color:#0f3446}\n#lessonApp .card.dark h3{color:#fff}\n#lessonApp .card.flat{box-shadow:none;background:var(--soft)}\n#lessonApp .mt{margin-top:18px}\n#lessonApp .mt2{margin-top:28px}\n#lessonApp .muted{color:var(--muted)}\n#lessonApp .small{font-size:14px}\n#lessonApp .lead{font-size:18.5px;color:var(--ink2)}\n#lessonApp .tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;border-radius:99px;padding:2px 10px;background:#e7f6f5;color:#08807d;white-space:nowrap}\n#lessonApp .tag.enrich{background:#f4efdc;color:#7a6a2c}\n#lessonApp .tag.lab{background:#e8f0f9;color:#2c5f96}\n#lessonApp .tag.q{background:#fdece8;color:#a8361f}\n#lessonApp .kw{color:var(--teal);font-weight:800}\n#lessonApp .term{font-weight:800;color:var(--navy);background:linear-gradient(transparent 62%,rgba(13,169,166,.18) 62%)}\n#lessonApp .verse{background:linear-gradient(135deg,#0d3345,#15445a);color:#fff;border-radius:var(--r);padding:20px 24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}\n#lessonApp .verse .ay{font-size:25px;line-height:2;font-weight:700;flex:1;min-width:240px}\n#lessonApp .verse .ay b{color:var(--gold);font-weight:700}\n#lessonApp .verse .src{font-size:13px;color:#a9cbd6}\n\n/* أزرار عامة */\n#lessonApp .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:11px;padding:9px 16px;font-weight:800;font-size:15px;background:var(--navy);color:#fff;transition:.15s}\n#lessonApp .btn:hover{filter:brightness(1.12)}\n#lessonApp .btn:active{transform:translateY(1px)}\n#lessonApp .btn.teal{background:var(--teal)}\n#lessonApp .btn.green{background:var(--green)}\n#lessonApp .btn.gold{background:var(--gold);color:#3b3313}\n#lessonApp .btn.ghost{background:#fff;color:var(--navy);border:1px solid var(--line)}\n#lessonApp .btn.ghost.on{background:var(--navy);color:#fff;border-color:var(--navy)}\n#lessonApp .btn.sm{padding:6px 12px;font-size:14px;border-radius:9px}\n#lessonApp .btn:disabled{opacity:.45;cursor:default}\n#lessonApp .seg{display:inline-flex;background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:4px;gap:4px;flex-wrap:wrap}\n#lessonApp .seg button{border:0;background:transparent;border-radius:9px;padding:7px 14px;font-weight:800;color:var(--ink2);font-size:14.5px}\n#lessonApp .seg button.on{background:var(--navy);color:#fff;box-shadow:0 2px 8px rgba(21,68,90,.25)}\n#lessonApp .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}\n#lessonApp .ctl{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0}\n#lessonApp .ctl label{font-weight:700;font-size:14.5px;color:var(--ink2);min-width:110px}\n#lessonApp .ctl output{font-weight:800;color:var(--navy);min-width:72px;font-size:15px}\n#lessonApp input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:9px;background:#d4e1e6;flex:1;min-width:140px;outline:none}\n#lessonApp input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--teal);border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.25);cursor:pointer}\n#lessonApp input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--teal);border:3px solid #fff}\n\n/* هيرو */\n#lessonApp .hero{position:relative;border-radius:22px;overflow:hidden;background:radial-gradient(ellipse 80% 120% at 85% 0%,#1c5a73 0%,#0b2a38 55%,#071c26 100%);color:#fff;padding:42px 40px 36px;min-height:330px}\n#lessonApp .hero canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.9}\n#lessonApp .hero .in{position:relative;max-width:640px}\n#lessonApp .hero .eyebrow{display:inline-flex;gap:8px;align-items:center;font-size:13px;font-weight:800;color:#8fe3e0;background:rgba(13,169,166,.14);border:1px solid rgba(13,169,166,.35);padding:4px 12px;border-radius:99px}\n#lessonApp .hero h1{font-size:58px;font-weight:800;margin:14px 0 6px;letter-spacing:-.5px}\n#lessonApp .hero .sub{font-size:19px;color:#c7dde5;max-width:560px}\n#lessonApp .hero .stats{display:flex;gap:26px;margin-top:22px;flex-wrap:wrap}\n#lessonApp .hero .stats div{border-inline-start:2px solid rgba(13,169,166,.6);padding-inline-start:12px}\n#lessonApp .hero .stats b{display:block;font-size:24px;font-weight:800;color:#fff}\n#lessonApp .hero .stats span{font-size:13px;color:#9fc3cf}\n#lessonApp .obj{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed var(--line)}\n#lessonApp .obj:last-child{border:0}\n#lessonApp .obj .v{flex:none;font-weight:800;color:#fff;background:var(--blue);border-radius:8px;padding:2px 10px;font-size:14px;margin-top:3px}\n#lessonApp .vgrid{display:flex;flex-wrap:wrap;gap:8px}\n#lessonApp .vchip{border:1px solid var(--line);background:var(--soft);border-radius:10px;padding:6px 12px;font-weight:700;font-size:15px;color:var(--navy)}\n#lessonApp .vchip:hover,#lessonApp .vchip.on{border-color:var(--teal);background:#e7f6f5}\n#lessonApp .vdef{margin-top:12px;padding:14px 16px;border-radius:12px;background:#0f3446;color:#e1eef2;min-height:64px;font-size:15.5px}\n#lessonApp .vdef b{color:#8fe3e0}\n#lessonApp .kwl{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}\n#lessonApp .kwl div{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:12px}\n#lessonApp .kwl h4{font-size:15px;color:var(--navy);margin-bottom:6px}\n#lessonApp .kwl textarea{width:100%;min-height:96px;border:1px solid var(--line);border-radius:10px;padding:8px 10px;resize:vertical;background:#fff;font-size:15px;line-height:1.6}\n\n/* لوحة محاكاة */\n#lessonApp .sim{background:#0a2230;border-radius:14px;overflow:hidden;position:relative}\n#lessonApp .sim canvas{display:block;width:100%;touch-action:none}\n#lessonApp .sim .hud{position:absolute;top:10px;right:10px;display:flex;gap:8px;flex-wrap:wrap;pointer-events:none}\n#lessonApp .sim .hud span{background:rgba(7,28,38,.75);border:1px solid rgba(255,255,255,.1);color:#dff;font-size:13px;font-weight:700;padding:4px 10px;border-radius:9px;backdrop-filter:blur(4px)}\n#lessonApp .sim .hud span b{color:#8fe3e0}\n#lessonApp .meter{height:10px;border-radius:9px;background:#e1eaee;overflow:hidden}\n#lessonApp .meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--red));transition:width .15s}\n#lessonApp .callout{border-radius:12px;padding:12px 14px;background:#e7f6f5;border:1px solid #bfe7e5;color:#0b4f4d;font-size:15.5px}\n#lessonApp .callout.warn{background:#fdf0ec;border-color:#f3c9bd;color:#8a2c1a}\n#lessonApp .callout.gold{background:#f8f4e6;border-color:#e6dcb8;color:#5e5223}\n#lessonApp .callout.ok{background:#e6f7ef;border-color:#b8e6cf;color:#0b5b3a}\n\n/* سؤال «ماذا قرأت؟» */\n#lessonApp .wq{border:1px solid var(--line);border-radius:12px;overflow:hidden}\n#lessonApp .wq .qq{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--soft);font-weight:700}\n#lessonApp .wq .qq .tag{flex:none}\n#lessonApp .wq .qq button{margin-inline-start:auto}\n#lessonApp .wq .aa{display:none;padding:12px 14px;border-top:1px solid var(--line);background:#fff}\n#lessonApp .wq.open .aa{display:block;animation:la-secIn .3s}\n\n/* الصدوع ثلاثي الأبعاد */\n#lessonApp #fault3d{position:relative;height:420px;background:radial-gradient(ellipse at 50% 30%,#1b4d63,#0a2230 70%);border-radius:14px;overflow:hidden}\n#lessonApp #fault3d canvas{display:block;width:100%;height:100%;touch-action:none}\n#lessonApp #fault3d .ov{position:absolute;inset:auto 10px 10px auto;display:flex;gap:6px}\n#lessonApp #fault3d .ov button{background:rgba(7,28,38,.75);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:5px 10px;font-weight:700;font-size:13px}\n#lessonApp #fault3d .lab3{position:absolute;pointer-events:none;background:rgba(7,28,38,.8);color:#fff;font-size:12.5px;font-weight:700;padding:3px 9px;border-radius:8px;white-space:nowrap;transform:translate(50%,-50%);border:1px solid rgba(255,255,255,.15)}\n#lessonApp #fault3d .lab3.force{background:rgba(200,64,44,.9)}\n#lessonApp #fault3d .note3{position:absolute;top:10px;left:10px;color:#a9cbd6;font-size:12px;font-weight:700;background:rgba(7,28,38,.6);padding:3px 9px;border-radius:8px}\n#lessonApp .fallback{padding:12px;color:#fff}\n\n/* تجربة التوفي */\n#lessonApp .toffee svg{width:100%;height:auto;display:block;background:var(--soft);border-radius:12px;border:1px solid var(--line)}\n\n/* سحب وإفلات */\n#lessonApp .dz{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}\n#lessonApp .bin{min-height:170px;border:2px dashed #c8d6dc;border-radius:14px;padding:10px;background:var(--soft);transition:.2s}\n#lessonApp .bin h4{font-size:15px;margin-bottom:8px;display:flex;align-items:center;gap:6px}\n#lessonApp .bin.over{border-color:var(--teal);background:#e7f6f5}\n#lessonApp .bin.do h4{color:var(--green)}\n#lessonApp .bin.dont h4{color:var(--red)}\n#lessonApp .pool{display:flex;flex-wrap:wrap;gap:8px;min-height:44px}\n#lessonApp .chip{background:#fff;border:1px solid var(--line);border-radius:10px;padding:7px 12px;font-size:14.5px;font-weight:600;cursor:grab;touch-action:none;user-select:none;box-shadow:0 1px 3px rgba(0,0,0,.05)}\n#lessonApp .chip.sel{outline:3px solid var(--teal)}\n#lessonApp .chip.ok{border-color:var(--green);background:#e6f7ef;cursor:default}\n#lessonApp .chip.bad{animation:la-shake .4s}\n#lessonApp .chip.drag{position:fixed;z-index:200;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.25);transform:rotate(-2deg)}\n@keyframes la-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}\n\n/* اختيار من متعدد */\n#lessonApp .qbox .qn{font-size:13px;font-weight:800;color:var(--muted)}\n#lessonApp .qbox .qt{font-size:20px;font-weight:800;margin:6px 0 14px;color:var(--navy-d)}\n#lessonApp .opts{display:grid;gap:10px}\n#lessonApp .opt{display:flex;align-items:center;gap:12px;text-align:start;border:1.5px solid var(--line);background:#fff;border-radius:12px;padding:11px 14px;font-weight:600;font-size:16px;transition:.15s}\n#lessonApp .opt:hover{border-color:var(--teal)}\n#lessonApp .opt .L{width:30px;height:30px;border-radius:8px;background:var(--soft);display:grid;place-items:center;font-weight:800;color:var(--navy);flex:none}\n#lessonApp .opt.ok{border-color:var(--green);background:#e6f7ef}\n#lessonApp .opt.ok .L{background:var(--green);color:#fff}\n#lessonApp .opt.no{border-color:var(--red);background:#fdf0ec}\n#lessonApp .opt.no .L{background:var(--red);color:#fff}\n#lessonApp .opt:disabled{cursor:default}\n#lessonApp .fb{margin-top:12px;display:none}\n#lessonApp .fb.show{display:block;animation:la-secIn .3s}\n#lessonApp .dots{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}\n#lessonApp .dots i{width:28px;height:6px;border-radius:9px;background:var(--line)}\n#lessonApp .dots i.ok{background:var(--green)}\n#lessonApp .dots i.no{background:var(--red)}\n#lessonApp .dots i.cur{background:var(--navy)}\n\n/* التوصيل */\n#lessonApp .match{display:grid;grid-template-columns:1fr 1.6fr;gap:10px 18px}\n#lessonApp .match .mi{border:1.5px solid var(--line);border-radius:11px;padding:9px 12px;background:#fff;font-weight:700;font-size:15px;text-align:start;transition:.15s}\n#lessonApp .match .mi.sel{border-color:var(--teal);background:#e7f6f5}\n#lessonApp .match .mi.done{border-color:var(--green);background:#e6f7ef;color:#0b5b3a;cursor:default}\n#lessonApp .match .mi.bad{animation:la-shake .4s;border-color:var(--red)}\n\n/* العجلة */\n#lessonApp .wheelBox{display:flex;gap:20px;align-items:center;flex-wrap:wrap}\n#lessonApp .wheelBox canvas{width:300px;height:300px;max-width:100%}\n#lessonApp .wheelQ{flex:1;min-width:220px;font-size:21px;font-weight:800;color:var(--navy-d);min-height:80px}\n\n/* الجدول */\n#lessonApp table.dt{width:100%;border-collapse:collapse;font-size:15px}\n#lessonApp table.dt th{background:var(--navy);color:#fff;font-weight:700;padding:8px;cursor:pointer;white-space:nowrap}\n#lessonApp table.dt th:first-child{border-radius:0 10px 0 0}\n#lessonApp table.dt th:last-child{border-radius:10px 0 0 0}\n#lessonApp table.dt td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:center}\n#lessonApp table.dt tr.hl td{background:#fff6d8}\n#lessonApp table.dt tr:hover td{background:#eef7f8}\n#lessonApp .chart{position:relative}\n#lessonApp .chart svg{width:100%;height:auto;display:block;overflow:visible}\n#lessonApp .tip{position:absolute;pointer-events:none;background:#0b2a38;color:#fff;font-size:13px;padding:6px 10px;border-radius:9px;white-space:nowrap;opacity:0;transition:opacity .12s;z-index:5;transform:translate(-50%,-115%)}\n#lessonApp .tip.show{opacity:1}\n\n/* رختر */\n#lessonApp .rcmp{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n#lessonApp .bigN{font-size:40px;font-weight:800;color:var(--navy-d);line-height:1.1}\n#lessonApp .bigN small{font-size:15px;color:var(--muted);font-weight:700}\n#lessonApp .merc{display:flex;gap:18px;align-items:center;flex-wrap:wrap}\n#lessonApp .merc .rn{font-size:64px;font-weight:800;color:var(--red);min-width:120px;text-align:center;font-family:Georgia,serif}\n#lessonApp .merc svg{width:150px;height:150px;flex:none}\n\n/* محاكاة المبنى */\n#lessonApp .flip{perspective:900px;height:150px;cursor:pointer}\n#lessonApp .flip .in{position:relative;width:100%;height:100%;transition:transform .6s;transform-style:preserve-3d}\n#lessonApp .flip.on .in{transform:rotateY(180deg)}\n#lessonApp .flip .f,#lessonApp .flip .b{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:center}\n#lessonApp .flip .f{background:linear-gradient(150deg,#15445a,#0b2a38);color:#fff;font-weight:800;font-size:17px}\n#lessonApp .flip .f small{font-weight:600;color:#9fc3cf;font-size:13px}\n#lessonApp .flip .b{background:#fff;border:1px solid var(--line);transform:rotateY(180deg);font-size:15px}\n\n/* اختبر نفسك */\n#lessonApp .st{border:1px solid var(--line);border-radius:14px;margin-bottom:10px;background:#fff;overflow:hidden}\n#lessonApp .st .h{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;cursor:pointer}\n#lessonApp .st .h .n{flex:none;width:28px;height:28px;border-radius:8px;background:var(--navy);color:#fff;display:grid;place-items:center;font-weight:800;font-size:14px}\n#lessonApp .st .h b{color:var(--blue)}\n#lessonApp .st .bd{display:none;padding:0 14px 14px}\n#lessonApp .st.open .bd{display:block}\n#lessonApp .st textarea{width:100%;min-height:70px;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:15px}\n#lessonApp .st .model{display:none;margin-top:10px}\n#lessonApp .st .model.show{display:block}\n\n/* نافس */\n#lessonApp .nf{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--sh)}\n#lessonApp .nf .nh{background:linear-gradient(90deg,#0b2a38,#15445a);color:#fff;padding:14px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}\n#lessonApp .nf .nh b{font-size:18px}\n#lessonApp .nf .nh .sp{flex:1}\n#lessonApp .nf .nh .tm{background:rgba(255,255,255,.1);border-radius:9px;padding:4px 12px;font-weight:800;font-size:15px}\n#lessonApp .nf .nb{padding:22px}\n#lessonApp .nf .grid10{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}\n#lessonApp .nf .grid10 button{width:36px;height:36px;border-radius:9px;border:1.5px solid var(--line);background:#fff;font-weight:800;color:var(--ink2)}\n#lessonApp .nf .grid10 button.cur{border-color:var(--navy);background:var(--navy);color:#fff}\n#lessonApp .nf .grid10 button.ans{background:#e7f0f8;border-color:#b9d0e6}\n#lessonApp .nf .grid10 button.flag{box-shadow:inset 0 -3px 0 var(--gold)}\n#lessonApp .nf .grid10 button.ok{background:#e6f7ef;border-color:var(--green);color:#0b5b3a}\n#lessonApp .nf .grid10 button.no{background:#fdf0ec;border-color:var(--red);color:#8a2c1a}\n#lessonApp .nf .lv{font-size:12.5px;font-weight:800;border-radius:7px;padding:2px 9px;background:#eef2f4;color:var(--ink2)}\n#lessonApp .nf .fig{margin:12px 0;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--soft)}\n#lessonApp .nf .nfoot{display:flex;gap:10px;justify-content:space-between;padding:14px 22px;border-top:1px solid var(--line);background:var(--soft);flex-wrap:wrap}\n#lessonApp .res{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}\n#lessonApp .res div{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center}\n#lessonApp .res b{display:block;font-size:26px;color:var(--navy-d)}\n\n/* أسفل */\n#lessonApp #lpager{position:fixed;bottom:0;left:0;right:var(--side);display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 22px;background:rgba(238,243,245,.88);backdrop-filter:blur(8px);border-top:1px solid var(--line);z-index:25}\n#lessonApp #lpager .btn{min-width:130px}\n#lessonApp #lpager .mid{font-size:13px;color:var(--muted);font-weight:700;text-align:center}\n#lessonApp .credit{font-size:12.5px;color:var(--muted)}\n\n/* نوافذ منبثقة */\n#lessonApp .ovl{position:fixed;inset:0;z-index:90;background:rgba(5,20,28,.72);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:16px}\n#lessonApp .ovl.show{display:flex;animation:la-fade .25s}\n@keyframes la-fade{from{opacity:0}}\n#lessonApp .panel{background:#fff;border-radius:18px;max-width:560px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}\n#lessonApp .panel .ph{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:2}\n#lessonApp .panel .ph b{font-size:18px}\n#lessonApp .panel .ph .x{margin-inline-start:auto;border:0;background:var(--soft);width:34px;height:34px;border-radius:9px;font-size:18px}\n#lessonApp .panel .pb{padding:16px 18px}\n\n/* عارض الكتاب */\n\n/* المساعد */\n#lessonApp #asstBtn{position:fixed;left:18px;bottom:76px;z-index:50;width:56px;height:56px;border-radius:16px;border:0;background:linear-gradient(135deg,var(--teal),var(--navy));color:#fff;box-shadow:0 8px 24px rgba(13,90,100,.4);display:grid;place-items:center}\n#lessonApp #asstBtn svg{width:26px;height:26px}\n#lessonApp #asst .msgs{display:flex;flex-direction:column;gap:10px;max-height:46vh;overflow:auto;padding-bottom:6px}\n#lessonApp #asst .m{padding:10px 13px;border-radius:13px;font-size:15.5px;max-width:92%}\n#lessonApp #asst .m.u{align-self:flex-start;background:var(--navy);color:#fff}\n#lessonApp #asst .m.b{align-self:flex-end;background:var(--soft);border:1px solid var(--line)}\n#lessonApp #asst .sugg{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}\n#lessonApp #asst .sugg button{border:1px solid var(--line);background:#fff;border-radius:99px;padding:4px 11px;font-size:13.5px;font-weight:700;color:var(--navy)}\n#lessonApp #asst form{display:flex;gap:8px}\n#lessonApp #asst input{flex:1;border:1px solid var(--line);border-radius:11px;padding:9px 12px}\n\n/* أدوات الفصل */\n#lessonApp .tools{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n#lessonApp .tools button.tl{border:1px solid var(--line);background:var(--soft);border-radius:14px;padding:14px;text-align:start;font-weight:800;color:var(--navy);display:flex;flex-direction:column;gap:4px}\n#lessonApp .tools button.tl small{font-weight:600;color:var(--muted);font-size:13px}\n#lessonApp #penLayer{position:fixed;inset:0;z-index:85;display:none;touch-action:none;cursor:crosshair}\n#lessonApp #penLayer.show{display:block}\n#lessonApp #penBar{position:fixed;top:76px;right:50%;transform:translateX(50%);z-index:86;display:none;gap:6px;background:#071c26;padding:6px;border-radius:12px}\n#lessonApp #penBar.show{display:flex}\n#lessonApp #penBar button{width:36px;height:36px;border-radius:9px;border:2px solid transparent;background:rgba(255,255,255,.08);color:#fff;font-weight:800}\n#lessonApp #penBar button.on{border-color:#fff}\n\n/* وضع العرض */\nbody.present #lessonApp{--side:0px}\nbody.present #lessonApp #lnav{transform:translateX(100%)}\nbody.present #lessonApp .wrap{max-width:1400px;zoom:1.14}\nbody.present #lessonApp #ltop{background:#05141c}\nbody.present #lessonApp #presentBtn{background:var(--teal);border-color:var(--teal)}\n\n/* الجوال */\n@media (max-width:1000px){\n#lessonApp{--side:0px}\n#lessonApp #lnav{width:285px;transform:translateX(100%);box-shadow:-10px 0 40px rgba(0,0,0,.3)}\nbody.navOpen #lessonApp #lnav{transform:none}\n#lessonApp #menuBtn{display:flex}\n#lessonApp .g2,#lessonApp .g3,#lessonApp .g32,#lessonApp .g23{grid-template-columns:1fr}\n#lessonApp .prog .bar{display:none}\n}\n@media (max-width:700px){\nbody #lessonApp{font-size:16px}\n#lessonApp{--top:58px}\n#lessonApp #ltop{padding:0 10px;gap:8px}\n#lessonApp #ltop .t2,#lessonApp .tbtn span,#lessonApp .prog span{display:none}\n#lessonApp #penBtn,#lessonApp #presentBtn,#lessonApp #gamesBtn,#lessonApp #ltop .pts{display:none}\n#lessonApp .tbtn{padding:0 10px}\n#lessonApp .wrap{padding:16px 14px 120px}\n#lessonApp .shead h2{font-size:26px}\n#lessonApp .hero{padding:28px 20px 26px}\n#lessonApp .hero h1{font-size:44px}\n#lessonApp .kwl{grid-template-columns:1fr}\n#lessonApp .dz{grid-template-columns:1fr}\n#lessonApp .match{grid-template-columns:1fr 1.3fr;gap:8px}\n#lessonApp .rcmp{grid-template-columns:1fr}\n#lessonApp #fault3d{height:340px}\n#lessonApp #lpager{padding:8px 10px}\n#lessonApp #lpager .btn{min-width:0;padding:9px 12px}\n#lessonApp #lpager .mid .credit{display:none}\n#lessonApp .res{grid-template-columns:1fr}\n#lessonApp .card{padding:15px}\n#lessonApp .verse .ay{font-size:21px}\n#lessonApp #asstBtn{bottom:70px;width:50px;height:50px}\n}\n@media print{\n#lessonApp #ltop,#lessonApp #lnav,#lessonApp #lpager,#lessonApp #asstBtn{display:none}\n#lessonApp #lmain{position:static}}\n\n#lessonApp .simhost{min-width:0}\n#lessonApp .simhost .xsim{margin:0}\n#lessonApp .bfig{margin:0 0 12px}\n#lessonApp .bfig .bimg{width:100%;border-radius:12px;border:1px solid var(--line);background-repeat:no-repeat;cursor:zoom-in;box-shadow:0 2px 10px rgba(10,40,55,.08)}\n#lessonApp .bfig figcaption{display:flex;align-items:center;gap:8px;justify-content:space-between;font-size:13px;color:var(--muted);margin-top:6px}\n#lessonApp .pchip.m3{background:linear-gradient(135deg,var(--teal),var(--navy));color:#fff;border-color:transparent}\n#lessonApp .olist{margin:0 0 10px;padding-inline-start:22px;font-weight:700;color:var(--navy-d)}\n#lessonApp .olist li{margin:4px 0}\n#lessonApp .g23{grid-template-columns:1.15fr 1fr}\n@media (max-width:1000px){#lessonApp .g23{grid-template-columns:1fr}}\n#lessonApp .gpool{min-height:44px}\n#lessonApp .dz.gdz{grid-template-columns:repeat(var(--n),minmax(0,1fr))}#lessonApp .gdz .bin{min-width:0}\n@media (max-width:700px){#lessonApp .dz.gdz{grid-template-columns:repeat(2,minmax(0,1fr))}}\n#lessonApp .pchip{white-space:nowrap;flex:none}\n#lessonApp .seg button{flex:none}\n@media (max-width:700px){#lessonApp .card h3{flex-wrap:wrap}#lessonApp .card h3 .tag{white-space:normal}}\n#laBack{position:fixed;left:50%;transform:translateX(-50%);top:calc(116px + env(safe-area-inset-top,0px));z-index:85;border:0;border-radius:999px;padding:10px 16px;font-weight:800;color:#fff;background:#0d8f8c;box-shadow:0 6px 20px rgba(0,0,0,.4);font-family:inherit}\n";
/* ═══════════ المحاكاة (١): الارتداد المرن، التوفي، الموجات، السيزموجراف، منحنى زمن الوصول، التثليث ═══════════ */

/* ── دوال منحنى زمن الوصول (رقمنة الشكل ٥) ── */
const TT = {
  at(arr, d) { const D_ = D.travel.d; if (d <= 0) return 0; if (d >= D_[D_.length - 1]) return arr[arr.length - 1]; const i = Math.floor(d / 100); const t = (d - D_[i]) / 100; return lerp(arr[i], arr[i + 1], t); },
  P(d) { return this.at(D.travel.P, d); }, S(d) { return this.at(D.travel.S, d); },
  lag(d) { return this.S(d) - this.P(d); },
  distFromLag(L) { let lo = 0, hi = 4900; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (this.lag(m) < L) lo = m; else hi = m; } return (lo + hi) / 2; }
};

/* ── مطابقة بالنقر (عامة) ── */
function makeMatch(el, pairs, key, onDone) {
  el.innerHTML = '';
  const L = pairs.map((p, i) => ({ t: p[0], i })), R = shuffle(pairs.map((p, i) => ({ t: p[1], i })));
  let sel = null, ok = 0;
  const colL = document.createElement('div'), colR = document.createElement('div');
  colL.style.cssText = colR.style.cssText = 'display:grid;gap:8px;align-content:start';
  const mk = (o, side) => { const b = document.createElement('button'); b.className = 'mi'; b.textContent = o.t; b.dataset.i = o.i; b.dataset.side = side; return b; };
  L.forEach(o => colL.appendChild(mk(o, 'L'))); R.forEach(o => colR.appendChild(mk(o, 'R')));
  el.append(colL, colR);
  el.addEventListener('click', e => {
    const b = e.target.closest('.mi'); if (!b || b.classList.contains('done')) return;
    if (!sel || sel.dataset.side === b.dataset.side) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return; }
    if (sel.dataset.i === b.dataset.i) {
      [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); }); ok++;
      if (ok === pairs.length) { award(key, 15); onDone && onDone(); }
    } else { [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.remove('bad'); void x.offsetWidth; x.classList.add('bad'); }); }
    sel = null;
  });
}

/* ── ١) الارتداد المرن ── */
function reboundInit() {
  const cv = $('#rbCv'), sl = $('#rbS');
  const R = { s: 0, B: 0, rupt: 0, waves: [], shake: 0, cracks: 0 };
  const TH = 0.85;
  sl.oninput = () => {
    R.s = sl.value / 100; $('#rbOut').textContent = AR(sl.value) + '٪';
    $('#rbE').style.width = (Math.pow(R.s / TH, 2) * 100).toFixed(0) + '%';
    $('#rbState').textContent = R.s < 0.35 ? 'تشوّه مرن بسيط' : R.s < TH ? 'تراكم الإجهاد… الصخر يتشوّه' : '';
    if (R.s >= TH) rupture();
  };
  function rupture() {
    R.B += R.s; R.rupt = 1; R.s = 0; sl.value = 0; $('#rbOut').textContent = '٠٪'; $('#rbE').style.width = '0%';
    $('#rbState').textContent = 'انكسار! تحرّرت الطاقة على صورة اهتزازات';
    R.waves.push(0); R.shake = 1; R.cracks++; award('rebound', 10);
  }
  $('#rbReset').onclick = () => { R.s = 0; R.B = 0; R.rupt = 0; R.waves = []; R.cracks = 0; sl.value = 0; sl.oninput(); $('#rbState').textContent = 'مستقر'; };
  loop(cv, (dt, T) => {
    const { ctx, w, h } = canvasFit(cv);
    const sh = R.shake > 0 ? (Math.random() - .5) * 8 * R.shake : 0; R.shake = Math.max(0, R.shake - dt * 1.2);
    R.rupt = Math.max(0, R.rupt - dt * 2.5);
    ctx.save(); ctx.translate(sh, sh * .6);
    // الأرض
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#c9b48a'); g.addColorStop(1, '#a8915f');
    ctx.fillStyle = g; ctx.fillRect(-10, -10, w + 20, h + 20);
    ctx.globalAlpha = .12; for (let i = 0; i < 70; i++) { ctx.fillStyle = i % 2 ? '#5a4a2a' : '#fff'; ctx.beginPath(); ctx.arc((i * 137.5) % w, (i * 71.3) % h, 1 + (i % 3), 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    const xc = w / 2, A = h * 0.16, Lw = w * 0.13, yR = h * 0.5;
    // الصدع
    ctx.strokeStyle = '#4a3218'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(xc, 0); ctx.lineTo(xc, h); ctx.stroke(); ctx.setLineDash([]);
    // الطريق
    const off = x => { const sg = Math.sign(x - xc) || 0; return R.B * A * sg * 0.5 + R.s * A * Math.tanh((x - xc) / Lw) * 0.5 * (1 / TH); };
    const yAt = x => yR - off(x);
    ctx.lineCap = 'butt';
    [[30, '#3b3f44'], [2.5, '#f5f1e6']].forEach(([lw, c], k) => {
      ctx.strokeStyle = c; ctx.lineWidth = lw; if (k) ctx.setLineDash([16, 12]);
      [[0, xc - 1], [xc + 1, w]].forEach(([a, b]) => { ctx.beginPath(); for (let x = a; x <= b; x += 4) { const y = yAt(x); x === a ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); });
      ctx.setLineDash([]);
    });
    // سياج
    ctx.strokeStyle = '#6b4a22'; ctx.lineWidth = 2;
    for (let x = 12; x < w; x += 26) { if (Math.abs(x - xc) < 6) continue; const y = yAt(x) - h * .26; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x, y + 7); ctx.stroke(); }
    [[0, xc - 1], [xc + 1, w]].forEach(([a, b]) => { ctx.beginPath(); for (let x = a; x <= b; x += 4) { const y = yAt(x) - h * .26; x === a ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); });
    // أسهم الحركة النسبية
    const arr = (x, y, d) => { ctx.fillStyle = 'rgba(200,64,44,.9)'; ctx.beginPath(); ctx.moveTo(x, y + d * 22); ctx.lineTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - 3, y - d * 20, 6, d * 20); };
    arr(w * .12, h * .2, -1); arr(w * .88, h * .2, 1);
    ctx.font = '700 13px Tajawal'; ctx.fillStyle = '#3a2a14'; ctx.textAlign = 'center';
    ctx.fillText('الصدع', xc, 16);
    // موجات
    R.waves = R.waves.map(r => r + dt * w * .45).filter(r => r < w);
    R.waves.forEach(r => { for (let k = 0; k < 3; k++) { const rr = r - k * 26; if (rr <= 0) continue; ctx.strokeStyle = 'rgba(200,64,44,' + (0.7 * (1 - r / w)) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(xc, yR, rr, 0, 7); ctx.stroke(); } });
    if (R.rupt > 0) { ctx.fillStyle = 'rgba(255,240,200,' + R.rupt * .6 + ')'; ctx.beginPath(); ctx.arc(xc, yR, 30, 0, 7); ctx.fill(); }
    ctx.restore();
  });
  sl.oninput();
  $('#rbState').textContent = 'مستقر';
}

/* ── ٢) تجربة ملاحظة التشوه (التوفي) ── */
function toffeeInit() {
  const svg = $('#tfSvg'); let anim = null;
  const notes = {
    bend: 'عند الثني تتغيّر هيئة القطعة (تشوّه)، وإذا استمرّ الثني تتشقّق وتنكسر — كما يحدث للغصن الجاف في الشكل ١.',
    push: 'دفع الطرفين إلى الداخل = <b>قوى ضغط</b>: تقصر القطعة وتنتفخ وتتجعّد. في الصخور تُكوّن قوى الضغط <b>الصدع العكسي</b>.',
    pull: 'سحب الطرفين إلى الخارج = <b>قوى شدّ</b>: تستطيل القطعة وترقّ في وسطها ثم تنفصل. في الصخور تُكوّن قوى الشدّ <b>الصدع العادي</b>.',
    shear: 'تحريك النصفين أفقيًّا في اتجاهين متعاكسين = <b>قوى قصّ</b>: ينزلق النصفان بعضهما بجانب بعض، كما في <b>الصدع الانزلاقي</b>.'
  };
  function draw(type, t) {
    const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    let body = '', arrows = '';
    const defs = '<defs><linearGradient id="tfG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3a65a"/><stop offset=".5" stop-color="#c47a31"/><stop offset="1" stop-color="#8a4f1c"/></linearGradient><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#c8402c"/></marker></defs>';
    const ar = (x1, y1, x2, y2) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#c8402c" stroke-width="5" marker-end="url(#ah)"/>';
    if (type === 'bend') {
      const k = e * 70; body = '<path d="M120 ' + (95 + k * .2) + ' Q300 ' + (95 - k) + ' 480 ' + (95 + k * .2) + ' L480 ' + (135 + k * .2) + ' Q300 ' + (135 - k) + ' 120 ' + (135 + k * .2) + 'Z" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/>';
      if (e > .85) body += '<path d="M296 ' + (98 - k * .5) + ' l6 12 -5 9 6 12" stroke="#3a1e08" stroke-width="2.5" fill="none"/>';
      arrows = ar(120, 190, 140, 150) + ar(480, 190, 460, 150) + ar(300, 30, 300, 60 - k * .3);
    } else if (type === 'push') {
      const L = 360 - e * 110, H = 40 + e * 26, x0 = 300 - L / 2; let wav = '';
      for (let i = 0; i <= 12; i++) { const x = x0 + L * i / 12; wav += (i ? ' L' : 'M') + x + ' ' + (115 - H / 2 - (e * 6 * Math.sin(i * 1.7))); }
      for (let i = 12; i >= 0; i--) { const x = x0 + L * i / 12; wav += ' L' + x + ' ' + (115 + H / 2 + (e * 6 * Math.sin(i * 1.3))); }
      body = '<path d="' + wav + 'Z" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/>';
      arrows = ar(x0 - 70, 115, x0 - 12, 115) + ar(x0 + L + 70, 115, x0 + L + 12, 115);
    } else if (type === 'pull') {
      const L = 360 + e * 90, x0 = 300 - L / 2, neck = 20 - e * 16, gap = e > .8 ? (e - .8) * 140 : 0;
      const left = '<path d="M' + (x0 - gap / 2) + ' 95 Q' + (300 - gap / 2 - 40) + ' 95 ' + (300 - gap / 2) + ' ' + (115 - neck) + ' L' + (300 - gap / 2) + ' ' + (115 + neck) + ' Q' + (300 - gap / 2 - 40) + ' 135 ' + (x0 - gap / 2) + ' 135Z" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/>';
      const right = '<path d="M' + (x0 + L + gap / 2) + ' 95 Q' + (300 + gap / 2 + 40) + ' 95 ' + (300 + gap / 2) + ' ' + (115 - neck) + ' L' + (300 + gap / 2) + ' ' + (115 + neck) + ' Q' + (300 + gap / 2 + 40) + ' 135 ' + (x0 + L + gap / 2) + ' 135Z" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/>';
      body = left + right;
      arrows = ar(x0 - gap / 2 + 4, 175, x0 - gap / 2 - 60, 175) + ar(x0 + L + gap / 2 - 4, 175, x0 + L + gap / 2 + 60, 175);
    } else {
      const d = e * 34;
      body = '<rect x="120" y="' + (95 - d) + '" width="180" height="40" rx="6" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/><rect x="300" y="' + (95 + d) + '" width="180" height="40" rx="6" fill="url(#tfG)" stroke="#6b3a12" stroke-width="2"/>';
      body += '<line x1="300" y1="40" x2="300" y2="190" stroke="#15445a" stroke-width="1.5" stroke-dasharray="5 4"/>';
      arrows = ar(210, 70 - d, 140, 70 - d) + ar(390, 170 + d, 460, 170 + d);
    }
    svg.innerHTML = defs + '<text x="300" y="214" text-anchor="middle" font-size="13" fill="#6b8290" font-family="Tajawal">' + ({ bend: 'ثني', push: 'ضغط', pull: 'شدّ', shear: 'قصّ' })[type] + '</text>' + body + arrows;
  }
  draw('bend', 0);
  $$('#tfSeg button').forEach(b => b.onclick = () => {
    $$('#tfSeg button').forEach(x => x.classList.toggle('on', x === b)); const t = b.dataset.t;
    $('#tfNote').innerHTML = notes[t]; cancelAnimationFrame(anim); const t0 = performance.now();
    const step = n => { const p = Math.min(1, (n - t0) / 1400); draw(t, p); if (p < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
    S.tf = S.tf || {}; S.tf[t] = 1; if (Object.keys(S.tf).length >= 3) award('toffee', 10);
  });
  makeMatch($('#fMatch'), [['قوى الشدّ', 'الصدع العادي'], ['قوى الضغط', 'الصدع العكسي'], ['قوى القصّ', 'الصدع الانزلاقي']], 'fmatch');
}

/* ── ٣) البؤرة والمركز السطحي ── */
function focusInit() {
  const cv = $('#fcCv'); const F = { fx: .46, fy: .72, t: -1 };
  const surfY = h => h * .3;
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (y * r.height < surfY(r.height) + 18) return; F.fx = clamp(x, .08, .92); F.fy = clamp(y, .42, .94); F.t = -1; upd();
  });
  function upd() { $('#fcDepth').textContent = F.fy < .55 ? 'ضحلة' : F.fy < .75 ? 'متوسطة' : 'عميقة'; }
  upd();
  $('#fcGo').onclick = () => { F.t = 0; award('focus', 5); };
  const terrain = (x, w) => Math.sin(x / w * 9) * 6 + Math.sin(x / w * 23 + 1) * 3 - Math.max(0, 40 - Math.abs(x - w * .2) * .4) - Math.max(0, 26 - Math.abs(x - w * .8) * .35);
  loop(cv, dt => {
    const { ctx, w, h } = canvasFit(cv); const sy = surfY(h);
    if (F.t >= 0) F.t += dt;
    const ex = F.fx * w, ey = F.fy * h;
    // السماء
    let g = ctx.createLinearGradient(0, 0, 0, sy); g.addColorStop(0, '#5f9cc4'); g.addColorStop(1, '#bfdcea'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, sy + 40);
    // باطن الأرض
    g = ctx.createLinearGradient(0, sy, 0, h); g.addColorStop(0, '#d8a24a'); g.addColorStop(.4, '#e7b552'); g.addColorStop(1, '#f2c768');
    const surfAt = x => { let y = sy + terrain(x, w); if (F.t > 0) { const v = w * .16, d = Math.abs(x - ex), tt = F.t - (ey - sy) / (w * .5); if (tt > 0) { const front = tt * v; const k = d - front; y += Math.exp(-k * k / 1600) * 9 * Math.sin(k / 9) * ($('#fcL').checked ? 1 : 0) * Math.exp(-tt * .15); } } return y; };
    ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += 3) ctx.lineTo(x, surfAt(x)); ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    // طبقات
    ctx.globalAlpha = .18; for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#8a5a1a' : '#fff3c4'; ctx.fillRect(0, sy + 20 + i * (h - sy) / 5, w, 6); } ctx.globalAlpha = 1;
    // الصدع
    ctx.strokeStyle = '#7a4420'; ctx.lineWidth = 16; ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(ex - (ey - sy) * .35, sy - 10); ctx.lineTo(ex + (h - ey) * .35, h + 10); ctx.stroke(); ctx.globalAlpha = 1;
    // موجات P و S
    if (F.t > 0) {
      const sp = w * .5;
      [['fcP', 1, COL.Pl], ['fcS', .6, COL.Sl]].forEach(([id, k, c]) => {
        if (!$('#' + id).checked) return;
        for (let j = 0; j < 4; j++) { const r = (F.t - j * .25) * sp * k; if (r <= 0) continue; ctx.strokeStyle = c; ctx.globalAlpha = Math.max(0, .9 - r / (w * 1.1)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, r, 0, 7); ctx.stroke(); }
      });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.strokeStyle = '#4d7a2a'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x <= w; x += 3) { const y = surfAt(x); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    // خط عمودي من البؤرة إلى السطح
    const sxy = surfAt(ex);
    ctx.setLineDash([5, 5]); ctx.strokeStyle = '#15445a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex, sxy); ctx.stroke(); ctx.setLineDash([]);
    // البؤرة
    const pulse = 1 + Math.sin(performance.now() / 200) * .15;
    let rg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 18 * pulse); rg.addColorStop(0, '#fffbe0'); rg.addColorStop(.4, '#ffd23a'); rg.addColorStop(1, 'rgba(255,160,0,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ex, ey, 18 * pulse, 0, 7); ctx.fill();
    // المركز السطحي
    ctx.fillStyle = COL.red; ctx.beginPath(); ctx.moveTo(ex, sxy - 2); ctx.lineTo(ex - 8, sxy - 16); ctx.lineTo(ex + 8, sxy - 16); ctx.closePath(); ctx.fill();
    ctx.font = '800 14px Tajawal'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
    const lab = (t, x, y, bg) => { const m = ctx.measureText(t).width + 14; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - m / 2, y - 13, m, 24, 7) : ctx.rect(x - m / 2, y - 13, m, 24); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(t, x, y + 4); };
    lab('المركز السطحي', clamp(ex, 60, w - 60), sxy - 30, 'rgba(200,64,44,.92)');
    lab('بؤرة الزلزال', clamp(ex, 60, w - 60), Math.min(h - 16, ey + 32), 'rgba(21,68,90,.92)');
    if (F.t < 0) { ctx.fillStyle = 'rgba(7,28,38,.7)'; ctx.font = '700 13px Tajawal'; ctx.fillText('انقر في أيّ مكان تحت السطح لنقل البؤرة', w / 2, h - 12); }
    if (F.t > 0 && F.t < 3.5) {
      ctx.textAlign = 'right'; ctx.font = '700 12.5px Tajawal';
      [['P أولية', COL.P, 'fcP'], ['S ثانوية', COL.S, 'fcS'], ['سطحية', '#4d7a2a', 'fcL']].forEach(([t, c, id], i) => { if (!$('#' + id).checked) return; ctx.fillStyle = c; ctx.fillRect(w - 18, 12 + i * 20, 10, 10); ctx.fillStyle = '#0b2a38'; ctx.fillText(t, w - 24, 21 + i * 20); });
    }
  });
}

/* ── ٤) مختبر حركة الجزيئات + سباق ── */
function wavesInit() {
  const cv = $('#wvCv'); let mode = 'P', t = 0, race = null;
  const info = () => {
    if (mode === 'race') { $('#wvInfo').innerHTML = '<div class="card flat" style="grid-column:1/-1"><b>سباق الوصول:</b> تنطلق الموجات الثلاث من البؤرة معًا. الموجات P الأسرع فتصل أولًا، ثم S، ثم الموجات السطحية الأبطأ — وهي الأكثر تدميرًا. <span class="small muted">(السرعات في السباق نسبية توضيحية)</span></div>'; return; }
    const w = D.waves.find(x => x.id === mode);
    $('#wvInfo').innerHTML = '<div class="card flat"><div class="small muted">النوع</div><b>' + w.type + '</b></div><div class="card flat"><div class="small muted">السرعة</div><b>' + w.speed + '</b></div><div class="card flat"><div class="small muted">مسار الانتقال</div><b>' + w.where + '</b></div><div class="card flat" style="grid-column:1/-1">' + w.motion + '</div>';
  };
  $$('#wvSeg button').forEach(b => b.onclick = () => { $$('#wvSeg button').forEach(x => x.classList.toggle('on', x === b)); mode = b.dataset.w; t = 0; race = mode === 'race' ? 0 : null; info(); S.wv = S.wv || {}; S.wv[mode] = 1; if (Object.keys(S.wv).length >= 4) award('waves', 10); });
  info();
  loop(cv, dt => {
    const { ctx, w, h } = canvasFit(cv); t += dt;
    ctx.fillStyle = '#0a2230'; ctx.fillRect(0, 0, w, h);
    ctx.direction = 'rtl'; ctx.font = '700 13px Tajawal'; ctx.textAlign = 'center';
    if (mode !== 'race') {
      const cols = Math.max(18, Math.floor(w / 26)), rows = 7, gx = w / (cols + 1), gy = (h - 70) / (rows + 1), A = Math.min(gx * .55, 14), k = 2 * Math.PI / (gx * 8), om = 2.6;
      const top = mode === 'L' ? 36 : 30;
      if (mode === 'L') { ctx.fillStyle = 'rgba(143,200,255,.08)'; ctx.fillRect(0, 0, w, top + 4); ctx.strokeStyle = '#4d7a2a'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= cols + 1; i++) { const x0 = i * gx; const ph = k * x0 + om * t; const y = top + 4 + A * Math.sin(ph); i ? ctx.lineTo(x0 - A * Math.cos(ph) * .6, y) : ctx.moveTo(x0, y); } ctx.stroke(); }
      for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) {
        const x0 = c * gx, y0 = top + r * gy; const ph = k * x0 + om * t; let dx = 0, dy = 0;
        if (mode === 'P') dx = A * Math.sin(ph);
        else if (mode === 'S') dy = A * Math.sin(ph);
        else { const dec = Math.exp(-(r - 1) * .38); dx = -A * .6 * Math.cos(ph) * dec; dy = A * Math.sin(ph) * dec; }
        const hl = c === Math.floor(cols / 2) && r === 3;
        ctx.fillStyle = hl ? COL.red : (mode === 'P' ? COL.Pl : mode === 'S' ? COL.Sl : '#9bd08a');
        ctx.beginPath(); ctx.arc(x0 + dx, y0 + dy, hl ? 6 : 4, 0, 7); ctx.fill();
        if (hl) { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.beginPath();
          if (mode === 'P') { ctx.moveTo(x0 - A, y0); ctx.lineTo(x0 + A, y0); } else if (mode === 'S') { ctx.moveTo(x0, y0 - A); ctx.lineTo(x0, y0 + A); } else { const dec = Math.exp(-(r - 1) * .38); ctx.ellipse(x0, y0, A * .6 * dec, A * dec, 0, 0, 7); }
          ctx.stroke(); }
      }
      // سهم اتجاه الموجة (من اليمين لليسار)
      const ay = h - 22; ctx.strokeStyle = '#8fe3e0'; ctx.fillStyle = '#8fe3e0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(w * .72, ay); ctx.lineTo(w * .28, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * .28 - 2, ay); ctx.lineTo(w * .28 + 12, ay - 7); ctx.lineTo(w * .28 + 12, ay + 7); ctx.fill();
      ctx.fillStyle = '#cfe'; ctx.fillText('اتجاه انتقال الموجة', w / 2, ay - 8);
      ctx.fillStyle = '#ffb4a6'; ctx.textAlign = 'right'; ctx.fillText('● جزيء مُتتبَّع: ' + (mode === 'P' ? 'يهتزّ أمامًا وخلفًا في اتجاه الموجة' : mode === 'S' ? 'يهتزّ عموديًّا على اتجاه الموجة' : 'يتحرّك حركة معقدة (إلى أعلى وأسفل وجانبيًّا)'), w - 10, 18);
    } else {
      race += dt; const x0 = w - 50, x1 = 60, L = x0 - x1; const sp = [['P', 1, COL.Pl, 'الأولية P'], ['S', .58, COL.Sl, 'الثانوية S'], ['L', .45, '#9bd08a', 'السطحية']];
      ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(x0 + 20, h / 2, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText('البؤرة', x0 + 20, h / 2 + 28);
      ctx.fillStyle = '#c8402c'; ctx.fillRect(x1 - 26, h / 2 - 60, 8, 120); ctx.fillStyle = '#fff'; ctx.fillText('المحطة', x1 - 22, h / 2 + 80);
      const T = 5.5; // ثوانٍ لعبور P
      sp.forEach(([id, v, c, n], i) => {
        const y = 50 + i * ((h - 90) / 2); const p = Math.min(1, race / (T / v)); const x = x0 - p * L;
        ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.strokeStyle = c; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText(n + (p >= 1 ? '  ✓ وصلت (' + AR(i + 1) + ')' : ''), x0 + 4, y - 16); ctx.textAlign = 'center';
      });
      if (race > T / .45 + 1.5) race = 0;
    }
  });
}

/* ── ٥) السيزموجراف ── */
function seismoInit() {
  const cv = $('#smCv'); const Q = { run: false, t: 0, M: 6, d: 4000, hist: [], frame: 0, shown: 0 };
  const upd = () => { $('#smMo').textContent = fx(+$('#smM').value); $('#smDo').textContent = fmtInt(+$('#smD').value) + ' كم'; };
  $('#smM').oninput = $('#smD').oninput = upd; upd();
  const SPM = 2; // ثانية حقيقية لكل… (دقيقة محاكاة = 0.5 ث)
  $('#smGo').onclick = () => { Q.M = +$('#smM').value; Q.d = +$('#smD').value; Q.run = true; Q.t = 0; Q.hist = []; Q.shown = 0; ['#smP', '#smS', '#smL'].forEach(s => $(s).textContent = '—'); };
  function sig(t) {
    const tp = TT.P(Q.d), ts = TT.S(Q.d), tl = ts + (ts - tp) * .5, A = clamp(5 * Math.pow(1.75, Q.M - 4), 3, 95), dur = .6 + (Q.M - 3) * .35;
    let y = (Math.random() - .5) * 1.2;
    if (t > tp) { const u = t - tp; y += A * .32 * Math.exp(-u / (dur * .8)) * Math.sin(2 * Math.PI * u * 7.5) * (0.6 + .4 * Math.random()); }
    if (t > ts) { const u = t - ts; y += A * .62 * Math.exp(-u / dur) * Math.sin(2 * Math.PI * u * 4.6 + 1) * (0.7 + .3 * Math.random()); }
    if (t > tl) { const u = t - tl; y += A * Math.min(1, u * 3) * Math.exp(-u / (dur * 1.5)) * Math.sin(2 * Math.PI * u * 2.2); }
    return clamp(y, -110, 110);
  }
  loop(cv, dt => {
    const { ctx, w, h } = canvasFit(cv);
    const penX = w * .74, ppm = (penX - 24) / 16, cy = h * .56;
    if (Q.run) {
      const prevT = Q.t; Q.t += dt * SPM;
      for (let tt = prevT; tt < Q.t; tt += 1 / ppm / 2) Q.hist.push([tt, sig(tt)]);
      const tp = TT.P(Q.d), ts = TT.S(Q.d);
      if (Q.t > tp && Q.shown < 1) { Q.shown = 1; $('#smP').textContent = fx(tp) + ' د'; }
      if (Q.t > ts && Q.shown < 2) { Q.shown = 2; $('#smS').textContent = fx(ts) + ' د'; $('#smL').textContent = fx(ts - tp) + ' د'; award('seismo', 10); }
      if (Q.t > 16.5) Q.run = false;
    }
    const last = Q.hist.length ? Q.hist[Q.hist.length - 1][1] : 0;
    // الإطار والأسطوانة
    ctx.fillStyle = '#0a2230'; ctx.fillRect(0, 0, w, h);
    const shake = Q.run ? last * .12 : 0;
    ctx.save(); ctx.translate(0, shake);
    // الورقة
    const pg = ctx.createLinearGradient(0, cy - h * .36, 0, cy + h * .36); pg.addColorStop(0, '#cfd8dc'); pg.addColorStop(.15, '#f7f9fa'); pg.addColorStop(.85, '#f7f9fa'); pg.addColorStop(1, '#cfd8dc');
    ctx.fillStyle = pg; ctx.fillRect(16, cy - h * .36, penX - 12, h * .72);
    ctx.strokeStyle = 'rgba(21,68,90,.08)'; ctx.lineWidth = 1;
    for (let m = 0; m <= 16; m++) { const x = penX - m * ppm; ctx.beginPath(); ctx.moveTo(x, cy - h * .36); ctx.lineTo(x, cy + h * .36); ctx.stroke(); }
    ctx.fillStyle = '#6b8290'; ctx.font = '600 10.5px Tajawal'; ctx.textAlign = 'center';
    // الأثر: يتحرك الورق يسارًا؛ القلم ثابت
    ctx.strokeStyle = '#13212a'; ctx.lineWidth = 1.3; ctx.beginPath();
    Q.hist.forEach(([tt, y], i) => { const x = penX - (Q.t - tt) * ppm; if (x < 16) return; i ? ctx.lineTo(x, cy - y) : ctx.moveTo(x, cy - y); });
    ctx.stroke();
    // علامات الوصول
    if (Q.hist.length) [[TT.P(Q.d), 'P', COL.P], [TT.S(Q.d), 'S', COL.S]].forEach(([ta, l, c]) => { if (Q.t < ta) return; const x = penX - (Q.t - ta) * ppm; if (x < 16) return; ctx.strokeStyle = c; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x, cy - h * .33); ctx.lineTo(x, cy + h * .33); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = c; ctx.font = '800 13px Tajawal'; ctx.fillText(l, x, cy - h * .36 + 16); });
    ctx.restore();
    // البندول والقلم (ثابتان)
    ctx.strokeStyle = '#9fb7c1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(penX + 70, 10); ctx.lineTo(penX + 70, h - 10); ctx.moveTo(penX + 70, 16); ctx.lineTo(w - 6, 16); ctx.stroke();
    ctx.strokeStyle = '#d7e3e8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(penX + 70, 40); ctx.lineTo(penX + 26, cy); ctx.lineTo(penX, cy); ctx.stroke();
    const mg = ctx.createRadialGradient(penX + 30, cy - 6, 2, penX + 34, cy, 22); mg.addColorStop(0, '#f2f6f8'); mg.addColorStop(1, '#5d7380');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(penX + 36, cy, 18, 0, 7); ctx.fill();
    ctx.fillStyle = COL.red; ctx.beginPath(); ctx.moveTo(penX - 1, cy); ctx.lineTo(penX + 10, cy - 4); ctx.lineTo(penX + 10, cy + 4); ctx.fill();
    ctx.fillStyle = '#cfe'; ctx.font = '700 12px Tajawal'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
    ctx.font = '700 11.5px Tajawal'; ctx.fillText('كتلة البندول', (penX + 70 + w) / 2 + 4, cy + 34); ctx.fillText('تبقى ثابتة', (penX + 70 + w) / 2 + 4, cy + 50); ctx.font = '700 12px Tajawal';
    ctx.fillText('الإطار والأسطوانة يهتزّان مع الأرض', w * .36, cy + h * .36 + 18);
    ctx.fillStyle = '#9fc3cf'; ctx.fillText('الورق يتحرّك مع الأسطوانة ←', w * .36, cy - h * .36 - 8);
  });
}

/* ── ٦) منحنى زمن الوصول التفاعلي ── */
function ttInit() {
  const box = $('#ttBox'); const W = 560, H = 400, m = { l: 48, r: 14, t: 14, b: 44 };
  const X = d => m.l + d / 5000 * (W - m.l - m.r), Y = t => H - m.b - t / 16 * (H - m.t - m.b);
  const pth = arr => D.travel.d.map((d, i) => (i ? 'L' : 'M') + X(d).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join(' ');
  let g = '';
  for (let t = 0; t <= 16; t += 2) g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="#e3ebef"/><text x="' + (m.l - 8) + '" y="' + (Y(t) + 4) + '" font-size="12" text-anchor="end" fill="#6b8290">' + AR(t) + '</text>';
  for (let d = 0; d <= 5000; d += 1000) g += '<line y1="' + m.t + '" y2="' + (H - m.b) + '" x1="' + X(d) + '" x2="' + X(d) + '" stroke="#e3ebef"/><text x="' + X(d) + '" y="' + (H - m.b + 18) + '" font-size="12" text-anchor="middle" fill="#6b8290">' + fmtInt(d) + '</text>';
  box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="touch-action:none;cursor:ew-resize" font-family="Tajawal">' + g +
    '<text x="' + ((W + m.l) / 2) + '" y="' + (H - 6) + '" font-size="13" text-anchor="middle" fill="#3c5563" font-weight="700">البعد عن المركز السطحي للزلزال (كم)</text>' +
    '<text transform="translate(14 ' + (H / 2) + ') rotate(-90)" font-size="13" text-anchor="middle" fill="#3c5563" font-weight="700">زمن الوصول (دقيقة)</text>' +
    '<path d="' + pth(D.travel.S) + '" stroke="' + COL.S + '" stroke-width="2.5" fill="none"/><path d="' + pth(D.travel.P) + '" stroke="' + COL.P + '" stroke-width="2.5" fill="none"/>' +
    '<text x="' + X(1350) + '" y="' + Y(7.6) + '" font-size="13" font-weight="800" fill="' + COL.S + '">منحنى S</text><text x="' + X(2500) + '" y="' + Y(4.0) + '" font-size="13" font-weight="800" fill="' + COL.P + '">منحنى P</text>' +
    '<g id="ttCur"><line id="ttV" stroke="#15445a" stroke-width="1.5" stroke-dasharray="4 3"/><line id="ttBr" stroke="#0da9a6" stroke-width="3"/><circle id="ttPp" r="6" fill="' + COL.P + '" stroke="#fff" stroke-width="2"/><circle id="ttSp" r="6" fill="' + COL.S + '" stroke="#fff" stroke-width="2"/>' +
    '<rect id="ttLb" rx="6" fill="#0b2a38"/><text id="ttLt" font-size="12.5" fill="#fff" font-weight="700" text-anchor="middle"></text><rect id="ttHandle" width="26" height="26" rx="8" fill="#15445a"/></g></svg>';
  const svg = box.querySelector('svg'); let D0 = 4000, mode = 'd';
  function set(d) {
    D0 = clamp(Math.round(d / 50) * 50, 100, 4900); const p = TT.P(D0), s = TT.S(D0), x = X(D0);
    const at = (id, a) => Object.entries(a).forEach(([k, v]) => svg.querySelector('#' + id).setAttribute(k, v));
    at('ttV', { x1: x, x2: x, y1: m.t, y2: H - m.b }); at('ttPp', { cx: x, cy: Y(p) }); at('ttSp', { cx: x, cy: Y(s) });
    const bx = x + (D0 > 3600 ? -16 : 16); at('ttBr', { x1: bx, x2: bx, y1: Y(p), y2: Y(s) });
    const lt = svg.querySelector('#ttLt'); lt.textContent = 'الفرق ' + fx(s - p) + ' د'; const lx = bx + (D0 > 3600 ? -48 : 48), ly = (Y(p) + Y(s)) / 2 + 4; at('ttLt', { x: lx, y: ly }); at('ttLb', { x: lx - 44, y: ly - 16, width: 88, height: 24 });
    at('ttHandle', { x: x - 13, y: H - m.b - 13 });
    $('#ttRead').innerHTML = 'عند بعد <b>' + fmtInt(D0) + ' كم</b>: تصل الموجة P بعد <b>' + fx(p) + '</b> دقيقة، وتصل S بعد <b>' + fx(s) + '</b> دقيقة، فيكون الفرق <b>' + fx(s - p) + '</b> دقيقة.';
  }
  const toD = e => { const r = svg.getBoundingClientRect(); const sx = (e.clientX - r.left) / r.width * W; return (sx - m.l) / (W - m.l - m.r) * 5000; };
  let drag = false;
  svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); set(toD(e)); award('tt', 5); });
  svg.addEventListener('pointermove', e => { if (drag) set(toD(e)); });
  svg.addEventListener('pointerup', () => drag = false);
  $$('#ttSeg button').forEach(b => b.onclick = () => { $$('#ttSeg button').forEach(x => x.classList.toggle('on', x === b)); mode = b.dataset.m; $('#ttLagCtl').style.display = mode === 'l' ? 'inline-flex' : 'none'; if (mode === 'l') $('#ttLag').oninput(); });
  $('#ttLag').oninput = () => { const L = +$('#ttLag').value; $('#ttLagO').textContent = fx(L) + ' د'; set(TT.distFromLag(L)); };
  set(4000);
}

/* ── ٧) مهمة التثليث ── */
function triInit() {
  const ST = [{ n: 'طوكيو', x: 0, y: 0 }, { n: 'أنكوريج', x: 5378, y: -1411 }, { n: 'بيركلي', x: 8250, y: 0 }];
  const svg = $('#triSvg'); let E = null, help = false;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const hms = s => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return AR(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')); };
  function newQuake() {
    for (let k = 0; k < 500; k++) { const p = { x: 3300 + Math.random() * 1900, y: -2600 + Math.random() * 3400 }; const ds = ST.map(s => dist(s, p)); if (ds.every(d => d > 700 && d < 4800)) { E = p; break; } }
    const O = 10 * 3600 + Math.floor(Math.random() * 3000);
    ST.forEach(s => { s.d = dist(s, E); s.tp = O + TT.P(s.d) * 60; s.ts = O + TT.S(s.d) * 60; s.r = 0; s.ok = false; });
    $('#triRes').style.display = 'none'; cards(); draw();
  }
  function cards() {
    $('#triSt').innerHTML = ST.map((s, i) => {
      const lag = (Math.round(s.ts) - Math.round(s.tp)) / 60;
      return '<div class="card flat" style="padding:12px;margin-bottom:10px" data-st="' + i + '"><div class="row" style="justify-content:space-between"><b>محطة ' + s.n + '</b><span class="tag" data-okt>' + (s.ok ? '✓ صحيح' : 'لم تُحدَّد') + '</span></div>' +
        '<div class="small">وصول P: <b class="num">' + hms(s.tp) + '</b> · وصول S: <b class="num">' + hms(s.ts) + '</b></div>' +
        (help ? '<div class="small" style="color:var(--teal)">الفرق = ' + fx(lag, 2) + ' دقيقة ← اقرأ البعد من المنحنى</div>' : '') +
        '<div class="ctl" style="margin:6px 0 0"><label style="min-width:0">نصف القطر</label><input type="range" min="0" max="5000" step="50" value="' + s.r + '"><output>' + fmtInt(s.r) + ' كم</output><button class="btn sm teal">تحقّق</button></div></div>';
    }).join('');
    $$('#triSt [data-st]').forEach(c => {
      const s = ST[+c.dataset.st], r = c.querySelector('input'), o = c.querySelector('output');
      r.oninput = () => { s.r = +r.value; o.textContent = fmtInt(s.r) + ' كم'; if (s.ok && Math.abs(s.r - s.d) > 300) s.ok = false; draw(); };
      c.querySelector('button').onclick = () => {
        s.ok = Math.abs(s.r - s.d) <= 300; const t = c.querySelector('[data-okt]');
        t.textContent = s.ok ? '✓ صحيح' : '✕ راجع الفرق والمنحنى'; t.className = 'tag ' + (s.ok ? '' : 'q'); draw();
        if (ST.every(x => x.ok)) { award('tri', 25); $('#triRes').style.display = 'block'; $('#triRes').innerHTML = '<b>أحسنت!</b> التقت الدوائر الثلاث عند المركز السطحي. الأبعاد الحقيقية: ' + ST.map(x => x.n + ' ' + fmtInt(Math.round(x.d / 10) * 10) + ' كم').join('، ') + '.'; }
      };
    });
  }
  function draw() {
    let s = '<defs><radialGradient id="oc" cx="50%" cy="40%"><stop offset="0" stop-color="#174e66"/><stop offset="1" stop-color="#0b2a38"/></radialGradient></defs><rect x="-1500" y="-5600" width="11250" height="8400" fill="url(#oc)"/>';
    for (let x = -1000; x <= 9000; x += 1000) s += '<line x1="' + x + '" x2="' + x + '" y1="-5600" y2="2800" stroke="rgba(255,255,255,.06)" stroke-width="18"/>';
    for (let y = -5000; y <= 2000; y += 1000) s += '<line y1="' + y + '" y2="' + y + '" x1="-1500" x2="9750" stroke="rgba(255,255,255,.06)" stroke-width="18"/>';
    s += '<line x1="-1200" x2="-200" y1="2400" y2="2400" stroke="#8fe3e0" stroke-width="40"/><text x="-700" y="2260" fill="#8fe3e0" font-size="230" text-anchor="middle" font-family="Tajawal">١٠٠٠ كم</text>';
    const cols = [COL.Pl, COL.Sl, '#9bd08a'];
    ST.forEach((st, i) => { if (st.r > 0) s += '<circle cx="' + st.x + '" cy="' + st.y + '" r="' + st.r + '" fill="' + (st.ok ? 'rgba(7,168,105,.07)' : 'none') + '" stroke="' + (st.ok ? '#3fdc97' : cols[i]) + '" stroke-width="' + (st.ok ? 70 : 50) + '" ' + (st.ok ? '' : 'stroke-dasharray="180 110"') + '/>'; });
    ST.forEach(st => { s += '<circle cx="' + st.x + '" cy="' + st.y + '" r="150" fill="#fff" stroke="#c8402c" stroke-width="60"/><text x="' + st.x + '" y="' + (st.y - 260) + '" fill="#fff" font-size="300" font-weight="800" text-anchor="middle" font-family="Tajawal">' + st.n + '</text>'; });
    if (ST.every(x => x.ok)) s += '<path d="M' + E.x + ' ' + (E.y - 330) + ' l95 200 220 30 -160 150 40 220 -195 -105 -195 105 40 -220 -160 -150 220 -30z" fill="#ffd23a" stroke="#7a5200" stroke-width="30"/><text x="' + E.x + '" y="' + (E.y + 520) + '" fill="#ffd23a" font-size="280" font-weight="800" text-anchor="middle" font-family="Tajawal">المركز السطحي</text>';
    svg.innerHTML = s;
  }
  $('#triNew').onclick = newQuake;
  $('#triHelp').onclick = () => { help = !help; $('#triHelp').classList.toggle('on', help); cards(); };
  newQuake();
}

/* ── لوحة معلومات الصدع (تعمل مع النموذج أو دونه) ── */
function faultInfoInit() {
  $$('#fSeg button').forEach(b => b.addEventListener('click', () => {
    $$('#fSeg button').forEach(x => x.classList.toggle('on', x === b));
    const f = D.faults.find(x => x.id === b.dataset.f);
    $('#fName').textContent = f.name; $('#fForce').textContent = 'القوة: ' + f.force; $('#fFig').textContent = f.fig; $('#fDesc').textContent = f.desc;
    S.fl = S.fl || {}; S.fl[f.id] = 1; if (Object.keys(S.fl).length === 3) award('faults3d', 10);
  }));
}

/* ═══════════ المحاكاة (٢): رختر، ميركالي، الجدول ١، التسونامي، السلامة، التقويم، نافس ═══════════ */

/* ── رختر ── */
function richterInit() {
  const a = $('#rcA'), b = $('#rcB'), cv = $('#rcCv');
  const big = v => v >= 1e6 ? fx(v / 1e6, 1) + ' مليون' : v >= 1000 ? fmtInt(v) : v >= 10 ? fmtInt(v) : fx(v, 2);
  function upd() {
    const A = +a.value, B = +b.value, d = Math.round((A - B) * 10) / 10;
    $('#rcAo').textContent = fx(A); $('#rcBo').textContent = fx(B);
    const amp = Math.pow(10, Math.abs(d)), en = Math.pow(32, Math.abs(d));
    const who = d >= 0 ? '(أ)' : '(ب)';
    $('#rcAmp').innerHTML = big(amp) + ' <small>مرة</small><br><small>' + (d === 0 ? 'متساويتان' : 'سعة موجة ' + who + ' أكبر') + '</small>';
    $('#rcEn').innerHTML = big(en) + ' <small>مرة</small><br><small>' + (d === 0 ? 'متساويتان' : 'طاقة ' + who + ' أكبر تقريبًا') + '</small>';
    const n = Math.abs(d);
    $('#rcSteps').innerHTML = d === 0 ? 'الزلزالان بالقوة نفسها.' :
      'الفرق = ' + fx(A) + ' − ' + fx(B) + ' = <b>' + fx(n) + '</b> درجة<br>السعة: ١٠ مرفوعًا للأُسّ ' + fx(n) + ' = <b>' + big(amp) + '</b> مرة<br>الطاقة: ٣٢ مرفوعًا للأُسّ ' + fx(n) + ' ≈ <b>' + big(en) + '</b> مرة' + (Number.isInteger(n) && n > 1 ? ' <span class="muted">(' + Array(n).fill('٣٢').join(' × ') + ')</span>' : '');
    // رسم سعتين بمقياس لوغاريتمي للعرض
    const { ctx, w, h } = canvasFit(cv); ctx.clearRect(0, 0, w, h);
    const draw = (M, y0, c, lab) => {
      const amp = clamp(4 * Math.pow(1.9, M - 3), 2, h * .22); ctx.strokeStyle = c; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let x = 70; x < w - 6; x++) { const u = (x - 70) / (w - 76); const env = Math.exp(-Math.pow((u - .45) / .18, 2)); const y = y0 + Math.sin(u * 90) * amp * env + Math.sin(u * 300) * .6; x === 70 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke(); ctx.fillStyle = '#3c5563'; ctx.font = '800 13px Tajawal'; ctx.textAlign = 'right'; ctx.direction = 'rtl'; ctx.fillText(lab + ' ' + fx(M), 64, y0 + 4);
    };
    draw(A, h * .27, COL.navy, '(أ)'); draw(B, h * .75, COL.teal, '(ب)');
  }
  a.oninput = b.oninput = () => { upd(); award('richter', 10); };
  $$('[data-rc]').forEach(x => x.onclick = () => { const [p, q] = x.dataset.rc.split(','); a.value = p; b.value = q; upd(); award('richter', 10); });
  window.addEventListener('sec', e => { if (e.detail === 'magnitude') setTimeout(upd, 30); });
  window.addEventListener('resize', () => visible(cv) && upd());
  upd();
}

/* ── ميركالي ── */
function mercalliInit() {
  const s = $('#mcS'); let t0 = 0;
  function house(L) {
    const tilt = L >= 9 ? (L - 8) * 3 : 0, cr = L >= 7;
    let g = '<g transform="rotate(' + tilt + ' 75 130)"><rect x="35" y="60" width="80" height="70" fill="#e9edf0" stroke="#3c5563" stroke-width="2"/><path d="M28 62 L75 25 L122 62Z" fill="#15445a"/>';
    g += '<rect x="48" y="75" width="18" height="18" fill="#bfe3f2" stroke="#3c5563"/><rect x="84" y="75" width="18" height="18" fill="#bfe3f2" stroke="#3c5563"/><rect x="66" y="100" width="18" height="30" fill="#8a5a33"/>';
    if (cr) g += '<path d="M40 62 l12 18 -8 12 14 20" stroke="#c8402c" stroke-width="2.4" fill="none"/>';
    if (L >= 8) g += '<path d="M110 64 l-10 22 8 10 -12 22" stroke="#c8402c" stroke-width="2.4" fill="none"/>';
    if (L >= 10) g += '<path d="M28 62 L75 40 L122 62" stroke="#c8402c" stroke-width="3" fill="none"/>';
    g += '</g><rect x="0" y="130" width="150" height="20" fill="#a8915f"/>';
    if (L >= 11) g += '<path d="M20 130 l15 20 M110 130 l-10 20" stroke="#5a3a1a" stroke-width="3"/>';
    return g;
  }
  function upd() {
    const L = +s.value, m = D.mercalli[L - 1]; $('#mcR').textContent = m[1];
    $('#mcSvg').innerHTML = house(L); $('#mcSvg').style.animation = 'none';
    $('#mcD').innerHTML = '<b>الشدّة ' + m[1] + ':</b> ' + m[2] + (m[3] ? ' <span class="tag enrich">إثراء</span>' : ' <span class="tag">من الكتاب</span>');
    $('#mcR').style.color = L <= 3 ? '#3d7eb9' : L <= 6 ? '#b08a1e' : '#c8402c';
    if (L === 12) award('mercalli', 5);
  }
  s.oninput = upd; upd();
  loop($('#mcSvg'), (dt, T) => { const L = +s.value; const a = L <= 1 ? 0 : (L - 1) * .55; $('#mcSvg').style.transform = 'translateX(' + (Math.sin(T * 38) * a).toFixed(2) + 'px)'; });
}

/* ── الجدول ١: مخطط انتشار + جدول ── */
function table1Init() {
  const rows = D.table1; const box = $('#t1Chart'); const W = 520, H = 300, m = { l: 62, r: 16, t: 16, b: 42 };
  const X = M => m.l + (M - 6.2) / (8.3 - 6.2) * (W - m.l - m.r);
  const Y = n => H - m.b - (Math.log10(n) - 1) / (5 - 1) * (H - m.t - m.b);
  let g = '';
  [10, 100, 1000, 10000, 100000].forEach(n => { g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(n) + '" y2="' + Y(n) + '" stroke="#e3ebef"/><text x="' + (m.l - 8) + '" y="' + (Y(n) + 4) + '" text-anchor="end" font-size="11.5" fill="#6b8290">' + fmtInt(n) + '</text>'; });
  for (let M = 6.4; M <= 8.2; M += .4) g += '<text x="' + X(M) + '" y="' + (H - m.b + 18) + '" text-anchor="middle" font-size="11.5" fill="#6b8290">' + fx(M) + '</text>';
  g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b) + '" stroke="#9fb7c1"/>';
  g += '<text x="' + ((W + m.l) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="#3c5563">القوة (رختر)</text><text transform="translate(14 ' + (H / 2) + ') rotate(-90)" text-anchor="middle" font-size="12.5" font-weight="700" fill="#3c5563">عدد القتلى (مقياس لوغاريتمي)</text>';
  rows.forEach((r, i) => { if (r[3] == null) return; g += '<circle data-i="' + i + '" cx="' + X(r[2]) + '" cy="' + Y(r[3]) + '" r="7" fill="' + COL.navy + '" stroke="#fff" stroke-width="2" style="cursor:pointer"/>'; });
  g += '<g id="t1Lab"></g>';
  box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" font-family="Tajawal">' + g + '</svg><div class="tip" id="t1Tip"></div><div class="small muted">زلزال جزر ماريانا ١٩٩٣م (٨٫١) غير ممثّل: لا يذكر الجدول له قتلى.</div>';
  const tip = $('#t1Tip'), svg = box.querySelector('svg');
  const show = (i, on) => {
    if (!on) { tip.classList.remove('show'); return; } const r = rows[i], c = svg.querySelector('[data-i="' + i + '"]');
    const br = box.getBoundingClientRect(), cr = c.getBoundingClientRect();
    tip.innerHTML = '<b>' + r[1] + ' ' + AR(r[0]) + 'م</b> · القوة ' + fx(r[2]) + ' · القتلى ' + fmtInt(r[3]);
    tip.style.left = (cr.left - br.left + cr.width / 2) + 'px'; tip.style.top = (cr.top - br.top) + 'px'; tip.classList.add('show');
    $$('#t1Table tr').forEach((tr, k) => tr.classList.toggle('hl', k - 1 === i));
  };
  svg.addEventListener('pointerover', e => { const c = e.target.closest('circle[data-i]'); if (c) show(+c.dataset.i, true); });
  svg.addEventListener('pointerout', e => { if (e.target.closest('circle[data-i]')) show(0, false); });
  svg.addEventListener('pointerdown', e => { const c = e.target.closest('circle[data-i]'); if (c) { show(+c.dataset.i, true); award('t1', 5); } });
  let sortK = 0, dir = 1;
  const tab = () => {
    const idx = rows.map((r, i) => i).sort((p, q) => { const a = rows[p][sortK] ?? -1, b = rows[q][sortK] ?? -1; return (a > b ? 1 : a < b ? -1 : 0) * dir; });
    $('#t1Table').innerHTML = '<table class="dt"><tr>' + ['السنة', 'المكان', 'القوة', 'القتلى'].map((h, k) => '<th data-k="' + k + '">' + h + (k === sortK ? (dir > 0 ? ' ▲' : ' ▼') : '') + '</th>').join('') + '</tr>' +
      idx.map(i => { const r = rows[i]; return '<tr data-r="' + i + '"><td>' + AR(r[0]) + 'م</td><td>' + r[1] + '</td><td>' + fx(r[2]) + '</td><td>' + (r[3] == null ? '–' : fmtInt(r[3])) + '</td></tr>'; }).join('') + '</table>';
    $$('#t1Table th').forEach(th => th.onclick = () => { const k = +th.dataset.k; dir = k === sortK ? -dir : 1; sortK = k; tab(); });
  };
  tab();
  $('#t1Tab').onclick = () => { const t = $('#t1Table'); const o = t.style.display === 'none'; t.style.display = o ? 'block' : 'none'; $('#t1Tab').textContent = o ? 'إخفاء الجدول' : 'عرض الجدول'; };
  $('#t1Skill').onclick = () => {
    const on = $('#t1Skill').classList.toggle('on'); const L = svg.querySelector('#t1Lab'); L.innerHTML = '';
    svg.querySelectorAll('circle[data-i]').forEach(c => { const i = +c.dataset.i; const k = [0, 1, 7].includes(i); c.setAttribute('fill', on && k ? COL.S : COL.navy); c.setAttribute('r', on && k ? 9 : 7); c.style.opacity = on && !k ? .35 : 1; });
    if (on) [0, 1, 7].forEach(i => { const r = rows[i]; L.innerHTML += '<text x="' + (X(r[2]) + (i === 7 ? -12 : 12)) + '" y="' + (Y(r[3]) - 12) + '" text-anchor="' + (i === 7 ? 'end' : 'start') + '" font-size="12.5" font-weight="800" fill="#0b2a38">' + r[1] + ' ' + AR(r[0]) + '</text>'; });
  };
}

/* ── التسونامي ── */
function tsunamiInit() {
  const cv = $('#tsCv'); const T = { run: false, x: 0, t: 0, warn: false, done: false };
  const LEN = 3000; // كم من المركز إلى الشاطئ (توضيحي)
  const dep = () => +$('#tsDep').value;
  // العمق عند المسافة s (كم من البؤرة)
  const depthAt = s => { const D0 = dep(); const shelf = LEN - 220; if (s < shelf) return D0; const u = (s - shelf) / 220; return Math.max(5, D0 * Math.pow(1 - u, 2.2) + 8 * (1 - u)); };
  const speedKmh = d => Math.sqrt(9.8 * d) * 3.6;
  const heightAt = s => { const D0 = dep(); const h0 = .6; return Math.min(30, h0 * Math.pow(D0 / depthAt(s), .25) * (s > LEN - 40 ? 1 + (s - (LEN - 40)) / 12 : 1)); };
  $('#tsDep').oninput = () => { $('#tsDepO').textContent = fmtInt(dep()) + ' م · ' + fmtInt(speedKmh(dep())) + ' كم/س'; if (!T.run) hud(0); };
  $('#tsDep').oninput();
  function hud(s) { const d = depthAt(s); $('#tsD').textContent = fmtInt(d) + ' م'; $('#tsV').textContent = fmtInt(speedKmh(d)) + ' كم/س'; $('#tsH').textContent = (heightAt(s) < 1 ? 'أقل من ١ م' : fx(heightAt(s), 0) + ' م'); $('#tsT').textContent = fx(T.t, 1) + ' ساعة'; }
  $('#tsGo').onclick = () => { T.run = true; T.x = 0; T.t = 0; T.warn = false; T.done = false; $('#tsWarn').style.display = 'none'; };
  $('#tsReset').onclick = () => { T.run = false; T.x = 0; T.t = 0; T.warn = false; T.done = false; $('#tsWarn').style.display = 'none'; hud(0); };
  hud(0);
  loop(cv, dt => {
    const { ctx, w, h } = canvasFit(cv);
    if (T.run && !T.done) {
      const v = speedKmh(depthAt(T.x)); const simH = dt * 0.9; // ساعة محاكاة لكل ثانية تقريبًا
      T.x = Math.min(LEN, T.x + v * simH); T.t += simH;
      if (T.x > LEN - 260 && !T.warn) { T.warn = true; $('#tsWarn').style.display = 'block'; }
      if (T.x >= LEN) { T.done = true; award('tsunami', 10); }
      hud(T.x);
    }
    // تحويل: البؤرة يمين، الشاطئ يسار
    const sx = s => w - 30 - s / LEN * (w - 120), sea = h * .32, bot = h - 20;
    const yb = s => sea + (depthAt(s) / 7000) * (bot - sea - 10);
    const sk = ctx.createLinearGradient(0, 0, 0, sea); sk.addColorStop(0, '#1d4b66'); sk.addColorStop(1, '#5f93ad'); ctx.fillStyle = sk; ctx.fillRect(0, 0, w, sea + 2);
    // سطح الماء
    const wave = s => { if (!T.run && !T.done) return 0; const d = s - T.x; const H = heightAt(T.x); const amp = (H < 1 ? 5 : 5 + H * 2.2); let y = -amp * Math.exp(-d * d / (T.x > LEN - 300 ? 900 : 9000)); if (T.warn && s > LEN - 200 && s > T.x + 10) y += 14 * Math.min(1, (T.x - (LEN - 260)) / 120); return y; };
    ctx.beginPath(); ctx.moveTo(w, bot); ctx.lineTo(w, sea + wave(0));
    for (let s = 0; s <= LEN; s += 8) ctx.lineTo(sx(s), sea + wave(s));
    ctx.lineTo(sx(LEN) - 60, sea - 2); ctx.lineTo(0, sea - 2); ctx.lineTo(0, bot); ctx.closePath();
    const wg = ctx.createLinearGradient(0, sea, 0, bot); wg.addColorStop(0, '#2b88b8'); wg.addColorStop(1, '#0b3550'); ctx.fillStyle = wg; ctx.fill();
    // القاع
    ctx.beginPath(); ctx.moveTo(w, h); ctx.lineTo(w, yb(0)); for (let s = 0; s <= LEN; s += 10) ctx.lineTo(sx(s), yb(s)); ctx.lineTo(sx(LEN), sea - 4); ctx.lineTo(0, sea - 6); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = '#8c7a57'; ctx.fill();
    // اليابسة والمباني
    ctx.fillStyle = '#6f9a4a'; ctx.fillRect(0, sea - 8, sx(LEN) - 50, 8);
    for (let i = 0; i < 4; i++) { const bx = 14 + i * 26, bh = 26 + (i % 2) * 18; ctx.fillStyle = '#cfd8dc'; ctx.fillRect(bx, sea - 8 - bh, 18, bh); ctx.fillStyle = '#9fb7c1'; for (let k = 0; k < bh / 9 - 1; k++) ctx.fillRect(bx + 4, sea - 8 - bh + 4 + k * 9, 10, 4); }
    // البؤرة
    ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(sx(0) - 6, yb(0) + 10, 8, 0, 7); ctx.fill();
    ctx.font = '700 12.5px Tajawal'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
    ctx.fillText('بؤرة الزلزال', sx(0) - 26, yb(0) - 2 > h - 30 ? h - 30 : yb(0) - 4);
    ctx.fillText('المحيط المفتوح', sx(LEN * .45), sea + 40); ctx.fillText('الشاطئ', 50, sea - 52);
    if (T.done) {
      const x0 = sx(LEN) - 30, Hpx = Math.min(sea - 20, 20 + heightAt(LEN) * 3.2);
      ctx.fillStyle = '#2b88b8'; ctx.beginPath(); ctx.moveTo(x0 + 90, sea); ctx.quadraticCurveTo(x0 + 40, sea - Hpx * .2, x0 + 10, sea - Hpx); ctx.quadraticCurveTo(x0 - 30, sea - Hpx * 1.05, x0 - 40, sea - Hpx * .7); ctx.quadraticCurveTo(x0 - 10, sea - Hpx * .75, x0 - 6, sea); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 10, sea - Hpx); ctx.quadraticCurveTo(x0 - 30, sea - Hpx * 1.05, x0 - 40, sea - Hpx * .7); ctx.stroke();
      ctx.fillStyle = 'rgba(200,64,44,.92)'; ctx.font = '800 15px Tajawal'; ctx.fillText('تباطأت الموجة وتراكبت لتشكّل جدارًا من المياه عند الشاطئ', w / 2, 28);
    }
  });
}

/* ── سؤال خريطة الشكل ٧ ── */
function tsQuizInit() {
  const qs = [{ q: 'تمثّل كل دائرة على خريطة الشكل ٧ فرقًا في زمن الوصول بمقدار:', o: ['ساعة', 'ساعتين', '٤ ساعات', 'يوم'], a: 1 },
    { q: 'تقع أقرب دائرة لسواحل اليابان على الخريطة قرب الرقم ٨ تقريبًا. ماذا يعني ذلك؟', o: ['أن الموجة تصل بعد نحو ٨ ساعات من تولّدها في هاواي', 'أن ارتفاع الموجة ٨ أمتار', 'أن قوة الزلزال ٨', 'أن سرعتها ٨ كم/س'], a: 0 }];
  mcqWidget($('#tsQ'), qs, 'tsq', true);
}

/* ── السلامة: سحب وإفلات ── */
function sortInit() {
  const items = shuffle([...D.safety.do.map(t => ({ t, k: 'do' })), ...D.safety.dont.map(t => ({ t, k: 'dont' }))]);
  const pool = $('#sfPool'); let sel = null, ok = 0;
  items.forEach(it => { const c = document.createElement('div'); c.className = 'chip'; c.textContent = it.t; c.dataset.k = it.k; pool.appendChild(c); });
  const drop = (chip, bin) => {
    if (!chip || chip.classList.contains('ok')) return;
    if (chip.dataset.k === bin.dataset.bin) { chip.classList.remove('sel'); chip.classList.add('ok'); bin.querySelector('.pool').appendChild(chip); ok++; if (ok === items.length) { $('#sfDone').style.display = 'block'; award('sort', 15); } }
    else { chip.classList.remove('bad'); void chip.offsetWidth; chip.classList.add('bad'); }
  };
  $$('.bin').forEach(b => b.addEventListener('click', () => { if (sel) { drop(sel, b); sel && sel.classList.remove('sel'); sel = null; } }));
  // السحب بالمؤشّر
  let dg = null, ghost = null, sx = 0, sy = 0, moved = false;
  pool.addEventListener('pointerdown', e => { const c = e.target.closest('.chip'); if (!c || c.classList.contains('ok')) return; dg = c; sx = e.clientX; sy = e.clientY; moved = false; });
  addEventListener('pointermove', e => {
    if (!dg) return; if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
    if (!moved) { moved = true; ghost = dg.cloneNode(true); ghost.classList.add('drag'); $('#lessonApp').appendChild(ghost); dg.style.opacity = .35; }
    ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (e.clientY - 20) + 'px';
    $$('.bin').forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('over', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); });
  });
  addEventListener('pointerup', e => {
    if (!dg) return;
    if (moved) { const b = $$('.bin').find(b => b.classList.contains('over')); if (b) drop(dg, b); dg.style.opacity = ''; ghost && ghost.remove(); $$('.bin').forEach(b => b.classList.remove('over')); }
    else { if (sel) sel.classList.remove('sel'); sel = dg === sel ? null : dg; if (sel) sel.classList.add('sel'); }
    dg = null; ghost = null;
  });
}

/* ── محاكاة المبنى ── */
function buildingInit() {
  const cv = $('#bdCv'); let t = 0; const B = { fall: 0, fire: 0 };
  $('#bdS').oninput = () => { $('#bdSo').textContent = AR($('#bdS').value); $('#bdI').textContent = ['ساكن', 'خفيف', 'خفيف', 'متوسط', 'متوسط', 'قوي', 'قوي', 'قوي جدًّا', 'عنيف', 'عنيف', 'مدمّر'][+$('#bdS').value]; if (+$('#bdS').value >= 8) award('bldg', 10); };
  $('#bdS').oninput();
  loop(cv, dt => {
    const { ctx, w, h } = canvasFit(cv); t += dt; const L = +$('#bdS').value, iso = $('#bdIso').checked, gas = $('#bdGas').checked, shelf = $('#bdShelf').checked;
    const g0 = Math.sin(t * 13) * L * 1.6; const gy = h - 46;
    ctx.fillStyle = '#0a2230'; ctx.fillRect(0, 0, w, h);
    const sk = ctx.createLinearGradient(0, 0, 0, gy); sk.addColorStop(0, '#13394c'); sk.addColorStop(1, '#2a6077'); ctx.fillStyle = sk; ctx.fillRect(0, 0, w, gy);
    ctx.fillStyle = '#7a6544'; ctx.fillRect(g0 - 20, gy, w + 40, h - gy);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; for (let x = -20; x < w + 20; x += 22) { ctx.beginPath(); ctx.moveTo(x + g0, gy + 10); ctx.lineTo(x + g0 + 10, gy + 18); ctx.stroke(); }
    const bld = (cx, isolated, title) => {
      const bw = Math.min(150, w * .26), bh = h * .62, floors = 6, base = isolated ? g0 * .18 : g0;
      const sway = isolated ? Math.sin(t * 13 - .6) * L * .35 : Math.sin(t * 13 - 1.1) * L * 2.6;
      const broken = !isolated && L >= 8;
      ctx.save(); ctx.translate(cx, gy);
      // أساس
      ctx.fillStyle = '#5d4a30'; ctx.fillRect(-bw / 2 - 8 + g0, 0, bw + 16, 12);
      if (isolated) { for (let i = 0; i < 4; i++) { const px = -bw / 2 + 10 + i * (bw - 20) / 3 + base; ctx.fillStyle = '#222'; ctx.fillRect(px - 10, -14, 20, 14); ctx.fillStyle = '#9fb7c1'; ctx.fillRect(px - 10, -9, 20, 3); ctx.fillRect(px - 10, -4, 20, 3); } }
      const y0 = isolated ? -14 : 0;
      for (let f = 0; f < floors; f++) {
        const k0 = f / floors, k1 = (f + 1) / floors, x0 = base + sway * k0 * k0, x1 = base + sway * k1 * k1, ya = y0 - k0 * bh, yb = y0 - k1 * bh;
        ctx.fillStyle = f % 2 ? '#dfe6ea' : '#e9eef1'; ctx.beginPath(); ctx.moveTo(-bw / 2 + x0, ya); ctx.lineTo(bw / 2 + x0, ya); ctx.lineTo(bw / 2 + x1, yb); ctx.lineTo(-bw / 2 + x1, yb); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#9fb7c1'; ctx.stroke();
        for (let wi = 0; wi < 3; wi++) { const wx = -bw / 2 + 14 + wi * (bw - 28) / 2.4 + (x0 + x1) / 2; ctx.fillStyle = broken && (f + wi) % 3 === 0 ? '#3b2a20' : '#7fb8d4'; ctx.fillRect(wx, (ya + yb) / 2 - 7, 18, 12); }
        if (broken && f < 3) { ctx.strokeStyle = '#c8402c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-bw / 2 + x0 + 10 + f * 20, ya); ctx.lineTo(-bw / 2 + x0 + 26 + f * 20, ya - 14); ctx.lineTo(-bw / 2 + x0 + 16 + f * 20, yb); ctx.stroke(); ctx.lineWidth = 1; }
      }
      // رف داخلي في الطابق الأرضي
      const fx0 = base + sway * .01;
      ctx.fillStyle = '#8a5a33'; ctx.fillRect(-bw / 2 + 8 + fx0, y0 - bh / floors + 6, 6, bh / floors - 8);
      const objY = shelf ? y0 - 12 : y0 - bh / floors + 10;
      if (!shelf && L >= 5) B.fall = Math.min(1, B.fall + dt); else if (shelf || L < 5) B.fall = Math.max(0, B.fall - dt);
      ctx.fillStyle = '#c8402c'; ctx.fillRect(-bw / 2 + 16 + fx0 + B.fall * 10, objY + B.fall * (bh / floors - 22), 12, 10);
      // غاز
      if (!isolated) { const fire = !gas && L >= 6; B.fire = fire ? Math.min(1, B.fire + dt) : Math.max(0, B.fire - dt * 2); }
      if (!isolated && B.fire > 0) { for (let k = 0; k < 6; k++) { const fx_ = bw / 2 - 18 + base + Math.sin(t * 20 + k) * 3, fy = y0 - 6 - k * 6 - Math.random() * 6; ctx.fillStyle = k % 2 ? 'rgba(255,170,40,' + B.fire + ')' : 'rgba(255,80,30,' + B.fire + ')'; ctx.beginPath(); ctx.arc(fx_, fy, 8 - k, 0, 7); ctx.fill(); } }
      ctx.restore();
      ctx.fillStyle = '#fff'; ctx.font = '800 13.5px Tajawal'; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillText(title, cx, 22);
      if (!isolated && L >= 8) { ctx.fillStyle = '#ffb4a6'; ctx.font = '700 12.5px Tajawal'; ctx.fillText('تصدّعات خطيرة!', cx, 42); }
      if (!isolated && B.fire > .3) { ctx.fillStyle = '#ffd08a'; ctx.font = '700 12px Tajawal'; ctx.fillText('تسرّب غاز ← حريق', cx, 60); }
    };
    bld(w * .72, false, 'مبنى تقليدي');
    bld(w * .28, iso, iso ? 'مبنى آمن ضد الزلازل' : 'مبنى دون دعائم');
  });
}

/* ── أداة اختيار من متعدد عامة ── */
function mcqWidget(el, qs, key, compact) {
  let i = 0, score = 0; const res = [];
  const L = ['أ', 'ب', 'ج', 'د'];
  function render() {
    if (i >= qs.length) {
      el.innerHTML = '<div class="callout ok"><b>النتيجة: ' + AR(score) + ' من ' + AR(qs.length) + '</b></div><button class="btn sm ghost mt">إعادة المحاولة</button>';
      el.querySelector('button').onclick = () => { i = 0; score = 0; res.length = 0; render(); };
      if (score === qs.length) award(key, compact ? 5 : 20); return;
    }
    const q = qs[i];
    el.innerHTML = (compact ? '' : '<div class="dots">' + qs.map((_, k) => '<i class="' + (k < i ? (res[k] ? 'ok' : 'no') : k === i ? 'cur' : '') + '"></i>').join('') + '</div><div class="qn">السؤال ' + AR(i + 1) + ' من ' + AR(qs.length) + '</div>') +
      '<div class="qt" style="' + (compact ? 'font-size:16px;color:inherit' : '') + '">' + q.q + '</div><div class="opts">' + q.o.map((o, k) => '<button class="opt" data-k="' + k + '"><span class="L">' + L[k] + '</span><span>' + o + '</span></button>').join('') + '</div><div class="fb"></div>';
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const k = +b.dataset.k, ok = k === q.a; res[i] = ok; if (ok) score++;
      el.querySelectorAll('.opt').forEach((x, j) => { x.disabled = true; if (j === q.a) x.classList.add('ok'); else if (j === k) x.classList.add('no'); });
      const fb = el.querySelector('.fb'); fb.className = 'fb show callout ' + (ok ? 'ok' : 'warn'); fb.innerHTML = (ok ? 'إجابة صحيحة.' : 'الإجابة الصحيحة: ' + q.o[q.a] + '.') + (q.p ? ' <span class="muted small">(ص ' + AR(q.p) + ')</span>' : '') + ' <button class="btn sm" style="margin-inline-start:8px">' + (i + 1 < qs.length ? 'التالي' : 'النتيجة') + '</button>';
      fb.querySelector('button').onclick = () => { i++; render(); };
    });
  }
  render();
}

/* ── اختبر نفسك ── */
function selftestInit() {
  $('#selftest').innerHTML = D.selftest.map((s, i) => '<div class="st"><div class="h"><span class="n">' + AR(i + 1) + '</span><div><b>' + s[0] + '</b> ' + s[1] + '</div></div><div class="bd"><textarea placeholder="اكتب إجابتك أولًا…" data-st="' + i + '"></textarea><button class="btn sm ghost mt" data-show>اعرض الإجابة النموذجية</button><div class="model callout gold">' + s[2] + '</div></div></div>').join('');
  $$('#selftest .st').forEach((st, i) => {
    st.querySelector('.h').onclick = () => st.classList.toggle('open');
    const ta = st.querySelector('textarea'); ta.value = store.get('st' + i, ''); ta.oninput = () => store.set('st' + i, ta.value);
    st.querySelector('[data-show]').onclick = () => { st.querySelector('.model').classList.add('show'); award('st' + i, 3); };
  });
}

/* ── عجلة الأسئلة ── */
function wheelInit() {
  const cv = $('#whCv'), ctx = cv.getContext('2d'), Q = D.wheel, n = Q.length; let ang = 0, vel = 0, spinning = false;
  const cols = ['#15445a', '#0da9a6', '#3d7eb9', '#07a869', '#1f5f7a', '#0b8a87', '#2c62a0', '#c1b489'];
  function draw() {
    const R = 290; ctx.clearRect(0, 0, 600, 600); ctx.save(); ctx.translate(300, 300);
    for (let i = 0; i < n; i++) {
      const a0 = ang + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fillStyle = cols[i % cols.length]; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.rotate((a0 + a1) / 2); ctx.fillStyle = i % cols.length === 7 ? '#3b3313' : '#fff'; ctx.font = '800 44px Tajawal'; ctx.textAlign = 'center'; ctx.fillText(AR(i + 1), R * .72, 15); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = '#15445a'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#c8402c'; ctx.beginPath(); ctx.moveTo(300, 40); ctx.lineTo(282, 0); ctx.lineTo(318, 0); ctx.closePath(); ctx.fill();
  }
  draw();
  $('#whGo').onclick = () => { if (spinning) return; vel = 18 + Math.random() * 10; spinning = true; $('#whQ').textContent = '…'; };
  loop(cv, dt => {
    if (!spinning) return; ang += vel * dt; vel *= Math.pow(0.32, dt);
    if (vel < .15) { spinning = false; const top = -Math.PI / 2; let a = ((top - ang) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const i = Math.floor(a / (2 * Math.PI / n)); $('#whQ').textContent = AR(i + 1) + '. ' + Q[i]; award('wheel', 3); }
    draw();
  });
}

/* ── نافس ── */
let NF_T = 0;
function nafesInit() {
  const box = $('#nafesBox'), N = D.nafes, L = ['أ', 'ب', 'ج', 'د'], PASS = Math.ceil(N.length * .75);
  if (!N.length) { box.innerHTML = '<div class="callout gold">لا توجد أسئلة نافس لهذا الدرس.</div>'; return; }
  const st = { i: 0, ans: store.get('nf_ans', {}), flag: {}, done: false, t0: Date.now() };
  const figGraph = () => {
    const W = 420, H = 250, m = { l: 40, r: 10, t: 10, b: 34 }; const X = d => m.l + d / 5000 * (W - m.l - m.r), Y = t => H - m.b - t / 16 * (H - m.t - m.b);
    let g = ''; for (let t = 0; t <= 16; t += 2) g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="#dfe7eb"/><text x="' + (m.l - 6) + '" y="' + (Y(t) + 4) + '" font-size="10.5" text-anchor="end" fill="#6b8290">' + AR(t) + '</text>';
    for (let d = 0; d <= 5000; d += 1000) g += '<line x1="' + X(d) + '" x2="' + X(d) + '" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="#dfe7eb"/><text x="' + X(d) + '" y="' + (H - m.b + 14) + '" font-size="10.5" text-anchor="middle" fill="#6b8290">' + fmtInt(d) + '</text>';
    const p = a => D.travel.d.map((d, i) => (i ? 'L' : 'M') + X(d).toFixed(1) + ' ' + Y(a[i]).toFixed(1)).join(' ');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:460px;display:block;margin:auto" font-family="Tajawal">' + g + '<path d="' + p(D.travel.S) + '" stroke="' + COL.S + '" stroke-width="2.2" fill="none"/><path d="' + p(D.travel.P) + '" stroke="' + COL.P + '" stroke-width="2.2" fill="none"/><text x="' + X(1200) + '" y="' + Y(7.4) + '" font-size="12" font-weight="800" fill="' + COL.S + '">S</text><text x="' + X(2600) + '" y="' + Y(4.1) + '" font-size="12" font-weight="800" fill="' + COL.P + '">P</text><text x="' + ((W + m.l) / 2) + '" y="' + (H - 2) + '" font-size="11" text-anchor="middle" fill="#3c5563">البعد عن المركز السطحي (كم)</text><text transform="translate(10 ' + (H / 2) + ') rotate(-90)" font-size="11" text-anchor="middle" fill="#3c5563">الزمن (دقيقة)</text></svg><div class="small muted" style="text-align:center">منحنى زمن وصول الموجات P وS (الشكل ٥)</div>';
  };
  const figTable = () => '<table class="dt"><tr><th>السنة</th><th>المكان</th><th>القوة</th><th>القتلى</th></tr>' + D.table1.map(r => '<tr><td>' + AR(r[0]) + 'م</td><td>' + r[1] + '</td><td>' + fx(r[2]) + '</td><td>' + (r[3] == null ? '–' : fmtInt(r[3])) + '</td></tr>').join('') + '</table><div class="small muted" style="text-align:center">الجدول ١: الزلازل القوية</div>';
  const fmtT = s => AR(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
  function render() {
    const q = N[st.i], a = st.ans[st.i];
    const score = N.filter((x, k) => st.ans[k] === x.a).length;
    if (st.done === 'res') {
      const lv = ['معرفة', 'تطبيق', 'استدلال'].map(l => { const it = N.map((x, k) => [x, k]).filter(([x]) => x.lv === l); return [l, it.filter(([x, k]) => st.ans[k] === x.a).length, it.length]; });
      box.innerHTML = '<div class="nf"><div class="nh"><b>نتيجة تدريب نافس</b><span class="sp"></span><span class="tm">' + AR(score) + ' / ' + AR(N.length) + '</span></div><div class="nb">' +
        '<div class="res">' + lv.map(([l, s, n]) => '<div><span class="small muted">مستوى ' + l + '</span><b>' + AR(s) + ' / ' + AR(n) + '</b></div>').join('') + '</div>' +
        '<div class="callout ' + (score >= PASS ? 'ok' : 'gold') + '">' + (score >= PASS ? 'أداء متميّز! أنت مستعد لأسئلة هذا الدرس في نافس.' : 'راجع الأسئلة الخاطئة وتفسيراتها، ثم أعد المحاولة.') + '</div>' +
        N.map((x, k) => '<div class="card flat mt" style="padding:12px"><b>' + AR(k + 1) + '. </b>' + x.q + '<div class="small mt" style="margin-top:6px">' + (st.ans[k] === x.a ? '<span class="tag">✓ صحيحة</span>' : '<span class="tag q">✕ ' + (st.ans[k] == null ? 'لم تُجب' : 'إجابتك: ' + L[st.ans[k]]) + '</span>') + ' الإجابة: <b>' + L[x.a] + ') ' + x.o[x.a] + '</b></div><div class="small muted" style="margin-top:4px">' + x.ex + '</div></div>').join('') +
        '</div><div class="nfoot"><button class="btn" id="nfAgain">إعادة التدريب</button></div></div>';
      $('#nfAgain').onclick = () => { st.ans = {}; st.flag = {}; st.i = 0; st.done = false; st.t0 = Date.now(); store.set('nf_ans', {}); render(); };
      if (score >= PASS) award('nafes', 40); return;
    }
    box.innerHTML = '<div class="nf"><div class="nh"><b>تدريب نافس · العلوم</b><span class="small" style="opacity:.75">الدرس: ' + D.name + '</span><span class="sp"></span><span class="tm" id="nfT">' + fmtT(Math.floor((Date.now() - st.t0) / 1000)) + '</span></div><div class="nb">' +
      '<div class="grid10">' + N.map((_, k) => '<button data-j="' + k + '" class="' + [k === st.i ? 'cur' : '', st.ans[k] != null ? (st.done ? (st.ans[k] === N[k].a ? 'ok' : 'no') : 'ans') : '', st.flag[k] ? 'flag' : ''].join(' ') + '">' + AR(k + 1) + '</button>').join('') + '</div>' +
      '<div class="row" style="justify-content:space-between"><span class="qn" style="font-weight:800;color:var(--muted)">السؤال ' + AR(st.i + 1) + ' من ' + AR(N.length) + '</span><span class="lv">' + q.lv + '</span></div>' +
      (q.fig ? '<div class="fig">' + (q.fig === 'graph' ? figGraph() : figTable()) + '</div>' : '') +
      '<div class="qt" style="font-size:19px;font-weight:800;margin:10px 0 14px;color:var(--navy-d)">' + q.q + '</div>' +
      '<div class="opts">' + q.o.map((o, k) => '<button class="opt ' + (a != null ? (k === q.a ? 'ok' : k === a ? 'no' : '') : '') + '" data-k="' + k + '" ' + (a != null ? 'disabled' : '') + '><span class="L">' + L[k] + '</span><span>' + o + '</span></button>').join('') + '</div>' +
      (a != null ? '<div class="callout ' + (a === q.a ? 'ok' : 'warn') + ' mt"><b>' + (a === q.a ? 'صحيحة.' : 'غير صحيحة. الإجابة: ' + L[q.a] + ').') + '</b> ' + q.ex + '</div>' : '') +
      '</div><div class="nfoot"><div class="row"><button class="btn ghost" id="nfPrev"' + (st.i === 0 ? ' disabled' : '') + '>→ السابق</button><button class="btn ghost" id="nfFlag">' + (st.flag[st.i] ? 'إلغاء المراجعة' : 'علّم للمراجعة') + '</button></div>' +
      '<div class="row"><span class="small muted">أُجيب ' + AR(Object.keys(st.ans).length) + ' من ' + AR(N.length) + '</span>' + (st.i < N.length - 1 ? '<button class="btn" id="nfNext">التالي ←</button>' : '<button class="btn gold" id="nfEnd">إنهاء وعرض النتيجة</button>') + '</div></div></div>';
    box.querySelectorAll('.opt').forEach(b => b.onclick = () => { st.ans[st.i] = +b.dataset.k; store.set('nf_ans', st.ans); render(); });
    box.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { st.i = +b.dataset.j; render(); });
    $('#nfPrev').onclick = () => { st.i--; render(); };
    $('#nfFlag').onclick = () => { st.flag[st.i] = !st.flag[st.i]; render(); };
    const nx = $('#nfNext'); if (nx) nx.onclick = () => { st.i++; render(); };
    const en = $('#nfEnd'); if (en) en.onclick = () => { st.done = 'res'; render(); $('#lmain').scrollTop = 0; };
  }
  clearInterval(NF_T); NF_T = setInterval(() => { const t = $('#nfT'); if (t && visible(t)) t.textContent = fmtT(Math.floor((Date.now() - st.t0) / 1000)); }, 1000);
  render();
}

/* ── بطاقات التوقّع ── */
function flipInit() { $$('.flip').forEach((f, i) => f.onclick = () => { f.classList.toggle('on'); award('flip' + i, 2); }); }


/* ═══════════ المحرّك العام للدرس التفاعلي ═══════════ */
const CREDIT = 'تصميم: أ. هيفاء السلمي';
const ICON = {
  c1: '<path d="M9 3h6M10 3v6L4 20h16L14 9V3"/><path d="M7 15h10"/>',
  c2: '<path d="M1 13h5l2-5 3 12 3-16 3 13 2-4h6"/>',
  c3: '<circle cx="13" cy="13" r="10"/><circle cx="14" cy="12" r="3.5"/><circle cx="7" cy="16" r="1.2"/><circle cx="18" cy="18" r="1.2"/>',
  c4: '<path d="M8 2c0 7 10 7 10 11s-10 4-10 11M18 2c0 7-10 7-10 11s10 4 10 11M9 6h8M9 20h8M10 13h6"/>',
  c5: '<circle cx="13" cy="13" r="2.4"/><ellipse cx="13" cy="13" rx="11" ry="4.5"/><ellipse cx="13" cy="13" rx="11" ry="4.5" transform="rotate(60 13 13)"/><ellipse cx="13" cy="13" rx="11" ry="4.5" transform="rotate(-60 13 13)"/>',
  c6: '<rect x="2" y="4" width="6" height="6"/><rect x="2" y="12" width="6" height="6"/><rect x="10" y="12" width="6" height="6"/><rect x="18" y="4" width="6" height="6"/><rect x="18" y="12" width="6" height="6"/><rect x="10" y="20" width="14" height="4"/>'
};
const ORD = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
let CTX = null, LESSONS = [], CURL = null, cur = 0, f3started = false, CHS = [];
const GL = () => CURL && CURL.kind === 'chx' ? CURL.lessons[0] : CURL;
const inR = (n, r) => n >= r[0] && n <= r[1];
const findAt = n => LESSONS.find(x => n >= x.from && n <= x.to) || CHS.find(x => inR(n, x.rOpen) || inR(n, x.rClose) || (x.test && inR(n, [x.test.pages[0], x.test.pages[x.test.pages.length - 1]])));
const shortName = L => L.title.split(': ').pop();
const lessonNo = L => (L.title.split(':')[0] || '').trim();
const chapOf = L => 'c' + ({ 'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5, 'السادس': 6 }[(L.chapter.match(/الفصل ([^\s:]+)/) || [])[1]] || 1);
const pgs = a => a.length > 1 && a[0] !== a[a.length - 1] ? AR(a[0]) + '–' + AR(a[a.length - 1]) : AR(a[0]);
const strip = s => String(s).replace(/<[^>]+>/g, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function updProg() {
  const ids = D.secs.map(s => s.id); const n = ids.filter(i => S.seen[i]).length;
  $('#progBar').style.width = (n / ids.length * 100) + '%';
  $$('#lnav a[data-go]').forEach(a => a.classList.toggle('done', !!S.seen[a.dataset.go] && !a.classList.contains('on')));
}
function go(id) {
  const i = typeof id === 'number' ? id : D.secs.findIndex(s => s.id === id);
  if (i < 0 || i >= D.secs.length) return;
  cur = i; const sid = D.secs[i].id;
  $$('#lessonApp .sec').forEach(s => s.classList.toggle('active', s.dataset.id === sid));
  $$('#lnav a[data-go]').forEach(a => a.classList.toggle('on', a.dataset.go === sid));
  $('#lmain').scrollTop = 0;
  $('#lsPrev').disabled = i === 0; $('#lsNext').disabled = i === D.secs.length - 1;
  $('#pgTitle').textContent = D.secs[i].t + ' · ' + AR(i + 1) + ' من ' + AR(D.secs.length);
  S.seen[sid] = 1; store.set('seen', S.seen); store.set('cur', sid); updProg();
  document.body.classList.remove('navOpen');
  if (D.id === 'quakes' && sid === 'faults' && !f3started) { f3started = true; setTimeout(() => fault3dStart($('#fault3d')), 30); }
  window.dispatchEvent(new CustomEvent('sec', { detail: sid }));
}

/* ── المساعد (إجابات مضمّنة فقط) ── */
const norm = s => String(s).toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
function answer(q) {
  const nq = ' ' + norm(q) + ' '; let best = null, bs = 0;
  D.assist.forEach(([keys, a]) => {
    let s = 0; keys.forEach(k => { const nk = norm(k); if (!nk) return; if (nk.length <= 1) { if (new RegExp('(^|[^a-z])' + nk + '([^a-z]|$)').test(nq)) s += 1; } else if (nq.includes(nk)) s += nk.length > 4 ? 2 : 1.5; });
    if (s > bs) { bs = s; best = a; }
  });
  return best || 'لم أجد إجابة لهذا السؤال في درس «' + D.name + '». جرّب كلمات من مفردات الدرس مثل: ' + D.vocab.slice(0, 4).map(v => v[0]).join('، ') + '.';
}
function asSay(q) {
  const box = $('#asMsgs');
  box.insertAdjacentHTML('beforeend', '<div class="m u"></div><div class="m b"></div>');
  const ms = box.querySelectorAll('.m'); ms[ms.length - 2].textContent = q; ms[ms.length - 1].textContent = answer(q);
  box.scrollTop = box.scrollHeight;
}

/* ── القلم ── */
const PEN = { on: false, col: '#c8402c', draw: false, last: null };
function penToggle(on) {
  PEN.on = on; const c = $('#penLayer'); c.classList.toggle('show', on); $('#penBar').classList.toggle('show', on);
  if (on) { const dpr = Math.min(devicePixelRatio || 1, 2); if (c.width !== innerWidth * dpr) { c.width = innerWidth * dpr; c.height = innerHeight * dpr; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); } }
}

/* ── الخلفية المتحركة في الغلاف (بحسب الفصل) ── */
function heroInit(kind) {
  const cv = $('#heroCv'); let off = 0; const pts = Array.from({ length: 26 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: 6 + Math.random() * 22, v: .2 + Math.random() * .6, p: Math.random() * 6 }));
  loop(cv, (dt, T) => {
    const { ctx, w, h } = canvasFit(cv, cv.parentElement.clientHeight / Math.max(1, cv.parentElement.clientWidth));
    ctx.clearRect(0, 0, w, h); off += dt * 60;
    if (kind === 'c2') {
      for (let r = 0; r < 4; r++) {
        const y0 = h * (0.3 + r * 0.17); ctx.beginPath();
        for (let x = 0; x <= w; x += 3) { const t = (x + off * (1 + r * .3)) / 40; const env = Math.exp(-Math.pow(((x + off * 1.5 + r * 300) % (w + 600)) / 90 - 3.5, 2)); const y = y0 + Math.sin(t * 2.3 + r) * 2 + Math.sin(t * 7.1) * 1.2 + env * (Math.sin(t * 9) * (20 - r * 4)); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.strokeStyle = r === 0 ? 'rgba(13,169,166,.55)' : 'rgba(143,227,224,' + (0.18 - r * .03) + ')'; ctx.lineWidth = r === 0 ? 1.6 : 1; ctx.stroke();
      }
    } else if (kind === 'c3') {
      pts.forEach(p => { const x = ((p.x * w + off * p.v * .4) % (w + 80)) - 40, y = p.y * h + Math.sin(T * p.v + p.p) * 10; ctx.beginPath(); ctx.arc(x, y, p.r, 0, 7); ctx.strokeStyle = 'rgba(143,227,224,.28)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.arc(x + p.r * .2, y - p.r * .1, p.r * .3, 0, 7); ctx.fillStyle = 'rgba(13,169,166,.25)'; ctx.fill(); });
    } else if (kind === 'c4') {
      for (let s = 0; s < 2; s++) { ctx.beginPath(); for (let x = 0; x <= w; x += 4) { const y = h * .55 + Math.sin(x / 38 + T * 1.2 + s * Math.PI) * h * .16; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = s ? 'rgba(193,180,137,.45)' : 'rgba(13,169,166,.55)'; ctx.lineWidth = 2; ctx.stroke(); }
      for (let x = 0; x <= w; x += 24) { const a = Math.sin(x / 38 + T * 1.2), y1 = h * .55 + a * h * .16, y2 = h * .55 - a * h * .16; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.strokeStyle = 'rgba(143,227,224,.18)'; ctx.lineWidth = 2; ctx.stroke(); }
    } else if (kind === 'c5') {
      const cx = w * .22, cy = h * .5; ctx.fillStyle = 'rgba(200,64,44,.5)'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill();
      for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(k * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, 0, h * .42, h * .15, 0, 0, 7); ctx.strokeStyle = 'rgba(143,227,224,.25)'; ctx.lineWidth = 1.2; ctx.stroke(); const a = T * (1 + k * .3) + k; ctx.fillStyle = 'rgba(13,169,166,.8)'; ctx.beginPath(); ctx.arc(Math.cos(a) * h * .42, Math.sin(a) * h * .15, 4, 0, 7); ctx.fill(); ctx.restore(); }
    } else if (kind === 'c6') {
      const s = 34; for (let y = 10; y < h; y += s + 6) for (let x = 10; x < w; x += s + 6) { const k = Math.sin(x * .03 + y * .05 + T); ctx.strokeStyle = 'rgba(143,227,224,' + (0.08 + 0.1 * Math.max(0, k)) + ')'; ctx.strokeRect(x, y, s, s); }
    } else {
      ctx.strokeStyle = 'rgba(143,227,224,.10)'; for (let x = (off % 40); x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.beginPath(); for (let x = 0; x <= w; x += 4) { const y = h * .75 - Math.pow(x / w, 1.6) * h * .5 + Math.sin(x / 30 + T) * 3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = 'rgba(13,169,166,.55)'; ctx.lineWidth = 2; ctx.stroke();
    }
  });
}

/* ── قصاصات صفحات الكتاب ── */
function fig(p, b, cap) {
  const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0, PW = CTX.PW, PH = CTX.PH;
  const st = `aspect-ratio:${w}/${h};background-image:url(${CTX.src(p)});background-size:${PW / w * 100}% auto;background-position:${w >= PW ? 0 : x0 / (PW - w) * 100}% ${h >= PH ? 0 : y0 / (PH - h) * 100}%`;
  return `<figure class="bfig"><div class="bimg" data-zoom="${p}:${b.join(',')}" style="${st}"></div><figcaption><span>${cap || ''}</span><button class="pchip" data-page="${p}">ص ${AR(p)}</button></figcaption></figure>`;
}
const pageBtn = (p, t) => `<button class="pchip" data-page="${p}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>${t || 'في الكتاب'}</button>`;
const modelBtn = id => `<button class="pchip m3" data-model="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12M21 7l-9 5-9-5"/></svg>نموذج ثلاثي الأبعاد</button>`;

/* ── بناء بيانات الدرس من بياناته في الكتاب ── */
const STATS = {
  scimethod: [['٥', 'حواسّ نلاحظ بها'], ['١٨٧١م', 'وباء الكوليرا في القصة'], ['٣', 'مهارات: ملاحظة وقياس ومقارنة'], ['٢', 'تفسيران: نظرية وقانون']],
  doingsci: [['٢', 'نوعا البحث: وصفي وتجريبي'], ['٦', 'خطوات لحلّ المشكلة'], ['SI', 'النظام العالمي للوحدات'], ['١', 'متغيّر مستقل في كل تجربة']],
  scitech: [['أرسطو', 'أوّل تصنيف: نبات وحيوان'], ['الإنسولين', 'دواء تنتجه البكتيريا'], ['الإنترنت', 'ينشر الاكتشافات بسرعة'], ['٣', 'محاور: علم وتقنية ومجتمع']],
  volcanoes: [['٣', 'أشكال للبراكين'], ['٢٠٠ كم/س', 'سرعة تدفّق الفتات البركاني'], ['١٤٠٠٠ م', 'ارتفاع الرماد البركاني'], ['٧', 'ثورانات في الجدول ٢']],
  plates: [['١٣', 'صفيحة رئيسة'], ['١٠٠ كم', 'سُمك الغلاف الصخري'], ['٨٠٪', 'من الزلازل في الحزام الناري'], ['١٢', 'حرّة بركانية في المملكة']],
  cellact: [['٣', 'أنواع للنقل السلبي'], ['٦CO₂', 'في معادلة البناء الضوئي'], ['٢', 'طريقتا تحرير الطاقة'], ['الميتوكندريا', 'مصنع الطاقة في الخلية']],
  celldiv: [['٤٦', 'كروموسومًا في الخلية الجسمية'], ['٢٣', 'في الخلية الجنسية'], ['٤', 'أطوار للانقسام المتساوي'], ['٤', 'خلايا من الانقسام المنصّف']],
  dna: [['٤', 'قواعد نيتروجينية'], ['١٩٥٣م', 'نموذج واطسون وكريك'], ['٣', 'أنواع RNA'], ['٢', 'سلسلتان في DNA']],
  genetics: [['٣٠٠٠٠', 'نبتة بازلاء درسها مندل'], ['٣ : ١', 'نسبة الجيل الثاني'], ['١٨٥٦م', 'بداية تجارب مندل'], ['٧', 'صفات في الجدول ١']],
  atommodels: [['٢٥٠٠', 'سنة من التساؤل عن المادة'], ['٣', 'جسيمات في الذرة'], ['١٩٠٦م', 'تجربة رذرفورد'], ['٢٫٤ كم', 'قطر الذرة لو كانت النواة كرة تنس']],
  nucleus: [['٩٢', 'العدد الذري لليورانيوم'], ['٣', 'نظائر للكربون'], ['٥٧٣٠', 'سنة عمر نصف الكربون-١٤'], ['٨ أيام', 'عمر نصف اليود-١٣١']],
  ptintro: [['١٨٦٩م', 'جدول مندليف'], ['٧', 'دورات'], ['١٨', 'مجموعة'], ['١١٨', 'عنصرًا في الجدول']],
  representative: [['٨', 'مجموعات ممثّلة'], ['٨٠٪', 'نيتروجين في الهواء'], ['٢٠٪', 'أكسجين في الهواء'], ['١٧', 'عنصرًا لافلزيًّا']],
  transition: [['١٠', 'مجموعات (٣–١٢)'], ['٣٤١٠°س', 'انصهار التنجستون'], ['−٣٩°س', 'انصهار الزئبق'], ['٣', 'عناصر ثلاثية الحديد']]
};
function buildD(L) {
  const secs = [{ id: 'intro', t: 'التهيئة والأهداف' }], secPage = { intro: L.from }, secPg = { intro: AR(L.from) };
  L.sections.forEach(s => { const t = s.title.includes(': ') ? s.title.split(': ')[0] : s.title; secs.push({ id: s.id, t }); secPage[s.id] = s.pages[0]; secPg[s.id] = pgs(s.pages); });
  secs.push({ id: 'review', t: 'المراجعة والتقويم' }, { id: 'nafes', t: 'تدريب نافس' }); secPage.review = L.to; secPg.review = AR(L.to); secPage.nafes = L.from; secPg.nafes = '';
  const key = L.vocab.filter(v => v.key), prior = L.vocab.filter(v => v.prior);
  const LV = ['معرفة', 'تطبيق', 'استدلال'];
  const nafes = (CTX.nafes ? CTX.nafes.items.filter(i => i.lid === L.id) : []).map(i => ({ lv: LV[i.lv], q: i.q, o: i.o, a: i.a, ex: 'الإجابة الصحيحة: «' + i.o[i.a] + '». راجع الكتاب ص ' + AR(i.p) + '.' }));
  const assist = [];
  key.concat(prior).forEach(v => assist.push([[v.w], v.w + ': ' + strip(v.d) + ' (ص ' + AR(v.p) + ')']));
  const AD = L.assist || {};
  L.sections.forEach(s => { const a = (AD.sections || {})[s.id] || {}; const words = s.title.split(/[:،\s]+/).filter(w => w.length > 3); if (a.why) assist.push([words, strip(a.why) + (a.simple ? ' — ' + strip(a.simple) : '')]); });
  (AD.pairs || []).forEach(p => assist.push([[p[0], p[1], 'الفرق'], 'الفرق بين ' + p[0] + ' و' + p[1] + ': ' + strip(p[2])]));
  const sugg = key.slice(0, 4).map(v => 'ما ' + v.w + '؟').concat((AD.pairs || []).slice(0, 2).map(p => 'الفرق بين ' + p[0] + ' و' + p[1]));
  const mcq = (L.quiz.mcq || []).map(m => ({ q: m.q, o: m.o, a: m.a, p: m.p })).concat((L.quiz.tf || []).map(t => ({ q: 'صواب أم خطأ: ' + t.q, o: ['صواب', 'خطأ'], a: t.a ? 0 : 1, p: t.p })));
  const match = shuffle(key).slice(0, 5).map(v => { const d = strip(v.d); return [v.w, d.length > 70 ? d.slice(0, 68) + '…' : d]; });
  const selftest = (L.quiz.open || []).map(o => { const m = o.q.match(/^([^:]{2,22}):\s*(.*)$/); return m ? [m[1], m[2], o.a] : ['أجب', o.q, o.a]; });
  const bank = [...new Set(((L.quiz.fill && L.quiz.fill.bank) || []).concat(key.map(v => v.w)))];
  const fill = ((L.quiz.fill && L.quiz.fill.items) || []).map(it => { const o = shuffle([it.a, ...shuffle(bank.filter(b => b !== it.a)).slice(0, 3)]); return { q: it.q, o, a: o.indexOf(it.a), p: it.p }; });
  const wheel = L.sections.flatMap(s => s.check.map(c => strip(c.q))).slice(0, 10);
  return { id: L.id, name: shortName(L), secs, secPage, secPg, vocab: key.map(v => [v.w, '', strip(v.d), v.p]), prior: prior.map(v => [v.w, strip(v.d)]), mcq, match, selftest, fill, wheel, nafes, assist, sugg };
}

/* ── ألعاب الدرس داخل الأقسام (بتصميم الدرس التجريبي) ── */
function sortGame(el, G, key) {
  const items = shuffle(G.items.map(([t, k]) => ({ t, k: String(k) })));
  el.innerHTML = `<div class="pool gpool"></div><div class="dz gdz" style="--n:${Math.min(G.cats.length, 4)}">${G.cats.map((c, i) => `<div class="bin gbin" data-bin="${i}"><h4>${c}</h4><div class="pool"></div></div>`).join('')}</div><div class="callout ok mt" style="display:none">أحسنت! صنّفتَ جميع البطاقات تصنيفًا صحيحًا.</div>`;
  const pool = el.querySelector('.gpool'), bins = $$('.gbin', el); let sel = null, ok = 0;
  items.forEach(it => { const c = document.createElement('div'); c.className = 'chip'; c.textContent = it.t; c.dataset.k = it.k; pool.appendChild(c); });
  const drop = (chip, bin) => { if (!chip || chip.classList.contains('ok')) return; if (chip.dataset.k === bin.dataset.bin) { chip.classList.remove('sel'); chip.classList.add('ok'); bin.querySelector('.pool').appendChild(chip); if (++ok === items.length) { el.querySelector('.callout').style.display = 'block'; award(key, 15); } } else { chip.classList.remove('bad'); void chip.offsetWidth; chip.classList.add('bad'); } };
  bins.forEach(b => b.addEventListener('click', () => { if (sel) { drop(sel, b); sel && sel.classList.remove('sel'); sel = null; } }));
  let dg = null, ghost = null, sx = 0, sy = 0, moved = false;
  pool.addEventListener('pointerdown', e => { const c = e.target.closest('.chip'); if (!c || c.classList.contains('ok')) return; dg = c; sx = e.clientX; sy = e.clientY; moved = false; });
  const mv = e => { if (!dg) return; if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return; if (!moved) { moved = true; ghost = dg.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost); dg.style.opacity = .35; } ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (e.clientY - 20) + 'px'; bins.forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('over', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }); };
  const up = () => { if (!el.isConnected) { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); return; } if (!dg) return; if (moved) { const b = bins.find(b => b.classList.contains('over')); if (b) drop(dg, b); dg.style.opacity = ''; ghost && ghost.remove(); bins.forEach(b => b.classList.remove('over')); } else { if (sel) sel.classList.remove('sel'); sel = dg === sel ? null : dg; if (sel) sel.classList.add('sel'); } dg = null; ghost = null; };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function orderGame(el, G, key) {
  let next = 0; const order = shuffle(G.steps.map((t, i) => ({ t, i })));
  el.innerHTML = `<ol class="olist"></ol><div class="pool opool"></div><div class="row mt"><button class="btn ghost sm" data-reset>إعادة</button><span class="small muted">انقر البطاقات بالترتيب الصحيح.</span></div><div class="callout ok mt" style="display:none">ممتاز! رتّبتَ الخطوات ترتيبًا صحيحًا.</div>`;
  const ol = el.querySelector('.olist'), pool = el.querySelector('.opool');
  const draw = () => { pool.innerHTML = ''; order.forEach(o => { const c = document.createElement('button'); c.className = 'chip'; c.textContent = o.t; c.onclick = () => { if (o.i === next) { const li = document.createElement('li'); li.textContent = o.t; ol.appendChild(li); c.remove(); if (++next === G.steps.length) { el.querySelector('.callout').style.display = 'block'; award(key, 15); } } else { c.classList.remove('bad'); void c.offsetWidth; c.classList.add('bad'); } }; pool.appendChild(c); }); };
  el.querySelector('[data-reset]').onclick = () => { next = 0; ol.innerHTML = ''; el.querySelector('.callout').style.display = 'none'; draw(); };
  draw();
}

/* ── HTML الأقسام لدرسٍ عام ── */
function genericHTML(L) {
  const E = L.engage, X = L.explore || {}, key = L.vocab.filter(v => v.key), prior = L.vocab.filter(v => v.prior), st = STATS[L.id] || [];
  const verb = t => { const w = t.split(' ')[0]; return w.replace(/ُ/g, '').length <= 9 ? w : 'أتعلّم'; };
  let h = `<section class="sec" data-id="intro">
  <div class="hero"><canvas id="heroCv"></canvas><div class="in">
    <span class="eyebrow">العلوم · الصف الثالث المتوسط · ${esc(L.title)}</span>
    <h1>${esc(shortName(L))}</h1>
    <div class="sub">${L.essential}</div>
    <div class="stats">${st.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
    <div class="row" style="margin-top:22px"><button class="btn teal" data-go="${L.sections[0].id}">ابدأ الدرس</button><button class="btn ghost" data-page="${L.from}" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">صفحات الكتاب</button><button class="btn gold" data-games>الألعاب التفاعلية</button></div>
  </div></div>
  <p class="lead mt">${E.look}</p>
  <div class="grid g32 mt">
    <div class="card"><h3>أنظر وأتساءل <span class="tag">ص ${AR(E.page)}</span></h3>
      <p style="font-weight:800;color:var(--navy-d);margin:0 0 10px">${E.question}</p>
      ${E.choices ? `<div class="small muted">اختر كلَّ ما تتوقّعه، ثم اكشف الإجابة:</div><div class="pool mt" id="enChips">${E.choices.map((c, i) => `<button class="chip" data-i="${i}">${c}</button>`).join('')}</div>` : ''}
      <div class="row mt"><button class="btn teal sm" id="enRev">اكشف الإجابة</button></div>
      <div class="callout ok mt" id="enAns" style="display:none">${E.reveal}</div>
      ${(E.warmups || []).length ? `<div class="mt small" style="font-weight:800;color:var(--navy)">للنقاش (فكّر – زاوج – شارك):</div>${E.warmups.map(w => `<p class="small" style="margin:4px 0">• ${w.q}</p>`).join('')}` : ''}
    </div>
    <div class="card">${E.crop ? fig(E.page, E.crop, E.caption) : ''}</div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h3>الأهداف <span class="tag">في هذا الدرس</span></h3>
      ${L.objectives.map(o => `<div class="obj"><span class="v">${verb(o.t)}</span><span>${o.t.split(' ').slice(1).join(' ')}</span></div>`).join('')}
    </div>
    <div class="card"><h3>المفردات</h3>
      ${prior.length ? `<div class="small muted" style="margin-bottom:6px">مراجعة: ${prior.map((p, i) => `<span class="vchip" data-v="prior" data-pi="${i}" style="display:inline-block;padding:2px 10px">${p.w}</span>`).join(' ')}</div>` : ''}
      <div class="vgrid" id="vgrid">${key.map((v, i) => `<button class="vchip" data-v="${i}">${v.w}</button>`).join('')}</div>
      <div class="vdef" id="vdef">اختر مفردة لعرض تعريفها من الكتاب.</div>
    </div>
  </div>
  <div class="card mt"><h3>جدول التعلّم (KWL) <span class="tag">يُحفظ تلقائيًّا على جهازك</span></h3>
    <div class="kwl"><div><h4>ماذا أعرف عن ${esc(shortName(L))}؟</h4><textarea data-kwl="k" placeholder="اكتب ما تعرفه…"></textarea></div><div><h4>ماذا أريد أن أعرف؟</h4><textarea data-kwl="w" placeholder="اكتب أسئلتك…"></textarea></div><div><h4>ماذا تعلّمت؟</h4><textarea data-kwl="l" placeholder="تُكمل في نهاية الدرس…"></textarea></div></div>
  </div>
  ${X.title ? `<div class="card mt"><h3>${X.kind ? X.kind.replace(/^\S+\s/, '') : 'تجربة'}: ${X.title} <span class="tag lab">ص ${AR(X.page)}</span></h3>
    ${X.intro ? `<p style="margin-top:0">${X.intro}</p>` : ''}
    <div class="grid g2" style="gap:14px">
      <div>${X.needs ? `<div class="small" style="font-weight:800;color:var(--navy)">المواد والأدوات</div><div class="pool mt" style="margin-bottom:10px">${X.needs.map(n => `<span class="chip" style="cursor:default">${n}</span>`).join('')}</div>` : ''}
        ${X.steps ? `<div class="small" style="font-weight:800;color:var(--navy)">الخطوات</div><ol style="padding-inline-start:20px;margin:6px 0">${X.steps.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}</div>
      <div>${(X.concl || []).map(c => `<div class="wq mt"><div class="qq"><span>${c.q}</span><button class="btn sm ghost" data-wq>الإجابة</button></div><div class="aa">${c.a}</div></div>`).join('')}
        ${X.more ? `<p class="small muted">${X.more}</p>` : ''}</div>
    </div></div>` : ''}
</section>`;
  L.sections.forEach((S_, si) => {
    const [k, t2] = S_.title.includes(': ') ? S_.title.split(': ') : [shortName(L), S_.title];
    const body = S_.body.slice(), lead = body.shift();
    const figs = S_.clips.map(c => fig(c.p, c.b, 'الكتاب')).join('');
    const sim = S_.sim && SIMS[S_.sim], game = S_.game;
    const bookCard = `<div class="card"><h3>من الكتاب <span class="tag">ص ${pgs(S_.pages)}</span></h3>${figs}${body.map(p => `<p>${p}</p>`).join('')}</div>`;
    const gameCard = game ? `<div class="card${sim ? ' mt' : ''}"><h3>${game.title} <span class="tag lab">${game.type === 'sort' ? 'صنّف: اسحب البطاقة أو انقرها ثم انقر الصندوق' : 'رتّب'}</span></h3><div data-game="${si}"></div></div>` : '';
    h += `<section class="sec" data-id="${S_.id}">
  <div class="shead"><div><div class="k">${k}</div><h2>${t2}</h2><p>${lead}</p></div><div class="sp"></div>${S_.model ? modelBtn(S_.model) : ''}${pageBtn(S_.pages[0], 'ص ' + pgs(S_.pages))}</div>
  ${sim ? `<div class="grid g32"><div class="simhost" data-sim="${S_.sim}"></div>${bookCard}</div>${gameCard}` : game ? `<div class="grid g23">${gameCard}${bookCard}</div>` : bookCard}
  <div class="grid g2 mt">${S_.check.map((c, i) => `<div class="wq"><div class="qq"><span class="tag q">${i ? 'استنتج' : 'ماذا قرأت؟'}</span><span>${c.q}</span><button class="btn sm ghost" data-wq>الإجابة</button></div><div class="aa">${c.a}</div></div>`).join('')}</div>
</section>`;
  });
  const sumCards = L.summary.map((s, i) => `<div class="card flat"><h3 style="font-size:16.5px">${AR(i + 1)}</h3><p class="small" style="margin:4px 0">• ${s.t}</p></div>`).join('');
  h += `<section class="sec" data-id="review">
  <div class="shead"><div><div class="k">مراجعة الدرس</div><h2>الخلاصة والتقويم</h2></div><div class="sp"></div>${pageBtn(L.to, 'ص ' + AR(L.to))}</div>
  <div class="grid g3">${sumCards}</div>
  <div class="grid g2 mt">
    <div class="card"><h3>اختبار سريع <span class="tag lab">اختيار من متعدد</span></h3><div id="mcq" class="qbox"></div></div>
    <div class="card"><h3>صِل المفردة بتعريفها <span class="tag lab">توصيل</span></h3><div id="match" class="match"></div><div class="callout ok mt" id="matchDone" style="display:none">ممتاز! جميع التوصيلات صحيحة.</div></div>
  </div>
  ${D.fill.length ? `<div class="card mt"><h3>أكمل الفراغ <span class="tag lab">اختر الكلمة المناسبة</span></h3><div id="fillq" class="qbox"></div></div>` : ''}
  <div class="card mt"><h3>اختبر نفسك <span class="tag">ص ${AR(L.to)}</span></h3><div id="selftest"></div></div>
  <div class="card mt"><h3>عجلة الأسئلة <span class="tag lab">للنقاش الصفّي</span></h3><div class="wheelBox"><canvas id="whCv" width="600" height="600"></canvas><div style="flex:1;min-width:220px"><div class="wheelQ" id="whQ">أدر العجلة لاختيار سؤال للنقاش.</div><button class="btn teal mt" id="whGo">أدر العجلة</button></div></div></div>
</section>
<section class="sec" data-id="nafes">
  <div class="shead"><div><div class="k">الاستعداد للاختبارات الوطنية</div><h2>تدريب نافس</h2><p>أسئلة بأسلوب «نافس» مرتبطة بهذا الدرس على ثلاثة مستويات: معرفة وتطبيق واستدلال، ولكل سؤال تفسير.</p></div></div>
  <div id="nafesBox"></div>
</section>`;
  return h;
}

/* ── تهيئة أقسام الدرس العام ── */
function genericInit(L) {
  const key = L.vocab.filter(v => v.key), prior = L.vocab.filter(v => v.prior);
  heroInit(chapOf(L));
  const chips = $$('#enChips .chip'); chips.forEach(c => c.onclick = () => c.classList.toggle('sel'));
  $('#enRev').onclick = () => { $('#enAns').style.display = 'block'; const ok = L.engage.ok || []; chips.forEach(c => { if (ok.includes(+c.dataset.i)) c.classList.add('ok'); }); award('engage', 5); };
  L.sections.forEach((S_, si) => {
    const sc = $(`[data-sim="${S_.sim}"]`); if (sc && SIMS[S_.sim]) { try { SIMS[S_.sim](sc, { award: (n, why) => award('sim:' + S_.sim, Math.max(5, n * 5)), AR }); } catch (e) { console.warn(e); } }
    const gEl = $(`[data-game="${si}"]`); if (gEl && S_.game) (S_.game.type === 'sort' ? sortGame : orderGame)(gEl, S_.game, 'g' + si);
  });
  $$('.vchip[data-v]').forEach(b => b.onclick = () => {
    $$('.vchip').forEach(x => x.classList.toggle('on', x === b));
    if (b.dataset.v === 'prior') { const p = prior[+b.dataset.pi || 0]; $('#vdef').innerHTML = '<b>' + p.w + '</b> (مراجعة): ' + p.d; return; }
    const v = key[+b.dataset.v]; $('#vdef').innerHTML = '<b>' + v.w + '</b><br>' + v.d + ' <span style="opacity:.6">(ص ' + AR(v.p) + ')</span>';
    S.vseen = S.vseen || {}; S.vseen[v.w] = 1; if (Object.keys(S.vseen).length >= Math.min(5, key.length)) award('vocab', 5);
  });
  const inits = [() => mcqWidget($('#mcq'), D.mcq, 'mcq'), () => makeMatch($('#match'), D.match, 'match', () => $('#matchDone').style.display = 'block'), () => D.fill.length && mcqWidget($('#fillq'), D.fill, 'fill'), selftestInit, wheelInit, nafesInit];
  inits.forEach(f => { try { f(); } catch (e) { console.error('init', e); } });
}

/* ── درس الزلازل: تصميم الدرس التجريبي كما هو ── */
function quakesInit() {
  heroInit('c2');
  $$('.vchip[data-v]').forEach(b => b.onclick = () => {
    $$('.vchip').forEach(x => x.classList.toggle('on', x === b));
    if (b.dataset.v === 'prior') { const [t, d] = D.prior[0]; $('#vdef').innerHTML = '<b>' + t + '</b> (مراجعة): ' + d; return; }
    const v = D.vocab[+b.dataset.v]; $('#vdef').innerHTML = '<b>' + v[0] + '</b> <span style="opacity:.7">' + v[1] + '</span><br>' + v[2] + ' <span style="opacity:.6">(ص ' + AR(v[3]) + ')</span>';
    S.vseen = S.vseen || {}; S.vseen[v[0]] = 1; if (Object.keys(S.vseen).length >= 5) award('vocab', 5);
  });
  const inits = [reboundInit, toffeeInit, faultInfoInit, focusInit, wavesInit, seismoInit, ttInit, triInit, richterInit, mercalliInit, table1Init, tsunamiInit, tsQuizInit, sortInit, buildingInit, flipInit,
    () => mcqWidget($('#mcq'), D.mcq, 'mcq'), () => makeMatch($('#match'), D.match, 'match', () => $('#matchDone').style.display = 'block'), selftestInit, wheelInit, nafesInit];
  inits.forEach(f => { try { f(); } catch (e) { console.error('init', f.name, e); } });
}

/* ── الهيكل الثابت ── */
function skeleton() {
  const st = document.createElement('style'); st.id = 'laCSS'; st.textContent = LA_CSS; document.head.appendChild(st);
  const app = document.createElement('div'); app.id = 'lessonApp';
  app.innerHTML = `<header id="ltop">
  <button class="tbtn" id="menuBtn" aria-label="القائمة"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  <div class="brand"><div class="logo"><svg id="laIcon" width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></svg></div>
    <div style="min-width:0"><div class="t1" id="laT1"></div><div class="t2" id="laT2"></div></div></div>
  <div class="sp"></div>
  <div class="prog"><span>تقدّمك</span><div class="bar"><i id="progBar"></i></div></div>
  <div class="pts" id="pts">٠ نقطة</div>
  <button class="tbtn" id="bookBtn" style="background:var(--teal);border-color:var(--teal)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg><span>العودة إلى الكتاب</span></button>
  <button class="tbtn" id="gamesBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/></svg><span>الألعاب</span></button>
  <button class="tbtn" id="toolsBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg><span>العجلة وأدوات الفصل</span></button>
  <button class="tbtn" id="penBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg><span>قلم</span></button>
  <button class="tbtn" id="presentBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 16v5"/></svg><span>عرض المعلم</span></button>
</header>
<nav id="lnav"><div class="lbl">محتوى الدرس</div><div id="lnavList"></div><div class="foot">${CREDIT}<br><span style="opacity:.7">العلوم · الصف الثالث المتوسط · تعمل دون إنترنت</span></div></nav>
<main id="lmain"><div class="wrap" id="lwrap"></div></main>
<nav id="lpager"><button class="btn ghost" id="lsPrev">→ السابق</button><div class="mid"><div id="pgTitle"></div><div class="credit">${CREDIT}</div></div><button class="btn" id="lsNext">التالي ←</button></nav>
<button id="asstBtn" aria-label="المساعد"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg></button>
<div class="ovl" id="asst"><div class="panel"><div class="ph"><b>مساعد الدرس</b><span class="tag">إجابات من الكتاب فقط</span><button class="x" data-close>✕</button></div>
<div class="pb"><div class="msgs" id="asMsgs"></div><div class="sugg" id="asSugg"></div><form id="asForm"><input id="asIn" placeholder="اكتب سؤالك…" autocomplete="off"><button class="btn teal">إرسال</button></form></div></div></div>
<div class="ovl" id="figZoom"><div class="panel" style="max-width:min(1100px,96vw)"><div class="ph"><b>من الكتاب</b><button class="x" data-close>✕</button></div><div class="pb" id="figZoomB"></div></div></div>
<canvas id="penLayer"></canvas>
<div id="penBar"><button data-pc="#c8402c" class="on" style="color:#ff7a5c">●</button><button data-pc="#0da9a6" style="color:#0da9a6">●</button><button data-pc="#f2c94c" style="color:#f2c94c">●</button><button data-pc="#ffffff">●</button><button id="penClr" title="مسح">⌫</button><button id="penX" title="إغلاق">✕</button></div>`;
  document.body.appendChild(app);
  const chip = document.createElement('button'); chip.id = 'lessonChip'; chip.title = 'افتح الدرس التفاعلي'; chip.style.display = 'none'; document.body.appendChild(chip);
  const back = document.createElement('button'); back.id = 'laBack'; back.textContent = '↩ العودة إلى الدرس'; back.style.display = 'none'; document.body.appendChild(back);
  back.onclick = () => { back.style.display = 'none'; CTX.closeModel(); setTimeout(() => openLA(CURL), 450); };
  chip.onclick = () => { let n = CTX.cur(), L = findAt(n); if (!L && window.__book && window.__book.mode === 'spread') { n++; L = findAt(n); } if (L) openLA(L, secForPage(L, n)); };

  $('#lsNext').onclick = () => go(cur + 1); $('#lsPrev').onclick = () => go(cur - 1);
  $('#menuBtn').onclick = () => document.body.classList.toggle('navOpen');
  document.addEventListener('keydown', e => {
    if (!LA.open || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft' || e.key === 'PageDown') go(cur + 1);
    if (e.key === 'ArrowRight' || e.key === 'PageUp') go(cur - 1);
    if (e.key === 'Escape') { if ($('.ovl.show')) $$('.ovl.show').forEach(o => o.classList.remove('show')); else if (PEN.on) penToggle(false); else closeLA(); }
  });
  $('#bookBtn').onclick = () => closeLA(D.secPage[D.secs[cur].id] || CURL.from);
  $$('#lessonApp [data-close]').forEach(b => b.onclick = () => b.closest('.ovl').classList.remove('show'));
  $$('#lessonApp .ovl').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); }));
  app.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g && g.closest('#lessonApp')) { go(g.dataset.go); return; }
    const p = e.target.closest('[data-page]'); if (p) { closeLA(+p.dataset.page); return; }
    const m = e.target.closest('[data-model]'); if (m) { const id = m.dataset.model; closeLA(); $('#laBack').style.display = 'block'; CTX.openModel(id); return; }
    if (e.target.closest('[data-games]')) { CTX.games(GL()); return; }
    const z = e.target.closest('[data-zoom]'); if (z) { const [p_, b] = z.dataset.zoom.split(':'); $('#figZoomB').innerHTML = fig(+p_, b.split(',').map(Number), ''); $('#figZoom').classList.add('show'); return; }
    const w = e.target.closest('[data-wq]'); if (w) { const q = w.closest('.wq'); const o = q.classList.toggle('open'); w.textContent = o ? 'إخفاء' : 'الإجابة'; if (o) award('wq' + $$('#lessonApp .wq').indexOf(q), 2); }
  });
  $('#asstBtn').onclick = () => { $('#asst').classList.add('show'); setTimeout(() => $('#asIn').focus(), 50); };
  $('#asForm').onsubmit = e => { e.preventDefault(); const q = $('#asIn').value.trim(); if (q) { asSay(q); $('#asIn').value = ''; } };
  $('#presentBtn').onclick = () => { const on = document.body.classList.toggle('present'); try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); else if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {} window.dispatchEvent(new Event('resize')); };
  $('#toolsBtn').onclick = () => CTX.tools(GL());
  $('#gamesBtn').onclick = () => CTX.games(GL());
  $('#penBtn').onclick = () => penToggle(!PEN.on);
  const pl = $('#penLayer'), pctx = pl.getContext('2d');
  pl.addEventListener('pointerdown', e => { PEN.draw = true; PEN.last = [e.clientX, e.clientY]; });
  pl.addEventListener('pointermove', e => { if (!PEN.draw) return; pctx.strokeStyle = PEN.col; pctx.lineWidth = 4; pctx.lineCap = 'round'; pctx.beginPath(); pctx.moveTo(...PEN.last); pctx.lineTo(e.clientX, e.clientY); pctx.stroke(); PEN.last = [e.clientX, e.clientY]; });
  addEventListener('pointerup', () => PEN.draw = false);
  $$('#penBar [data-pc]').forEach(b => b.onclick = () => { PEN.col = b.dataset.pc; $$('#penBar [data-pc]').forEach(x => x.classList.toggle('on', x === b)); });
  $('#penClr').onclick = () => pctx.clearRect(0, 0, pl.width, pl.height);
  $('#penX').onclick = () => penToggle(false);
  requestAnimationFrame(tick);
}

function secForPage(L, n) { if (L.kind === 'chx') { const d = chxD(L); const s = d.secs.slice().reverse().find(x => d.secPage[x.id] <= n); return s ? s.id : 'launch'; } const d = L.id === 'quakes' ? QD : null; if (d) { const s = d.secs.slice().reverse().find(x => d.secPage[x.id] <= n && x.id !== 'nafes' && x.id !== 'review'); return s ? s.id : 'intro'; } const s = L.sections.slice().reverse().find(x => x.pages[0] <= n); return s && n > L.from ? s.id : 'intro'; }

function render(L) {
  CURL = L; SP = 'sci9la:' + L.id + ':'; f3started = false; fault3dStop();
  S = { pts: store.get('pts', 0), done: store.get('done', {}), seen: store.get('seen', {}) };
  D = L.id === 'quakes' ? Object.assign({ id: 'quakes', name: 'الزلازل' }, QD) : L.kind === 'chx' ? chxD(L) : buildD(L);
  const ch = chapOf(L);
  $('#laIcon').innerHTML = ICON[ch] || ICON.c1;
  $('#laT1').textContent = shortName(L);
  $('#laT2').textContent = 'العلوم · الصف الثالث المتوسط · ' + L.title + ' · ص ' + AR(L.from) + '–' + AR(L.to);
  $('#lnavList').innerHTML = D.secs.map((s, i) => `<a data-go="${s.id}" class="${s.id === 'nafes' ? 'nafes' : ''}"><span class="n">${AR(i + 1)}</span><span>${s.t}</span><span class="pg">${D.secPg[s.id] || ''}</span></a>`).join('');
  $('#lwrap').innerHTML = L.id === 'quakes' ? QHTML : L.kind === 'chx' ? chxHTML(L) : genericHTML(L);
  $('#asMsgs').innerHTML = '<div class="m b">أهلًا! اسألني عن أيّ مفهوم في درس «' + D.name + '»' + (D.vocab.length ? ': ' + D.vocab.slice(0, 5).map(v => v[0]).join('، ') + '…' : '.') + '</div>';
  $('#asSugg').innerHTML = ''; (D.sugg || []).forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = () => asSay(q); $('#asSugg').appendChild(b); });
  $$('[data-kwl]').forEach(t => { t.value = store.get('kwl_' + t.dataset.kwl, ''); t.addEventListener('input', () => store.set('kwl_' + t.dataset.kwl, t.value)); });
  $('#pts').textContent = AR(S.pts) + ' نقطة';
}
function openLA(L, sec) {
  if (!L) return;
  $('#laBack').style.display = 'none';
  const fresh = !CURL || CURL.id !== L.id;
  LA.open = true; $('#lessonApp').classList.add('open'); document.body.classList.add('lsOpen');
  if (fresh) { render(L); (L.id === 'quakes' ? quakesInit : L.kind === 'chx' ? chxInit : genericInit)(L); }
  go(sec || store.get('cur', 'intro'));
}
function closeLA(page) {
  if (!LA.open) return; LA.open = false; penToggle(false);
  if (document.body.classList.contains('present')) { document.body.classList.remove('present'); try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {} }
  $('#lessonApp').classList.remove('open'); document.body.classList.remove('lsOpen', 'navOpen');
  if (page) CTX.goTo(page);
}

export function initLessonApp(lessons, ctx) {
  LESSONS = lessons; CTX = ctx; skeleton();
  CHS = CHX.map(X => Object.assign(X, { kind: 'chx', title: 'الفصل ' + ORD[X.n] + ': ' + X.title, chapter: 'الفصل ' + ORD[X.n] + ': ' + X.title, from: X.rOpen[0], to: X.test ? X.test.pages[X.test.pages.length - 1] : X.rClose[1], lessons: lessons.filter(L => L.chapter.startsWith('الفصل ' + ORD[X.n] + ':')) }));
  return {
    open: (L, sec) => openLA(L, sec || (L ? secForPage(L, ctx.cur()) : null)),
    close: () => closeLA(),
    isOpen: () => LA.open,
    chx: CHS,
    openChx: (i, sec) => openLA(CHS[i], sec),
    update(n) {
      const sp = window.__book && window.__book.mode === 'spread', L = findAt(n) || (sp ? findAt(n + 1) : null), c = $('#lessonChip');
      if (!L) { c.style.display = 'none'; return; }
      if (L.kind === 'chx') { const late = n >= L.rClose[0]; c.innerHTML = 'الفصل ' + AR(L.n) + ': ' + (late ? (L.test && n >= L.test.pages[0] ? 'الاختبار المقنن' : 'مراجعة الفصل') : 'نشاطات تمهيدية وأتهيأ للقراءة') + ' <b>ابدأ النشاط التفاعلي</b>'; }
      else c.innerHTML = esc(L.title) + ' <b>ابدأ الدرس التفاعلي</b>';
      c.style.display = '';
    }
  };
}

/* ═══════════ نشاطات الفصل: تمهيدية · أتهيأ للقراءة · مراجعة الفصل · الاختبار المقنن ═══════════ */
const LTR = ['أ', 'ب', 'ج', 'د'];
const cropFig = (c, cap) => c ? fig(c[0], c[1], cap || '') : '';
function chxD(X) {
  const secs = [{ id: 'launch', t: 'التجربة الاستهلالية' }, { id: 'fold', t: 'المطويات' }, { id: 'read', t: 'أتهيأ للقراءة' }, { id: 'guide', t: 'دليل مراجعة الفصل' }, { id: 'review', t: 'مراجعة الفصل' }];
  if (X.test) secs.push({ id: 'test', t: 'الاختبار المقنن' });
  const secPage = { launch: X.launch.page, fold: X.fold.page, read: X.read.pages[0], guide: X.guide.page, review: X.vocab.p };
  if (X.test) secPage.test = X.test.pages[0];
  const secPg = {}; Object.keys(secPage).forEach(k => secPg[k] = AR(secPage[k]));
  secPg.read = pgs(X.read.pages); if (X.test) secPg.test = pgs(X.test.pages);
  const ls = X.lessons || [], vocab = [], assist = [];
  ls.forEach(L => L.vocab.filter(v => v.key).forEach(v => { vocab.push([v.w, '', strip(v.d), v.p]); assist.push([[v.w], v.w + ': ' + strip(v.d) + ' (ص ' + AR(v.p) + ')']); }));
  X.read.rows.forEach(r => assist.push([r[0].split(/[\s،.]+/).filter(w => w.length > 4).slice(0, 4), r[2]]));
  return { id: X.id, name: 'الفصل ' + ORD[X.n] + ': ' + X.title, secs, secPage, secPg, vocab, assist, sugg: vocab.slice(0, 5).map(v => 'ما ' + v[0] + '؟'), nafes: [], wheel: [], selftest: [] };
}
const SIMX = {
  hands: `<div class="card dark"><h3>محاكاة: هل تصدُق اليدان؟ <span class="tag lab">تفاعلي</span></h3>
    <div class="row"><button class="btn teal sm" data-hs="1">١) اغمر اليدين: اليسرى في البارد واليمنى في الساخن</button><button class="btn sm" data-hs="2" disabled>٢) ضع اليدين معًا في الماء الفاتر</button><button class="btn ghost sm" data-hs="0">إعادة</button></div>
    <div class="hsim mt"><div class="hb" data-b="0"><b>ماء بارد</b><span>١٠°س</span></div><div class="hb" data-b="1"><b>ماء فاتر</b><span>٣٠°س</span></div><div class="hb" data-b="2"><b>ماء ساخن قليلًا</b><span>٤٥°س</span></div></div>
    <div class="grid g2 mt" style="gap:10px"><div class="callout" id="hL">اليد اليسرى: —</div><div class="callout" id="hR">اليد اليمنى: —</div></div>
    <div class="small mt" id="hT" style="color:#a9cbd6">مقياس الحرارة في الماء الفاتر: ٣٠°س (لا يتغيّر)</div></div>`,
  building: `<div class="card dark"><h3>محاكاة: هزّ الطاولة <span class="tag lab">تفاعلي</span></h3>
    <div class="row"><div class="seg" id="bdMode"><button class="on" data-m="0">مبنى بلا أشرطة</button><button data-m="1">مبنى مربوط بأشرطة مطاطية</button></div><button class="btn teal sm" id="bdShake">هُزّ الطاولة بلطف</button><button class="btn ghost sm" id="bdReset">أعد البناء</button></div>
    <canvas id="bdCv" height="260" class="mt" style="width:100%;display:block;border-radius:12px;background:#0a2230"></canvas><div class="small mt" id="bdOut" style="color:#a9cbd6"></div></div>`,
  carrot: `<div class="card dark"><h3>محاكاة: الجزر في المحاليل <span class="tag lab">تفاعلي</span></h3>
    <div class="row"><div class="seg" id="crMode"><button class="on" data-m="0">ماء مالح</button><button data-m="1">ماء عذب</button><button data-m="2">طاولة المختبر</button></div></div>
    <div class="ctl"><label>الزمن</label><input type="range" id="crT" min="0" max="30" value="0"><output id="crTo">٠ دقيقة</output></div>
    <canvas id="crCv" height="220" style="width:100%;display:block;border-radius:12px;background:#0a2230"></canvas><div class="small mt" id="crOut" style="color:#a9cbd6"></div></div>`,
  dimples: `<div class="card dark"><h3>عدّاد الصف: الغمّازات <span class="tag lab">تفاعلي</span></h3>
    <div class="grid g2" style="gap:12px"><div class="callout"><b>لهم غمّازات</b><div class="row mt"><button class="btn sm" data-dc="0" data-d="-1">−</button><b class="bigN" id="dc0">٠</b><button class="btn teal sm" data-dc="0" data-d="1">+</button></div></div>
    <div class="callout"><b>ليس لهم غمّازات</b><div class="row mt"><button class="btn sm" data-dc="1" data-d="-1">−</button><b class="bigN" id="dc1">٠</b><button class="btn teal sm" data-dc="1" data-d="1">+</button></div></div></div>
    <div class="meter mt"><i id="dcBar"></i></div><div class="mt" id="dcOut" style="color:#dbeaf0;font-weight:700">سجّل نتائج صفّك.</div></div>`,
  clay: `<div class="card dark"><h3>محاكاة: ما داخل الصلصال؟ <span class="tag lab">تفاعلي</span></h3>
    <p class="small" style="color:#a9cbd6;margin:0 0 8px">انقر على كرة الصلصال لتغرس العود؛ النقطة الحمراء تعني أنّ العود اصطدم بقطعة معدنية. خمّن العدد ثم اكشف.</p>
    <canvas id="clCv" height="300" style="width:100%;display:block;border-radius:12px;background:#0a2230;touch-action:none"></canvas>
    <div class="row mt"><label class="small">تخمينك لعدد القطع:</label><input type="number" id="clG" min="0" max="9" style="width:70px;border-radius:9px;border:0;padding:6px"><button class="btn gold sm" id="clRev">اكشف القطع</button><button class="btn ghost sm" id="clNew">صلصال جديد</button><span class="small" id="clOut" style="color:#a9cbd6"></span></div></div>`,
  tiles: `<div class="card dark"><h3>محاكاة: رتّب القصاصات في شبكة ٤×٤ <span class="tag lab">تفاعلي</span></h3>
    <p class="small" style="color:#a9cbd6;margin:0 0 8px">انقر قصاصة ثم انقر مربعًا. اجعل كل عمود لشكل واحد، ورتّب الأحجام من الأصغر (أعلى) إلى الأكبر (أسفل).</p>
    <div class="tgrid" id="tgGrid"></div><div class="tpool mt" id="tgPool"></div>
    <div class="row mt"><button class="btn teal sm" id="tgChk">تحقّق</button><button class="btn ghost sm" id="tgReset">إعادة</button><span id="tgOut" class="small" style="color:#dbeaf0"></span></div></div>`
};
const SIMX_CSS = `#lessonApp .hsim{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}#lessonApp .hb{border-radius:14px;padding:14px;text-align:center;color:#fff;min-height:90px;display:flex;flex-direction:column;justify-content:center;gap:4px;transition:.3s;border:2px solid transparent}
#lessonApp .hb[data-b="0"]{background:linear-gradient(160deg,#2f6fb0,#1b4a7a)}#lessonApp .hb[data-b="1"]{background:linear-gradient(160deg,#5a8f6e,#2f5f45)}#lessonApp .hb[data-b="2"]{background:linear-gradient(160deg,#d0672a,#8a3c14)}#lessonApp .hb.on{border-color:#ffe36a;box-shadow:0 0 0 3px rgba(255,227,106,.3)}
#lessonApp .tgrid{display:grid;grid-template-columns:repeat(4,minmax(0,64px));gap:6px;justify-content:center}#lessonApp .tgrid div{aspect-ratio:1;border:2px dashed rgba(255,255,255,.25);border-radius:10px;display:grid;place-items:center;cursor:pointer}
#lessonApp .tgrid div.ok{border-color:#7ee0b4;border-style:solid}#lessonApp .tgrid div.no{border-color:#ffb4a8;border-style:solid}#lessonApp .tpool{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;min-height:50px}#lessonApp .tpool span,#lessonApp .tgrid span{display:grid;place-items:center;width:52px;height:52px;cursor:pointer;border-radius:8px}#lessonApp .tpool span.sel{outline:3px solid #ffe36a}
#lessonApp .steps li{margin:6px 0;display:flex;gap:10px;align-items:flex-start;list-style:none}#lessonApp .steps{padding:0;margin:8px 0}#lessonApp .steps input{width:20px;height:20px;margin-top:5px;accent-color:#0da9a6;flex:none}#lessonApp .steps li.done span{color:var(--muted);text-decoration:line-through}
#lessonApp .ant{width:100%;border-collapse:collapse;font-size:15.5px}#lessonApp .ant th{background:var(--navy);color:#fff;padding:8px;font-size:14px}#lessonApp .ant td{border-bottom:1px solid var(--line);padding:8px;vertical-align:top}#lessonApp .ant td.c{text-align:center;white-space:nowrap;width:110px}
#lessonApp .ant .mg button{border:1.5px solid var(--line);background:#fff;border-radius:8px;width:38px;height:34px;font-weight:800;margin:0 2px}#lessonApp .ant .mg button.on{background:var(--navy);color:#fff;border-color:var(--navy)}#lessonApp .ant .mg.lock button{opacity:.55;cursor:default}
#lessonApp .ant tr.r1 td{background:#f4fbf8}#lessonApp .ant .ex{display:none;font-size:14px;margin-top:4px}#lessonApp .ant.rev .ex{display:block}#lessonApp .ant .k{font-weight:800;border-radius:7px;padding:1px 8px;font-size:13px}
#lessonApp .blk{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:8px 12px;align-items:center}#lessonApp .blk select{width:100%;border:1.5px solid var(--line);border-radius:10px;padding:8px;background:#fff;font-size:15px}#lessonApp .blk select.ok{border-color:var(--green);background:#e6f7ef}#lessonApp .blk select.no{border-color:var(--red);background:#fdf0ec}#lessonApp .blk .lb{font-weight:700;color:var(--navy-d);font-size:15px}
#lessonApp .fparts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}#lessonApp .fparts div{background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:10px}#lessonApp .fparts b{display:block;color:var(--navy);margin-bottom:4px}#lessonApp .fparts textarea,#lessonApp .ta{width:100%;min-height:80px;border:1px solid var(--line);border-radius:10px;padding:8px;font-size:15px;resize:vertical;background:#fff}
#lessonApp .tq{border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px;background:#fff}#lessonApp .tq .qh{font-weight:800;color:var(--navy-d);margin-bottom:8px}#lessonApp .tq .qh .n{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;background:var(--navy);color:#fff;margin-inline-end:8px;font-size:14px}
@media (max-width:700px){#lessonApp .blk{grid-template-columns:1fr}#lessonApp .ant td.c{width:auto}#lessonApp .hsim{grid-template-columns:1fr 1fr 1fr;gap:6px}#lessonApp .hb{padding:8px;font-size:14px}}`;

function chxHTML(X) {
  const L = X.launch, F = X.fold, R = X.read, G = X.guide, V = X.vocab, T = X.test;
  const wqm = (q, m, tag, c, p) => `<div class="wq mt"><div class="qq">${tag ? `<span class="tag q">${tag}</span>` : ''}<span>${q}${p ? ` <span class="muted small">(ص ${AR(p)})</span>` : ''}</span><button class="btn sm ghost" data-wq>الإجابة</button></div><div class="aa">${c ? cropFig(c) : ''}${m}</div></div>`;
  let h = `<section class="sec" data-id="launch">
  <div class="hero"><canvas id="heroCv"></canvas><div class="in">
    <span class="eyebrow">العلوم · الصف الثالث المتوسط · نشاطات تمهيدية</span>
    <h1>${esc(X.title)}</h1>
    <div class="sub">الفصل ${ORD[X.n]}: تجربة استهلالية تفتح الفصل، ثم مطوية تنظّم أفكارك، ثم استراتيجية «أتهيأ للقراءة» وجدول «موافق / غير موافق».</div>
    <div class="stats"><div><b>${AR(L.steps.length)}</b><span>خطوات التجربة</span></div><div><b>${AR(R.rows.length)}</b><span>عبارات قبل القراءة وبعدها</span></div><div><b>${AR(X.mcq.length + X.open.length)}</b><span>سؤالًا في مراجعة الفصل</span></div>${T ? `<div><b>${AR(T.mcq.length + T.short.length + T.long.length)}</b><span>سؤالًا في الاختبار المقنن</span></div>` : ''}</div>
    <div class="row" style="margin-top:22px"><button class="btn teal" data-go="fold">المطويات</button><button class="btn ghost" data-page="${L.page}" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)">صفحة الكتاب</button>${T ? '<button class="btn gold" data-go="test">الاختبار المقنن</button>' : ''}</div>
  </div></div>
  <div class="shead mt2"><div><div class="k">تجربة استهلالية</div><h2>${L.title}</h2><p>${L.intro}</p></div><div class="sp"></div>${pageBtn(L.page, 'ص ' + AR(L.page))}</div>
  <div class="grid g2">
    <div class="card"><h3>الخطوات <span class="tag">علّم كل خطوة تنجزها</span></h3><ol class="steps" data-steps="launch">${L.steps.map((s, i) => `<li><input type="checkbox" data-i="${i}"><span>${AR(i + 1)}. ${s}</span></li>`).join('')}</ol>
      ${L.warn ? `<div class="callout warn"><b>تحذير:</b> ${L.warn}</div>` : ''}
      <div class="mt"><b class="small" style="color:var(--navy)">توقّعي قبل التجربة</b><textarea class="ta" data-kwl="pred" placeholder="ماذا تتوقع أن يحدث؟"></textarea></div></div>
    <div>${SIMX[L.sim] || ''}</div>
  </div>
  <div class="grid g2 mt"><div class="card"><h3>ملاحظاتي <span class="tag">تُحفظ على جهازك</span></h3><textarea class="ta" data-kwl="obs" placeholder="سجّل ما لاحظته…"></textarea></div>
    <div class="card"><h3>التفكير الناقد</h3><p style="margin-top:0">${L.think.q}</p><textarea class="ta" data-kwl="concl" placeholder="اكتب استنتاجك أولًا…"></textarea><button class="btn sm ghost mt" data-reveal="thinkM">اعرض إجابة نموذجية</button><div class="callout gold mt" id="thinkM" style="display:none">${L.think.m} <span class="tag enrich">إجابة مقترحة</span></div></div></div>
</section>
<section class="sec" data-id="fold">
  <div class="shead"><div><div class="k">منظمات الأفكار</div><h2>المطويات</h2><p>${F.intro}</p></div><div class="sp"></div>${pageBtn(F.page, 'ص ' + AR(F.page))}</div>
  <div class="grid g23"><div class="card"><h3>اصنع المطوية</h3><ol class="steps" data-steps="fold">${F.steps.map((s, i) => `<li><input type="checkbox" data-i="${i}"><span><b>الخطوة ${AR(i + 1)}</b> ${s}</span></li>`).join('')}</ol><div class="callout gold">${F.task}</div></div>
    <div class="card">${cropFig(F.crop, 'المطوية في الكتاب')}</div></div>
  <div class="card mt"><h3>مطويتي الرقمية <span class="tag">اكتب في كل جزء — تُحفظ تلقائيًّا</span></h3><div class="fparts">${F.parts.map((p, i) => `<div><b>${p}</b><textarea data-kwl="fold${i}" placeholder="…"></textarea></div>`).join('')}</div></div>
</section>
<section class="sec" data-id="read">
  <div class="shead"><div><div class="k">أتهيأ للقراءة · ${R.skill}</div><h2>توجيه القراءة وتركيزها</h2><p>ركز على الأفكار الرئيسة عند قراءتك الفصل: أجب عن العبارات قبل القراءة (م: موافق، غ: غير موافق)، ثم ارجع إليها بعد القراءة لترى إن كنت قد غيّرت رأيك.</p></div><div class="sp"></div>${pageBtn(R.pages[0], 'ص ' + pgs(R.pages))}</div>
  <div class="grid g2"><div class="card"><h3>${R.skill} <span class="tag">أتعلّم · أتدرب · أطبّق</span></h3>${cropFig(R.crop, 'من الكتاب')}</div>
    <div class="card"><h3>أطبّق</h3><div class="callout gold">إرشاد: ${R.hint}</div><textarea class="ta mt" data-kwl="apply" style="min-height:150px" placeholder="اكتب إجابتك عن «أتدرب» و«أطبّق» هنا…"></textarea></div></div>
  <div class="card mt"><h3>ورقة العمل: موافق أم غير موافق؟ <span class="tag lab">قبل القراءة وبعدها</span></h3>
    <div style="overflow-x:auto"><table class="ant" id="antT"><tr><th>قبل القراءة</th><th>العبارة</th><th>بعد القراءة</th></tr>
    ${R.rows.map((r, i) => `<tr data-r="${i}"><td class="c"><div class="mg" data-w="b"><button data-v="1">م</button><button data-v="0">غ</button></div></td><td>${AR(i + 1)}. ${r[0]}<div class="ex"></div></td><td class="c"><div class="mg lock" data-w="a"><button data-v="1">م</button><button data-v="0">غ</button></div></td></tr>`).join('')}</table></div>
    <div class="row mt"><button class="btn" id="antDone">أنهيت قراءة الفصل: فعّل عمود «بعد القراءة»</button><button class="btn gold" id="antRev" disabled>اكشف الإجابات وقارن</button><button class="btn ghost sm" id="antReset">إعادة</button></div>
    <div class="callout mt" id="antSum" style="display:none"></div></div>
</section>
<section class="sec" data-id="guide">
  <div class="shead"><div><div class="k">دليل مراجعة الفصل</div><h2>مراجعة الأفكار الرئيسة</h2></div><div class="sp"></div>${pageBtn(G.page, 'ص ' + AR(G.page))}</div>
  <div class="card">${cropFig(G.ideas, 'مراجعة الأفكار الرئيسة — من الكتاب')}</div>
  <div class="grid g2 mt"><div class="card"><h3>تصوّر الأفكار الرئيسة: ${G.map.title}</h3>${cropFig(G.map.crop, 'من الكتاب')}</div>
    <div class="card"><h3>أكمل ${G.map.order ? 'الخطوات بالترتيب' : 'الفراغات'} <span class="tag lab">اختر من القائمة</span></h3><div class="blk" id="mapB">${G.map.blanks.map((b, i) => `<span class="lb">${b[0]}</span><select data-i="${i}"><option value="">— اختر —</option></select>`).join('')}</div>
      <div class="row mt"><button class="btn teal sm" id="mapChk">تحقّق</button><button class="btn ghost sm" id="mapShow">اعرض الحل</button><span class="small" id="mapOut"></span></div><div class="small muted mt">الإجابات مستنتجة من دروس الفصل؛ إذ لا يورد الكتاب مفتاحًا لها.</div></div></div>
</section>
<section class="sec" data-id="review">
  <div class="shead"><div><div class="k">مراجعة الفصل ${AR(X.n)}</div><h2>استخدام المفردات وتثبيت المفاهيم</h2></div><div class="sp"></div>${pageBtn(X.vocab.p, 'ص ' + AR(X.vocab.p) + '–' + AR(X.vocab.p + 1))}</div>
  <div class="card"><h3>استخدام المفردات <span class="tag lab">${V.kind === 'match' ? 'اختر المفردة المناسبة' : 'ما الفرق؟'}</span></h3>
    ${V.kind === 'match' ? `<div class="blk" id="vocB">${V.items.map((it, i) => `<span class="lb">${AR(i + 1)}. ${it[0]}</span><select data-i="${i}"><option value="">— اختر —</option>${V.bank.map(b => `<option>${b}</option>`).join('')}</select>`).join('')}</div><div class="row mt"><button class="btn teal sm" id="vocChk">تحقّق</button><span class="small" id="vocOut"></span></div>`
      : V.items.map((it, i) => wqm(AR(i + 1) + '. ' + it[0], it[1])).join('')}</div>
  <div class="grid g2 mt"><div class="card"><h3>تثبيت المفاهيم <span class="tag lab">اختر الإجابة الصحيحة</span></h3><div id="mcq" class="qbox"></div></div>
    <div class="card"><h3>التفكير الناقد وتطبيق الرياضيات <span class="tag">إجابات نموذجية</span></h3>${X.open.map((o, i) => wqm(o.q, o.m, i < 3 ? 'فكّر' : 'طبّق', o.c, o.p)).join('')}</div></div>
</section>`;
  if (T) h += `<section class="sec" data-id="test">
  <div class="shead"><div><div class="k">الوحدة ${AR(T.unit)}</div><h2>اختبار مقنن</h2><p>الجزء الأول: أسئلة الاختيار من متعدد (تُصحَّح آليًّا). الجزء الثاني والثالث: الإجابات القصيرة والمفتوحة مع إجابات نموذجية.</p></div><div class="sp"></div>${pageBtn(T.pages[0], 'ص ' + pgs(T.pages))}</div>
  <div id="testBox"></div>
</section>`;
  return h;
}

function simxInit(id) {
  if (id === 'hands') {
    let st = 0; const L = $('#hL'), R = $('#hR'), b = $$('.hb'), s2 = $('[data-hs="2"]');
    const set = () => { b.forEach(x => x.classList.remove('on'));
      if (st === 0) { L.textContent = 'اليد اليسرى: —'; R.textContent = 'اليد اليمنى: —'; s2.disabled = true; }
      if (st === 1) { b[0].classList.add('on'); b[2].classList.add('on'); L.textContent = 'اليد اليسرى في الماء البارد: تبرد…'; R.textContent = 'اليد اليمنى في الماء الساخن: تسخن…'; s2.disabled = false; }
      if (st === 2) { b[1].classList.add('on'); L.innerHTML = 'اليد اليسرى (كانت في البارد): <b>تحسّ أن الماء دافئ!</b>'; R.innerHTML = 'اليد اليمنى (كانت في الساخن): <b>تحسّ أن الماء بارد!</b>'; award('simx', 10); } };
    $$('[data-hs]').forEach(x => x.onclick = () => { st = +x.dataset.hs; set(); }); set();
  }
  if (id === 'building') {
    const cv = $('#bdCv'); let mode = 0, t = -1, B = [];
    const build = () => { B = []; for (let k = 0; k < 2; k++) for (let r = 0; r < 4; r++) B.push({ x: k, r, dx: 0, dy: 0, vx: 0, a: 0 }); t = -1; $('#bdOut').textContent = ''; };
    $$('#bdMode button').forEach(x => x.onclick = () => { $$('#bdMode button').forEach(y => y.classList.toggle('on', y === x)); mode = +x.dataset.m; build(); });
    $('#bdShake').onclick = () => { if (t < 0) t = 0; }; $('#bdReset').onclick = build; build();
    loop(cv, dt => {
      const { ctx, w, h } = canvasFit(cv); ctx.clearRect(0, 0, w, h);
      let sh = 0; if (t >= 0) { t += dt; sh = t < 2.5 ? Math.sin(t * 22) * 7 : 0; if (t > 2.5 && t < 2.6) { $('#bdOut').textContent = mode ? 'بقي المبنى المربوط متماسكًا يهتز ككتلة واحدة.' : 'تفكّكت المكعبات وانهار المبنى غير المربوط.'; award('simx', 10); } }
      const ty = h - 40; ctx.fillStyle = '#8a6a48'; ctx.fillRect(40 + sh, ty, w - 80, 14);
      const bw = 46, bh = 30, cx = w / 2 + sh, x0 = [cx - 90, cx + 44];
      B.forEach(b => { if (!mode && t > 0.6 && t < 2.5) { b.vx += (Math.random() - .5) * 60 * dt * (b.r + 1); b.dx += b.vx * dt; b.a += b.vx * dt * .02; if (b.r > 0 && Math.abs(b.dx) > 10) b.dy = Math.min(b.dy + 160 * dt, (b.r) * bh); } });
      B.forEach(b => { ctx.save(); ctx.translate(x0[b.x] + b.dx + bw / 2, ty - (b.r + 1) * bh + b.dy + bh / 2); ctx.rotate(b.a); ctx.fillStyle = '#d8b27a'; ctx.strokeStyle = '#7a5a30'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.strokeRect(-bw / 2, -bh / 2, bw, bh); if (mode) { ctx.fillStyle = '#c8402c'; ctx.fillRect(-bw / 2, -3, bw, 6); } ctx.restore(); });
      const roofY = ty - 4 * bh - 10 + (B[3].dy + B[7].dy) / 2, rx = (B[3].dx + B[7].dx) / 2;
      ctx.save(); ctx.translate(cx - 1 + rx, roofY); ctx.rotate(mode ? 0 : (B[3].a + B[7].a)); ctx.fillStyle = '#5d7380'; ctx.fillRect(-110, 0, 220, 10); ctx.restore();
      if (mode) { ctx.strokeStyle = '#c8402c'; ctx.lineWidth = 4; ctx.strokeRect(x0[0] - 4 + rx, roofY + 6, x0[1] - x0[0] + bw + 8, 4 * bh); }
    });
  }
  if (id === 'carrot') {
    const cv = $('#crCv'); let m = 0;
    $$('#crMode button').forEach(x => x.onclick = () => { $$('#crMode button').forEach(y => y.classList.toggle('on', y === x)); m = +x.dataset.m; });
    $('#crT').oninput = () => { $('#crTo').textContent = AR($('#crT').value) + ' دقيقة'; if (+$('#crT').value === 30) award('simx', 10); };
    loop(cv, (dt, T) => {
      const { ctx, w, h } = canvasFit(cv); ctx.clearRect(0, 0, w, h); const t = +$('#crT').value / 30;
      const bend = m === 0 ? t * 1 : m === 2 ? t * .25 : -t * .05, swell = m === 1 ? t * .12 : m === 0 ? -t * .2 : -t * .05;
      if (m < 2) { ctx.fillStyle = m === 0 ? 'rgba(200,220,240,.25)' : 'rgba(120,180,230,.25)'; ctx.fillRect(w * .1, h * .3, w * .8, h * .62); }
      for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate(w * (.38 + k * .24), h * .2); ctx.beginPath(); const len = h * .65, wd = 18 * (1 + swell);
        for (let s = 0; s <= 20; s++) { const y = s / 20 * len, x = Math.sin(s / 20 * Math.PI / 2) * bend * 40 * (s / 20); ctx.lineTo(x - wd * (1 - s / 24) / 2, y); }
        for (let s = 20; s >= 0; s--) { const y = s / 20 * len, x = Math.sin(s / 20 * Math.PI / 2) * bend * 40 * (s / 20); ctx.lineTo(x + wd * (1 - s / 24) / 2, y); }
        ctx.closePath(); ctx.fillStyle = '#e8822a'; ctx.fill(); ctx.fillStyle = '#4a9a3a'; ctx.fillRect(-6, -14, 12, 14); ctx.restore(); }
      if (m < 2 && t > 0) { ctx.fillStyle = '#8fe3e0'; ctx.font = '700 13px Tajawal'; ctx.textAlign = 'center'; for (let k = 0; k < 6; k++) { const ph = (T * .6 + k / 6) % 1, x = w * (.3 + (k % 3) * .2), y = h * .45 + (m === 0 ? ph : 1 - ph) * 40; ctx.fillText(m === 0 ? '→ ماء' : '← ماء', x, y); } }
      $('#crOut').textContent = t === 0 ? 'حرّك مؤشر الزمن.' : m === 0 ? 'يخرج الماء من خلايا الجزر إلى المحلول الأكثر تركيزًا بالملح، فيلين الجزر وينثني.' : m === 1 ? 'يدخل الماء العذب إلى خلايا الجزر فيبقى صلبًا منتفخًا.' : 'يفقد الجزر قليلًا من مائه بالتبخر ببطء.';
    });
  }
  if (id === 'dimples') {
    const c = store.get('dimp', [0, 0]);
    const draw = () => { $('#dc0').textContent = AR(c[0]); $('#dc1').textContent = AR(c[1]); const n = c[0] + c[1], p = n ? c[0] / n * 100 : 0; $('#dcBar').style.width = p + '%'; $('#dcOut').textContent = n ? 'نسبة من لهم غمّازات = ' + AR(c[0]) + ' ÷ ' + AR(n) + ' × ١٠٠ = ' + fx(p, 1) + '٪ — ' + (p > 50 ? 'صفة شائعة في صفك.' : 'ليست الصفة الأكثر شيوعًا في صفك.') : 'سجّل نتائج صفّك.'; store.set('dimp', c); if (n >= 5) award('simx', 10); };
    $$('[data-dc]').forEach(b => b.onclick = () => { const k = +b.dataset.dc; c[k] = Math.max(0, c[k] + +b.dataset.d); draw(); }); draw();
  }
  if (id === 'clay') {
    const cv = $('#clCv'); let P = [], hits = [], rev = false;
    const fresh = () => { P = []; const n = 3 + Math.floor(Math.random() * 4); while (P.length < n) { const a = Math.random() * 6.28, r = Math.random() * .62, p = { x: Math.cos(a) * r, y: Math.sin(a) * r, s: .12 + Math.random() * .08, k: Math.floor(Math.random() * 3) }; if (P.every(q => Math.hypot(q.x - p.x, q.y - p.y) > .3)) P.push(p); } hits = []; rev = false; $('#clOut').textContent = ''; };
    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), R = Math.min(r.width, r.height) * .42, x = (e.clientX - r.left - r.width / 2) / R, y = (e.clientY - r.top - r.height / 2) / R; if (Math.hypot(x, y) > 1) return; hits.push({ x, y, hit: P.some(p => Math.abs(x - p.x) < p.s && Math.abs(y - p.y) < p.s) }); });
    $('#clRev').onclick = () => { rev = true; const g = +$('#clG').value; $('#clOut').textContent = 'العدد الحقيقي: ' + AR(P.length) + (isNaN(g) || $('#clG').value === '' ? '' : g === P.length ? ' — تخمينك صحيح!' : ' — تخمينك: ' + AR(g)); award('simx', 10); };
    $('#clNew').onclick = fresh; fresh();
    loop(cv, () => { const { ctx, w, h } = canvasFit(cv); ctx.clearRect(0, 0, w, h); const R = Math.min(w, h) * .42, cx = w / 2, cy = h / 2;
      const g = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, '#e07a55'); g.addColorStop(1, '#a8452a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      if (rev) P.forEach(p => { ctx.fillStyle = 'rgba(220,230,240,.92)'; ctx.strokeStyle = '#555'; const x = cx + p.x * R, y = cy + p.y * R, s = p.s * R; ctx.beginPath(); if (p.k === 0) ctx.arc(x, y, s, 0, 7); else if (p.k === 1) ctx.rect(x - s, y - s, 2 * s, 2 * s); else { ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s); ctx.lineTo(x - s, y + s); ctx.closePath(); } ctx.fill(); ctx.stroke(); });
      hits.forEach(p => { ctx.fillStyle = p.hit ? '#ff3b30' : '#ffe9c4'; ctx.beginPath(); ctx.arc(cx + p.x * R, cy + p.y * R, p.hit ? 5 : 3, 0, 7); ctx.fill(); }); });
  }
  if (id === 'tiles') {
    const SH = ['●', '■', '▲', '◆'], CO = ['#8fe3e0', '#f2c94c', '#ff7a5c', '#b8a6ff'];
    let tiles, grid, sel;
    const svg = t => `<svg width="${20 + t.z * 9}" height="${20 + t.z * 9}" viewBox="0 0 20 20"><text x="10" y="16" font-size="18" text-anchor="middle" fill="${CO[t.s]}">${SH[t.s]}</text></svg>`;
    const draw = () => { $('#tgGrid').innerHTML = grid.map((t, i) => `<div data-c="${i}">${t ? `<span>${svg(t)}</span>` : ''}</div>`).join(''); $('#tgPool').innerHTML = tiles.map((t, i) => t.used ? '' : `<span data-t="${i}" class="${sel === i ? 'sel' : ''}">${svg(t)}</span>`).join('');
      $$('#tgPool [data-t]').forEach(s => s.onclick = () => { sel = +s.dataset.t; draw(); });
      $$('#tgGrid [data-c]').forEach(c => c.onclick = () => { const i = +c.dataset.c; if (grid[i]) { grid[i].used = false; grid[i] = null; } else if (sel != null) { tiles[sel].used = true; grid[i] = tiles[sel]; sel = null; } draw(); }); };
    const reset = () => { tiles = shuffle(Array.from({ length: 16 }, (_, k) => ({ s: k % 4, z: Math.floor(k / 4), used: false }))); grid = Array(16).fill(null); sel = null; $('#tgOut').textContent = ''; draw(); };
    $('#tgChk').onclick = () => { if (grid.some(g => !g)) { $('#tgOut').textContent = 'أكمل وضع القصاصات الست عشرة أولًا.'; return; }
      let ok = true; const cells = $$('#tgGrid [data-c]');
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { const t = grid[r * 4 + c], good = t.s === grid[c].s && t.z === r; cells[r * 4 + c].classList.toggle('ok', good); cells[r * 4 + c].classList.toggle('no', !good); if (!good) ok = false; }
      $('#tgOut').textContent = ok ? 'ممتاز! كل عمود له شكل واحد، والحجم يتدرّج في الأعمدة، ويتغيّر الشكل عبر الصفوف — كالمجموعات والدورات.' : 'بعض المربعات (الحمراء) في غير موضعها.'; if (ok) award('simx', 15); };
    $('#tgReset').onclick = reset; reset();
  }
}

function antInit(X) {
  const R = X.read.rows, st = store.get('ant', { b: {}, a: {}, open: false, rev: false });
  const save = () => store.set('ant', st);
  const draw = () => {
    $$('#antT tr[data-r]').forEach(tr => { const i = +tr.dataset.r;
      tr.querySelectorAll('.mg').forEach(g => { const w = g.dataset.w; g.classList.toggle('lock', w === 'a' ? !st.open : st.open); g.querySelectorAll('button').forEach(b => b.classList.toggle('on', st[w][i] === +b.dataset.v)); });
      const ex = tr.querySelector('.ex'); ex.innerHTML = st.rev ? `<span class="k" style="background:${R[i][1] ? '#e6f7ef' : '#fdf0ec'};color:${R[i][1] ? '#0b5b3a' : '#8a2c1a'}">${R[i][1] ? 'م: موافق' : 'غ: غير موافق'}</span> ${R[i][2]}` : '';
    });
    $('#antT').classList.toggle('rev', st.rev); $('#antRev').disabled = !st.open; $('#antDone').disabled = st.open;
    if (st.rev) { const n = R.length, cb = R.filter((r, i) => st.b[i] === r[1]).length, ca = R.filter((r, i) => st.a[i] === r[1]).length, ch = R.filter((r, i) => st.b[i] != null && st.a[i] != null && st.b[i] !== st.a[i]).length;
      $('#antSum').style.display = 'block'; $('#antSum').innerHTML = `<b>المقارنة:</b> إجاباتك الصحيحة قبل القراءة ${AR(cb)} من ${AR(n)}، وبعد القراءة ${AR(ca)} من ${AR(n)}. غيّرتَ رأيك في ${AR(ch)} ${ch === 1 ? 'عبارة' : 'عبارات'}. ${ca > cb ? 'أحسنت! القراءة صحّحت أفكارك.' : ''} <span class="muted small">(الإجابات مستنتجة من محتوى الفصل)</span>`; if (ca === n) award('ant', 20); else award('antr', 5);
    } else $('#antSum').style.display = 'none';
  };
  $('#antT').addEventListener('click', e => { const b = e.target.closest('.mg button'); if (!b) return; const g = b.closest('.mg'); if (g.classList.contains('lock')) return; st[g.dataset.w][+b.closest('tr').dataset.r] = +b.dataset.v; save(); draw(); });
  $('#antDone').onclick = () => { st.open = true; save(); draw(); };
  $('#antRev').onclick = () => { st.rev = true; save(); draw(); };
  $('#antReset').onclick = () => { st.b = {}; st.a = {}; st.open = false; st.rev = false; save(); draw(); };
  draw();
}

function selectsInit(box, items, ansOf, chk, out, show, key) {
  const sel = $$('select', box);
  if (ansOf) { const bank = shuffle([...new Set(items.map(ansOf))]); sel.forEach(s => s.insertAdjacentHTML('beforeend', bank.map(b => `<option>${b}</option>`).join(''))); }
  const saved = store.get('sel_' + key, {}); sel.forEach(s => { if (saved[s.dataset.i]) s.value = saved[s.dataset.i]; s.onchange = () => { saved[s.dataset.i] = s.value; store.set('sel_' + key, saved); s.classList.remove('ok', 'no'); }; });
  const right = s => s.value === (ansOf ? ansOf(items[+s.dataset.i]) : items[+s.dataset.i][1]);
  chk.onclick = () => { let n = 0; sel.forEach(s => { const ok = right(s); s.classList.toggle('ok', ok); s.classList.toggle('no', !ok); if (ok) n++; }); out.textContent = 'صحيح ' + AR(n) + ' من ' + AR(sel.length); if (n === sel.length) award(key, 15); };
  if (show) show.onclick = () => { sel.forEach(s => { s.value = ansOf ? ansOf(items[+s.dataset.i]) : items[+s.dataset.i][1]; s.classList.add('ok'); s.classList.remove('no'); }); out.textContent = 'عُرض الحل.'; };
}

function testInit(T) {
  const box = $('#testBox'), Q = T.mcq, mins = Math.max(10, Math.round(Q.length * 1.5 + (T.short.length + T.long.length) * 2));
  const st = store.get('test', null) || { started: 0, ans: {}, done: false, el: 0 };
  const save = () => store.set('test', st), fmt = s => AR(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
  const el = () => st.done ? st.el : Math.floor((Date.now() - st.started) / 1000);
  const wr = (arr, tag, off) => arr.map((o, i) => `<div class="tq"><div class="qh"><span class="n">${AR(off + i + 1)}</span>${o.q}</div>${o.c ? cropFig(o.c) : ''}<textarea class="ta" data-kwl="t${tag}${i}" placeholder="اكتب إجابتك…"></textarea>${st.done ? `<div class="callout gold mt"><b>إجابة نموذجية:</b> ${o.m}</div>` : ''}</div>`).join('');
  function render() {
    if (!st.started) { box.innerHTML = `<div class="nf"><div class="nh"><b>اختبار مقنن · الوحدة ${AR(T.unit)}</b><span class="sp"></span><span class="tm">الزمن المقترح: ${AR(mins)} دقيقة</span></div><div class="nb"><div class="res"><div><span class="small muted">اختيار من متعدد</span><b>${AR(Q.length)}</b></div><div><span class="small muted">إجابات قصيرة</span><b>${AR(T.short.length)}</b></div><div><span class="small muted">إجابات مفتوحة</span><b>${AR(T.long.length)}</b></div></div><div class="callout">يبدأ المؤقّت عند الضغط على «ابدأ الاختبار». تُصحَّح أسئلة الاختيار من متعدد آليًّا عند التسليم، وتظهر الإجابات النموذجية للأسئلة المكتوبة لتقيّم نفسك.</div></div><div class="nfoot"><span></span><button class="btn gold" id="tsStart">ابدأ الاختبار</button></div></div>`;
      $('#tsStart').onclick = () => { st.started = Date.now(); st.ans = {}; st.done = false; save(); render(); }; return; }
    const sc = Q.filter((q, i) => st.ans[i] === q.a).length;
    box.innerHTML = `<div class="nf"><div class="nh"><b>اختبار مقنن · الوحدة ${AR(T.unit)}</b><span class="sp"></span><span class="tm" id="tsT">${fmt(el())}</span>${st.done ? `<span class="tm">الدرجة: ${AR(sc)} / ${AR(Q.length)}</span>` : ''}</div><div class="nb">
      ${st.done ? `<div class="res"><div><span class="small muted">الإجابات الصحيحة</span><b>${AR(sc)} / ${AR(Q.length)}</b></div><div><span class="small muted">النسبة</span><b>${AR(Math.round(sc / Q.length * 100))}٪</b></div><div><span class="small muted">الزمن</span><b>${fmt(st.el)}</b></div></div><div class="callout ${sc / Q.length >= .8 ? 'ok' : 'gold'}">${sc / Q.length >= .8 ? 'أداء متميّز!' : 'راجع الأسئلة الخاطئة وتفسيراتها ثم أعد المحاولة.'}</div>` : ''}
      <h3 class="mt" style="color:var(--navy-d)">الجزء الأول: أسئلة الاختيار من متعدد</h3>
      ${Q.map((q, i) => { const a = st.ans[i]; return `<div class="tq" data-q="${i}"><div class="qh"><span class="n">${AR(i + 1)}</span>${q.q} <span class="muted small">(ص ${AR(q.p)})</span></div>${q.c ? cropFig(q.c) : ''}<div class="opts">${q.o.map((o, k) => `<button class="opt ${a === k ? (st.done ? (k === q.a ? 'ok' : 'no') : 'sel2') : (st.done && k === q.a ? 'ok' : '')}" data-k="${k}" ${st.done ? 'disabled' : ''} style="${!st.done && a === k ? 'border-color:var(--navy);background:#e7f0f8' : ''}"><span class="L">${LTR[k]}</span><span>${o}</span></button>`).join('')}</div>${st.done && q.note ? `<div class="small muted mt">${q.note}</div>` : ''}</div>`; }).join('')}
      <h3 class="mt" style="color:var(--navy-d)">الجزء الثاني: أسئلة الإجابات القصيرة</h3>${wr(T.short, 's', Q.length)}
      <h3 class="mt" style="color:var(--navy-d)">الجزء الثالث: أسئلة الإجابات المفتوحة</h3>${wr(T.long, 'l', Q.length + T.short.length)}
    </div><div class="nfoot"><span class="small muted">أُجيب ${AR(Object.keys(st.ans).length)} من ${AR(Q.length)} (اختيار من متعدد)</span>${st.done ? '<button class="btn" id="tsAgain">إعادة الاختبار</button>' : '<button class="btn gold" id="tsEnd">تسليم وعرض النتيجة</button>'}</div></div>`;
    box.querySelectorAll('.tq[data-q] .opt').forEach(b => b.onclick = () => { st.ans[+b.closest('.tq').dataset.q] = +b.dataset.k; save(); const y = $('#lmain').scrollTop; render(); $('#lmain').scrollTop = y; });
    $$('#testBox [data-kwl]').forEach(t => { t.value = store.get('kwl_' + t.dataset.kwl, ''); t.oninput = () => store.set('kwl_' + t.dataset.kwl, t.value); });
    const en = $('#tsEnd'); if (en) en.onclick = () => { st.el = el(); st.done = true; save(); render(); $('#lmain').scrollTop = 0; if (sc >= Math.ceil(Q.length * .8)) award('test', 40); else award('testd', 10); };
    const ag = $('#tsAgain'); if (ag) ag.onclick = () => { st.started = 0; st.done = false; st.ans = {}; save(); render(); };
  }
  clearInterval(NF_T); NF_T = setInterval(() => { const t = $('#tsT'); if (t && visible(t) && !st.done) t.textContent = fmt(el()); }, 1000);
  render();
}

function chxInit(X) {
  if (!$('#simxCSS')) { const s = document.createElement('style'); s.id = 'simxCSS'; s.textContent = SIMX_CSS; document.head.appendChild(s); }
  heroInit('c' + X.n);
  $$('[data-steps]').forEach(ol => { const k = 'steps_' + ol.dataset.steps, v = store.get(k, {}); ol.querySelectorAll('input').forEach(c => { c.checked = !!v[c.dataset.i]; c.closest('li').classList.toggle('done', c.checked); c.onchange = () => { v[c.dataset.i] = c.checked; store.set(k, v); c.closest('li').classList.toggle('done', c.checked); if (Object.values(v).filter(Boolean).length === ol.querySelectorAll('input').length) award(k, 5); }; }); });
  $$('[data-reveal]').forEach(b => b.onclick = e => { e.stopPropagation(); $('#' + b.dataset.reveal).style.display = 'block'; award('think', 3); });
  const inits = [() => simxInit(X.launch.sim), () => antInit(X),
    () => selectsInit($('#mapB'), X.guide.map.blanks, b => b[1], $('#mapChk'), $('#mapOut'), $('#mapShow'), 'map'),
    () => X.vocab.kind === 'match' && selectsInit($('#vocB'), X.vocab.items, null, $('#vocChk'), $('#vocOut'), null, 'voc'),
    () => mcqWidget($('#mcq'), X.mcq, 'mcq'), () => X.test && testInit(X.test)];
  inits.forEach(f => { try { f(); } catch (e) { console.error('chx init', e); } });
}
