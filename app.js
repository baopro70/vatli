(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const colors = {
    neon: '#2ddcff',
    argon: '#ff81a0',
    oxygen: '#ff7a3d',
    water: '#79a9ff'
  };

  const state = {
    material: 'neon',
    phase: 'solid',
    temperature: 22,
    pressure: 1,
    running: true,
    particles: []
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function getCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width || 320, height: rect.height || 300 };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticles() {
    const { width, height } = getCanvasSize();
    const count = 82;
    state.particles = Array.from({ length: count }, (_, index) => ({
      x: 18 + Math.random() * Math.max(20, width - 36),
      y: 18 + Math.random() * Math.max(20, height - 36),
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
      r: 3 + (index % 3),
      color: colors[state.material]
    }));
  }

  function updateLabels() {
    $('temperature').textContent = `${Math.round(state.temperature)} K`;
    $('pressureValue').textContent = `${state.pressure.toFixed(1)} atm`;
    $('heat').value = String(Math.round(state.temperature));
    $('pressure').value = String(state.pressure.toFixed(1));
    $('status').textContent = state.running ? 'Đang chạy' : 'Đã tạm dừng';
    $('playPause').textContent = state.running ? 'Ⅱ' : '▶';

    const piston = $('piston');
    if (piston) {
      const normalized = clamp((state.pressure - 0.4) / 3.6, 0, 1);
      piston.style.height = `${28 + normalized * 65}%`;
    }
  }

  function setMaterial(material) {
    state.material = material;
    document.querySelectorAll('[data-material]').forEach((button) => {
      button.classList.toggle('active', button.dataset.material === material);
    });
    state.particles.forEach((particle) => {
      particle.color = colors[material];
    });
  }

  function setPhase(phase) {
    state.phase = phase;
    document.querySelectorAll('[data-phase]').forEach((button) => {
      button.classList.toggle('active', button.dataset.phase === phase);
    });
  }

  function animate() {
    const { width, height } = getCanvasSize();
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const pressureFactor = clamp((state.pressure - 0.4) / 3.6, 0, 1);

    const speedMap = {
      solid: 0.24,
      liquid: 0.95,
      gas: 2.2
    };

    state.particles.forEach((particle) => {
      if (state.running) {
        const heatFactor = Math.max(0.35, state.temperature / 22);
        const speed = speedMap[state.phase] * heatFactor;

        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        if (state.phase === 'solid') {
          particle.x += (centerX - particle.x) * 0.022;
          particle.y += (centerY - particle.y) * 0.022;
        }

        if (pressureFactor > 0) {
          particle.x += (centerX - particle.x) * pressureFactor * 0.012;
          particle.y += (centerY - particle.y) * pressureFactor * 0.012;
        }

        if (particle.x < 8 || particle.x > width - 8) particle.vx *= -1;
        if (particle.y < 8 || particle.y > height - 8) particle.vy *= -1;

        particle.x = clamp(particle.x, 8, width - 8);
        particle.y = clamp(particle.y, 8, height - 8);
      }

      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }

  function bindEvents() {
    $('pressure').addEventListener('input', (event) => {
      state.pressure = clamp(Number(event.target.value), 0.4, 4);
      updateLabels();
    });

    $('heat').addEventListener('input', (event) => {
      state.temperature = clamp(Number(event.target.value), 10, 120);
      updateLabels();
    });

    document.querySelectorAll('[data-material]').forEach((button) => {
      button.addEventListener('click', () => setMaterial(button.dataset.material));
    });

    document.querySelectorAll('[data-phase]').forEach((button) => {
      button.addEventListener('click', () => setPhase(button.dataset.phase));
    });

    $('playPause').addEventListener('click', () => {
      state.running = !state.running;
      updateLabels();
    });

    $('reset').addEventListener('click', () => {
      state.temperature = 22;
      state.pressure = 1;
      state.phase = 'solid';
      state.running = true;
      setMaterial('neon');
      setPhase('solid');
      createParticles();
      updateLabels();
    });

    const heater = $('heater');
    let dragging = false;
    let startY = 0;
    let startTemp = state.temperature;

    heater.addEventListener('pointerdown', (event) => {
      dragging = true;
      startY = event.clientY;
      startTemp = state.temperature;
      heater.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    heater.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      state.temperature = clamp(startTemp + (startY - event.clientY) * 0.6, 10, 120);
      updateLabels();
      event.preventDefault();
    });

    const stopDragging = () => {
      dragging = false;
    };

    heater.addEventListener('pointerup', stopDragging);
    heater.addEventListener('pointercancel', stopDragging);
    heater.addEventListener('lostpointercapture', stopDragging);
    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  }

  function init() {
    resizeCanvas();
    createParticles();
    bindEvents();
    updateLabels();
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
