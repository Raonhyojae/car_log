const dayNamesKorFull = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const holidays = [
  '2025-07-17',
  '2025-01-01',
  '2025-02-28', '2025-03-01', '2025-03-02',
  '2025-09-30', '2025-10-01', '2025-10-02',
];

const vehicleTripLogs = {
  '레이밴': [
    { dept: '기술지원팀', pos: '과장', name: '', dateOffset: 2, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '스타리아': [
    { dept: '기술지원팀', pos: '과장', name: '', dateOffset: 3, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '1톤 리프트 탑차': [
    { dept: '영업팀', pos: '대리', name: '', dateOffset: 4, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '레이밴 282우6998': [
    { dept: '영업팀', pos: '대리', name: '', dateOffset: 0, departKm: '', arrivePlace: '', arriveKm: '', fuelAmount: '', fuelVolume: '' },
  ],
};

function isHoliday(dateStr) {
  return holidays.includes(dateStr);
}

function getWorkingDays(year, month) {
  const days = [];
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().slice(0, 10);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(dateStr)) {
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

  // 7월에만 고정 출발누적거리 값 설정
  const julyFixedDepartKmMap = {
    '레이밴': '65874',
    '스타리아': '16488',
    '1톤 리프트 탑차': '32972',
    '레이밴 282우6998': '5235',
  };

  // 전달 마지막날 도착누적거리 구하기 (arriveKm 기준) - 7월 고정값 적용 제외
  let prevMonthLastDayArriveKm = '0';
  if (month !== 6) { // 6은 7월 (0부터 시작)
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthWorkingDays = getWorkingDays(prevYear, prevMonth);
    if (prevMonthWorkingDays.length > 0) {
      const prevLastDayIndex = prevMonthWorkingDays.length - 1;
      const prevLastDayLog = (vehicleTripLogs[vehicleName] || []).find(l => l.dateOffset === prevLastDayIndex);
      if (prevLastDayLog && prevLastDayLog.arriveKm && prevLastDayLog.arriveKm.trim() !== '') {
        prevMonthLastDayArriveKm = prevLastDayLog.arriveKm.trim();
      }
    }
  }

  let cumulativeWorkDriveKm = 0;

  workingDays.forEach((dateObj, idx) => {
    const row = document.createElement('tr');

    // 일련번호
    const cellSerial = document.createElement('td');
    cellSerial.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
    row.appendChild(cellSerial);

    // 부서 (select, 중앙정렬, 옵션 제한)
    const cellDept = document.createElement('td');
    const log = logs.find(l => l.dateOffset === idx);
    const selectDept = document.createElement('select');
    selectDept.className = 'department-select';
    selectDept.setAttribute('aria-label', '부서명 선택');
    ['기술지원팀', '영업팀'].forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt;
      optionEl.textContent = opt;
      if (log && log.dept === opt) optionEl.selected = true;
      selectDept.appendChild(optionEl);
    });
    cellDept.appendChild(selectDept);
    row.appendChild(cellDept);

    // 직책 (select)
    const cellPos = document.createElement('td');
    const selectPos = document.createElement('select');
    selectPos.className = 'position-select';
    selectPos.setAttribute('aria-label', '직책 선택');
    ['사원', '주임', '대리', '과장', '차장', '부장', '상무', '전무'].forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt;
      optionEl.textContent = opt;
      if (log && log.pos === opt) optionEl.selected = true;
      selectPos.appendChild(optionEl);
    });
    cellPos.appendChild(selectPos);
    row.appendChild(cellPos);

    // 성명 (투명 input)
    const cellName = document.createElement('td');
    cellName.classList.add('name-cell');
    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.className = 'name-input';
    inputName.value = log ? log.name : '';
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

    // 출발누적거리
    const cellDepartKm = document.createElement('td');
    let departKmVal = '';

    if (idx === 0) {
      // 7월이면 고정값 적용, 아니면 전달 마지막날 도착누적거리
      if (month === 6 && julyFixedDepartKmMap[vehicleName]) {
        departKmVal = julyFixedDepartKmMap[vehicleName];
      } else {
        departKmVal = prevMonthLastDayArriveKm || '0';
      }
    } else {
      // 두번째 행부터: 전날 도착누적거리 표시
      const prevRow = tripLogTbody.rows[idx - 1];
      if (prevRow) {
        const prevArriveKmCell = prevRow.cells[9];
        let prevArriveKm = '';
        const prevInput = prevArriveKmCell.querySelector('input');
        if (prevInput) {
          prevArriveKm = prevInput.value.trim() || '0';
        } else {
          prevArriveKm = prevArriveKmCell.textContent.trim() || '0';
        }
        departKmVal = prevArriveKm;
      } else {
        departKmVal = '0';
      }
    }
    cellDepartKm.textContent = departKmVal;
    row.appendChild(cellDepartKm);

    // 도착지 (투명 input)
    const cellArrivePlace = document.createElement('td');
    const inputArrivePlace = document.createElement('input');
    inputArrivePlace.type = 'text';
    inputArrivePlace.className = 'name-input';
    inputArrivePlace.value = log ? log.arrivePlace : '';
    inputArrivePlace.setAttribute('aria-label', '도착지 입력');
    cellArrivePlace.appendChild(inputArrivePlace);
    row.appendChild(cellArrivePlace);

    // 도착누적거리 (투명 input)
    const cellArriveKm = document.createElement('td');
    const inputArriveKm = document.createElement('input');
    inputArriveKm.type = 'number';
    inputArriveKm.min = '0';
    inputArriveKm.className = 'input-km';
    inputArriveKm.value = log ? log.arriveKm : '';
    inputArriveKm.setAttribute('aria-label', '도착 누적거리 입력');
    cellArriveKm.appendChild(inputArriveKm);
    row.appendChild(cellArriveKm);

    // 주행거리 (계산 값)
    const cellDriveKm = document.createElement('td');
    cellDriveKm.textContent = '';
    row.appendChild(cellDriveKm);

    // 업무용주행거리누계 (계산 값)
    const cellWorkDriveKm = document.createElement('td');
    cellWorkDriveKm.textContent = '';
    row.appendChild(cellWorkDriveKm);

    // 주유금액 (투명 input)
    const cellFuelAmount = document.createElement('td');
    const inputFuelAmount = document.createElement('input');
    inputFuelAmount.type = 'text';
    inputFuelAmount.className = 'name-input';
    inputFuelAmount.value = log ? log.fuelAmount : '';
    inputFuelAmount.setAttribute('aria-label', '주유금액 입력');
    cellFuelAmount.appendChild(inputFuelAmount);
    row.appendChild(cellFuelAmount);

    // 주유용량 (투명 input)
    const cellFuelVolume = document.createElement('td');
    const inputFuelVolume = document.createElement('input');
    inputFuelVolume.type = 'text';
    inputFuelVolume.className = 'name-input';
    inputFuelVolume.value = log ? log.fuelVolume : '';
    inputFuelVolume.setAttribute('aria-label', '주유용량 입력');
    cellFuelVolume.appendChild(inputFuelVolume);
    row.appendChild(cellFuelVolume);

    function recalcDriveAndCumulative() {
      const departKmNum = Number(cellDepartKm.textContent) || 0;
      const arriveValRaw = inputArriveKm.value.trim();
      const arriveKmNum = arriveValRaw === '' ? 0 : Number(arriveValRaw);
      let driveKm = arriveKmNum - departKmNum;
      if (driveKm < 0) driveKm = 0;
      cellDriveKm.textContent = driveKm;

      if (idx === 0) {
        cumulativeWorkDriveKm = driveKm;
        cellWorkDriveKm.textContent = cumulativeWorkDriveKm;
      } else {
        const prevRow = tripLogTbody.rows[idx - 1];
        let prevCumulative = 0;
        if (prevRow) {
          const prevWorkDriveCell = prevRow.cells[11];
          prevCumulative = Number(prevWorkDriveCell.textContent) || 0;
        }
        cumulativeWorkDriveKm = prevCumulative + driveKm;
        cellWorkDriveKm.textContent = cumulativeWorkDriveKm;
      }
    }

    function saveLog() {
      if (!vehicleTripLogs[vehicleName]) {
        vehicleTripLogs[vehicleName] = [];
      }
      const existingLogIndex = vehicleTripLogs[vehicleName].findIndex(l => l.dateOffset === idx);
      const newLog = {
        dept: selectDept.value,
        pos: selectPos.value,
        name: inputName.value.trim(),
        dateOffset: idx,
        departKm: cellDepartKm.textContent.trim(),
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

    inputArriveKm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveLog();
        recalcDriveAndCumulative();
      }
    });

    inputArriveKm.addEventListener('blur', () => {
      saveLog();
      recalcDriveAndCumulative();
    });

    // 최초 계산 실행
    recalcDriveAndCumulative();

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