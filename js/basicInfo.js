const STORAGE_KEY = 'vehicleBasicInfoData';

const defaultVehicles = [
  { vehicle: '레이밴', regNum: '185나8606', home: '', workplace: '㈜이스트림', commuteDistance: '' },
  { vehicle: '스타리아', regNum: '823로5420', home: '', workplace: '㈜이스트림', commuteDistance: '' },
  { vehicle: '1톤 리프트 탑차', regNum: '802저2485', home: '', workplace: '㈜이스트림', commuteDistance: '' },
  { vehicle: '레이밴 282우6998', regNum: '282우6998', home: '', workplace: '㈜이스트림', commuteDistance: '' },
];

let basicInfoData = [];

// 로컬스토리지에서 데이터 불러오기
function loadBasicInfoData() {
  const dataStr = localStorage.getItem(STORAGE_KEY);
  if (!dataStr) return [...defaultVehicles];
  try {
    const data = JSON.parse(dataStr);
    if (!Array.isArray(data)) return [...defaultVehicles];
    return data;
  } catch {
    return [...defaultVehicles];
  }
}

// 로컬스토리지에 저장
function saveBasicInfoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(basicInfoData));
}

// 기본정보 테이블 tbody 렌더링
function renderBasicInfoTable() {
  const tbody = document.getElementById('basic-info-tbody');
  tbody.innerHTML = '';
  basicInfoData.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.vehicle = row.vehicle;

    const tdVehicle = document.createElement('td');
    tdVehicle.className = 'selectable-vehicle';
    tdVehicle.textContent = row.vehicle;
    tr.appendChild(tdVehicle);

    const tdRegNum = document.createElement('td');
    tdRegNum.textContent = row.regNum;
    tr.appendChild(tdRegNum);

    const tdHome = document.createElement('td');
    tdHome.className = 'editable-text';
    tdHome.textContent = row.home;
    tr.appendChild(tdHome);

    const tdWorkplace = document.createElement('td');
    tdWorkplace.textContent = row.workplace;
    tr.appendChild(tdWorkplace);

    const tdCommuteDistance = document.createElement('td');
    tdCommuteDistance.className = 'editable-number';
    tdCommuteDistance.textContent = row.commuteDistance;
    tr.appendChild(tdCommuteDistance);

    tbody.appendChild(tr);
  });
}

// 셀 편집 기능 부여
function applyEditableFeatures() {
  const tbody = document.getElementById('basic-info-tbody');
  tbody.querySelectorAll('tr').forEach(row => {
    // 자택, 출퇴근거리만 편집 가능 (3번째와 5번째 셀)
    const homeCell = row.cells[2];
    const commuteCell = row.cells[4];

    makeCellEditable(homeCell, 'text', '자택 편집');
    makeCellEditable(commuteCell, 'number', '출퇴근거리 편집');
  });
}

// 셀 편집 구현
function makeCellEditable(cell, type = 'text', ariaLabel = '') {
  cell.title = '더블클릭하여 편집';
  cell.style.cursor = 'text';

  cell.addEventListener('dblclick', () => {
    if (cell.querySelector('input')) return;
    const currentValue = cell.textContent.trim();
    const input = document.createElement('input');
    input.type = type;
    if (type === 'number') {
      input.min = '0';
    }
    input.value = currentValue;
    input.className = type === 'number' ? 'input-km' : 'name-input';
    input.setAttribute('aria-label', ariaLabel || '셀 편집');
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    function finalizeEdit() {
      const val = input.value.trim();
      cell.textContent = val;
      updateDataFromTable();
      saveBasicInfoData();
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finalizeEdit();
        input.blur();
      }
    });

    input.addEventListener('blur', () => {
      finalizeEdit();
    });
  });
}

// 테이블에서 데이터 배열로 갱신
function updateDataFromTable() {
  const tbody = document.getElementById('basic-info-tbody');
  basicInfoData = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const row = {
      vehicle: tr.cells[0].textContent.trim(),
      regNum: tr.cells[1].textContent.trim(),
      home: tr.cells[2].textContent.trim(),
      workplace: tr.cells[3].textContent.trim(),
      commuteDistance: tr.cells[4].textContent.trim(),
    };
    if (row.vehicle === '' && row.regNum === '') return;
    basicInfoData.push(row);
  });
}

// 차량 선택 시 처리용 함수 (외부 호출용)
function onVehicleSelected(vehicleName) {
  // 선택된 차량 강조 표시
  document.querySelectorAll('#basic-info-tbody td.selectable-vehicle').forEach(cell => {
    if (cell.textContent.trim() === vehicleName) {
      cell.classList.add('selected-vehicle');
    } else {
      cell.classList.remove('selected-vehicle');
    }
  });
}

// 행 추가
function addRow() {
  basicInfoData.push({ vehicle: '', regNum: '', home: '', workplace: '', commuteDistance: '' });
  renderBasicInfoTable();
  applyEditableFeatures();
  saveBasicInfoData();
}

// 초기화 및 옵션에 따른 동작
export function initBasicInfo(action = '') {
  basicInfoData = loadBasicInfoData();
  if (action === 'addRow') {
    addRow();
  } else {
    renderBasicInfoTable();
    applyEditableFeatures();
  }
}

export { onVehicleSelected, basicInfoData as getBasicInfoData };
