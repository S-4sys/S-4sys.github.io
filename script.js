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

  // Custom Cursor Pointer & Mouse Tracker
  let mouseX = 0, mouseY = 0;
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (window.matchMedia('(pointer:fine)').matches && cursor && dot) {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    }
  });

  if (window.matchMedia('(pointer:fine)').matches && cursor) {
    document.querySelectorAll('a, button, .media').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // Audio Engine Initialization
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

  // Three.js Interactive 3D Background System
  const canvas3d = document.getElementById('canvas3d');
  if (canvas3d && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Interactive Floating 3D Geometries
    const geometries = [
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.TorusGeometry(1, 0.3, 16, 50),
      new THREE.OctahedronGeometry(1, 0)
    ];

    const material = new THREE.MeshBasicMaterial({
      color: 0xd7ff48,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const meshes = [];
    for (let i = 0; i < 15; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const scale = Math.random() * 0.5 + 0.3;
      mesh.scale.set(scale, scale, scale);
      scene.add(mesh);
      meshes.push(mesh);
    }

    // Particle Stars Field
    const particlesGeo = new THREE.BufferGeometry();
    const count = 400;
    const posArray = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.4 });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    camera.position.z = 8;

    // Animation Loop with Mouse Interaction
    const animate3D = () => {
      requestAnimationFrame(animate3D);

      meshes.forEach((m, idx) => {
        m.rotation.x += 0.003 * (idx % 2 === 0 ? 1 : -1);
        m.rotation.y += 0.005;
        m.position.x += Math.sin(Date.now() * 0.001 + idx) * 0.002;
      });

      // Mouse interactive tilt/parallax
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate3D();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Scroll Performance Engine for Background FX
  const hero = document.querySelector('.hero');
  const video = document.getElementById('heroVideo');
  const blackHole = document.getElementById('blackHole');
  const blackHoleImg = document.getElementById('blackHoleImg');

  if (hero && video && blackHole) {
    let ticking = false;

    const onScroll = () => {
      const heroRect = hero.getBoundingClientRect();
      const progress = Math.min(Math.max(-heroRect.top / Math.max(heroRect.height, 1), 0), 1);

      const opacity = (0.55 - progress * 0.55).toFixed(3);
      const blur = (progress * 8).toFixed(1);
      const scale = (1 + progress * 0.1).toFixed(3);

      video.style.opacity = opacity;
      video.style.filter = `blur(${blur}px) saturate(${(1 - progress * 0.5).toFixed(2)})`;
      video.style.transform = `scale(${scale})`;

      // Blackhole overlay appearance & mouse parallax scale
      blackHole.style.opacity = (progress * 0.95).toFixed(3);
      if (blackHoleImg) {
        blackHoleImg.style.transform = `scale(${1 + progress * 0.08 + mouseX * 0.02}) translate3d(${mouseX * 15}px, ${-mouseY * 15}px, 0)`;
      }

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
