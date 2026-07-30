// PRISM 위기 취약점·케어 해석 레이어 (risk.js)
// ================================================================
// 목적: 1회 검사 프로파일(pct 점수)만으로 "이 학생이 어떤 상황에서
//       흔들릴 가능성이 있는가 + 그때 어떻게 대응하면 좋은가"를 참고 형태로 제시한다.
//
// 중요한 관점 (반드시 유지):
//   - 이것은 '위험 판정'이 아니라 '가능성 참고'다. 1회 검사는 성향의 스냅샷일 뿐,
//     확정된 이탈 위험이 아니다. 모든 문구는 "~할 수 있어요 / 가능성이 있습니다"로 쓴다.
//   - 일반적인(안정적인) 학생까지 위험군으로 몰지 않는다. 조건에 실제로 해당할 때만
//     참고 항목이 뜨고, 대부분의 학생은 항목이 적거나 없는 것이 정상이다.
//   - 시계열/재검사 없음. 단일 프로파일 → 규칙 매칭 → 다양성 고려 상위 노출.
//
// 사용: const risks = evaluateRisks(result.pct);  // result는 scoreTest 반환값
//
// 규칙 구조:
//   id         규칙 식별자
//   priority   우선순위 (낮을수록 먼저 고려)
//   cause      대응하는 흔들림 계기 ('A' 시험후 자신감 / 'B' 승급후 부담 / 'C' 반 부적합)
//   attention  관심 정도 ('watch' 살펴볼 만함 | 'note' 참고) — '위험 등급' 아님
//   condition(pct) 발동 조건. true면 참고 항목 후보
//   tag        짧은 키워드 (4-4 출력용)
//   when       "어떤 상황에서 흔들릴 가능성이 있는가" (가능성 문구)
//   care       "그때 이렇게 하면 좋다" (케어 참고)
//
// ※ 이번 범위는 '반 성향 무관' 규칙 7개(A1~A3, B1~B2, C1~C2).
//   반 성격이 필요한 규칙(C3~C5, B3)은 4-2 반 라벨 체계 확정 후 추가.
// ================================================================

const RISK_RULES = [
  // ─────────── 계기 A: 시험 결과 이후 자신감 ───────────
  {
    id: 'A1',
    priority: 10,
    cause: 'A',
    attention: 'watch',
    tag: '평가후_자신감흔들림',
    condition: (p) => p.form >= 60 && p.confidence < 40,
    when: '정확성을 중시하는 편인데 자신감은 아직 자라는 중입니다. 시험·평가에서 틀린 것에 민감하게 반응해, 결과 직후 잠깐 위축될 가능성이 있어요.',
    care: '점수보다 과정 피드백을 중심에 두면 좋습니다. 시험 전 예상 문제로 성공 경험을 미리 만들어주고, 틀린 문항은 "다음 시도의 힌트"로 이야기해주세요.'
  },
  {
    id: 'A2',
    priority: 11,
    cause: 'A',
    attention: 'watch',
    tag: '연속실패_회복느림',
    condition: (p) => p.resilience < 40,
    when: '실패 후 회복에 시간이 조금 더 필요한 편입니다. 저조한 결과가 연이어 나올 경우 영어에 대한 흥미가 잠시 식을 가능성이 있어요.',
    care: '실수를 정상적인 학습 과정으로 다뤄주세요. 저조한 시험 직후 가볍게 개별 접촉해 재도전 기회를 바로 열어주면 회복이 훨씬 빨라집니다.'
  },
  {
    id: 'A3',
    priority: 12,
    cause: 'A',
    attention: 'watch',
    tag: '표현에_신중함',
    condition: (p) => p.confidence < 20,
    when: '영어를 쓸 때 충분히 준비하고 싶어하는 신중한 성향입니다. 준비 없이 노출되는 평가나 지목 상황이 반복되면 부담을 느낄 가능성이 있어요.',
    care: '결과는 비공개로 피드백해주세요. "잘했어"보다 "지금 시도한 것 자체가 대단해"라는 메시지가 먼저입니다. 경쟁보다 협력 구조의 활동이 잘 맞아요.'
  },

  // ─────────── 계기 B: 레벨 승급 직후 부담 ───────────
  {
    id: 'B1',
    priority: 20,
    cause: 'B',
    attention: 'watch',
    tag: '승급후_적응필요',
    condition: (p) => p.confidence < 40 && p.resilience < 40,
    when: '승급 직후 난이도 상승을 "내가 못 따라간다"로 받아들이기 쉬운 성향입니다. 승급이 오히려 부담의 계기가 될 가능성이 있어요.',
    care: '승급 후 2~3주 완충 기간을 두면 좋습니다. 초반 과제 난이도를 한 단계 낮춰 시작하고, "지금은 적응 기간이라 어려운 게 당연하다"고 미리 안내해주세요.'
  },
  {
    id: 'B2',
    priority: 21,
    cause: 'B',
    attention: 'note',
    tag: '새표현에_신중함',
    condition: (p) => p.form >= 60 && p.frontier < 40,
    when: '확실히 아는 것 위주로 안정적으로 학습하는 성향입니다. 승급 후 낯선 표현·구문이 한꺼번에 많아지면 부담을 느낄 가능성이 있어요.',
    care: '새 단원에 들어갈 때 기존에 아는 지식과의 연결고리를 먼저 보여주면 좋습니다. 새 표현은 익숙한 것에 조금씩 얹는 방식이 편안해요.'
  },

  // ─────────── 계기 C: 반 성격과의 부적합 (반 성향 무관 규칙) ───────────
  {
    id: 'C1',
    priority: 30,
    cause: 'C',
    attention: 'note',
    tag: '유창성강점_활동배분',
    condition: (p) => p.flow >= 70 && p.form < 50,
    when: '일단 말하고 쓰는 유창성이 강점입니다. 정확성 위주로만 진행되는 반에서는 다소 답답함을 느껴 흥미가 줄어들 가능성이 있어요.',
    care: '유창성을 발휘할 수 있는 활동(자유 대화, 즉석 발화)을 의도적으로 배분해주세요. 반 성격과의 적합성을 한 번 살펴보면 좋습니다. (→ 반 배치 참고)'
  },
  {
    id: 'C2',
    priority: 31,
    cause: 'C',
    attention: 'note',
    tag: '신중함강점_속도배려',
    condition: (p) => p.form >= 70 && p.flow < 50,
    when: '정확하게 표현하려는 신중한 성향이 강점입니다. 속도가 빠른 자유 발화 중심 반에서는 따라가기 벅차다고 느낄 가능성이 있어요.',
    care: '정확성이 강점임을 인정하는 피드백을 주면 좋습니다. 즉답을 요구하기보다 생각할 시간을 허용하고, 발화 속도에 대한 압박을 덜어주세요.'
  }
];

// ================================================================
// 규칙 평가 (원인 다양성 보장 방식)
// ================================================================
//
// 노출 로직:
//   1) 조건에 해당하는 규칙을 priority 순으로 정렬.
//   2) 먼저 서로 다른 계기(A/B/C)에서 각 1개씩(가장 우선순위 높은 것)을 뽑아
//      계기가 여러 개면 골고루 보이도록 한다.
//   3) 자리가 남으면 나머지를 priority 순으로 채운다.
//   → 한 계기에 규칙이 몰려도 다른 계기 신호가 묻히지 않는다.

function evaluateRisks(pct, options = {}) {
  const maxShow = options.maxShow || 3;

  const matched = RISK_RULES
    .filter(rule => {
      try { return rule.condition(pct); }
      catch (e) { return false; }
    })
    .sort((a, b) => a.priority - b.priority);

  // ── 원인 다양성 보장 선발 ──
  const picked = [];
  const usedCauses = new Set();

  // 1차: 계기별 대표 1개씩
  for (const rule of matched) {
    if (picked.length >= maxShow) break;
    if (!usedCauses.has(rule.cause)) {
      picked.push(rule);
      usedCauses.add(rule.cause);
    }
  }
  // 2차: 남은 자리를 priority 순으로 채움
  for (const rule of matched) {
    if (picked.length >= maxShow) break;
    if (!picked.includes(rule)) picked.push(rule);
  }
  // 노출 순서도 priority 기준으로 다시 정렬 (읽기 자연스럽게)
  picked.sort((a, b) => a.priority - b.priority);

  return {
    // 노출용
    items: picked.map(r => ({
      id: r.id,
      cause: r.cause,
      attention: r.attention,
      tag: r.tag,
      when: r.when,
      care: r.care
    })),
    // 조건에 해당한 전체 개수 (참고용)
    matchedCount: matched.length,
    // 노출된 계기 종류 수 (다양성 확인용)
    causeCount: usedCauses.size,
    // 4-4 출력용 태그 배열 (노출된 것만)
    tags: picked.map(r => r.tag),
    // 관심 정도 요약: watch가 하나라도 있으면 watch, 없고 note만 있으면 note,
    //                아무것도 없으면 none (= 특별히 살펴볼 항목 없음 = 정상)
    overallAttention: picked.some(r => r.attention === 'watch') ? 'watch'
                    : picked.length > 0 ? 'note' : 'none'
  };
}

// 계기별 그룹핑 (상담 자료에서 A/B/C 묶어 보고 싶을 때)
function groupRisksByCause(pct) {
  const CAUSE_LABELS = {
    A: '시험·평가 이후 자신감',
    B: '레벨 승급 직후 적응',
    C: '반 성격과의 적합성'
  };
  const matched = RISK_RULES
    .filter(r => { try { return r.condition(pct); } catch (e) { return false; } })
    .sort((a, b) => a.priority - b.priority);

  const groups = {};
  matched.forEach(r => {
    if (!groups[r.cause]) groups[r.cause] = { label: CAUSE_LABELS[r.cause], items: [] };
    groups[r.cause].items.push({ id: r.id, attention: r.attention, tag: r.tag, when: r.when, care: r.care });
  });
  return groups;
}

// 안내 문구: 항목이 없을 때 결과지에 넣을 기본 메시지
const NO_RISK_MESSAGE =
  '현재 프로파일에서 특별히 살펴볼 취약 신호는 나타나지 않았습니다. ' +
  '전반적으로 안정적인 성향이며, 아래 학습 프로파일을 참고해 강점을 살려주세요.';

// 결과지 상단에 항상 붙이는 성격 안내 (판정이 아니라 참고임을 명시)
const DISCLAIMER =
  '※ 아래 내용은 1회 검사 프로파일을 바탕으로 한 "가능성 참고"이며, ' +
  '확정된 진단이나 위험 판정이 아닙니다. 실제 지도는 담임의 관찰과 함께 종합적으로 판단해주세요.';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RISK_RULES, evaluateRisks, groupRisksByCause, NO_RISK_MESSAGE, DISCLAIMER };
}


// ================================================================
// 학습 환경 프로파일 (4-2 통합판)
// ================================================================
// 반 이동이 현실적으로 어려우므로, "맞는 반 찾기"가 아니라
// "지금 어느 반에 있든, 이 학생에게 어떤 환경이 잘 맞고 / 어떤 환경이
//  답답할 수 있는가"를 학생 성향만으로 제시한다.
//
// - needs   : 강점을 살리는, 특히 잘 맞는 환경 (모든 학생에게 1~2개)
// - friction: 성향과 어긋나 답답할 수 있는 환경 (해당할 때만)
// - 리스크(evaluateRisks)와 달리 '상시 참고'용. 안정적인 학생에게도 needs는 나온다.
//
// 사용: const env = evaluateEnvironment(result.pct);

const ENV_NEEDS_RULES = [
  {
    id: 'N_sound', dim: 'sound',
    condition: (p) => p.sound >= 60 && p.sound >= p.text && p.sound >= p.scene,
    text: '듣고 따라 하는 음성 중심 활동(섀도잉, 챈트, 원어민 발음 듣기)이 특히 잘 맞습니다.'
  },
  {
    id: 'N_text', dim: 'text',
    condition: (p) => p.text >= 60 && p.text >= p.sound && p.text >= p.scene,
    text: '글로 정리하고 규칙을 파악하는 활동(노트 정리, 문법 패턴 정리, 읽기)에서 안정적으로 성장합니다.'
  },
  {
    id: 'N_scene', dim: 'scene',
    condition: (p) => p.scene >= 60 && p.scene >= p.sound && p.scene >= p.text,
    text: '상황과 맥락 속에서 배우는 활동(영상, 역할극, 실전 대화)에서 몰입도가 높습니다.'
  },
  {
    id: 'N_flow', dim: 'flow',
    condition: (p) => p.flow >= 65,
    text: '자유롭게 말하고 쓰는 발화량 많은 활동에서 빛납니다. 표현 기회를 넉넉히 주세요.'
  },
  {
    id: 'N_form', dim: 'form',
    condition: (p) => p.form >= 65,
    text: '정확하게 완성하는 활동(글쓰기 첨삭, 구문 정리, 정독)에서 강점을 발휘합니다.'
  },
  {
    id: 'N_frontier', dim: 'frontier',
    condition: (p) => p.frontier >= 65,
    text: '새로운 표현을 시도하는 확장·창작 활동(에세이, 어휘 확장, 자유 작문)에서 동기가 살아납니다.'
  }
];

const ENV_FRICTION_RULES = [
  {
    id: 'F_sound_text', 
    condition: (p) => p.sound >= 60 && p.text < 40,
    text: '문법 규칙 정리와 필기 위주로만 오래 진행되면 지칠 수 있어요. 음성 활동을 중간중간 섞어주세요.'
  },
  {
    id: 'F_text_scene',
    condition: (p) => p.text >= 60 && p.scene < 40,
    text: '맥락만으로 추측하게 하는 몰입형 활동이 길어지면 불안해할 수 있어요. 명확한 정리와 확인을 함께 주세요.'
  },
  {
    id: 'F_scene_text',
    condition: (p) => p.scene >= 60 && p.text < 40,
    text: '규칙 암기와 반복 필기 위주 수업에서 흥미가 떨어질 수 있어요. 상황·영상 기반 활동을 곁들여주세요.'
  },
  {
    id: 'F_flow_form',
    condition: (p) => p.flow >= 65 && p.form < 45,
    text: '정확성만 강조하고 즉시 교정이 많은 환경에서는 답답함을 느낄 수 있어요. 발화 흐름을 먼저 살려주세요.'
  },
  {
    id: 'F_form_flow',
    condition: (p) => p.form >= 65 && p.flow < 45,
    text: '즉답과 빠른 속도를 요구하는 환경에서는 위축될 수 있어요. 생각할 시간을 허용해주세요.'
  },
  {
    id: 'F_frontier_low',
    condition: (p) => p.frontier < 35 && p.form >= 55,
    text: '자유 주제·창작 과제만 주어지면 막막해할 수 있어요. 틀과 예시를 함께 제공하면 편안해집니다.'
  }
];

function evaluateEnvironment(pct, options = {}) {
  const maxNeeds = options.maxNeeds || 3;
  const maxFriction = options.maxFriction || 2;

  const needs = ENV_NEEDS_RULES
    .filter(r => { try { return r.condition(pct); } catch (e) { return false; } })
    .map(r => ({ id: r.id, text: r.text }));

  const friction = ENV_FRICTION_RULES
    .filter(r => { try { return r.condition(pct); } catch (e) { return false; } })
    .map(r => ({ id: r.id, text: r.text }));

  // needs가 하나도 없으면(모든 차원이 낮거나 평탄) 균형형 안내
  const needsShown = needs.length > 0
    ? needs.slice(0, maxNeeds)
    : [{ id: 'N_balanced', text: '특정 방식에 치우치지 않는 균형형입니다. 다양한 활동을 골고루 경험하게 해주세요.' }];

  return {
    needs: needsShown,
    friction: friction.slice(0, maxFriction),
    // 4-4 출력용: 필요 환경 태그 (needs의 dim 기반)
    tags: needs.slice(0, maxNeeds).map(n => n.id.replace('N_', 'env_'))
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports.evaluateEnvironment = evaluateEnvironment;
}


// ================================================================
// 4-4. 연동 대비 표준 출력
// ================================================================
// 나중에 포탈에 붙일 담당자가 쓰기 좋도록, 검사 결과를 두 형태로 내보낸다.
//   - buildSummaryLine(): 한 줄 요약 문자열
//   - buildExport(): 구조화된 JSON (연동 표준 필드)
// 여기서는 '표준 출력'만 준비한다. 실제 연동(API/DB)은 하지 않는다.
//
// 인자 result: scoreTest(gradeGroup, answers)의 반환값 전체
//   { raw, pct, layer1, layer2, layer3 }
// 인자 meta: { name, grade, school, gradeGroup } 등 응시자 정보 (선택)

function buildSummaryLine(result, meta = {}) {
  const l1 = LAYER1_INTERPRET[result.layer1.typeKey] || {};
  const l2 = LAYER2_INTERPRET[result.layer2.typeKey] || {};
  const env = evaluateEnvironment(result.pct);
  const risks = evaluateRisks(result.pct);

  // L3에서 가장 낮은 차원 하나(살펴볼 만한 지점)를 밴드 라벨로
  const l3 = result.layer3;
  const l3dims = ['confidence', 'resilience', 'connection', 'stage'];
  const lowest = l3dims.reduce((a, b) => (result.pct[b] < result.pct[a] ? b : a));
  const lowestLabel = (typeof getEnergyBandLabel === 'function')
    ? getEnergyBandLabel(lowest, result.pct[lowest]) : '';

  const parts = [];
  if (l1.persona) parts.push(`${l1.persona}(${l1.title})`);
  if (l2.title) parts.push(l2.title);
  if (lowestLabel) parts.push(lowestLabel);
  // 필요 환경(가장 대표적인 것 1개)
  if (env.needs[0]) {
    const envShort = env.needs[0].text.split('(')[0].replace(/이 특히.*| 활동.*/,'').trim();
    parts.push(`추천 환경: ${envShort}`);
  }
  // 살펴볼 항목이 있으면 표시
  if (risks.items.length > 0) parts.push(`참고: ${risks.tags[0]}`);

  return parts.join(' · ');
}

function buildExport(result, meta = {}) {
  const env = evaluateEnvironment(result.pct);
  const risks = evaluateRisks(result.pct);

  return {
    // 응시자 정보 (있으면)
    student: {
      name: meta.name || null,
      grade: meta.grade || null,
      school: meta.school || null,
      gradeGroup: meta.gradeGroup || null
    },
    // 원점수 / 백분율
    scores: { raw: result.raw, pct: result.pct },
    // 레이어별 유형키 + 표시명
    layer1: { typeKey: result.layer1.typeKey, type: result.layer1.type, dominant: result.layer1.dominant },
    layer2: { typeKey: result.layer2.typeKey, type: result.layer2.type },
    layer3: {
      topDim: result.layer3.topDim,
      bottomDim: result.layer3.bottomDim,
      bands: {
        confidence: result.pct.confidence,
        resilience: result.pct.resilience,
        connection: result.pct.connection,
        stage: result.pct.stage
      }
    },
    // 흔들림 가능성 참고 (4-1)
    riskTags: risks.tags,
    riskAttention: risks.overallAttention,   // watch | note | none
    // 환경 궁합 (4-2)
    envTags: env.tags,
    // 한 줄 요약
    summaryLine: buildSummaryLine(result, meta)
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports.buildSummaryLine = buildSummaryLine;
  module.exports.buildExport = buildExport;
}
