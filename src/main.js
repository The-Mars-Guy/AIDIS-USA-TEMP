import './style.css';
import { mountLayout } from './layout.js';
import { renderEvents } from './events.js';

// Inject shared header / footer / modal first so per-page features can bind to them.
mountLayout();

// Hero logo watermark removed

// Reveal on scroll
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

// Count-up animation for stats (home page only)
function countUp(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target).toLocaleString('en-US') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const sw = document.querySelector('.stats-wrapper');
if (sw) {
  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-target]').forEach(countUp);
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  statsObs.observe(sw);
}

// Contact form: no backend — hand off to the chapter inbox via the user's mail client.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const topic = (data.get('topic') || 'General inquiry').toString();
    const message = (data.get('message') || '').toString().trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href =
      `mailto:iaasee.usc@gmail.com?subject=${encodeURIComponent(`[${topic}] Website inquiry`)}&body=${encodeURIComponent(body)}`;
  });
}

renderEvents();
