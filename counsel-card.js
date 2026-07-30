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
  <div class="section-title">🗂 상담 요약 카드</div>
  <p style="font-size:13px; color:var(--ink-soft); margin-bottom:18px;">상담 테이블에서 바로 쓰는 한 장 요약입니다. 성향 → 힘들 수 있는 점 → 케어 계획 순으로 정리했어요.</p>

  <!-- ① 성향 -->
  <div class="cc-section cc-sec-l1">
    <div class="cc-label cc-l1">① 이 아이는 이런 성향입니다</div>
    <div class="cc-persona-block">
      ${typeof getPersonaIcon === 'function' ? `<span class="cc-persona-icon">${getPersonaIcon(l1.persona)}</span>` : ''}
      <div class="cc-persona-info">
        <div class="cc-persona">
          <span class="cc-tag cc-tag-l1">${l1.persona || ''} · ${l1.title || ''}</span>
          <span class="cc-tag cc-tag-l2">${l2.title || ''}</span>
        </div>
        <p class="cc-desc">${l1.desc || ''}</p>
      </div>
    </div>
    <div class="cc-bands">${l3summary}</div>
  </div>

  <!-- ② 힘들 수 있는 부분 -->
  <div class="cc-section cc-sec-l2">
    <div class="cc-label cc-l2">② 그래서 이런 부분이 힘들 수 있어요</div>
    <ul class="cc-list cc-concern">${concernHtml}</ul>
  </div>

  <!-- ③ 케어 계획 -->
  <div class="cc-section cc-sec-l3">
    <div class="cc-label cc-l3">③ 그래서 저희는 이렇게 하겠습니다</div>
    <ul class="cc-list cc-plan">${planHtml}</ul>
  </div>

  <div class="cc-foot">${disclaimer}</div>
</div>`;
}

// 카드 전용 CSS (결과지와 별도로 삽입해서 씀)
const COUNSEL_CARD_CSS = `
.counsel-card{max-width:640px;margin:0 auto;background:#fff;font-family:'Pretendard',sans-serif;color:#1C2541;line-height:1.6}
.result-page .counsel-card{max-width:100%}
.cc-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1C2541;padding-bottom:14px;margin-bottom:18px}
.cc-title{font-size:22px;font-weight:700}
.cc-sub{font-size:14px;color:#4A5578;font-weight:400;margin-left:8px}
.cc-logo{font-size:12px;font-weight:700;letter-spacing:.1em;color:#9A937F}
.cc-section{margin-bottom:20px;padding:18px 18px 16px;border-radius:12px;border:1px solid #ECECF0}
.cc-sec-l1{background:#FFF8F5;border-color:#F5D9CC}
.cc-sec-l2{background:#F3FAF8;border-color:#CFE8E1}
.cc-sec-l3{background:#F6F3FB;border-color:#DED4EE}
.cc-persona-block{display:flex;align-items:flex-start;gap:14px;margin-bottom:12px}
.cc-persona-icon{display:inline-flex;align-items:center;justify-content:center;width:54px;height:54px;flex-shrink:0;border:1.5px solid #E8633C;color:#E8633C;border-radius:12px;background:#fff}
.cc-persona-info{flex:1;min-width:0}
.cc-label{font-size:14px;font-weight:700;padding:7px 14px;border-radius:8px;display:inline-block;margin-bottom:14px}
.cc-l1{background:#FDE0D3;color:#C24A22}
.cc-l2{background:#D3EDE7;color:#1F7A6E}
.cc-l3{background:#E3DAF3;color:#544387}
.cc-persona{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.cc-tag{font-size:13px;font-weight:700;padding:5px 12px;border-radius:100px;color:#fff}
.cc-tag-l1{background:#E8633C}
.cc-tag-l2{background:#2A9D8F}
.cc-desc{font-size:13.5px;color:#4A5578;margin-bottom:0;line-height:1.65}
.cc-bands{display:flex;gap:8px;flex-wrap:wrap;padding-top:12px;border-top:1px dashed #E5D5CC}
.cc-band{font-size:12px;font-weight:600;color:#6B5CA5;background:#fff;padding:5px 11px;border-radius:100px;border:1px solid #E0D8EE}
.cc-list{list-style:none;padding:0;margin:0}
.cc-list li{font-size:13.5px;color:#3A4360;padding:12px 14px 12px 34px;position:relative;line-height:1.6;background:#fff;border-radius:9px;margin-bottom:8px}
.cc-list li:last-child{margin-bottom:0}
.cc-concern li:before{content:'•';position:absolute;left:14px;top:12px;color:#E8A33C;font-weight:700;font-size:16px}
.cc-plan li:before{content:'✓';position:absolute;left:13px;top:12px;color:#2A9D8F;font-weight:700}
.cc-none{color:#2A9D8F !important}
.cc-none:before{content:'✓' !important;color:#2A9D8F !important}
.cc-foot{font-size:11px;color:#9A937F;line-height:1.5;border-top:1px solid #DDE1E8;padding-top:14px;margin-top:8px}

/* ===== 인쇄 전용: A4 한 장 고정 + 색상 또렷하게 ===== */
@media print{
  @page{size:A4;margin:15mm}
  *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  body{background:#fff !important;padding:0 !important;margin:0 !important}
  .counsel-card{border:none !important;box-shadow:none !important;max-width:100% !important;width:100% !important;margin:0 !important;padding:0 !important}

  .cc-section{margin-bottom:16px;padding:16px 16px 14px;page-break-inside:avoid;break-inside:avoid}
  .cc-sec-l1{background:#FFF8F5 !important;border-color:#F5D9CC !important}
  .cc-sec-l2{background:#F3FAF8 !important;border-color:#CFE8E1 !important}
  .cc-sec-l3{background:#F6F3FB !important;border-color:#DED4EE !important}
  .cc-persona-block{margin-bottom:11px;gap:13px}
  .cc-persona-icon{width:48px !important;height:48px !important}
  .cc-persona-icon .persona-icon{width:36px;height:36px}
  .cc-label{font-size:13.5px;padding:6px 13px;margin-bottom:12px}
  .cc-persona{margin-bottom:9px}
  .cc-tag{font-size:12.5px;padding:5px 12px}
  .cc-desc{font-size:13px;margin-bottom:0;line-height:1.6}
  .cc-bands{padding-top:11px}
  .cc-band{font-size:12px;padding:4px 11px}

  .cc-list li{font-size:13px;padding:11px 13px 11px 32px;line-height:1.6;margin-bottom:7px;background:#fff !important;page-break-inside:avoid;break-inside:avoid}
  .cc-l1{background:#FDE0D3 !important;color:#C24A22 !important}
  .cc-l2{background:#D3EDE7 !important;color:#1F7A6E !important}
  .cc-l3{background:#E3DAF3 !important;color:#544387 !important}
  .cc-tag-l1{background:#E8633C !important;color:#fff !important}
  .cc-tag-l2{background:#2A9D8F !important;color:#fff !important}
  .cc-concern li:before{color:#E8A33C !important;left:13px;top:11px;font-size:16px}
  .cc-plan li:before{color:#2A9D8F !important;left:12px;top:11px}

  .cc-foot{font-size:11.5px;padding-top:13px;margin-top:6px}
}
`;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCounselCard, COUNSEL_CARD_CSS };
}
