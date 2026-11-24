import { mountAssistant } from './assistant.js';
import { ASSIST } from './assist.js';
import { LABS, LAB_FOR } from './vlab.js';
import { SIMS } from './sims9.js';
// واجهة الدرس التفاعلي: التهيئة، الأهداف، المفاهيم، الشرح، التقويم
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const CSS = `
#lesson .lvbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:#eef4f6;border:1px solid #d6e3e8;border-radius:14px;padding:8px 10px;margin-bottom:10px;font-weight:800}
#lesson .lvbar button{border:2px solid #cfdde3;background:#fff;border-radius:12px;padding:6px 12px;font:inherit;font-weight:800;cursor:pointer}
#lesson .lvbar button.on{background:#15445a;border-color:#15445a;color:#fff}
#lesson .lvbar small{flex-basis:100%;color:#3c5563;font-weight:600}
#lesson .hintb{display:inline-block;margin-top:6px;background:#fff8e0;border:1px dashed #e0b040;border-radius:10px;padding:3px 10px;font-weight:800;color:#8a5a00;cursor:pointer;font-size:14px}
#lesson .fin{border:2px solid #cfdde3;border-radius:10px;padding:3px 8px;font:inherit;font-weight:800;width:150px;max-width:60%;background:#f6f9fa}
#lesson .fin.ok{border-color:#0d8f8c;background:#eefaf3}#lesson .fin.no{border-color:#e0603a;background:#fff0ec}
#lesson .card.enrich{background:#f4f8f9;border-color:#d6e3e8}

#lesson .lh .stars{background:#ffcf3a;color:#5a3a00;border-radius:20px;padding:4px 12px;font-weight:800;font-size:16px;white-space:nowrap}
#lesson .lh .stars.pop{animation:spop .6s}@keyframes spop{50%{transform:scale(1.35)}}
#lesson .lh button.pm{font-size:15px;padding:0 10px;white-space:nowrap}
#lesson .lw{position:relative}
#lesson .starFly{position:absolute;top:70px;left:50%;transform:translateX(-50%);background:#fff;border:2px solid #ffcf3a;border-radius:20px;padding:6px 16px;font-weight:800;color:#7a5200;z-index:20;box-shadow:0 6px 20px rgba(0,0,0,.2);animation:sfly 1.8s forwards;pointer-events:none;white-space:nowrap}
@keyframes sfly{0%{opacity:0;transform:translate(-50%,20px)}15%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px)}}
#lesson.present .lw{width:100%;max-width:none}
#lesson.present .lb{zoom:1.28}
#lesson.present .lh .tt b{font-size:24px}
#lesson .ptools{display:none;position:absolute;left:14px;bottom:76px;z-index:15;flex-direction:column;gap:8px}
#lesson.present .ptools{display:flex}
#lesson .ptools>button{width:58px;height:58px;border-radius:50%;border:0;background:#15445a;color:#fff;font-size:24px;box-shadow:0 4px 14px rgba(0,0,0,.3)}
#lesson .ptools>button small{display:block;font-size:10px;font-weight:800;margin-top:-4px}
#lesson .pop{position:absolute;left:84px;bottom:76px;z-index:16;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.3);padding:12px;min-width:240px;display:none}
#lesson .pop.show{display:block}#lesson .pop h4{margin:0 0 8px;color:#15445a}
#lesson .pop .row{display:flex;gap:6px;flex-wrap:wrap}#lesson .pop .row button{flex:1;border:0;border-radius:10px;padding:10px;font:inherit;font-weight:800;background:#eef6f2;color:#1f5f45}
#lesson .pop textarea,#lesson .pop input{width:100%;font:inherit;border:1px solid #d9c9a8;border-radius:10px;padding:6px;margin:4px 0;box-sizing:border-box}
#lesson .pickov{position:absolute;inset:0;z-index:30;background:rgba(10,30,22,.85);display:none;align-items:center;justify-content:center;flex-direction:column;color:#fff;text-align:center}
#lesson .pickov.show{display:flex}#lesson .pickov .v{font-size:min(28vw,220px);font-weight:800;line-height:1.1}#lesson .pickov .l{font-size:28px;font-weight:800;margin-top:10px}#lesson .pickov button{margin-top:20px;border:0;border-radius:14px;padding:12px 26px;font:inherit;font-size:20px;font-weight:800;background:#ffcf3a;color:#5a3a00}
#lesson .tmr{position:absolute;top:70px;left:14px;z-index:15;background:#15445a;color:#fff;border-radius:16px;padding:8px 16px;font-size:34px;font-weight:800;display:none;box-shadow:0 6px 20px rgba(0,0,0,.3);cursor:pointer}
#lesson .tmr.show{display:block}#lesson .tmr.end{background:#d04a3a;animation:spop .6s infinite}#lesson .tmr small{display:block;font-size:12px;text-align:center}
#lesson .tps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}
#lesson .tps button{border:2px solid #e8a33a;background:#fff;border-radius:14px;padding:10px 6px;font:inherit;font-weight:800;color:#8a5a10}
#lesson .tps button.on{background:#e8a33a;color:#fff}#lesson .tps button.ok{background:#fff3dc}
#lesson .tps b{display:block;font-size:24px}
#lesson .tpsT{font-size:30px;font-weight:800;text-align:center;color:#8a5a10;min-height:40px}
#lesson .exit .lights{display:flex;gap:8px;margin-top:8px}
#lesson .exit .lights button{flex:1;border:2px solid #ddd;border-radius:14px;background:#fff;padding:10px 4px;font:inherit;font-weight:800;font-size:14px}
#lesson .exit .lights button i{display:block;font-style:normal;font-size:32px}
#lesson .exit .lights button.on{border-color:#0d8f8c;background:#eefaf3}
#lesson .exit .tally{display:none;gap:6px;margin-top:6px}#lesson.present .exit .tally{display:flex}
#lesson .exit .tally button{flex:1;border:0;border-radius:10px;padding:8px;font:inherit;font-weight:800;background:#e6eef1}
#lesson .badge{text-align:center;padding:14px;background:linear-gradient(135deg,#fff3c4,#ffe08a);border-radius:18px;border:2px solid #e8b830;margin:10px 0}
#lesson .badge .m{font-size:64px;line-height:1}
#lesson{position:fixed;inset:0;z-index:90;display:none;background:rgba(20,12,6,.55);backdrop-filter:blur(3px)}
#lesson.open{display:flex;justify-content:center;align-items:stretch}
#lesson .lw{background:#f6f9fa;width:min(1060px,100%);display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,0,0,.5);padding-top:env(safe-area-inset-top,0px);animation:lin .35s cubic-bezier(.2,.8,.2,1)}
@keyframes lin{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
#lesson .lh{display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(135deg,#0d8f8c,#15445a);color:#fff}
#lesson .lh .tt{flex:1;min-width:0}#lesson .lh .tt b{display:block;font-size:18px}#lesson .lh .tt small{opacity:.85;font-size:12px}
#lesson .lh button{border:0;background:rgba(255,255,255,.18);color:#fff;border-radius:10px;height:38px;min-width:38px;font-size:18px;font-weight:800}
#lesson .tabs{display:flex;gap:4px;padding:8px 10px;background:#e6eef1;overflow-x:auto;scrollbar-width:none}
#lesson .tabs button{flex:1;min-width:84px;border:0;border-radius:12px;padding:8px 6px;background:#fff;font-weight:800;font-size:14px;color:#5a4a36;display:flex;flex-direction:column;align-items:center;gap:2px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
#lesson .tabs button i{font-style:normal;font-size:20px}
#lesson .tabs button.on{background:#0d8f8c;color:#fff}
#lesson .tabs button.done:not(.on)::after{content:'✓';color:#0d8f8c;font-size:12px}
#lesson .lb{flex:1;overflow:auto;padding:16px clamp(12px,3vw,28px) 30px;-webkit-overflow-scrolling:touch;touch-action:pan-y;user-select:text;-webkit-user-select:text}
#lesson .lf{display:flex;gap:8px;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid #eadfca;background:#fff}
#lesson .lf button{flex:1;border:0;border-radius:12px;height:46px;font-weight:800;font-size:15px;background:#eef6f1;color:#15445a}
#lesson .lf button.pri{background:#0d8f8c;color:#fff}
#lesson h2{font-size:22px;margin:4px 0 12px;color:#1f5f45}#lesson h3{font-size:18px;margin:16px 0 8px;color:#1f5f45}
#lesson p{line-height:2;font-size:17px;margin:6px 0}
#lesson .lb b{background:linear-gradient(transparent 55%,#ffe56a 55%);font-weight:800}
.card{background:#fff;border-radius:18px;padding:14px 16px;margin:12px 0;box-shadow:0 2px 10px rgba(80,50,10,.08);border:1px solid #f0e4cc}
.card.blue{border-top:5px solid #3d7eb9}.card.green{border-top:5px solid #0d8f8c}.card.orange{border-top:5px solid #0da9a6}.card.red{border-top:5px solid #e8323a}
.tag{display:inline-flex;align-items:center;gap:6px;font-weight:800;color:#fff;background:#3d7eb9;border-radius:10px;padding:4px 12px;font-size:15px}
.tag.g{background:#0d8f8c}.tag.o{background:#0da9a6}.tag.r{background:#e8323a}
.pbtn{border:0;border-radius:10px;background:#fff3dc;color:#a05a00;font-weight:800;padding:7px 12px;font-size:14px;margin:4px 0 4px 6px}
.mbtn{border:0;border-radius:10px;background:linear-gradient(135deg,#0da9a6,#15445a);color:#fff;font-weight:800;padding:8px 14px;font-size:14px;margin:4px 0 4px 6px;box-shadow:0 3px 10px rgba(255,120,20,.35)}
.hero{position:relative;border-radius:18px;overflow:hidden;background:#9cc8f0}
.hero .ph{width:100%;background-repeat:no-repeat;animation:kb 18s ease-in-out infinite alternate;transform-origin:40% 60%}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.14) translate(-2%,-2%)}}
.hero svg{position:absolute;inset:0;width:100%;height:100%}
.hero .cap{position:absolute;right:12px;top:12px;background:rgba(255,255,255,.92);border-radius:12px;padding:6px 12px;font-weight:800;color:#15445a;font-size:clamp(14px,2.4vw,20px)}
.qbox{background:#e8f6fd;border:2px solid #3d7eb9;border-radius:16px;padding:12px 14px;margin-top:-28px;position:relative;z-index:2;margin-inline:10px}
.qbox .q{font-weight:800;font-size:18px;color:#0d4a6e;margin:6px 0}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.chip{border:2px solid #d9c9a8;background:#fff;border-radius:999px;padding:8px 14px;font-weight:700;font-size:15px;color:#4a3a28}
.chip.on{border-color:#3d7eb9;background:#dff1fb;color:#0d4a6e}
.chip.ok{border-color:#0d8f8c;background:#e3f5ea;color:#15445a}.chip.no{border-color:#e8323a;background:#fde8e8;color:#9a1a1a;text-decoration:line-through}
.reveal{display:none;margin-top:8px;background:#fff;border-radius:12px;padding:10px 12px;border-right:5px solid #0d8f8c;line-height:1.9}
.reveal.show{display:block;animation:lin .3s}
.abtn{border:0;border-radius:12px;background:#0d8f8c;color:#fff;font-weight:800;padding:10px 16px;font-size:15px;margin-top:6px}
.abtn.sec{background:#eef6f1;color:#15445a}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.obj{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:14px;background:#fff;border:1px solid #f0e4cc;margin:8px 0}
.obj .n{flex:none;width:34px;height:34px;border-radius:50%;background:#0d8f8c;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
.obj .t{flex:1;font-size:17px;line-height:1.8}
.obj label{display:flex;align-items:center;gap:4px;font-size:13px;color:#6a5a44;white-space:nowrap}
.obj input{width:20px;height:20px;accent-color:#0d8f8c}
.flip{perspective:900px;height:170px;cursor:pointer}
.flip .in{position:relative;width:100%;height:100%;transition:transform .6s;transform-style:preserve-3d}
.flip.on .in{transform:rotateY(180deg)}
.flip .f,.flip .b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:16px;padding:12px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.flip .f{background:linear-gradient(135deg,#0d8f8c,#3aa77d);color:#fff;font-size:22px;font-weight:800}
.flip.key .f{background:linear-gradient(135deg,#ff9a2a,#f07a12)}
.flip .f small{font-size:12px;opacity:.9;font-weight:600;margin-top:6px}
.flip .b{background:#fff;border:2px solid #0d8f8c;transform:rotateY(180deg);font-size:15px;line-height:1.8;color:#3a2a1a}
.flip .b .pg{font-size:12px;color:#a06a1a;font-weight:800;margin-top:4px}
.match{display:grid;grid-template-columns:1fr 1.6fr;gap:8px}
.match button{border:2px solid #d9c9a8;background:#fff;border-radius:12px;padding:10px;font-size:15px;line-height:1.6;text-align:right;font-family:inherit}
.match button.sel{border-color:#3d7eb9;background:#dff1fb}.match button.ok{border-color:#0d8f8c;background:#e3f5ea;opacity:.55}.match button.bad{animation:shake .4s;border-color:#e8323a}
@keyframes shake{25%{transform:translateX(6px)}75%{transform:translateX(-6px)}}
.snav{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}
.snav button{flex:none;border:0;border-radius:999px;padding:8px 14px;font-weight:800;background:#fff;color:#5a4a36;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.snav button.on{background:#3d7eb9;color:#fff}
.tree{display:flex;flex-direction:column;align-items:center;gap:0;margin:10px 0}
.tree .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;padding-top:18px}
.tree .row::before{content:'';position:absolute;top:0;left:50%;width:2px;height:18px;background:#9ab}
.tree .nd{border:0;border-radius:12px;padding:9px 14px;font-weight:800;color:#fff;font-size:15px;box-shadow:0 3px 8px rgba(0,0,0,.15)}
.tree .lv0{background:#15445a}.tree .lv1{background:#0d8f8c}.tree .lv2{background:#2b4aa0}.tree .lv3{background:#3aa743}
.tree .nd.on{outline:4px solid #ffcf3a}
.ex{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.ph2{border-radius:12px;background-repeat:no-repeat;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.phcap{text-align:center;font-weight:800;font-size:14px;margin-top:4px}
.eq{direction:rtl;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;font-weight:800;font-size:clamp(14px,2.6vw,20px);background:#fffbe6;border:2px solid #f2d14a;border-radius:14px;padding:12px}
.eq span{padding:6px 10px;border-radius:10px;opacity:0;transform:translateY(8px);animation:eqin .5s forwards}
.eq .r{background:#e3f1fb;color:#0d4a6e}.eq .p{background:#e3f5ea;color:#15445a}.eq .o{background:none}
@keyframes eqin{to{opacity:1;transform:none}}
.order button{display:block;width:100%;margin:6px 0;border:2px solid #d9c9a8;background:#fff;border-radius:12px;padding:10px;font-size:16px;font-family:inherit;text-align:right}
.order button.ok{border-color:#0d8f8c;background:#e3f5ea}.order button.bad{animation:shake .4s;border-color:#e8323a}
.order button .k{display:inline-flex;width:26px;height:26px;border-radius:50%;background:#0d8f8c;color:#fff;align-items:center;justify-content:center;margin-left:8px;font-weight:800}
.qi{background:#fff;border-radius:14px;padding:12px 14px;margin:10px 0;border:1px solid #f0e4cc}
.qi .qq{font-weight:800;font-size:17px;line-height:1.8}
.qi .opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px;margin-top:8px}
.qi .opts button{border:2px solid #e3d6bb;background:#fffdf7;border-radius:12px;padding:10px;font-size:15px;font-family:inherit;text-align:right}
.qi .opts button.ok{border-color:#0d8f8c;background:#e3f5ea;font-weight:800}.qi .opts button.no{border-color:#e8323a;background:#fde8e8}
.qi .fb{margin-top:6px;font-weight:700;line-height:1.8}.fb.ok{color:#1f8a4c}.fb.no{color:#c62828}
.qi .bk{font-size:12px;font-weight:800;color:#fff;background:#e8323a;border-radius:6px;padding:1px 6px;margin-left:6px}
.blank{display:inline-block;min-width:110px;border-bottom:3px dashed #3d7eb9;text-align:center;padding:0 6px;font-weight:800;color:#0d4a6e;cursor:pointer;border-radius:6px}
.blank.sel{background:#dff1fb}.blank.ok{border-color:#0d8f8c;color:#15445a;background:#e3f5ea}.blank.no{border-color:#e8323a;color:#c62828;background:#fde8e8}
.bank{position:sticky;top:-16px;z-index:3;background:#f6f9fa;padding:8px 0;display:flex;flex-wrap:wrap;gap:6px}
.bank button{border:2px solid #3d7eb9;background:#fff;color:#0d4a6e;border-radius:999px;padding:7px 12px;font-weight:800;font-family:inherit}
.bank button.used{opacity:.35}
.score{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#15445a,#0d8f8c);color:#fff;border-radius:16px;padding:12px 16px;position:sticky;top:-16px;z-index:4}
.score .big{font-size:28px;font-weight:800}.score .bar{flex:1;height:10px;background:rgba(255,255,255,.25);border-radius:9px;overflow:hidden}.score .bar i{display:block;height:100%;background:#ffcf3a;transition:width .4s}
.lab svg{width:100%;max-width:560px;display:block;margin:0 auto}
.lab table{width:100%;border-collapse:collapse;margin-top:8px;font-size:15px}.lab td,.lab th{border:1px solid #e3d6bb;padding:6px;text-align:center}.lab th{background:#e6eef1}
.lab input[type=range]{width:100%;accent-color:#3d7eb9}

.clip{width:100%;border-radius:12px;background-repeat:no-repeat;background-color:#fff;box-shadow:0 2px 12px rgba(0,0,0,.15);border:3px solid transparent;transition:border-color .3s,box-shadow .3s;cursor:zoom-in}
.clip.fig{max-width:760px;margin:0 auto}
.clip.reading,.reading{border-color:#0da9a6!important;box-shadow:0 0 0 4px rgba(255,138,30,.25),0 2px 12px rgba(0,0,0,.15)!important}
.clipw{margin:12px auto;max-width:680px;position:relative}
.clipw .cl{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#8a6a3a;font-weight:800;margin-bottom:4px}
.clipw .sp{border:0;background:#fff3dc;border-radius:999px;padding:4px 10px;font-weight:800;color:#a05a00}
.clipz{position:fixed;inset:0;z-index:120;background:rgba(0,0,0,.85);overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:20px 8px}
.clipz div{width:min(1100px,200vw);background-repeat:no-repeat;background-color:#fff;border-radius:8px}
details.simp{background:#fff;border-radius:14px;border:1px dashed #0d8f8c;padding:6px 12px;margin:10px 0}details.simp summary{font-weight:800;color:#15445a;cursor:pointer;padding:6px 0}
.nar{border-top:1px solid #eadfca;background:#fff8ea;padding:8px 12px;display:flex;flex-direction:column;gap:6px}
.nar .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.nar .rd{border:2px solid #e3d6bb;background:#fff;border-radius:12px;padding:4px 8px;font-weight:800;font-size:13px;display:flex;align-items:center;gap:4px;font-family:inherit}
.nar .rd i{font-style:normal;font-size:20px}.nar .rd.on{border-color:#0d8f8c;background:#e3f5ea;color:#15445a}
.nar .pl{border:0;border-radius:999px;background:#0da9a6;color:#fff;font-weight:800;height:40px;padding:0 16px;font-size:15px;font-family:inherit}
.nar .st{border:0;border-radius:999px;background:#efe6d2;height:40px;width:40px;font-size:16px}
.nar .cap{font-size:15px;line-height:1.8;color:#3a2a1a;min-height:0;max-height:3.6em;overflow:hidden}
.nar .cap:empty{display:none}
.nar .spd{display:flex;align-items:center;gap:4px;font-size:12px;color:#6a5a44;font-weight:700}.nar .spd input{width:80px;accent-color:#0da9a6}
.nar .warn summary{cursor:pointer;font-weight:800}.nar .warn{font-size:13px;color:#a03a1a;background:#fde8e0;border-radius:10px;padding:6px 10px;display:none;line-height:1.7}
.nar select{font-family:inherit;font-size:12px;border-radius:8px;border:1px solid #d9c9a8;padding:3px;max-width:150px}
.spk{border:0;background:#fff3dc;border-radius:999px;width:32px;height:32px;font-size:15px;vertical-align:middle;margin-inline-start:6px;flex:none}
.flip .spk{position:absolute;top:6px;left:6px;z-index:3;background:rgba(255,255,255,.85)}
@media (max-width:700px){.nar .rd span{display:none}.nar .rd{padding:4px 6px}.nar .pl{padding:0 12px;font-size:14px}}
body.hl #lessonChip{display:none!important}
#lessonChip{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:35;border:0;border-radius:999px;padding:10px 18px;font-weight:800;font-size:15px;color:#fff;background:linear-gradient(135deg,#0d8f8c,#3d7eb9);box-shadow:0 6px 20px rgba(0,0,0,.4);display:none;animation:pulse2 2.4s infinite}
@keyframes pulse2{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,.4)}50%{box-shadow:0 6px 30px rgba(47,143,106,.9)}}
#backLesson{position:fixed;left:50%;transform:translateX(-50%);top:calc(116px + env(safe-area-inset-top,0px));z-index:85;border:0;border-radius:999px;padding:10px 16px;font-weight:800;color:#fff;background:#0d8f8c;box-shadow:0 6px 20px rgba(0,0,0,.4);display:none}
@media (max-width:700px){#lesson .tabs button{min-width:66px;font-size:12px}#lesson p{font-size:16px}.match{grid-template-columns:1fr}.flip{height:190px}}
`;

export function initLessons(LESSONS, ctx) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const root = document.createElement('div'); root.id = 'lesson'; document.body.appendChild(root);
  const chip = document.createElement('button'); chip.id = 'lessonChip'; document.body.appendChild(chip);
  const back = document.createElement('button'); back.id = 'backLesson'; back.textContent = '↩ العودة إلى الدرس'; document.body.appendChild(back);
  let L = null, tab = 0, sec = 0, prog = {}, bot = null, botL = null;
  /* ── التعلّم النشط: النجوم ── */
  function award(n, why) {
    if (!L || !L.active) return; prog.stars = (prog.stars || 0) + n; save();
    const s = root.querySelector('.lh .stars'); if (s) { s.textContent = '⭐ ' + AR(prog.stars); s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }
    const f = document.createElement('div'); f.className = 'starFly'; f.textContent = '⭐ +' + AR(n) + (why ? ' — ' + why : ''); const lw = root.querySelector('.lw'); if (lw) lw.appendChild(f); setTimeout(() => f.remove(), 1900);
  }
  /* ── وضع العرض للمعلّم ── */
  let present = false, tmrInt = 0, tmrLeft = 0;
  let picked = []; try { picked = JSON.parse(localStorage.getItem('sci-picked') || '[]'); } catch (e) {}
  const beep = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .25, .5].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(.25, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + t + .22); o.start(a.currentTime + t); o.stop(a.currentTime + t + .23); }); } catch (e) {} };
  const fmt = n => AR(Math.floor(n / 60)) + ':' + AR(String(n % 60).padStart(2, '0'));
  function startTimer(sec, label) {
    clearInterval(tmrInt); tmrLeft = sec; const t = root.querySelector('.tmr'); if (!t) return;
    const paint = () => { t.innerHTML = fmt(tmrLeft) + (label ? `<small>${label}</small>` : ''); };
    t.className = 'tmr show'; t.dataset.paused = ''; t.style.opacity = 1; paint();
    tmrInt = setInterval(() => { if (t.dataset.paused) return; tmrLeft--; paint(); if (tmrLeft <= 0) { clearInterval(tmrInt); t.classList.add('end'); t.innerHTML = '⏰ انتهى الوقت'; beep(); } }, 1000);
    t.onclick = () => { if (t.classList.contains('end')) { t.className = 'tmr'; tmrLeft = 0; return; } t.dataset.paused = t.dataset.paused ? '' : '1'; t.style.opacity = t.dataset.paused ? .6 : 1; };
  }
  function pickStudent() {
    let names = []; try { names = (localStorage.getItem('sci-names') || '').split('\n').map(x => x.trim()).filter(Boolean); } catch (e) {}
    const n = Math.max(2, +(localStorage.getItem('sci-classn') || 25));
    const pool = names.length ? names : Array.from({ length: n }, (_, i) => String(i + 1));
    let left = pool.filter(x => !picked.includes(x)); if (!left.length) { picked = []; left = pool.slice(); }
    const choice = left[Math.floor(Math.random() * left.length)]; picked.push(choice); try { localStorage.setItem('sci-picked', JSON.stringify(picked)); } catch (e) {}
    const big = root.querySelector('.pickov'); big.classList.add('show'); const v = big.querySelector('.v'), l = big.querySelector('.l'); l.textContent = '🎲 جارٍ الاختيار…'; big.querySelector('button').style.display = 'none';
    v.style.fontSize = names.length ? 'min(14vw,110px)' : '';
    let k = 0; const spin = setInterval(() => { v.textContent = AR(pool[Math.floor(Math.random() * pool.length)]); if (++k > 16) { clearInterval(spin); v.textContent = AR(choice); l.textContent = (names.length ? 'الطالبُ المختار' : 'رقمُ الطالبِ المختار') + ' (بقيَ ' + AR(pool.length - picked.length) + ')'; big.querySelector('button').style.display = ''; beep(); } }, 90);
  }
  function setPresent(on) {
    present = on; root.classList.toggle('present', on);
    try { if (on && !document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    const b = root.querySelector('[data-present]'); if (b) b.textContent = on ? '✕ إنهاء العرض' : '🖥️ وضع العرض';
    if (!on) { root.querySelectorAll('.pop').forEach(p => p.classList.remove('show')); }
  }
  document.addEventListener('keydown', e => {
    if (!root.classList.contains('open') || !present || /INPUT|TEXTAREA/.test((document.activeElement || {}).tagName)) return;
    if (e.key === 'ArrowLeft' && tab < 4) { tab++; render(); } else if (e.key === 'ArrowRight' && tab > 0) { tab--; render(); }
    else if (e.key === 'Escape') setPresent(false);
  });
  function presentHTML() {
    if (!L.active) return '';
    let cn = 25, nm = ''; try { cn = localStorage.getItem('sci-classn') || 25; nm = (localStorage.getItem('sci-names') || '').replace(/</g, ''); } catch (e) {}
    return `<div class="ptools"><button data-pt="timer" title="مؤقّت">⏱<small>مؤقّت</small></button><button data-pt="pick" title="اختيارُ طالب">🎲<small>طالب</small></button><button data-pt="set" title="إعدادات الصف">👥<small>الصف</small></button></div>
      <div class="pop" data-pp="timer"><h4>⏱ مؤقّتُ النشاط</h4><div class="row">${[1, 2, 3, 5].map(m => `<button data-tm="${m * 60}">${AR(m)} د</button>`).join('')}</div><div class="row" style="margin-top:6px"><button data-tm="30">٣٠ ث</button><button data-tm="0">إيقاف</button></div></div>
      <div class="pop" data-pp="set"><h4>👥 طلابُ الصف</h4><label>عددُ الطلاب: <input type="number" min="2" max="60" id="pN" value="${cn}"></label><label>أو أسماءُ الطلاب (اسمٌ في كلِّ سطر):<textarea id="pNames" rows="5">${nm}</textarea></label><div class="row"><button id="pSave">حفظ</button><button id="pReset">جولةٌ جديدة</button></div><small style="color:#888">لا يتكرّرُ طالبٌ حتى يُختارَ الجميع.</small></div>
      <div class="tmr"></div><div class="pickov"><div class="v"></div><div class="l"></div><button>تم ✓</button></div>`;
  }
  function wirePresent() {
    if (!L.active) return;
    root.querySelectorAll('[data-pt]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.pt; if (k === 'pick') { root.querySelectorAll('.pop').forEach(p => p.classList.remove('show')); return pickStudent(); } root.querySelectorAll('.pop').forEach(p => p.classList.toggle('show', p.dataset.pp === k && !p.classList.contains('show'))); });
    root.querySelectorAll('[data-tm]').forEach(b => b.onclick = () => { const v = +b.dataset.tm; root.querySelector('[data-pp=timer]').classList.remove('show'); if (!v) { clearInterval(tmrInt); tmrLeft = 0; root.querySelector('.tmr').className = 'tmr'; } else startTimer(v); });
    const sv = root.querySelector('#pSave'); if (sv) sv.onclick = () => { try { localStorage.setItem('sci-classn', root.querySelector('#pN').value); localStorage.setItem('sci-names', root.querySelector('#pNames').value); localStorage.setItem('sci-picked', '[]'); } catch (e) {} picked = []; root.querySelector('[data-pp=set]').classList.remove('show'); };
    const rs = root.querySelector('#pReset'); if (rs) rs.onclick = () => { picked = []; try { localStorage.setItem('sci-picked', '[]'); } catch (e) {} rs.textContent = '✓ تمت'; };
    const big = root.querySelector('.pickov'); big.querySelector('button').onclick = () => big.classList.remove('show');
  }

  /* ── قارئ الدرس (أصوات الجهاز العربية) ── */
  const synth = window.speechSynthesis;
  const READERS = [{ id: 'tm', n: 'معلّم', i: '👨‍🏫', g: 'm', pitch: .92, rate: .9 }, { id: 'tf', n: 'معلّمة', i: '👩‍🏫', g: 'f', pitch: 1.02, rate: .9 }];
  let AUD = {}; // لا تسجيلاتٌ صوتيةٌ مسبقة في هذا الكتاب: القراءةُ بصوتِ الجهاز
  let audioEl = null;
  const MALE = /maged|majed|hamed|naayf|tarik|tariq|shakir|fahed|hamdan|omar|salim|bassel|hamza|moaz|rami|male|-ard|-are|#male/i, FEMALE = /laila|layla|mariam|maryam|zariyah|hoda|salma|amina|zeina|fatima|amira|sana|reem|noura|female|-arc|-arz|google|#female/i;
  let voices = [], reader = READERS[0], speed = 1, vOverride = '';
  try { const r = localStorage.getItem('sci9-reader'); if (r) reader = READERS.find(x => x.id === r) || READERS[0]; speed = +localStorage.getItem('sci9-speed') || 1; vOverride = localStorage.getItem('sci9-voice') || ''; } catch (e) {}
  const loadVoices = () => { if (!synth) return; voices = synth.getVoices().filter(v => /^ar/i.test(v.lang)); voices.sort((a, b) => (b.lang === 'ar-SA') - (a.lang === 'ar-SA') || (b.localService) - (a.localService)); paintNar(); };
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; setTimeout(loadVoices, 800); }
  function pickVoice(r) {
    if (vOverride) { const v = voices.find(x => x.voiceURI === vOverride); if (v) return { v, adj: 1 }; }
    const want = r.g === 'm' ? MALE : FEMALE, other = r.g === 'm' ? FEMALE : MALE;
    let v = voices.find(x => want.test(x.name) && !other.test(x.name)) || voices.find(x => want.test(x.name));
    if (v) return { v, adj: 1 };
    v = voices[0]; if (!v) return null;
    const isF = FEMALE.test(v.name) && !MALE.test(v.name);
    return { v, adj: r.g === 'm' && isF ? .72 : r.g === 'f' && !isF ? 1.25 : 1 };
  }
  let Q = [], qi = 0, playing = false, curEl = null, scriptFn = null, scriptLabel = '';
  const splitText = t => { const out = []; String(t).replace(/<[^>]+>/g, '').replace(/[•←→]/g, '، ').split(/(?<=[.؟!؛:])\s+/).forEach(x => { x = x.trim(); if (!x) return; while (x.length > 190) { let k = x.lastIndexOf('،', 190); if (k < 60) k = x.indexOf(' ', 150); if (k < 0) break; out.push(x.slice(0, k + 1)); x = x.slice(k + 1).trim(); } out.push(x); }); return out; };
  function markEl(el) { if (curEl) curEl.classList.remove('reading'); curEl = el || null; if (curEl) { curEl.classList.add('reading'); try { curEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} } }
  function speakNext() {
    if (!playing) return; if (qi >= Q.length) return stopNar(true);
    const it = Q[qi];
    if (it.a) { markEl(it.el); const cap = root.querySelector('.nar .cap'); if (cap) cap.textContent = it.t.slice(0, 140) + (it.t.length > 140 ? '…' : ''); audioEl = new Audio(it.a); audioEl.playbackRate = speed; audioEl.onended = () => { if (!playing) return; qi++; speakNext(); }; audioEl.onerror = () => { qi++; speakNext(); }; audioEl.play().catch(() => {}); return; }
    if (!synth) { qi++; return speakNext(); }
    const pv = pickVoice(reader); if (!pv) { stopNar(); return showWarn(); }
    markEl(it.el); const cap = root.querySelector('.nar .cap'); if (cap) cap.textContent = it.t;
    const u = new SpeechSynthesisUtterance(it.t); u.voice = pv.v; u.lang = pv.v.lang; u.pitch = Math.min(2, reader.pitch * pv.adj); u.rate = reader.rate * speed;
    u.onend = () => { if (!playing || u._cancel) return; qi++; speakNext(); }; u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') return; qi++; speakNext(); };
    Q._u = u; synth.speak(u);
  }
  function playScript(items, label) {
    const hasAud = items.some(it => it.k && AUD[reader.id] && AUD[reader.id][it.k]);
    if (!hasAud) { if (!synth) return showWarn(true); if (!voices.length) { loadVoices(); if (!voices.length) return showWarn(); } }
    stopNar(); Q = []; items.forEach(({ t, el, k }) => { const a = k && AUD[reader.id] && AUD[reader.id][k]; if (a) Q.push({ t, el, a }); else splitText(t).forEach(x => Q.push({ t: x, el })); }); qi = 0; playing = true; paintNar(label); speakNext();
  }
  function pauseNar() { if (!playing) return; playing = false; if (audioEl) { audioEl.pause(); } if (Q._u) Q._u._cancel = true; synth && synth.cancel(); paintNar(); }
  function resumeNar() { if (!Q.length || qi >= Q.length) return; playing = true; paintNar(); if (Q[qi].a && audioEl && audioEl.src) { audioEl.play().catch(() => {}); return; } speakNext(); }
  function stopNar(done) { if (audioEl) { audioEl.pause(); audioEl = null; } playing = false; if (Q && Q._u) Q._u._cancel = true; if (synth) synth.cancel(); markEl(null); if (!done) { Q = []; qi = 0; } else { qi = 0; Q = []; } const cap = root.querySelector('.nar .cap'); if (cap) cap.textContent = ''; paintNar(); }
  function showWarn(none) { const w = root.querySelector('.nar .warn'); if (!w) return; w.style.display = 'block'; w.innerHTML = none ? 'المتصفح لا يدعم القراءة الصوتية.' : '<details><summary>⚠ لا يوجد صوتٌ عربيّ مثبّت على هذا الجهاز — كيف أثبّته؟</summary>• آيفون/آيباد: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية، ونزّل صوتًا (مثل «ماجد» أو «ليلى»).<br>• أندرويد: الإعدادات ← تحويل النص إلى كلام ← محرّك Google ← تثبيت بيانات الصوت ← العربية.<br>• ويندوز: الإعدادات ← الوقت واللغة ← الكلام ← إضافة أصوات ← العربية.</details>'; }
  function paintNar(label) {
    if (label !== undefined) scriptLabel = label;
    const n = root.querySelector('.nar'); if (!n) return;
    n.querySelectorAll('.rd').forEach(b => b.classList.toggle('on', b.dataset.r === reader.id));
    const pl = n.querySelector('.pl'); pl.textContent = playing ? '⏸ إيقاف مؤقت' : (Q.length && qi > 0 ? '▶ متابعة' : '▶ ' + (scriptLabel || 'استمع'));
    const sel = n.querySelector('select'); if (sel) { sel.innerHTML = `<option value="">صوت تلقائي</option>` + voices.map(v => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === vOverride ? 'selected' : ''}>${esc(v.name)}</option>`).join(''); sel.style.display = voices.length > 1 ? '' : 'none'; }
  }
  const NARRATION = false;
  function narHTML() {
    if (!NARRATION) return '';
    return `<div class="nar"><div class="row"><span style="font-weight:800;font-size:13px;color:#7a5a2a">🔊 القارئ:</span>${READERS.map(r => `<button class="rd" data-r="${r.id}" title="${r.n}"><i>${r.i}</i><span>${r.n}</span></button>`).join('')}
      <span style="flex:1"></span><button class="pl">▶ استمع</button><button class="st" title="إيقاف">⏹</button><button class="st" data-cfg title="إعدادات الصوت">⚙</button></div>
      <div class="row cfg" style="display:none"><label class="spd">السرعة <input type="range" min=".6" max="1.4" step=".1" value="${speed}"></label><select title="اختيار صوتٍ محدّد"></select></div>
      <div class="cap"></div><div class="warn"></div></div>`;
  }
  function wireNar() {
    const n = root.querySelector('.nar'); if (!n) return;
    n.querySelectorAll('.rd').forEach(b => b.onclick = () => { reader = READERS.find(r => r.id === b.dataset.r); try { localStorage.setItem('sci9-reader', reader.id); } catch (e) {} const was = playing; if (was) { const k = qi; stopNar(); if (scriptFn) { playScript(scriptFn(), scriptLabel); } } paintNar(); });
    n.querySelector('.pl').onclick = () => { if (playing) return pauseNar(); if (Q.length && qi > 0 && qi < Q.length) return resumeNar(); if (scriptFn) playScript(scriptFn(), scriptLabel); };
    n.querySelector('.st:not([data-cfg])').onclick = () => stopNar();
    n.querySelector('[data-cfg]').onclick = () => { const c = n.querySelector('.cfg'); c.style.display = c.style.display === 'none' ? 'flex' : 'none'; };
    n.querySelector('.spd input').oninput = e => { speed = +e.target.value; try { localStorage.setItem('sci9-speed', speed); } catch (er) {} };
    n.querySelector('select').onchange = e => { vOverride = e.target.value; try { localStorage.setItem('sci9-voice', vOverride); } catch (er) {} };
    paintNar();
  }
  const setScript = (fn, label) => { scriptFn = fn; scriptLabel = label; paintNar(label); };
  const spk = (t) => !NARRATION ? '' : `<button class="spk" data-say="${esc(t)}" title="استمع">🔊</button>`;
  root.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (!b) return; e.stopPropagation(); playScript([{ t: b.dataset.say, el: b.closest('.qi,.flip,.obj,.card') }], scriptLabel); }, true);
  const TABS = [['🎬', 'التهيئة'], ['🎯', 'الأهداف'], ['📚', 'المفاهيم'], ['🧑‍🏫', 'الشرح'], ['📝', 'التقويم']];
  const load = () => { try { prog = JSON.parse(localStorage.getItem('sci9-lesson-' + L.id) || '{}'); } catch (e) { prog = {}; } };
  const save = () => { try { localStorage.setItem('sci9-lesson-' + L.id, JSON.stringify(prog)); } catch (e) {} };
  const crop = (n, [x0, y0, x1, y1], extra = '') => { const w = x1 - x0, h = y1 - y0; return `background-image:url(${ctx.src(n)});background-size:${ctx.PW / w * 100}% auto;background-position:${x0 / (ctx.PW - w) * 100}% ${y0 / (ctx.PH - h) * 100}%;aspect-ratio:${w}/${h};${extra}`; };
  const pageBtn = (p, label) => `<button class="pbtn" data-go="${p}">📖 ${label || 'اقرأ في الكتاب ص ' + AR(p)}</button>`;
  const modelBtn = id => `<button class="mbtn" data-model="${id}">🧊 افتح المجسّم ثلاثي الأبعاد</button>`;

  function open(lesson, t) {
    L = lesson; if (L.active === undefined) L.active = true; if (L !== botL) sec = 0; load(); tab = t ?? prog.tab ?? 0; root.classList.add('open'); back.style.display = 'none'; render();
  }
  function close() { stopNar(); root.classList.remove('open'); prog.tab = tab; save(); }
  function render() {
    root.innerHTML = `<div class="lw">
      <div class="lh"><div class="tt"><b>${L.title}</b><small>${L.unit} · ص ${AR(L.from)}–${AR(L.to)}</small></div>${L.active ? `<span class="stars" title="نجومي">⭐ ${AR(prog.stars || 0)}</span><button class="pm" data-present title="وضع العرض على السبورة الذكية">${present ? '✕ إنهاء العرض' : '🖥️ وضع العرض'}</button>` : ''}<button data-x title="إغلاق">✕</button></div>
      <div class="tabs">${TABS.map(([i, t], k) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''} ${prog['v' + k] ? 'done' : ''}"><i>${i}</i>${AR(k + 1)}. ${t}</button>`).join('')}</div>
      <div class="lb" id="lb"></div>${narHTML()}${presentHTML()}
      <div class="lf">${tab > 0 ? `<button data-prev>→ ${TABS[tab - 1][1]}</button>` : ''}${tab < 4 ? `<button class="pri" data-next>التالي: ${TABS[tab + 1][1]} ←</button>` : `<button class="pri" data-x>إنهاء الدرس والعودة إلى الكتاب</button>`}</div></div>`;
    prog['v' + tab] = 1; prog.tab = tab; save();
    stopNar(); scriptFn = null;
    const lb = root.querySelector('#lb');
    [rEngage, rObjectives, rVocab, rExplain, rQuiz][tab](lb); wireNar(); wirePresent(); if (tmrLeft > 0) startTimer(tmrLeft);
    lb.scrollTop = 0;
    { const lw = root.querySelector('.lw'); if (botL !== L) { bot = mountAssistant(lw, L, () => tab === 3 ? sec : -1, L.assist || ASSIST[L.id]); botL = L; } else bot.attach(lw); if (tab === 3) bot.setSection(sec); }
  }
  root.addEventListener('click', e => {
    const t = e.target.closest('button,[data-go],[data-model]'); if (!t) return;
    if (t.dataset.present !== undefined) return setPresent(!present);
    if (t.dataset.x !== undefined) { setPresent(false); clearInterval(tmrInt); tmrLeft = 0; return close(); }
    if (t.dataset.tab !== undefined) { tab = +t.dataset.tab; return render(); }
    if (t.dataset.next !== undefined) { tab++; return render(); }
    if (t.dataset.prev !== undefined) { tab--; return render(); }
    if (t.dataset.go) { close(); back.style.display = 'block'; ctx.goTo(+t.dataset.go); return; }
    if (t.dataset.model) { close(); back.style.display = 'block'; ctx.openModel(t.dataset.model); return; }
  });
  back.onclick = () => { back.style.display = 'none'; ctx.closeModel && ctx.closeModel(); open(L, tab); };


  function genericExplore(X) {
    if (!X || !X.title) return '';
    return `<div class="card blue"><span class="tag">🔬 ${X.kind || 'أستكشفُ — نشاطٌ استقصائيّ'}</span> ${pageBtn(X.page)}
      <h3>${X.title}</h3>${X.intro ? `<p>${X.intro}</p>` : ''}
      ${X.needs ? `<div style="font-weight:800;margin-top:6px">أحتاجُ إلى: <span style="font-weight:600">${X.needs.join('، ')}</span></div>` : ''}
      ${X.steps ? `<div style="font-weight:800;margin-top:6px">الخطوات:</div>${X.steps.map((s, i) => `<p style="margin:2px 0">${AR(i + 1)}. ${s}</p>`).join('')}` : ''}
      ${X.concl ? `<div style="font-weight:800;margin-top:10px">أستخلصُ النتائج:</div>${X.concl.map((c, i) => `<div class="qi"><div class="qq">${c.q}</div><button class="abtn sec" data-rv="c${i}">اعرضِ الإجابة</button><div class="reveal" id="c${i}">${c.a}</div></div>`).join('')}` : ''}
      ${X.more ? `<p style="color:#6a5a44">💡 ${X.more}</p>` : ''}</div>`;
  }
  // لعبة الترتيب: steps بالترتيب الصحيح
  function gameOrder(w, G) {
    w.innerHTML = `<div class="card blue order"><span class="tag">🔢 ${G.title}</span><div class="og"></div><div class="fb"></div><button class="abtn sec">🔄 أعدِ المحاولة</button></div>`;
    const go = () => { let k = 0; const o = w.querySelector('.og'), fb = w.querySelector('.fb'); fb.textContent = ''; o.innerHTML = shuffle(G.steps.map((s, i) => [s, i])).map(([s, i]) => `<button data-i="${i}">${s}</button>`).join('');
      o.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; if (+b.dataset.i === k) { b.classList.add('ok'); b.insertAdjacentHTML('afterbegin', `<span class="k">${AR(k + 1)}</span>`); k++; if (k === G.steps.length) { award(2, 'رتّبتَ الخطوات'); fb.className = 'fb ok'; fb.textContent = '🌟 أحسنت! الترتيبُ صحيح.'; } } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); } }); };
    w.querySelector('.abtn').onclick = go; go();
  }
  // لعبة التصنيف: cats + items [[label, catIndex]]
  function gameSort(w, G) {
    w.innerHTML = `<div class="card green"><span class="tag g">🧺 ${G.title}</span><p style="margin:6px 0">المسْ بطاقةً ثم المسِ المجموعةَ التي تنتمي إليها.</p>
      <div class="sortItems" style="display:flex;flex-wrap:wrap;gap:8px"></div>
      <div class="sortCats" style="display:grid;grid-template-columns:repeat(${G.cats.length},1fr);gap:8px;margin-top:10px">${G.cats.map((c, i) => `<div data-c="${i}" style="border:2px dashed #0d8f8c;border-radius:14px;min-height:90px;padding:6px;background:#f3fbf6"><div style="font-weight:800;color:#15445a;text-align:center;margin-bottom:4px">${c}</div><div class="in" style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center"></div></div>`).join('')}</div>
      <div class="fb"></div><button class="abtn sec">🔄 أعدِ اللعب</button></div>`;
    const go = () => { let sel = null, done = 0; const it = w.querySelector('.sortItems'), fb = w.querySelector('.fb'); fb.textContent = ''; w.querySelectorAll('.sortCats .in').forEach(x => x.innerHTML = '');
      it.innerHTML = shuffle(G.items.map((x, i) => [x, i])).map(([[t], i]) => `<button class="chip" data-i="${i}">${t}</button>`).join('');
      it.querySelectorAll('button').forEach(b => b.onclick = () => { it.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); sel = b; });
      w.querySelectorAll('.sortCats [data-c]').forEach(c => c.onclick = () => { if (!sel) return; const ok = G.items[+sel.dataset.i][1] === +c.dataset.c; if (ok) { sel.classList.remove('on'); sel.classList.add('ok'); c.querySelector('.in').appendChild(sel); sel.onclick = null; sel = null; if (++done === G.items.length) { award(2, 'صنّفتَ كلَّ البطاقات'); fb.className = 'fb ok'; fb.textContent = '🌟 ممتاز! صنّفتَ جميعَ البطاقاتِ تصنيفًا صحيحًا.'; } } else { sel.classList.add('no'); const b = sel; setTimeout(() => b.classList.remove('no'), 500); } }); };
    w.querySelector('.abtn').onclick = go; go();
  }

  /* ── ١. التهيئة ── */
  function rEngage(el) {
    const E = L.engage, X = L.explore || {}; const UL = !X.lab && LAB_FOR[L.id];
    el.innerHTML = `
    <div class="hero"><div class="ph" style="${crop(E.page, E.crop)}"></div>
      ${E.anim === 'rain' ? `      <svg viewBox="0 0 1112 800" preserveAspectRatio="none">
        <defs><linearGradient id="wg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3ab0ff"/><stop offset="1" stop-color="#9fe0ff"/></linearGradient></defs>
        ${Array.from({ length: 26 }, (_, i) => { const x = 40 + (i * 157) % 1060, d = (i * .37) % 2.2; return `<line x1="${x}" y1="-40" x2="${x - 12}" y2="0" stroke="#bfe6ff" stroke-width="5" stroke-linecap="round" opacity=".85"><animateTransform attributeName="transform" type="translate" from="0 -60" to="-40 860" dur="1.6s" begin="${d}s" repeatCount="indefinite"/></line>`; }).join('')}
        <rect x="0" y="760" width="1112" height="40" fill="#3ab0ff" opacity=".0"><animate attributeName="opacity" values="0;.45;0" dur="4s" repeatCount="indefinite"/></rect>
        ${[[300, 760, 180], [420, 770, 120], [520, 760, 170], [235, 760, 330]].map(([x, y1, y2], i) => `<path d="M${x} ${y1} L${x} ${y2}" stroke="url(#wg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="40 30" opacity=".85"><animate attributeName="stroke-dashoffset" from="0" to="-350" dur="3s" begin="${i * .4}s" repeatCount="indefinite"/></path>`).join('')}
      </svg>
` : ''}
      ${E.caption ? `<div class="cap">${E.caption}</div>` : ''}</div>
    <div class="qbox"><span class="tag">👀 ${E.lookTitle || 'أنظرُ وأتساءلُ'}</span><p style="margin:8px 0 0">${E.look}</p><div class="q">${E.question}</div>
      ${E.choices ? `<div style="font-size:14px;color:#3a6a8a">اختر كلَّ ما تتوقّعه، ثم اكشف الإجابة:</div>
      <div class="chips" id="eChips">${E.choices.map((c, i) => `<button class="chip" data-i="${i}">${c}</button>`).join('')}</div>` : '<div style="font-size:14px;color:#3a6a8a">فكّرْ في إجابتك وناقشْها مع زملائك، ثم اكشفِ الإجابة.</div>'}
      <button class="abtn" id="eRev">اكشفِ الإجابة</button><div class="reveal" id="eAns">✅ ${E.reveal}</div></div>
    ${E.warmups ? `<div class="card orange"><span class="tag o">💬 أسئلةٌ للنقاش (فكّرْ – زاوجْ – شارِكْ)</span>${E.warmups.map(w => `<p>• ${w.q}</p>`).join('')}</div>` : ''}
    ${X.lab === 'celery' ? `
    <div class="card blue lab"><span class="tag">🔬 أستكشفُ — نشاطٌ استقصائيّ</span> ${pageBtn(X.page)}
      <h3>${X.title}</h3><p>${X.intro}</p>
      <div style="font-weight:800;margin-top:6px">١) أكوّنُ فرضيةً: «${X.hypo}»</div>
      <div class="chips" id="hChips">${X.hypoChoices.map((c, i) => `<button class="chip" data-i="${i}">${c}</button>`).join('')}</div>
      <div style="font-weight:800;margin-top:6px">٢) أحتاجُ إلى: <span style="font-weight:600">${X.needs.join('، ')}</span></div>
      <div style="font-weight:800;margin-top:6px">٣) أختبرُ فرضيّتي:</div>${X.steps.map((s, i) => `<p style="margin:2px 0">${AR(i + 1)}. ${s}</p>`).join('')}
      <div id="labSvg"></div>
      <label style="font-weight:800;display:block;margin-top:6px">⏱ مرورُ الوقت: <span id="labT">٠ ساعة</span></label><input type="range" id="labR" min="0" max="24" value="0">
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="abtn sec" id="labPlay">▶ انتظرْ حتى اليومِ التالي</button><button class="abtn" id="labMeasure">📏 أقيسُ بالمسطرة</button></div>
      <table><tr><th>الساق</th><th>عددُ الأوراق</th><th>مسافةُ انتقالِ الماء (سم)</th></tr>${['الأولى', 'الثانية', 'الثالثة'].map((n, i) => `<tr><td>${n}</td><td>${['لا أوراق', 'ورقة واحدة', 'كلّ الأوراق'][i]}</td><td id="m${i}">—</td></tr>`).join('')}</table>
      <div style="font-weight:800;margin-top:10px">٤) أستخلصُ النتائج:</div>
      ${X.concl.map((c, i) => `<div class="qi"><div class="qq">${c.q}</div><button class="abtn sec" data-rv="c${i}">اعرضِ الإجابة</button><div class="reveal" id="c${i}">${c.a}</div></div>`).join('')}
      <p style="color:#6a5a44">💡 ${X.more}</p></div>` : X.lab && LABS[X.lab] ? `<div class="card blue"><span class="tag">🧪 المختبرُ الافتراضيّ — أستكشف</span> ${pageBtn(X.page, 'النشاطُ في الكتاب ص ' + AR(X.page))}<h3>${X.title}</h3><p>${X.intro}</p><div id="vlab"></div><p style="color:#6a5a44">💡 ${X.more}</p></div>` : genericExplore(X)}${UL ? `<div class="card blue"><span class="tag">🧪 المختبرُ الافتراضيّ — أجرّبُ بنفسي</span><h3>${UL.title}</h3><p>${UL.intro}</p><div id="vlab2"></div></div>` : ''}`;
    if (L.active && E.warmups) { const wc = el.querySelector('.card.orange'); if (wc) wc.outerHTML = `<div class="card orange"><span class="tag o">💬 فكّرْ – زاوِجْ – شارِكْ</span>${E.warmups.map(w => `<p style="font-weight:700">• ${w.q}</p>`).join('')}
      <div class="tps"><button data-tps="0"><b>🤔</b>١. فكّرْ وحدَك<br><small>٣٠ ثانية</small></button><button data-tps="1"><b>👫</b>٢. ناقشْ زميلَك<br><small>دقيقة</small></button><button data-tps="2"><b>🙋</b>٣. شاركِ الصفّ<br><small>دقيقة</small></button></div><div class="tpsT"></div></div>`;
      let ti = 0; const T = el.querySelector('.tpsT');
      el.querySelectorAll('[data-tps]').forEach(b => b.onclick = () => { const k = +b.dataset.tps, secs = [30, 60, 60][k]; el.querySelectorAll('[data-tps]').forEach((x, i) => { x.classList.toggle('on', i === k); if (i < k) x.classList.add('ok'); }); clearInterval(ti); let left = secs; T.textContent = fmt(left); ti = setInterval(() => { if (!document.body.contains(T)) return clearInterval(ti); left--; T.textContent = left > 0 ? fmt(left) : (k < 2 ? '⏰ انتقلْ إلى الخطوةِ التالية' : '🌟 أحسنتم!'); if (left <= 0) { clearInterval(ti); beep(); if (k === 2) award(1, 'شاركتَ في النقاش'); } }, 1000); }); }
    if (X.lab && LABS[X.lab]) LABS[X.lab](el.querySelector('#vlab'), { award, AR }); if (UL && LABS[UL.lab]) LABS[UL.lab](el.querySelector('#vlab2'), { award, AR });
    const qb = el.querySelector('.qbox'), lab = el.querySelector('.lab');
    if (NARRATION) setScript(() => [{ t: 'أنظرُ وأتساءلُ. ' + E.look + ' ' + E.question, el: qb }, ...(el.querySelector('#eAns').classList.contains('show') ? [{ t: E.reveal, el: el.querySelector('#eAns') }] : []), { t: 'أسئلةٌ للنقاش. ' + E.warmups.map(w => w.q).join(' '), el: el.querySelector('.card.orange') }, { t: 'أستكشفُ. ' + X.title + ' ' + X.intro + ' أكوّنُ فرضيّةً. ' + X.steps.join(' '), el: lab }], 'استمع إلى التهيئة');
    el.querySelectorAll('#eChips .chip').forEach(b => b.onclick = () => b.classList.toggle('on'));
    el.querySelector('#eRev').onclick = () => { el.querySelectorAll('#eChips .chip').forEach((b, i) => { b.classList.remove('on'); b.classList.add((E.ok || [0, 1, 2, 3]).includes(i) ? 'ok' : 'no'); }); el.querySelector('#eAns').classList.add('show'); };
    el.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => el.querySelector('#' + b.dataset.rv).classList.toggle('show'));
    if (X.lab !== 'celery') return;
    el.querySelectorAll('#hChips .chip').forEach(b => b.onclick = () => { el.querySelectorAll('#hChips .chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); prog.hypo = +b.dataset.i; save(); });
    if (prog.hypo !== undefined) el.querySelectorAll('#hChips .chip')[prog.hypo]?.classList.add('on');
    // مختبر الكرفس
    const MAX = [1.5, 4, 9]; let T = 0, measured = false, timer = 0;
    const svgBox = el.querySelector('#labSvg');
    function draw() {
      const cups = [0, 1, 2].map(i => {
        const x = 40 + i * 180, h = MAX[i] * T / 24, px = h * 26;
        const leaves = i === 0 ? '' : i === 1 ? `<ellipse cx="${x + 72}" cy="62" rx="26" ry="14" fill="#5fa83a" transform="rotate(-25 ${x + 72} 62)"/>` : [[-30, 50, -30], [26, 46, 25], [-6, 30, 0], [-34, 78, -40], [30, 74, 40], [0, 58, 5]].map(([dx, y, r]) => `<ellipse cx="${x + 60 + dx}" cy="${y}" rx="26" ry="13" fill="${r % 2 ? '#4f9a32' : '#6ab845'}" transform="rotate(${r} ${x + 60 + dx} ${y})"/>`).join('');
        return `<g>${leaves}<rect x="${x + 50}" y="70" width="20" height="290" rx="9" fill="#cfe8a8" stroke="#9cc46a"/>
          <rect x="${x + 53}" y="${330 - px}" width="14" height="${px}" rx="6" fill="#3d7eb9" opacity=".85"/>
          <path d="M${x} 240 L${x + 120} 240 L${x + 110} 360 L${x + 10} 360 Z" fill="#cfe9ff" opacity=".55" stroke="#8ab"/>
          <path d="M${x + 3} 270 L${x + 117} 270 L${x + 110} 360 L${x + 10} 360 Z" fill="#2f6fd6" opacity=".65"/>
          ${measured ? `<g><rect x="${x + 76}" y="${330 - 9 * 26}" width="16" height="${9 * 26 + 30}" fill="#ffe08a" stroke="#c9a030"/>${Array.from({ length: 10 }, (_, k) => `<line x1="${x + 76}" x2="${x + (k % 5 ? 84 : 90)}" y1="${330 - k * 26}" y2="${330 - k * 26}" stroke="#7a5a00"/>`).join('')}<text x="${x + 96}" y="${330 - px + 5}" font-size="18" font-weight="800" fill="#c0392b">${AR(h.toFixed(1))} سم</text></g>` : ''}
          <text x="${x + 60}" y="390" text-anchor="middle" font-size="17" font-weight="800" fill="#4a3a28">${['الساق ١', 'الساق ٢', 'الساق ٣'][i]}</text></g>`; }).join('');
      svgBox.innerHTML = `<svg viewBox="0 0 580 400">${cups}</svg>`;
      el.querySelector('#labT').textContent = T >= 24 ? 'اليوم التالي (٢٤ ساعة)' : AR(Math.round(T)) + ' ساعة';
      [0, 1, 2].forEach(i => el.querySelector('#m' + i).textContent = measured ? AR((MAX[i] * T / 24).toFixed(1)) : '—');
    }
    const R = el.querySelector('#labR'); R.oninput = () => { T = +R.value; draw(); };
    el.querySelector('#labPlay').onclick = () => { clearInterval(timer); T = 0; timer = setInterval(() => { T = Math.min(24, T + .4); R.value = T; draw(); if (T >= 24) clearInterval(timer); }, 50); };
    el.querySelector('#labMeasure').onclick = () => { measured = !measured; draw(); };
    draw();
  }

  /* ── ٢. الأهداف ── */
  function rObjectives(el) {
    prog.obj ||= {};
    el.innerHTML = `<h2>🎯 أهدافُ الدرس</h2>
      <div class="card green"><span class="tag g">❓ السؤالُ الأساسيّ</span><p style="font-size:20px;font-weight:800;color:#1f5f45">${L.essential}</p></div>
      <p style="color:#6a5a44">في نهايةِ هذا الدرسِ أكونُ قادرًا على أن:</p>
      ${L.objectives.map((o, i) => `<div class="obj"><div class="n">${AR(i + 1)}</div><div class="t">${o.t}<br>${pageBtn(o.p, 'ص ' + AR(o.p))}</div><label><input type="checkbox" data-o="${i}" ${prog.obj[i] ? 'checked' : ''}>أتقنتُه</label></div>`).join('')}
      <div class="card"><b style="background:none">مهارةُ القراءة: الاستنتاج</b><p>أبحثُ في النصّ عن <b>أدلّة</b>، ثم أكتبُ <b>استنتاجاتي</b> اعتمادًا عليها. ستجدُ أسئلةَ «أستنتجُ» في كلّ جزءٍ من الشرح.</p></div>`;
    const objs = el.querySelectorAll('.obj');
    setScript(() => [{ t: 'أهدافُ الدرس. السؤالُ الأساسيّ: ' + L.essential, el: el.querySelector('.card.green') }, { t: 'في نهايةِ هذا الدرسِ أكونُ قادرًا على أنْ:', el: null }, ...L.objectives.map((o, i) => ({ t: o.t, el: objs[i] }))], 'استمع إلى الأهداف');
    el.querySelectorAll('[data-o]').forEach(c => c.onchange = () => { prog.obj[c.dataset.o] = c.checked; save(); });
  }

  /* ── ٣. المفاهيم والمصطلحات ── */
  function rVocab(el) {
    el.innerHTML = `<h2>📚 المفاهيمُ والمصطلحاتُ العلمية</h2>
      <p style="color:#6a5a44">المسِ البطاقةَ لترى التعريف. البطاقاتُ البرتقاليةُ هي <b>مفرداتُ الدرس</b> كما في الكتاب.</p>
      <div class="grid">${L.vocab.map((v, i) => `<div class="flip ${v.key ? 'key' : ''}" data-f="${i}">${spk(v.w + '. ' + v.d)}<div class="in"><div class="f">${v.w}<small>${v.key ? 'مفردةٌ من مفرداتِ الدرس' : 'مفهومٌ علميّ'}</small></div><div class="b">${v.d}<div class="pg">ص ${AR(v.p)}</div></div></div></div>`).join('')}</div>
      <div class="card blue"><span class="tag">🧩 لعبةُ المطابقة</span><p>المسْ مصطلحًا ثم المسْ تعريفَه الصحيح.</p><div id="mg"></div><button class="abtn sec" id="mgNew">🔄 جولةٌ جديدة</button></div>`;
    const fl = el.querySelectorAll('.flip');
    el.querySelectorAll('.flip').forEach(f => f.onclick = () => f.classList.toggle('on'));
    setScript(() => L.vocab.map((v, i) => ({ t: v.w + '. ' + v.d, el: fl[i] })), 'استمع إلى المصطلحات');
    const mg = el.querySelector('#mg');
    function round() {
      const pool = shuffle(L.vocab).slice(0, 4); const defs = shuffle(pool); let sel = null, done = 0;
      mg.innerHTML = `<div class="match"><div>${pool.map((v, i) => `<button data-w="${L.vocab.indexOf(v)}" style="display:block;width:100%;margin:6px 0;font-weight:800">${v.w}</button>`).join('')}</div><div>${defs.map(v => `<button data-d="${L.vocab.indexOf(v)}" style="display:block;width:100%;margin:6px 0">${v.d}</button>`).join('')}</div></div><div class="fb" id="mgFb"></div>`;
      mg.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; mg.querySelectorAll('[data-w]').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; });
      mg.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (!sel || b.classList.contains('ok')) return; if (sel.dataset.w === b.dataset.d) { sel.classList.remove('sel'); sel.classList.add('ok'); b.classList.add('ok'); sel = null; if (++done === 4) { award(1, 'طابقتَ المصطلحات'); const f = mg.querySelector('#mgFb'); f.className = 'fb ok'; f.textContent = '🌟 ممتاز! طابقتَ جميعَ المصطلحات.'; } } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); } });
    }
    el.querySelector('#mgNew').onclick = round; round();
  }

  /* ── ٤. الشرح ── */
  function rExplain(el) {
    const S = L.sections[sec];
    el.innerHTML = `<div class="snav">${L.sections.map((s, i) => `<button data-s="${i}" class="${i === sec ? 'on' : ''}">${AR(i + 1)}. ${s.title}</button>`).join('')}</div>
      <h2>${S.title}</h2><div>${pageBtn(S.pages[0], 'اقرأ في الكتاب ص ' + S.pages.map(AR).join('–'))}${S.model ? modelBtn(S.model) : ''}</div>
      ${S.clips.map((c, i) => `<div class="clipw"><div class="cl"><span>📖 من الكتاب — ص ${AR(c.p)}</span><span style="font-weight:600">المسِ القصاصةَ لتكبيرها 🔍</span></div><div class="clip ${c.b[2] - c.b[0] > 600 ? 'fig' : ''}" data-z="${i}" style="${crop(c.p, c.b)}"></div></div>`).join('')}
      <details class="simp"><summary>🧑‍🏫 شرحُ المعلّم المبسّط لهذا الجزء</summary>${S.body.map(p => `<p>${p}</p>`).join('')}</details>
      <div id="simw"></div><div id="widget"></div>
      <div class="card red"><span class="tag r">✔ أختبرُ نفسي</span>${S.check.map((c, i) => `<div class="qi"><div class="qq">${c.q}</div><button class="abtn sec" data-rv="k${i}">اعرضِ الإجابة</button><div class="reveal" id="k${i}">${c.a}</div></div>`).join('')}</div>
      <div style="display:flex;gap:8px">${sec > 0 ? `<button class="abtn sec" data-s="${sec - 1}">→ الجزءُ السابق</button>` : ''}${sec < L.sections.length - 1 ? `<button class="abtn" data-s="${sec + 1}">الجزءُ التالي ←</button>` : `<button class="abtn" data-next>انتقلْ إلى التقويم ←</button>`}</div>`;
    el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { sec = +b.dataset.s; rExplain(el); el.scrollTop = 0; if (bot && botL === L) bot.setSection(sec); });
    el.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => el.querySelector('#' + b.dataset.rv).classList.toggle('show'));
    const clipEls = el.querySelectorAll('.clip');
    setScript(() => S.clips.map((c, i) => ({ t: c.t, el: clipEls[i], k: `${L.id}-${S.id}-${i}` })), 'استمع إلى شرح: ' + S.title.replace('؟', ''));
    el.querySelectorAll('[data-ci]').forEach(b => b.onclick = () => playScript([{ t: S.clips[+b.dataset.ci].t, el: clipEls[+b.dataset.ci], k: `${L.id}-${S.id}-${b.dataset.ci}` }], scriptLabel));
    clipEls.forEach(c => c.onclick = () => { const k = S.clips[+c.dataset.z], [x0, y0, x1, y1] = k.b; const z = document.createElement('div'); z.className = 'clipz'; z.innerHTML = `<div style="${crop(k.p, k.b)}"></div>`; z.onclick = () => z.remove(); document.body.appendChild(z); });
    const w = el.querySelector('#widget');
    if (S.sim && SIMS[S.sim]) { try { SIMS[S.sim](el.querySelector('#simw'), { award, AR }); } catch (e) { console.warn(e); } }
    if (S.game) { (S.game.type === 'sort' ? gameSort : gameOrder)(w, S.game); }
    if (S.kind === 'tree') wTree(w); if (S.kind === 'roots') wRoots(w); if (S.kind === 'photo') wPhoto(w); if (S.kind === 'transport') wTransport(w);
  }
  function wTree(w) {
    const EX = {
      nonvasc: { t: 'النباتاتُ اللاوعائية: صغيرةُ الحجم، ليس لها نظامُ نقل، ومنها الحزازيات.', ph: [] },
      vasc: { t: 'النباتاتُ الوعائية: لها نظامُ أوعيةٍ من الأنابيبِ المجوّفةِ ينقلُ الماءَ والغذاء، ومنها الأشجار.', ph: [] },
      seed: { t: 'نباتاتٌ بذرية: تنتجُ بذورًا تحتوي على نباتٍ صغيرٍ (جنين) وغذاءٍ مختزنٍ وغلافٍ يحميها.', ph: [] },
      noseed: { t: 'نباتاتٌ لا بذرية: لا تنتجُ بذورًا، وتنتجُ أبواغًا للتكاثر، ومنها السرخسيات.', ph: [[41, [805, 1080, 1010, 1310], 'سرخسيات (ذيل الحصان)'], [41, [535, 1080, 735, 1310], 'سرخسيات (كزبرة البئر)']] },
      gymno: { t: 'لا زهرية (معرّاة البذور): لا تنبتُ لها أزهار، وبذورُها قاسيةٌ داخلَ مخاريط.', ph: [[40, [147, 1135, 352, 1352], 'صنوبر'], [40, [376, 1135, 578, 1352], 'عرعر'], [41, [115, 1022, 430, 1275], 'مخروط الصنوبر']] },
      angio: { t: 'زهرية (مغطّاة البذور): تنتجُ أزهارًا، وتحيطُ الثمرةُ ببذورِها عادة.', ph: [[40, [600, 1135, 806, 1352], 'بامية'], [40, [828, 1135, 1033, 1352], 'كوسة']] }
    };
    w.innerHTML = `<div class="card green"><span class="tag g">🌳 شجرةُ تصنيفِ النباتات — المسْ أيَّ مجموعة</span>
      <div class="tree"><button class="nd lv0" data-k="vasc">النباتات</button>
        <div class="row"><button class="nd lv1" data-k="vasc">النباتاتُ الوعائية</button><button class="nd lv1" data-k="nonvasc" style="background:#8a9a5a">النباتاتُ اللاوعائية</button></div>
        <div class="row"><button class="nd lv2" data-k="seed">نباتاتٌ بذرية</button><button class="nd lv2" data-k="noseed">نباتاتٌ لا بذرية</button></div>
        <div class="row"><button class="nd lv3" data-k="angio">زهرية (مغطّاة البذور)</button><button class="nd lv3" data-k="gymno">لا زهرية (معرّاة البذور)</button></div></div>
      <div class="reveal show" id="trInfo">المسْ مجموعةً لترى وصفَها وأمثلةً عليها من صورِ الكتاب.</div><div class="ex" id="trEx"></div></div>`;
    w.querySelectorAll('.nd').forEach(b => b.onclick = () => { w.querySelectorAll('.nd').forEach(x => x.classList.remove('on')); b.classList.add('on'); const e = EX[b.dataset.k]; w.querySelector('#trInfo').textContent = e.t; w.querySelector('#trEx').innerHTML = e.ph.map(([p, box, c]) => `<div style="width:150px"><div class="ph2" style="${crop(p, box)}"></div><div class="phcap">${c}</div></div>`).join(''); });
  }
  function wRoots(w) {
    const T = [['جذورٌ وتدية', [114, 950, 410, 1268], 'تنغرسُ عميقًا في التربة، ويتفرّعُ عن جزئِها الرئيسِ جذورٌ جانبيةٌ صغيرة.'], ['جذورٌ ليفية', [416, 950, 710, 1268], 'جذورٌ دقيقةٌ متفرّعةٌ لا تمتدُّ كثيرًا في التربة.'], ['جذورٌ هوائية', [716, 950, 1008, 1268], 'جذورٌ لا تلامسُ الأرضَ أبدًا.']];
    w.innerHTML = `<div class="card orange"><span class="tag o">🥕 أنواعُ الجذور</span><div class="grid" style="margin-top:8px">${T.map(([n, b, d]) => `<div><div class="ph2" style="${crop(43, b)}"></div><div class="phcap">${n}</div><p style="font-size:15px;line-height:1.7;margin:2px 0">${d}</p></div>`).join('')}</div></div>`;
  }
  function wPhoto(w) {
    w.innerHTML = `<div class="card green"><span class="tag g">☀️ البناءُ الضوئيّ في الورقة — حرّكْ شدّةَ الضوء</span>
      <svg viewBox="0 0 600 330" style="width:100%;max-width:620px;display:block;margin:6px auto">
        <circle cx="80" cy="60" r="38" fill="#ffd23a" id="sun"/><g id="rays">${[0, 1, 2, 3, 4].map(i => `<line x1="115" y1="${70 + i * 18}" x2="240" y2="${110 + i * 22}" stroke="#ffcf3a" stroke-width="5" stroke-dasharray="14 10"><animate attributeName="stroke-dashoffset" from="0" to="-48" dur="1s" repeatCount="indefinite"/></line>`).join('')}</g>
        <path d="M200 170 C260 70 420 60 540 160 C420 260 260 260 200 170 Z" fill="#5fb84a" stroke="#3a8a2a" stroke-width="4"/>
        <path d="M200 170 L540 160" stroke="#3a8a2a" stroke-width="4"/><path d="M120 200 L200 170" stroke="#3a8a2a" stroke-width="7"/>
        <g id="co2">${[0, 1, 2].map(i => `<circle r="9" fill="#9a9a9a"><animateMotion dur="2.4s" begin="${i * .8}s" repeatCount="indefinite" path="M${300 + i * 50} 320 L${320 + i * 40} 210"/></circle>`).join('')}</g>
        <g id="h2o">${[0, 1, 2].map(i => `<circle r="8" fill="#2f8cff"><animateMotion dur="2.2s" begin="${i * .7}s" repeatCount="indefinite" path="M120 200 L200 170 L${380 + i * 30} 163"/></circle>`).join('')}</g>
        <g id="o2">${[0, 1, 2].map(i => `<circle r="8" fill="#c8f0ff" stroke="#4ab"><animateMotion dur="2.6s" begin="${i * .9}s" repeatCount="indefinite" path="M${330 + i * 50} 200 L${360 + i * 60} 320"/></circle>`).join('')}</g>
        <g id="sug">${[0, 1].map(i => `<rect width="14" height="14" fill="#0da9a6" rx="3"><animateMotion dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite" path="M420 160 L200 172 L110 203"/></rect>`).join('')}</g>
        <text x="300" y="325" font-size="16" fill="#555" font-weight="800">ثاني أكسيد الكربون ↑</text><text x="430" y="300" font-size="16" fill="#2a8aa0" font-weight="800">الأكسجين ↓</text>
        <text x="20" y="235" font-size="16" fill="#2f6fd6" font-weight="800">ماء</text><text x="20" y="255" font-size="16" fill="#e07a10" font-weight="800">سكّر</text>
      </svg><input type="range" id="lt" min="0" max="10" value="8" style="width:100%;accent-color:#f2b51c"><div class="fb" id="ltFb"></div></div>`;
    const lt = w.querySelector('#lt'), set = () => { const v = +lt.value; w.querySelector('#sun').setAttribute('fill', v ? '#ffd23a' : '#8a8a6a'); ['rays', 'co2', 'o2', 'sug'].forEach(id => w.querySelector('#' + id).style.opacity = v ? Math.min(1, .2 + v / 8) : 0); w.querySelector('#ltFb').textContent = v ? (v < 4 ? 'ضوءٌ خافت: يقلُّ إنتاجُ السكّرِ والأكسجين.' : 'ضوءٌ كافٍ: تمتصُّ مادّةُ الكلوروفيلِ الطاقةَ وتحدثُ عمليةُ البناءِ الضوئيّ.') : 'بلا ضوءٍ لا تحدثُ عمليةُ البناءِ الضوئيّ.'; };
    lt.oninput = set; set();
  }
  function wTransport(w) {
    w.innerHTML = `<div class="card"><div class="eq"><span class="r" style="animation-delay:.1s">ثاني أكسيد الكربون</span><span class="o" style="animation-delay:.4s">+</span><span class="r" style="animation-delay:.7s">ماء</span><span class="o" style="animation-delay:1s">← ضوء ←</span><span class="p" style="animation-delay:1.4s">سكّر الجلوكوز</span><span class="o" style="animation-delay:1.7s">+</span><span class="p" style="animation-delay:2s">الأكسجين</span></div>
      <p style="text-align:center;color:#6a5a44;font-size:14px">الموادُّ المتفاعلةُ باللونِ الأزرق، والموادُّ الناتجةُ باللونِ الأخضر.</p></div>
      <div class="card blue order"><span class="tag">🔢 رتّبْ مراحلَ النقلِ في النبات — المسها بالترتيب الصحيح</span><div id="ord"></div><div class="fb" id="ordFb"></div><button class="abtn sec" id="ordR">🔄 أعدِ المحاولة</button></div>`;
    const go = () => { let k = 0; const o = w.querySelector('#ord'); o.innerHTML = shuffle(L.transportSteps.map((s, i) => [s, i])).map(([s, i]) => `<button data-i="${i}">${s}</button>`).join(''); const fb = w.querySelector('#ordFb'); fb.textContent = '';
      o.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; if (+b.dataset.i === k) { b.classList.add('ok'); b.insertAdjacentHTML('afterbegin', `<span class="k">${AR(k + 1)}</span>`); k++; if (k === 5) { fb.className = 'fb ok'; fb.textContent = '🌟 أحسنت! هذا هو ترتيبُ النقلِ في النباتات (ص ٤٦).'; } } else { b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); } }); };
    w.querySelector('#ordR').onclick = go; go();
  }

  /* ── ٥. التقويم ── */

  /* ── مستوياتُ الأسئلة: دعم / أساسي / إثراء ── */
  const LVN = [['🟢', 'دعم'], ['🔵', 'أساسي'], ['🟣', 'إثراء']];
  const getLv = () => { try { const v = +localStorage.getItem('sci-level'); return v >= 0 && v <= 2 ? v : 1; } catch (e) { return 1; } };
  const lvBar = LV => `<div class="lvbar"><span>مستوى الأسئلة:</span>${LVN.map(([i, t], k) => `<button data-lv="${k}" class="${k === LV ? 'on' : ''}">${i} ${t}</button>`).join('')}<small>${['أسئلةٌ بخيارين وتلميحات وبداياتٌ للإجابة', 'أسئلةُ الدرسِ كما هي', 'إكمالٌ بالكتابة + تحدّياتُ تفسيرٍ ومقارنة'][LV]}</small></div>`;
  const nrm = s => String(s).replace(/<[^>]+>/g, '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/^ال/, '').replace(/\s+/g, ' ').trim();
  const stripT = s => String(s).replace(/<[^>]+>/g, '');
  function mcqOpts(q, LV) { let ks = q.o.map((_, k) => k); if (LV === 0 && ks.length > 2) { const other = shuffle(ks.filter(k => k !== q.a))[0]; ks = ks.filter(k => k === q.a || k === other); } return ks.map((k, j) => `<button data-k="${k}">${'أبجد'[j]}) ${q.o[k]}</button>`).join(''); }
  const hintH = (LV, p) => LV === 0 ? `<span class="hintb" data-hint="${p}">💡 تلميح</span>` : '';
  function enrichHTML() {
    const AD = L.assist || ASSIST[L.id] || {}; const out = [];
    L.sections.forEach(S => { const e = (AD.sections || {})[S.id]; if (e && e.why && out.length < 3) { const tt = stripT(S.title).replace(/^[\d٠-٩.\-–\s]+/, ''); out.push({ q: /[؟?]$/.test(tt) ? 'أجبْ بلغتِك العلميّة مع التفسيرِ والدليل: <b>' + tt + '</b>' : 'فسِّرْ بلغتِك العلميّة فكرةَ «<b>' + tt + '</b>»: لماذا تحدث؟ وما الدليلُ عليها؟', a: e.why }); } });
    (AD.pairs || []).slice(0, 2).forEach(p => out.push({ q: 'قارِنْ بينَ <b>' + p[0] + '</b> و<b>' + p[1] + '</b>: أوجهُ الشبهِ والاختلاف.', a: p[2] }));
    if (!out.length) return '';
    return `<div class="card enrich"><span class="tag">🚀 تحدّي الإثراء — مهاراتُ التفكيرِ العليا</span>${out.map((x, i) => `<div class="qi"><div class="qq">${x.q}</div><textarea style="width:100%;min-height:64px;border-radius:10px;border:1px solid #cfdde3;padding:8px;font:inherit;margin-top:6px" placeholder="أكتبُ تفسيري…"></textarea><button class="abtn sec" data-rv="en${i}">قارنْ بالإجابةِ النموذجية</button><div class="reveal" id="en${i}">${x.a}</div></div>`).join('')}</div>`;
  }
  function wireLv(el) {
    el.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => { try { localStorage.setItem('sci-level', b.dataset.lv); } catch (e) {} rQuiz(el); });
    el.querySelectorAll('[data-hint]').forEach(h => h.onclick = () => { h.innerHTML = '💡 ابحثْ عن الإجابةِ في <button class="pbtn" data-go="' + h.dataset.hint + '">ص ' + AR(h.dataset.hint) + '</button>'; });
  }
  function rQuiz(el) {
    const LV = getLv();
    const Q = L.quiz; const ORD = L.order || (L.transportSteps ? { title: 'رتّبْ مراحلَ النقلِ في النبات', steps: L.transportSteps } : null);
    const total = Q.mcq.length + Q.tf.length + Q.fill.items.length + (ORD ? 1 : 0); let score = 0, answered = 0;
    el.innerHTML = `${lvBar(LV)}<div class="score"><div><div style="font-size:13px">درجتي</div><div class="big" id="sc">٠ / ${AR(total)}</div></div><div class="bar"><i id="scb" style="width:0"></i></div><button class="abtn sec" id="qReset" style="margin:0">🔄 إعادة</button></div>
      <h3>أولًا: اخترِ الإجابةَ الصحيحة</h3><div id="qM"></div>
      <h3>ثانيًا: صوابٌ أم خطأ؟</h3><div id="qT"></div>
      <h3>ثالثًا: أكملِ الفراغ — المسِ الفراغَ ثم المسِ الكلمةَ المناسبة</h3><div class="bank" id="qBank"></div><div id="qF"></div>
      ${ORD ? `<h3>رابعًا: ${ORD.title}</h3><div class="order" id="qO"></div><div class="fb" id="qOfb"></div>` : ''}
      <h3>${ORD ? 'خامسًا' : 'رابعًا'}: أفكّرُ، وأتحدّثُ، وأكتبُ</h3><div id="qX"></div>
      <div class="card green" id="qEnd"></div>
      <div class="card"><span class="tag g">🖼 ملخّصٌ مصوّر</span>${L.summary.map(s => `<p>• ${s.t}</p>`).join('')}${pageBtn(L.to, 'مراجعةُ الدرسِ ص ' + AR(L.to))}</div>${exitHTML()}`;
    const upd = () => { el.querySelector('#sc').textContent = AR(score) + ' / ' + AR(total); el.querySelector('#scb').style.width = (score / total * 100) + '%'; const end = el.querySelector('#qEnd'); end.innerHTML = answered >= total ? `<b style="background:none;font-size:20px">${score >= total * .9 ? '🌟 ممتاز!' : score >= total * .7 ? '👍 أحسنت!' : '💪 راجعِ الدرسَ وحاولْ مرةً أخرى'}</b><p>أجبتَ إجابةً صحيحةً عن ${AR(score)} من ${AR(total)}.</p>` : `<p style="margin:0">أجبتَ عن ${AR(answered)} من ${AR(total)} سؤالًا.</p>`; if (answered >= total) { prog.best = Math.max(prog.best || 0, score); save(); } };
    const mark = ok => { answered++; if (ok) { score++; award(1); } upd(); };
    const bookTag = q => q.book ? '<span class="bk">من الكتاب</span>' : '';
    el.querySelector('#qM').innerHTML = Q.mcq.map((q, i) => `<div class="qi" data-m="${i}"><div class="qq">${AR(i + 1)}. ${bookTag(q)}${q.q}${spk(q.q + ' ' + q.o.map((o, k) => 'أ ب ج د'.split(' ')[k] + '، ' + o + '.').join(' '))}</div><div class="opts">${mcqOpts(q, LV)}</div>${hintH(LV, q.p)}<div class="fb"></div></div>`).join('');
    el.querySelectorAll('[data-m]').forEach(d => { const q = Q.mcq[+d.dataset.m]; d.querySelectorAll('button').forEach(b => b.onclick = () => { if (d.dataset.done) return; d.dataset.done = 1; const ok = +b.dataset.k === q.a; b.classList.add(ok ? 'ok' : 'no'); d.querySelector('[data-k="' + q.a + '"]').classList.add('ok'); const fb = d.querySelector('.fb'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = (ok ? '✓ إجابةٌ صحيحة' : '✗ الإجابةُ الصحيحة: ' + q.o[q.a]) + ` <button class="pbtn" data-go="${q.p}">ص ${AR(q.p)}</button>`; mark(ok); }); });
    el.querySelector('#qT').innerHTML = Q.tf.map((q, i) => `<div class="qi" data-t="${i}"><div class="qq">${AR(i + 1)}. ${q.q}${spk(q.q + ' صوابٌ أم خطأ؟')}</div><div class="opts"><button data-v="1">✓ صواب</button><button data-v="0">✗ خطأ</button></div>${hintH(LV, q.p)}<div class="fb"></div></div>`).join('');
    el.querySelectorAll('[data-t]').forEach(d => { const q = Q.tf[+d.dataset.t]; d.querySelectorAll('button').forEach(b => b.onclick = () => { if (d.dataset.done) return; d.dataset.done = 1; const ok = (b.dataset.v === '1') === q.a; b.classList.add(ok ? 'ok' : 'no'); const fb = d.querySelector('.fb'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = (ok ? '✓ أحسنت' : '✗ العبارةُ ' + (q.a ? 'صحيحة' : 'خاطئة')) + (q.fix ? `<br>التصحيح: ${q.fix}` : '') + ` <button class="pbtn" data-go="${q.p}">ص ${AR(q.p)}</button>`; mark(ok); }); });
    let selBlank = null;
    el.querySelector('#qBank').innerHTML = LV === 2 ? '<span style="font-weight:800;color:#3c5563">✍️ مستوى الإثراء: اكتبِ الكلمةَ المناسبةَ بنفسِك ثم اضغطْ «تحقّقْ».</span>' : shuffle(Q.fill.bank).map(w => `<button data-w="${w}">${w}</button>`).join('');
    el.querySelector('#qF').innerHTML = Q.fill.items.map((q, i) => `<div class="qi"><div class="qq">${AR(i + 1)}. ${bookTag(q)}${q.q.replace('____', LV === 2 ? `<input class="fin" data-fi="${i}" placeholder="…"><button class="pbtn" data-fc="${i}">تحقّقْ</button>` : `<span class="blank" data-b="${i}">${LV === 0 ? stripT(q.a).trim()[0] + '…؟' : '؟'}</span>`)}${spk(q.q.replace('____', 'فراغ'))}</div></div>`).join('');
    el.querySelectorAll('.blank').forEach(b => b.onclick = () => { if (b.classList.contains('ok') || b.classList.contains('no')) return; el.querySelectorAll('.blank').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); selBlank = b; });
    el.querySelectorAll('#qBank button').forEach(w => w.onclick = () => { if (!selBlank) { const first = [...el.querySelectorAll('.blank')].find(x => !x.classList.contains('ok') && !x.classList.contains('no')); if (!first) return; selBlank = first; } const q = Q.fill.items[+selBlank.dataset.b]; const ok = w.dataset.w === q.a; selBlank.textContent = ok ? q.a : w.dataset.w + ' ✗ (' + q.a + ')'; selBlank.classList.remove('sel'); selBlank.classList.add(ok ? 'ok' : 'no'); if (ok) w.classList.add('used'); selBlank = null; mark(ok); });
    // الترتيب
    let k = 0, bad = false; const O = el.querySelector('#qO') || document.createElement('div'); const NS = ORD ? ORD.steps.length : 0;
    if (ORD) O.innerHTML = shuffle(ORD.steps.map((s, i) => [s, i])).map(([s, i]) => `<button data-i="${i}">${s}</button>`).join('');
    O.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.classList.contains('ok') || k >= NS) return; if (+b.dataset.i === k) { b.classList.add('ok'); b.insertAdjacentHTML('afterbegin', `<span class="k">${AR(k + 1)}</span>`); k++; if (k === NS) { const fb = el.querySelector('#qOfb'); fb.className = 'fb ' + (bad ? 'no' : 'ok'); fb.textContent = bad ? 'أكملتَ الترتيبَ بعد محاولاتٍ خاطئة.' : '✓ ترتيبٌ صحيحٌ من المحاولةِ الأولى!'; mark(!bad); } } else { bad = true; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); } });
    el.querySelector('#qX').innerHTML = Q.open.map((q, i) => `<div class="qi"><div class="qq">${q.q}</div><textarea style="width:100%;min-height:70px;border-radius:10px;border:1px solid #d9c9a8;padding:8px;font:inherit;margin-top:6px" placeholder="${LV === 0 ? 'ابدأْ هكذا: ' + stripT(q.a).split(/\s+/).slice(0, 4).join(' ') + ' …' : 'أكتبُ إجابتي هنا…'}"></textarea><button class="abtn sec" data-rv="o${i}">قارنْ بالإجابةِ النموذجية</button><div class="reveal" id="o${i}">${q.a}</div></div>`).join('');
    el.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => el.querySelector('#' + b.dataset.rv).classList.toggle('show'));
    el.querySelectorAll('[data-fc]').forEach(b => b.onclick = () => { const i = +b.dataset.fc, inp = el.querySelector(`[data-fi="${i}"]`); if (inp.disabled || !inp.value.trim()) return; const q = Q.fill.items[i], ok = nrm(inp.value) === nrm(q.a); inp.disabled = true; inp.classList.add(ok ? 'ok' : 'no'); if (!ok) inp.value += ' ✗ (' + stripT(q.a) + ')'; b.remove(); mark(ok); });
    el.querySelectorAll('[data-fi]').forEach(inp => inp.onkeydown = e => { if (e.key === 'Enter') { const b = el.querySelector(`[data-fc="${inp.dataset.fi}"]`); b && b.click(); } });
    { const xq = el.querySelector('#qX'); if (LV === 2) xq.insertAdjacentHTML('afterend', enrichHTML()); }
    el.querySelectorAll('[data-rv^="en"]').forEach(b => b.onclick = () => el.querySelector('#' + b.dataset.rv).classList.toggle('show'));
    el.querySelector('#qReset').onclick = () => rQuiz(el);
    setScript(() => [...el.querySelectorAll('#qM .qi')].map((d, i) => ({ t: 'السؤالُ ' + (i + 1) + '. ' + Q.mcq[i].q + ' ' + Q.mcq[i].o.join('، أو ') + '؟', el: d })), 'استمع إلى أسئلة الاختيار');
    upd(); wireExit(el); wireLv(el);
  }
  /* ── بطاقة الخروج ── */
  function exitHTML() {
    const EXQ = exitQs(); if (!L.active || !EXQ.length) return '';
    return `<div class="card exit" id="exitT"><span class="tag">🎫 بطاقةُ الخروج</span><p style="margin:4px 0">أجبْ قبلَ أن تغادرَ الدرس:</p>
      ${EXQ.map((q, i) => `<div class="qi" data-x2="${i}"><div class="qq">${AR(i + 1)}. ${q.q}</div><div class="opts">${q.o.map((o, k) => `<button data-k="${k}">${o}</button>`).join('')}</div><div class="fb"></div></div>`).join('')}
      <div style="font-weight:800;margin-top:8px">كيف أشعرُ بعدَ الدرس؟</div>
      <div class="lights">${[['🟢', 'فهمتُ الدرس'], ['🟡', 'فهمتُ أغلبَه'], ['🔴', 'أحتاجُ مساعدة']].map(([i, t], k) => `<button data-lt="${k}" class="${prog.light === k ? 'on' : ''}"><i>${i}</i>${t}</button>`).join('')}</div>
      <div class="tally">${['🟢', '🟡', '🔴'].map((i, k) => `<button data-ty="${k}" title="عُدَّ أيديَ الطلاب">${i} <span>٠</span></button>`).join('')}<button data-ty="r" title="تصفير">↺</button></div>
      <div id="exitDone"></div></div>`;
  }
  function exitQs() {
    if (L.exit) return L.exit;
    if (L._exit) return L._exit;
    const V = L.vocab.filter(v => v.d && v.w); const out = [];
    const st = s => String(s).replace(/<[^>]+>/g, '');
    if (V.length >= 3) for (const v of shuffle(V).slice(0, 3)) { const o = shuffle([v.w, ...shuffle(V.filter(x => x !== v)).slice(0, 2).map(x => x.w)]); out.push({ q: 'ما المصطلحُ الذي يعني: «' + st(v.d) + '»؟', o, a: o.indexOf(v.w), why: 'الإجابةُ: ' + v.w + ' (ص ' + AR(v.p) + ').' }); }
    const Q = L.quiz || {};
    for (const m of shuffle(Q.mcq || [])) { if (out.length >= 3) break; out.push({ q: st(m.q), o: m.o.map(st), a: m.a, why: 'راجعْ ص ' + AR(m.p) + '.' }); }
    for (const t of shuffle(Q.tf || [])) { if (out.length >= 3) break; out.push({ q: 'صوابٌ أم خطأ: ' + st(t.q), o: ['صواب', 'خطأ'], a: t.a ? 0 : 1, why: (t.fix ? st(t.fix) + ' ' : '') + '(ص ' + AR(t.p) + ')' }); }
    return (L._exit = out.slice(0, 3));
  }
  function wireExit(el) {
    const ex = el.querySelector('#exitT'); if (!ex) return; let got = 0;
    const done = () => { if (got < exitQs().length || prog.light === undefined) return; const d = ex.querySelector('#exitDone'); const tot = prog.stars || 0;
      d.innerHTML = `<div class="badge"><div class="m">${tot >= 25 ? '🏅' : tot >= 12 ? '🥈' : '🎖️'}</div><b style="background:none;font-size:20px">${tot >= 25 ? 'وسامُ العالِمِ الصغير' : tot >= 12 ? 'وسامُ المستكشفِ النشيط' : 'وسامُ المشاركة'}</b><p style="margin:4px 0">جمعتَ ${AR(tot)} نجمةً في هذا الدرس${prog.light === 2 ? ' — اطلبْ من معلّمِك أن يساعدَك في ما لم تفهمْه 🤝' : ''}.</p></div>`; };
    ex.querySelectorAll('[data-x2]').forEach(d => { const q = exitQs()[+d.dataset.x2]; d.querySelectorAll('button').forEach(b => b.onclick = () => { if (d.dataset.done) return; d.dataset.done = 1; const r = +b.dataset.k === q.a; b.classList.add(r ? 'ok' : 'no'); d.querySelectorAll('button')[q.a].classList.add('ok'); const fb = d.querySelector('.fb'); fb.className = 'fb ' + (r ? 'ok' : 'no'); fb.textContent = r ? '✓ أحسنت' : '✗ ' + (q.why || 'الإجابةُ الصحيحة: ' + q.o[q.a]); got++; if (r) award(1); done(); }); });
    ex.querySelectorAll('[data-lt]').forEach(b => b.onclick = () => { prog.light = +b.dataset.lt; save(); ex.querySelectorAll('[data-lt]').forEach(x => x.classList.toggle('on', x === b)); done(); });
    const cnt = [0, 0, 0]; ex.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => { if (b.dataset.ty === 'r') cnt.fill(0); else cnt[+b.dataset.ty]++; ex.querySelectorAll('[data-ty] span').forEach((sp, i) => sp.textContent = AR(cnt[i])); });
  }

  function update(cur) {
    const l = LESSONS.find(x => cur >= x.from && cur <= x.to);
    chip.style.display = l && !root.classList.contains('open') ? 'block' : 'none';
    if (l) { chip.textContent = '▶ ابدأ الدرسَ التفاعليّ: ' + l.title.split(': ')[1]; chip.onclick = () => open(l); }
  }
  return { open, close, update, isOpen: () => root.classList.contains('open') };
}
