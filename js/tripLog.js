// 차량별 운행 기록 데이터 (예시)
const vehicleTripLogs = {
  '레이밴': [
    { dept: '기술지원팀', pos: '과장', name: '', purpose: '', date: '2025-07-14', departPlace: '', departKm: '', arrivePlace: '', arriveKm: '', driveKm: '', workKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '스타리아': [
    { dept: '기술지원팀', pos: '과장', name: '', purpose: '', date: '2025-07-13', departPlace: '', departKm: '', arrivePlace: '', arriveKm: '', driveKm: '', workKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '1톤 리프트 탑차': [
    { dept: '영업팀', pos: '대리', name: '', purpose: '', date: '2025-07-12', departPlace: '', departKm: '', arrivePlace: '', arriveKm: '', driveKm: '', workKm: '', fuelAmount: '', fuelVolume: '' },
  ],
  '레이밴 282우6998': [
    { dept: '영업팀', pos: '대리', name: '', purpose: '', date: '2025-07-11', departPlace: '', departKm: '', arrivePlace: '', arriveKm: '', driveKm: '', workKm: '', fuelAmount: '', fuelVolume: '' },
  ],
};

// 운행 기록 렌더링
export function renderTripLog(vehicleName) {
  const tripLogWrapper = document.getElementById('trip-log-wrapper');
  const tripLogTbody = document.getElementById('trip-log-tbody');
  const notice = document.getElementById('notice');

  if (!vehicleName || !(vehicleName in vehicleTripLogs)) {
    tripLogWrapper.style.display = 'none';
    notice.style.display = 'block';
    return;
  }

  tripLogWrapper.style.display = 'block';
  notice.style.display = 'none';

  tripLogTbody.innerHTML = '';

  const logs = vehicleTripLogs[vehicleName];
  logs.forEach((log, idx) => {
    const tr = document.createElement('tr');

    // 일련번호
    const tdIdx = document.createElement('td');
    tdIdx.textContent = idx + 1;
    tr.appendChild(tdIdx);

    // 부서
    const tdDept = document.createElement('td');
    tdDept.textContent = log.dept;
    tr.appendChild(tdDept);

    // 직책
    const tdPos = document.createElement('td');
    tdPos.textContent = log.pos;
    tr.appendChild(tdPos);

    // 성명
    const tdName = document.createElement('td');
    tdName.textContent = log.name;
    tr.appendChild(tdName);

    // 사용 목적
    const tdPurpose = document.createElement('td');
    tdPurpose.textContent = log.purpose || '';
    tr.appendChild(tdPurpose);

    // 사용 일자
    const tdDate = document.createElement('td');
    tdDate.textContent = log.date || '';
    tr.appendChild(tdDate);

    // 출발지
    const tdDepartPlace = document.createElement('td');
    tdDepartPlace.textContent = log.departPlace || '';
    tr.appendChild(tdDepartPlace);

    // 출발 누적 거리
    const tdDepartKm = document.createElement('td');
    tdDepartKm.textContent = log.departKm || '';
    tr.appendChild(tdDepartKm);

    // 도착지
    const tdArrivePlace = document.createElement('td');
    tdArrivePlace.textContent = log.arrivePlace || '';
    tr.appendChild(tdArrivePlace);

    // 도착 누적 거리
    const tdArriveKm = document.createElement('td');
    tdArriveKm.textContent = log.arriveKm || '';
    tr.appendChild(tdArriveKm);

    // 주행 거리
    const tdDriveKm = document.createElement('td');
    tdDriveKm.textContent = log.driveKm || '';
    tr.appendChild(tdDriveKm);

    // 업무용 주행 거리 누계
    const tdWorkKm = document.createElement('td');
    tdWorkKm.textContent = log.workKm || '';
    tr.appendChild(tdWorkKm);

    // 주유 금액
    const tdFuelAmount = document.createElement('td');
    tdFuelAmount.textContent = log.fuelAmount || '';
    tr.appendChild(tdFuelAmount);

    // 주유 용량
    const tdFuelVolume = document.createElement('td');
    tdFuelVolume.textContent = log.fuelVolume || '';
    tr.appendChild(tdFuelVolume);

    tripLogTbody.appendChild(tr);
  });
}
