(function () {
  const $ = (id) => document.getElementById(id);

  const state = {
    temp: 22,
    phase: 'solid',
    material: 'neon',
    pressure: 1,
    force: 'attract',
    playing: true,
    bucketTilt: 0,
    particles: []
  };

  const phaseConfig = {
    solid: { speed: 0.18, pressure: 0.72 },
    liquid: { speed: 0.42, pressure: 1 },
    gas: { speed: 0.82, pressure: 1.6 }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateTemp() {
    const temp = $('temp');
    const fill = $('thermoFill');
    if (!temp || !fill) return;

    temp.textContent = `${Math.round(state.temp)} K`;
    const value = clamp((state.temp - 10) / 90, 0, 1);
    fill.style.height = `${(value * 100).toFixed(1)}%`;
  }

  function updatePressure() {
    const label = $('pressureText');
    const needle = $('gaugeNeedle');
    if (!label || !needle) return;

    const normalized = clamp(state.pressure / 3, 0, 1);
    const angle = -34 + normalized * 68;
    label.textContent = `Áp suất ${state.pressure.toFixed(1)} atm`;
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }

  function setMaterial(name) {
    state.material = name;
    document.querySelectorAll('.material').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.material === name);
    });
  }

  function setPhase(name) {
    state.phase = name;
    document.querySelectorAll('.phase').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.phase === name);
    });

    const config = phaseConfig[name] || phaseConfig.solid;
    state.pressure = clamp(state.pressure * config.pressure, 0.4, 3.2);
    updatePressure();
  }

  function setView(viewName) {
    document.querySelectorAll('.tool-panel').forEach((panel) => {
      const hidden = panel.id !== `${viewName}Panel`;
      panel.classList.toggle('hidden', hidden);
    });

    document.querySelectorAll('.nav').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
  }

  function createParticles() {
    const canvas = $('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        r: 2 + Math.random() * 3,
        color: ['#7ad8ff', '#ffd166', '#7ef0b1', '#b18cff'][i % 4]
      });
    }

    state.particles = particles;
  }

  function drawParticles() {
    const canvas = $('particles');
    if (!canvas || !state.particles.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = phaseConfig[state.phase] || phaseConfig.solid;
    const factor = config.speed * (state.temp / 30);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of state.particles) {
      p.x += p.vx * factor;
      p.y += p.vy * factor;

      if (p.x <= 0 || p.x >= canvas.width) p.vx *= -1;
      if (p.y <= 0 || p.y >= canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = state.phase === 'gas' ? 0.9 : 0.78;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function animate() {
    if (state.playing) {
      const config = phaseConfig[state.phase] || phaseConfig.solid;
      const delta = (Math.random() - 0.5) * 3.2 * config.speed;
      state.temp = clamp(state.temp + delta, 10, 120);
      updateTemp();
      drawParticles();
    }

    requestAnimationFrame(animate);
  }

  function bindMaterials() {
    document.querySelectorAll('.material').forEach((button) => {
      button.addEventListener('click', () => setMaterial(button.dataset.material));
    });
  }

  function bindPhases() {
    document.querySelectorAll('.phase').forEach((button) => {
      button.addEventListener('click', () => setPhase(button.dataset.phase));
    });
  }

  function bindForceButtons() {
    document.querySelectorAll('[data-force]').forEach((button) => {
      button.addEventListener('click', () => {
        state.force = button.dataset.force;
        document.querySelectorAll('[data-force]').forEach((el) => {
          el.classList.toggle('active', el.dataset.force === state.force);
        });
      });
    });
  }

  function bindNavs() {
    document.querySelectorAll('.nav').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
  }

  function setupBucketDrag() {
    const bucket = $('bucket');
    if (!bucket) return;

    let dragging = false;
    let startY = 0;
    let startTemp = state.temp;

    bucket.addEventListener('pointerdown', (event) => {
      dragging = true;
      startY = event.clientY;
      startTemp = state.temp;
      bucket.setPointerCapture(event.pointerId);
    });

    bucket.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const delta = (startY - event.clientY) / 9;
      const next = clamp(startTemp + delta * 1.2, 10, 120);
      state.temp = next;
      updateTemp();
      state.bucketTilt = clamp(delta * 1.4, -25, 25);
      bucket.style.transform = `translateX(-50%) rotate(${state.bucketTilt}deg)`;
    });

    const stopDrag = () => {
      dragging = false;
      state.bucketTilt = 0;
      bucket.style.transform = 'translateX(-50%)';
    };

    bucket.addEventListener('pointerup', stopDrag);
    bucket.addEventListener('pointercancel', stopDrag);
    bucket.addEventListener('pointerleave', stopDrag);
  }

  function bindControls() {
    const playBtn = $('play');
    const pauseBtn = $('pause');
    const resetBtn = $('reset');

    if (playBtn) {
      playBtn.addEventListener('click', () => { state.playing = true; });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => { state.playing = false; });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.temp = 22;
        state.pressure = 1;
        state.phase = 'solid';
        state.force = 'attract';
        state.playing = true;
        setPhase('solid');
        setMaterial('neon');
        document.querySelectorAll('[data-force]').forEach((el) => {
          el.classList.toggle('active', el.dataset.force === 'attract');
        });
        updateTemp();
        updatePressure();
      });
    }
  }

  function init() {
    createParticles();
    setMaterial('neon');
    setPhase('solid');
    setView('status');
    bindMaterials();
    bindPhases();
    bindForceButtons();
    bindNavs();
    bindControls();
    setupBucketDrag();
    updateTemp();
    updatePressure();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
