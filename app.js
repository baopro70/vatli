const canvas = document.querySelector('#particles');
const ctx = canvas.getContext('2d');
const chamber = document.querySelector('#chamber');
const glass = document.querySelector('.glass');
const lid = document.querySelector('#lid');
const torch = document.querySelector('#torch');
const temperature = document.querySelector('#temperature');
const fill = document.querySelector('#thermometer-fill');

let state = 'solid';
let material = 'neon';
let running = true;
let particles = [];
let temp = 14;
let volume = 100;
let collisions = 0;
let drag = null;

const colors = {
  neon: '#23e6ee',
  argon: '#ffa0a6',
  oxygen: '#ff5b10',
  water: '#ffffff'
};

const defaults = { solid: 90, liquid: 90, gas: 65 };

function makeParticle(i) {
  const p = {
    x: 15 + Math.random() * 330,
    y: 15 + Math.random() * 360,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    r: state === 'gas' ? 4 : 6
  };

  if (state === 'solid') {
    p.x = 55 + (i % 10) * 27 + (Math.random() - 0.5) * 4;
    p.y = 320 + Math.floor(i / 10) * 19 + (Math.random() - 0.5) * 3;
    p.vx = 0;
    p.vy = 0;
  }

  return p;
}

function renderStats() {
  document.querySelector('#particle-count').textContent = particles.length;
  document.querySelector('#collision-count').textContent = collisions;
}

function resetParticles() {
  particles = Array.from({ length: defaults[state] }, (_, i) => makeParticle(i));
  collisions = 0;
  renderStats();
}

function updateThermometer() {
  temperature.textContent = temp + ' K';
  fill.style.height = Math.min(100, 20 + temp * 0.72) + '%';
}

function setState(next) {
  state = next;
  document.querySelectorAll('.state').forEach((b) => {
    b.classList.toggle('active', b.dataset.state === state);
  });

  if (next === 'solid') temp = Math.min(temp, 24);
  if (next === 'liquid') temp = Math.max(30, Math.min(temp, 64));
  if (next === 'gas') temp = Math.max(70, temp);

  updateThermometer();
  resetParticles();
}

function applyVolume() {
  const scale = volume / 100;
  glass.style.transform = `scaleY(${scale})`;
  glass.style.height = `${100 / scale}%`;
  lid.style.top = `${22 + (100 - volume) * 1.05}px`;
}

function setVolume(value) {
  volume = Math.max(55, Math.min(125, value));
  applyVolume();
}

function addHeat(amount) {
  temp = Math.max(5, Math.min(120, temp + amount));
  if (temp < 25 && state !== 'solid') setState('solid');
  else if (temp >= 25 && temp < 65 && state !== 'liquid') setState('liquid');
  else if (temp >= 65 && state !== 'gas') setState('gas');
  updateThermometer();
}

function update() {
  const speed = Math.max(0.08, temp / 30) * (volume / 100);

  particles.forEach((p) => {
    if (state === 'solid') {
      p.x += Math.sin(Date.now() / 180 + p.y) * 0.08;
      p.y += Math.cos(Date.now() / 200 + p.x) * 0.08;
      return;
    }

    p.vx += (Math.random() - 0.5) * 0.12 * speed;
    p.vy += (Math.random() - 0.5) * 0.12 * speed;
    p.x += p.vx * speed;
    p.y += p.vy * speed;

    if (state === 'liquid' && p.y > 355 * (volume / 100)) p.vy -= 0.35;

    if (p.x < 15 || p.x > 345) {
      p.vx *= -1;
      collisions++;
    }

    if (p.y < 15 || p.y > 375 * (volume / 100)) {
      p.vy *= -1;
      collisions++;
    }

    p.x = Math.max(15, Math.min(345, p.x));
    p.y = Math.max(15, Math.min(375 * (volume / 100), p.y));
  });

  renderStats();
}

function draw() {
  ctx.clearRect(0, 0, 360, 390);
  ctx.shadowBlur = 10;
  ctx.shadowColor = colors[material];

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = colors[material];
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

function loop() {
  if (running) update();
  draw();
  requestAnimationFrame(loop);
}

function pointerStart(e, type) {
  e.preventDefault();
  const point = e.touches ? e.touches[0] : e;
  drag = { type, startX: point.clientX, startY: point.clientY };

  if (e.target && e.target.setPointerCapture) {
    e.target.setPointerCapture(e.pointerId);
  }
}

function pointerMove(e) {
  if (!drag) return;

  const point = e.touches ? e.touches[0] : e;
  const dx = point.clientX - drag.startX;
  const dy = point.clientY - drag.startY;

  if (drag.type === 'torch') {
    const nextX = torch.offsetLeft + dx;
    const nextY = torch.offsetTop + dy;
    torch.style.left = Math.max(12, Math.min(window.innerWidth - 120, nextX)) + 'px';
    torch.style.top = Math.max(130, Math.min(window.innerHeight - 220, nextY)) + 'px';
    drag.startX = point.clientX;
    drag.startY = point.clientY;

    const chamberRect = chamber.getBoundingClientRect();
    const torchRect = torch.getBoundingClientRect();
    const near = torchRect.top < chamberRect.bottom && torchRect.bottom > chamberRect.top + 60;

    torch.classList.toggle('heating', near);
    if (near) addHeat(0.8);
  }

  if (drag.type === 'lid') {
    const current = parseFloat(lid.style.top || '22px');
    const next = Math.min(80, Math.max(20, current + dy * 0.65));
    lid.style.top = next + 'px';
    const normalized = 100 - ((next - 20) / 60) * 100;
    setVolume(Math.max(55, Math.min(125, normalized)));
    drag.startY = point.clientY;
  }
}

function pointerEnd() {
  drag = null;
  torch.classList.remove('heating');
}

['pointerdown', 'touchstart'].forEach((ev) => {
  torch.addEventListener(ev, (e) => pointerStart(e, 'torch'), { passive: false });
  lid.addEventListener(ev, (e) => pointerStart(e, 'lid'), { passive: false });
});

['pointermove', 'touchmove'].forEach((ev) => {
  document.addEventListener(ev, pointerMove, { passive: false });
});

['pointerup', 'touchend', 'pointercancel'].forEach((ev) => {
  document.addEventListener(ev, pointerEnd);
});

document.querySelectorAll('.state').forEach((b) => {
  b.onclick = () => setState(b.dataset.state);
});

document.querySelectorAll('.material').forEach((b) => {
  b.onclick = () => {
    material = b.dataset.material;
    document.querySelectorAll('.material').forEach((x) => x.classList.toggle('selected', x === b));
  };
});

document.querySelector('#pause').onclick = () => (running = false);
document.querySelector('#play').onclick = () => (running = true);
document.querySelector('#reset').onclick = () => {
  state = 'solid';
  material = 'neon';
  temp = 14;
  volume = 100;
  document.querySelectorAll('.material').forEach((x) => x.classList.toggle('selected', x.dataset.material === 'neon'));
  setState('solid');
  applyVolume();
};

canvas.addEventListener('pointerdown', (e) => {
  if (state === 'solid') return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * canvas.width / rect.width;
  const y = (e.clientY - rect.top) * canvas.height / rect.height;

  for (let i = 0; i < 3; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      r: 4
    });
  }
  renderStats();
});

setState('solid');
applyVolume();
resetParticles();
loop();
