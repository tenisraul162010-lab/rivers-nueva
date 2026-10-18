// Comparadores de antes y después: la barra mueve el corte entre las dos fotos.
(function () {
  document.querySelectorAll('.ad').forEach(function (ad) {
    var rango = ad.querySelector('input[type=range]');
    function poner(v) { ad.style.setProperty('--pos', v + '%'); }
    rango.addEventListener('input', function () { poner(rango.value); });
    poner(rango.value);
  });
})();
