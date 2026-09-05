document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');

  // Menu Drawer Control
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('.menu a').forEach(link => {
      link.addEventListener('click', () => {
        body.classList.remove('menu-open');
        menu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // Work Category Filtering
  const filters = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.project')];
  
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
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
    });
  });

  // Intersection Observer Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach((el, index) => {
    el.style.transitionDelay = `${(index % 3) * 60}ms`;
    observer.observe(el);
  });

  // Lightbox Viewport
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('closeLightbox');

  const closeLB = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
  };

  document.querySelectorAll('[data-lightbox]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!lbImg || !lightbox) return;
      lbImg.src = btn.dataset.lightbox;
      lbImg.alt = btn.querySelector('img')?.alt || '';
      if (lbCaption) lbCaption.textContent = btn.dataset.caption || '';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLB);
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

  // Custom Cursor (Desktop Pointer Only)
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  if (window.matchMedia('(pointer:fine)').matches && cursor && dot) {
    window.addEventListener('mousemove', e => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    document.querySelectorAll('a, button, .media').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // Audio Engine Initialization with Browser Autoplay Handling
  const audio = document.getElementById('bgAudio');
  const audioToggle = document.getElementById('audioToggle');
  const audioLabel = audioToggle?.querySelector('.audio-label');

  if (audio && audioToggle) {
    let audioUnlocked = false;

    const setAudioUI = (playing) => {
      audioToggle.classList.toggle('is-playing', playing);
      audioToggle.setAttribute('aria-pressed', String(playing));
      if (audioLabel) audioLabel.textContent = playing ? 'SOUND ON' : 'SOUND OFF';
    };

    const unlockAudio = () => {
      if (audioUnlocked) return;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlocked = true;
      }).catch(() => {});
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    audioToggle.addEventListener('click', async (e) => {
      e.stopPropagation();
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
      }
    });

    audio.addEventListener('ended', () => setAudioUI(false));
  }

  // Scroll Performance Engine for Background Video FX
  const hero = document.querySelector('.hero');
  const video = document.getElementById('heroVideo');
  const blackHole = document.getElementById('blackHole');

  if (hero && video && blackHole) {
    let ticking = false;

    const onScroll = () => {
      const heroRect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(Math.max(-heroRect.top / Math.max(heroRect.height, 1), 0), 1);

      const opacity = (0.35 - progress * 0.35).toFixed(3);
      const blur = (progress * 8).toFixed(1);
      const scale = (1 + progress * 0.1).toFixed(3);

      video.style.opacity = opacity;
      video.style.filter = `blur(${blur}px) saturate(${(1 - progress * 0.5).toFixed(2)})`;
      video.style.transform = `scale(${scale})`;

      blackHole.style.opacity = (progress * 0.95).toFixed(3);
      blackHole.style.transform = `scale(${(0.9 + progress * 0.1).toFixed(3)})`;

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }
});
