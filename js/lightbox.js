/* Generic lightbox — click any .install-photos figure to pop it out
   full-screen. Each .install-photos grid is its own gallery; prev/next
   cycles within the grid you opened. */
const grids = Array.from(document.querySelectorAll('.install-photos'));
const lightbox = document.getElementById('lightbox');

if (grids.length && lightbox) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCount = document.getElementById('lightboxCount');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let photos = [];
  let current = 0;

  function show(index) {
    current = ((index % photos.length) + photos.length) % photos.length;
    const photo = photos[current];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCount.textContent = photos.length > 1
      ? `${String(current + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`
      : '';
  }

  function open(gridPhotos, index) {
    photos = gridPhotos;
    const multi = photos.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
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

  grids.forEach((grid) => {
    const figures = Array.from(grid.querySelectorAll('figure'));
    const gridPhotos = figures.map((fig) => {
      const img = fig.querySelector('img');
      return { src: img.src, alt: img.alt };
    });
    figures.forEach((fig, i) => {
      fig.style.cursor = 'pointer';
      fig.addEventListener('click', () => open(gridPhotos, i));
    });
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
