// 차량별 첫 출발 누적거리 저장
const initialDepartureDistances = {};

// 현재 선택 차량 ID 및 이름
let selectedVehicleId = null;
let selectedVehicleName = "";

// 운행 기록 저장 배열
const tripLogs = [];

// 사업연도 표시 함수
function setBusinessYear() {
  const yearElem = document.getElementById('business-year');
  if (yearElem) {
    const now = new Date();
    yearElem.textContent = now.getFullYear() + '년';
  }
}

// 차량 선택 함수
function selectVehicle(row) {
  // 선택 해제 및 선택 표시
  document.querySelectorAll('#basic-info-tbody tr').forEach(r => r.classList.remove('selected'));
  row.classList.add('selected');

  selectedVehicleId = row.dataset.vehicleId;
  selectedVehicleName = row.querySelector('td.selectable-vehicle').textContent;

  document.getElementById('selected-vehicle-name').textContent = `${selectedVehicleName} (${selectedVehicleId})`;
  document.getElementById('trip-log-section').style.display = 'block';

  renderTripLogs();
  resetForm();
}

// 주행거리 보정 함수
function calculateAdjustedDistances(vehicleId, departureDist, arrivalDist) {
  if (!(vehicleId in initialDepartureDistances)) {
    initialDepartureDistances[vehicleId] = departureDist;
  }
  const adjustedDeparture = departureDist - initialDepartureDistances[vehicleId];
  const adjustedArrival = arrivalDist - initialDepartureDistances[vehicleId];
  const adjustedDistance = adjustedArrival - adjustedDeparture;
  return {
    adjustedDeparture,
    adjustedArrival,
    adjustedDistance
  };
}

// 운행 기록 렌더링
function renderTripLogs() {
  const tbody = document.getElementById('trip-log-tbody');
  tbody.innerHTML = '';

  const filteredLogs = tripLogs.filter(log => log.vehicleId === selectedVehicleId);
  filteredLogs.forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${log.date}</td>
      <td>${log.departureDistance}</td>
      <td>${log.arrivalDistance}</td>
      <td>${log.adjustedDistance}</td>
      <td>${log.notes || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 폼 초기화
function resetForm() {
  const form = document.getElementById('trip-log-form');
  form.reset();
}

// 폼 제출 처리
function handleFormSubmit(event) {
  event.preventDefault();
  if (!selectedVehicleId) {
    alert('차량을 선택해주세요.');
    return;
  }

  const date = document.getElementById('trip-date').value;
  const departureDistance = Number(document.getElementById('departure-distance').value);
  const arrivalDistance = Number(document.getElementById('arrival-distance').value);
  const notes = document.getElementById('notes').value;

  if (arrivalDistance < departureDistance) {
    alert('도착 누적거리는 출발 누적거리보다 작을 수 없습니다.');
    return;
  }

  const { adjustedDistance } = calculateAdjustedDistances(selectedVehicleId, departureDistance, arrivalDistance);

  tripLogs.push({
    vehicleId: selectedVehicleId,
    date,
    departureDistance,
    arrivalDistance,
    adjustedDistance,
    notes
  });

  renderTripLogs();
  resetForm();
}

// 초기화 함수
function init() {
  setBusinessYear();

  // 차량 선택 이벤트 바인딩
  document.querySelectorAll('#basic-info-tbody tr').forEach(row => {
    row.addEventListener('click', () => selectVehicle(row));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVehicle(row);
      }
    });
  });

  // 폼 제출 이벤트 바인딩
  document.getElementById('trip-log-form').addEventListener('submit', handleFormSubmit);
}

window.addEventListener('DOMContentLoaded', init);