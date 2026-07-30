// PRISM 응답 신뢰도 검증
// - 검증 문항(CHECK_QUESTIONS, questions.js)의 "일관성" + 응답 "속도"를 함께 봅니다.
// - 엇갈림 하나만으로 무효 처리하지 않습니다(성향이 중간인 아이는 원래 엇갈릴 수 있음).
//   → 엇갈림이 많고 + 응답도 비정상적으로 빠를 때만 "신뢰도 낮음"으로 격상.
// - 결과를 막지 않고, 관리자(선생님) 화면에 참고용으로만 표시하는 것을 전제로 합니다.

var VALIDITY_FAST_MS = 900;   // 문항을 이 시간보다 빨리 넘기면 "빠른 응답"으로 카운트

function _median(arr) {
  if (!arr.length) return 0;
  var a = arr.slice().sort(function (x, y) { return x - y; });
  var m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// answers: { q1:"A", ..., c1a:"A", c1b:"B", ... }   times: { q1: ms, ... }
function computeValidity(gradeGroup, answers, times) {
  answers = answers || {};
  times = times || {};
  var defs = (typeof CHECK_QUESTIONS !== 'undefined' && CHECK_QUESTIONS[gradeGroup]) ? CHECK_QUESTIONS[gradeGroup] : [];

  // 1) 일관성: 같은 pair의 두 문항이 같은 pole을 가리키면 일관, 다르면 엇갈림
  var byPair = {};
  defs.forEach(function (q) {
    var ch = answers[q.id];
    if (ch !== 'A' && ch !== 'B') return;
    var pole = ch === 'A' ? q.a.pole : q.b.pole;
    (byPair[q.check] = byPair[q.check] || []).push(pole);
  });
  var nPairs = 0, mismatches = 0;
  Object.keys(byPair).forEach(function (k) {
    var poles = byPair[k];
    if (poles.length >= 2) { nPairs++; if (poles[0] !== poles[1]) mismatches++; }
  });

  // 2) 속도: 기록된 모든 응답 시간
  var t = Object.keys(times).map(function (k) { return times[k]; })
    .filter(function (v) { return typeof v === 'number' && v > 0; });
  var totalTimed = t.length;
  var fastCount = t.filter(function (v) { return v < VALIDITY_FAST_MS; }).length;
  var medianMs = _median(t);
  var fastHeavy = totalTimed > 0 && ((fastCount / totalTimed) >= 0.5 || (medianMs > 0 && medianMs < 1200));

  // 3) 종합 플래그
  var flag = 'ok', note = '';
  if (mismatches >= 2 && fastHeavy) {
    flag = 'unreliable';
    note = '응답이 매우 빠르고 확인 문항이 여러 개 엇갈렸어요. 결과 신뢰도가 낮을 수 있으니, 필요하면 다시 검사해 주세요.';
  } else if (mismatches >= 2) {
    flag = 'low_consistency';
    note = '확인 문항에서 응답이 엇갈렸어요. 성향이 뚜렷하지 않은 편일 수 있으니, 상담 때 아이의 이야기를 함께 들어봐 주세요.';
  } else if (fastHeavy && totalTimed >= 8) {
    flag = 'fast';
    note = '전반적으로 응답이 매우 빨랐어요. 아이가 문항을 충분히 읽고 답했는지 한 번 확인해 주세요.';
  }

  return {
    nPairs: nPairs, mismatches: mismatches,
    fastCount: fastCount, totalTimed: totalTimed, medianMs: Math.round(medianMs),
    flag: flag, note: note
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { computeValidity: computeValidity, VALIDITY_FAST_MS: VALIDITY_FAST_MS };
}
