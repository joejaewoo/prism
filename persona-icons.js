// PRISM 페르소나 상징 아이콘 (흑백 라인아트 SVG)
// 실존 인물의 얼굴이 아니라, 그 인물을 연상시키는 상징 오브젝트를 라인아트로 표현.
// getPersonaIcon('모차르트형') → SVG 문자열 반환. 색상은 currentColor 상속.

const PERSONA_ICONS = {
  // 모차르트 → 음표
  '모차르트형': '<path d="M22 8 L22 30 M22 8 C30 8 34 10 40 8 L40 14 C34 16 30 14 22 14" /><circle cx="17" cy="30" r="5" /><circle cx="35" cy="26" r="5" /><path d="M40 26 L40 8" />',
  // 다윈 → 거북이 (진화)
  '다윈형': '<ellipse cx="24" cy="27" rx="12" ry="8" /><path d="M16 25 Q24 17 32 25" /><path d="M20 23 L20 29 M24 22 L24 30 M28 23 L28 29" /><circle cx="37" cy="24" r="3" /><path d="M14 33 L11 36 M34 32 L37 35 M18 34 L16 37" />',
  // 에디슨 → 전구
  '에디슨형': '<circle cx="26" cy="20" r="11" /><path d="M21 31 L31 31 M22 35 L30 35 M24 39 L28 39" /><path d="M26 15 L23 22 L29 22 L26 28" />',
  // 다빈치 → 비트루비안(원+사각) 상징
  '다빈치형': '<circle cx="26" cy="24" r="15" /><rect x="14" y="12" width="24" height="24" /><path d="M26 9 L26 39 M11 24 L41 24" />',
  // 헤밍웨이 → 만년필
  '헤밍웨이형': '<path d="M14 40 L30 24 L34 28 L18 44 Z" transform="translate(0,-8)" /><path d="M30 16 L34 20" /><path d="M13 33 L17 29" />',
  // 퀴리부인 → 플라스크
  '퀴리부인형': '<path d="M22 11 L22 21 L15 35 Q14 39 18 39 L34 39 Q38 39 37 35 L30 21 L30 11" /><path d="M20 11 L32 11" /><path d="M17 31 L35 31" /><circle cx="26" cy="34" r="1.3" fill="currentColor" stroke="none" /><circle cx="22" cy="36" r="1.1" fill="currentColor" stroke="none" />',
  // 프랭클린 → 연
  '프랭클린형': '<path d="M26 9 L37 20 L26 31 L15 20 Z" /><path d="M26 9 L26 31 M15 20 L37 20" /><path d="M26 31 L26 42" /><path d="M26 36 L22 34 M26 39 L30 37" />',
  // 처칠 → 승리의 V 사인
  '처칠형': '<path d="M18 14 L24 32 L30 14" /><path d="M24 32 L24 40" /><circle cx="24" cy="43" r="1.5" fill="currentColor" stroke="none" /><path d="M15 12 L18 14 M33 12 L30 14" />',
  // 페르마 → 삼각자/각도기
  '페르마형': '<path d="M12 38 L40 38 L12 14 Z" /><path d="M12 30 L20 30 L20 38" /><path d="M17 38 A12 12 0 0 0 12 26" />',
  // 콜럼버스 → 나침반
  '콜럼버스형': '<circle cx="26" cy="24" r="15" /><path d="M26 24 L32 14 L28 24 L26 36 L24 24 L20 34 Z" /><circle cx="26" cy="24" r="2" /><path d="M26 9 L26 12 M26 36 L26 39 M11 24 L14 24 M38 24 L41 24" />',
  // 링컨 → 실크햇
  '링컨형': '<path d="M18 12 L34 12 L34 30 L18 30 Z" /><rect x="10" y="30" width="32" height="5" rx="1" /><path d="M18 26 L34 26" />',
  // 피카소 → 팔레트
  '피카소형': '<path d="M26 12 Q40 12 40 24 Q40 32 32 32 Q28 32 28 35 Q28 39 22 39 Q12 38 12 26 Q12 12 26 12 Z" /><circle cx="20" cy="20" r="2.2" /><circle cx="28" cy="18" r="2.2" /><circle cx="33" cy="25" r="2.2" /><circle cx="19" cy="29" r="2.2" />',
  // 라이트형제 → 비행기
  '라이트형제형': '<path d="M26 10 L26 40" /><path d="M10 24 L42 24" /><path d="M20 40 L32 40" /><path d="M22 14 L30 14" /><path d="M10 24 L18 20 M42 24 L34 20 M10 24 L18 28 M42 24 L34 28" />',
  // 모네 → 수련/물결
  '모네형': '<path d="M10 30 Q16 24 22 30 T34 30 T44 30" /><path d="M10 36 Q16 30 22 36 T34 36 T44 36" /><path d="M26 12 L22 22 L30 22 Z" /><ellipse cx="26" cy="24" rx="8" ry="3" /><path d="M20 24 L18 20 M32 24 L34 20 M26 22 L26 17" />',
  // 뉴턴 → 사과
  '뉴턴형': '<path d="M26 16 Q16 14 15 26 Q14 38 26 40 Q38 38 37 26 Q36 14 26 16 Z" /><path d="M26 16 L26 10 Q26 7 30 8" /><path d="M27 11 Q32 9 33 13 Q29 14 27 11 Z" />'
};

// persona 문자열을 받아 흑백 라인아트 SVG 반환 (없으면 기본 별 아이콘)
function getPersonaIcon(persona, size) {
  size = size || 52;
  const inner = PERSONA_ICONS[persona] ||
    '<path d="M26 10 L30 20 L41 20 L32 27 L35 38 L26 31 L17 38 L20 27 L11 20 L22 20 Z" />';
  return `<svg class="persona-icon" width="${size}" height="${size}" viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PERSONA_ICONS, getPersonaIcon };
}
