const form=document.querySelector('#mobile-login-form'),account=document.querySelector('#mobile-account'),password=document.querySelector('#mobile-password'),error=document.querySelector('#mobile-login-error');
document.querySelector('#mobile-toggle').onclick=e=>{const show=password.type==='password';password.type=show?'text':'password';e.target.textContent=show?'隱藏':'顯示'};
form.addEventListener('submit',e=>{e.preventDefault();if(account.value.trim()!=='caregiver.demo'||password.value!=='demo2026'){error.textContent='展示帳號或密碼不正確';return}sessionStorage.setItem('careRescueMobileSession',JSON.stringify({name:'陳美玲',role:'caregiver',loginAt:new Date().toISOString()}));location.href='mobile-leave.html'});
if(sessionStorage.getItem('careRescueMobileSession'))location.href='mobile-leave.html';
