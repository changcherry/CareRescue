const activeSession=JSON.parse(sessionStorage.getItem('careRescueSession')||'null');
if(!activeSession) location.replace('login.html');
const defaultCases=[
 {id:'C-017',time:'09:00',end:'10:00',area:'北投區',service:'備餐與身體照顧',risk:'高風險',level:'high',reason:'高跌倒風險｜服務不可中斷',deadline:'08:30',rules:['女性照服員','身體照顧資格','不可延後','交通 ≤ 20 分鐘']},
 {id:'C-042',time:'11:00',end:'12:00',area:'士林區',service:'陪同就醫',risk:'中風險',level:'mid',reason:'需女性照服員及特定技能',deadline:'09:40',rules:['女性照服員','陪同就醫經驗','不可提前','交通 ≤ 30 分鐘']},
 {id:'C-093',time:'14:00',end:'15:00',area:'北投區',service:'家務協助',risk:'低風險',level:'low',reason:'服務時段可彈性調整',deadline:'12:00',rules:['家務服務資格','可延後 60 分鐘','總工時 ≤ 8 小時']}
];
let cases=JSON.parse(localStorage.getItem('careRescueCases')||'null')||defaultCases.map(c=>({...c,status:'pending',eventReason:'臨時請假'}));
const candidates={
 'C-017':[
  {name:'陳美玲',score:94,meta:'北投區｜交通 12 分鐘｜今日工時 5.0h',tags:['資格符合','熟悉個案','無後續衝突'],note:'曾服務此個案，照護連續性最佳。'},
  {name:'王淑芬',score:86,meta:'士林區｜交通 18 分鐘｜今日工時 4.5h',tags:['資格符合','可準時抵達'],note:'可行，但未曾服務此個案。'},
  {name:'李佳蓉',score:74,meta:'北投區｜交通 9 分鐘｜今日工時 7.0h',tags:['距離最近','可能加班'],note:'距離近，但接班後負荷較高。'}],
 'C-042':[
  {name:'王淑芬',score:91,meta:'士林區｜交通 8 分鐘｜今日工時 5.5h',tags:['陪診經驗','女性','時程符合'],note:'具陪同就醫經驗，交通風險最低。'},
  {name:'周雅雯',score:83,meta:'中山區｜交通 24 分鐘｜今日工時 4.0h',tags:['資格符合','可準時抵達'],note:'時程可行，但跨區交通時間較長。'}],
 'C-093':[
  {name:'李佳蓉',score:89,meta:'北投區｜交通 10 分鐘｜今日工時 6.0h',tags:['同區域','時段可調'],note:'建議延後 30 分鐘，可避開前一班交通衝突。'},
  {name:'陳美玲',score:81,meta:'北投區｜交通 15 分鐘｜今日工時 6.0h',tags:['資格符合','服務穩定'],note:'可行，但優先保留支援高風險服務。'}]
};
const defaultLogs=[
 ['08:10','C-017／C-042／C-093','照服員 A 臨時請假','居督林怡君','處理中','—'],
 ['昨天 16:42','C-066','服務延誤 25 分鐘','家屬、照服員','已完成','林怡君'],
 ['昨天 10:15','C-108','個案臨時送醫','照服員、主管','已完成','張雅婷'],
 ['09/28 13:20','C-051','服務需求變更','家屬、照服員','已完成','林怡君']
];
let logs=JSON.parse(localStorage.getItem('careRescueLogs')||'null')||defaultLogs;
const defaultLeaveRequests=[{id:'L-001',createdAt:'08:10',staff:'陳美玲',date:'2025-08-25',start:'09:00',end:'15:00',type:'臨時病假',reason:'身體不適，無法執行今日服務',urgent:true,status:'pending'}];
let leaveRequests=JSON.parse(localStorage.getItem('careRescueLeave')||'null')||defaultLeaveRequests;
const defaultCaregiverDirectory=[
 {name:'陳美玲',area:'北投區',skill:'身體照顧、備餐',hours:'5.0h',status:'ok',message:'資格、交通與工時皆符合，可選派。'},
 {name:'王淑芬',area:'士林區',skill:'陪同就醫、身體照顧',hours:'4.5h',status:'ok',message:'資格與時程符合，跨區交通時間為 18 分鐘。'},
 {name:'李佳蓉',area:'北投區',skill:'家務協助、備餐',hours:'7.0h',status:'warn',message:'可選派，但完成本班後接近單日工時上限。'},
 {name:'周雅雯',area:'中山區',skill:'陪同就醫、家務協助',hours:'4.0h',status:'warn',message:'資格符合，但跨區交通時間較長。'},
 {name:'林志偉',area:'內湖區',skill:'備餐、家務協助',hours:'6.5h',status:'block',message:'不符合本案性別或技能限制，需填寫例外原因。'},
 {name:'張惠君',area:'士林區',skill:'身體照顧、失智照護',hours:'8.0h',status:'block',message:'接班後將超過單日工時上限。'}
];
let caregiverDirectory=JSON.parse(localStorage.getItem('careRescuePeople')||'null')||defaultCaregiverDirectory;
const baseSchedules={
 '陳美玲':[{date:'2025-08-25',start:'08:00',end:'09:00',caseId:'C-031',service:'備餐服務',area:'北投區'},{date:'2025-08-25',start:'10:30',end:'12:00',caseId:'C-065',service:'身體照顧',area:'北投區'},{date:'2025-08-25',start:'15:00',end:'16:30',caseId:'C-088',service:'備餐與家務',area:'士林區'}],
 '王淑芬':[{date:'2025-08-25',start:'08:30',end:'10:00',caseId:'C-011',service:'陪同就醫',area:'士林區'},{date:'2025-08-25',start:'13:00',end:'15:00',caseId:'C-072',service:'身體照顧',area:'士林區'}],
 '李佳蓉':[{date:'2025-08-25',start:'08:00',end:'10:00',caseId:'C-102',service:'家務協助',area:'北投區'},{date:'2025-08-25',start:'11:30',end:'13:30',caseId:'C-043',service:'備餐服務',area:'北投區'},{date:'2025-08-25',start:'16:00',end:'18:00',caseId:'C-091',service:'家務協助',area:'士林區'}],
 '周雅雯':[{date:'2025-08-25',start:'09:30',end:'11:00',caseId:'C-024',service:'陪同就醫',area:'中山區'}],
 '林志偉':[{date:'2025-08-25',start:'08:00',end:'10:00',caseId:'C-033',service:'備餐服務',area:'內湖區'}],
 '張惠君':[{date:'2025-08-25',start:'08:00',end:'12:00',caseId:'C-005',service:'失智照護',area:'士林區'},{date:'2025-08-25',start:'13:00',end:'17:00',caseId:'C-006',service:'身體照顧',area:'士林區'}]
};
let savedSchedules=JSON.parse(localStorage.getItem('careRescueSchedules')||'null')||baseSchedules;
let selectedStaff='陳美玲';
let selected=cases[0];
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function renderCases(){
 $('#case-grid').innerHTML=cases.filter(c=>c.status!=='closed').map(c=>`<article class="case-card ${c.level}" data-id="${c.id}"><span class="risk ${c.level}">${c.risk}</span><div class="time">${c.time}</div><h3>個案 ${c.id}</h3><p>${c.area}｜${c.service}</p><small>${c.reason}</small><div class="card-footer"><span>${c.status==='assigned'?'已完成補班':'處理期限 '+c.deadline}</span><b>${c.status==='assigned'?'查看紀錄':'查看方案 →'}</b></div></article>`).join('');
 $$('.case-card').forEach(x=>x.onclick=()=>openRescue(x.dataset.id));
}
function renderQueue(){
 $('#queue-list').innerHTML=cases.filter(c=>c.status==='pending').map(c=>`<div class="queue-item ${c.id===selected.id?'active':''}" data-id="${c.id}"><span class="risk ${c.level}">${c.risk}</span><strong>${c.time}｜${c.id}</strong><p>${c.area}・${c.service}</p><small>${c.reason}</small></div>`).join('');
 $$('.queue-item').forEach(x=>x.onclick=()=>{selected=cases.find(c=>c.id===x.dataset.id);renderQueue();renderDecision()});
}
function renderDecision(){
 $('#detail-risk').textContent=selected.risk; $('#detail-risk').className=`risk ${selected.level}`;
 $('#detail-name').textContent=`個案 ${selected.id}`; $('#detail-meta').textContent=`${selected.time}–${selected.end}｜${selected.area}｜${selected.service}`; $('#detail-deadline').textContent=selected.deadline;
 $('#rule-tags').innerHTML=selected.rules.map(r=>`<span>✓ ${r}</span>`).join('');
 const options=candidates[selected.id]||caregiverDirectory.filter(c=>c.status!=='block').slice(0,3).map((c,i)=>({name:c.name,score:90-i*7,meta:`${c.area}｜今日工時 ${c.hours}`,tags:['資格待確認','班表可檢核'],note:'請由居督確認服務技能與交通時間。'}));
 $('#candidate-list').innerHTML=options.map((c,i)=>`<article class="candidate ${i===0?'top':''}"><div><h4>${i===0?'★ 首選方案｜':''}${c.name}</h4><p>${c.meta}</p><div class="tags">${c.tags.map(t=>`<span>${t}</span>`).join('')}</div><p>${c.note}</p></div><div class="score"><strong>${c.score}</strong>適配分數</div><button data-assign="${c.name}">${i===0?'選擇此方案':'查看並選擇'}</button></article>`).join('');
 $$('[data-assign]').forEach(b=>b.onclick=()=>confirmAssign(b.dataset.assign));
 renderManualAssign();
}
function renderManualAssign(){
 const select=$('#manual-caregiver'); if(!select)return;
 select.innerHTML='<option value="">請選擇照服員</option>'+caregiverDirectory.map(c=>`<option value="${c.name}">${c.name}｜${c.area}｜今日 ${c.hours}</option>`).join('');
 $('#manual-result').className='manual-result'; $('#manual-result').innerHTML='';
}
function checkManualAssign(){
 const name=$('#manual-caregiver').value;
 if(!name){toast('請先選擇照服員');return}
 const person=caregiverDirectory.find(c=>c.name===name);
 const labels={ok:'規則檢核通過',warn:'有注意事項',block:'發現限制衝突'};
 $('#manual-result').className=`manual-result show ${person.status}`;
 $('#manual-result').innerHTML=`<div><strong>${labels[person.status]}｜${person.name}</strong><p>${person.skill}｜${person.area}｜今日工時 ${person.hours}<br>${person.message}</p></div><button id="manual-confirm">${person.status==='block'?'填寫原因並選派':'確認選派'}</button>`;
 $('#manual-confirm').onclick=()=>confirmAssign(person.name);
}
function openRescue(id){selected=cases.find(c=>c.id===id);switchView('rescue');renderQueue();renderDecision()}
function switchView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));$('#page-title').textContent={dashboard:'今日量能總覽',events:'異動事件',leave:'請假管理',rescue:'救援決策台',tracking:'通知與追蹤',people:'人員與班表',analytics:'量能分析'}[id]}
function confirmAssign(name){
 $('#modal-content').innerHTML=`<h2>確認補班方案</h2><p>將由 <strong>${name}</strong> 支援個案 <strong>${selected.id}</strong> 的 ${selected.time} 服務。</p><div class="rules"><h3>確認後將執行</h3><span>建立異動紀錄</span><span>通知照服員</span><span>通知家屬</span><span>追蹤回覆</span></div><p style="font-size:12px;color:#6d7890">本頁為情境模擬，不會傳送真實通知。</p><button id="final-confirm" style="width:100%;margin-top:12px;border:0;background:#6f55d9;color:#fff;padding:12px;border-radius:10px;cursor:pointer">確認並建立模擬通知</button>`;
 $('#modal').classList.add('show');$('#final-confirm').onclick=()=>completeAssignment(name);
}
function completeAssignment(name){
 const target=cases.find(c=>c.id===selected.id);target.status='assigned';target.assignee=name;const now=new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'});
 (savedSchedules[name]||(savedSchedules[name]=[])).push({date:'2025-08-25',start:target.time,end:target.end,caseId:target.id,service:target.service,area:target.area});
 logs.unshift([now,`${target.id}／${name}`,`完成補班：${target.eventReason||'臨時異動'}`,'照服員、家屬','已完成','林怡君']);
 localStorage.setItem('careRescueCases',JSON.stringify(cases));localStorage.setItem('careRescueSchedules',JSON.stringify(savedSchedules));localStorage.setItem('careRescueLogs',JSON.stringify(logs));
 $('#modal').classList.remove('show');renderCases();renderQueue();renderEvents();renderLogs();toast(`已完成 ${target.id} 補班並更新 ${name} 的班表`);
}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function renderLogs(){$('#log-body').innerHTML=logs.map((r,i)=>`<tr>${r.map((v,j)=>`<td>${j===4?`<span class="status ${v==='已完成'?'done':''}">${v}</span>`:v}</td>`).join('')}</tr>`).join('')}
function renderEvents(){
 const filter=$('#event-filter')?.value||'all',rows=cases.filter(c=>filter==='all'||c.status===filter);
 $('#event-body').innerHTML=rows.map(c=>`<tr><td>${c.createdAt||'08:10'}</td><td>${c.time}–${c.end}</td><td><strong>${c.id}</strong><br><small>${c.area}｜${c.service}</small></td><td>${c.eventReason||'臨時請假'}</td><td><span class="risk ${c.level}">${c.risk}</span></td><td><span class="status ${c.status==='assigned'?'done':''}">${c.status==='pending'?'待處理':c.status==='assigned'?'已補班':'已結案'}</span></td><td><button class="table-action" data-handle="${c.id}">${c.status==='pending'?'處理':'查看'}</button></td></tr>`).join('');
 $$('[data-handle]').forEach(b=>b.onclick=()=>openRescue(b.dataset.handle));
}
function openEventForm(){
 $('#modal-content').innerHTML=`<h2>建立異動事件</h2><div class="shift-form"><label>個案編號<input id="event-case" placeholder="例如 C-120"></label><div><label>服務開始<input id="event-start" type="time" value="10:00"></label><label>服務結束<input id="event-end" type="time" value="11:00"></label></div><label>服務區域<select id="event-area"><option>北投區</option><option>士林區</option><option>中山區</option><option>內湖區</option></select></label><label>服務項目<select id="event-service"><option>身體照顧</option><option>備餐服務</option><option>家務協助</option><option>陪同就醫</option><option>失智照護</option></select></label><label>異動原因<select id="event-reason"><option>臨時請假</option><option>服務延誤</option><option>臨時停服</option><option>個案送醫</option><option>需求變更</option></select></label><label>風險等級<select id="event-risk"><option value="high">高風險</option><option value="mid">中風險</option><option value="low">低風險</option></select></label><label>服務限制<input id="event-rules" placeholder="例如：女性照服員、不可延後"></label><button id="save-event">建立並進入處理</button></div>`;
 $('#modal').classList.add('show');$('#save-event').onclick=saveEvent;
}
function saveEvent(){
 const id=$('#event-case').value.trim().toUpperCase();if(!id||cases.some(c=>c.id===id)){toast('請輸入未使用的個案編號');return}
 const level=$('#event-risk').value,risk={high:'高風險',mid:'中風險',low:'低風險'}[level],rules=$('#event-rules').value.split('、').filter(Boolean);
 const item={id,time:$('#event-start').value,end:$('#event-end').value,area:$('#event-area').value,service:$('#event-service').value,risk,level,reason:$('#event-reason').value,deadline:$('#event-start').value,rules:rules.length?rules:['資格符合','時程無衝突'],eventReason:$('#event-reason').value,status:'pending',createdAt:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})};
 cases.push(item);localStorage.setItem('careRescueCases',JSON.stringify(cases));$('#modal').classList.remove('show');renderCases();renderQueue();renderEvents();openRescue(id);toast(`已建立 ${id} 異動事件`);
}
function leaveAffectedShifts(req){return (savedSchedules[req.staff]||[]).filter(s=>s.date===req.date&&minutes(s.start)<minutes(req.end)&&minutes(s.end)>minutes(req.start))}
function renderLeave(){
 const filter=$('#leave-filter')?.value||'all',items=leaveRequests.filter(r=>filter==='all'||r.status===filter);
 $('#leave-body').innerHTML=items.map(r=>{const affected=leaveAffectedShifts(r);return `<tr><td>${r.createdAt}</td><td><strong>${r.staff}</strong>${r.urgent?'<br><small class="urgent-text">緊急申請</small>':''}</td><td>${r.date}<br><small>${r.start}–${r.end}</small></td><td>${r.type}<br><small>${r.reason}</small></td><td>${affected.length} 個班次</td><td><span class="status ${r.status==='approved'?'done':''}">${r.status==='pending'?'待審核':r.status==='approved'?'已核准':'已退回'}</span></td><td>${r.status==='pending'?`<div class="review-actions"><button data-approve="${r.id}">核准</button><button data-reject="${r.id}">退回</button></div>`:'—'}</td></tr>`}).join('');
 const pending=leaveRequests.filter(r=>r.status==='pending');$('#leave-pending-count').textContent=pending.length;$('#leave-today-count').textContent=new Set(leaveRequests.filter(r=>r.date==='2025-08-25'&&r.status!=='rejected').map(r=>r.staff)).size;$('#leave-shift-count').textContent=pending.reduce((n,r)=>n+leaveAffectedShifts(r).length,0);
 $$('[data-approve]').forEach(b=>b.onclick=()=>approveLeave(b.dataset.approve));$$('[data-reject]').forEach(b=>b.onclick=()=>rejectLeave(b.dataset.reject));
}
function openLeaveForm(){
 $('#modal-content').innerHTML=`<h2>照服員請假申請</h2><p class="form-intro">此畫面模擬照服員手機端送出請假。</p><div class="shift-form"><label>申請人<select id="leave-staff">${caregiverDirectory.map(c=>`<option>${c.name}</option>`).join('')}</select></label><label>請假日期<input id="leave-date" type="date" value="2025-08-25"></label><div><label>開始時間<input id="leave-start" type="time" value="09:00"></label><label>結束時間<input id="leave-end" type="time" value="18:00"></label></div><label>請假類型<select id="leave-type"><option>臨時病假</option><option>事假</option><option>家庭照顧假</option><option>公假</option><option>其他</option></select></label><label>原因說明<textarea id="leave-reason" rows="3" placeholder="請簡要說明請假原因"></textarea></label><label class="check-label"><input id="leave-urgent" type="checkbox"> 緊急申請，需要立即處理</label><button id="save-leave">送出請假申請</button></div>`;
 $('#modal').classList.add('show');$('#save-leave').onclick=saveLeave;
}
function saveLeave(){
 const start=$('#leave-start').value,end=$('#leave-end').value,reason=$('#leave-reason').value.trim();if(!reason||minutes(end)<=minutes(start)){toast('請填寫原因並確認請假時間');return}
 leaveRequests.unshift({id:`L-${String(Date.now()).slice(-4)}`,createdAt:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}),staff:$('#leave-staff').value,date:$('#leave-date').value,start,end,type:$('#leave-type').value,reason,urgent:$('#leave-urgent').checked,status:'pending'});
 localStorage.setItem('careRescueLeave',JSON.stringify(leaveRequests));$('#modal').classList.remove('show');renderLeave();toast('請假申請已送出，等待居督審核');
}
function approveLeave(id){
 const req=leaveRequests.find(r=>r.id===id),affected=leaveAffectedShifts(req);req.status='approved';
 affected.forEach((s,i)=>{if(!cases.some(c=>c.id===s.caseId&&c.status==='pending'))cases.push({id:s.caseId,time:s.start,end:s.end,area:s.area,service:s.service,risk:i===0?'高風險':'中風險',level:i===0?'high':'mid',reason:`${req.staff} ${req.type}｜服務需補位`,deadline:s.start,rules:['服務資格符合','班次時程無衝突'],eventReason:`${req.staff} ${req.type}`,status:'pending',createdAt:req.createdAt})});
 logs.unshift([new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'}),req.id,`核准 ${req.staff} ${req.type}`,'照服員、居督','已完成','林怡君']);
 localStorage.setItem('careRescueLeave',JSON.stringify(leaveRequests));localStorage.setItem('careRescueCases',JSON.stringify(cases));localStorage.setItem('careRescueLogs',JSON.stringify(logs));renderLeave();renderEvents();renderCases();renderQueue();renderLogs();toast(`已核准，建立 ${affected.length} 個待處理班次`);
}
function rejectLeave(id){const req=leaveRequests.find(r=>r.id===id);req.status='rejected';localStorage.setItem('careRescueLeave',JSON.stringify(leaveRequests));renderLeave();toast('申請已退回，請假人可修改後重新送出')}
function renderStaff(filter=''){
 const list=caregiverDirectory.filter(c=>(c.name+c.area+c.skill).includes(filter));
 $('#staff-list').innerHTML=list.map(c=>`<button class="staff-row ${c.name===selectedStaff?'active':''}" data-staff="${c.name}"><span>${c.name.slice(-1)}</span><div><strong>${c.name}</strong><small>${c.area}｜${c.skill}</small></div><b>${c.hours}</b></button>`).join('');
 $$('.staff-row').forEach(b=>b.onclick=()=>{selectedStaff=b.dataset.staff;renderStaff($('#staff-search').value);renderSchedule()});
}
function minutes(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function renderSchedule(){
 const staff=caregiverDirectory.find(c=>c.name===selectedStaff),date=$('#schedule-date').value;
 const shifts=(savedSchedules[selectedStaff]||[]).filter(s=>s.date===date).sort((a,b)=>a.start.localeCompare(b.start));
 $('#staff-name').textContent=staff.name;$('#staff-profile').textContent=`${staff.area}｜${staff.skill}`;
 const total=shifts.reduce((n,s)=>n+(minutes(s.end)-minutes(s.start))/60,0);$('#staff-hours').textContent=`${total.toFixed(1)} 小時`;
 $('#schedule-list').innerHTML=shifts.length?shifts.map(s=>`<article class="shift-row"><time>${s.start}<small>${s.end}</small></time><div><strong>${s.caseId}｜${s.service}</strong><p>${s.area}</p></div><span>已排服務</span></article>`).join(''):`<div class="empty-schedule">本日尚無班次，可安排支援服務。</div>`;
}
function openShiftForm(){
 $('#modal-content').innerHTML=`<h2>新增班次</h2><div class="shift-form"><label>照服員<select id="shift-staff">${caregiverDirectory.map(c=>`<option ${c.name===selectedStaff?'selected':''}>${c.name}</option>`).join('')}</select></label><label>日期<input id="shift-date" type="date" value="${$('#schedule-date').value}"></label><div><label>開始時間<input id="shift-start" type="time" value="09:00"></label><label>結束時間<input id="shift-end" type="time" value="10:00"></label></div><label>個案編號<input id="shift-case" value="C-" placeholder="例如 C-017"></label><label>服務項目<select id="shift-service"><option>身體照顧</option><option>備餐服務</option><option>家務協助</option><option>陪同就醫</option><option>失智照護</option></select></label><label>服務區域<select id="shift-area"><option>北投區</option><option>士林區</option><option>中山區</option><option>內湖區</option></select></label><button id="save-shift">儲存班次</button></div>`;
 $('#modal').classList.add('show');$('#save-shift').onclick=saveShift;
}
function openPersonForm(){
 $('#modal-content').innerHTML=`<h2>新增照服員</h2><div class="shift-form"><label>姓名<input id="person-name" placeholder="請輸入姓名"></label><label>主要服務區域<select id="person-area"><option>北投區</option><option>士林區</option><option>中山區</option><option>內湖區</option></select></label><label>服務技能<input id="person-skill" placeholder="例如：身體照顧、備餐"></label><label>今日既有工時<input id="person-hours" type="number" min="0" max="12" step="0.5" value="0"></label><label>資格狀態<select id="person-status"><option value="ok">資格有效</option><option value="warn">待補文件</option><option value="block">暫停派班</option></select></label><button id="save-person">儲存人員資料</button></div>`;
 $('#modal').classList.add('show');$('#save-person').onclick=savePerson;
}
function savePerson(){
 const name=$('#person-name').value.trim(),skill=$('#person-skill').value.trim(),area=$('#person-area').value,hours=Number($('#person-hours').value||0),status=$('#person-status').value;
 if(!name||!skill){toast('請填寫姓名與服務技能');return}
 if(caregiverDirectory.some(c=>c.name===name)){toast('人員姓名已存在');return}
 caregiverDirectory.push({name,area,skill,hours:`${hours.toFixed(1)}h`,status,message:status==='ok'?'資格資料有效，可進行班次安排。':status==='warn'?'尚有資格文件待補。':'目前暫停派班。'});
 savedSchedules[name]=[];localStorage.setItem('careRescuePeople',JSON.stringify(caregiverDirectory));localStorage.setItem('careRescueSchedules',JSON.stringify(savedSchedules));selectedStaff=name;$('#modal').classList.remove('show');renderStaff();renderSchedule();toast(`已新增照服員：${name}`);
}
function saveShift(){
 const name=$('#shift-staff').value,start=$('#shift-start').value,end=$('#shift-end').value,date=$('#shift-date').value,caseId=$('#shift-case').value.trim();
 if(!caseId||!start||!end||minutes(end)<=minutes(start)){toast('請確認個案編號與服務時間');return}
 const conflict=(savedSchedules[name]||[]).some(s=>s.date===date&&minutes(start)<minutes(s.end)&&minutes(end)>minutes(s.start));
 if(conflict){toast('此時段與既有班次重疊，請調整時間');return}
 (savedSchedules[name]||(savedSchedules[name]=[])).push({date,start,end,caseId,service:$('#shift-service').value,area:$('#shift-area').value});
 localStorage.setItem('careRescueSchedules',JSON.stringify(savedSchedules));selectedStaff=name;$('#schedule-date').value=date;$('#modal').classList.remove('show');renderStaff();renderSchedule();toast(`已新增 ${name} 的 ${start} 班次`);
}
function init(){
 renderCases();renderQueue();renderDecision();renderEvents();renderLeave();
 $('#capacity-bars').innerHTML=[['08–10',12,15],['10–12',14,15],['12–14',9,15],['14–16',11,15],['16–18',7,15]].map(x=>`<div><span>${x[0]}</span><div class="bar"><i style="width:${x[1]/x[2]*100}%"></i></div><b>${x[1]} / ${x[2]}</b></div>`).join('');
 renderLogs();
 $('#weekly-chart').innerHTML=[5,8,4,9,7,11,6].map((v,i)=>`<div style="height:${v*14}px"><b>${v}</b><span>${['一','二','三','四','五','六','日'][i]}</span></div>`).join('');
 $$('.nav-item').forEach(n=>n.onclick=()=>switchView(n.dataset.view));$('[data-open-rescue]').onclick=()=>openRescue('C-017');
 $('#close-modal').onclick=()=>$('#modal').classList.remove('show');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('show')};
 $('#show-filter').onclick=()=>{$('#modal-content').innerHTML=`<h2>候選人篩選紀錄</h2><p style="color:#6d7890;font-size:13px">先套用硬性規則，再針對可行方案進行多目標排序。</p><div class="filter-row"><i>✓ 通過</i><div><strong>7 人｜基本資格</strong><br>服務項目與必要技能符合</div></div><div class="filter-row fail"><i>× 排除</i><div><strong>2 人｜時程衝突</strong><br>無法在服務開始前抵達</div></div><div class="filter-row fail"><i>× 排除</i><div><strong>1 人｜工時限制</strong><br>接班後將超過單日工時上限</div></div><div class="filter-row"><i>✓ 可行</i><div><strong>${(candidates[selected.id]||[]).length||3} 人｜進入方案排序</strong><br>比較風險、連續性、交通與負荷</div></div>`;$('#modal').classList.add('show')};
 $('#export-log').onclick=()=>toast('模擬紀錄已準備完成（原型未連接真實資料庫）');
 $('#check-manual').onclick=checkManualAssign;
 renderStaff();renderSchedule();$('#staff-search').oninput=e=>renderStaff(e.target.value);$('#schedule-date').onchange=renderSchedule;$('#add-person').onclick=openPersonForm;$('#add-shift').onclick=openShiftForm;$('#add-event').onclick=openEventForm;$('#event-filter').onchange=renderEvents;$('#add-leave').onclick=openLeaveForm;$('#leave-filter').onchange=renderLeave;
 if(activeSession){$('#login-role').textContent=`${activeSession.roleLabel}｜${activeSession.name}`;$('#logout').onclick=()=>{sessionStorage.removeItem('careRescueSession');location.replace('login.html')}}
}
init();
