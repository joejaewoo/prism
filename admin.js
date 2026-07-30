// PRISM 관리자 페이지 로직

// ===== Apps Script 웹앱 배포 URL을 여기에 입력하세요 (학생 페이지 app.js와 동일한 URL) =====
const API_URL = 'https://script.google.com/macros/s/AKfycbwIwHar6DeouN7pg8g-Oaqb4Sy0me2-IZzF3I7dtDVzm-_GbZdj5DH1c_tx4b9oCZaH/exec';

const GRADE_GROUP_LABEL = { g1: 'Level 1 (초1-2)', g2: 'Level 2 (초3-4)', g3: 'Level 3 (초5-6)' };

const adminState = {
  authed: false,
  authError: false,
  pw: '',
  items: [],
  loading: false,
  error: null,
  filters: { q: '', gradeGroup: '', from: '', to: '' },
  selectedIds: new Set(),
  detail: null, // { item, loading, error } - 단건 상세
  detailMulti: null, // 다중 선택 인쇄용 [item, item, ...]
  viewMode: 'parent', // 'parent' | 'academy' - 상세 모달에서 보는 결과지 종류
  // 기관 코드 게이트 (로그인 후 자기 기관 학생만 조회)
  orgAuthed: false,
  orgCode: '',
  orgName: '',
  orgError: ''
};

function isApiConfigured() {
  return API_URL && API_URL.indexOf('YOUR_APPS_SCRIPT') !== 0;
}

function adminRender() {
  const app = document.getElementById('app');
  if (!adminState.authed) {
    app.innerHTML = renderLogin();
    attachLoginEvents();
    return;
  }
  // 로그인 후 기관 코드 미입력 상태면 기관 코드 관문 표시
  if (!adminState.orgAuthed) {
    app.innerHTML = renderOrgGate();
    attachOrgGateEvents();
    return;
  }
  app.innerHTML = renderAdminMain();
  attachAdminEvents();
  attachDetailPanelEvents();
}

// ===== 기관 코드 관문 (관리자) =====
function renderOrgGate() {
  return `
  <div style="max-width:400px; margin:80px auto 0; text-align:center;">
    <div class="top-title font-display" style="font-size:22px; margin-bottom:8px;">기관 선택</div>
    <div class="top-sub" style="margin-bottom:28px;">조회할 기관의 6자리 코드를 입력해주세요</div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:var(--radius); padding:28px 24px;">
      <input type="text" id="admin-org-input" placeholder="예: HANA01" maxlength="6"
        style="width:100%; padding:14px; border:1.5px solid var(--line); border-radius:10px; font-size:18px; text-align:center; letter-spacing:.2em; text-transform:uppercase; font-weight:700; margin-bottom:12px; font-family:inherit;">
      ${adminState.orgError ? `<div style="color:var(--coral); font-size:13px; margin-bottom:12px;">${adminState.orgError}</div>` : ''}
      <button class="btn-sm" id="btn-admin-org" style="width:100%; padding:13px;">이 기관 학생 조회</button>
      <button class="btn-sm outline" id="btn-admin-logout" style="width:100%; padding:11px; margin-top:8px;">로그아웃</button>
    </div>
  </div>`;
}

function attachOrgGateEvents() {
  const input = document.getElementById('admin-org-input');
  const submit = () => {
    const code = (input.value || '').trim().toUpperCase();
    if (code.length !== 6) { adminState.orgError = '기관 코드는 6자리입니다.'; adminRender(); return; }
    adminState.orgError = '';
    const btn = document.getElementById('btn-admin-org');
    if (btn) { btn.textContent = '확인 중...'; btn.disabled = true; }
    // 기관 목록에서 코드 검증
    fetch(`${API_URL}?action=orgs`)
      .then(r => r.json())
      .then(data => {
        const orgs = (data && data.orgs) || [];
        const match = orgs.find(o => String(o.code).trim().toUpperCase() === code);
        if (match) {
          adminState.orgCode = code;
          adminState.orgName = match.name || '';
          adminState.orgAuthed = true;
          adminState.orgError = '';
          localStorage.setItem('prism_org', JSON.stringify({ code: code, name: adminState.orgName }));
          loadList();
        } else {
          adminState.orgError = '등록되지 않은 기관 코드입니다.';
          adminRender();
        }
      })
      .catch(() => { adminState.orgError = '확인 중 오류가 발생했습니다.'; adminRender(); });
  };
  if (document.getElementById('btn-admin-org')) document.getElementById('btn-admin-org').addEventListener('click', submit);
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem('prism_admin_pw');
    adminState.authed = false; adminState.orgAuthed = false; adminState.pw = '';
    adminState.orgCode = ''; adminState.orgName = '';
    adminRender();
  });
  if (input) { input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }); input.focus(); }
}

// 현재 기관 코드로 학생 목록 필터
function filterByOrg(items) {
  if (!adminState.orgCode) return items;
  return items.filter(i => {
    const code = (i.orgCode || i['기관코드'] || '').toString().trim().toUpperCase();
    return code === adminState.orgCode.toUpperCase();
  });
}


function renderAdminMain() {
  return `
  <div class="top-bar">
    <div style="display:flex; align-items:center; gap:14px;">
      <svg width="84" height="55" viewBox="0 0 200 130" fill="none" style="flex-shrink:0">
        <line x1="100" y1="6" x2="100" y2="50" stroke="#B8BEC8" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 48 L126 92 L74 92 Z" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M91 90 C68 105 48 109 36 111" stroke="#E8633C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M100 94 L100 120" stroke="#2A9D8F" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M109 90 C132 105 152 109 164 111" stroke="#E8A33C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <circle cx="36" cy="111" r="6" fill="#E8633C"/><circle cx="100" cy="120" r="6" fill="#2A9D8F"/><circle cx="164" cy="111" r="6" fill="#E8A33C"/>
      </svg>
      <div>
        <div class="top-title font-display">PRISM 응시 기록 관리</div>
        <div class="top-sub">${adminState.orgName ? escapeHtml(adminState.orgName) + ' · ' + escapeHtml(adminState.orgCode) : 'Profile of Receptive Input, Speaking & Motivation'}</div>
      </div>
    </div>
    <div class="top-actions">
      <a href="test.html" target="_blank" class="btn-sm outline" id="btn-go-test" style="text-decoration:none;">📝 평가 화면</a>
      <button class="btn-sm outline" id="btn-org-switch">기관 변경</button>
      <button class="btn-sm outline" id="btn-refresh">↻ 새로고침</button>
      <button class="btn-sm outline" id="btn-logout">로그아웃</button>
    </div>
  </div>

  ${!isApiConfigured() ? `<div class="api-warning">⚠️ API_URL이 설정되지 않았습니다.</div>` : ''}

  <div class="stat-strip">
    <div class="stat-box"><div class="num">${adminState.items.length}</div><div class="lbl">전체 응시</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g1')}</div><div class="lbl">Level 1</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g2')}</div><div class="lbl">Level 2</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g3')}</div><div class="lbl">Level 3</div></div>
  </div>

  <div class="md-layout">
    <aside class="md-list">
      <div class="md-list-filter">
        <input type="text" id="f-search" placeholder="🔍 이름 검색" value="${adminState.filters.q}">
        <select id="f-gradegroup">
          <option value="">전체 레벨</option>
          <option value="g1" ${adminState.filters.gradeGroup === 'g1' ? 'selected' : ''}>Level 1</option>
          <option value="g2" ${adminState.filters.gradeGroup === 'g2' ? 'selected' : ''}>Level 2</option>
          <option value="g3" ${adminState.filters.gradeGroup === 'g3' ? 'selected' : ''}>Level 3</option>
        </select>
      </div>
      ${renderListItems()}
    </aside>
    <main class="md-detail" id="md-detail">
      ${renderDetailPanel()}
    </main>
  </div>
  `;
}

// 왼쪽 목록 (2줄 카드형)
function renderListItems() {
  if (adminState.loading) return `<div class="loading" style="padding:40px 0;">불러오는 중...</div>`;
  if (adminState.error) return `<div class="loading" style="padding:30px 16px; font-size:13px;">⚠️ ${escapeHtml(adminState.error)}</div>`;
  if (adminState.items.length === 0) return `<div class="empty-state" style="padding:40px 16px;">아직 응시 기록이 없습니다.</div>`;

  return `<div class="md-items">
    ${adminState.items.map(item => {
      const active = adminState.detail && adminState.detail.item && adminState.detail.item.id === item.id;
      const l1 = formatPersonaLabel(item.layer1TypeKey, LAYER1_INTERPRET, item.layer1Type);
      const l2 = formatPersonaLabel(item.layer2TypeKey, LAYER2_INTERPRET, item.layer2Type);
      return `
      <div class="md-item ${active ? 'active' : ''}" data-detail-id="${item.id}">
        <div class="md-item-top">
          <span class="md-item-name">${escapeHtml(item.name)}</span>
          <span class="md-item-chip">${GRADE_GROUP_LABEL[item.gradeGroup] || item.gradeGroup}</span>
        </div>
        <div class="md-item-sub">${escapeHtml(item.grade)} · ${escapeHtml(item.school || '학교 미입력')}</div>
        <div class="md-item-types">${escapeHtml(l1)} · ${escapeHtml(l2)}</div>
        <div class="md-item-date">${formatDate(item.submittedAt)}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// 오른쪽 상세 패널 (선택 전엔 안내)
function renderDetailPanel() {
  if (!adminState.detail) {
    return `<div class="md-empty">
      <svg width="60" height="50" viewBox="0 0 200 130" fill="none" style="opacity:.35; margin-bottom:16px">
        <line x1="100" y1="6" x2="100" y2="50" stroke="#B8BEC8" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 48 L126 92 L74 92 Z" fill="none" stroke="#8891A0" stroke-width="4" stroke-linejoin="round"/>
        <path d="M91 90 C68 105 48 109 36 111" stroke="#E8633C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <path d="M100 94 L100 120" stroke="#2A9D8F" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M109 90 C132 105 152 109 164 111" stroke="#E8A33C" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      </svg>
      <div style="font-size:15px; color:var(--ink-soft);">왼쪽에서 학생을 선택하면<br>결과지가 여기에 표시됩니다.</div>
    </div>`;
  }
  return renderDetailContent(adminState.detail);
}

function countByGrade(g) {
  return adminState.items.filter(i => i.gradeGroup === g).length;
}

// ===== 로그인 =====
function renderLogin() {
  return `
  <div style="max-width:360px; margin:80px auto 0; text-align:center;">
    <div class="top-title font-display" style="font-size:22px; margin-bottom:8px;">PRISM 관리자</div>
    <div class="top-sub" style="margin-bottom:28px;">Profile of Receptive Input, Speaking &amp; Motivation</div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:var(--radius); padding:28px 24px;">
      <input type="password" id="login-pw" placeholder="비밀번호" maxlength="20"
        style="width:100%; padding:13px 14px; border:1px solid var(--line); border-radius:10px; font-size:15px; text-align:center; margin-bottom:12px; font-family:inherit;">
      ${adminState.authError ? '<div style="color:var(--coral); font-size:13px; margin-bottom:12px;">비밀번호가 올바르지 않습니다.</div>' : ''}
      <button class="btn-sm" id="btn-login" style="width:100%; height:auto; padding:13px;">입장하기</button>
    </div>
    <a href="index.html" style="display:inline-block; margin-top:18px; font-size:13px; color:var(--ink-soft); text-decoration:none;">← 소개 페이지로 돌아가기</a>
  </div>
  `;
}

function attachLoginEvents() {
  const pwInput = document.getElementById('login-pw');
  const tryLogin = () => {
    adminState.pw = pwInput.value.trim();
    if (!adminState.pw) return;
    verifyPassword();
  };
  document.getElementById('btn-login').addEventListener('click', tryLogin);
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  pwInput.focus();
}

// 관리자 진입 비밀번호 (클라이언트 게이트)
const ADMIN_PASSWORD = '7905';

function verifyPassword() {
  // 1) 클라이언트에서 먼저 비밀번호 확인
  if (adminState.pw !== ADMIN_PASSWORD) {
    adminState.authError = true;
    adminRender();
    return;
  }
  if (!isApiConfigured()) {
    adminState.authError = false;
    adminState.authed = true; // API 미설정 상태에서는 통과시키고 화면에서 경고 표시
    adminState.error = 'API_URL 미설정';
    adminRender();
    return;
  }
  fetch(`${API_URL}?action=list&pw=${encodeURIComponent(adminState.pw)}`)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        adminState.authed = true;
        adminState.authError = false;
        adminState.error = null;
        sessionStorage.setItem('prism_admin_pw', adminState.pw);
        if (!adminState.orgAuthed) {
          try { const o = JSON.parse(localStorage.getItem('prism_org') || 'null'); if (o && o.code) { adminState.orgCode = o.code; adminState.orgName = o.name || ''; adminState.orgAuthed = true; } } catch (e) {}
        }
        if (adminState.orgAuthed) { loadList(); }
        else { adminState.items = data.items; adminRender(); }
      } else {
        // 비번은 맞지만 서버 조회 실패 → 서버(code.gs) 비번이 다를 수 있음.
        // 진입은 허용하되 데이터 오류로 표시.
        adminState.authed = true;
        adminState.authError = false;
        adminState.error = (data.error || '데이터 조회 실패') + ' (서버 비밀번호 확인 필요)';
        adminRender();
      }
    })
    .catch(() => {
      adminState.authError = true;
      adminRender();
    });
}

function renderTable() {
  if (adminState.loading) return `<div class="loading">불러오는 중...</div>`;
  if (adminState.error) return `<div class="loading">⚠️ 데이터를 불러오지 못했습니다. (${adminState.error})</div>`;
  if (adminState.items.length === 0) return `<div class="table-wrap"><div class="empty-state">아직 응시 기록이 없습니다.</div></div>`;

  return `
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="checkbox-cell"><input type="checkbox" id="chk-all"></th>
          <th>접수일시</th><th>이름</th><th>학년</th><th>레벨</th><th>학교</th>
          <th>입력 유형</th><th>출력 유형</th>
        </tr>
      </thead>
      <tbody>
        ${adminState.items.map(item => `
          <tr>
            <td class="checkbox-cell"><input type="checkbox" class="row-check" data-id="${item.id}" ${adminState.selectedIds.has(item.id) ? 'checked' : ''}></td>
            <td class="row-clickable" data-detail-id="${item.id}">${formatDate(item.submittedAt)}</td>
            <td class="row-clickable" data-detail-id="${item.id}">${escapeHtml(item.name)}</td>
            <td class="row-clickable" data-detail-id="${item.id}">${escapeHtml(item.grade)}</td>
            <td class="row-clickable" data-detail-id="${item.id}"><span class="chip">${GRADE_GROUP_LABEL[item.gradeGroup] || item.gradeGroup}</span></td>
            <td class="row-clickable" data-detail-id="${item.id}">${escapeHtml(item.school || '-')}</td>
            <td class="row-clickable" data-detail-id="${item.id}">${escapeHtml(formatPersonaLabel(item.layer1TypeKey, LAYER1_INTERPRET, item.layer1Type))}</td>
            <td class="row-clickable" data-detail-id="${item.id}">${escapeHtml(formatPersonaLabel(item.layer2TypeKey, LAYER2_INTERPRET, item.layer2Type))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  `;
}

// 목록에서 "Sound 주도형" 대신 "에디슨형" 같은 캐릭터명을 보여주기 위한 변환.
// typeKey가 없거나 매핑이 안 되는 옛 데이터는 type 문자열 자체에서 typeKey를 역추론한다.
function formatPersonaLabel(typeKey, interpretMap, fallbackType) {
  let entry = typeKey && interpretMap[typeKey];
  if (!entry && fallbackType) {
    const inferredKey = inferTypeKeyFromLabel(fallbackType, interpretMap);
    if (inferredKey) entry = interpretMap[inferredKey];
  }
  if (entry && entry.persona) return entry.persona;
  return fallbackType || '-';
}

// "Sound+Text 복합형", "Scene 주도형", "균형형" 같은 표시용 문자열에서 typeKey를 역으로 찾는다.
// 서버(code.gs)가 typeKey를 아직 내려주지 않는 옛 배포 상태에서도 캐릭터명이 보이도록 하는 안전망.
const ENG_DIM_NAME = { Sound: 'sound', Text: 'text', Scene: 'scene' };
function inferTypeKeyFromLabel(label, interpretMap) {
  if (!label) return null;
  // Layer2는 type 문자열이 LAYER2_INTERPRET의 title과 완전히 동일하므로 직접 역매핑
  const directMatch = Object.entries(interpretMap).find(([, v]) => v.title === label);
  if (directMatch) return directMatch[0];

  // Layer1 복합형: "Sound+Text 복합형" 형태에서 두 축 이름을 추출해 고정 순서로 정렬한 키를 만든다
  const compoundMatch = label.match(/^(Sound|Text|Scene)\s*\+\s*(Sound|Text|Scene)\s*복합형$/);
  if (compoundMatch) {
    const order = ['sound', 'text', 'scene'];
    const pair = [ENG_DIM_NAME[compoundMatch[1]], ENG_DIM_NAME[compoundMatch[2]]]
      .sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return `${pair[0]}_${pair[1]}`;
  }
  // Layer1 주도형: "Sound 주도형" 형태
  const dominantMatch = label.match(/^(Sound|Text|Scene)\s*주도형$/);
  if (dominantMatch) return ENG_DIM_NAME[dominantMatch[1]];
  // 균형형
  if (label === '균형형') return 'balanced';
  return null;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== 데이터 로딩 =====
function loadList() {
  if (!isApiConfigured()) {
    adminState.loading = false;
    adminState.error = 'API_URL 미설정';
    adminRender();
    return;
  }
  adminState.loading = true;
  adminState.error = null;
  adminRender();

  const params = new URLSearchParams({ action: 'list', pw: adminState.pw });
  if (adminState.filters.q) params.set('q', adminState.filters.q);
  if (adminState.filters.gradeGroup) params.set('gradeGroup', adminState.filters.gradeGroup);
  if (adminState.filters.from) params.set('from', adminState.filters.from);
  if (adminState.filters.to) params.set('to', adminState.filters.to);

  fetch(`${API_URL}?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      adminState.loading = false;
      if (data.ok) {
        adminState.items = filterByOrg(data.items);
      } else {
        adminState.error = data.error || '알 수 없는 오류';
      }
      adminRender();
    })
    .catch(err => {
      adminState.loading = false;
      adminState.error = err.message;
      adminRender();
    });
}

function loadDetail(id) {
  adminState.detail = { id, item: null, loading: true, error: null };
  refreshDetailPanel();

  fetch(`${API_URL}?action=detail&id=${encodeURIComponent(id)}&pw=${encodeURIComponent(adminState.pw)}`)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        adminState.detail = { id, item: data.item, loading: false, error: null };
      } else {
        adminState.detail = { id, item: null, loading: false, error: data.error };
      }
      refreshDetailPanel();
    })
    .catch(err => {
      adminState.detail = { id, item: null, loading: false, error: err.message };
      refreshDetailPanel();
    });
}

// ===== 상담카드용: 상세 데이터에서 pct(백분율) 복원 =====
// 서버가 pct를 따로 안 내려줄 수 있으므로, layer1/2/3 안의 점수로 pct 객체를 재구성한다.
function buildPctFromItem(item) {
  const l1 = item.layer1 || {};
  const l2 = item.layer2 || {};
  const l3 = item.layer3 || {};
  return {
    sound: l1.sound ?? 0, text: l1.text ?? 0, scene: l1.scene ?? 0,
    flow: l2.flow ?? 0, form: l2.form ?? 0, frontier: l2.frontier ?? 0,
    confidence: l3.confidence ?? 0, resilience: l3.resilience ?? 0,
    connection: l3.connection ?? 0, stage: l3.stage ?? 0
  };
}

// 상담카드 결과를 layer1/2 typeKey와 함께 넘기기 위한 래핑 result 구성
function buildCounselResult(item) {
  const pct = buildPctFromItem(item);
  return {
    pct,
    layer1: item.layer1 || {},
    layer2: item.layer2 || {},
    layer3: item.layer3 || {}
  };
}

// ===== 상세 패널 (우측) =====
// 응답 신뢰도 참고 (화면 전용, 인쇄 제외) — 신뢰도 레벨 + 소요시간만 간단히
function fmtDuration(ms) {
  if (!ms || ms < 0 || isNaN(ms)) return '측정 없음';
  const s = Math.round(ms / 1000), m = Math.floor(s / 60), r = s % 60;
  return m > 0 ? `${m}분 ${r}초` : `${r}초`;
}
function validityBadge(item) {
  const v = item && item.answers && item.answers.__validity;
  if (!v) return '';
  const map = {
    ok:              { l: '양호', bg: '#E4F3EE', c: '#1F7A6E' },
    fast:            { l: '참고', bg: '#EEF0F4', c: '#4A5578' },
    low_consistency: { l: '주의', bg: '#FFE9C7', c: '#8A5A1E' },
    unreliable:      { l: '낮음', bg: '#FDE0D3', c: '#C24A22' }
  };
  const s = map[v.flag] || map.ok;
  let totalMs = (v.totalMs != null && !isNaN(v.totalMs)) ? v.totalMs
              : ((v.medianMs && v.totalTimed) ? v.medianMs * v.totalTimed : 0);
  return `<div class="validity-note" style="margin:0 0 14px;padding:10px 15px;border-radius:10px;background:${s.bg};color:${s.c};font-size:14px;font-weight:600">응답 신뢰도 · ${s.l} · 소요 ${fmtDuration(totalMs)}</div>`;
}

function renderDetailContent(detail) {
  const viewMode = adminState.viewMode || 'parent';
  const renderFn = viewMode === 'academy' ? renderAcademyResult : renderParentResult;

  // 상담카드 CSS 최초 1회 주입
  if (typeof COUNSEL_CARD_CSS !== 'undefined' && !document.getElementById('counsel-card-style')) {
    const st = document.createElement('style');
    st.id = 'counsel-card-style';
    st.textContent = COUNSEL_CARD_CSS;
    document.head.appendChild(st);
  }

  const academyWithCard = (item) => {
    const main = renderAcademyResult(
      { layer1: item.layer1, layer2: item.layer2, layer3: item.layer3, recipe: item.recipe },
      { name: item.name, grade: item.grade }
    );
    let card = '';
    if (typeof renderCounselCard === 'function') {
      card = `<div class="result-page">${renderCounselCard(
        buildCounselResult(item),
        { name: item.name, grade: item.grade, school: item.school, gradeGroup: item.gradeGroup }
      )}</div>`;
    }
    return main + card;
  };

  let bodyHtml;
  if (detail.loading) {
    bodyHtml = `<div class="loading">불러오는 중...</div>`;
  } else if (detail.error) {
    bodyHtml = `<div class="loading">⚠️ ${escapeHtml(detail.error)}</div>`;
  } else {
    const item = detail.item;
    const main = viewMode === 'academy'
      ? academyWithCard(item)
      : renderFn(
          { layer1: item.layer1, layer2: item.layer2, layer3: item.layer3, recipe: item.recipe },
          { name: item.name, grade: item.grade }
        );
    bodyHtml = validityBadge(item) + main;
  }

  return `
    <div class="detail-toolbar">
      <div class="detail-toolbar-name">${detail.item ? escapeHtml(detail.item.name) : ''} <span>${detail.item ? escapeHtml(detail.item.grade || '') : ''}</span></div>
      <div class="detail-toolbar-btns">
        <button class="view-toggle ${viewMode === 'parent' ? 'active' : ''}" id="btn-view-parent">학부모용</button>
        <button class="view-toggle ${viewMode === 'academy' ? 'active' : ''}" id="btn-view-academy">학원용</button>
        <button id="btn-detail-print">🖨 인쇄</button>
      </div>
    </div>
    <div class="detail-body" id="detail-body-print">${bodyHtml}</div>
  `;
}

// 우측 패널만 다시 그리고 이벤트 재연결
function refreshDetailPanel() {
  const panel = document.getElementById('md-detail');
  if (!panel) return;
  panel.innerHTML = renderDetailPanel();
  attachDetailPanelEvents();
  // 목록 active 상태도 갱신
  document.querySelectorAll('.md-item').forEach(el => {
    const on = adminState.detail && adminState.detail.item && el.dataset.detailId === adminState.detail.item.id;
    el.classList.toggle('active', !!on);
  });
}

function attachDetailPanelEvents() {
  const p = document.getElementById('btn-view-parent');
  const a = document.getElementById('btn-view-academy');
  const pr = document.getElementById('btn-detail-print');
  if (p) p.addEventListener('click', () => { adminState.viewMode = 'parent'; refreshDetailPanel(); });
  if (a) a.addEventListener('click', () => { adminState.viewMode = 'academy'; refreshDetailPanel(); });
  if (pr) pr.addEventListener('click', () => window.print());
}

function closeDetailModal() {
  const overlay = document.getElementById('detail-overlay');
  if (overlay) overlay.remove();
  adminState.detail = null;
  adminState.detailMulti = null;
  adminState.viewMode = 'parent';
}

// ===== 이벤트 =====
function attachAdminEvents() {
  document.getElementById('btn-refresh').addEventListener('click', loadList);
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('prism_admin_pw');
    adminState.authed = false;
    adminState.orgAuthed = false;
    adminState.orgCode = '';
    adminState.orgName = '';
    adminState.pw = '';
    adminState.items = [];
    adminState.selectedIds = new Set();
    adminRender();
  });
  const switchBtn = document.getElementById('btn-org-switch');
  if (switchBtn) switchBtn.addEventListener('click', () => {
    localStorage.removeItem('prism_org');
    adminState.orgAuthed = false;
    adminState.orgCode = '';
    adminState.orgName = '';
    adminState.items = [];
    adminState.selectedIds = new Set();
    adminState.filters = { q: '', gradeGroup: '', from: '', to: '' };
    adminRender();
  });

  const searchInput = document.getElementById('f-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        adminState.filters.q = searchInput.value.trim();
        loadList();
      }
    });
  }
  const gradeSel = document.getElementById('f-gradegroup');
  if (gradeSel) gradeSel.addEventListener('change', () => {
    adminState.filters.gradeGroup = gradeSel.value;
    loadList();
  });

  document.querySelectorAll('[data-detail-id]').forEach(el => {
    el.addEventListener('click', () => {
      adminState.detailMulti = null;
      loadDetail(el.dataset.detailId);
    });
  });

  const chkAll = document.getElementById('chk-all');
  if (chkAll) chkAll.addEventListener('change', () => {
    if (chkAll.checked) {
      adminState.items.forEach(i => adminState.selectedIds.add(i.id));
    } else {
      adminState.selectedIds.clear();
    }
    adminRender();
  });

  document.querySelectorAll('.row-check').forEach(el => {
    el.addEventListener('click', (e) => e.stopPropagation());
    el.addEventListener('change', () => {
      const id = el.dataset.id;
      if (el.checked) adminState.selectedIds.add(id);
      else adminState.selectedIds.delete(id);
      adminRender();
    });
  });

  const bulkBtn = document.getElementById('btn-bulk-print');
  if (bulkBtn) bulkBtn.addEventListener('click', loadBulkDetail);
}

function loadBulkDetail() {
  const ids = Array.from(adminState.selectedIds);
  adminState.detail = { loading: true, error: null };
  adminRender();

  Promise.all(ids.map(id =>
    fetch(`${API_URL}?action=detail&id=${encodeURIComponent(id)}&pw=${encodeURIComponent(adminState.pw)}`).then(res => res.json())
  )).then(results => {
    const items = results.filter(r => r.ok).map(r => r.item);
    adminState.detailMulti = items;
    adminState.detail = { loading: false, error: null, item: items[0] };
    adminRender();
  }).catch(err => {
    adminState.detail = { loading: false, error: err.message };
    adminRender();
  });
}

// ===== 초기화 =====
// 세션에 저장된 비밀번호가 있으면 자동 로그인 시도
const savedPw = sessionStorage.getItem('prism_admin_pw');
if (savedPw) {
  adminState.pw = savedPw;
  const savedOrg = localStorage.getItem('prism_org');
  if (savedOrg) {
    try { const o = JSON.parse(savedOrg); if (o && o.code) { adminState.orgCode = o.code; adminState.orgName = o.name || ''; adminState.orgAuthed = true; } } catch (e) {}
  }
  verifyPassword();
} else {
  adminRender();
}
