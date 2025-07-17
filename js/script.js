const dayNamesKorFull = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const holidays = [
  '2025-07-17',
  '2025-01-01',
  '2025-02-28', '2025-03-01', '2025-03-02',
  '2025-09-30', '2025-10-01', '2025-10-02',
];

const vehicleTripLogs = {
  '레이밴': [
    { name: '', dateOffset: 2, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '스타리아': [
    { name: '', dateOffset: 3, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '1톤 리프트 탑차': [
    { name: '', dateOffset: 4, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '레이밴 282우6998': [
    { name: '', dateOffset: 0, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
};

// 평일(월~금)만 반환하며 공휴일 제외
function getWorkingDays(year, month) {
  const days = [];
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().slice(0, 10);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      days.push(date);
    }
  }
  return days;
}

function applyBasicInfoEditableFeatures(tbody) {
  tbody.querySelectorAll('tr').forEach(row => {
    makeCellEditable(row.cells[2], 'text', '자택 편집');
    makeCellEditable(row.cells[4], 'number', '출퇴근거리 편집');
    makeCellEditable(row.cells[0], 'text', '차종 편집');
    makeCellEditable(row.cells[1], 'text', '자동차등록번호 편집');
    makeCellEditable(row.cells[3], 'text', '근무지 편집');
  });
}

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

      if (cell.parentElement) {
        const row = cell.parentElement;
        const vehicleCell = row.cells[0];
        const regNumCell = row.cells[1];
        const vehicleVal = vehicleCell.textContent.trim();
        const regNumVal = regNumCell.textContent.trim();
        if (vehicleVal === '' && regNumVal === '') {
          row.remove();
          document.querySelectorAll('#basic-info-tbody td.selectable-vehicle').forEach(c => c.classList.remove('selected-vehicle'));
          updateTripLogForVehicle('');
        }
      }
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

function attachVehicleClickEvent(cell) {
  cell.style.cursor = 'pointer';
  cell.title = '클릭하여 차량 선택';

  cell.addEventListener('click', () => {
    const vehicleName = cell.textContent.trim();

    document.querySelectorAll('#basic-info-tbody td.selectable-vehicle').forEach(c => c.classList.remove('selected-vehicle'));
    if (vehicleName) {
      cell.classList.add('selected-vehicle');
    }

    updateTripLogForVehicle(vehicleName);
  });
}

function addBasicInfoRow() {
  const tbody = document.getElementById('basic-info-tbody');
  const newRow = document.createElement('tr');
  newRow.dataset.vehicle = '';

  const tdVehicle = document.createElement('td');
  tdVehicle.className = 'selectable-vehicle';
  tdVehicle.textContent = '';
  newRow.appendChild(tdVehicle);

  const tdRegNum = document.createElement('td');
  tdRegNum.textContent = '';
  newRow.appendChild(tdRegNum);

  const tdHome = document.createElement('td');
  tdHome.className = 'editable-text';
  tdHome.textContent = '';
  newRow.appendChild(tdHome);

  const tdWorkplace = document.createElement('td');
  tdWorkplace.textContent = '';
  newRow.appendChild(tdWorkplace);

  const tdDistance = document.createElement('td');
  tdDistance.className = 'editable-number';
  tdDistance.textContent = '';
  newRow.appendChild(tdDistance);

  tbody.appendChild(newRow);

  applyBasicInfoEditableFeatures(tbody);
  attachVehicleClickEvent(tdVehicle);
}

function updateTripLogForVehicle(vehicleName) {
  const tripLogWrapper = document.getElementById('trip-log-wrapper');
  const tripLogTbody = document.getElementById('trip-log-tbody');
  const notice = document.getElementById('notice');

  tripLogTbody.innerHTML = '';

  if (!vehicleName) {
    notice.style.display = 'block';
    tripLogWrapper.style.display = 'none';
    return;
  } else {
    notice.style.display = 'none';
    tripLogWrapper.style.display = 'block';
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const workingDays = getWorkingDays(year, month);

  const logs = vehicleTripLogs[vehicleName] || [];

  workingDays.forEach((dateObj, idx) => {
    const row = document.createElement('tr');

    // 일련번호
    const cellSerial = document.createElement('td');
    cellSerial.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    row.appendChild(cellSerial);

    // 성명 (투명 input)
    const cellName = document.createElement('td');
    cellName.classList.add('name-cell');
    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.className = 'name-input';
    inputName.value = logs.find(l => l.dateOffset === idx)?.name || '';
    inputName.setAttribute('aria-label', '성명 입력');
    cellName.appendChild(inputName);
    row.appendChild(cellName);

    // 사용목적 (고정: 업무)
    const cellPurpose = document.createElement('td');
    cellPurpose.textContent = "업무";
    cellPurpose.classList.add('purpose-work');
    row.appendChild(cellPurpose);

    // 사용일자 (요일)
    const cellUseDate = document.createElement('td');
    cellUseDate.textContent = dayNamesKorFull[dateObj.getDay()];
    row.appendChild(cellUseDate);

    // 출발지 (고정: 사무실)
    const cellDeparture = document.createElement('td');
    cellDeparture.textContent = "사무실";
    row.appendChild(cellDeparture);

    // 출발누적거리 (빈칸)
    const cellDepartKm = document.createElement('td');
    cellDepartKm.textContent = '';
    row.appendChild(cellDepartKm);

    // 도착지 (투명 input)
    const cellArrivePlace = document.createElement('td');
    const inputArrivePlace = document.createElement('input');
    inputArrivePlace.type = 'text';
    inputArrivePlace.className = 'name-input';
    inputArrivePlace.value = logs.find(l => l.dateOffset === idx)?.arrivePlace || '';
    inputArrivePlace.setAttribute('aria-label', '도착지 입력');
    cellArrivePlace.appendChild(inputArrivePlace);
    row.appendChild(cellArrivePlace);

    // 도착누적거리 (투명 input)
    const cellArriveKm = document.createElement('td');
    const inputArriveKm = document.createElement('input');
    inputArriveKm.type = 'number';
    inputArriveKm.min = '0';
    inputArriveKm.className = 'input-km';
    inputArriveKm.value = logs.find(l => l.dateOffset === idx)?.arriveKm || '';
    inputArriveKm.setAttribute('aria-label', '도착 누적거리 입력');
    cellArriveKm.appendChild(inputArriveKm);
    row.appendChild(cellArriveKm);

    // 주행거리 (빈칸)
    const cellDriveKm = document.createElement('td');
    cellDriveKm.textContent = '';
    row.appendChild(cellDriveKm);

    // 업무용주행거리누계 (빈칸)
    const cellWorkDriveKm = document.createElement('td');
    cellWorkDriveKm.textContent = '';
    row.appendChild(cellWorkDriveKm);

    // 주유금액 (투명 input)
    const cellFuelAmount = document.createElement('td');
    const inputFuelAmount = document.createElement('input');
    inputFuelAmount.type = 'text';
    inputFuelAmount.className = 'name-input';
    inputFuelAmount.value = logs.find(l => l.dateOffset === idx)?.fuelAmount || '';
    inputFuelAmount.setAttribute('aria-label', '주유금액 입력');
    cellFuelAmount.appendChild(inputFuelAmount);
    row.appendChild(cellFuelAmount);

    // 주유용량 (투명 input)
    const cellFuelVolume = document.createElement('td');
    const inputFuelVolume = document.createElement('input');
    inputFuelVolume.type = 'text';
    inputFuelVolume.className = 'name-input';
    inputFuelVolume.value = logs.find(l => l.dateOffset === idx)?.fuelVolume || '';
    inputFuelVolume.setAttribute('aria-label', '주유용량 입력');
    cellFuelVolume.appendChild(inputFuelVolume);
    row.appendChild(cellFuelVolume);

    // 저장 함수 (입력값만 저장)
    function saveLog() {
      if (!vehicleTripLogs[vehicleName]) {
        vehicleTripLogs[vehicleName] = [];
      }
      const existingLogIndex = vehicleTripLogs[vehicleName].findIndex(l => l.dateOffset === idx);
      const newLog = {
        name: inputName.value.trim(),
        dateOffset: idx,
        departKm: '',  // 빈칸 유지
        arrivePlace: inputArrivePlace.value.trim(),
        arriveKm: inputArriveKm.value.trim(),
        fuelAmount: inputFuelAmount.value.trim(),
        fuelVolume: inputFuelVolume.value.trim(),
      };
      if (existingLogIndex >= 0) {
        vehicleTripLogs[vehicleName][existingLogIndex] = newLog;
      } else {
        vehicleTripLogs[vehicleName].push(newLog);
      }
    }

    [inputArriveKm, inputArrivePlace, inputName, inputFuelAmount, inputFuelVolume].forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveLog();
          el.blur();
        }
      });
      el.addEventListener('change', () => {
        saveLog();
      });
      el.addEventListener('blur', () => {
        saveLog();
      });
    });

    row.appendChild(cellFuelVolume);
    tripLogTbody.appendChild(row);
  });
}

function setupEscKeyHandler() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('#basic-info-tbody td.selectable-vehicle').forEach(c => c.classList.remove('selected-vehicle'));
      updateTripLogForVehicle('');
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  document.getElementById('business-year').textContent = today.getFullYear() + '년';

  const basicInfoTbody = document.getElementById('basic-info-tbody');
  applyBasicInfoEditableFeatures(basicInfoTbody);

  document.querySelectorAll('#basic-info-tbody td.selectable-vehicle').forEach(attachVehicleClickEvent);

  document.getElementById('add-row-btn').addEventListener('click', () => {
    addBasicInfoRow();
  });

  setupEscKeyHandler();

  updateTripLogForVehicle('');
});