// 차량별 첫 출발 누적거리 저장
const initialDepartureDistances = {};

// 현재 선택 차량 ID 및 이름
let selectedVehicleId = null;
let selectedVehicleName = "";

// 운행 기록 저장 배열
const tripLogs = [];

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
  const initial = initialDepartureDistances[vehicleId];
  const adjustedDeparture = Math.max(departureDist - initial, 0);
  const adjustedArrival = Math.max(arrivalDist - initial, 0);
  const drivingDistance = Math.max(adjustedArrival - adjustedDeparture, 0);
  return { adjustedDeparture, adjustedArrival, drivingDistance };
}

// 운행 기록 렌더링 함수
function renderTripLogs() {
  const tbody = document.getElementById('trip-log-tbody');
  tbody.innerHTML = '';
  tripLogs.forEach(log => {
    if (log.vehicleId !== selectedVehicleId) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${log.serialNumber}</td>
      <td>${log.department}</td>
      <td>${log.position}</td>
      <td>${log.name}</td>
      <td>${log.purpose}</td>
      <td>${log.date}</td>
      <td>${log.departure}</td>
      <td>${log.adjustedDepartureDistance}</td>
      <td>${log.arrival}</td>
      <td>${log.adjustedArrivalDistance}</td>
      <td>${log.drivingDistance}</td>
      <td>${log.businessDrivingTotal}</td>
      <td>${log.fuelAmount}</td>
      <td>${log.fuelVolume}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 폼 초기화
function resetForm() {
  const form = document.getElementById('trip-log-form');
  form.reset();
  const lastLog = [...tripLogs].reverse().find(log => log.vehicleId === selectedVehicleId);
  form.serialNumber.value = lastLog ? lastLog.serialNumber + 1 : 1;
}

// 이벤트 리스너 등록 및 초기 차량 선택
window.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('basic-info-tbody');
  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => selectVehicle(row));
    row.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVehicle(row);
      }
    });
  });

  // 첫 차량 자동 선택
  const firstRow = tbody.querySelector('tr');
  if(firstRow) selectVehicle(firstRow);

  // 운행 기록 추가 폼 제출 이벤트
  document.getElementById('trip-log-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedVehicleId) {
      alert('차량을 선택해주세요.');
      return;
    }
    const form = e.target;
    const serialNumber = Number(form.serialNumber.value);
    const department = form.department.value.trim();
    const position = form.position.value.trim();
    const name = form.name.value.trim();
    const purpose = form.purpose.value.trim();
    const date = form.date.value;
    const departure = form.departure.value.trim();
    const departureDistance = Number(form.departureDistance.value);
    const arrival = form.arrival.value.trim();
    const arrivalDistance = Number(form.arrivalDistance.value);
    const businessDrivingTotal = Number(form.businessDrivingTotal.value) || 0;
    const fuelAmount = Number(form.fuelAmount.value) || 0;
    const fuelVolume = Number(form.fuelVolume.value) || 0;

    if (isNaN(serialNumber) || isNaN(departureDistance) || isNaN(arrivalDistance)) {
      alert('숫자 입력란에 올바른 값을 입력해주세요.');
      return;
    }

    const { adjustedDeparture, adjustedArrival, drivingDistance } = calculateAdjustedDistances(
      selectedVehicleId,
      departureDistance,
      arrivalDistance
    );

    tripLogs.push({
      vehicleId: selectedVehicleId,
      serialNumber,
      department,
      position,
      name,
      purpose,
      date,
      departure,
      departureDistance,
      adjustedDepartureDistance: adjustedDeparture,
      arrival,
      arrivalDistance,
      adjustedArrivalDistance: adjustedArrival,
      drivingDistance,
      businessDrivingTotal,
      fuelAmount,
      fuelVolume,
    });

    renderTripLogs();
    resetForm();
  });
});