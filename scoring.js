// PRISM 채점 로직

// _low 로 끝나는 dim은 반대 dim의 0점으로 처리 (가산 안 함)
function normalizeDim(dim) {
  return dim.replace('_low', '');
}
function isLowDim(dim) {
  return dim.endsWith('_low');
}

// 학년군별 차원 만점을 questions.js에서 자동 계산
// 차원 대비형(a, b가 다른 차원): 각 문항이 양쪽 차원에 모두 만점 기여
// 수준 측정형(a, b가 같은 차원의 high/low): 문항당 해당 차원에 만점 1만 기여
function computeDimMax(gradeGroup) {
  const questions = QUESTIONS[gradeGroup];
  const max = {};
  questions.forEach(q => {
    const dimA = normalizeDim(q.a.dim);
    const dimB = normalizeDim(q.b.dim);
    if (dimA === dimB) {
      // 수준 측정형: 같은 차원, 문항당 만점 1
      max[dimA] = (max[dimA] || 0) + 1;
    } else {
      // 차원 대비형: 양쪽 차원에 각각 만점 1
      max[dimA] = (max[dimA] || 0) + 1;
      max[dimB] = (max[dimB] || 0) + 1;
    }
  });
  return max;
}

const DIM_MAX = {
  g1: computeDimMax('g1'),
  g2: computeDimMax('g2'),
  g3: computeDimMax('g3')
};

function scoreTest(gradeGroup, answers) {
  // answers: { q1: "A", q2: "B", ... }
  const questions = QUESTIONS[gradeGroup];
  const raw = { sound: 0, text: 0, scene: 0, flow: 0, form: 0, frontier: 0, confidence: 0, resilience: 0, connection: 0, stage: 0 };

  questions.forEach(q => {
    const choice = answers[q.id]; // "A" or "B"
    const picked = choice === 'A' ? q.a : q.b;
    const dim = normalizeDim(picked.dim);
    if (!isLowDim(picked.dim)) {
      raw[dim] = (raw[dim] || 0) + 1;
    }
    // _low dim 선택 시: 가산 없음 (반대편 점수가 안 오르는 것으로 충분)
  });

  const max = DIM_MAX[gradeGroup];
  const pct = {};
  Object.keys(raw).forEach(dim => {
    pct[dim] = max[dim] ? Math.round((raw[dim] / max[dim]) * 100) : 0;
  });

  return {
    raw,
    pct,
    layer1: scoreLayer1(pct),
    layer2: scoreLayer2(pct),
    layer3: scoreLayer3(pct)
  };
}

// ===== Layer 1: 입력 회로 =====
const DIM_ORDER_L1 = ['sound', 'text', 'scene']; // typeKey 생성 시 항상 이 순서를 기준으로 함

function scoreLayer1(pct) {
  const { sound, text, scene } = pct;
  const sorted = [
    { dim: 'sound', label: 'Sound', score: sound },
    { dim: 'text', label: 'Text', score: text },
    { dim: 'scene', label: 'Scene', score: scene }
  ].sort((a, b) => b.score - a.score);

  const [first, second, third] = sorted;
  const gap = first.score - second.score;
  const allClose = (first.score - third.score) <= 10;

  let type, typeKey;
  if (allClose) {
    typeKey = 'balanced';
    type = '균형형';
  } else if (gap < 20) {
    // typeKey는 고정 순서로 생성해 interpretations.js의 키와 항상 일치시킴 (표시용 type은 점수 순서 유지)
    const pair = [first.dim, second.dim].sort((a, b) => DIM_ORDER_L1.indexOf(a) - DIM_ORDER_L1.indexOf(b));
    typeKey = `${pair[0]}_${pair[1]}`;
    type = `${first.label}+${second.label} 복합형`;
  } else {
    typeKey = first.dim;
    type = `${first.label} 주도형`;
  }

  return { sound, text, scene, dominant: first.dim, typeKey, type, sorted };
}

// ===== Layer 2: 출력 성향 =====
function scoreLayer2(pct) {
  const { flow, form, frontier } = pct;

  let typeKey, type;
  if (flow >= 70 && form < 50) {
    typeKey = 'flow_dominant'; type = '거침없는 소통가';
  } else if (form >= 70 && flow < 50) {
    typeKey = 'form_dominant'; type = '꼼꼼한 완성주의자';
  } else if (frontier >= 70) {
    typeKey = 'frontier_dominant'; type = '탐험하는 표현가';
  } else if (flow >= 60 && form >= 60) {
    typeKey = 'balanced'; type = '균형 잡힌 표현자';
  } else if (flow >= 60 && frontier >= 60) {
    typeKey = 'flow_frontier'; type = '자유로운 창작자';
  } else if (form >= 60 && frontier >= 60) {
    typeKey = 'form_frontier'; type = '정교한 실험가';
  } else if (flow >= 40 && flow <= 60 && form >= 40 && form <= 60 && frontier >= 40 && frontier <= 60) {
    typeKey = 'potential'; type = '잠재적 표현자';
  } else if (flow < 40 && form < 40 && frontier < 40) {
    typeKey = 'observer'; type = '조심스러운 관찰자';
  } else {
    typeKey = 'potential'; type = '잠재적 표현자';
  }

  return { flow, form, frontier, typeKey, type };
}

// ===== Layer 3: 동력 체계 =====
function scoreLayer3(pct) {
  const { confidence, resilience, connection, stage } = pct;
  const dims = [
    { dim: 'confidence', label: 'Confidence', score: confidence },
    { dim: 'resilience', label: 'Resilience', score: resilience },
    { dim: 'connection', label: 'Connection', score: connection },
    { dim: 'stage', label: 'Stage', score: stage }
  ];
  const sortedDesc = dims.slice().sort((a, b) => b.score - a.score);
  const sortedAsc = dims.slice().sort((a, b) => a.score - b.score);
  const allEqual = sortedDesc[0].score === sortedAsc[0].score;

  return {
    confidence, resilience, connection, stage,
    topDim: allEqual ? null : sortedDesc[0].dim,
    bottomDim: allEqual ? null : sortedAsc[0].dim,
    allEqual
  };
}

function scoreBand(score) {
  if (score >= 80) return { label: '매우 강함', stars: 5 };
  if (score >= 60) return { label: '강함', stars: 4 };
  if (score >= 40) return { label: '보통', stars: 3 };
  if (score >= 20) return { label: '약함', stars: 2 };
  return { label: '약함', stars: 1 };
}
