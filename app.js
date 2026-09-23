(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const s = { temp:22, pressure:1, phase:'solid', material:'neon', force:'attract', running:true, particles:[], drag:null };
  const colors = { neon:'#2ddcff', argon:'#ff81a0', oxygen:'#ff6a2d', water:'#9ec7ff' };
  const phaseSpeed = { solid:.12, liquid:.48, gas:1.15 };
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

  function render(){
    $('temp').textContent = `${Math.round(s.temp)} K`;
    $('thermoFill').style.height = `${clamp((s.temp-10)/110*100,4,100)}%`;
    $('pressureText').textContent = `Áp suất ${s.pressure.toFixed(1)} atm`;
    $('gaugeNeedle').style.transform = `translateX(-50%) rotate(${-55+(s.pressure/4)*110}deg)`;
    $('chamber').style.setProperty('--pressure', s.pressure);
    document.body.style.setProperty('--particle-color', colors[s.material]);
  }
  function setPhase(phase){
    s.phase=phase;
    document.querySelectorAll('.phase').forEach(b=>b.classList.toggle('active',b.dataset.phase===phase));
    if(phase==='solid') s.pressure=clamp(s.pressure*.82,.4,4);
    if(phase==='gas') s.pressure=clamp(s.pressure*1.35,.4,4);
    render();
  }
  function setView(view){
    ['status','phase','interaction'].forEach(v=>$(`${v}Panel`).classList.toggle('hidden',v!==view));
    document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  }
  function makeParticles(){
    s.particles=Array.from({length:95},(_,i)=>({x:Math.random()*350+5,y:Math.random()*405+8,vx:(Math.random()-.5)*1.4,vy:(Math.random()-.5)*1.4,r:2+Math.random()*2.5,c:i%3?colors[s.material]:'#ffd166'}));
  }
  function draw(){
    const c=$('particles'),x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height);
    const compact=clamp((s.pressure-1)/3,0,1), speed=phaseSpeed[s.phase]*(s.temp/30);
    s.particles.forEach(p=>{
      if(s.running){
        if(s.phase==='solid'){p.x=175+(p.x-175)*.999;p.y=205+(p.y-205)*.999;}
        else {p.x+=p.vx*speed;p.y+=p.vy*speed;}
        if(p.x<3||p.x>357)p.vx*=-1;if(p.y<3||p.y>417)p.vy*=-1;
        if(compact){p.x=180+(p.x-180)*(1-compact*.012);p.y=210+(p.y-210)*(1-compact*.012);}
      }
      x.beginPath();x.fillStyle=p.c;x.globalAlpha=.85;x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill();
    }); x.globalAlpha=1; requestAnimationFrame(draw);
  }
  function pressureFromPointer(clientY){
    const r=$('pistonControl').getBoundingClientRect();
    const ratio=clamp((clientY-r.top)/r.height,0,1);
    s.pressure=+(4-ratio*3.6).toFixed(1);
    s.temp=clamp(s.temp+(s.pressure-1)*.025,10,120); render();
  }
  function bind(){
    document.querySelectorAll('.material').forEach(b=>b.addEventListener('click',()=>{s.material=b.dataset.material;document.querySelectorAll('.material').forEach(x=>x.classList.toggle('active',x===b));s.particles.forEach(p=>p.c=Math.random()<.25?'#ffd166':colors[s.material]);render();}));
    document.querySelectorAll('.phase').forEach(b=>b.addEventListener('click',()=>setPhase(b.dataset.phase)));
    document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
    document.querySelectorAll('.force').forEach(b=>b.addEventListener('click',()=>{s.force=b.dataset.force;document.querySelectorAll('.force').forEach(x=>x.classList.toggle('active',x===b));$('forceText').textContent=s.force==='attract'?'Các hạt hút nhau.':'Các hạt đẩy nhau.';}));
    $('play').addEventListener('click',()=>s.running=true);$('pause').addEventListener('click',()=>s.running=false);
    $('reset').addEventListener('click',()=>{s.temp=22;s.pressure=1;s.phase='solid';s.running=true;setPhase('solid');render();});
    const pc=$('pistonControl'), ph=$('pistonHandle');
    const start=e=>{s.drag=e.pointerId;ph.setPointerCapture(e.pointerId);pressureFromPointer(e.clientY);e.preventDefault();};
    pc.addEventListener('pointerdown',start,{passive:false}); pc.addEventListener('pointermove',e=>{if(s.drag===e.pointerId){pressureFromPointer(e.clientY);e.preventDefault();}},{passive:false});
    ['pointerup','pointercancel','lostpointercapture'].forEach(t=>pc.addEventListener(t,()=>s.drag=null));
    const bucket=$('bucket'); let by=null,bt=0; bucket.addEventListener('pointerdown',e=>{by=e.clientY;bt=s.temp;bucket.setPointerCapture(e.pointerId);e.preventDefault();},{passive:false}); bucket.addEventListener('pointermove',e=>{if(by===null)return;s.temp=clamp(bt+(by-e.clientY)*.65,10,120);render();},{passive:false}); ['pointerup','pointercancel','lostpointercapture'].forEach(t=>bucket.addEventListener(t,()=>by=null));
  }
  function init(){makeParticles();bind();render();draw();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
