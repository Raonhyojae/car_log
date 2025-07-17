window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    select.custom-select-no-arrow {
      background-color: #2a2f4a; /* 테이블 배경색과 동일하게 어두운 네이비톤 */
      color: #d0d4e6; /* 밝은 회색 텍스트 */
      border: 1px solid #444a6b;
      padding: 2px 6px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }
    select.custom-select-no-arrow::-ms-expand {
      display: none;
    }
  `;
  document.head.appendChild(style);
});