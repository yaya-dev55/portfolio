/* Mobile nav toggle */
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMobile.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navMobile.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Scroll reveal */
const revealEls = document.querySelectorAll('.reveal, .reveal-up');

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);

revealEls.forEach((el) => io.observe(el));

/* Reveal hero content immediately on load (not scroll-gated) */
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-in'), 150 + i * 90);
  });
});

/* Photo stacks — click the top photo to send it to the back and
   reveal the next one underneath. */
document.querySelectorAll('.photo-stack').forEach((stack) => {
  const items = Array.from(stack.querySelectorAll('.stack-item'));
  if (items.length < 2) return;
  let order = items.map((_, i) => i);

  function applyPosition(el, pos) {
    const dir = pos % 2 === 0 ? 1 : -1;
    const depth = Math.min(pos, 4);
    el.style.transform = pos === 0
      ? 'translate(0,0) rotate(0deg) scale(1)'
      : `translate(${dir * depth * 6}px, ${depth * 9}px) rotate(${dir * depth * 3}deg) scale(${1 - depth * 0.04})`;
    el.style.opacity = depth <= 4 ? '1' : '0';
    el.style.zIndex = String(items.length - pos);
    el.style.pointerEvents = pos === 0 ? 'auto' : 'none';
  }

  function layout() {
    order.forEach((itemIndex, pos) => applyPosition(items[itemIndex], pos));
  }

  stack.addEventListener('click', () => {
    const frontEl = items[order[0]];
    frontEl.style.transform = 'translate(16px, -90px) rotate(9deg) scale(0.94)';
    frontEl.style.opacity = '0';
    frontEl.style.pointerEvents = 'none';

    window.setTimeout(() => {
      const leaving = order.shift();
      order.push(leaving);
      const leavingEl = items[leaving];
      leavingEl.style.transition = 'none';
      applyPosition(leavingEl, order.length - 1);
      void stack.offsetWidth;
      leavingEl.style.transition = '';
      layout();
    }, 480);
  });

  items.forEach((el) => { el.style.transition = 'none'; });
  layout();
  void stack.offsetWidth;
  items.forEach((el) => { el.style.transition = ''; });
});
