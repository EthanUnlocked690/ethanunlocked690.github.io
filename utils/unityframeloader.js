/**
 * unity-frame.js
 * ──────────────
 * Drop this anywhere in your repo. Each Unity game's index.html just does:
 *
 *   <script>
 *     window.UNITY_BUILD      = '2410211';
 *     window.UNITY_TITLE      = 'My Game';
 *     window.UNITY_WASM_PARTS = 1;
 *   </script>
 *   <script src="../../unity-frame.js"></script>
 *
 * IMPORTANT: use window.UNITY_BUILD, NOT const — const doesn't attach to window.
 */

(function () {
  /* ── Config ─────────────────────────────────────────────── */
  const BUILD       = window.UNITY_BUILD;
  const TITLE       = window.UNITY_TITLE       || 'Loading game...';
  const WASM_PARTS  = window.UNITY_WASM_PARTS  || 1;

  if (!BUILD) {
    document.body.innerHTML = '<p style="color:#f87171;font-family:monospace;padding:20px">unity-frame.js: UNITY_BUILD is not set.</p>';
    return;
  }

  /* ── Fake Firebase ──────────────────────────────────────────
     Unity's Firebase plugin calls bare globals like firebaseLogEvent,
     firebaseSetUserId, etc. Rather than listing every possible name,
     we use a Proxy on window that returns a no-op for any unknown
     function call — so nothing ever throws ReferenceError.
  ─────────────────────────────────────────────────────────── */
  window.firebase = {
    initializeApp: () => { console.log('[Unity] Fake Firebase init'); return window.firebase; },
    analytics: () => ({
      logEvent:        (n, p) => console.log('[Unity] logEvent:', n, p),
      setCurrentScreen:(s)    => console.log('[Unity] screen:', s),
      setUserId:       (id)   => console.log('[Unity] userId:', id),
    }),
    app:  () => window.firebase,
    auth: () => ({ onAuthStateChanged: () => {}, signInAnonymously: () => Promise.resolve() }),
  };

  // Bare globals Unity might call (e.g. firebaseLogEvent, firebaseSetUserId...)
  // Intercept ALL missing globals with a Proxy so no name ever throws.
  try {
    window = new Proxy(window, {
      get(target, prop) {
        const val = target[prop];
        if (val !== undefined) return typeof val === 'function' ? val.bind(target) : val;
        // Unknown property — if it looks like a firebase function, return a no-op
        if (typeof prop === 'string' && prop.startsWith('firebase')) {
          console.log('[Unity] Intercepted missing global:', prop);
          return (...args) => console.log('[Unity]', prop, ...args);
        }
        return val;
      }
    });
  } catch(e) {
    // window proxy not supported — fall back to manually stubbing known names
    [
      'firebaseLogEvent','firebaseSetCurrentScreen','firebaseSetUserId',
      'firebaseSetUserProperty','firebaseGetToken','firebaseGetAnalyticsInstanceId',
    ].forEach(fn => { if (!window[fn]) window[fn] = (...a) => console.log('[Unity]', fn, ...a); });
  }

  /* ── Inject <head> assets ───────────────────────────────── */
  document.title = TITLE + ' — TheUnlockedWeb';

  const headLinks = [
    ['preconnect', 'https://fonts.googleapis.com'],
    ['stylesheet', 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap'],
    ['stylesheet', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'],
    ['stylesheet', _rel('../../style.css')],
  ];

  headLinks.forEach(([rel, href]) => {
    const l = document.createElement('link');
    l.rel = rel; l.href = href;
    document.head.appendChild(l);
  });

  /* ── Inject styles ──────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{overflow:hidden}

    .uf-shell{
      position:fixed;inset:0;z-index:2;
      display:flex;flex-direction:column;
      background:#000;
    }
    .uf-wrap{
      flex:1;position:relative;
      display:flex;align-items:center;justify-content:center;
      background:#06060d;width:100%;height:100%;
    }
    #uf-canvas{
      display:block;width:100%;height:100%;background:#000;
    }

    /* Loading */
    #uf-loading{
      position:absolute;inset:0;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      gap:20px;background:#06060d;z-index:10;
      transition:opacity .4s ease;
    }
    #uf-loading.hidden{opacity:0;pointer-events:none;}

    .uf-icon{
      width:64px;height:64px;border-radius:16px;
      background:var(--gold-gl,rgba(245,158,11,.13));
      color:var(--gold,#f59e0b);
      display:flex;align-items:center;justify-content:center;
      font-size:1.8rem;
    }
    .uf-loading-title{
      font-family:'Syne',sans-serif;font-weight:800;
      font-size:1.4rem;color:var(--text,#eeedf8);
      text-align:center;padding:0 20px;
    }
    .uf-track{
      width:240px;height:4px;
      background:var(--border,rgba(255,255,255,.07));
      border-radius:2px;overflow:hidden;
    }
    .uf-fill{
      height:100%;width:0%;
      background:linear-gradient(90deg,var(--gold,#f59e0b),var(--gold-soft,#fde68a));
      border-radius:2px;transition:width .2s ease;
    }
    .uf-pct{
      font-size:.75rem;font-weight:600;
      color:var(--muted,#44445a);letter-spacing:1px;
      font-family:'Manrope',sans-serif;
    }

    /* Error */
    #uf-error{
      position:absolute;inset:0;
      display:none;flex-direction:column;
      align-items:center;justify-content:center;
      gap:14px;background:#06060d;z-index:11;
      text-align:center;padding:40px;
    }
    #uf-error i{font-size:2.5rem;color:#f87171;}
    #uf-error h2{
      font-family:'Syne',sans-serif;font-size:1.1rem;
      font-weight:700;color:var(--text,#eeedf8);
    }
    #uf-error p{
      font-size:.82rem;color:var(--sub,#8888b0);
      max-width:380px;line-height:1.6;
      font-family:'Manrope',sans-serif;
    }
  `;
  document.head.appendChild(style);

  /* ── Inject DOM ─────────────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="grain" aria-hidden="true"></div>
    <div class="aurora" aria-hidden="true">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="uf-shell">
      <div class="uf-wrap">

        <div id="uf-loading">
          <div class="uf-icon"><i class="fa-solid fa-gamepad"></i></div>
          <div class="uf-loading-title">${TITLE}</div>
          <div class="uf-track"><div class="uf-fill" id="uf-fill"></div></div>
          <div class="uf-pct" id="uf-pct">0%</div>
        </div>

        <div id="uf-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h2>Couldn't load game</h2>
          <p id="uf-errmsg">An error occurred loading the game files.</p>
        </div>

        <canvas id="uf-canvas" tabindex="-1"></canvas>

      </div>
    </div>
  `);

  /* ── References ─────────────────────────────────────────── */
  const canvas   = document.getElementById('uf-canvas');
  const loading  = document.getElementById('uf-loading');
  const errScr   = document.getElementById('uf-error');
  const errMsg   = document.getElementById('uf-errmsg');
  const fill     = document.getElementById('uf-fill');
  const pct      = document.getElementById('uf-pct');

  /* ── Helpers ────────────────────────────────────────────── */
  function setProgress(p) {
    const v = Math.round(p * 100);
    fill.style.width = v + '%';
    pct.textContent  = v + '%';
  }

  function showError(msg) {
    loading.classList.add('hidden');
    errScr.style.display = 'flex';
    errMsg.textContent   = msg;
    console.error('[unity-frame]', msg);
  }

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    canvas.style.width  = wrap.clientWidth  + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ── Wasm loader (handles single file or split parts) ───── */
  async function getWasmUrl() {
    if (WASM_PARTS === 1) {
      // Single file — just return the path directly
      return BUILD + '.wasm.unityweb';
    }

    // Multiple split parts — fetch & merge
    setProgress(0.05);
    const parts = Array.from({ length: WASM_PARTS }, (_, i) =>
      BUILD + '.wasm.unityweb.part' + (i + 1)
    );

    try {
      const blobs = await Promise.all(parts.map(url =>
        fetch(url).then(r => {
          if (!r.ok) throw new Error(`Failed to fetch ${url} (HTTP ${r.status})`);
          return r.blob();
        })
      ));
      setProgress(0.2);
      return URL.createObjectURL(new Blob(blobs, { type: 'application/wasm' }));
    } catch (e) {
      showError('Failed to assemble wasm parts: ' + e.message);
      return null;
    }
  }

  /* ── Load loader.js then launch ─────────────────────────── */
  async function init() {
    // Dynamically load the game's loader.js
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src     = BUILD + '.loader.js';
      s.onload  = resolve;
      s.onerror = () => reject(new Error(`Could not load ${BUILD}.loader.js`));
      document.body.appendChild(s);
    }).catch(e => { showError(e.message); throw e; });

    const wasmUrl = await getWasmUrl();
    if (!wasmUrl) return;

    const progressOffset = WASM_PARTS > 1 ? 0.2 : 0;

    createUnityInstance(canvas, {
      dataUrl:            BUILD + '.data.unityweb',
      frameworkUrl:       BUILD + '.framework.js.unityweb',
      codeUrl:            wasmUrl,
      streamingAssetsUrl: 'StreamingAssets',
      companyName:        'EthanUnlocked',
      productName:        TITLE,
      productVersion:     '1.0',
    }, (progress) => {
      setProgress(progressOffset + progress * (1 - progressOffset));
    }).then((instance) => {
      window.unityInstance = instance;
      loading.classList.add('hidden');
    }).catch((err) => {
      showError(typeof err === 'string' ? err : (err?.message || 'Failed to start the game.'));
    });
  }

  init();

  /* ── Utility: resolve relative path from current script ─── */
  function _rel(path) {
    const scripts = document.querySelectorAll('script[src]');
    const me = [...scripts].find(s => s.src.includes('unity-frame.js'));
    if (!me) return path;
    return new URL(path, me.src).href;
  }
})();