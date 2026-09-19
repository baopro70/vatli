const missions=[
{name:'Ổn định bình O₂',npc:'Mira · Kỹ sư hệ thống',room:'CREW QUARTERS',brief:'Bình oxy quá áp đang rung mạnh. Đóng van làm mát và xả áp theo đúng thứ tự.',steps:['MỞ VAN LÀM MÁT','XẢ ÁP SUẤT','KHÓA VAN AN TOÀN'],explain:'Giảm nhiệt độ rồi giảm số mol khí: P = nRT/V.',impact:[8,0],type:'sequence'},
{name:'Giải cứu khoang B',npc:'Jon · Phi hành gia',room:'AIRLOCK',brief:'Cửa cứu hộ bị kẹt. Dùng piston để tạo chênh lệch áp suất đẳng nhiệt.',steps:['BƠM PISTON'],explain:'Mỗi nhịp bơm làm thể tích giảm, nên áp suất tăng theo PV = hằng số.',impact:[-5,-12],type:'pump'},
{name:'Bịt rò rỉ oxy',npc:'Sana · Bác sĩ trưởng',room:'ENGINEERING',brief:'Ba điểm rò đang làm khoang mất oxy. Di chuyển công cụ hàn tới từng điểm và niêm phong chúng.',steps:['ĐIỂM RÒ A','ĐIỂM RÒ B','ĐIỂM RÒ C'],explain:'Cô lập khoang và bổ sung O₂ làm tăng số mol khí hữu dụng.',impact:[18,-8],type:'leak'},
{name:'Khởi động lõi Helios',npc:'Mira · Kỹ sư hệ thống',room:'REACTOR CORE',brief:'Lõi đang quá nóng. Thực hiện chuỗi thao tác: làm lạnh, mở thể tích đệm, rồi khóa áp suất.',steps:['BẬT LÀM LẠNH','MỞ THỂ TÍCH ĐỆM','KHÓA ÁP SUẤT'],explain:'P tỉ lệ với T/V: giảm T và tăng V đưa lõi về vùng an toàn.',impact:[0,-10],type:'sequence'}];
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),keys={},boards=[[145,135],[735,135],[180,405],[440,405]],npcs=[{x:90,y:150,name:'MIRA',color:'#ff5b5b'},{x:790,y:150,name:'JON',color:'#ffb84d'},{x:90,y:405,name:'SANA',color:'#b38cff'},{x:790,y:405,name:'MIRA',color:'#5fe6d2'}];let state,player,timer,stars=[],last=0,$=id=>document.getElementById(id);

function reset(){
  state={i:0,o:78,p:64,h:100,t:294,time:360,score:0,open:false,progress:0};
  player={x:440,y:270,walk:0,moving:false,dir:1,color:'#ff5959'};
  stars=Array.from({length:90},()=>({x:Math.random()*900,y:Math.random()*540,r:Math.random()*2}));
  clearInterval(timer);
  timer=setInterval(()=>{if(!state.open){state.time--;state.o-=.03;state.t+=.01;hud();if(state.time<1||state.o<1)end(false)}},1000);
  renderTasks();hud();
}

function hud(){
  [['oxygen','o'],['power','p'],['hull','h']].forEach(a=>{$(a[0]).textContent=Math.max(0,Math.round(state[a[1]]))+'%';$(a[0]+'Bar').style.width=Math.max(0,state[a[1]])+'%'});
  $('temp').textContent=Math.round(state.t)+' K';
  $('clock').textContent=String(Math.floor(Math.max(0,state.time)/60)).padStart(2,'0')+':'+String(Math.max(0,state.time)%60).padStart(2,'0');
}

function renderTasks(){
  $('count').textContent=`0${Math.min(state.i+1,4)} / 04`;
  $('tasks').innerHTML=missions.map((m,i)=>`<div class="task ${i===state.i?'active ':''}${i<state.i?'done':''}"><b>${i<state.i?'✓':'0'+(i+1)}</b>${m.name}<br><small>${m.npc}</small></div>`).join('');
}

function draw(){
  const now=performance.now();
  last=now;
  ctx.fillStyle='#071329';
  ctx.fillRect(0,0,900,540);
  stars.forEach(a=>{ctx.fillStyle='#6e91c7';ctx.fillRect(a.x,a.y,a.r,a.r)});
  ctx.strokeStyle='#203b68';ctx.lineWidth=3;ctx.strokeRect(25,25,850,490);
  ctx.fillStyle='#0c1e3e';ctx.fillRect(55,65,790,145);ctx.fillRect(55,285,790,170);
  ctx.fillStyle='#7893bc';ctx.font='11px monospace';
  ctx.fillText('CREW QUARTERS',75,90);ctx.fillText('AIRLOCK',735,90);ctx.fillText('ENGINEERING',75,310);ctx.fillText('REACTOR CORE',355,310);
  boards.forEach((b,i)=>drawBoard(b,i));
  npcs.forEach((n,i)=>drawCrewmate(n,i,false));
  drawCrewmate(player,-1,true);
  requestAnimationFrame(draw);
}

function drawBoard(b,i){
  ctx.save();
  ctx.fillStyle=i<state.i?'#65e6a2':i===state.i?'#ffc857':'#536c99';
  ctx.shadowBlur=i===state.i?18:0;ctx.shadowColor=ctx.fillStyle;
  ctx.fillRect(b[0]-18,b[1]-15,36,30);
  ctx.shadowBlur=0;
  ctx.fillStyle='#081329';ctx.font='12px monospace';ctx.fillText(i<state.i?'✓':i===state.i?'!':'—',b[0]-3,b[1]+4);
  ctx.restore();
}

function drawCrewmate(c,i,isPlayer){
  const moving=isPlayer?player.moving:false;
  const phase=isPlayer?player.walk*10:(performance.now()/180+i*3);
  const bob=moving?Math.sin(phase)*2:0;
  const foot=moving?Math.sin(phase)*5:0;
  const dir=isPlayer?player.dir:1;
  const bodyColor=isPlayer?player.color:(c.color||'#ff5959');
  const x=c.x,y=c.y+bob;

  ctx.save();
  ctx.translate(x,y);
  ctx.scale(dir,1);
  if(isPlayer&&moving) ctx.rotate(Math.sin(phase)*0.05);

  ctx.fillStyle='rgba(0,0,0,.25)';
  ctx.fillRect(-14,18,28,5);

  // backpack / body
  ctx.fillStyle='#0e1a2d';
  ctx.fillRect(-18,0,6,15);
  ctx.fillStyle=bodyColor;
  ctx.fillRect(-12,-8,24,24);
  ctx.fillStyle='#0d1a30';
  ctx.fillRect(-16,3,5,12);

  // visor / helmet
  ctx.fillStyle='#e6f4ff';
  ctx.fillRect(-9,-16,18,7);
  ctx.fillStyle='#3ed6ff';
  ctx.fillRect(-8,-15,16,5);
  ctx.fillStyle='#ffffff';
  ctx.fillRect(-4,-13,7,2);

  // arms
  ctx.fillStyle=bodyColor;
  ctx.fillRect(-15,0,5,12);
  ctx.fillRect(10,0,5,12);
  ctx.fillStyle='#0d1a30';
  ctx.fillRect(-17,11,7,3);
  ctx.fillRect(10,11,7,3);

  // legs
  ctx.fillStyle='#0d1a30';
  ctx.fillRect(-9,16,6,10+foot*0.8);
  ctx.fillRect(3,16,6,10-foot*0.8);
  ctx.fillStyle=bodyColor;
  ctx.fillRect(-12,22+foot*0.8,7,3);
  ctx.fillRect(5,22-foot*0.8,7,3);

  // small body contour for pixel look
  ctx.fillStyle='rgba(255,255,255,0.12)';
  ctx.fillRect(-9,-1,15,4);

  if(!isPlayer){
    ctx.fillStyle='#d8e7ff';
    ctx.font='9px monospace';
    ctx.fillText(c.name,-18,-28);
  }

  ctx.restore();
}

function move(){
  let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
  player.moving=!!(dx||dy);
  if(player.moving){
    let n=Math.hypot(dx,dy);
    player.x=Math.max(45,Math.min(855,player.x+dx/n*3));
    player.y=Math.max(48,Math.min(485,player.y+dy/n*3));
    if(dx) player.dir=dx;
  }
  player.walk += player.moving ? 0.08 : 0;

  let b=boards[state.i],n=npcs[state.i],near=Math.hypot(player.x-b[0],player.y-b[1])<65,nearNpc=Math.hypot(player.x-n.x,player.y-n.y)<65;
  $('hint').textContent=near||nearNpc?'Tương tác với NPC / bảng nhiệm vụ — nhấn E để hành động.':'WASD / phím mũi tên: di chuyển · Tìm NPC và bảng vàng';
  if((near||nearNpc)&&keys.e&&!state.open) openTask();
}

function openTask(){
  state.open=true;let m=missions[state.i];
  $('modalKicker').textContent='NPC COMMUNICATION · '+m.npc;
  $('title').textContent=m.name;$('desc').textContent=m.brief;
  $('actionArea').innerHTML=`<div class="action-box"><h2>THỰC HIỆN NHIỆM VỤ — ${m.room}</h2><p>Không có trắc nghiệm. Hãy thao tác trực tiếp với hệ thống:</p><div id="actionButtons"></div><div class="meter"><i id="actionMeter"></i></div><div id="feedback" class="feedback"></div></div>`;
  renderActions(m);$('modal').classList.remove('off');
}

function renderActions(m){
  let box=$('actionButtons');
  if(m.type==='pump') box.innerHTML='<button class="action-btn" id="pump">BƠM PISTON <b>0 / 5</b></button>';
  else box.innerHTML=m.steps.map((s,i)=>`<button class="action-btn ${m.type==='leak'?'leak':'sequence'}" data-step="${i}">${i+1}. ${s}</button>`).join('');
  document.querySelectorAll('.sequence').forEach(b=>b.onclick=()=>sequence(+b.dataset.step,m));
  document.querySelectorAll('.leak').forEach(b=>b.onclick=()=>leak(+b.dataset.step,m));
  if(m.type==='pump') $('pump').onclick=()=>{state.progress++;$('pump').innerHTML=`BƠM PISTON <b>${state.progress} / 5</b>`;$('actionMeter').style.width=state.progress*20+'%';if(state.progress>=5)complete(m)};
}

function sequence(i,m){
  if(i!==state.progress){$('feedback').textContent='Thứ tự chưa đúng. Kiểm tra bảng điều khiển và thử lại.';state.h-=4;hud();return;}
  document.querySelectorAll('.sequence')[i].classList.add('done');
  state.progress++;$('actionMeter').style.width=state.progress/m.steps.length*100+'%';
  if(state.progress===m.steps.length) complete(m);
}

function leak(i,m){
  let b=document.querySelectorAll('.leak')[i];if(b.disabled)return;b.disabled=true;b.classList.add('done');
  state.progress++;$('actionMeter').style.width=state.progress/3*100+'%';
  if(state.progress===3) complete(m);
}

function complete(m){
  state.score+=250;state.o+=m.impact[0];state.p+=m.impact[1];
  $('feedback').innerHTML=`✓ <b>HOÀN TẤT.</b> ${m.explain}<button class="next" id="next">TIẾP TỤC →</button>`;
  $('next').onclick=()=>{state.open=false;$('modal').classList.add('off');state.i++;state.progress=0;if(state.i===missions.length)end(true);else{renderTasks();$('crewStatus').textContent='Nhiệm vụ mới đã được ghi vào quest log.'}};
  hud();
}

function end(win){
  clearInterval(timer);state.open=true;
  $('endTitle').textContent=win?'TRẠM ĐÃ ĐƯỢC ỔN ĐỊNH':'TÍN HIỆU HELIOS ĐÃ MẤT';
  $('endText').textContent=win?'Bạn đã hoàn thành mọi quest bằng hành động thực tế.':'Thân trạm mất ổn định. Hãy thử lại và thao tác cẩn thận hơn.';
  $('score').textContent='FINAL SCORE: '+state.score;
  $('end').classList.remove('off');
}

addEventListener('keydown',e=>{keys[e.key]=1;if(e.key==='e')e.preventDefault();});
addEventListener('keyup',e=>keys[e.key]=0);
$('reset').onclick=reset;$('again').onclick=()=>{$('end').classList.add('off');reset()};
$('close').onclick=()=>{state.open=false;$('modal').classList.add('off')};
setInterval(move,16);reset();draw();
