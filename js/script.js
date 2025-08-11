document.addEventListener('DOMContentLoaded', () => {
    const texto = document.querySelector('.parte-logo__texto');

    // Solo ejecuta en PC (desactiva en móviles/tablets)
    if (window.innerWidth > 768) {
        const textoCompleto = texto.textContent;
        texto.textContent = '';
        texto.style.opacity = 1;

        let i = 0;
        const intervalo = setInterval(() => {
            texto.textContent += textoCompleto[i];
            i++;
            if (i === textoCompleto.length) {
                clearInterval(intervalo);
                // quitar cursor al final
                texto.style.borderRight = 'none';
            }
        }, 150); // velocidad de escritura
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const track   = slider.querySelector('.hero-track');
  const slides  = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots    = Array.from(slider.querySelectorAll('.hero-dots [role="tab"]'));
  const btnPrev = slider.querySelector('.hero-arrow.prev');
  const btnNext = slider.querySelector('.hero-arrow.next');

  const INTERVAL = 4000;  // 4 s
  let index = 0;
  let timer = null;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;

    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === index);
      s.setAttribute('aria-hidden', k === index ? 'false' : 'true');
      s.setAttribute('aria-label', `${k + 1} de ${slides.length}`);
    });
    dots.forEach((d, k) => d.setAttribute('aria-selected', k === index ? 'true' : 'false'));
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function startAutoplay() {
    stopAutoplay();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(next, INTERVAL);
  }
  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Flechas
  btnNext?.addEventListener('click', () => { next(); startAutoplay(); });
  btnPrev?.addEventListener('click', () => { prev(); startAutoplay(); });

  // Bullets
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
  });

  // Pausar al hover
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Teclado
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    if (e.key === 'ArrowLeft')  { prev(); startAutoplay(); }
  });

  // Pausar si cambias de pestaña
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  // Swipe/touch
  let startX = null, startY = null, dragging = false;
  const onDown = (e) => {
    dragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startY = (e.touches ? e.touches[0].clientY : e.clientY);
  };
  const onUp = (e) => {
    if (!dragging) return;
    const endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const endY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? next() : prev();
      startAutoplay();
    }
    dragging = false;
  };
  slider.addEventListener('pointerdown', onDown);
  slider.addEventListener('pointerup', onUp);
  slider.addEventListener('touchstart', onDown, { passive: true });
  slider.addEventListener('touchend', onUp);

  // Init
  goTo(0);
  startAutoplay();
});