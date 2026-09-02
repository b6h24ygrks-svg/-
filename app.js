const QUESTIONS = [
 "最近最喜歡你怎麼叫我？",
 "最近最喜歡的食物？",
 "最近最討厭的食物？",
 "最近最喜歡的歌？",
 "最近喜歡做的事情？",
 "最近沉迷的東西？"
];
const MAX=25;
const $=s=>document.querySelector(s);
const screens={home:$("#home"),quiz:$("#quiz"),handoff:$("#handoff"),result:$("#result")};
let answers=Array(QUESTIONS.length).fill("");
let idx=0, person="A", partnerAnswers=null, inviteData=null;

function show(name){Object.values(screens).forEach(x=>x.classList.remove("active"));screens[name].classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
function renderQuestions(){
  $("#questions").innerHTML=QUESTIONS.map((q,i)=>`
    <article class="question-card">
      <div class="question-title"><span class="num">${i+1}</span>${q}</div>
      <textarea class="answer" maxlength="${MAX}" data-i="${i}" placeholder="點這裡輸入……">${escapeHtml(answers[i])}</textarea>
      <div class="counter"><span id="c${i}">${answers[i].length}</span> / ${MAX}</div>
    </article>`).join("");
  document.querySelectorAll(".answer").forEach(el=>el.addEventListener("input",e=>{
    const i=+e.target.dataset.i; answers[i]=e.target.value;
    $("#c"+i).textContent=answers[i].length; localStorage.setItem("coupleA",JSON.stringify(answers));
  }));
}
function escapeHtml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function updateQuiz(){
  $("#personLabel").textContent=person==="A"?"我的回答":"另一半的回答";
  $("#progressText").textContent=`${idx+1} / ${QUESTIONS.length}`;
  $("#pageDot").textContent=`${idx+1} / ${QUESTIONS.length}`;
  document.querySelectorAll(".question-card").forEach((el,i)=>el.style.display=i===idx?"block":"none");
  $("#prevBtn").disabled=idx===0;
  $("#prevBtn").style.opacity=idx===0?".5":"1";
  $("#nextBtn").textContent=idx===QUESTIONS.length-1?"完成回答 ♡":"下一題 →";
}
function startA(){
  person="A";idx=0;answers=JSON.parse(localStorage.getItem("coupleA")||"[]");if(answers.length!==QUESTIONS.length)answers=Array(QUESTIONS.length).fill("");
  $("#section").textContent="";renderQuestions();updateQuiz();show("quiz");
}
function startB(data){
  person="B";inviteData=data;idx=0;answers=Array(QUESTIONS.length).fill("");
  renderQuestions();updateQuiz();show("quiz");
}
$("#startBtn").onclick=startA;
$("#backHome").onclick=()=>show("home");
$("#saveBtn").onclick=()=>{localStorage.setItem("coupleA",JSON.stringify(answers));toast("已儲存到這支手機 ♡")};
$("#prevBtn").onclick=()=>{if(idx>0){idx--;updateQuiz()}};
$("#nextBtn").onclick=()=>{
  if(idx<QUESTIONS.length-1){idx++;updateQuiz();return}
  if(person==="A")makeInvite(); else makeResult(inviteData,answers);
};
function makeInvite(){
  const payload={q:answers,created:new Date().toISOString()};
  const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url=location.origin+location.pathname+"#invite="+encoded;
  $("#shareLink").value=url;
  localStorage.setItem("coupleA",JSON.stringify(answers));
  show("handoff");
}
$("#copyLink").onclick=async()=>{try{await navigator.clipboard.writeText($("#shareLink").value);toast("邀請連結已複製 ♡")}catch(e){$("#shareLink").select();document.execCommand("copy");toast("邀請連結已複製 ♡")}};
$("#shareNative").onclick=async()=>{
 const data={title:"給半年的我們 ♡",text:"來回答我們的半年重新認識問卷吧！",url:$("#shareLink").value};
 if(navigator.share){try{await navigator.share(data)}catch(e){}}else toast("這支手機不支援快速分享");
};
function makeResult(data,b){
  partnerAnswers=data.q||[];
  $("#resultRows").innerHTML=QUESTIONS.map((q,i)=>`
    <div class="result-row">
      <div class="result-q">${i+1}. ${q}</div>
      <div class="result-answers">
        <div class="answer-col"><small>♡ 我的回答</small>${escapeHtml(partnerAnswers[i]||"（沒有回答）")}</div>
        <div class="answer-col"><small>🐾 另一半的回答</small>${escapeHtml(b[i]||"（沒有回答）")}</div>
      </div>
    </div>`).join("");
  show("result");
}
$("#imageBtn").onclick=async()=>{
  const card=$("#resultCard");toast("正在生成長圖…");
  if(!window.html2canvas){toast("請確認網路連線後再試");return}
  try{
    const canvas=await html2canvas(card,{scale:2,backgroundColor:"#fbf6ed",useCORS:true});
    const a=document.createElement("a");a.download="我們的半年回憶.png";a.href=canvas.toDataURL("image/png");a.click();toast("長圖完成 ♡");
  }catch(e){toast("生成失敗，請再試一次")}
};
$("#againBtn").onclick=()=>{location.hash="";startA()};
$("#loadBtn").onclick=()=>{
 const saved=localStorage.getItem("coupleA");
 if(saved){answers=JSON.parse(saved);toast("已載入上次的回答 ♡");startA()}else toast("目前還沒有儲存的回答");
};

function decodeInvite(){
 const m=location.hash.match(/^#invite=(.+)$/);
 if(!m)return;
 try{
   const data=JSON.parse(decodeURIComponent(escape(atob(m[1]))));
   if(Array.isArray(data.q)){startB(data);return true}
 }catch(e){}
 return false;
}
renderQuestions();updateQuiz();decodeInvite();
