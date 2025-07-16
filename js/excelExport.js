// 엑셀 내보내기 기능 (SheetJS 활용)
export function exportToExcel(data) {
  if (!data || data.length === 0) {
    alert('저장된 기본정보 데이터가 없습니다.');
    return;
  }

  // 워크시트 생성용 배열 (헤더 포함)
  const wsData = [
    ['차종', '자동차등록번호', '자택', '근무지', '출퇴근거리 (km)'],
  ];

  data.forEach(row => {
    wsData.push([
      row.vehicle,
      row.regNum,
      row.home,
      row.workplace,
      row.commuteDistance,
    ]);
  });

  // 워크북 생성
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  XLSX.utils.book_append_sheet(wb, ws, '기본정보');

  // 파일명 예시: 차량운행기록부_2025_07.xlsx
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const filename = `차량운행기록부_${year}_${month}.xlsx`;

  XLSX.writeFile(wb, filename);
}
