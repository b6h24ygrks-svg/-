const SECTIONS=[
  {title:"💗 關於我",qs:[
    "最近半年都叫我什麼？",
    "最近半年我喜歡吃什麼？",
    "喜歡這半年我什麼樣子？",
    "喜歡這半年我唱什麼歌？",
    "最近有沒有覺得我沈迷什麼東西？",
    "這半年我喜歡的是什麼？",
    "最近最喜歡我哪個小習慣？",
    "最近覺得我最可愛的瞬間？",
    "最近有沒有哪件事讓你覺得我很帥／很漂亮？",
    "這一年生日，想怎麼過？"
  ]},
  {title:"🐾 關於我們",qs:[
    "這半年最難忘的回憶？",
    "最近最喜歡我們一起做什麼？",
    "如果今天重新第一次約會，你想帶我去哪？",
    "你覺得我們最近變得更好的地方？",
    "如果有重新認識，你還會想了解我嗎？",
    "為什麼？",
    "有沒有一個瞬間，你會後悔／堅決覺得選擇是對的？"
  ]},
  {title:"💌 心裡話",qs:[
    "最近有沒有什麼一直想跟我說？",
    "最近有什麼事情希望我更懂你？",
    "你希望我怎麼陪你？",
    "有沒有一句話想送給半年前的我們？",
    "有沒有什麼事情你覺得對不起對方？"
  ]},
  {title:"🔮 下一個半年",qs:[
    "下半年最想跟我一起完成什麼？",
    "最想一起去什麼地方？",
    "希望半年後的我們變成什麼樣子？",
    "希望未來我們怎麼努力？"
  ]},
  {title:"✨ 有話對我說",qs:[
    "可以跟我說說，你希望我改進的事，以及你覺得我不需要改變、希望我繼續保持的事。"
  ]}
];

const QUESTIONS=SECTIONS.flatMap(s=>s.qs);
const MAX=100;
let person="A",idx=0,answers=[];
const $=id=>document.getElementById(id);
function show(id){
  ["home","quiz","handoff","result"].forEach(x=>{
    $(x).classList.toggle("active",x===id);
  });
}
function toast(t){
  $("toast").textContent=t;
  $("toast").classList.remove("hidden");
  setTimeout(()=>$("toast").classList.add("hidden"),1800);
}

function sectionOf(i){
  let n=0;
  for(const s of SECTIONS){
    if(i<n+s.qs.length)return s;
    n+=s.qs.length;
  }
  return SECTIONS[SECTIONS.length-1];
}

function renderQuestions(){
  const box=$("questions");
  const s=sectionOf(idx);

  box.innerHTML=`
    <div class="section-title">${s.title}</div>
    <div class="q-card">
      <div class="q-num">第 ${idx+1} / ${QUESTIONS.length} 題</div>
      <div class="q-text">${QUESTIONS[idx]}</div>
      <textarea id="answer" maxlength="${MAX}" placeholder="寫下你的答案…">${answers[idx]||""}</textarea>
      <div class="char-count">
        <span id="count">${(answers[idx]||"").length}</span> / ${MAX}
      </div>
    </div>
  `;

  $("answer").addEventListener("input",e=>{
    answers[idx]=e.target.value;
    $("count").textContent=e.target.value.length;
    localStorage.setItem("couple"+person,JSON.stringify(answers));
  });
}

function updateQuiz(){
  $("personLabel").textContent=
    person==="A"?"💗 A 的回答":"💙 B 的回答";

  $("progressText").textContent=
    `${idx+1} / ${QUESTIONS.length}`;

  $("pageDot").textContent=`${idx+1}`;

  $("prevBtn").disabled=idx===0;

  $("nextBtn").textContent=
    idx===QUESTIONS.length-1?"完成":"下一題";
}

function startA(){
  person="A";
  idx=0;

  answers=JSON.parse(
    localStorage.getItem("coupleA")||"[]"
  );

  if(answers.length!==QUESTIONS.length){
    answers=Array(QUESTIONS.length).fill("");
  }

  renderQuestions();
  updateQuiz();
  show("quiz");
}

function makeInvite(){
  const data=btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify({a:answers})
      )
    )
  );

  return location.href.split("#")[0]+"#invite="+data;
}

function startB(){
  const raw=location.hash.split("invite=")[1];

  if(!raw){
    toast("找不到邀請資料");
    return;
  }

  try{
    const d=JSON.parse(
      decodeURIComponent(
        escape(atob(raw))
      )
    );

    localStorage.setItem(
      "coupleInviteA",
      JSON.stringify(d.a||[])
    );

    person="B";
    idx=0;
    answers=Array(QUESTIONS.length).fill("");

    renderQuestions();
    updateQuiz();
    show("quiz");

  }catch(e){
    toast("邀請資料無法讀取");
  }
}

function finish(){
  localStorage.setItem(
    "couple"+person,
    JSON.stringify(answers)
  );

  if(person==="A"){
    $("shareLink").value=makeInvite();
    show("handoff");
  }else{
    renderResult();
  }
}

function escapeHtml(s){
  return String(s).replace(
    /[&<>"']/g,
    m=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m])
  );
}

function renderResult(){
  const a=JSON.parse(
    localStorage.getItem("coupleInviteA")||"[]"
  );

  const b=answers;
  let html="";
  let n=0;

  for(const s of SECTIONS){

    html+=`
      <div class="section-title">${s.title}</div>
    `;

    for(const q of s.qs){

      html+=`
        <div class="result-q">
          <div class="q-text">${q}</div>

          <div class="answer-row">
            <b>💗 A</b>
            <p>${escapeHtml(a[n]||"尚未回答")}</p>
          </div>

          <div class="answer-row">
            <b>💙 B</b>
            <p>${escapeHtml(b[n]||"尚未回答")}</p>
          </div>
        </div>
      `;

      n++;
    }
  }

  $("resultRows").innerHTML=html;
  show("result");
}

$("startBtn").onclick=startA;

$("nextBtn").onclick=()=>{
  if($("answer")){
    answers[idx]=$("answer").value;
  }

  if(idx<QUESTIONS.length-1){
    idx++;
    renderQuestions();
    updateQuiz();
  }else{
    finish();
  }
};

$("prevBtn").onclick=()=>{
  if(idx>0){

    if($("answer")){
      answers[idx]=$("answer").value;
    }

    idx--;
    renderQuestions();
    updateQuiz();
  }
};

$("backHome").onclick=()=>{
  show("home");
};

$("copyLink").onclick=async()=>{
  try{
    await navigator.clipboard.writeText(
      $("shareLink").value
    );

    toast("已複製邀請連結 💌");

  }catch(e){
    toast("請長按連結複製");
  }
};

$("shareNative").onclick=async()=>{
  if(navigator.share){
    await navigator.share({
      title:"情侶半年重新認識",
      url:$("shareLink").value
    });
  }else{
    toast("請使用複製連結");
  }
};

$("imageBtn").onclick=async()=>{

  const card=$("resultCard");

  if(typeof html2canvas==="undefined"){
    toast("圖片功能需要網路連線");
    return;
  }

  const canvas=await html2canvas(card,{
    scale:2,
    backgroundColor:"#fffaf4"
  });

  canvas.toBlob(async blob=>{

    const file=new File(
      [blob],
      "情侶半年重新認識.png",
      {type:"image/png"}
    );

    if(
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({files:[file]})
    ){

      try{
        await navigator.share({
          files:[file],
          title:"情侶半年重新認識"
        });
      }catch(e){}

    }else{

      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=file.name;
      a.click();

      toast("圖片已產生");
    }

  });
};

$("againBtn").onclick=()=>{
  person="A";
  idx=0;
  answers=Array(QUESTIONS.length).fill("");

  renderQuestions();
  updateQuiz();
  show("quiz");
};

$("loadBtn").onclick=()=>{

  const a=JSON.parse(
    localStorage.getItem("coupleA")||"[]"
  );

  if(!a.length){
    toast("目前沒有儲存的回答");
    return;
  }

  person="A";
  idx=0;

  answers=
    a.length===QUESTIONS.length
    ?a
    :Array(QUESTIONS.length).fill("");

  renderQuestions();
  updateQuiz();
  show("quiz");
};

if(location.hash.startsWith("#invite=")){
  setTimeout(()=>{
    startB();
  },100);
}
