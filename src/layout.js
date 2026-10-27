// Shared chrome for every page: header (with dropdown nav), footer, and the
// board-bio modal. Pages declare `data-page="about|history|..."` on <body>.

import Offcanvas from 'bootstrap/js/dist/offcanvas';

const NAV_LINKS = [
  { label: 'Home', href: 'index.html' },
  {
    label: 'About',
    href: 'about.html',
    children: [
      { label: 'About Us', href: 'about.html' },
      { label: 'History', href: 'history.html' },
      { label: 'Mission & Vision', href: 'about.html#mission' },
    ],
  },
  { label: 'Events', href: 'events.html' },
  {
    label: 'Leadership',
    href: 'leadership.html',
    children: [
      { label: 'Board of Directors', href: 'leadership.html' },
      { label: 'Technical Committees', href: 'about.html#focus' },
    ],
  },
  {
    label: 'Inter-American',
    href: 'https://aidisnet.org/aidis/',
    external: true,
    children: [
      { label: 'AIDIS Inter-American', href: 'https://aidisnet.org/aidis/', external: true },
      { label: 'National Sections', href: 'https://aidisnet.org/secciones-nacionales-capitulos-de-aidis/', external: true },
      { label: 'News', href: 'https://aidisnet.org/category/noticias/', external: true },
      { label: 'Calendar', href: 'https://aidisnet.org/events/', external: true },
    ],
  },
];

function isActive(page, href) {
  if (!href || href.startsWith('http')) return false;
  const clean = href.split('#')[0].replace(/^\//, '');
  return clean === `${page}.html`;
}

function navItemHtml(item, page) {
  const active = isActive(page, item.href);
  const hasChildren = Array.isArray(item.children) && item.children.length;
  if (!hasChildren) {
    const ext = item.external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${item.href}"${ext}${active ? ' class="active"' : ''}>${item.label}</a>`;
  }
  const ext = item.external ? ' target="_blank" rel="noopener"' : '';
  const kids = item.children
    .map((c) => {
      const ce = c.external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${c.href}"${ce}>${c.label}</a>`;
    })
    .join('');
  return `<div class="nav-item has-children${active ? ' active' : ''}">
        <a href="${item.href}"${ext} class="nav-parent${active ? ' active' : ''}">${item.label}<svg class="caret" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></a>
        <div class="nav-dropdown">${kids}</div>
      </div>`;
}

function mobileMenuHtml(page) {
  const mobileLink = (label, href, external = false) => {
    const active = isActive(page, href) ? ' active' : '';
    const ext = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${ext} class="mobile-link${active}">${label}</a>`;
  };
  const childLink = (child) => {
    const active = child.href === `${page}.html` ? ' class="active"' : '';
    const ext = child.external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${child.href}"${ext}${active}>${child.label}</a>`;
  };
  const group = (label, children) => `<details class="mobile-group">
          <summary>${label}<svg class="caret" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary>
          <div class="mobile-sub">${children.map(childLink).join('')}</div>
        </details>`;

  const about = NAV_LINKS.find((item) => item.label === 'About');
  const leadership = NAV_LINKS.find((item) => item.label === 'Leadership');
  const interAmerican = NAV_LINKS.find((item) => item.label === 'Inter-American');

  return `<div class="offcanvas offcanvas-end" tabindex="-1" id="mobileMenu" aria-label="Mobile navigation">
  <div class="offcanvas-header">
    <a href="index.html" class="mobile-brand">
      <img src="iaasee-logo.png" alt="IAASEE United States Chapter">
    </a>
    <button type="button" class="mobile-close" data-bs-dismiss="offcanvas" aria-label="Close menu">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="offcanvas-body">
    <nav class="mobile-nav" aria-label="Mobile navigation">
      ${mobileLink('Home', 'index.html')}
      ${group('About', about.children)}
      ${mobileLink('Events', 'events.html')}
      ${group('Leadership', leadership.children)}
      ${group('Inter-American', interAmerican.children)}
      <a href="contact.html" class="mobile-link mobile-cta${isActive(page, 'contact.html') ? ' active' : ''}">Contact Us</a>
    </nav>
  </div>
</div>`;
}

function headerHtml(page) {
  const links = NAV_LINKS.map((i) => navItemHtml(i, page)).join('\n      ');
  return `<nav id="nav">
  <a href="index.html" class="nav-brand">
    <img src="iaasee-logo.png" alt="IAASEE — Inter-American Association of Sanitary and Environmental Engineering, United States Chapter">
  </a>
  <button id="navToggle" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu" aria-haspopup="dialog">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-links" id="navLinks">
      ${links}
      <a href="contact.html" class="nav-join">Contact Us</a>
  </div>
</nav>
${mobileMenuHtml(page)}`;
}

function footerHtml() {
  return `<footer>
  <div class="footer-grid">
    <div>
      <div class="footer-brand-logo">
        <img src="iaasee-logo-white.png" alt="IAASEE — Inter-American Association of Sanitary and Environmental Engineering, United States Chapter">
      </div>
      <p class="footer-desc">The U.S. Chapter of AIDIS — the Inter-American Association of Sanitary and Environmental Engineering. Connecting American water professionals to a 24-section network across the Americas.</p>
      <div class="footer-socials">
        <a href="https://www.linkedin.com" class="soc-btn" aria-label="LinkedIn" target="_blank" rel="noopener">
          <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="mailto:iaasee.usc@gmail.com" class="soc-btn" aria-label="Email">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </a>
      </div>
    </div>
    <div class="footer-col">
      <h4>Organization</h4>
      <a href="about.html">About Us</a>
      <a href="history.html">Our History</a>
      <a href="about.html#mission">Mission &amp; Vision</a>
      <a href="leadership.html">Leadership</a>
    </div>
    <div class="footer-col">
      <h4>Participate</h4>
      <a href="events.html">Events</a>
      <a href="contact.html">Membership</a>
      <a href="about.html#focus">Technical Committees</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <a href="mailto:iaasee.usc@gmail.com">iaasee.usc@gmail.com</a>
      <a href="https://aidisnet.org/aidis/" target="_blank" rel="noopener">AIDIS Inter-American</a>
      <a href="https://aidisnet.org/secciones-nacionales-capitulos-de-aidis/" target="_blank" rel="noopener">National Sections</a>
      <a href="https://aidisnet.org/category/noticias/" target="_blank" rel="noopener">News</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 IAASEE United States Chapter. All rights reserved.</span>
    <span>A U.S. Chapter of AIDIS</span>
  </div>
</footer>`;
}


const MODAL_HTML = `<div class="modal-overlay" id="bioModal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalName">
    <button class="modal-close" id="modalClose" aria-label="Close">&times;</button>
    <div class="modal-head">
      <div class="modal-avatar" id="modalAvatar"></div>
      <div>
        <h3 id="modalName"></h3>
        <div class="modal-role" id="modalRole"></div>
        <div class="modal-org" id="modalOrg"></div>
      </div>
    </div>
    <p class="modal-bio" id="modalBio"></p>
  </div>
</div>`;

const BOARD_BIOS = {
  cardenas: {
    name: 'Dr. Cristian Cardenas-Lailhacar',
    role: 'President',
    org: 'Instructional Associate Professor, University of Florida',
    img: 'image1.jpeg',
    bio: 'Dr. Cristian Cardenas-Lailhacar is an Instructional Associate Professor in the Department of Mechanical and Aerospace Engineering at the University of Florida (UF) Herbert Wertheim College of Engineering, and an Affiliate Faculty in the UF Center for Latin American Studies. He serves as Assistant Director of both the UF Industrial Training and Assessment Center and the UF Mobile Energy Laboratory, for which he has completed over 420 assessments in the US and Latin America, including wastewater treatment plants (WWTP) in the State of Florida. He developed a study on the current energy use of these facilities that was used for performance improvement by the State. He has over 40 peer-reviewed publications, written 360 reports for the US-DOE, co-authored 3 books, and 4 chapters in books.',
  },
  oyanedel: {
    name: 'Dr. Vinka Oyanedel-Craver',
    role: 'Vice-President & Treasurer',
    org: 'Professor, University of Rhode Island',
    img: 'image2.jpeg',
    bio: 'Dr. Vinka Oyanedel-Craver is a Professor at the Department of Civil and Environmental Engineering at the University of Rhode Island. Her current research interests are in emerging contaminants of drinking water, wastewater, and stormwater treatment, as well as the development of novel water technologies. Her current research focus is on environmental nanotechnology, specifically on the behavior and application of nanomaterials in different ecological compartments and their use as antimicrobial compounds in point of use water/wastewater treatment in rural developing communities. Her research team has authored more than 45 peer-reviewed publications.',
  },
  goldszier: {
    name: 'Eng. Barbara Goldszier',
    role: 'Vice-President & Secretary',
    org: 'Civil Engineer, Water Infrastructure Specialist',
    img: 'image3.jpeg',
    bio: 'Engineer Barbara Goldszier is a Civil Engineer specializing in Water Engineering, graduated from the University of Buenos Aires. She has over 10 years of professional experience in water infrastructure projects, including work for Agua y Saneamientos Argentinos (AySA), the public water and sanitation utility serving the Buenos Aires metropolitan area.',
  },
};

/** Inject header + footer (and modal) into placeholders, then wire chrome behaviour. */
export function mountLayout() {
  const page = (document.body.dataset.page || 'index').toLowerCase();
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (header) header.innerHTML = headerHtml(page);
  if (footer) footer.innerHTML = footerHtml();

  if (!document.getElementById('bioModal')) {
    const wrap = document.createElement('div');
    wrap.innerHTML = MODAL_HTML;
    document.body.appendChild(wrap.firstElementChild);
  }

  setupNav();
  setupBioModal();
}

/* ── nav behaviour ── */
function setupNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    const drawer = Offcanvas.getOrCreateInstance(mobileMenu);
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      drawer.toggle(toggle);
    });
    mobileMenu.addEventListener('show.bs.offcanvas', () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    });
    mobileMenu.addEventListener('hide.bs.offcanvas', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
    mobileMenu.addEventListener('hidden.bs.offcanvas', () => {
      if (window.innerWidth <= 1120) toggle.focus();
    });
    // External links open in a new tab; close the drawer so the page behind is usable.
    mobileMenu.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.addEventListener('click', () => drawer.hide());
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1120) drawer.hide();
    });
  }

  // Hover-intent: keep the dropdown open through the gap while the pointer
  // travels from the nav item down into the menu.
  document.querySelectorAll('.nav-item.has-children').forEach((item) => {
    let timer;
    const open = () => { clearTimeout(timer); item.classList.add('open'); };
    const close = () => { timer = setTimeout(() => item.classList.remove('open'), 180); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    item.addEventListener('focusin', open);
    item.addEventListener('focusout', close);
  });

}

/* ── bio modal ── */
function setupBioModal() {
  const modal = document.getElementById('bioModal');
  if (!modal) return;
  const avatar = document.getElementById('modalAvatar');
  const name = document.getElementById('modalName');
  const role = document.getElementById('modalRole');
  const org = document.getElementById('modalOrg');
  const bio = document.getElementById('modalBio');

  const open = (key) => {
    const b = BOARD_BIOS[key];
    if (!b) return;
    avatar.style.backgroundImage = `url('${b.img}')`;
    name.textContent = b.name;
    role.textContent = b.role;
    org.textContent = b.org;
    bio.textContent = b.bio;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.board-card[data-bio]').forEach((card) => {
    card.addEventListener('click', () => open(card.dataset.bio));
  });
  document.getElementById('modalClose')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
