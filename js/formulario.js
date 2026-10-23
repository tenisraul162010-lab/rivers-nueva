// Formularios de River's: GitHub Pages no puede enviar correos, así que el
// mensaje se abre ya redactado en el correo o en WhatsApp de quien escribe.
// La web no puede saber si después se pulsa Enviar (con 'noopener' el navegador
// no dice si la ventana se abrió), así que nunca se da por enviado: se explica
// el paso que falta y se dan alternativas.
(function () {
  var EMAIL = 'reformasrivers@gmail.com';
  var WHATSAPP = '34614239410';
  var TEL = '+' + WHATSAPP;
  var TEL_TEXTO = WHATSAPP.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

  // Teléfono español: 9 cifras que empiezan por 6, 7, 8 o 9; admite espacios, puntos, guiones y +34 / 0034
  function telValido(v) {
    var s = v.replace(/[\s.\-()]/g, '').replace(/^(\+34|0034)/, '');
    return /^[6789]\d{8}$/.test(s);
  }
  function emailValido(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  // Devuelve '' si el campo está bien, 'falta' si está vacío o 'mal' si el formato no vale
  function revisar(campo) {
    var v = campo.type === 'checkbox' ? '' : campo.value.trim();
    if (campo.type === 'checkbox') return campo.required && !campo.checked ? 'falta' : '';
    if (!v) return campo.required ? 'falta' : '';
    if (campo.name === 'telefono') return telValido(v) ? '' : 'mal';
    if (campo.name === 'contacto') return telValido(v) || emailValido(v) ? '' : 'mal';
    if (campo.type === 'email') return emailValido(v) ? '' : 'mal';
    return '';
  }
  var COMO = { telefono: ' (9 cifras)', contacto: ' (un teléfono de 9 cifras o un email)', email: ' (debe llevar @ y el dominio del correo)' };

  function boton(texto, clase) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = clase; b.textContent = texto;
    return b;
  }
  function enlace(texto, href, clase, fuera) {
    var a = document.createElement('a');
    a.className = clase; a.href = href; a.textContent = texto;
    if (fuera) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  // Copia el texto; si el navegador no deja, lo selecciona en «Ver el mensaje» para copiarlo a mano
  function copiar(texto, b, ver, area) {
    function hecho() { b.textContent = 'Mensaje copiado'; setTimeout(function () { b.textContent = 'Copiar el mensaje'; }, 2500); }
    function aMano() {
      ver.open = true; area.focus(); area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) hecho(); else b.textContent = 'Selecciona el texto de abajo y cópialo';
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(hecho, aMano);
    else aMano();
  }

  document.querySelectorAll('form[data-formulario]').forEach(function (form) {
    var error = form.querySelector('.form-error');
    var acciones = form.querySelector('.form-actions');
    var via = 'whatsapp';
    form.querySelectorAll('button[type=submit]').forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });

    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });
    form.addEventListener('change', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });

    // Aviso del paso que falta, debajo de los botones
    var aviso = document.createElement('div');
    aviso.className = 'form-sent full hidden';
    aviso.setAttribute('role', 'status');
    aviso.tabIndex = -1;
    acciones.parentNode.insertBefore(aviso, acciones.nextSibling);

    function mostrarAviso(medio, url, texto) {
      aviso.textContent = '';
      var h = document.createElement('p');
      h.className = 'form-sent-h';
      h.textContent = medio === 'whatsapp' ? 'Falta un paso: pulsa Enviar en WhatsApp' : 'Falta un paso: pulsa Enviar en tu correo';
      var p = document.createElement('p');
      p.textContent = medio === 'whatsapp'
        ? 'Hemos abierto WhatsApp con tu solicitud ya escrita. Hasta que no la envíes desde allí, no nos llega. Si no se ha abierto, prueba de nuevo, copia el mensaje o llámanos.'
        : 'Hemos abierto tu programa de correo con la solicitud ya escrita. Hasta que no la envíes desde allí, no nos llega. Si no se ha abierto, copia el mensaje y mándalo a ' + EMAIL + ', o llámanos.';

      var fila = document.createElement('div');
      fila.className = 'form-sent-actions';
      var otra = medio === 'whatsapp'
        ? enlace('Abrir WhatsApp de nuevo', url, 'btn', true)
        : enlace('Abrir el correo de nuevo', url, 'btn');
      var cp = boton('Copiar el mensaje', 'btn alt');
      fila.appendChild(otra);
      fila.appendChild(cp);
      fila.appendChild(enlace('Llamar al ' + TEL_TEXTO, 'tel:' + TEL, 'btn alt'));

      var ver = document.createElement('details');
      ver.className = 'form-sent-ver';
      var s = document.createElement('summary');
      s.textContent = 'Ver el mensaje';
      var t = document.createElement('textarea');
      t.readOnly = true; t.rows = 8; t.value = texto;
      t.setAttribute('aria-label', 'Texto de tu solicitud');
      ver.appendChild(s); ver.appendChild(t);
      cp.addEventListener('click', function () { copiar(texto, cp, ver, t); });

      var ya = document.createElement('p');
      ya.className = 'form-sent-ok';
      ya.appendChild(document.createTextNode('¿Ya lo has enviado? '));
      ya.appendChild(enlace('Sí, ya lo he enviado', 'gracias.html', 'ulink'));

      [h, p, fila, ver, ya].forEach(function (n) { aviso.appendChild(n); });
      aviso.classList.remove('hidden');
      aviso.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var faltan = [], malos = [];
      form.querySelectorAll('[data-nombre]').forEach(function (campo) {
        var r = revisar(campo);
        campo.setAttribute('aria-invalid', r ? 'true' : 'false');
        if (r === 'falta') faltan.push(campo.getAttribute('data-nombre'));
        if (r === 'mal') malos.push(campo.getAttribute('data-nombre') + (COMO[campo.name] || COMO[campo.type] || ''));
      });
      if (faltan.length || malos.length) {
        var msg = [];
        if (faltan.length) msg.push('Falta: ' + faltan.join(', ') + '.');
        if (malos.length) msg.push('Revisa: ' + malos.join(', ') + '.');
        error.textContent = msg.join(' ');
        error.classList.remove('hidden');
        aviso.classList.add('hidden');
        var primero = form.querySelector('[aria-invalid="true"]');
        if (primero) primero.focus();
        return;
      }
      error.classList.add('hidden');

      var lineas = [form.getAttribute('data-formulario'), ''];
      form.querySelectorAll('[data-nombre]').forEach(function (campo) {
        if (campo.name === 'privacidad') return;
        var valor = campo.type === 'checkbox' ? (campo.checked ? 'Sí' : 'No') : (campo.value.trim() || '-');
        lineas.push(campo.getAttribute('data-nombre') + ': ' + valor);
      });
      var texto = lineas.join('\n');
      var nombre = form.elements.nombre.value.trim();

      var url;
      if (via === 'whatsapp') {
        url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
        window.open(url, '_blank', 'noopener');
      } else {
        url = 'mailto:' + EMAIL + '?subject=' +
          encodeURIComponent(form.getAttribute('data-formulario') + ' - ' + nombre) +
          '&body=' + encodeURIComponent(texto);
        window.location.href = url;
      }
      mostrarAviso(via, url, texto);
    });
  });
})();
