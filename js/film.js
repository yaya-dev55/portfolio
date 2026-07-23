/* Lightbox for the stills grid on the Photography & Video page */
const grid = document.getElementById('stillsGrid');
const lightbox = document.getElementById('lightbox');

if (grid && lightbox) {
  const figures = Array.from(grid.querySelectorAll('figure'));
  const photos = figures.map((fig) => {
    const img = fig.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCount = document.getElementById('lightboxCount');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let current = 0;

  function show(index) {
    current = ((index % photos.length) + photos.length) % photos.length;
    const photo = photos[current];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCount.textContent = `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  }

  function open(index) {
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  figures.forEach((fig, i) => {
    fig.addEventListener('click', () => open(i));
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}
