(function () {
  const $ = (id) => document.getElementById(id);
  const state = {
    temp: 22,
    phase: 'solid',
    material: 'neon',
    pressure: 1,
    force: 'attract',
    playing: true,
    bucket: 0,
    particles: []
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateTempText() {
    const tempEl = $('temp');
    const thermoFill = $('thermoFill');
    if (!tempEl || !thermoFill) return;

    tempEl.textContent = `${Math.round(state.temp)} K`;
    const level = clamp((state.temp - 10) / 90, 0, 1);
    thermoFill.style.height = `${(level * 100).toFixed(1)}%`;
  }

  function updatePressureText() {
    const label = $('pressureText');
    const needle = $('gaugeNeedle');
    if (!label || !needle) return;

    const normalized = clamp(state.pressure / 3, 0, 1);
    const angle = -34 + (normalized * 68);
    label.textContent = `Áp suất ${state.pressure.toFixed(1)} atm`;
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }

  function applyMaterial(material) {
    state.material = material;
    document.querySelectorAll('.material').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.material === material);
    });
  }

  function applyPhase(phase) {
    state.phase = phase;
    document.querySelectorAll('.phase').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.phase === phase);
    });

    const phaseMap = {
      solid: 0.65,
      liquid: 1,
      gas: 1.75
    };
    state.pressure = clamp(state.pressure * phaseMap[phase] || 1, 0.4, 3.2);
    updatePressureText();
  }

  function buildParticles() {
    const canvas = $('particles');
    const ctx = canvas && canvas.getContext('2d');
    if (!canvas || !ctx) return;

    const particles = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        r: 2 + Math.random() * 3,
        color: ['#7ad8ff', '#ffd166', '#7ef0b1', '#b18cff'][i % 4]
      });
    }
    state.particles = particles;
    return { canvas, ctx };
  }

  function drawParticles() {
    const canvas = $('particles');
    const ctx = canvas && canvas.getContext('2d');
    if (!canvas || !ctx || !state.particles.length) return;

    const phaseScale = {
      solid: 0.35,
      liquid: 0.75,
      gas: 1.4
    };
    const scale = phaseScale[state.phase] || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of state.particles) {
      p.x += p.vx * scale * (state.temp / 30);
      p.y += p.vy * scale * (state.temp / 30);

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = state.phase === 'gas' ? 0.9 : 0.75;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function animate() {
    if (state.playing) {
      const phaseSpeed = {
        solid: 0.12,
        liquid: 0.28,
        gas: 0.62
      };
      state.temp = clamp(state.temp + (Math.random() - 0.5) * 2.2 * (phaseSpeed[state.phase] || 0.2), 10, 120);
      updateTempText();
      drawParticles();
    }

    requestAnimationFrame(animate);
  }

  function setupBucketDrag() {
    const bucket = $('bucket');
    if (!bucket) return;

    let dragging = false;
    let startY = 0;
    let startBucket = 0;

    bucket.addEventListener('pointerdown', (event) => {
      dragging = true;
      bucket.setPointerCapture(event.pointerId);
      startY = event.clientY;
      startBucket = state.bucket;
    });

    bucket.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const delta = (startY - event.clientY) / 6;
      state.bucket = clamp(startBucket + delta, -100, 100);
      state.temp = clamp(22 + state.bucket * 0.75, 10, 120);
      updateTempText();
    });

    bucket.addEventListener('pointerup', () => {
      dragging = false;
    });

    bucket.addEventListener('pointerleave', () => {
      dragging = false;
    });
  }

  function bindButtons() {
    document.querySelectorAll('.material').forEach((button) => {
      button.addEventListener('click', () => applyMaterial(button.dataset.material));
    });

    document.querySelectorAll('.phase').forEach((button) => {
      button.addEventListener('click', () => applyPhase(button.dataset.phase));
    });

    document.querySelectorAll('[data-force]').forEach((button) => {
      button.addEventListener('click', () => {
        state.force = button.dataset.force;
        document.querySelectorAll('[data-force]').forEach((el) => {
          el.classList.toggle('active', el.dataset.force === state.force);
        });
      });
    });

    const playBtn = $('play');
    const pauseBtn = $('pause');
    const resetBtn = $('reset');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        state.playing = true;
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        state.playing = false;
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.temp = 22;
        state.pressure = 1;
        state.phase = 'solid';
        applyPhase('solid');
        applyMaterial('neon');
        updateTempText();
        updatePressureText();
      });
    }
  }

  function init() {
    applyMaterial('neon');
    applyPhase('solid');
    updateTempText();
    updatePressureText();
    buildParticles();
    bindButtons();
    setupBucketDrag();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
