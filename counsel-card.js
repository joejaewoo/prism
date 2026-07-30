// PRISM 상담용 한 장 요약 카드 (counsel-card.js)
// ================================================================
// 4-3. 상담 테이블에서 바로 쓰는 1장.
// 3단 구성:
//   ① 이 아이는 어떤 성향인가 (핵심만)
//   ② 그래서 지금 어디가 힘들 수 있는가 (4-1 리스크 + 4-2 friction)
//   ③ 그래서 우리가 이렇게 하겠다 (케어 계획 + 필요 환경)
//
// 화면/인쇄 겸용 HTML 문자열을 반환한다.
// 사용: document.getElementById('x').innerHTML = renderCounselCard(result, meta);
//   result: scoreTest 반환값,  meta: { name, grade, school, gradeGroup }
//
// 의존: interpretations.js (LAYER1/2_INTERPRET, getEnergyBandLabel),
//       risk.js (evaluateRisks, evaluateEnvironment, DISCLAIMER, NO_RISK_MESSAGE)

function renderCounselCard(result, meta = {}) {
  const l1 = LAYER1_INTERPRET[result.layer1.typeKey] || {};
  const l2 = LAYER2_INTERPRET[result.layer2.typeKey] || {};
  const risks = evaluateRisks(result.pct);
  const env = evaluateEnvironment(result.pct);

  const name = meta.name || '학생';
  const gradeStr = [meta.grade, meta.school].filter(Boolean).join(' · ');

  // L3 밴드 라벨 3개 (자신감/회복력/무대) 요약
  const l3summary = ['confidence', 'resilience', 'stage']
    .map(d => {
      const label = (typeof getEnergyBandLabel === 'function') ? getEnergyBandLabel(d, result.pct[d]) : '';
      return `<span class="cc-band">${label}</span>`;
    }).join('');

  // ② 힘들 수 있는 부분: 리스크 when + friction 합쳐서, 상위 3개만 (한 장 고정)
  const concerns = [];
  risks.items.forEach(r => concerns.push(r.when));
  env.friction.forEach(f => concerns.push(f.text));
  const concernShown = concerns.slice(0, 3);
  const concernHtml = concernShown.length > 0
    ? concernShown.map(c => `<li>${c}</li>`).join('')
    : `<li class="cc-none">${(typeof NO_RISK_MESSAGE !== 'undefined') ? NO_RISK_MESSAGE : '특별히 살펴볼 신호는 없습니다.'}</li>`;

  // ③ 케어 계획: 리스크 care + 필요 환경 needs 합쳐서, 상위 3개만 (한 장 고정)
  const plans = [];
  risks.items.forEach(r => plans.push(r.care));
  env.needs.forEach(n => plans.push(n.text));
  const planHtml = plans.slice(0, 3).map(p => `<li>${p}</li>`).join('');

  const disclaimer = (typeof DISCLAIMER !== 'undefined') ? DISCLAIMER : '';

  return `
<div class="counsel-card">
  <div class="cc-head">
    <div class="cc-title">${name} <span class="cc-sub">${gradeStr}</span></div>
    <div class="cc-logo">PRISM 상담 요약</div>
  </div>

  <!-- ① 성향 -->
  <div class="cc-section">
    <div class="cc-label cc-l1">① 이 아이는 이런 성향입니다</div>
    <div class="cc-persona">
      <span class="cc-tag cc-tag-l1">${l1.persona || ''} · ${l1.title || ''}</span>
      <span class="cc-tag cc-tag-l2">${l2.title || ''}</span>
    </div>
    <p class="cc-desc">${l1.desc || ''}</p>
    <div class="cc-bands">${l3summary}</div>
  </div>

  <!-- ② 힘들 수 있는 부분 -->
  <div class="cc-section">
    <div class="cc-label cc-l2">② 그래서 이런 부분이 힘들 수 있어요</div>
    <ul class="cc-list cc-concern">${concernHtml}</ul>
  </div>

  <!-- ③ 케어 계획 -->
  <div class="cc-section">
    <div class="cc-label cc-l3">③ 그래서 저희는 이렇게 하겠습니다</div>
    <ul class="cc-list cc-plan">${planHtml}</ul>
  </div>

  <div class="cc-foot">${disclaimer}</div>
</div>`;
}

// 카드 전용 CSS (결과지와 별도로 삽입해서 씀)
const COUNSEL_CARD_CSS = `
.counsel-card{max-width:640px;margin:0 auto;background:#fff;border:1px solid #DDE1E8;border-radius:16px;padding:28px 26px;font-family:'Pretendard',sans-serif;color:#1C2541;line-height:1.6}
.cc-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1C2541;padding-bottom:14px;margin-bottom:18px}
.cc-title{font-size:22px;font-weight:700}
.cc-sub{font-size:14px;color:#4A5578;font-weight:400;margin-left:8px}
.cc-logo{font-size:12px;font-weight:700;letter-spacing:.1em;color:#9A937F}
.cc-section{margin-bottom:20px}
.cc-label{font-size:14px;font-weight:700;padding:6px 12px;border-radius:8px;display:inline-block;margin-bottom:10px}
.cc-l1{background:#FDE9DF;color:#E8633C}
.cc-l2{background:#DEF1ED;color:#2A9D8F}
.cc-l3{background:#E7E1F2;color:#6B5CA5}
.cc-persona{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.cc-tag{font-size:13px;font-weight:700;padding:5px 12px;border-radius:100px;color:#fff}
.cc-tag-l1{background:#E8633C}
.cc-tag-l2{background:#2A9D8F}
.cc-desc{font-size:13.5px;color:#4A5578;margin-bottom:10px}
.cc-bands{display:flex;gap:6px;flex-wrap:wrap}
.cc-band{font-size:12px;font-weight:600;color:#6B5CA5;background:#F1EEF8;padding:4px 10px;border-radius:100px}
.cc-list{list-style:none;padding:0;margin:0}
.cc-list li{font-size:13.5px;color:#4A5578;padding:8px 0 8px 20px;position:relative;border-bottom:1px solid #F0F0F0}
.cc-list li:last-child{border-bottom:none}
.cc-concern li:before{content:'•';position:absolute;left:4px;color:#E8A33C;font-weight:700}
.cc-plan li:before{content:'✓';position:absolute;left:2px;color:#2A9D8F;font-weight:700}
.cc-none{color:#2A9D8F !important}
.cc-none:before{content:'✓' !important;color:#2A9D8F !important}
.cc-foot{font-size:11px;color:#9A937F;line-height:1.5;border-top:1px solid #DDE1E8;padding-top:12px;margin-top:6px}

/* ===== 인쇄 전용: A4 한 장 고정 + 색상 또렷하게 ===== */
@media print{
  @page{size:A4;margin:14mm}
  /* 배경색·배지 색이 인쇄에서도 그대로 나오도록 강제 */
  *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  body{background:#fff !important;padding:0 !important;margin:0 !important}

  .counsel-card{
    border:none !important;box-shadow:none !important;
    max-width:100% !important;width:100% !important;
    margin:0 !important;padding:0 !important;
  }

  /* 헤더는 크게, 나머지는 살짝 조여서 한 장에 */
  .cc-head{padding-bottom:10px;margin-bottom:14px}
  .cc-title{font-size:20px}
  .cc-sub{font-size:13px}
  .cc-logo{font-size:11px}

  /* 각 섹션이 페이지 중간에서 잘리지 않도록 */
  .cc-section{margin-bottom:14px;page-break-inside:avoid;break-inside:avoid}
  .cc-label{font-size:13px;padding:5px 11px;margin-bottom:8px}
  .cc-persona{margin-bottom:8px}
  .cc-tag{font-size:12.5px;padding:4px 11px}
  .cc-desc{font-size:12.5px;margin-bottom:8px;line-height:1.5}
  .cc-band{font-size:11px;padding:3px 9px}

  .cc-list li{font-size:12.5px;padding:6px 0 6px 20px;line-height:1.5;page-break-inside:avoid;break-inside:avoid}
  /* 배지·불릿 색상 인쇄 강제 (일부 브라우저가 :before 색을 지우는 것 방지) */
  .cc-l1{background:#FDE9DF !important;color:#E8633C !important}
  .cc-l2{background:#DEF1ED !important;color:#2A9D8F !important}
  .cc-l3{background:#E7E1F2 !important;color:#6B5CA5 !important}
  .cc-tag-l1{background:#E8633C !important;color:#fff !important}
  .cc-tag-l2{background:#2A9D8F !important;color:#fff !important}
  .cc-band{background:#F1EEF8 !important;color:#6B5CA5 !important}
  .cc-concern li:before{color:#E8A33C !important}
  .cc-plan li:before{color:#2A9D8F !important}

  .cc-foot{font-size:10px;padding-top:10px;margin-top:4px}
}
`;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCounselCard, COUNSEL_CARD_CSS };
}
