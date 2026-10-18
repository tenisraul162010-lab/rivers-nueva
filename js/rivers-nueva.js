// Diseños y reformas River's — versión nueva
(function () {
  // Escalonado de las fotos de la portada
  document.querySelectorAll('.hero .col').forEach(function (col, c) {
    col.querySelectorAll('.frame').forEach(function (f, r) { f.style.setProperty('--i', c + r * 2); });
  });

  // Fotos de las tiras, filas y campos también entran al hacer scroll
  document.querySelectorAll('.strip img, .rows dl > div, .field li, .form > *, .run, .legal > *, .legal li, .bar-name, .bar-links > *').forEach(function (el) { el.classList.add('reveal'); });

  // Entradas: cada pieza de la sección, con 70 ms entre una y otra
  document.querySelectorAll('section, .strip, form, article').forEach(function (sec) {
    sec.querySelectorAll('.reveal').forEach(function (el, i) { el.style.setProperty('--d', (i * 70) + 'ms'); });
  });
  var targets = document.querySelectorAll('.reveal');
  var shutters = document.querySelectorAll('.shutter');
  // Con 'reducir movimiento' se observa igual: el CSS deja solo el fundido, sin desplazamiento
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    // La persiana empieza un poco antes de que la foto entre en pantalla
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 30% 0px' });
    shutters.forEach(function (el) { io2.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
    shutters.forEach(function (el) { el.classList.add('in'); });
  }

  // Baldosas: cada una muestra su trozo de la misma foto, en cualquier ancho
  var board = document.querySelector('.board');
  function cutBoard() {
    if (!board) return;
    var w = board.offsetWidth, h = board.offsetHeight;
    board.querySelectorAll('.ph').forEach(function (t) {
      if (!t.offsetParent) return;
      t.style.backgroundSize = w + 'px ' + h + 'px';
      t.style.backgroundPosition = (-t.offsetLeft) + 'px ' + (-t.offsetTop) + 'px';
    });
  }
  if (board) {
    board.style.position = 'relative';
    cutBoard();
    window.addEventListener('resize', cutBoard);
  }

  // Servicios: vista previa al lado de la fila
  var preview = document.querySelector('.ledger-preview');
  var work = document.querySelector('.work');
  document.querySelectorAll('.ledger-rows a').forEach(function (a) {
    function show() {
      if (!preview || getComputedStyle(preview).display === 'none') return;
      if (preview.getAttribute('src') !== a.dataset.img) {
        preview.classList.add('swap');
        preview.src = a.dataset.img;
        requestAnimationFrame(function () { requestAnimationFrame(function () { preview.classList.remove('swap'); }); });
      }
      preview.hidden = false;
      preview.style.top = (a.getBoundingClientRect().top - work.getBoundingClientRect().top) + 'px';
      preview.classList.add('on');
    }
    function hide() { if (preview) preview.classList.remove('on'); }
    a.addEventListener('mouseenter', show);
    a.addEventListener('focus', show);
    a.addEventListener('mouseleave', hide);
    a.addEventListener('blur', hide);
  });

  // Hoja de obras: filtro y descripción de la hilada
  var note = document.querySelector('.sheet-note');
  var defaultNote = note ? note.textContent : '';
  var runs = document.querySelectorAll('.run');
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filters button').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      var f = b.dataset.f;
      runs.forEach(function (r) { r.hidden = !(f === 'todo' || r.dataset.cat === f); });
      if (note) note.textContent = f === 'todo' ? defaultNote : document.querySelector('.run[data-cat="' + f + '"]').dataset.desc;
    });
  });
  runs.forEach(function (r) {
    r.addEventListener('mouseenter', function () { if (note) note.textContent = r.dataset.desc; });
  });
  var runsBox = document.querySelector('.runs');
  if (runsBox) runsBox.addEventListener('mouseleave', function () {
    var active = document.querySelector('.filters button[aria-pressed="true"]');
    if (note) note.textContent = active.dataset.f === 'todo' ? defaultNote : document.querySelector('.run[data-cat="' + active.dataset.f + '"]').dataset.desc;
  });

  // Visor: al tocar una foto de las hiladas se abre grande
  // También los ladrillos del muro de la portada (sin repetir la misma foto)
  var seen = {};
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.run img, .wall .brick img')).filter(function (im) {
    var k = im.getAttribute('src').replace('-800', ''); if (seen[k]) return im.closest('.run'); seen[k] = 1; return true;
  });
  var wallImgs = Array.prototype.slice.call(document.querySelectorAll('.wall .brick img'));
  if (imgs.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'viewer';
    dlg.setAttribute('aria-label', 'Foto ampliada');
    dlg.innerHTML = '<div class="viewer-top"><button type="button" class="x" aria-label="Cerrar">×</button></div>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="prev" aria-label="Foto anterior">‹</button><button type="button" class="next" aria-label="Foto siguiente">›</button>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), cur = 0;
    function visible() { return imgs.filter(function (im) { var r = im.closest('.run'); return !r || !r.hidden; }); }
    function show(im) {
      var list = visible(); cur = list.indexOf(im);
      if (cur < 0) { var k = im.getAttribute('src'); im = list.filter(function (x) { return x.getAttribute('src') === k; })[0] || im; cur = list.indexOf(im); }
      var label = im.alt || im.dataset.alt || '';
      big.src = im.getAttribute('src').replace('-800.jpg', '.jpg'); big.alt = label; cap.textContent = label;
    }
    function step(d) { var list = visible(); show(list[(cur + d + list.length) % list.length]); }
    wallImgs.forEach(function (im) { im.addEventListener('click', function () { show(im); dlg.showModal(); }); });
    imgs.filter(function (im) { return im.closest('.run'); }).forEach(function (im) {
      im.tabIndex = 0;
      im.setAttribute('role', 'button');
      function open() { show(im); dlg.showModal(); }
      im.addEventListener('click', open);
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.prev').addEventListener('click', function () { step(-1); });
    dlg.querySelector('.next').addEventListener('click', function () { step(1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    // En el móvil se pasa de foto deslizando; basta un gesto rápido (criterio de Emil: velocidad, no distancia)
    var fig = dlg.querySelector('figure'), sx = 0, st = 0, drag = false;
    fig.style.touchAction = 'pan-y';
    fig.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; drag = true; sx = e.clientX; st = e.timeStamp; });
    fig.addEventListener('pointercancel', function () { drag = false; });
    fig.addEventListener('pointerup', function (e) {
      if (!drag) return; drag = false;
      var dx = e.clientX - sx, v = Math.abs(dx) / Math.max(1, e.timeStamp - st);
      if (Math.abs(dx) > 60 || (Math.abs(dx) > 20 && v > 0.11)) step(dx < 0 ? 1 : -1);
    });
  }
  // Menú: se cierra al tocar fuera, con Escape o al elegir un enlace
  document.querySelectorAll('.bar-menu').forEach(function (m) {
    document.addEventListener('click', function (e) { if (m.open && !m.contains(e.target)) m.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.open) { m.open = false; m.querySelector('summary').focus(); } });
    m.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { m.open = false; }); });
  });
  // Desplegable de Servicios en la barra
  document.querySelectorAll('.drop').forEach(function (d) {
    var b = d.querySelector('button');
    b.addEventListener('click', function () { var o = !d.classList.contains('open'); d.classList.toggle('open', o); b.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!d.contains(e.target)) { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { d.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus(); } });
  });})();
