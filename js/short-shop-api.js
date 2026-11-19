/* Anonymous, non-persistent shopping guide. Health choices stay in JS memory only. */
async function shortShopRequest(payload, link = false) {
  const surveyEndpoint = document.querySelector('meta[name="short-survey-api"]')?.content
    || 'https://api.harudooal.com/api/v1/surveys/short/';
  const endpoint = new URL(link ? 'shop/link/' : 'shop/', surveyEndpoint);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(endpoint, {
      method: payload ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: payload ? {'Content-Type':'application/json'} : {},
      body: payload ? JSON.stringify(payload) : undefined, signal: controller.signal,
    });
    if (!response.ok) throw new Error(response.status === 400
      ? '선택 항목이나 설문 판본이 변경됐어요. 다시 확인해 주세요.'
      : response.status === 404
        ? '상품 정보가 변경됐어요. 목록을 다시 확인해 주세요.'
        : '상품 안내 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
    return await response.json();
  } finally { clearTimeout(timeout); }
}
function validateShopOptions(data) {
  if (!data || !Array.isArray(data.forms) || !Array.isArray(data.groups)
      || !Array.isArray(data.boolean_conditions)
      || data.forms.some(v => typeof v !== 'string')
      || data.groups.some(g => !Array.isArray(g.tags) || g.tags.some(t =>
        typeof t.tag_code !== 'string' || typeof t.tag_name !== 'string'))) {
    throw new Error('선택 항목을 확인할 수 없어요.');
  }
  return data;
}
function validateShopResults(data) {
  if (!data || !/^[AS][PR][BI][CT]$/.test(data.result_type)
      || typeof data.version !== 'string' || data.provisional !== true
      || data.personal_safety_applied !== true
      || !Array.isArray(data.groups) || data.groups.length !== 4
      || !Array.isArray(data.nutrients) || data.nutrients.length > 5
      || !Array.isArray(data.products) || data.products.length > 12
      || typeof data.safety_notice !== 'string'
      || data.nutrients.some(n => typeof n.nutrient_id !== 'string'
        || typeof n.name_ko !== 'string' || !Array.isArray(n.cautions))
      || data.products.some(p => typeof p.sku_id !== 'string'
        || typeof p.offer_snapshot_id !== 'string' || typeof p.name !== 'string')) {
    throw new Error('상품 안내 결과를 확인할 수 없어요.');
  }
  data.groups.forEach((g, i) => {
    if (g.code !== ['AS', 'PR', 'BI', 'CT'][i] || !g.code.includes(g.letter)
        || !Number.isInteger(g.leftPercent) || g.leftPercent < 0 || g.leftPercent > 100
        || g.rightPercent !== 100 - g.leftPercent) {
      throw new Error('성향 결과를 확인할 수 없어요.');
    }
  });
  return data;
}
function validCoupangUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['www.coupang.com', 'link.coupang.com', 'coupa.ng'].includes(url.hostname)
      && !url.username && !url.password;
  } catch { return false; }
}
