// تجهيز الكتاب للعمل دون إنترنت (حاسوب – أندرويد – iOS)
(function () {
  if (window.__IMG || location.protocol === 'file:' || !('serviceWorker' in navigator) || !('caches' in window)) return;
  const CACHE = 'sci9-v1';
  const box = document.createElement('div');
  box.id = 'offBox';
  box.style.cssText = 'position:fixed;left:12px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:9999;background:#1f6b52;color:#fff;font:600 13px Tajawal,sans-serif;padding:8px 12px;border-radius:12px;box-shadow:0 4px 14px #0005;direction:rtl;display:none;max-width:260px;cursor:pointer';
  const show = (t, hide) => { box.textContent = t; box.style.display = 'block'; if (hide) setTimeout(() => { box.style.display = 'none'; }, hide); };
  box.onclick = () => { box.style.display = 'none'; };
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  if (document.body) document.body.appendChild(box);
  let reg;
  try { reg = navigator.serviceWorker.register('sw.js'); } catch (e) { return; }
  reg.then(async () => {
    try {
      const list = await (await fetch('precache.json', { cache: 'no-store' })).json();
      const c = await caches.open(CACHE);
      const have = new Set((await c.keys()).map(r => new URL(r.url).pathname));
      const base = new URL('./', location.href);
      const todo = list.filter(u => !have.has(new URL(u, base).pathname));
      if (!todo.length) { if (!sessionStorage.getItem('offOk')) { show('✓ الكتابُ جاهزٌ للعملِ دونَ إنترنت', 3500); try { sessionStorage.setItem('offOk', 1); } catch (e) {} } return; }
      let done = 0, fail = 0; const N = todo.length;
      show(`⬇️ تجهيزُ الكتابِ للعملِ دونَ إنترنت… ٠٪`);
      const q = todo.slice();
      const worker = async () => { while (q.length) { const u = q.shift(); try { const r = await fetch(u, { cache: 'reload' }); if (r.ok) await c.put(u, r); else fail++; } catch (e) { fail++; } done++; show(`⬇️ تجهيزُ الكتابِ للعملِ دونَ إنترنت… ${Math.round(done / N * 100).toLocaleString('ar-EG')}٪`); } };
      await Promise.all([worker(), worker(), worker(), worker()]);
      show(fail ? '⚠️ لم يكتملِ التجهيز؛ افتحِ الكتابَ مرّةً أخرى وأنتَ متّصلٌ بالإنترنت' : '✓ اكتملَ التجهيز: يعملُ الكتابُ الآنَ دونَ إنترنت', fail ? 0 : 5000);
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    } catch (e) {}
  }).catch(() => {});
})();
