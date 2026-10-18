// Formularios de River's: GitHub Pages no puede enviar correos, así que el
// mensaje se abre ya redactado en el correo o en WhatsApp de quien escribe.
(function () {
  var EMAIL = 'reformasrivers@gmail.com';
  var WHATSAPP = '34614239410';

  document.querySelectorAll('form[data-formulario]').forEach(function (form) {
    var error = form.querySelector('.form-error');
    var via = 'whatsapp';
    form.querySelectorAll('button[type=submit]').forEach(function (b) {
      b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
    });

    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });
    form.addEventListener('change', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var faltan = [];
      form.querySelectorAll('[required]').forEach(function (campo) {
        var vacio = campo.type === 'checkbox' ? !campo.checked : !campo.value.trim();
        var mal = vacio || !campo.checkValidity();
        campo.setAttribute('aria-invalid', mal ? 'true' : 'false');
        if (mal) faltan.push(campo.getAttribute('data-nombre'));
      });
      if (faltan.length) {
        error.textContent = 'Falta: ' + faltan.join(', ') + '.';
        error.classList.remove('hidden');
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

      if (via === 'whatsapp') {
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      } else {
        window.location.href = 'mailto:' + EMAIL + '?subject=' +
          encodeURIComponent(form.getAttribute('data-formulario') + ' - ' + nombre) +
          '&body=' + encodeURIComponent(texto);
      }
      setTimeout(function () { window.location.href = 'gracias.html'; }, 1200);
    });
  });
})();
