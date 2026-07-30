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
  viewMode: 'parent' // 'parent' | 'academy' - 상세 모달에서 보는 결과지 종류
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
  app.innerHTML = renderAdminMain();
  attachAdminEvents();

  // 기존 모달 제거 후 필요 시 재생성 (중복 누적 방지)
  const existingModal = document.getElementById('detail-overlay');
  if (existingModal) existingModal.remove();

  if (adminState.detail) {
    renderDetailModal(adminState.detail);
  }
}

function renderAdminMain() {
  return `
  <div class="top-bar">
    <div>
      <div class="top-title font-display">PRISM 응시 기록 관리</div>
      <div class="top-sub">Profile of Receptive Input, Speaking &amp; Motivation</div>
    </div>
    <div>
      <a href="index.html" target="_blank" class="btn-sm outline" id="btn-go-test" style="display:inline-block; text-decoration:none; text-align:center;">📝 평가 화면으로 가기</a>
      <button class="btn-sm outline" id="btn-refresh" style="margin-left:8px;">↻ 새로고침</button>
      <button class="btn-sm outline" id="btn-logout" style="margin-left:8px;">로그아웃</button>
    </div>
  </div>

  ${!isApiConfigured() ? `<div class="api-warning">⚠️ API_URL이 설정되지 않았습니다. admin.js 상단의 API_URL을 Apps Script 배포 주소로 변경해주세요.</div>` : ''}

  <div class="stat-strip">
    <div class="stat-box"><div class="num">${adminState.items.length}</div><div class="lbl">전체 응시</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g1')}</div><div class="lbl">Level 1</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g2')}</div><div class="lbl">Level 2</div></div>
    <div class="stat-box"><div class="num">${countByGrade('g3')}</div><div class="lbl">Level 3</div></div>
  </div>

  <div class="filter-bar">
    <input type="text" id="f-search" placeholder="이름으로 검색" value="${adminState.filters.q}">
    <select id="f-gradegroup">
      <option value="">전체 레벨</option>
      <option value="g1" ${adminState.filters.gradeGroup === 'g1' ? 'selected' : ''}>Level 1 (초1-2)</option>
      <option value="g2" ${adminState.filters.gradeGroup === 'g2' ? 'selected' : ''}>Level 2 (초3-4)</option>
      <option value="g3" ${adminState.filters.gradeGroup === 'g3' ? 'selected' : ''}>Level 3 (초5-6)</option>
    </select>
    <input type="date" id="f-from" value="${adminState.filters.from}">
    <input type="date" id="f-to" value="${adminState.filters.to}">
    <button class="btn-sm" id="btn-search">검색</button>
    ${adminState.selectedIds.size > 0 ? `<button class="btn-sm outline" id="btn-bulk-print">선택 ${adminState.selectedIds.size}건 인쇄</button>` : ''}
  </div>

  ${renderTable()}
  `;
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
      <button class="btn-sm" id="btn-login" style="width:100%; padding:13px;">입장하기</button>
    </div>
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
        adminState.items = data.items;
        adminState.error = null;
        sessionStorage.setItem('prism_admin_pw', adminState.pw);
        adminRender();
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
        adminState.items = data.items;
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
  adminRender();

  fetch(`${API_URL}?action=detail&id=${encodeURIComponent(id)}&pw=${encodeURIComponent(adminState.pw)}`)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        adminState.detail = { id, item: data.item, loading: false, error: null };
      } else {
        adminState.detail = { id, item: null, loading: false, error: data.error };
      }
      adminRender();
    })
    .catch(err => {
      adminState.detail = { id, item: null, loading: false, error: err.message };
      adminRender();
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

// ===== 상세 모달 =====
function renderDetailModal(detail) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'detail-overlay';

  const viewMode = adminState.viewMode || 'parent'; // 'parent' | 'academy' | 'counsel'
  const renderFn = viewMode === 'academy' ? renderAcademyResult : renderParentResult;

  // 상담카드 CSS는 최초 1회만 문서에 주입
  if (typeof COUNSEL_CARD_CSS !== 'undefined' && !document.getElementById('counsel-card-style')) {
    const st = document.createElement('style');
    st.id = 'counsel-card-style';
    st.textContent = COUNSEL_CARD_CSS;
    document.head.appendChild(st);
  }

  let bodyHtml;
  // 학원용 결과지 뒤에 상담카드를 함께 붙이는 헬퍼
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

  if (detail.loading) {
    bodyHtml = `<div class="loading">불러오는 중...</div>`;
  } else if (detail.error) {
    bodyHtml = `<div class="loading">⚠️ ${escapeHtml(detail.error)}</div>`;
  } else if (adminState.detailMulti) {
    const fn = viewMode === 'academy'
      ? academyWithCard
      : (item) => renderFn(
          { layer1: item.layer1, layer2: item.layer2, layer3: item.layer3, recipe: item.recipe },
          { name: item.name, grade: item.grade }
        );
    bodyHtml = adminState.detailMulti.map(fn).join('<div style="height:24px;"></div>');
  } else {
    const item = detail.item;
    bodyHtml = viewMode === 'academy'
      ? academyWithCard(item)
      : renderFn(
          { layer1: item.layer1, layer2: item.layer2, layer3: item.layer3, recipe: item.recipe },
          { name: item.name, grade: item.grade }
        );
  }

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-toolbar">
        <button class="view-toggle ${viewMode === 'parent' ? 'active' : ''}" id="btn-view-parent">학부모용</button>
        <button class="view-toggle ${viewMode === 'academy' ? 'active' : ''}" id="btn-view-academy">학원용</button>
        <button id="btn-modal-print" style="background:white; color:var(--ink);">🖨 인쇄 / PDF</button>
        <button class="btn-close" id="btn-modal-close">닫기</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btn-modal-close').addEventListener('click', closeDetailModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetailModal(); });
  const printBtn = document.getElementById('btn-modal-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  document.getElementById('btn-view-parent').addEventListener('click', () => {
    adminState.viewMode = 'parent';
    overlay.remove();
    renderDetailModal(adminState.detail);
  });
  document.getElementById('btn-view-academy').addEventListener('click', () => {
    adminState.viewMode = 'academy';
    overlay.remove();
    renderDetailModal(adminState.detail);
  });
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
    adminState.pw = '';
    adminState.items = [];
    adminState.selectedIds = new Set();
    adminRender();
  });

  const searchBtn = document.getElementById('btn-search');
  if (searchBtn) searchBtn.addEventListener('click', () => {
    adminState.filters.q = document.getElementById('f-search').value.trim();
    adminState.filters.gradeGroup = document.getElementById('f-gradegroup').value;
    adminState.filters.from = document.getElementById('f-from').value;
    adminState.filters.to = document.getElementById('f-to').value;
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
  verifyPassword();
} else {
  adminRender();
}
