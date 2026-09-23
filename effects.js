(function () {
  const fx = document.getElementById('fx');
  if (!fx) return;

  const ctx = fx.getContext('2d');
  const parts = [];

  function burst(x, y, color, amount = 18) {
    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      parts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      });
    }
  }

  function draw() {
    const w = fx.width || 1;
    const h = fx.height || 1;
    ctx.clearRect(0, 0, w, h);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;

      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!target || !(target instanceof HTMLElement)) return;

    if (target.matches('.action-btn, #pump, .next')) {
      const rect = fx.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * fx.width;
      const y = ((event.clientY - rect.top) / rect.height) * fx.height;
      burst(x, y, '#5ee6d2', 20);
    }
  });

  draw();
})();
