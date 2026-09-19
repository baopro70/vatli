const $=id=>document.getElementById(id);
const INITIAL={temperature:486,pressure:2.8,oxygen:78};
let state={};let coolingTimer=null;let ventTimer=null;
function resetQuest(){
  clearInterval(coolingTimer);clearInterval(ventTimer);
  state={temperature:INITIAL.temperature,pressure:INITIAL.pressure,oxygen:INITIAL.oxygen,phase:1,failed:false,completed:false,cooling:false,venting:false};
  ['isolateBtn','coolBtn','ventBtn'].forEach(id=>$(id).disabled=false);
  $('coolBtn').disabled=true;$('ventBtn').disabled=true;
  ['isolateBtn','coolBtn','ventBtn'].forEach(id=>$(id).classList.remove('done','unlocked'));
  $('isolateStatus').textContent='READY';$('coolStatus').textContent='LOCKED';$('ventStatus').textContent='LOCKED';
  $('feedback').className='feedback';$('feedback').innerHTML='<span class="feedback-led"></span> Đọc thông số trước khi thao tác. Quy trình bắt đầu bằng việc cô lập bình.';
  $('systemState').textContent='QUEST ACTIVE';$('phaseLabel').textContent='PHASE 1 · ISOLATION';$('warning').textContent='⚠ PRESSURE VESSEL UNSTABLE';
  updateUI();updateSteps();
}
function updateUI(){
  $('tempValue').textContent=Math.ceil(state.temperature);$('pressureValue').textContent=state.pressure.toFixed(2);$('oxygenValue').textContent=Math.round(state.oxygen)+'%';$('oxygenBar').style.width=Math.min(100,state.oxygen)+'%';
  const tempPercent=Math.max(0,Math.min(100,(state.temperature-300)/(486-300)*100));const pressurePercent=Math.max(0,Math.min(100,(state.pressure-1)/(2.8-1)*100));
  $('tempBar').style.width=tempPercent+'%';$('pressureBar').style.width=pressurePercent+'%';$('tankFill').style.height=Math.max(20,pressurePercent)+'%';
  $('tempCard').classList.toggle('safe',state.temperature<=300);$('pressureCard').classList.toggle('safe',state.pressure<=1);$('warning').style.color=state.temperature<=300&&state.pressure<=1?'var(--green)':'var(--red)';
}
function updateSteps(){for(let i=1;i<=3;i++)$('stepIndicator'+i).className='step '+(state.phase===i?'active ':'')+(state.phase>i?'done':'')}
function error(message){
  if(state.failed||state.completed)return;state.failed=true;clearInterval(coolingTimer);clearInterval(ventTimer);state.temperature=Math.min(650,state.temperature+45);state.pressure=Math.min(4.5,state.pressure+.65);updateUI();
  $('feedback').className='feedback error';$('feedback').innerHTML='⚠ <b>THAO TÁC SAI! MẤT KIỂM SOÁT NHIỆM VỤ.</b><br>'+message+'<br>Thông số tăng vọt. Hệ thống đang bắt đầu lại.';
  $('systemState').textContent='MISSION FAILED';$('phaseLabel').textContent='EMERGENCY RESET';$('warning').textContent='⚠ CONTAINMENT FAILURE';
  ['isolateBtn','coolBtn','ventBtn'].forEach(id=>$(id).disabled=true);
  setTimeout(resetQuest,1800);
}
function isolate(){
  if(state.phase!==1)return error('Phải thực hiện đúng thứ tự: cô lập bình là bước đầu tiên.');
  state.phase=2;$('isolateBtn').disabled=true;$('isolateBtn').classList.add('done');$('isolateStatus').textContent='ISOLATED';$('coolBtn').disabled=false;$('coolBtn').classList.add('unlocked');$('coolStatus').textContent='HOLD';$('phaseLabel').textContent='PHASE 2 · COOLING';$('feedback').innerHTML='<span class="feedback-led"></span> Bình đã cô lập. Nhấn giữ nút làm mát cho đến khi đạt 300 K.';updateSteps();
}
function startCooling(){
  if(state.phase!==2)return error('Chưa cô lập bình. Làm mát trong khi bình còn nối mạng có thể gây sốc nhiệt.');
  if(state.cooling)return;state.cooling=true;$('coolBtn').classList.add('holding');
  coolingTimer=setInterval(()=>{state.temperature=Math.max(300,state.temperature-4);state.pressure=Math.max(1,state.pressure-.018);updateUI();if(state.temperature<=300){clearInterval(coolingTimer);state.cooling=false;state.phase=3;$('coolBtn').disabled=true;$('coolBtn').classList.add('done');$('coolStatus').textContent='COOLED';$('ventBtn').disabled=false;$('ventBtn').classList.add('unlocked');$('ventStatus').textContent='HOLD';$('phaseLabel').textContent='PHASE 3 · CONTROLLED VENT';$('feedback').innerHTML='<span class="feedback-led"></span> 300 K đạt được. Nhấn giữ van xả để hạ áp suất về 1.00 atm.';updateSteps()}}
  ,120);
}
function stopCooling(){if(!state.cooling)return;clearInterval(coolingTimer);state.cooling=false;$('coolBtn').classList.remove('holding')}
function startVenting(){
  if(state.phase!==3)return error('Chỉ được xả áp sau khi nhiệt độ đã giảm về 300 K.');
  if(state.venting)return;state.venting=true;$('ventBtn').classList.add('holding');ventTimer=setInterval(()=>{state.pressure=Math.max(1,state.pressure-.035);updateUI();if(state.pressure<=1){clearInterval(ventTimer);state.venting=false;state.completed=true;$('ventBtn').disabled=true;$('ventBtn').classList.add('done');$('ventStatus').textContent='SAFE';$('systemState').textContent='QUEST COMPLETE';$('phaseLabel').textContent='ALL SYSTEMS NOMINAL';$('feedback').className='feedback success';$('feedback').innerHTML='<span class="feedback-led"></span> BÌNH ĐÃ ỔN ĐỊNH. Quy trình hoàn tất an toàn.';updateSteps();state.oxygen=Math.min(100,state.oxygen+10);updateUI();setTimeout(()=>$('successModal').classList.remove('hidden'),500)}}
  ,120);
}
function stopVenting(){if(!state.venting)return;clearInterval(ventTimer);state.venting=false;$('ventBtn').classList.remove('holding')}
$('isolateBtn').addEventListener('click',isolate);
$('coolBtn').addEventListener('pointerdown',startCooling);$('coolBtn').addEventListener('pointerup',stopCooling);$('coolBtn').addEventListener('pointerleave',stopCooling);$('coolBtn').addEventListener('pointercancel',stopCooling);
$('ventBtn').addEventListener('pointerdown',startVenting);$('ventBtn').addEventListener('pointerup',stopVenting);$('ventBtn').addEventListener('pointerleave',stopVenting);$('ventBtn').addEventListener('pointercancel',stopVenting);
$('resetBtn').addEventListener('click',resetQuest);$('continueBtn').addEventListener('click',()=>{$('successModal').classList.add('hidden');resetQuest()});
resetQuest();
