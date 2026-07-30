// PRISM 결과지 공통 렌더러 (학생 페이지 / 관리자 페이지 공유)

const COLORS = { sound: '#E8633C', text: '#2A9D8F', scene: '#E8A33C', flow: '#E8633C', form: '#2A9D8F', frontier: '#E8A33C' };

// 레이더 차트 아래 표시되는 축 설명 범례
function renderAxisLegend(dims) {
  return `
  <div class="axis-legend">
    ${dims.map(d => `
      <div class="axis-legend-item">
        <span class="axis-top">
          <span class="axis-dot" style="background:${COLORS[d]};"></span>
          <span class="axis-name">${DIM_LABELS[d]}</span>
        </span>
        <span class="axis-desc">${DIM_DESCRIPTIONS[d]}</span>
      </div>
    `).join('')}
  </div>`;
}

// 학부모용: 종합 프로파일(입력회로+출력성향+동력체계) + 학부모 가이드 — 인쇄 2페이지
function renderParentResult(result, respondent) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return [
    renderResultPage1(result, respondent, today),
    renderParentGuidePage(result)
  ].join('');
}

// 학원용: 종합 프로파일 + 수업 설계서 + 상담 가이드 — 인쇄 3페이지 (학부모 가이드는 제외 — 학원 내부 운영 전용)
function renderAcademyResult(result, respondent) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return [
    renderResultPage1(result, respondent, today),
    renderRecipePage(result, respondent)
  ].join('');
}

// 하위 호환: 기존 호출부에서 전체(학원용과 동일)를 그대로 받을 수 있도록 유지
function renderFullResult(result, respondent) {
  return renderAcademyResult(result, respondent);
}

function renderResultPage1(r, respondent, today) {
  const l1 = LAYER1_INTERPRET[r.layer1.typeKey];
  const l2 = LAYER2_INTERPRET[r.layer2.typeKey];
  return `
  <div class="result-page">
    <div class="result-header">
      <div class="result-header-logo">
        <svg width="60" height="39" viewBox="0 0 200 130" fill="none">
          <line x1="100" y1="6" x2="100" y2="50" stroke="#B8BEC8" stroke-width="3" stroke-linecap="round"/>
          <path d="M100 48 L126 92 L74 92 Z" fill="none" stroke="#1C2541" stroke-width="4" stroke-linejoin="round"/>
          <path d="M91 90 C68 105 48 109 36 111" stroke="#E8633C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          <path d="M100 94 L100 120" stroke="#2A9D8F" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M109 90 C132 105 152 109 164 111" stroke="#E8A33C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
          <circle cx="36" cy="111" r="6" fill="#E8633C"/><circle cx="100" cy="120" r="6" fill="#2A9D8F"/><circle cx="164" cy="111" r="6" fill="#E8A33C"/>
        </svg>
        <div class="title font-display">PRISM 영어 학습유형 검사 결과지</div>
      </div>
      <div class="meta">이름: ${respondent.name} · 학년: ${respondent.grade} · 검사일: ${today}</div>
    </div>

    <div class="io-pair">
      <div class="layer-block layer-block--l1">
        <div class="layer-block-head">
          <span class="layer-icon">📡</span>
          <span class="layer-name">입력 회로</span>
          <span class="layer-sub">영어를 어떻게 받아들이는가</span>
        </div>
        <div class="radar-legend-row">
          <div class="radar-wrap">${renderRadarSVG(['sound','text','scene'], r.layer1)}</div>
          ${renderAxisLegend(['sound','text','scene'])}
        </div>
        <div class="type-label-row">
          ${typeof getPersonaIcon === 'function' ? `<span class="persona-icon-wrap" style="color:var(--l1-color);">${getPersonaIcon(l1.persona)}</span>` : ''}
          <div class="type-label" style="background:var(--l1-color);">${l1.persona} <span style="opacity:0.75; font-weight:500;">· ${r.layer1.type}</span></div>
        </div>
        <div class="type-desc">${l1.desc}</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="k">강점</span><span>${l1.strength}</span></div>
          <div class="detail-row"><span class="k">학습 진입점</span><span>${l1.entry}</span></div>
          <div class="detail-row"><span class="k">가정에서</span><span>${l1.home}</span></div>
        </div>
      </div>

      <div class="layer-block layer-block--l2">
        <div class="layer-block-head">
          <span class="layer-icon">📣</span>
          <span class="layer-name">출력 성향</span>
          <span class="layer-sub">영어를 어떻게 표현하는가</span>
        </div>
        <div class="radar-legend-row">
          <div class="radar-wrap">${renderRadarSVG(['flow','form','frontier'], r.layer2)}</div>
          ${renderAxisLegend(['flow','form','frontier'])}
        </div>
        <div class="type-label-row">
          ${typeof getPersonaIcon === 'function' ? `<span class="persona-icon-wrap" style="color:var(--l2-color);">${getPersonaIcon(l2.persona)}</span>` : ''}
          <div class="type-label" style="background:var(--l2-color);">${l2.persona} <span style="opacity:0.75; font-weight:500;">· ${r.layer2.type}</span></div>
        </div>
        <div class="type-desc">${l2.desc}</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="k">성장 포인트</span><span>${l2.growth}</span></div>
          <div class="detail-row"><span class="k">추천 전략</span><span>${l2.strategy}</span></div>
          <div class="detail-row"><span class="k">피해야 할 것</span><span>${l2.avoid}</span></div>
        </div>
      </div>
    </div>

    ${renderEnergyBlock(r)}
  </div>
  `;
}

function renderMiniGauge(dim, score) {
  return `
  <div class="gauge-row">
    <div class="gauge-head"><span>${DIM_LABELS_KO[dim]}</span><span>${score}</span></div>
    <div class="gauge-track"><div class="gauge-fill" style="width:${score}%; background:var(--ink);"></div></div>
  </div>`;
}

// 동력 체계 블록 (이전엔 별도 페이지였으나 인쇄 분량 절감을 위해 Page1에 통합)
function renderEnergyBlock(r) {
  return `
    <div class="layer-block layer-block--l3">
      <div class="layer-block-head">
        <span class="layer-icon">🔋</span>
        <span class="layer-name">동력 체계</span>
        <span class="layer-sub">무엇이 영어 학습의 연료가 되는가</span>
      </div>
      <div class="gauge-grid">
        ${['confidence','resilience','connection','stage'].map(d => {
          const score = r.layer3[d];
          const displayWidth = Math.max(score, 8); // 막대가 텅 비어 보이지 않도록 최소 채움 적용
          const label = getEnergyBandLabel(d, score);
          return `
          <div class="gauge-row">
            <div class="gauge-head"><span>${DIM_LABELS_KO[d]}</span><span class="gauge-band-label">${label}</span></div>
            <div class="gauge-track"><div class="gauge-fill" style="width:${displayWidth}%; background:var(--l3-color);"></div></div>
            <div class="gauge-text">${getBandText(d, score)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderRecipePage(r, respondent) {
  const l1 = LAYER1_INTERPRET[r.layer1.typeKey];
  const l2 = LAYER2_INTERPRET[r.layer2.typeKey];
  const name = respondent.name || '학생';

  return `
  <div class="result-page">
    <div class="academy-only-badge">학원 내부용</div>
    <div class="section-title">📋 수업 설계서</div>
    <p style="font-size:13px; color:var(--ink-soft); margin-bottom:18px;">담당 강사용 지도 자료입니다. 학부모님께는 별도의 학부모용 결과지를 안내해주세요.</p>

    <div class="academy-grid">
      <div class="academy-section">
        <div class="academy-section-title">1. 무엇으로 배우게 할까 — 자료와 순서</div>
        <div class="academy-body">${computeInputDesign(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">2. 어떻게 말하고 쓰게 할까</div>
        <div class="academy-body">${computeOutputDesign(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">3. 틀린 것을 고쳐주는 방법</div>
        <div class="academy-body">${computeFeedbackStrategy(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">4. 동기 부여 및 수업 운영 전략</div>
        <div class="academy-body">${computeMotivation(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">5. 커리큘럼 배치 제안</div>
        <div class="academy-body">${computeCurriculumPlacement(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">6. 주의해야 할 지도 리스크</div>
        <div class="academy-body">${computeTeachingRisks(r)}</div>
      </div>
    </div>
  </div>
  <div class="result-page">
    <div class="section-title">💬 학부모 상담 가이드</div>
    <p style="font-size:13px; color:var(--ink-soft); margin-bottom:18px;">상담 시 활용할 수 있는 설명 포인트와 예상 질문 대응 가이드입니다.</p>

    <div class="academy-grid">
      <div class="academy-section">
        <div class="academy-section-title">상담 시 강조할 핵심 메시지</div>
        <div class="academy-body">${computeConsultingKeyMessage(r, name)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">예상 질문과 답변 포인트</div>
        <div class="academy-body">${computeConsultingQA(r)}</div>
      </div>

      <div class="academy-section">
        <div class="academy-section-title">재등록·다음 단계 제안 멘트</div>
        <div class="academy-body">${computeNextStepProposal(r)}</div>
      </div>
    </div>
  </div>
  `;
}

function renderParentGuidePage(r) {
  const homeTips = computeHomeTips(r);
  const avoidTips = computeAvoidTips(r);
  const growthPoints = computeGrowthPoints(r);

  return `
  <div class="result-page">
    <div class="section-title">📘 학부모님을 위한 가이드</div>

    <div class="guide-grid">
      <div class="guide-box">
        <div class="gtitle">✅ 가정에서는 이런 태도로 함께해주세요</div>
        <ul>${homeTips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>

      <div class="guide-box">
        <div class="gtitle">⛔ 이것만은 피해주세요</div>
        <ul>${avoidTips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>

      <div class="guide-box">
        <div class="gtitle">📈 다음 검사까지의 성장 포인트</div>
        <ul>${growthPoints.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>

      <div class="guide-box">
        <div class="gtitle">📌 참고</div>
        <ul style="list-style:none; padding-left:0; margin:0;"><li>이 결과는 아이의 현재 성향을 보여주는 참고 자료입니다. 아이를 이해하고 대화의 실마리를 찾는 데 활용해주세요.</li></ul>
      </div>
    </div>
  </div>
  `;
}

// ===================== 레시피 보조 로직 =====================
function computeFeedbackStrategy(r) {
  const sound = r.layer1.dominant === 'sound' || r.layer1.typeKey.includes('sound');
  const formHigh = r.layer2.form >= 60;
  const flowHigh = r.layer2.flow >= 60;

  if (flowHigh && sound) return "말이 끝난 뒤 고쳐주기(말로): 대화를 끊지 말고, 끝난 다음에 1~2개만 짚어주세요.";
  if (flowHigh && !sound) return "말이 끝난 뒤 고쳐주기(글로): 활동을 녹음해두고, 나중에 글로 정리해서 전달해주세요.";
  if (formHigh && sound) return "즉시 교정 + 구두 피드백: 발음·표현을 현장에서 바로 교정해주세요. 이 유형은 정확한 피드백을 환영합니다.";
  if (formHigh && !sound) return "즉시 교정 + 서면 피드백: 글로 표시되는 교정을 환영하는 유형입니다.";
  if (r.layer2.frontier >= 60) return "선택적 교정: 새 표현 시도 자체를 칭찬하고, 더 정확한 표현은 대안으로 제시해주세요.";
  return "최소 교정: 표현을 시도한 것 자체에 긍정 피드백을 우선하고, 교정은 최소화해주세요.";
}

// 1. 입력 설계 - 자료 선정과 도입 순서에 대한 구체적 지침
function computeInputDesign(r) {
  const l1 = LAYER1_INTERPRET[r.layer1.typeKey];
  const dominant = r.layer1.dominant;
  const sorted = r.layer1.sorted;
  const weakest = sorted[sorted.length - 1];

  const materialMap = {
    sound: "오디오북, 챈트, 원어민 음성 자료를 수업 도입부 5분에 배치하세요. 새 단원을 시작할 때 글자보다 소리를 먼저 들려주면 더 잘 기억합니다.",
    text: "워크북, 리딩 패시지, 문법 정리표를 중심 자료로 사용하세요. 새 표현은 음성보다 문장으로 먼저 제시한 뒤 발음을 붙이는 순서가 효과적입니다.",
    scene: "상황극 카드, 영상 클립, 역할극 시나리오를 도입 자료로 활용하세요. 규칙을 먼저 설명하기보다 상황 속에 던져넣고 패턴을 스스로 알아채게 하는 방식이 맞습니다."
  };

  let body = `${l1.entry}. ${materialMap[dominant] || materialMap.text}`;
  if (weakest.score < 30) {
    body += ` 다만 ${DIM_LABELS[weakest.dim]} 경로는 상대적으로 약하게 측정되었으니(${weakest.score}점), 해당 경로를 메인으로 쓰는 활동(예: ${weakest.dim === 'text' ? '받아쓰기, 정독' : weakest.dim === 'sound' ? '듣기 집중 훈련' : '맥락 추론 게임'})을 보조적으로 소량 섞어 균형을 잡아주는 것을 권장합니다.`;
  }
  return body;
}

// 2. 출력 설계 - 발화/쓰기 활동 구성에 대한 구체적 지침
function computeOutputDesign(r) {
  const l2 = LAYER2_INTERPRET[r.layer2.typeKey];
  const { flow, form, frontier } = r.layer2;

  const activityMap = {
    flow_dominant: "자유 대화, 즉석 역할극, 1분 말하기처럼 말을 많이 하게 하는 활동을 늘리세요. 글쓰기는 일단 빠르게 쓰게 한 뒤, 나중에 따로 고쳐주는 2단계로 하면 좋습니다.",
    form_dominant: "받아쓰기, 문법 빈칸 채우기, 꼼꼼한 글쓰기가 잘 맞습니다. 말하기 활동에서는 미리 생각할 시간을 충분히 주세요.",
    frontier_dominant: "같은 의미를 여러 표현으로 바꿔보는 패러프레이징 활동, 신조어·관용구 탐구 코너를 정기적으로 배치하세요. 어휘 확장 욕구를 수업의 동력으로 활용할 수 있습니다.",
    balanced: "자유롭게 말하는 활동과 꼼꼼히 고치는 활동을 번갈아 하면 좋습니다. 한 수업 안에서도 앞 절반은 자유롭게, 뒤 절반은 정확하게 점검하는 식으로 나눠보세요.",
    flow_frontier: "프로젝트형 창작 과제(짧은 이야기 쓰기, 광고 만들기 등)에 강점이 있습니다. 결과물을 만들고 난 뒤 사후 교정을 더하는 순서로 진행하세요.",
    form_frontier: "토론, 에세이처럼 정확함과 새로운 표현이 모두 필요한 과제에서 잘합니다. 다만 빠르게 말하는 연습(타이머 활동)도 가끔 섞어주세요.",
    potential: "아직 출력 스타일이 고정되지 않았으므로, 말하기·쓰기·역할극 등 다양한 출력 형태를 한 학기 동안 골고루 경험시키며 패턴을 관찰해주세요.",
    observer: "전체 발표보다 1:1이나 짝 활동으로 말할 기회를 주세요. 'A 아니면 B?' 같은 선택형 질문으로 짧게 말하는 것부터 시작하면 좋습니다.",
  };

  return `${activityMap[r.layer2.typeKey] || activityMap.balanced}`;
}

function computeMotivation(r) {
  const l3 = r.layer3;
  const parts = [];
  if (l3.confidence >= 60) parts.push("자신감을 살려 도전 과제나 리더 역할을 부여해보세요");
  else parts.push("예측 가능한 수업 구조와 작은 성공 경험으로 자신감을 채워주세요");

  if (l3.connection >= 60) parts.push("실제 소통 경험(원어민 대화, 실생활 프로젝트)이 강한 동기가 됩니다");
  else parts.push("명확한 단기 목표와 달성감 중심의 과제가 효과적입니다");

  if (l3.stage < 40) parts.push("발표는 소그룹부터 시작해 점진적으로 규모를 늘려주세요");
  else parts.push("발표·프레젠테이션 기회를 적극적으로 제공해주세요");

  return parts.join('. ') + '.';
}

// 5. 커리큘럼 배치 제안 - 반 편성, 트랙 추천 등 운영 관점
function computeCurriculumPlacement(r) {
  const l1Dominant = r.layer1.dominant;
  const l2Type = r.layer2.typeKey;
  const stage = r.layer3.stage;

  const parts = [];
  if (l1Dominant === 'sound') parts.push("리스닝·스피킹 비중이 높은 반 편성이 학습 효율 면에서 유리합니다.");
  else if (l1Dominant === 'text') parts.push("리딩·라이팅 중심 트랙 또는 문법 체계반 편성을 고려해보세요.");
  else parts.push("토론·프로젝트형 수업이 포함된 트랙에서 강점이 더 잘 드러납니다.");

  if (l2Type === 'observer' || stage < 30) {
    parts.push("정원이 적은 소그룹반(4명 이하)이나 1:1 보충 수업을 함께 배치하면 출력 회로가 열리는 시점을 더 빠르게 만들 수 있습니다.");
  } else if (l2Type === 'flow_dominant' || l2Type === 'flow_frontier') {
    parts.push("발표·디베이트 비중이 큰 심화반으로의 레벨업을 다음 단계로 고려해볼 수 있습니다.");
  }

  return parts.join(' ');
}

// 6. 주의해야 할 지도 리스크 - 이 유형 조합에서 흔히 발생하는 지도 실수
function computeTeachingRisks(r) {
  const risks = [];
  const avoidMap = {
    flow_dominant: "말할 때마다 바로 문법을 고쳐주면 말하는 양이 확 줄 수 있습니다. 고쳐주는 건 활동이 끝난 뒤로 미뤄주세요.",
    form_dominant: "\"빨리 말해봐\" 같은 속도 압박은 완벽주의 성향을 자극해 오히려 침묵으로 이어질 수 있습니다.",
    frontier_dominant: "\"배운 표현만 써라\"는 제한은 이 학생의 핵심 동기 자체를 꺾습니다. 새 표현 시도는 막지 말고 정확도만 사후에 보완해주세요.",
    observer: "준비 없이 전체 학생 앞에서 갑자기 호명하는 방식은 이 학생을 더 위축시킵니다. 발표 전 반드시 사전 신호나 준비 시간을 주세요."
  };
  if (avoidMap[r.layer2.typeKey]) risks.push(avoidMap[r.layer2.typeKey]);

  if (r.layer3.confidence < 35) risks.push("다른 학생과 직접 비교하는 발언(\"OO는 벌써 하는데\")은 이 학생에게는 역효과가 클 수 있습니다.");
  if (r.layer3.resilience < 35) risks.push("오답에 대한 즉각적·공개적 지적은 다음 시도 자체를 회피하게 만들 수 있습니다. 교정은 1:1로, 가능하면 시차를 두고 진행하세요.");
  if (r.layer3.stage > 80 && r.layer3.resilience < 50) risks.push("무대를 즐기지만 회복력이 낮은 조합이라, 발표 중 실수했을 때의 후속 반응(웃어넘기기, 다음 기회 안내)을 미리 코칭해두는 것이 좋습니다.");

  if (risks.length === 0) risks.push("특별히 두드러진 리스크는 없습니다. 다만 한 가지 활동 방식에 장기간 고정하지 않도록 주기적으로 점검해주세요.");
  return risks.join(' ');
}

// 상담: 학부모에게 강조할 핵심 메시지 (전문적 어투, 강점 중심 프레이밍)
function computeConsultingKeyMessage(r, name) {
  const l1 = LAYER1_INTERPRET[r.layer1.typeKey];
  const l2 = LAYER2_INTERPRET[r.layer2.typeKey];
  return `${name} 학생은 영어를 받아들일 때 ${l1.persona}(${r.layer1.type}), 표현할 때 ${l2.persona}(${l2.title}) 모습을 보입니다. 상담할 때는 "부족한 걸 고쳐야 한다"보다 "이 아이가 잘하는 방식(${l1.strength})으로 영어가 안정적으로 늘고 있다"고 설명하시면 학부모님이 더 안심하고 믿어주십니다.`;
}

// 상담: 자주 나오는 학부모 질문에 대한 대응 포인트
function computeConsultingQA(r) {
  const items = [];
  const l3 = r.layer3;

  if (l3.confidence < 40 || l3.stage < 30) {
    items.push("Q. \"우리 아이는 왜 말을 잘 안 하려고 하나요?\" → A. 아직 말문이 트이기 전의 자연스러운 단계이며, 많은 학생이 이런 조용한 시기를 거친 뒤 한 번에 말이 터집니다. 지금은 편안한 소규모 환경에서 작은 성공을 쌓는 단계라고 설명해주세요.");
  }
  if (r.layer2.typeKey === 'form_dominant') {
    items.push("Q. \"문법은 아는데 왜 말은 못 하나요?\" → A. 정확하게 말하려는 성향이 강해 스스로 검증이 끝난 문장만 꺼내는 경향 때문입니다. 결함이 아니라 신중한 성향의 결과이며, 시간 제한 말하기 같은 연습으로 점진적으로 속도를 끌어올릴 수 있다고 안내해주세요.");
  }
  if (r.layer2.typeKey === 'flow_dominant') {
    items.push("Q. \"문법 실수가 많은데 괜찮은가요?\" → A. 말이 먼저 트이는 학생은 정확함이 나중에 자연스럽게 따라오는 경우가 많습니다. 지금은 말을 많이 하는 것 자체가 큰 강점이고, 정확함은 차근차근 고쳐가며 채워간다고 설명해주세요.");
  }
  if (items.length === 0) {
    items.push("Q. \"지금 단계에서 뭘 더 신경 써야 하나요?\" → A. 전반적으로 고르게 발달한 편이므로, 한 가지를 더 시키기보다 다양한 활동으로 경험의 폭을 넓혀주는 시기라고 안내해주세요.");
  }
  return items.join(' ');
}

// 상담: 재등록/다음 단계 제안 시 활용할 멘트
function computeNextStepProposal(r) {
  const l2Type = r.layer2.typeKey;
  if (l2Type === 'flow_dominant' || l2Type === 'flow_frontier') {
    return "\"지금처럼 적극적으로 말하는 힘을 다음 단계에서는 디베이트·프레젠테이션 트랙으로 연결해보면 좋을 것 같습니다\"라는 방향으로 다음 단계를 제안해보세요.";
  }
  if (l2Type === 'observer' || r.layer3.stage < 30) {
    return "'지금은 편안하게 자신감을 쌓는 시기이니, 소그룹 환경을 조금 더 유지하면서 천천히 가면 좋겠습니다'라는 방향으로, 성급한 레벨업보다 안정적인 환경을 제안해보세요.";
  }
  return "'지금 이 성향을 참고해서 아이에게 맞는 방식으로 지도하겠습니다'라는 방향으로, 앞으로의 지도 계획을 함께 안내해보세요.";
}

function computeHomeTips(r) {
  const tips = [];
  const l3 = r.layer3;

  // 자신감 관련 습관
  if (l3.confidence < 40) {
    tips.push("결과보다 시도 자체를 알아봐 주세요. \"오늘 영어로 한마디 해본 거 자체가 멋졌어\"처럼 과정에 집중한 말 한마디가 큰 힘이 됩니다.");
  } else if (l3.confidence < 70) {
    tips.push("작은 성공 경험을 의식적으로 쌓아주세요. 매주 \"이번 주에 영어로 해낸 일 한 가지\"를 같이 이야기 나눠보는 것도 좋습니다.");
  } else {
    tips.push("이미 자신감이 좋은 편이니, 그 자신감이 자만으로 흐르지 않게 \"꾸준히 하는 게 진짜 실력\"이라는 메시지를 가끔 더해주세요.");
  }

  // 회복력 관련 습관
  if (l3.resilience < 40) {
    tips.push("실수한 날은 그 자리에서 바로 짚지 말고 하루 정도 시간을 두었다가 편안한 분위기에서 이야기해주세요. 회복할 시간을 존중해주는 것이 먼저입니다.");
  } else if (l3.resilience < 70) {
    tips.push("실수를 \"다음에 더 잘하기 위한 정보\"로 바꿔 말해주는 습관을 들여보세요. \"틀렸네\" 대신 \"이번에 뭘 알게 됐어?\"로 질문해보세요.");
  } else {
    tips.push("회복이 빠른 편이니, 가끔은 \"천천히 가도 괜찮아\"라는 말로 속도를 조절해주는 것도 도움이 됩니다.");
  }

  // 소통 동기 관련 습관
  if (l3.connection < 40) {
    tips.push("목표나 성취를 칭찬할 때, 그 결과로 무엇을 할 수 있게 됐는지(예: \"이제 이 영상 자막 없이 볼 수 있겠다\")를 같이 짚어주면 동기가 풍부해집니다.");
  } else {
    tips.push("영어로 소통한 경험(여행, 영상, 게임 등)을 가족과 나누는 시간을 자주 만들어주세요. 이야기하는 것 자체가 강한 동기가 됩니다.");
  }

  // 무대 에너지 관련 습관
  if (l3.stage < 40) {
    tips.push("발표를 억지로 권하기보다, 가족 앞에서 짧게 말해보는 안전한 무대를 자주 만들어 \"보여주는 경험\"에 조금씩 익숙해지게 해주세요.");
  } else {
    tips.push("보여주고 싶어하는 마음을 살려서, 집에서 가족에게 그날 배운 표현을 발표하듯 알려주는 시간을 정기적으로 가져보세요.");
  }

  return tips;
}

function computeAvoidTips(r) {
  const tips = [];
  // 모두 "수업 방식"이 아니라 가정에서 부모가 실제로 할 수 있는 말/행동만 다룬다 (수업 설계는 학원의 몫)
  const avoidMap = {
    flow_dominant: "아이가 말하는 도중에 발음이나 문법을 바로바로 끊어서 고쳐주는 것 (말하려는 의욕이 줄어들 수 있어요)",
    form_dominant: "\"왜 그렇게 천천히 말해\", \"빨리 말해봐\" 같은 속도 압박 (정확하게 말하려는 성향이라 오히려 더 위축될 수 있어요)",
    frontier_dominant: "\"학원에서 배운 표현만 써\"라며 새 표현 시도를 막는 것 (다양하게 표현해보려는 의욕 자체를 꺾을 수 있어요)",
    balanced: "한 가지 활동(예: 영상 시청)만 계속 이어가는 것 (다양한 자극을 골고루 줄 때 더 잘 자라는 성향이에요)",
    flow_frontier: "자유롭게 표현한 것을 두고 문법 실수만 짚어 말하는 것 (창작 의욕이 먼저 꺾일 수 있어요)",
    form_frontier: "결과물이 완벽하지 않다고 곧바로 지적하는 것 (스스로 정교하게 다듬으려는 성향을 존중해주세요)",
    potential: "한 가지 방식(말하기 또는 쓰기 중 하나)만 계속 시키는 것 (아직 다양한 방식을 경험해볼 시기예요)",
    observer: "큰 자리에서 갑자기 \"한번 해봐\"라고 시키거나 \"왜 말을 안 해?\"라고 다그치는 것"
  };
  if (avoidMap[r.layer2.typeKey]) tips.push(avoidMap[r.layer2.typeKey]);

  if (r.layer3.confidence < 40) tips.push("형제나 친구와 영어 실력을 비교하는 것");
  if (r.layer3.resilience < 40) tips.push("틀린 부분을 그 자리에서 바로, 또는 다른 사람 앞에서 짚는 것");
  if (r.layer3.connection < 30) tips.push("성과나 점수만 묻고 그 경험에 대해 묻지 않는 것 (\"몇 점 받았어?\"보다 \"무슨 얘기했어?\"가 더 도움이 돼요)");
  if (r.layer3.stage > 80 && r.layer3.resilience < 50) tips.push("무대를 즐기는 만큼, 실수했을 때 가족이 먼저 정색하거나 같이 긴장하는 반응을 보이는 것");

  return tips;
}

function computeGrowthPoints(r) {
  const points = [];
  const l3 = r.layer3;
  const l3Entries = [['confidence','자신감'],['resilience','회복력'],['connection','소통 욕구'],['stage','무대 에너지']];
  const lowestL3 = l3Entries.filter(([d]) => l3[d] < 60).sort((a,b) => l3[a[0]] - l3[b[0]])[0];

  if (lowestL3) {
    points.push(`${lowestL3[1]} 키우기 — 작은 단위로 성공 경험을 쌓아가면 6개월 후 눈에 띄게 달라질 수 있어요.`);
  }

  if (Math.abs(r.layer2.flow - r.layer2.form) > 30) {
    const lower = r.layer2.flow < r.layer2.form ? 'Flow(유창성)' : 'Form(정확성)';
    points.push(`${lower} 보강하기 — 출력의 균형을 맞추면 표현의 완성도가 한층 올라갑니다.`);
  }

  if (points.length === 0) {
    points.push("전반적으로 균형 잡힌 상태입니다. 다양한 활동을 통해 경험의 폭을 넓혀주세요.");
  }
  return points;
}

// ===================== 레이더 SVG =====================
function renderRadarSVG(dims, scores) {
  const size = 220, center = size / 2, maxR = 78;
  const angles = [-90, 30, 150]; // 3축, 위/우하/좌하
  const padX = 38, padY = 26; // 라벨이 잘리지 않도록 여유 공간 확보
  const vbWidth = size + padX * 2, vbHeight = size + padY * 2;
  const cx = center + padX, cy = center + padY;

  const points = dims.map((d, i) => {
    const val = scores[d] || 0;
    const r = (val / 100) * maxR;
    const rad = (angles[i] * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), val, dim: d };
  });

  const outerPoints = angles.map(a => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + maxR * Math.cos(rad), y: cy + maxR * Math.sin(rad) };
  });

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const labelPoints = angles.map((a, i) => {
    const rad = (a * Math.PI) / 180;
    const lr = maxR + 30;
    const anchor = Math.cos(rad) > 0.3 ? 'start' : (Math.cos(rad) < -0.3 ? 'end' : 'middle');
    return { x: cx + lr * Math.cos(rad), y: cy + lr * Math.sin(rad), dim: dims[i], anchor };
  });

  // 25/50/75/100 가이드 라인
  const guides = [0.25, 0.5, 0.75, 1].map(scale => {
    const gp = angles.map(a => {
      const rad = (a * Math.PI) / 180;
      const r = maxR * scale;
      return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
    }).join(' ');
    return `<polygon points="${gp}" fill="none" stroke="#E3DDD1" stroke-width="1"/>`;
  }).join('');

  return `
  <svg width="${vbWidth}" height="${vbHeight}" viewBox="0 0 ${vbWidth} ${vbHeight}" style="max-width:100%; height:auto;">
    ${guides}
    ${outerPoints.map((p, i) => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#E3DDD1" stroke-width="1"/>`).join('')}
    <polygon points="${polyPoints}" fill="${COLORS[dims[0]]}22" stroke="#1C2541" stroke-width="2"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${COLORS[p.dim]}"/>`).join('')}
    ${labelPoints.map(p => `
      <text x="${p.x}" y="${p.y - 4}" text-anchor="${p.anchor}" font-size="13" font-weight="700" fill="#1C2541">${DIM_LABELS[p.dim]}</text>
      <text x="${p.x}" y="${p.y + 12}" text-anchor="${p.anchor}" font-size="13" fill="#4A5578">${scores[p.dim]}</text>
    `).join('')}
  </svg>`;
}
