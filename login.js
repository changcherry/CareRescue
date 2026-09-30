const form=document.querySelector('#login-form'),account=document.querySelector('#account'),password=document.querySelector('#password'),error=document.querySelector('#login-error');
document.querySelector('#toggle-password').onclick=e=>{const show=password.type==='password';password.type=show?'text':'password';e.target.textContent=show?'隱藏':'顯示'};
document.querySelector('#fill-demo').onclick=()=>{account.value='supervisor.demo';password.value='demo2026';error.textContent=''};
form.addEventListener('submit',e=>{e.preventDefault();if(account.value.trim()!=='supervisor.demo'||password.value!=='demo2026'){error.textContent='展示帳號或密碼不正確';return}sessionStorage.setItem('careRescueSession',JSON.stringify({role:'supervisor',roleLabel:'居督模式',name:'林怡君',loginAt:new Date().toISOString()}));location.href='index.html'});
if(sessionStorage.getItem('careRescueSession'))location.href='index.html';
