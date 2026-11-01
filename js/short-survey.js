let qs=[], definition=null, report=null, requestId=0, errorMessage='', retryAction='start';
let page='home', idx=0, ans=[], type='';
const view=document.getElementById('view');
const dimensions=[
{title:'에너지 수준',left:'활동적',right:'좌식형',codes:['A','S'],color:'#00a8bb'},
{title:'건강관리 방식',left:'능동적',right:'반응적',codes:['P','R'],color:'#db9650'},
{title:'영양 패턴',left:'균형형',right:'불균형형',codes:['B','I'],color:'#83a34a'},
{title:'스트레스 대응',left:'침착형',right:'긴장형',codes:['C','T'],color:'#9b80c7'}
];
function dimensionProfile(){return report.groups.map((g,i)=>({...dimensions[i],...g}))}
function dimensionHtml(d) {
  const labels = `<div class="dimension-labels"><span>${d.left} <small>${d.codes[0]}</small></span><span>${d.right} <small>${d.codes[1]}</small></span></div>`;
  if (d.leftPercent === 50) {
    return `<div class="dimension dimension-neutral"><div class="dimension-title"><strong>${d.title}</strong></div>${labels}<p class="neutral-note">두 성향이 고르게 나타나요</p></div>`;
  }
  return `<div class="dimension" style="--dimension-color:${d.color}"><div class="dimension-title"><strong>${d.title}</strong><span>${d.letter===d.codes[0]?d.left:d.right} 성향</span></div><div class="dimension-labels"><span class="${d.leftPercent>50?'dominant':''}">${d.left} <small>${d.codes[0]}</small><b>${d.leftPercent}%</b></span><span class="${d.rightPercent>50?'dominant':''}"><b>${d.rightPercent}%</b>${d.right} <small>${d.codes[1]}</small></span></div><div class="dimension-bar" role="img" aria-label="${d.title}: ${d.left} ${d.leftPercent}%, ${d.right} ${d.rightPercent}%"><i style="width:${d.leftPercent}%"></i><span class="midpoint"></span></div></div>`;
}
function profileHtml(){
  return '<section class="profile"><div class="eyebrow">MY HEALTH BALANCE</div><h2>나의 성향, 한눈에 보기</h2><p class="small">12문항의 가중점수와 확인된 응답 패턴을 반영한 간편 결과예요. 비율은 점수 범위 내 위치이며 유형 확률이 아니에요. 유형은 앱의 축별 기준점을 적용해 결정하므로 비율이 큰 쪽과 다를 수 있어요. 48문항과의 일치도는 아직 검증되지 않았어요.</p>'+dimensionProfile().map(dimensionHtml).join('')+'</section>';
}

function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function nutrientHtml(n){
 const reasons=(n.reasons?.length?n.reasons:[n.reason]).filter(Boolean);
 return `<article class="nutrient-card"><div class="nutrient-heading"><span class="nutrient-rank">${String(n.rank).padStart(2,'0')}</span><div><h3>${escapeHtml(n.nameKo)}</h3><span class="nutrient-en">${escapeHtml(n.name)}</span></div></div><p class="nutrient-reason">${escapeHtml(n.reason||reasons[0]||'추천 이유가 제공되지 않았어요.')}</p><details><summary>추천 이유 자세히 보기</summary><div class="nutrient-detail"><h4>추천 이유</h4>${reasons.length?'<ul>'+reasons.map(r=>'<li>'+escapeHtml(r)+'</li>').join('')+'</ul>':'<p>추천 이유가 제공되지 않았어요. 자세한 정보는 앱에서 확인해 주세요.</p>'}<h4>더 자세한 정보는 앱에서</h4><p>추천 이유와 함께 작용 원리, 복용 정보, 주의사항과 참고 자료를 확인할 수 있어요.</p></div></details></article>`;
}
const safetyNotice='앱에서 로그인하고 건강 특이사항을 등록하면, 등록한 정보에 따른 섭취 금기 영양소 필터와 주의사항을 심층 리포트에서 함께 확인할 수 있어요.';
function recommendationNoticeHtml(){
 return `<aside class="recommendation-notice" aria-label="추천 결과 안내">
 <div class="recommendation-notice-heading"><span class="notice-info" aria-hidden="true">i</span><h3>추천 결과를 읽기 전에</h3></div>
 <p><strong>앱과 같은 추천 엔진</strong>으로 계산한 결과예요. <strong>12문항에서 확인한 정보만 반영</strong>하므로 앱의 정밀 추천과 다를 수 있어요.</p>
 <div class="recommendation-notice-caution"><span class="notice-label">꼭 확인해 주세요</span><p><strong>개인별 금기 필터는 적용되지 않았으며,</strong> 영양소 부족 진단이나 복용 처방이 아니에요. 추천 후보 수에 따라 5개보다 적을 수 있어요.</p></div>
 </aside>`;
}
function nutrientsHtml(){
 const nutrients=report.nutrients.map((n,i)=>({...n,nameKo:n.name_ko,rank:i+1}));
 return '<section aria-label="영양소 정보"><h2>간편 설문 기반 추천 영양소</h2>'+recommendationNoticeHtml()+'<div class="nutrient-list">'+(nutrients.length?nutrients.map(nutrientHtml).join(''):'<p>현재 답변으로 제공할 추천 영양소가 없어요. 앱에서 정밀 설문을 진행해 주세요.</p>')+'</div><aside class="locked"><h3>나에게 맞는 주의사항까지</h3><p>'+safetyNotice+'</p></aside></section>';
}

async function loadSurvey(){
 const ticket=++requestId;page='loading';retryAction='start';render();
 try{
  const data=validateShortDefinition(await shortRequest());
  if(ticket!==requestId)return;
  definition=data;qs=data.questions;ans=Array(qs.length).fill(null);idx=0;type='';report=null;page='survey';
 }catch(error){if(ticket!==requestId)return;errorMessage=error.message;page='error';}
 render();
}
async function submitSurvey(){
 const ticket=++requestId;page='loading';retryAction='submit';render();
 try{
  const data=validateShortReport(await shortRequest({version:definition.version,consent:true,
   answers:Object.fromEntries(qs.map((q,i)=>[String(q.questionId),ans[i]]))}));
  if(ticket!==requestId)return;
  if(data.version!==definition.version)throw new Error('설문 정보가 변경되었어요. 처음부터 다시 시작해 주세요.');
  report=data;type=data.result_type;page='result';
 }catch(error){if(ticket!==requestId)return;errorMessage=error.message;page='error';}
 render();window.scrollTo(0,0);
}

function render(){view.dataset.page=page;
if(page==='loading'){view.innerHTML='<h2>잠시만 기다려 주세요</h2><p role="status">설문과 추천 정보를 확인하고 있어요.</p><button class="alt" data-act="home">처음으로</button>';return}
if(page==='error'){view.innerHTML='<h2>지금은 결과를 불러올 수 없어요</h2><p role="alert">'+escapeHtml(errorMessage)+'</p><button data-act="retry">다시 시도</button><button class="alt" data-act="home">처음부터 다시 시작</button>';return}
if(page==='home'){view.innerHTML='<div class="hero"><div class="hero-copy"><div class="eyebrow">HELLO, YOUR HEALTH TYPE</div><h1>내 몸을 알아가는<br>가장 가벼운 시작,<br><em>나의 HBTI 찾기</em></h1><p>평소의 나에 대해 답해 주세요.<br>앱 설문에서 추린 12개 질문으로 건강 생활 패턴을 가볍게 살펴보세요.</p><label class="small"><input id="survey-consent" type="checkbox"> 건강정보 처리 동의: 설문 응답을 HBTI 및 영양소 추천 계산을 위해 서버로 전송합니다. 이 기능은 응답·결과를 계정이나 DB에 저장하지 않습니다. 동의를 거부할 수 있으나 간편 분석은 이용할 수 없습니다.</label><p id="consent-error" role="alert"></p><button data-act="start">내 HBTI 알아보기 <span style="margin-left:28px">→</span></button><div class="subline"><span>◷ 약 3분</span><span>12문항</span><span>로그인 없이 시작</span></div><p class="small">간편 설문 검토 버전 · 응답은 분석 서버로 전송되며 계정에 저장되지 않아요. 새로고침하면 초기화됩니다.</p><div></div></div><div class="visual"><img src="assets/types/APBC.webp" alt="하루두알 HBTI 캐릭터"><div class="floating">나를 이해하는 새로운 방법 ✦</div><div class="floating bottom">나의 건강에도, 나만의 유형이 있어요</div></div></div><div class="steps" id="how"><div><span>01 · DISCOVER</span><h3>가볍게 답하고</h3><p>생활 속 작은 습관을 돌아보세요.</p></div><div><span>02 · UNDERSTAND</span><h3>나의 유형을 발견하고</h3><p>네 가지 차원으로 나를 이해해요.</p></div><div><span>03 · CONTINUE</span><h3>나에게 맞게 이어가요</h3><p>영양소부터 심층 리포트까지 만나보세요.</p></div></div>';return}
if(page==='survey'){
 const q=qs[idx], dim=dimensions[['AS','PR','BI','CT'].indexOf(q.dimension)];
 view.innerHTML=`<div class="eyebrow">${dim.title} · ${idx+1}/${qs.length}</div>
 <div class="bar" role="progressbar" aria-label="설문 진행" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${idx}"><i style="width:${idx/qs.length*100}%"></i></div>
 <h2 tabindex="-1" id="question-title">${escapeHtml(q.text)}</h2>
 ${q.options.map(o=>`<button class="option ${ans[idx]===o.responseId?'on':''}" data-answer="${o.responseId}" aria-pressed="${ans[idx]===o.responseId}">${escapeHtml(o.label)}</button>`).join('')}
 <div class="actions"><button class="alt" data-act="prev">${idx===0?'처음으로':'이전'}</button></div>
 <p class="small">선택하면 다음 문항으로 이동해요. 이전 버튼으로 답변을 수정할 수 있어요.</p>`;
 document.getElementById('question-title')?.focus({preventScroll:true});return;
}
if(page==='result'){view.innerHTML=`<div class="eyebrow">YOUR QUICK RESULT</div>${type.includes('?')?'':`<img class="result-image" src="assets/types/${type}.webp" alt="나의 HBTI 캐릭터">`}${type.includes('?')?'<p class="eyebrow">두 성향이 고르게 나타난 축이 있어요</p>':`<div class="code">${type}</div>`}<h1>나의 간편 HBTI</h1><p>앱의 판정 기준을 바탕으로 환산한 간편 참고 결과예요. 48문항 정밀 결과와 다를 수 있어요.${type.includes('?')?' 한쪽으로 구분하기 어려운 축은 아래에서 두 성향을 함께 확인해 주세요.':''}</p>${profileHtml()}${nutrientsHtml()}<div class="app"><h2>심층 리포트는 앱에서</h2><p>${safetyNotice}</p><button data-act="app">앱으로 이어보기 ↗</button></div><div class="actions"><button class="alt" data-act="restart">다시 검사하기</button></div>`;return}
if(page==='app'){const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);view.innerHTML=`<div class="eyebrow">YOUR NEXT HEALTH ROUTINE</div><img src="assets/하루두알_로고.jpg" alt="하루두알" style="width:76px;height:76px;margin-top:28px"><h1>나를 위한 건강 관리,<br>하루두알 앱에서.</h1><p>더 자세한 HBTI 분석부터 추천 영양소와 건강 기록까지.<br>앱에서 나만의 건강 습관을 시작해 보세요.</p><div class="locked"><h2>하루두알 다운로드</h2><p>사용하는 휴대폰의 스토어를 선택해 주세요.<br>이미 설치했다면 스토어에서 ‘열기’를 누르면 돼요.</p><div class="actions"><a class="store-link" href="https://apps.apple.com/kr/app/id6759917415" target="_blank" rel="noopener noreferrer">App Store ↗</a><a class="store-link" href="https://play.google.com/store/apps/details?id=com.harudooal.app&hl=ko" target="_blank" rel="noopener noreferrer">Google Play ↗</a></div></div>${ios?'<a class="store-link open-app" href="harudooal://">설치된 하루두알 앱 열기 →</a><p class="small">앱이 열리지 않으면 위 App Store 버튼을 눌러 주세요.</p>':''}<div class="actions"><button class="alt" data-act="${type?'result':'home'}">${type?'웹 결과로 돌아가기':'처음으로'}</button></div>`}}

document.addEventListener('click', async e => {
 const answer = e.target.closest('[data-answer]');
 if (answer && page==='survey') {
   const responseId=Number(answer.dataset.answer);
   if (!qs[idx].options.some(o=>o.responseId===responseId)) return;
   ans[idx]=responseId;
   if (idx===qs.length-1) {await submitSurvey();return;}
   else idx++;
 } else {
   const action=e.target.closest('[data-act]')?.dataset.act;
   if (!action) return;
   if(action==='start'){
     if(!document.getElementById('survey-consent')?.checked){document.getElementById('consent-error').textContent='분석을 시작하려면 건강정보 처리에 동의해 주세요.';return;}
     await loadSurvey();return;
   } else if(action==='restart'){page='home';report=null;type='';ans=[];requestId++;}
   else if(action==='retry'){if(retryAction==='submit')await submitSurvey();else await loadSurvey();return;} else if (action==='prev') {if(idx===0)page='home';else idx--;}
   else if (action==='home'){requestId++;page='home';report=null;type='';ans=[];}
   else if (action==='result') page=type?'result':'home';
   else if (action==='app'){requestId++;page='app';}
 }
 render();window.scrollTo(0,0);
});
render();
