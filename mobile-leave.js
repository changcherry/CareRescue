const today=new Date();
const pad=n=>String(n).padStart(2,'0');
const localDate=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
document.querySelector('#m-date').value='2025-08-25';
document.querySelector('#today').textContent='2025 年 8 月 25 日・星期一';
const load=()=>JSON.parse(localStorage.getItem('careRescueLeave')||'null')||[];
function renderHistory(){const items=load().filter(r=>r.staff==='陳美玲').slice(0,3);document.querySelector('#mobile-history').innerHTML=items.length?items.map(r=>`<div class="history-item"><strong>${r.date}｜${r.type}</strong><p>${r.start}–${r.end}・${r.reason}</p><span class="${r.status==='approved'?'approved':''}">${r.status==='pending'?'待審核':r.status==='approved'?'已核准':'已退回'}</span></div>`).join(''):'<p style="font-size:10px;color:#747c86">尚無請假紀錄</p>'}
function toast(text){const el=document.querySelector('#mobile-toast');el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
document.querySelector('#leave-form').addEventListener('submit',e=>{e.preventDefault();const start=document.querySelector('#m-start').value,end=document.querySelector('#m-end').value,reason=document.querySelector('#m-reason').value.trim();if(!reason||end<=start){toast('請確認請假時間與原因');return}const list=load();list.unshift({id:`L-${String(Date.now()).slice(-4)}`,createdAt:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}),staff:'陳美玲',date:document.querySelector('#m-date').value,start,end,type:document.querySelector('#m-type').value,reason,urgent:document.querySelector('#m-urgent').checked,status:'pending'});localStorage.setItem('careRescueLeave',JSON.stringify(list));renderHistory();e.target.reset();document.querySelector('#m-date').value='2025-08-25';document.querySelector('#m-start').value='09:00';document.querySelector('#m-end').value='18:00';toast('申請已送出，居督將收到通知')});
document.querySelector('#refresh').onclick=renderHistory;
renderHistory();
