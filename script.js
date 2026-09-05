const body = document.body;
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => {
  body.classList.remove('menu-open');
  menu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}));

// Category filters
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.project')];
filters.forEach(btn => btn.addEventListener('click', () => {
  const value = btn.dataset.filter;
  filters.forEach(b => {
    const active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  cards.forEach(card => {
    const show = value === 'all' || card.dataset.category === value;
    card.classList.toggle('hidden', !show);
  });
}));

// Reveal on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, {threshold: .12});
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
  observer.observe(el);
});

// Lightbox for real project images
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbCaption = document.getElementById('lightboxCaption');
const closeLB = () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
};
document.querySelectorAll('[data-lightbox]').forEach(btn => btn.addEventListener('click', () => {
  lbImg.src = btn.dataset.lightbox;
  lbImg.alt = btn.querySelector('img')?.alt || '';
  lbCaption.textContent = btn.dataset.caption || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}));
document.getElementById('closeLightbox').addEventListener('click', closeLB);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

// Tiny desktop cursor interaction
const cursor = document.querySelector('.cursor');
const dot = document.querySelector('.cursor-dot');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', e => {
    cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`;
    dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`;
  });
  document.querySelectorAll('a,button,.magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}


/* ===== BACKGROUND MEDIA + AUDIO ===== */
(() => {
  const hero = document.querySelector('.hero');
  const video = document.getElementById('heroVideo');
  const mediaBg = document.getElementById('heroMediaBg');
  const blackHole = document.getElementById('blackHole');
  const audio = document.getElementById('bgAudio');
  const audioToggle = document.getElementById('audioToggle');
  const audioLabel = audioToggle?.querySelector('.audio-label');

  if (!hero || !video || !mediaBg || !blackHole) return;

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let raf = 0;

  const updateMedia = () => {
    const heroRect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = clamp((-heroRect.top) / Math.max(heroRect.height - viewport, 1), 0, 1);

    // Video subtly scales, dims, blurs and compresses toward the center as you scroll.
    const scale = 1.02 - progress * 0.24;
    const squashX = 1 - progress * 0.22;
    const squashY = 1 - progress * 0.08;
    const opacity = 0.34 - progress * 0.34;
    const blur = progress * 5.5;
    video.style.transform = `scale(${scale}) scaleX(${squashX}) scaleY(${squashY})`;
    video.style.opacity = opacity.toFixed(3);
    video.style.filter = `saturate(${(0.9 - progress * .6).toFixed(2)}) contrast(${(1.05 - progress * .05).toFixed(2)}) brightness(${(.65 - progress * .12).toFixed(2)}) blur(${blur.toFixed(1)}px)`;

    // Black hole fades in as the hero leaves, taking over the background.
    const hole = clamp((progress - 0.18) / 0.72, 0, 1);
    blackHole.style.opacity = (hole * .97).toFixed(3);
    blackHole.style.transform = `scale(${(0.92 + hole * .08).toFixed(3)})`;

    raf = 0;
  };

  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(updateMedia);
  };
  window.addEventListener('scroll', requestUpdate, { passive:true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();

  // Most browsers allow muted video autoplay. Explicitly kick it once ready.
  const startVideo = () => video.play().catch(() => {});
  if (video.readyState >= 2) startVideo();
  else video.addEventListener('loadeddata', startVideo, { once:true });

  if (audio && audioToggle) {
    const setAudioUI = (playing) => {
      audioToggle.classList.toggle('is-playing', playing);
      audioToggle.setAttribute('aria-pressed', String(playing));
      audioToggle.setAttribute('aria-label', playing ? 'Pause background audio' : 'Play background audio');
      if (audioLabel) audioLabel.textContent = playing ? 'SOUND ON' : 'SOUND OFF';
    };

    audioToggle.addEventListener('click', async () => {
      try {
        if (audio.paused) {
          await audio.play();
          setAudioUI(true);
        } else {
          audio.pause();
          setAudioUI(false);
        }
      } catch (err) {
        setAudioUI(false);
        console.warn('Background audio could not start:', err);
      }
    });

    audio.addEventListener('ended', () => setAudioUI(false));
  }
})();
