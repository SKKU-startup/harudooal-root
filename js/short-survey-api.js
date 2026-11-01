/* Deploy backend /surveys/short/ first. No credentials or answers in URLs/storage.
 * Configure the endpoint via the short-survey-api meta tag for local/DEV testing.
 */
async function shortRequest(payload) {
  const endpoint = document.querySelector('meta[name="short-survey-api"]')?.content
    || 'https://api.harudooal.com/api/v1/surveys/short/';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(endpoint, {
      method: payload ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: payload ? {'Content-Type':'application/json'} : {},
      body: payload ? JSON.stringify(payload) : undefined, signal: controller.signal,
    });
    if (!response.ok) throw new Error(response.status === 400
      ? '설문 정보가 변경되었거나 답변을 확인할 수 없어요. 처음부터 다시 시작해 주세요.'
      : '추천 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
    return await response.json();
  } finally { clearTimeout(timeout); }
}

function validateShortDefinition(data) {
  if (!data || typeof data.version !== 'string' || !Array.isArray(data.questions)
      || data.questions.length !== 12) throw new Error('설문 정보를 확인할 수 없어요.');
  const ids = new Set();
  for (const q of data.questions) {
    if (!Number.isInteger(q.questionId) || ids.has(q.questionId)
        || !['AS','PR','BI','CT'].includes(q.dimension) || typeof q.text !== 'string'
        || !Array.isArray(q.options) || q.options.length !== 5
        || new Set(q.options.map(o=>o.responseId)).size !== 5
        || q.options.some(o=>!Number.isInteger(o.responseId)||typeof o.label!=='string')) {
      throw new Error('설문 정보를 확인할 수 없어요.');
    }
    ids.add(q.questionId);
  }
  return data;
}

function validateShortReport(data) {
  if (!data || !/^[AS][PR][BI][CT]$/.test(data.result_type)
      || data.provisional !== true || data.personal_safety_applied !== false
      || !Array.isArray(data.groups) || data.groups.length !== 4
      || !Array.isArray(data.nutrients) || data.nutrients.length > 5) {
    throw new Error('추천 결과를 확인할 수 없어요.');
  }
  data.groups.forEach((g,i)=>{
    if (g.code !== ['AS','PR','BI','CT'][i] || !g.code.includes(g.letter)
        || !Number.isInteger(g.leftPercent) || g.leftPercent < 0 || g.leftPercent > 100
        || g.rightPercent !== 100-g.leftPercent) throw new Error('성향 결과를 확인할 수 없어요.');
  });
  if (new Set(data.nutrients.map(n=>n.nutrient_id)).size !== data.nutrients.length
      || data.nutrients.some(n=>typeof n.name_ko!=='string'||typeof n.name!=='string'
          || !Array.isArray(n.reasons)||n.reasons.some(r=>typeof r!=='string'))) {
    throw new Error('추천 결과를 확인할 수 없어요.');
  }
  return data;
}
