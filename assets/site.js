const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav = document.getElementById('nav');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const heroSection = document.querySelector('.hero');
const heroGrid = document.querySelector('.hero-grid');
const heroVideoWrap = document.querySelector('.hero-video-wrap');
const heroVideo = document.querySelector('.hero-video');
const heroVideoMobileQuery = window.matchMedia('(max-width: 640px)');
const teamCards = document.querySelectorAll('.team-reveal-card');
const teamBioCards = document.querySelectorAll('[data-team-bio-card]');
const expandableCards = document.querySelectorAll('.service-card');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 18);
});

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.classList.toggle('open', !isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
    });
  });
}

if (!prefersReducedMotion) {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.fade-up').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.02,
        scrollTrigger: {
          trigger: el,
          start: 'top 86%'
        }
      });
    });
  }

  teamCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--reveal-x', `${x}%`);
      card.style.setProperty('--reveal-y', `${y}%`);

      const rotateY = ((x - 50) / 50) * 4;
      const rotateX = -((y - 50) / 50) * 4;
      card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
      card.style.setProperty('--reveal-x', '50%');
      card.style.setProperty('--reveal-y', '50%');
    });
  });
} else {
  document.querySelectorAll('.fade-up').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

function syncHeroLayout() {
  if (!heroSection || !heroGrid || !heroVideoWrap) return;

  if (heroSection.firstElementChild !== heroVideoWrap) {
    heroSection.insertBefore(heroVideoWrap, heroGrid);
  }
}

if (heroVideo) {
  const primarySource = heroVideo.querySelector('source');
  const desktopSrc = heroVideo.dataset.desktopSrc || primarySource?.getAttribute('src');
  const mobileSrc = heroVideo.dataset.mobileSrc;

  const applyHeroVideoSource = () => {
    if (!primarySource) return;
    const nextSrc = heroVideoMobileQuery.matches && mobileSrc ? mobileSrc : desktopSrc;
    if (!nextSrc || primarySource.getAttribute('src') === nextSrc) return;
    primarySource.setAttribute('src', nextSrc);
    heroVideo.load();
  };

  const playHeroVideo = () => {
    heroVideo.play().catch(() => {
      if (!heroVideoMobileQuery.matches) {
        heroVideo.setAttribute('controls', 'controls');
      }
    });
  };

  syncHeroLayout();
  applyHeroVideoSource();

  heroVideo.addEventListener('ended', () => {
    if (heroVideo.duration && Number.isFinite(heroVideo.duration)) {
      heroVideo.currentTime = Math.max(0, heroVideo.duration - 0.05);
    }
    heroVideo.pause();
  });

  if (typeof heroVideoMobileQuery.addEventListener === 'function') {
    heroVideoMobileQuery.addEventListener('change', () => {
      syncHeroLayout();
      applyHeroVideoSource();
      playHeroVideo();
    });
  }

  playHeroVideo();
}

function refreshTeamBioCards() {
  teamBioCards.forEach((card) => {
    const bio = card.querySelector('[data-team-bio]');
    const bioInner = bio?.querySelector('.team-reveal-bio-inner');
    const button = card.querySelector('[data-team-toggle]');
    if (!bio || !bioInner || !button) return;

    const expandedHeight = Math.ceil(bioInner.scrollHeight);
    const isExpanded = card.classList.contains('is-expanded');

    bio.style.maxHeight = isExpanded ? `${expandedHeight}px` : '0px';
    button.textContent = isExpanded ? 'Show Less' : 'Read More';
    button.setAttribute('aria-expanded', String(isExpanded));

    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';

    button.addEventListener('click', () => {
      const nextExpanded = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', nextExpanded);
      bio.style.maxHeight = nextExpanded ? `${bioInner.scrollHeight}px` : '0px';
      button.textContent = nextExpanded ? 'Show Less' : 'Read More';
      button.setAttribute('aria-expanded', String(nextExpanded));
    });
  });
}

function refreshExpandableCards() {
  expandableCards.forEach((card) => {
    const wrap = card.querySelector('[data-collapsible]');
    const copy = wrap?.querySelector('.service-copy');
    const button = card.querySelector('[data-toggle-text]');
    if (!wrap || !copy || !button) return;

    const lineHeight = parseFloat(window.getComputedStyle(copy).lineHeight) || 28.8;
    const collapsedHeight = Math.ceil(lineHeight * 4);
    const expandedHeight = Math.ceil(copy.scrollHeight);
    const isExpanded = card.classList.contains('is-expanded');

    wrap.style.setProperty('--expanded-height', `${expandedHeight}px`);

    if (expandedHeight <= collapsedHeight + 6) {
      button.hidden = true;
      wrap.style.maxHeight = 'none';
      return;
    }

    button.hidden = false;
    wrap.style.maxHeight = isExpanded ? `${expandedHeight}px` : `${collapsedHeight}px`;
    button.textContent = isExpanded ? 'Show Less' : 'Read More';
    button.setAttribute('aria-expanded', String(isExpanded));

    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';

    button.addEventListener('click', () => {
      const nextExpanded = !card.classList.contains('is-expanded');
      card.classList.toggle('is-expanded', nextExpanded);
      wrap.style.maxHeight = nextExpanded ? `${copy.scrollHeight}px` : `${collapsedHeight}px`;
      button.textContent = nextExpanded ? 'Show Less' : 'Read More';
      button.setAttribute('aria-expanded', String(nextExpanded));
    });
  });
}

refreshTeamBioCards();
refreshExpandableCards();
window.addEventListener('load', syncHeroLayout);
window.addEventListener('load', refreshTeamBioCards);
window.addEventListener('load', refreshExpandableCards);
window.addEventListener('resize', syncHeroLayout);
window.addEventListener('resize', refreshTeamBioCards);
window.addEventListener('resize', refreshExpandableCards);
