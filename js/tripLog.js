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

    const fields = [
      idx + 1,
      log.dept,
      log.pos,
      log.name,
      log.purpose || '',
      log.date || '',
      log.departPlace || '',
      log.departKm || '',
      log.arrivePlace || '',
      log.arriveKm || '',
      log.driveKm || '',
      log.workKm || '',
      log.fuelAmount || '',
      log.fuelVolume || '',
    ];

    fields.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });

    tripLogTbody.appendChild(tr);
  });
}

// 차량별 운행 기록 엑셀 내보내기
export function exportTripLogToExcel(vehicleName) {
  if (!vehicleName || !(vehicleName in vehicleTripLogs)) {
    alert('유효한 차량명을 선택해 주세요.');
    return;
  }

  const logs = vehicleTripLogs[vehicleName];
  if (!logs || logs.length === 0) {
    alert('선택한 차량의 운행 기록이 없습니다.');
    return;
  }

  // 엑셀 워크시트용 2차원 배열 (헤더 포함)
  const wsData = [
    ['번호', '부서', '직책', '성명', '사용 목적', '사용 일자', '출발지', '출발 누적 거리', '도착지', '도착 누적 거리', '주행 거리', '업무용 주행 거리 누계', '주유 금액', '주유 용량'],
  ];

  logs.forEach((log, idx) => {
    wsData.push([
      idx + 1,
      log.dept,
      log.pos,
      log.name,
      log.purpose || '',
      log.date || '',
      log.departPlace || '',
      log.departKm || '',
      log.arrivePlace || '',
      log.arriveKm || '',
      log.driveKm || '',
      log.workKm || '',
      log.fuelAmount || '',
      log.fuelVolume || '',
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, '운행기록');

  // 파일명 예: 운행기록_레이밴_2025_07.xlsx
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const filename = `운행기록_${vehicleName}_${year}_${month}.xlsx`;

  XLSX.writeFile(wb, filename);
}
