// PRISM 앱 로직

// ===== Apps Script 웹앱 배포 URL을 여기에 입력하세요 =====
// 구글 시트 > 확장 프로그램 > Apps Script > code.gs 배포 후 발급된 /exec 주소
const API_URL = 'https://script.google.com/macros/s/AKfycbwIwHar6DeouN7pg8g-Oaqb4Sy0me2-IZzF3I7dtDVzm-_GbZdj5DH1c_tx4b9oCZaH/exec';

const state = {
  screen: 'gate',
  gradeGroup: null,
  respondent: { name: '', grade: '', school: '', phone: '' },
  answers: {},
  times: {},       // 문항별 응답 소요시간(ms) — 신뢰도 검증용
  qStart: null,    // 현재 문항 표시 시각
  currentQ: 0,
  result: null,
  submitStatus: 'idle', // idle | sending | success | error
  // 기관 코드 게이트
  orgCode: '',
  orgName: '',
  orgVerified: false,
  orgError: ''
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
      respondent: { ...state.respondent, gradeGroup: state.gradeGroup, orgCode: state.orgCode, orgName: state.orgName },
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

  if (state.screen === 'gate') screen.innerHTML = renderGate();
  else if (state.screen === 'landing') screen.innerHTML = renderLanding();
  else if (state.screen === 'intro') screen.innerHTML = renderIntro();
  else if (state.screen === 'test') screen.innerHTML = renderTest();
  else if (state.screen === 'result') screen.innerHTML = renderResult();

  app.appendChild(screen);
  attachEvents();
  window.scrollTo(0, 0);
}

// ===================== ORG GATE (기관 코드 관문) =====================
function renderGate() {
  return `
  <div style="max-width:420px; margin:70px auto 0; text-align:center; padding:0 20px;">
    <svg width="66" height="43" viewBox="0 0 200 130" fill="none" style="display:block; margin:0 auto 12px;">
      <line x1="100" y1="6" x2="100" y2="50" stroke="#B8BEC8" stroke-width="3" stroke-linecap="round"/>
      <path d="M100 48 L126 92 L74 92 Z" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
      <path d="M91 90 C68 105 48 109 36 111" stroke="#E8633C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M100 94 L100 120" stroke="#2A9D8F" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M109 90 C132 105 152 109 164 111" stroke="#E8A33C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <circle cx="36" cy="111" r="6" fill="#E8633C"/><circle cx="100" cy="120" r="6" fill="#2A9D8F"/><circle cx="164" cy="111" r="6" fill="#E8A33C"/>
    </svg>
    <div style="font-size:15px; font-weight:800; letter-spacing:.2em; color:var(--ink); margin-bottom:6px;">P R I S M</div>
    <div style="font-size:13px; color:var(--ink-soft); margin-bottom:34px;">초등 영어 학습유형 검사</div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:var(--radius); padding:34px 26px; box-shadow:0 8px 30px rgba(28,37,65,.06);">
      <div style="font-size:18px; font-weight:700; margin-bottom:8px;">기관 코드를 입력해주세요</div>
      <div style="font-size:13.5px; color:var(--ink-soft); line-height:1.6; margin-bottom:22px;">검사를 진행하려면 학원에서 안내받은<br>6자리 기관 코드가 필요합니다.</div>
      <input type="text" id="org-input" maxlength="6" placeholder="예: HANA01"
        value="${state.orgCode}"
        style="width:100%; padding:15px; border:1.5px solid var(--line); border-radius:12px; font-size:20px; text-align:center; letter-spacing:.25em; text-transform:uppercase; font-weight:700; font-family:inherit; margin-bottom:14px;">
      ${state.orgError ? `<div style="color:var(--coral); font-size:13px; margin-bottom:14px;">${state.orgError}</div>` : ''}
      <button id="btn-org" style="width:100%; padding:15px; border:none; border-radius:12px; background:var(--coral); color:#fff; font-size:16px; font-weight:700; cursor:pointer; font-family:inherit;">확인</button>
    </div>
    <div style="font-size:12px; color:var(--ink-soft); margin-top:20px; opacity:.7;">기관 코드가 없으신가요? 학원에 문의해주세요.</div>
    <a href="index.html" style="display:inline-block; margin-top:16px; font-size:13px; color:var(--ink-soft); text-decoration:none; border-bottom:1px solid var(--line); padding-bottom:2px;">← 소개 페이지로 돌아가기</a>
  </div>`;
}

// 기관 코드 검증: 서버에서 orgs 목록을 받아 클라이언트에서 대조
function verifyOrg() {
  const input = (document.getElementById('org-input').value || '').trim().toUpperCase();
  if (input.length !== 6) {
    state.orgError = '기관 코드는 6자리입니다.';
    render();
    return;
  }
  state.orgCode = input;
  state.orgError = '';
  // 버튼 로딩 표시
  const btn = document.getElementById('btn-org');
  if (btn) { btn.textContent = '확인 중...'; btn.disabled = true; }

  fetch(`${API_URL}?action=orgs`)
    .then(res => res.json())
    .then(data => {
      const orgs = (data && data.orgs) || [];
      const match = orgs.find(o => String(o.code).trim().toUpperCase() === input);
      if (match) {
        state.orgVerified = true;
        state.orgName = match.name || '';
        state.orgError = '';
        try { localStorage.setItem('prism_org', JSON.stringify({ code: input, name: state.orgName })); } catch (e) {}
        state.screen = 'landing';
        render();
      } else {
        state.orgError = '등록되지 않은 기관 코드입니다. 다시 확인해주세요.';
        render();
      }
    })
    .catch(() => {
      state.orgError = '확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      render();
    });
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
            <div class="level-sub">약 ${m.time} · ${totalCount(g)}문항</div>
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
    <div class="stat-card"><div class="stat-num">${totalCount(state.gradeGroup)}</div><div class="stat-label">문항</div></div>
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
// 채점 문항 + 검증 문항(뒤쪽에 배치, 같은 쌍은 서로 떨어뜨림)
function getTestQuestions(gg) {
  const base = (QUESTIONS[gg] || []).slice();
  const checks = (typeof CHECK_QUESTIONS !== 'undefined' && CHECK_QUESTIONS[gg]) ? CHECK_QUESTIONS[gg] : [];
  const firsts = checks.filter(q => /a$/.test(q.id));
  const seconds = checks.filter(q => /b$/.test(q.id));
  return base.concat(firsts, seconds);
}
function totalCount(gg) { return getTestQuestions(gg).length; }

function renderTest() {
  const questions = getTestQuestions(state.gradeGroup);
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
// 아이 결과 → 학부모 궁합검사 링크 (인코딩)
function familyParams(result, name) {
  const l1 = result.layer1 || {}, l2 = result.layer2 || {}, l3 = result.layer3 || {};
  const band = (v) => (v >= 60 ? '3' : v >= 40 ? '2' : '1');
  const iMap = {sound:'1',text:'2',scene:'3'};
  const oMap = (l2.flow || 0) >= (l2.form || 0) ? '1' : '2';
  const salt = String.fromCharCode(65+Math.floor(Math.random()*26), 65+Math.floor(Math.random()*26));
  const raw = salt + (iMap[l1.dominant] || '1') + oMap + band(l3.confidence || 0) + band(l3.resilience || 0) + (name || '');
  const d = btoa(unescape(encodeURIComponent(raw))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return 'family.html?d=' + d;
}

function renderResult() {
  return `
  <div style="max-width:420px; margin:80px auto 0; text-align:center;">
    <div style="font-size:48px; margin-bottom:20px;">✅</div>
    <div class="landing-title font-display" style="font-size:24px; margin-bottom:14px;">검사가 완료되었어요</div>
    <p style="color:var(--ink-soft); font-size:14.5px; line-height:1.7; margin-bottom:24px;">
      ${state.respondent.name || '학생'}님의 응답이 안전하게 제출되었습니다.<br>
      결과지는 학원 선생님께서 확인하신 뒤 별도로 안내해 드릴 예정이에요.
    </p>
    ${renderSubmitBadgeHTML()}
    <div style="background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:16px; text-align:left;">
      <div style="font-weight:700; font-size:15px; margin-bottom:4px;">💗 이어서 · 학부모 영어 궁합 검사</div>
      <div style="font-size:13px; color:var(--ink-soft); line-height:1.65; margin-bottom:12px;">부모님이 이어서 1분만 답하면, 아이와 영어를 대하는 방식이 얼마나 맞는지 바로 알려드려요.</div>
      <a href="${familyParams(state.result || {}, state.respondent.name)}" class="btn-primary" style="display:block; text-align:center; text-decoration:none; box-sizing:border-box;">학부모 궁합 검사 시작하기</a>
    </div>
    <button class="btn-primary" id="btn-restart" style="background:#fff; color:var(--ink-soft); border:1px solid var(--line);">처음으로</button>
  </div>
  `;
}

// ===================== 이벤트 =====================
function attachEvents() {
  if (state.screen === 'gate') {
    const btn = document.getElementById('btn-org');
    const input = document.getElementById('org-input');
    if (btn) btn.addEventListener('click', verifyOrg);
    if (input) {
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') verifyOrg(); });
      input.focus();
    }
  }

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
      state.times = {};
      state.qStart = null;
      state.currentQ = 0;
      state.screen = 'test';
      render();
    });
  }

  if (state.screen === 'test') {
    state.qStart = Date.now();
    document.querySelectorAll('.option-card').forEach(el => {
      el.addEventListener('click', () => {
        const questions = getTestQuestions(state.gradeGroup);
        const q = questions[state.currentQ];
        state.answers[q.id] = el.dataset.choice;
        if (state.qStart) state.times[q.id] = Date.now() - state.qStart;

        if (state.currentQ < questions.length - 1) {
          state.currentQ++;
          render();
        } else {
          // 채점 및 결과 화면 (검증 문항/시간은 채점에 영향 없음)
          state.result = scoreTest(state.gradeGroup, state.answers);
          if (typeof computeValidity === 'function') {
            try { state.answers.__validity = computeValidity(state.gradeGroup, state.answers, state.times); } catch (e) {}
          }
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
      state.times = {};
      state.qStart = null;
      state.currentQ = 0;
      state.result = null;
      state.submitStatus = 'idle';
      render();
    });
  }
}

render();
