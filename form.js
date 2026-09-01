/* ===========================================================================
   문의 · 뉴스레터 폼
   ---------------------------------------------------------------------------
   브라우저에는 비밀키를 넣지 않는다. 공개 API가 DB 저장과 내부 메일 알림을 맡는다.
   ENDPOINT 가 비어 있을 때만 비상 대체 경로로 메일 앱을 연다.
   ========================================================================= */
var ENDPOINT = 'https://api.harudooal.com/api/v1/users/public/website-submissions/';
var MAIL_TO  = 'support@harudooal.com';

/* 앱의 실제 데이터. src/constants/hbtiCatchphrases.ts, hbtiVisualThemes.ts */
var TYPES = [
  ['APBC', '#2563A6', '활발하고 균형 잡힌, 침착한 건강 리더'],
  ['APBT', '#765900', '에너지 넘치는 도전가, 긴장을 원동력으로 바꾸는 사람'],
  ['APIC', '#454EA1', '적극적이지만 영양은 아직, 차분히 개선해 나가는 사람'],
  ['APIT', '#237A4A', '열정 가득한 행동파, 균형 관리가 다음 과제'],
  ['ARBC', '#A13F64', '활동적이면서 느긋한, 균형 잡힌 자연주의자'],
  ['ARBT', '#08738A', '움직이는 것은 좋아하지만, 건강은 감에 맡기는 타입'],
  ['ARIC', '#805325', '에너지는 높지만, 식습관 점검이 필요한 사람'],
  ['ARIT', '#625A34', '끊임없이 움직이는 에너자이저, 루틴이 필요한 순간'],
  ['SPBC', '#456A96', '조용하지만 철저한, 균형의 달인'],
  ['SPBT', '#5A4D3C', '계획적인 안정주의자, 가끔 긴장을 푸는 연습이 필요해요'],
  ['SPIC', '#8A5C00', '꼼꼼한 관리자인데, 영양 밸런스를 놓치기 쉬운 타입'],
  ['SPIT', '#9A4B14', '신중하지만 예민한, 마음 관리가 건강의 열쇠'],
  ['SRBC', '#0B7480', '느긋한 안정파, 균형 잡힌 식습관이 장점'],
  ['SRBT', '#536677', '편안함을 추구하지만, 스트레스에 민감한 쉼표형'],
  ['SRIC', '#3557A8', '조용히 쉬는 것을 좋아하지만, 영양 관리가 숙제'],
  ['SRIT', '#76543D', '에너지 충전이 필요한, 섬세한 감성파']
];

(function () {
  'use strict';

  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  /* ── 유형 고르개: 16장을 진짜 라디오로 깐다 ───────────────────────────── */
  var grid = document.querySelector('[data-picker]');
  if (grid) {
    TYPES.forEach(function (t) {
      var label = el('label', 'pick');
      var input = el('input');
      input.type = 'radio'; input.name = 'hbti'; input.value = t[0];
      input.setAttribute('aria-label', t[0] + '. ' + t[2]);

      var face = el('span');
      face.style.setProperty('--c', t[1]);
      var img = el('img');
      img.src = 'assets/types/' + t[0] + '.webp';
      img.alt = ''; img.width = 560; img.height = 560; img.loading = 'lazy'; img.decoding = 'async';
      var code = document.createTextNode(t[0]);

      face.appendChild(img); face.appendChild(code);
      label.appendChild(input); label.appendChild(face);
      grid.appendChild(label);
    });
  }

  /* ── 검증: 흐릿한 "입력이 올바르지 않습니다" 대신 무엇이 문제인지 말한다 ── */
  var form = document.querySelector('[data-form]');
  if (!form) return;
  var kind = form.getAttribute('data-form');
  var status = document.getElementById('status');
  var button = form.querySelector('.send');

  function fail(field, msg) {
    var box = document.getElementById(field.getAttribute('aria-describedby'));
    if (box) box.textContent = msg;
    field.setAttribute('aria-invalid', 'true');
    return false;
  }
  function pass(field) {
    var box = document.getElementById(field.getAttribute('aria-describedby'));
    if (box) box.textContent = '';
    field.removeAttribute('aria-invalid');
    return true;
  }

  function checkEmail(f) {
    var v = f.value.trim();
    if (!v) return fail(f, '답장을 받을 이메일 주소를 적어주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail(f, '@ 와 도메인이 들어간 주소인지 확인해 주세요. 예: name@example.com');
    return pass(f);
  }
  function checkBody(f) {
    var v = f.value.trim();
    if (v.length < 5) return fail(f, '어떤 이야기인지 한 줄이라도 적어주시면 답하기 좋아요.');
    return pass(f);
  }

  var email = form.querySelector('input[type="email"]');
  var body = form.querySelector('textarea');
  /* 채워 넣은 값은 절대 지우지 않는다. 검증은 칸을 떠날 때 한 번. */
  if (email) email.addEventListener('blur', function () { if (email.value) checkEmail(email); });
  if (body) body.addEventListener('blur', function () { if (body.value) checkBody(body); });

  function requiredConsents() {
    return Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"][required]'));
  }

  function payload() {
    var data = { kind: kind, email: email.value.trim(), at: new Date().toISOString() };
    var topic = form.querySelector('select');
    if (topic) data.topic = topic.value;
    if (body) data.message = body.value.trim();
    var picked = form.querySelector('input[name="hbti"]:checked');
    if (picked) data.hbti = picked.value;
    var privacy = form.querySelector('#agree-privacy');
    var marketing = form.querySelector('#agree-ads');
    var useType = form.querySelector('#agree-type');
    var trap = form.querySelector('input[name="website"]');
    data.privacyConsent = Boolean(privacy && privacy.checked);
    data.marketingConsent = Boolean(marketing && marketing.checked);
    data.typeUseConsent = Boolean(useType && useType.checked);
    data.website = trap ? trap.value : '';
    return data;
  }

  function asMail(d) {
    var subject, lines;
    if (kind === 'contact') {
      subject = '[문의] ' + (d.topic || '기타');
      lines = ['보낸 사람: ' + d.email, '문의 유형: ' + (d.topic || '기타'), '', d.message, '',
               '— 개인정보 수집·이용에 동의함 (' + d.at + ')'];
    } else {
      subject = '[뉴스레터 구독] ' + (d.hbti || '유형 미선택');
      lines = ['구독 주소: ' + d.email,
               '유형: ' + (d.hbti || '아직 모름'),
               '유형 활용 동의(선택): ' + (d.typeUseConsent ? '동의함' : '동의 안 함'),
               '',
               '— 개인정보 수집·이용 및 광고성 정보 수신에 동의함 (' + d.at + ')'];
    }
    return 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent(subject) +
           '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function say(msg, tone) {
    status.textContent = msg;
    status.className = 'status' + (tone ? ' is-' + tone : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okAll = true;
    if (!checkEmail(email)) okAll = false;
    if (body && !checkBody(body)) okAll = false;

    var missing = requiredConsents().filter(function (c) { return !c.checked; });
    if (missing.length) {
      okAll = false;
      say('보내기 전에 필수 동의에 체크해 주세요. 동의는 언제든 철회할 수 있어요.', 'bad');
      missing[0].focus();
    }
    if (!okAll) {
      var firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      if (!missing.length) say('빨간 줄이 있는 칸을 확인해 주세요.', 'bad');
      return;
    }

    var data = payload();

    if (!ENDPOINT) {
      /* 아직 받는 곳이 없다. 메일 앱을 열어 같은 내용을 그대로 채워 준다. */
      say('메일 앱을 열었어요. 열리지 않았다면 ' + MAIL_TO + ' 으로 그대로 보내주셔도 돼요.', 'good');
      location.href = asMail(data);
      return;
    }

    button.disabled = true;
    say('보내는 중이에요.');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      form.reset();
      say(kind === 'contact'
        ? '잘 받았어요. 적어주신 주소로 답장드릴게요.'
        : '구독이 접수됐어요. 첫 편지가 도착하면 확인해 주세요.', 'good');
    }).catch(function () {
      say('보내지 못했어요. 잠시 뒤 다시 시도하시거나 ' + MAIL_TO + ' 으로 보내주세요.', 'bad');
    }).then(function () { button.disabled = false; });
  });
})();
