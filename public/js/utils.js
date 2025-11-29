// Utility Functions

// Generate or retrieve user ID
function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
    console.log('Generated new user ID:', userId);
  }
  return userId;
}

// Date formatting functions
function formatDateDMY(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}/${m}/${y}`;
}

function ymdToDMY(ymdStr) {
  if (!ymdStr) return '';
  const parts = ymdStr.split('-');
  if (parts.length !== 3) return ymdStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function dmyToYMD(dmyStr) {
  if (!dmyStr) return '';
  const parts = dmyStr.split('/');
  if (parts.length !== 3) return dmyStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Add months to a date
function addMonthsToDate(dateStr, numMonths) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + numMonths);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Create date input wrapper
function createDateInputWrapper(value = '') {
  const wrapper = document.createElement('div');
  wrapper.className = 'date-wrapper';
  
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.placeholder = 'dd/mm/yyyy';
  textInput.className = 'auto-recalc date-display';
  if (value) {
    textInput.value = ymdToDMY(value);
  }
  
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'date-picker-hidden';
  dateInput.tabIndex = -1;
  if (value) {
    dateInput.value = value;
  }
  
  // When date picker changes, update text input
  dateInput.addEventListener('change', function() {
    if (this.value) {
      textInput.value = ymdToDMY(this.value);
      textInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  // Auto-format as user types
  textInput.addEventListener('input', function() {
    let val = this.value.replace(/[^\d]/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    if (val.length >= 5) {
      val = val.substring(0, 5) + '/' + val.substring(5, 9);
    }
    this.value = val;
  });
  
  // Validate on blur
  textInput.addEventListener('blur', function() {
    const ymd = dmyToYMD(this.value);
    if (ymd && ymd.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const testDate = new Date(ymd + 'T00:00:00');
      if (!isNaN(testDate.getTime())) {
        dateInput.value = ymd;
        this.value = ymdToDMY(ymd);
        this.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  
  // Enter key support
  textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      this.blur();
    }
  });
  
  wrapper.appendChild(textInput);
  wrapper.appendChild(dateInput);
  
  return wrapper;
}

// Get date value from cell
function getDateValue(cell) {
  const wrapper = cell.querySelector('.date-wrapper');
  if (wrapper) {
    const dateInput = wrapper.querySelector('input[type="date"]');
    return dateInput ? dateInput.value : '';
  }
  // Fallback for old-style date inputs
  const input = cell.querySelector('input[type="date"]');
  return input ? input.value : '';
}

// Convert existing date inputs to wrappers
function convertExistingDateInputs() {
  const rows = document.querySelectorAll('#installmentsTable tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;
    
    const dateCell = cells[1];
    const oldDateInput = dateCell.querySelector('input[type="date"]');
    
    if (oldDateInput && !dateCell.querySelector('.date-wrapper')) {
      const value = oldDateInput.value;
      dateCell.innerHTML = '';
      const wrapper = createDateInputWrapper(value);
      dateCell.appendChild(wrapper);
    }
  });
}

