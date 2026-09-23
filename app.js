(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('particles');
  const ctx = canvas.getContext('2d');
  const state = { material:'neon', phase:'solid', temp:22, pressure:1, running:true, particles:[], heatDrag:false, last:0 };
  const palette = { neon:'#28a9e0', argon:'#d34f8f', oxygen:'#ef6b43', water:'#3f78d0' };
  const phaseData = { solid:{speed:.22,spread:.16}, liquid:{speed:1.1,spread:.55}, gas:{speed:2.5,spread:1.2} };
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  function resize(){ const r=canvas.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2); canvas.width=Math.max(1,Math.round(r.width*d)); canvas.height=Math.max(1,Math.round(r.height*d)); ctx.setTransform(d,0,0,d,0,0); }
  function bounds(){ const r=canvas.getBoundingClientRect(); return {w:r.width,h:r.height}; }
  function makeParticles(){ const {w,h}=bounds(); state.particles=Array.from({length:90},(_,i)=>({x:20+Math.random()*Math.max(20,w-40),y:20+Math.random()*Math.max(20,h-40),vx:(Math.random()-.5),vy:(Math.random()-.5),r:4+(i%3),color:palette[state.material]})); }
  function updateLabels(){ $('temperature').textContent=`${Math.round(state.temp)} K`; $('pressureValue').textContent=`${state.pressure.toFixed(1)} atm`; $('heat').value=state.temp; $('pressure').value=state.pressure; $('status').textContent=state.running?'Đang chạy':'Đã tạm dừng'; $('piston').style.height=`${30+state.pressure/4*58}%`; }
  function setMaterial(v){ state.material=v; document.querySelectorAll('[data-material]').forEach(b=>b.classList.toggle('active',b.dataset.material===v)); state.particles.forEach(p=>p.color=palette[v]); }
  function setPhase(v){ state.phase=v; document.querySelectorAll('[data-phase]').forEach(b=>b.classList.toggle('active',b.dataset.phase===v)); if(v==='solid') state.temp=Math.min(state.temp,35); if(v==='gas') state.temp=Math.max(state.temp,70); updateLabels(); }
  function draw(time){ const {w,h}=bounds(); const dt=Math.min((time-state.last)/16.67||1,3); state.last=time; ctx.clearRect(0,0,w,h); const cfg=phaseData[state.phase]; const compact=clamp((state.pressure-0.4)/3.6,0,1); const cx=w/2, cy=h/2; const targetSpread=(1-compact)*cfg.spread;
    for(const p of state.particles){ if(state.running){ if(state.phase==='solid'){p.x+=(cx+(p.x-cx)*targetSpread-p.x)*.09*dt; p.y+=(cy+(p.y-cy)*targetSpread-p.y)*.09*dt; p.x+=Math.sin(time/400+p.r)*.18*dt; p.y+=Math.cos(time/500+p.r)*.18*dt;} else {p.x+=p.vx*cfg.speed*(state.temp/22)*dt; p.y+=p.vy*cfg.speed*(state.temp/22)*dt; if(state.force==='repel'){p.x+=(p.x-cx)*.0008*dt;p.y+=(p.y-cy)*.0008*dt;} if(state.phase==='liquid'){p.x+=(cx-p.x)*.001*dt;p.y+=(cy-p.y)*.001*dt;} } if(p.x<5||p.x>w-5)p.vx*=-1;if(p.y<5||p.y>h-5)p.vy*=-1; }
      ctx.beginPath();ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    } requestAnimationFrame(draw); }
  function setPressure(v){ state.pressure=clamp(+v,.4,4); updateLabels(); }
  function bind(){
    $('pressure').addEventListener('input',e=>setPressure(e.target.value)); $('heat').addEventListener('input',e=>{state.temp=+e.target.value;updateLabels();});
    document.querySelectorAll('[data-material]').forEach(b=>b.addEventListener('click',()=>setMaterial(b.dataset.material))); document.querySelectorAll('[data-phase]').forEach(b=>b.addEventListener('click',()=>setPhase(b.dataset.phase)));
    $('playPause').addEventListener('click',()=>{state.running=!state.running;$('playPause').textContent=state.running?'Ⅱ':'▶';updateLabels();});
    $('reset').addEventListener('click',()=>{state.temp=22;state.pressure=1;state.phase='solid';state.running=true;$('playPause').textContent='Ⅱ';setMaterial('neon');setPhase('solid');makeParticles();updateLabels();});
    const heater=$('heater'); let startY=0,startT=0,drag=false; const start=e=>{drag=true;startY=e.clientY;startT=state.temp;heater.setPointerCapture?.(e.pointerId);e.preventDefault();}; const move=e=>{if(!drag)return;state.temp=clamp(startT+(startY-e.clientY)*.6,10,120);updateLabels();e.preventDefault();}; const stop=()=>drag=false; heater.addEventListener('pointerdown',start,{passive:false});heater.addEventListener('pointermove',move,{passive:false});heater.addEventListener('pointerup',stop);heater.addEventListener('pointercancel',stop);
    window.addEventListener('resize',()=>{resize();makeParticles();});
  }
  function init(){ resize();makeParticles();bind();updateLabels();requestAnimationFrame(draw); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
