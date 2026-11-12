/* Música de Natal em loop, contínua entre as páginas do site.
   - Navegadores bloqueiam som automático: ela começa no primeiro clique/toque do visitante.
   - Lembra se o visitante silenciou e retoma de onde parou ao trocar de página. */
(function () {
  var SRC = 'audio/musica-natal.mp3';
  var K_ON = 'pe-musica-ligada', K_T = 'pe-musica-tempo';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var audio = new Audio(SRC);
  audio.loop = true;
  audio.volume = 0.35;
  audio.preload = 'auto';

  var queroTocar = store.get(K_ON) !== '0'; // só deixa de tocar se o visitante silenciou
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-musica';
  btn.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9999;width:48px;height:48px;' +
    'border-radius:50%;border:2px solid #fff;background:#c0392b;color:#fff;font-size:22px;' +
    'cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35);line-height:1;padding:0';

  function atualizaBotao() {
    var tocando = !audio.paused;
    btn.textContent = tocando ? '🔔' : '🔕';
    btn.setAttribute('aria-pressed', String(tocando));
    btn.setAttribute('aria-label', tocando ? 'Pausar música de Natal' : 'Tocar música de Natal');
    btn.title = btn.getAttribute('aria-label');
  }

  function tocar() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* bloqueado: espera uma interação */ });
  }

  function aguardaInteracao() {
    var ev = ['pointerdown', 'keydown', 'touchstart'];
    function liga() {
      ev.forEach(function (e) { document.removeEventListener(e, liga, true); });
      if (queroTocar && audio.paused) tocar();
    }
    ev.forEach(function (e) { document.addEventListener(e, liga, true); });
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (audio.paused) { queroTocar = true; store.set(K_ON, '1'); tocar(); }
    else { queroTocar = false; store.set(K_ON, '0'); audio.pause(); }
  });

  audio.addEventListener('play', atualizaBotao);
  audio.addEventListener('pause', atualizaBotao);

  // retoma de onde a página anterior parou
  var t = parseFloat(store.get(K_T));
  audio.addEventListener('loadedmetadata', function () {
    if (!isNaN(t) && t > 0 && t < audio.duration) audio.currentTime = t;
  });

  var ultimo = 0;
  audio.addEventListener('timeupdate', function () {
    var agora = Date.now();
    if (agora - ultimo > 1000) { ultimo = agora; store.set(K_T, String(audio.currentTime)); }
  });
  window.addEventListener('pagehide', function () { store.set(K_T, String(audio.currentTime)); });

  // pausa se a aba ficar em segundo plano e volta ao retornar
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (!audio.paused) { audio.dataset.auto = '1'; audio.pause(); } }
    else if (audio.dataset.auto === '1') { audio.dataset.auto = ''; if (queroTocar) tocar(); }
  });

  function iniciar() {
    document.body.appendChild(btn);
    atualizaBotao();
    if (queroTocar) { tocar(); aguardaInteracao(); }
  }
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
