// PRISM 앱 로직

// ===== Apps Script 웹앱 배포 URL을 여기에 입력하세요 =====
// 구글 시트 > 확장 프로그램 > Apps Script > code.gs 배포 후 발급된 /exec 주소
const API_URL = 'https://script.google.com/macros/s/AKfycbwIwHar6DeouN7pg8g-Oaqb4Sy0me2-IZzF3I7dtDVzm-_GbZdj5DH1c_tx4b9oCZaH/exec';

const state = {
  screen: 'landing',
  gradeGroup: null,
  respondent: { name: '', grade: '', school: '', phone: '' },
  answers: {},
  currentQ: 0,
  result: null,
  submitStatus: 'idle' // idle | sending | success | error
};

// COLORS는 result-renderer.js에 정의됨

function submitResult() {
  if (!API_URL || API_URL.indexOf('YOUR_APPS_SCRIPT') === 0) {
    state.submitStatus = 'error';
    renderSubmitBadge();
    return;
  }
  state.submitStatus = 'sending';
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script CORS 우회용
    body: JSON.stringify({
      action: 'submit',
      respondent: { ...state.respondent, gradeGroup: state.gradeGroup },
      result: state.result,
      answers: state.answers
    })
  })
  .then(res => res.json())
  .then(data => {
    state.submitStatus = data.ok ? 'success' : 'error';
    renderSubmitBadge();
  })
  .catch(() => {
    state.submitStatus = 'error';
    renderSubmitBadge();
  });
}

function renderSubmitBadge() {
  const badge = document.getElementById('submit-badge');
  if (!badge) return;
  badge.outerHTML = renderSubmitBadgeHTML();
}

function renderSubmitBadgeHTML() {
  const map = {
    sending: { text: '⏳ 결과 저장 중...', color: 'var(--ink-soft)' },
    success: { text: '✅ 결과가 저장되었습니다', color: 'var(--teal)' },
    error: { text: '⚠️ 저장 실패 — 인쇄는 가능합니다', color: 'var(--coral)' },
    idle: { text: '', color: 'transparent' }
  };
  const s = map[state.submitStatus];
  return `<div id="submit-badge" style="text-align:center; font-size:13px; color:${s.color}; margin-bottom:16px;">${s.text}</div>`;
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen active';

  if (state.screen === 'landing') screen.innerHTML = renderLanding();
  else if (state.screen === 'intro') screen.innerHTML = renderIntro();
  else if (state.screen === 'test') screen.innerHTML = renderTest();
  else if (state.screen === 'result') screen.innerHTML = renderResult();

  app.appendChild(screen);
  attachEvents();
  window.scrollTo(0, 0);
}

// ===================== LANDING =====================
function renderLanding() {
  return `
  <div class="prism-hero">
    ${renderPrismDiagram()}
    <div class="prism-wordmark">P R I S M</div>
  </div>

  <div class="landing-title">PRISM <span class="accent">Test</span></div>
  <div class="landing-sub">Profile of Receptive Input, Speaking &amp; Motivation</div>

  <div class="level-list">
    ${['g1', 'g2', 'g3'].map(g => {
      const m = GRADE_GROUP_META[g];
      return `
      <button class="level-card" data-level="${g}">
        <div class="level-stripe ${g}"></div>
        <div class="level-card-body">
          <span class="level-grade-tag ${g}">${m.grades.join('·')}</span>
          <div class="level-info">
            <div class="level-label">${m.label}</div>
            <div class="level-sub">약 ${m.time} · ${m.count}문항</div>
          </div>
          <div class="level-arrow">→</div>
        </div>
      </button>`;
    }).join('')}
  </div>

  <!-- 여기에 학원/기관 이름과 연락처를 추가하고 싶다면 아래처럼 div를 넣어주세요.
  <div class="contact-box">
    <div class="label">문의</div>
    <div class="value">OO어학원 · 02-000-0000</div>
  </div>
  -->
  <div style="text-align:center; margin-top:32px;">
    <a href="admin.html" style="font-size:14px; color:#9A937F; text-decoration:none; font-weight:600;">관리자 페이지</a>
  </div>
  `;
}

// 빛이 프리즘을 통과해 세 갈래(Level 1/2/3)로 갈라지는 모습을 형상화한 헤더 다이어그램
function renderPrismDiagram() {
  return `
  <svg class="prism-diagram" viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 입사광: 위에서 프리즘으로 들어가는 흰 빛 -->
    <line x1="180" y1="6" x2="180" y2="62" stroke="#CFC9BC" stroke-width="3" stroke-linecap="round"/>

    <!-- 프리즘 본체 -->
    <path d="M180 60 L214 122 L146 122 Z" fill="#FFFFFF" stroke="#1C2541" stroke-width="2.5" stroke-linejoin="round"/>

    <!-- 분광된 세 갈래 빛: 코랄(L1) · 틸(L2) · 골드(L3) -->
    <path d="M172 118 C 150 140, 110 150, 70 158" stroke="#E8633C" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M180 122 C 180 140, 180 150, 180 168" stroke="#2A9D8F" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M188 118 C 210 140, 250 150, 290 158" stroke="#E8A33C" stroke-width="3" stroke-linecap="round" fill="none"/>

    <!-- 갈래 끝 라벨 닻 -->
    <circle cx="70" cy="158" r="4" fill="#E8633C"/>
    <circle cx="180" cy="168" r="4" fill="#2A9D8F"/>
    <circle cx="290" cy="158" r="4" fill="#E8A33C"/>
  </svg>
  `;
}

// ===================== INTRO =====================
function renderIntro() {
  const m = GRADE_GROUP_META[state.gradeGroup];
  return `
  <div class="eyebrow">PRISM · ${m.label}</div>
  <div class="landing-title font-display" style="font-size:24px;">영어 학습 유형<br><span style="color:var(--coral)">프로파일 검사</span></div>
  <p style="color:var(--ink-soft); font-size:14.5px; margin-top:14px;">
    초등 영어 학습유형 검사 PRISM이에요.<br>
    듣기·말하기·읽기·쓰기, 네 가지 영역에서<br>
    우리 아이만의 강점을 찾아드립니다.
  </p>

  <div class="intro-stats">
    <div class="stat-card"><div class="stat-num">${m.count}</div><div class="stat-label">문항</div></div>
    <div class="stat-card"><div class="stat-num">${m.time}</div><div class="stat-label">소요 시간</div></div>
  </div>

  <div class="form-section-title">응시자 정보</div>

  <div class="field">
    <label for="f-name">이름</label>
    <input type="text" id="f-name" placeholder="홍길동" value="${state.respondent.name}">
  </div>

  <div class="field">
    <label for="f-grade">학년</label>
    <select id="f-grade">
      <option value="">선택하세요</option>
      ${m.grades.map(g => `<option value="${g}" ${state.respondent.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
    </select>
  </div>

  <div class="field">
    <label for="f-school">학교 (선택)</label>
    <input type="text" id="f-school" placeholder="예: 즐거움초" value="${state.respondent.school}">
  </div>

  <div class="field">
    <label for="f-phone">학부모 연락처 (선택, 결과 전송용)</label>
    <input type="tel" id="f-phone" placeholder="010-0000-0000" value="${state.respondent.phone}">
    <div class="error" id="phone-error">연락처 형식을 확인해주세요 (예: 010-0000-0000)</div>
  </div>

  <button class="btn-primary" id="btn-start">검사 시작하기 →</button>
  <button class="btn-text" id="btn-back-landing">← 학년 다시 선택하기</button>
  `;
}

// ===================== TEST =====================
function renderTest() {
  const questions = QUESTIONS[state.gradeGroup];
  const q = questions[state.currentQ];
  const pct = Math.round(((state.currentQ) / questions.length) * 100);

  return `
  <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
  <div class="progress-label">Q${state.currentQ + 1} / ${questions.length}</div>

  <div class="q-text font-display">${q.text}</div>

  <button class="option-card" data-choice="A">
    <div class="option-letter">A</div>
    <div class="option-text">${q.a.text}</div>
  </button>
  <button class="option-card" data-choice="B">
    <div class="option-letter">B</div>
    <div class="option-text">${q.b.text}</div>
  </button>

  <div class="nav-row">
    ${state.currentQ > 0 ? `<button class="nav-back" id="btn-prev">← 이전 문항</button>` : ''}
  </div>
  `;
}

// ===================== RESULT =====================
function renderResult() {
  return `
  <div style="max-width:420px; margin:80px auto 0; text-align:center;">
    <div style="font-size:48px; margin-bottom:20px;">✅</div>
    <div class="landing-title font-display" style="font-size:24px; margin-bottom:14px;">검사가 완료되었어요</div>
    <p style="color:var(--ink-soft); font-size:14.5px; line-height:1.7; margin-bottom:28px;">
      ${state.respondent.name || '학생'}님의 응답이 안전하게 제출되었습니다.<br>
      결과지는 학원 선생님께서 확인하신 뒤 별도로 안내해 드릴 예정이에요.
    </p>
    ${renderSubmitBadgeHTML()}
    <button class="btn-primary" id="btn-restart" style="margin-top:8px;">처음으로</button>
  </div>
  `;
}

// ===================== 이벤트 =====================
function attachEvents() {
  if (state.screen === 'landing') {
    document.querySelectorAll('.level-card').forEach(el => {
      el.addEventListener('click', () => {
        state.gradeGroup = el.dataset.level;
        state.screen = 'intro';
        render();
      });
    });
  }

  if (state.screen === 'intro') {
    document.getElementById('btn-back-landing').addEventListener('click', () => {
      state.screen = 'landing';
      render();
    });
    document.getElementById('btn-start').addEventListener('click', () => {
      const name = document.getElementById('f-name').value.trim();
      const grade = document.getElementById('f-grade').value;
      const school = document.getElementById('f-school').value.trim();
      const phone = document.getElementById('f-phone').value.trim();
      const phonePattern = /^01[0-9]-?\d{3,4}-?\d{4}$/;

      let valid = true;
      // 연락처는 선택 입력: 비워두면 통과, 입력했다면 형식만 검사
      if (phone && !phonePattern.test(phone)) {
        document.getElementById('phone-error').style.display = 'block';
        valid = false;
      } else {
        document.getElementById('phone-error').style.display = 'none';
      }
      if (!name) { alert('이름을 입력해주세요.'); valid = false; }
      if (!grade) { alert('학년을 선택해주세요.'); valid = false; }
      if (!valid) return;

      state.respondent = { name, grade, school, phone };
      state.answers = {};
      state.currentQ = 0;
      state.screen = 'test';
      render();
    });
  }

  if (state.screen === 'test') {
    document.querySelectorAll('.option-card').forEach(el => {
      el.addEventListener('click', () => {
        const questions = QUESTIONS[state.gradeGroup];
        const q = questions[state.currentQ];
        state.answers[q.id] = el.dataset.choice;

        if (state.currentQ < questions.length - 1) {
          state.currentQ++;
          render();
        } else {
          // 채점 및 결과 화면
          state.result = scoreTest(state.gradeGroup, state.answers);
          state.submitStatus = 'idle';
          state.screen = 'result';
          render();
          submitResult();
        }
      });
    });
    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      state.currentQ--;
      render();
    });
  }

  if (state.screen === 'result') {
    document.getElementById('btn-restart').addEventListener('click', () => {
      state.screen = 'landing';
      state.gradeGroup = null;
      state.respondent = { name: '', grade: '', school: '', phone: '' };
      state.answers = {};
      state.currentQ = 0;
      state.result = null;
      state.submitStatus = 'idle';
      render();
    });
  }
}

render();
