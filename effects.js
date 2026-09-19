/* Visible mission animation and generated SFX. Loaded after app.js. */
(function(){
  const FX={ctx:null,master:null,parts:[],flash:0,shake:0};
  const $=id=>document.getElementById(id);
  function setup(){
    const world=$('world'), fx=$('fx');
    if(!world||!fx)return;
    fx.style.position='absolute';fx.style.inset='0';fx.style.width='100%';fx.style.height='100%';fx.style.pointerEvents='none';fx.style.imageRendering='pixelated';
    const wrap=world.parentElement; if(wrap) wrap.style.position='relative';
    requestAnimationFrame(loop);
  }
  function audio(){
    if(FX.ctx)return;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    FX.ctx=new AC();FX.master=FX.ctx.createGain();FX.master.gain.value=.16;FX.master.connect(FX.ctx.destination);
  }
  function tone(f,d=.12,type='sine',gain=.08,slide=0){
    audio();if(!FX.ctx)return;if(FX.ctx.state==='suspended')FX.ctx.resume();
    const o=FX.ctx.createOscillator(),g=FX.ctx.createGain(),t=FX.ctx.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(Math.max(35,f+slide),t+d);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(FX.master);o.start(t);o.stop(t+d+.02);
  }
  function sound(kind){
    if(kind==='pump'){tone(95,.16,'square',.09,90);setTimeout(()=>tone(55,.1,'square',.05,-15),70)}
    if(kind==='weld'){tone(170,.28,'sawtooth',.08,300);tone(950,.08,'square',.025,-350)}
    if(kind==='cool'){tone(370,.55,'sine',.06,-210)}
    if(kind==='ui')tone(540,.08,'triangle',.05,100);
    if(kind==='success'){tone(440,.12,'triangle',.07,120);setTimeout(()=>tone(660,.2,'triangle',.07,160),110)}
    if(kind==='fail'){tone(180,.3,'sawtooth',.1,-120);setTimeout(()=>tone(75,.4,'square',.07,-20),130)}
  }
  function burst(x,y,color,n=18){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*4;FX.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,color})}}
  function position(kind){const map={pressure:[145,135,'#ff5959'],pump:[735,135,'#5fe6d2'],leak:[180,405,'#ffb84d'],core:[440,405,'#b38cff']};return map[kind]||[450,270,'#55e6e0']}
  function animate(kind){const fx=$('fx');if(!fx)return;const [x,y,color]=position(kind);burst(x,y,color,kind==='leak'?28:20);fx.classList.remove('mission-flash');void fx.offsetWidth;fx.classList.add('mission-flash');sound(kind==='pressure'?'cool':kind);}
  function loop(){
    const fx=$('fx');if(fx){const q=fx.getContext('2d'),w=fx.clientWidth,h=fx.clientHeight,d=devicePixelRatio||1;if(fx.width!==Math.floor(w*d)||fx.height!==Math.floor(h*d)){fx.width=Math.floor(w*d);fx.height=Math.floor(h*d)}q.setTransform(d,0,0,d,0,0);q.clearRect(0,0,w,h);FX.parts=FX.parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=.025;q.globalAlpha=Math.max(0,p.life);q.fillStyle=p.color;q.fillRect(p.x,p.y,4,4);return p.life>0});q.globalAlpha=1}requestAnimationFrame(loop);
  }
  document.addEventListener('pointerdown',e=>{
    const el=e.target;if(!el.matches('.action-btn,#pump,.next'))return;
    audio();sound('ui');
    if(el.id==='pump'){animate('pump');el.classList.add('action-pressed');setTimeout(()=>el.classList.remove('action-pressed'),180)}
    else if(el.classList.contains('weld')){animate('leak');el.classList.add('welding');setTimeout(()=>el.classList.remove('welding'),1000)}
    else if(el.id==='cool'){animate('pressure');el.classList.add('cooling');setTimeout(()=>el.classList.remove('cooling'),600)}
    else if(el.classList.contains('core')){animate('core');el.classList.add('core-pulse');setTimeout(()=>el.classList.remove('core-pulse'),500)}
  });
  const observer=new MutationObserver(()=>{const f=$('feedback');if(!f)return;const text=f.textContent||'';if(text.includes('HỆ THỐNG ỔN ĐỊNH')){sound('success');animate('core')}if(text.includes('⚠')){sound('fail');const fx=$('fx');if(fx)fx.classList.add('mission-fail')}});observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.addEventListener('load',setup);if(document.readyState!=='loading')setup();
})();
