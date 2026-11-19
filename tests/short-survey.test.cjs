const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const fixtureContext=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'js/short-survey-data.js'),'utf8'),fixtureContext);
const definition=JSON.parse(vm.runInContext('JSON.stringify(surveyDefinition)',fixtureContext));
const result={version:definition.version,result_type:'ARBC',provisional:true,
 personal_safety_applied:false,groups:['AS','PR','BI','CT'].map((code,i)=>({
 code,letter:'ARBC'[i],leftPercent:i===0?50:75,rightPercent:i===0?50:25})),
 nutrients:Array.from({length:5},(_,i)=>({nutrient_id:'n'+i,name:'N'+i,name_ko:'영양소'+i,
 rank:i+1,reason:'서버 추천 이유 '+i,reasons:['서버 근거 '+i]}))};
const shopOptions={forms:['정제','분말'],groups:[
 {code:'ALLERGY',name:'알레르기',tags:[{tag_code:'ALLERGY_DAIRY',tag_name:'유제품 알레르기'}]},
 {code:'COND',name:'신체 상태/질환',tags:[{tag_code:'COND_THYROID',tag_name:'갑상선 질환'}]},
 {code:'MED',name:'약물 복용',tags:[{tag_code:'MED_WARFARIN',tag_name:'와파린 복용'}]},
],boolean_conditions:[{code:'POP_PREGNANT',name:'임신 중'}]};
const shopResult={...result,personal_safety_applied:true,safety_notice:'선택한 조건만 반영',catalog_scope:'게시 상품',allergy_product_hold:false,
 nutrients:result.nutrients.map(n=>({...n,cautions:[]})),products:[]};
function setup(fetcher,selectedForms=[]){
 const view={dataset:{},innerHTML:''}, consent={checked:false}, shopConsent={checked:false},error={textContent:''};
 const search={value:''},searchCount={textContent:''},searchResults={innerHTML:''},selected={innerHTML:''};
 const formInputs=shopOptions.forms.map(value=>({value,checked:selectedForms.includes(value)}));
 const formToggle={textContent:'',attributes:{},setAttribute(name,value){this.attributes[name]=value}};
 const calls=[],handlers={};
 const context=vm.createContext({AbortController,setTimeout,clearTimeout,URL,
 document:{querySelector:()=>null,querySelectorAll:selector=>selector==='input[name="shop-form"]'?formInputs:[],getElementById:id=>id==='view'?view:id==='survey-consent'?consent:id==='shop-consent'?shopConsent:id==='shop-form-toggle'?formToggle:id==='shop-condition-search'?search:id==='shop-condition-count'?searchCount:id==='shop-condition-results'?searchResults:id==='shop-selected'?selected:id==='consent-error'||id==='shop-consent-error'?error:{focus(){}},addEventListener:(kind,h)=>{handlers[kind]=h}},
 window:{scrollTo(){}},navigator:{userAgent:'Android'},
 fetch:async(url,options)=>{calls.push({url,options});return fetcher?fetcher(url,options):{ok:true,json:async()=>structuredClone(String(url).includes('/shop/')?options.method==='POST'?shopResult:shopOptions:definition)};}});
 for(const f of ['short-survey-api.js','short-shop-api.js','short-survey.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context);
 return {view,consent,shopConsent,error,calls,searchResults,selected,formInputs,formToggle,run:s=>vm.runInContext(s,context),
 click:(kind,value)=>handlers.click({target:{closest:s=>s===`[data-${kind}]`?{dataset:{[kind]:String(value)}}:null}}),
 search:query=>{search.value=query;handlers.input({target:{id:'shop-condition-search'}})},
 toggleForm:(value,checked)=>{const input=formInputs.find(item=>item.value===value);input.checked=checked;handlers.change({target:{matches:s=>s==='input[name="shop-form"]'}})},
 toggleCondition:(value,checked)=>handlers.change({target:{matches:s=>s==='input[name="shop-condition"]',value,checked}}),
 switchGroup:group=>handlers.click({target:{closest:s=>s==='[data-act]'?{dataset:{act:'shop-condition-group'}}:s==='[data-group]'?{dataset:{group}}:null}}),
 removeCondition:value=>handlers.click({target:{closest:s=>s==='[data-act]'?{dataset:{act:'shop-remove-condition'}}:s==='[data-tag]'?{dataset:{tag:value}}:null}})};
}
async function complete(app){app.consent.checked=true;await app.click('act','start');
 for(const q of definition.questions)await app.click('answer',q.options[2].responseId);}
async function finish(app){app.shopConsent.checked=true;await app.click('act','shop-submit');}

test('12 original items, 3 per axis, 5 choices (source fixture only)',()=>{
 assert.equal(definition.questions.length,12);
 for(const code of ['AS','PR','BI','CT'])assert.equal(definition.questions.filter(q=>q.dimension===code).length,3);
 for(const q of definition.questions)assert.equal(q.options.length,5);
});
test('consent required; server mapping and reasons; no login or fake fallback',async()=>{
 const app=setup();await app.click('act','start');assert.equal(app.calls.length,0);
 assert.match(app.error.textContent,/동의/);await complete(app);
 assert.equal(app.run('page'),'shop');assert.equal(app.calls.length,2);
 await finish(app);assert.equal(app.run('page'),'result');assert.equal(app.calls.length,3);
 const sent=JSON.parse(app.calls[2].options.body);
 assert.equal(Object.keys(sent.answers).length,12);assert.equal(sent.consent,true);
 assert.equal(app.calls[2].options.credentials,'omit');
 assert.match(app.view.innerHTML,/서버 추천 이유 0/);assert.doesNotMatch(app.view.innerHTML,/추천 이유 예시|50%/);
 assert.match(app.view.innerHTML,/건강 특이사항을 등록하면/);
 assert.match(app.view.innerHTML,/class="recommendation-notice" aria-label="추천 결과 안내"/);
 assert.match(app.view.innerHTML,/건강 특이사항을 선택하지 않아 개인별 금기 필터는 적용되지 않았어요/);
 assert.match(app.view.innerHTML,/<strong>앱과 같은 추천 엔진<\/strong>/);
 assert.doesNotMatch(app.view.innerHTML,/safety-warning/);
 assert.match(app.view.innerHTML,/금기.*심층 리포트/);
 assert.equal((app.view.innerHTML.match(/class="nutrient-card"/g)||[]).length,5);
 await app.click('act','app');await app.click('act','result');assert.equal(app.run('page'),'result');
 await app.click('act','restart');assert.equal(app.run('page'),'home');assert.equal(app.run('ans.length'),0);
});
test('network failure shows retry, never fixed nutrients',async()=>{
 const app=setup(async()=>{throw new Error('offline')});app.consent.checked=true;
 await app.click('act','start');assert.equal(app.run('page'),'error');
 assert.match(app.view.innerHTML,/다시 시도/);assert.doesNotMatch(app.view.innerHTML,/nutrient-card/);
});
test('late response cannot replace page after leaving',async()=>{
 let resolve;const app=setup(()=>new Promise(r=>resolve=r));app.consent.checked=true;
 const pending=app.click('act','start');await app.click('act','home');
 resolve({ok:true,json:async()=>definition});await pending;assert.equal(app.run('page'),'home');
});
test('server strings escaped and empty results do not invent recommendations',async()=>{
 const app=setup(async(_,o)=>({ok:true,json:async()=>o.method==='POST'?{...result,nutrients:[]}:definition}));
 await complete(app);assert.equal(app.run('page'),'error');
 assert.doesNotMatch(app.view.innerHTML,/nutrient-card/);
 const empty=setup(async(url,o)=>({ok:true,json:async()=>String(url).includes('/shop/')?o.method==='POST'?{...shopResult,nutrients:[]}:shopOptions:definition}));
 await complete(empty);await finish(empty);assert.match(empty.view.innerHTML,/제공할 추천 영양소가 없어요/);
 assert.doesNotMatch(empty.view.innerHTML,/nutrient-card/);
 assert.equal(app.run('escapeHtml("<script>")'),'&lt;script&gt;');
});
test('reject malformed server result',()=>{
 const app=setup();assert.throws(()=>app.run('validateShortReport({})'));
 assert.throws(()=>app.run('validateShortDefinition({questions:[]})'));
});
test('shopping guide keeps anonymous payload and blocks unsafe destinations',async()=>{
 const productResult={...shopResult,nutrients:[{...shopResult.nutrients[0],cautions:['주의하세요']}],products:[{sku_id:'safe-sku',offer_snapshot_id:'uuid',name:'<상품>',form:'정제',matched_nutrient_ids:['n0'],cautions:[],warnings_text:'라벨 확인'}]};
 const app=setup(async(url,options)=>({ok:true,json:async()=>
  String(url).includes('/shop/')?options.method==='POST'?productResult:shopOptions:definition}));
 await complete(app);
 assert.equal(app.run('page'),'shop');
 assert.doesNotMatch(app.view.innerHTML,/유제품 알레르기/);
 await app.switchGroup('ALLERGY');
 app.search('유제품');
 assert.match(app.searchResults.innerHTML,/유제품 알레르기/);
 assert.match(app.view.innerHTML,/선택한 건강정보를/);
 await finish(app);assert.equal(app.run('page'),'result');
 assert.match(app.view.innerHTML,/서버 추천 이유 0/);
 assert.match(app.view.innerHTML,/영양소별 상품 후보/);
 assert.match(app.view.innerHTML,/aria-label="영양소0 관련 상품"/);
 assert.equal((app.view.innerHTML.match(/class="shop-product"/g)||[]).length,1);
 assert.match(app.view.innerHTML,/&lt;상품&gt;/);
 assert.equal(app.run('validCoupangUrl("https://evil.example/")'),false);
 assert.equal(app.run('validCoupangUrl("https://www.coupang.com/vp/products/1")'),true);
 assert.equal(app.run('escapeHtml("<상품>")'),'&lt;상품&gt;');
 assert.throws(()=>app.run('validateShopResults({})'));
});
test('empty products offer other forms while retaining health conditions',async()=>{
 const app=setup(undefined,['정제']);
 await complete(app);app.toggleCondition('POP_PREGNANT',true);await finish(app);
 assert.match(app.view.innerHTML,/선택하신 조건에 맞는 추천 상품이 아직 없어요/);
 assert.match(app.view.innerHTML,/data-act="shop-all-forms"/);
 await app.click('act','shop-all-forms');
 assert.equal(app.run('page'),'result');
 assert.equal(app.run('shopForms.length'),0);
 const payload=JSON.parse(app.calls.at(-1).options.body);
 assert.deepEqual(payload.forms,[]);
 assert.deepEqual(payload.conditions,['POP_PREGNANT']);
 assert.doesNotMatch(app.view.innerHTML,/data-act="shop-all-forms"/);
 assert.match(app.view.innerHTML,/선택한 정보 확인·수정/);
});
test('allergy hold is not presented as a missing-match or form-change problem',async()=>{
 const app=setup(async(url,options)=>({ok:true,json:async()=>
  String(url).includes('/shop/')?options.method==='POST'?{...shopResult,allergy_product_hold:true}:shopOptions:definition}),['정제']);
 await complete(app);app.toggleCondition('ALLERGY_DAIRY',true);await finish(app);
 assert.match(app.view.innerHTML,/상품 안내를 보류했어요/);
 assert.match(app.view.innerHTML,/알레르기 조건을 임의로 제외해 상품을 표시하지 않아요/);
 assert.doesNotMatch(app.view.innerHTML,/data-act="shop-all-forms"|선택하신 조건에 맞는 추천 상품이 아직 없어요/);
});
test('multiple form selections are sent together and retained for edits',async()=>{
 const app=setup(undefined,['정제','분말']);
 await complete(app);
 assert.match(app.view.innerHTML,/여러 개 선택 가능/);
 await finish(app);
 assert.deepEqual(JSON.parse(app.calls.at(-1).options.body).forms,['정제','분말']);
 await app.click('act','shop-edit');
 assert.match(app.view.innerHTML,/value="정제" checked/);
 assert.match(app.view.innerHTML,/value="분말" checked/);
});
test('select all forms checks every option and can be cleared again',async()=>{
 const app=setup();await complete(app);
 assert.match(app.view.innerHTML,/data-act="shop-toggle-all-forms"[^>]*>전체 선택/);
 await app.click('act','shop-toggle-all-forms');
 assert(app.formInputs.every(input=>input.checked));
 assert.equal(app.formToggle.textContent,'전체 해제');
 assert.equal(app.run('shopForms.length'),shopOptions.forms.length);
 await app.click('act','shop-toggle-all-forms');
 assert(app.formInputs.every(input=>!input.checked));
 assert.equal(app.formToggle.textContent,'전체 선택');
 app.toggleForm('정제',true);
 assert.equal(app.formToggle.textContent,'전체 선택');
 await app.click('act','shop-toggle-all-forms');
 await finish(app);
 assert.deepEqual(JSON.parse(app.calls.at(-1).options.body).forms,shopOptions.forms);
});
test('health-condition search hides the full list and keeps selected tags removable',async()=>{
 const app=setup();await complete(app);
 assert.doesNotMatch(app.view.innerHTML,/유제품 알레르기/);
 assert.match(app.view.innerHTML,/갑상선 질환/);
 await app.switchGroup('ALLERGY');
 assert.match(app.searchResults.innerHTML,/유제품 알레르기/);
 app.search('유제품');
 assert.match(app.searchResults.innerHTML,/유제품 알레르기/);
 app.toggleCondition('ALLERGY_DAIRY',true);
 assert.match(app.selected.innerHTML,/유제품 알레르기 선택 해제/);
 app.search('없는검색어');
 assert.equal(app.searchResults.innerHTML,'');
 assert.match(app.selected.innerHTML,/유제품 알레르기/);
 await app.removeCondition('ALLERGY_DAIRY');
 assert.equal(app.run('shopTags.length'),0);
 assert.match(app.selected.innerHTML,/아직 선택한 건강정보가 없어요/);
});
test('assets exist; obsolete browser scoring not loaded',()=>{
 const homepage=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const menu=homepage.match(/<div class="mark">([\s\S]*?)<\/div>/)[1];
 assert.match(menu,/<a class="mark__survey" href="survey.html">간편 HBTI 검사<\/a>/);
 assert(menu.indexOf('survey.html')<menu.indexOf('contact.html'));
 assert(menu.indexOf('contact.html')<menu.indexOf('newsletter.html'));
 const html=fs.readFileSync(path.join(root,'survey.html'),'utf8');
 assert.doesNotMatch(html,/short-survey-score|short-survey-data/);
 for(const [,file]of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!file.includes('://'))assert(fs.existsSync(path.join(root,file)),file);
});
