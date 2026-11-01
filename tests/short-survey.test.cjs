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
function setup(fetcher){
 const view={dataset:{},innerHTML:''}, consent={checked:false}, error={textContent:''};
 const calls=[];let click;
 const context=vm.createContext({AbortController,setTimeout,clearTimeout,
 document:{querySelector:()=>null,getElementById:id=>id==='view'?view:id==='survey-consent'?consent:id==='consent-error'?error:{focus(){}},addEventListener:(_,h)=>click=h},
 window:{scrollTo(){}},navigator:{userAgent:'Android'},
 fetch:async(url,options)=>{calls.push({url,options});return fetcher?fetcher(url,options):{ok:true,json:async()=>structuredClone(options.method==='POST'?result:definition)};}});
 for(const f of ['short-survey-api.js','short-survey.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context);
 return {view,consent,error,calls,run:s=>vm.runInContext(s,context),
 click:(kind,value)=>click({target:{closest:s=>s===`[data-${kind}]`?{dataset:{[kind]:String(value)}}:null}})};
}
async function complete(app){app.consent.checked=true;await app.click('act','start');
 for(const q of definition.questions)await app.click('answer',q.options[2].responseId);}

test('12 original items, 3 per axis, 5 choices (source fixture only)',()=>{
 assert.equal(definition.questions.length,12);
 for(const code of ['AS','PR','BI','CT'])assert.equal(definition.questions.filter(q=>q.dimension===code).length,3);
 for(const q of definition.questions)assert.equal(q.options.length,5);
});
test('consent required; server mapping and reasons; no login or fake fallback',async()=>{
 const app=setup();await app.click('act','start');assert.equal(app.calls.length,0);
 assert.match(app.error.textContent,/동의/);await complete(app);
 assert.equal(app.run('page'),'result');assert.equal(app.calls.length,2);
 const sent=JSON.parse(app.calls[1].options.body);
 assert.equal(Object.keys(sent.answers).length,12);assert.equal(sent.consent,true);
 assert.equal(app.calls[1].options.credentials,'omit');
 assert.match(app.view.innerHTML,/서버 추천 이유 0/);assert.doesNotMatch(app.view.innerHTML,/추천 이유 예시|50%/);
 assert.match(app.view.innerHTML,/건강 특이사항을 등록하면/);
 assert.match(app.view.innerHTML,/class="recommendation-notice" aria-label="추천 결과 안내"/);
 assert.match(app.view.innerHTML,/<strong>개인별 금기 필터는 적용되지 않았으며,<\/strong>/);
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
 await complete(app);assert.match(app.view.innerHTML,/제공할 추천 영양소가 없어요/);
 assert.doesNotMatch(app.view.innerHTML,/nutrient-card/);
 assert.equal(app.run('escapeHtml("<script>")'),'&lt;script&gt;');
});
test('reject malformed server result',()=>{
 const app=setup();assert.throws(()=>app.run('validateShortReport({})'));
 assert.throws(()=>app.run('validateShortDefinition({questions:[]})'));
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
