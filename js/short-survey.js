let qs=[], definition=null, report=null, requestId=0, errorMessage='', retryAction='start';
let page='home', idx=0, ans=[], type='';
let shopOptions=null, shopResult=null, shopTags=[], shopForms=[], shopConditionGroup='COND', shopError='';
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
 const conditionNotice=shopTags.length
  ? '선택한 건강정보의 등록된 금기만 반영했어요. 선택하지 않은 조건이나 상품의 전체 원료까지 안전하다는 뜻은 아니에요.'
  : '건강 특이사항을 선택하지 않아 개인별 금기 필터는 적용되지 않았어요.';
 return `<aside class="recommendation-notice" aria-label="추천 결과 안내">
 <div class="recommendation-notice-heading"><span class="notice-info" aria-hidden="true">i</span><h3>추천 결과를 읽기 전에</h3></div>
 <p><strong>앱과 같은 추천 엔진</strong>으로 계산한 결과예요. <strong>12문항에서 확인한 정보만 반영</strong>하므로 앱의 정밀 추천과 다를 수 있어요.</p>
 <div class="recommendation-notice-caution"><span class="notice-label">꼭 확인해 주세요</span><p><strong>${conditionNotice}</strong> 영양소 부족 진단이나 복용 처방이 아니에요. 추천 후보 수에 따라 5개보다 적을 수 있어요.</p></div>
 </aside>`;
}
function nutrientsHtml(){
 const nutrients=report.nutrients.map((n,i)=>({...n,nameKo:n.name_ko,rank:i+1}));
 return '<section aria-label="영양소 정보"><h2>간편 설문 기반 추천 영양소</h2>'+recommendationNoticeHtml()+'<div class="nutrient-list">'+(nutrients.length?nutrients.map(n=>`<div>${nutrientHtml(n)}${n.cautions?.length?`<p class="shop-caution">주의: ${n.cautions.map(escapeHtml).join(' · ')}</p>`:''}</div>`).join(''):'<p>현재 답변으로 제공할 추천 영양소가 없어요. 앱에서 정밀 설문을 진행해 주세요.</p>')+'</div></section>';
}

function shopPayload(){
 return {version:definition.version,consent:true,
  answers:Object.fromEntries(qs.map((q,i)=>[String(q.questionId),ans[i]])),
  conditions:shopTags,forms:shopForms};
}
function selectedConditionsHtml(){
 const tags=[...shopOptions.boolean_conditions,...shopOptions.groups.flatMap(group=>group.tags)];
 return shopTags.length?shopTags.map(code=>{
  const name=tags.find(tag=>tag.tag_code===code)?.tag_name||code;
  return `<button type="button" class="shop-selected-tag" data-act="shop-remove-condition" data-tag="${escapeHtml(code)}" aria-label="${escapeHtml(name)} 선택 해제">${escapeHtml(name)} <span aria-hidden="true">×</span></button>`;
 }).join(''):'<p>아직 선택한 건강정보가 없어요.</p>';
}
function conditionSearchResults(query){
 const term=query.trim().toLocaleLowerCase();
 const group=shopOptions.groups.find(item=>item.code===shopConditionGroup);
 const matches=(group?.tags||[]).filter(tag=>`${tag.tag_name} ${tag.tag_code}`.toLocaleLowerCase().includes(term));
 return {status:matches.length?`${group.name} ${matches.length}개 항목${term?' 검색됨':' · 스크롤하거나 검색해 선택해 주세요.'}`:'일치하는 항목이 없어요. 다른 단어로 검색하거나 범주를 바꿔 주세요.',
  html:matches.map(tag=>`<label class="shop-choice"><input type="checkbox" name="shop-condition" value="${escapeHtml(tag.tag_code)}" ${shopTags.includes(tag.tag_code)?'checked':''}><span>${escapeHtml(tag.tag_name)}</span></label>`).join('')};
}
function updateConditionSearch(){
 const results=conditionSearchResults(document.getElementById('shop-condition-search').value);
 document.getElementById('shop-condition-count').textContent=results.status;
 document.getElementById('shop-condition-results').innerHTML=results.html;
 document.getElementById('shop-selected').innerHTML=selectedConditionsHtml();
 document.querySelectorAll('.shop-population input[name="shop-condition"]').forEach(input=>{input.checked=shopTags.includes(input.value)});
 document.querySelectorAll('[data-act="shop-condition-group"]').forEach(button=>{
  const active=button.dataset.group===shopConditionGroup;
  button.setAttribute('aria-pressed',String(active));
  button.classList.toggle('on',active);
 });
}
function updateFormSelection(){
 const inputs=[...document.querySelectorAll('input[name="shop-form"]')];
 shopForms=inputs.filter(input=>input.checked).map(input=>input.value);
 const toggle=document.getElementById('shop-form-toggle');
 if(toggle){
  const allSelected=inputs.length>0&&shopForms.length===inputs.length;
  toggle.textContent=allSelected?'전체 해제':'전체 선택';
  toggle.setAttribute('aria-pressed',String(allSelected));
 }
}
function shopFormHtml(){
 const choice=t=>`<label class="shop-choice"><input type="checkbox" name="shop-condition" value="${escapeHtml(t.tag_code)}" ${shopTags.includes(t.tag_code)?'checked':''}><span>${escapeHtml(t.tag_name)}</span></label>`;
 const groupTabs=shopOptions.groups.map(group=>`<button type="button" class="${group.code===shopConditionGroup?'on':''}" aria-pressed="${group.code===shopConditionGroup}" aria-controls="shop-condition-results" data-act="shop-condition-group" data-group="${escapeHtml(group.code)}">${escapeHtml(group.name)}</button>`).join('');
 const initialResults=conditionSearchResults('');
 return `<div class="eyebrow">마지막 단계 · 12문항 완료</div><h1>결과에 반영할 정보를 골라주세요</h1>
 <p>원하는 제형과 해당하는 건강정보를 선택하면 HBTI·추천 영양소·상품 후보를 한 번에 보여드려요. 선택한 정보는 이 요청을 계산하는 데만 쓰고 계정에 저장하지 않아요.</p>
 <fieldset class="shop-forms"><legend>원하는 제형 <span>여러 개 선택 가능</span></legend>
 <div class="shop-form-toolbar"><p>선택하지 않으면 모든 제형에서 찾아요.</p><button id="shop-form-toggle" type="button" data-act="shop-toggle-all-forms" aria-pressed="${shopOptions.forms.length>0&&shopForms.length===shopOptions.forms.length}">${shopOptions.forms.length>0&&shopForms.length===shopOptions.forms.length?'전체 해제':'전체 선택'}</button></div>
 <div class="shop-form-options">${shopOptions.forms.map(f=>`<label class="shop-form-choice"><input type="checkbox" name="shop-form" value="${escapeHtml(f)}" ${shopForms.includes(f)?'checked':''}><span>${escapeHtml(f)}</span></label>`).join('')}</div></fieldset>
 <fieldset class="shop-conditions"><legend>해당하는 건강정보</legend><p>해당 사항이 없으면 선택하지 않아도 돼요. 선택하지 않은 조건이 없다는 뜻은 아닙니다.</p>
 <div class="shop-population">${shopOptions.boolean_conditions.map(t=>choice({tag_code:t.code,tag_name:t.name})).join('')}</div>
 <div class="shop-condition-tabs" role="group" aria-label="건강정보 범주">${groupTabs}</div>
 <label class="shop-form-label" for="shop-condition-search">현재 범주에서 검색</label>
 <input id="shop-condition-search" type="search" autocomplete="off" placeholder="이름으로 찾아보세요">
 <p id="shop-condition-count" role="status">${escapeHtml(initialResults.status)}</p>
 <div id="shop-condition-results" class="shop-condition-results">${initialResults.html}</div>
 <div class="shop-selected-wrap"><strong>선택한 건강정보</strong><div id="shop-selected" class="shop-selected">${selectedConditionsHtml()}</div></div></fieldset>
 <label class="shop-consent"><input id="shop-consent" type="checkbox"> 선택한 건강정보를 금기·주의사항 확인과 상품 후보 계산을 위해 서버로 전송하는 데 동의합니다.</label>
 <p id="shop-consent-error" role="alert"></p>
 <div class="actions"><button data-act="shop-submit">결과 한 번에 보기</button><button class="alt" data-act="shop-back">이전 질문</button></div>`;
}
function shopProductsHtml(){
 const held=shopResult.allergy_product_hold;
 const emptyMessage=held
  ? '선택한 알레르기와 상품 원료를 정확히 대조할 수 없어 상품 안내를 보류했어요.'
  : '선택하신 조건에 맞는 추천 상품이 아직 없어요.';
 const productCard=p=>{
  return `<article class="shop-product">
   <div class="shop-product-image">${p.image_url?`<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">`:'<span aria-hidden="true">상품 이미지 준비 중</span>'}</div>
   <div class="shop-product-body"><span class="shop-reviewed">라벨 검토 상품</span>
   <p class="shop-product-brand">${escapeHtml(p.brand||'브랜드 미표기')}</p><h3>${escapeHtml(p.name)}</h3>
   <p class="shop-product-meta">${[p.form,p.pack_label].filter(Boolean).map(escapeHtml).join(' · ')||'구성 정보는 판매처에서 확인'}</p>
   ${p.cautions?.length?`<p class="shop-caution">선택한 조건에 따른 주의: ${p.cautions.map(escapeHtml).join(' · ')}</p>`:''}
   <details class="shop-product-details"><summary>원료·주의사항 확인</summary>
    <p>구매 전 전체 원료·알레르겐·주의사항을 확인해 주세요.</p>
    ${p.allergens_text?`<p>알레르겐: ${escapeHtml(p.allergens_text)}</p>`:''}
    ${p.warnings_text?`<p>${escapeHtml(p.warnings_text)}</p>`:''}</details>
   <button data-act="shop-link" data-sku="${escapeHtml(p.sku_id)}" data-offer="${escapeHtml(p.offer_snapshot_id)}">쿠팡에서 상품 보기</button>
   </div></article>`;
 };
 const groups=report.nutrients.map((nutrient,i)=>{
  const products=shopResult.products.filter(p=>p.matched_nutrient_ids?.includes(nutrient.nutrient_id));
  return `<section class="shop-nutrient-group" aria-label="${escapeHtml(nutrient.name_ko)} 관련 상품">
   <div class="shop-nutrient-head"><div><span class="shop-nutrient-rank">${String(i+1).padStart(2,'0')}</span><h3>${escapeHtml(nutrient.name_ko)}</h3></div><span>${held?'안내 보류':`${products.length}개 상품`}</span></div>
   ${products.length?`<div class="shop-product-strip">${products.map(productCard).join('')}</div>`:`<p class="shop-empty">${emptyMessage}</p>`}
  </section>`;
 }).join('');
 const hasEmpty=report.nutrients.some(n=>!shopResult.products.some(p=>p.matched_nutrient_ids?.includes(n.nutrient_id)));
 const nextSteps=hasEmpty?`<div class="shop-empty-actions"><p>${held
  ? '알레르기 조건을 임의로 제외해 상품을 표시하지 않아요. 선택한 정보가 맞는지 확인해 주세요.'
  : shopForms.length?'선택한 건강정보는 유지한 채 다른 제형의 상품도 확인할 수 있어요.':'게시·검토된 상품 범위에서 일치하는 판매 옵션을 찾지 못했어요.'}</p>
  <div class="actions">${!held&&shopForms.length?'<button data-act="shop-all-forms">다른 제형까지 보기</button>':''}<button class="alt" data-act="shop-edit">선택한 정보 확인·수정</button></div></div>`:'';
 return `<section class="shop-products"><div class="shop-products-head"><div><span class="eyebrow">CURATED PICKS</span><h2>영양소별 상품 후보</h2></div></div><p>${escapeHtml(shopResult.catalog_scope||'검토된 카탈로그 상품만 표시합니다.')}</p>
 ${shopResult.products.length?'<p class="shop-partner-notice">이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>':''}
 ${groups||'<p class="shop-hold">현재 조건에 맞는 추천 영양소와 상품 후보가 없어요.</p>'}${nextSteps}</section>
 <p class="small">가격·재고·배송·최종 구성은 쿠팡 상품 페이지에서 확인해 주세요.</p>`;
}
async function loadShop(){
 const ticket=++requestId;page='loading';retryAction='shop-options';render();
 try {const data=validateShopOptions(await shortShopRequest());if(ticket!==requestId)return;shopOptions=data;if(!data.groups.some(group=>group.code===shopConditionGroup))shopConditionGroup=data.groups[0]?.code||'';page='shop';}
 catch(error){if(ticket!==requestId)return;errorMessage=error.message;page='error';}
 render();window.scrollTo(0,0);
}
async function submitShop({focusProducts=false}={}){
 const ticket=++requestId;page='loading';retryAction='shop-submit';render();
 try {
  const data=validateShopResults(await shortShopRequest(shopPayload()));
  if(ticket!==requestId)return;
  if(data.version!==definition.version)throw new Error('설문 정보가 변경되었어요. 처음부터 다시 시작해 주세요.');
  shopResult=data;report=data;type=data.result_type;page='result';
 }
 catch(error){if(ticket!==requestId)return;errorMessage=error.message;page='error';}
 render();
 if(focusProducts&&page==='result')document.querySelector('.shop-products')?.scrollIntoView?.({block:'start'});
 else window.scrollTo(0,0);
}

async function loadSurvey(){
 const ticket=++requestId;page='loading';retryAction='start';render();
 try{
  const data=validateShortDefinition(await shortRequest());
  if(ticket!==requestId)return;
  definition=data;qs=data.questions;ans=Array(qs.length).fill(null);idx=0;type='';report=null;
  shopResult=null;shopOptions=null;shopTags=[];shopForms=[];shopConditionGroup='COND';page='survey';
 }catch(error){if(ticket!==requestId)return;errorMessage=error.message;page='error';}
 render();
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
if(page==='result'){const hasEmpty=report.nutrients.some(n=>!shopResult.products.some(p=>p.matched_nutrient_ids?.includes(n.nutrient_id)));view.innerHTML=`<div class="eyebrow">YOUR QUICK RESULT</div>${type.includes('?')?'':`<img class="result-image" src="assets/types/${type}.webp" alt="나의 HBTI 캐릭터">`}${type.includes('?')?'<p class="eyebrow">두 성향이 고르게 나타난 축이 있어요</p>':`<div class="code">${type}</div>`}<h1>나의 간편 HBTI</h1><p>앱의 판정 기준을 바탕으로 환산한 간편 참고 결과예요. 48문항 정밀 결과와 다를 수 있어요.${type.includes('?')?' 한쪽으로 구분하기 어려운 축은 아래에서 두 성향을 함께 확인해 주세요.':''}</p>${profileHtml()}${nutrientsHtml()}${shopProductsHtml()}${hasEmpty?'':'<div class="actions"><button class="alt" data-act="shop-edit">제형·건강정보 수정</button></div>'}<div class="app"><h2>심층 리포트는 앱에서</h2><p>${safetyNotice}</p><button data-act="app">앱으로 이어보기 ↗</button></div><div class="actions"><button class="alt" data-act="restart">다시 검사하기</button></div>`;return}
if(page==='shop'){view.innerHTML=shopFormHtml();return}
if(page==='app'){const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);view.innerHTML=`<div class="eyebrow">YOUR NEXT HEALTH ROUTINE</div><img src="assets/하루두알_로고.jpg" alt="하루두알" style="width:76px;height:76px;margin-top:28px"><h1>나를 위한 건강 관리,<br>하루두알 앱에서.</h1><p>더 자세한 HBTI 분석부터 추천 영양소와 건강 기록까지.<br>앱에서 나만의 건강 습관을 시작해 보세요.</p><div class="locked"><h2>하루두알 다운로드</h2><p>사용하는 휴대폰의 스토어를 선택해 주세요.<br>이미 설치했다면 스토어에서 ‘열기’를 누르면 돼요.</p><div class="actions"><a class="store-link" href="https://apps.apple.com/kr/app/id6759917415" target="_blank" rel="noopener noreferrer">App Store ↗</a><a class="store-link" href="https://play.google.com/store/apps/details?id=com.harudooal.app&hl=ko" target="_blank" rel="noopener noreferrer">Google Play ↗</a></div></div>${ios?'<a class="store-link open-app" href="harudooal://">설치된 하루두알 앱 열기 →</a><p class="small">앱이 열리지 않으면 위 App Store 버튼을 눌러 주세요.</p>':''}<div class="actions"><button class="alt" data-act="${type?'result':'home'}">${type?'웹 결과로 돌아가기':'처음으로'}</button></div>`}}

document.addEventListener('click', async e => {
 const answer = e.target.closest('[data-answer]');
 if (answer && page==='survey') {
   const responseId=Number(answer.dataset.answer);
   if (!qs[idx].options.some(o=>o.responseId===responseId)) return;
   ans[idx]=responseId;
   if (idx===qs.length-1) {await loadShop();return;}
   else idx++;
 } else {
   const action=e.target.closest('[data-act]')?.dataset.act;
   if (!action) return;
   if(action==='start'){
     if(!document.getElementById('survey-consent')?.checked){document.getElementById('consent-error').textContent='분석을 시작하려면 건강정보 처리에 동의해 주세요.';return;}
     await loadSurvey();return;
   } else if(action==='restart'){page='home';report=null;shopResult=null;shopOptions=null;shopTags=[];shopForms=[];shopConditionGroup='COND';type='';ans=[];requestId++;}
   else if(action==='retry'){if(retryAction==='shop-options')await loadShop();else if(retryAction==='shop-submit')await submitShop();else await loadSurvey();return;} else if (action==='prev') {if(idx===0)page='home';else idx--;}
   else if (action==='shop-back'){page='survey';idx=qs.length-1;}
   else if (action==='shop-edit'){page='shop';}
   else if (action==='shop-toggle-all-forms'){
     const inputs=[...document.querySelectorAll('input[name="shop-form"]')];
     const selectAll=!inputs.every(input=>input.checked);
     inputs.forEach(input=>{input.checked=selectAll});
     updateFormSelection();return;
   }
   else if (action==='shop-condition-group'){
     shopConditionGroup=e.target.closest('[data-group]').dataset.group;
     document.getElementById('shop-condition-search').value='';
     updateConditionSearch();return;
   }
   else if (action==='shop-remove-condition'){
     shopTags=shopTags.filter(code=>code!==e.target.closest('[data-tag]').dataset.tag);
     updateConditionSearch();return;
   }
   else if (action==='shop-submit'){
     if(!document.getElementById('shop-consent')?.checked){document.getElementById('shop-consent-error').textContent='건강정보 처리에 동의해 주세요.';return;}
     updateFormSelection();
     await submitShop();return;
   }
   else if (action==='shop-all-forms'){
     shopForms=[];
     await submitShop({focusProducts:true});return;
   }
   else if (action==='shop-link'){
     const button=e.target.closest('[data-sku][data-offer]');
     if(!button)return;
     button.disabled=true;
     const oldText=button.textContent;button.textContent='상품 정보 확인 중…';
     try{
       const data=await shortShopRequest({...shopPayload(),sku_id:button.dataset.sku,offer_snapshot_id:button.dataset.offer},true);
       if(!validCoupangUrl(data.url))throw new Error('판매처 주소를 확인할 수 없어요.');
       window.location.assign(data.url);return;
     }catch(error){shopError=error.message;window.alert(shopError);button.disabled=false;button.textContent=oldText;return;}
   }
   else if (action==='home'){requestId++;page='home';report=null;type='';ans=[];shopResult=null;shopOptions=null;shopTags=[];shopForms=[];shopConditionGroup='COND';}
   else if (action==='result') page=type?'result':'home';
   else if (action==='app'){requestId++;page='app';}
 }
 render();window.scrollTo(0,0);
});
document.addEventListener('input',e=>{
 if(e.target.id==='shop-condition-search')updateConditionSearch();
});
document.addEventListener('change',e=>{
 if(e.target.matches('input[name="shop-form"]'))updateFormSelection();
 if(e.target.matches('input[name="shop-condition"]')){
  const code=e.target.value;
  shopTags=e.target.checked?[...new Set([...shopTags,code])]:shopTags.filter(value=>value!==code);
  updateConditionSearch();
 }
});
render();
