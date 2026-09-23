const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const tempBox = document.getElementById('tempBox');
const thermoFluid = document.getElementById('thermoFluid');
const phaseButtons = document.querySelectorAll('.phase');
const materialButtons = document.querySelectorAll('.material-item');
const pumpHandle = document.getElementById('pumpHandle');
const heatHandle = document.getElementById('heatHandle');

let phase = 'solid';
let material = 'neon';
let temperature = 22;
let pressure = 1;
let isRunning = true;
let particles = [];
let dragType = null;

const colors = {
  neon: '#39d7ff',
  argon: '#ff7d9a',
  oxygen: '#ff6b2d',
  water: '#89d2ff'
};

function buildParticles() {
  const count = phase === 'solid' ? 130 : phase === 'liquid' ? 118 : 110;
  particles = [];
  for (let i = 0; i < count; i++) {
    const particle = {
      x: 30 + Math.random() * 300,
      y: 30 + Math.random() * 330,
      r: phase === 'gas' ? 4 : 6,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1
    };
    if (phase === 'solid') {
      particle.x = 50 + (i % 10) * 26 + (Math.random() - 0.5) * 4;
      particle.y = 250 + Math.floor(i / 10) * 18 + (Math.random() - 0.5) * 3;
      particle.vx = 0;
      particle.vy = 0;
    }
    particles.push(particle);
  }
}

function updateTemperatureDisplay() {
  tempBox.textContent = `${temperature} K`;
  thermoFluid.style.height = `${20 + (temperature / 120) * 75}%`;
}

function setPhase(next) {
  phase = next;
  phaseButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.phase === phase));
  if (phase === 'solid') temperature = Math.min(temperature, 30);
  if (phase === 'liquid') temperature = Math.max(26, Math.min(temperature, 80));
  if (phase === 'gas') temperature = Math.max(70, temperature);
  updateTemperatureDisplay();
  buildParticles();
}

function setMaterial(next) {
  material = next;
  materialButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.material === material));
}

function updatePumpVisual() {
  const deg = -26 + (pressure - 1) * 18;
  pumpHandle.style.transform = `rotate(${deg}deg)`;
}

function updateParticles() {
  const speed = phase === 'solid' ? 0.18 : phase === 'liquid' ? 0.7 : 1.2;
  const scale = 0.75 + (pressure - 1) * 0.35;

  particles.forEach(p => {
    if (phase === 'solid') {
      p.x += Math.sin(Date.now() / 270 + p.y) * 0.10;
      p.y += Math.cos(Date.now() / 240 + p.x) * 0.08;
      return;
    }

    p.vx += (Math.random() - 0.5) * 0.12 * speed;
    p.vy += (Math.random() - 0.5) * 0.12 * speed;
    p.x += p.vx * speed * scale;
    p.y += p.vy * speed * scale;

    if (p.x < 12 || p.x > 348) p.vx *= -1;
    if (p.y < 12 || p.y > 400) p.vy *= -1;

    p.x = Math.max(12, Math.min(348, p.x));
    p.y = Math.max(12, Math.min(400, p.y));
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 12;
  ctx.shadowColor = colors[material];
  particles.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = colors[material];
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function animate() {
  if (isRunning) updateParticles();
  drawParticles();
  requestAnimationFrame(animate);
}

function handleHeatMove(dx, dy) {
  const near = Math.abs(dy) > 10;
  if (near) {
    if (dy < 0) temperature = Math.min(120, temperature + 1.2);
    else temperature = Math.max(5, temperature - 0.6);
    if (temperature < 25) setPhase('solid');
    else if (temperature < 65) setPhase('liquid');
    else setPhase('gas');
    updateTemperatureDisplay();
  }
}

function startDrag(type, event) {
  dragType = type;
  event.preventDefault();
}

function moveDrag(event) {
  if (!dragType) return;
  const pointer = event.touches ? event.touches[0] : event;

  if (dragType === 'heat') {
    const rect = document.querySelector('.heat-pad').getBoundingClientRect();
    const y = pointer.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, y / rect.height));
    temperature = 5 + ratio * 115;
    if (temperature < 25) setPhase('solid');
    else if (temperature < 65) setPhase('liquid');
    else setPhase('gas');
    updateTemperatureDisplay();
    const handleY = Math.max(0, Math.min(150, ratio * 150));
    heatHandle.style.top = `${handleY}px`;
  }

  if (dragType === 'pump') {
    const rect = document.querySelector('.pump-wrap').getBoundingClientRect();
    const dx = pointer.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, dx / rect.width));
    pressure = 1 + ratio * 1.8;
    updatePumpVisual();
  }
}

function endDrag() {
  dragType = null;
}

phaseButtons.forEach(btn => btn.addEventListener('click', () => setPhase(btn.dataset.phase)));
materialButtons.forEach(btn => btn.addEventListener('click', () => setMaterial(btn.dataset.material)));

document.getElementById('playBtn').addEventListener('click', () => { isRunning = true; });
document.getElementById('pauseBtn').addEventListener('click', () => { isRunning = false; });

document.getElementById('heatPad').addEventListener('pointerdown', (e) => startDrag('heat', e));
document.getElementById('pumpHandle').addEventListener('pointerdown', (e) => startDrag('pump', e));
window.addEventListener('pointermove', moveDrag);
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);
window.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('touchend', endDrag);

setPhase('solid');
setMaterial('neon');
updatePumpVisual();
updateTemperatureDisplay();
buildParticles();
animate();
