// Table Management Functions

// Read table data
function readTableData() {
  const rows = document.querySelectorAll('#installmentsTable tbody tr');
  const data = [];
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 4) return;
    
    const merchantInput = cells[0].querySelector('input');
    const enrollmentDate = getDateValue(cells[1]);
    const amountInput = cells[2].querySelector('input');
    const totalInput = cells[3].querySelector('input');
    
    const merchant = merchantInput ? merchantInput.value.trim() : '';
    const amount = amountInput ? amountInput.value.trim() : '';
    const total = totalInput ? totalInput.value.trim() : '';
    
    if (!merchant && !enrollmentDate && !amount && !total) return;
    data.push({ merchant, enrollmentDate, amount, total });
  });
  return data;
}

// Write table data
function writeTableData(dataArray) {
  const tbody = document.querySelector('#installmentsTable tbody');
  tbody.innerHTML = '';
  dataArray.forEach((row) => addRow(row));
}

// Delete row
function deleteRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    autoSaveToStorage();
  }
}

// Add row to table
function addRow(data) {
  const tbody = document.querySelector('#installmentsTable tbody');
  const tr = document.createElement('tr');

  // Merchant
  const td1 = document.createElement('td');
  const inp1 = document.createElement('input');
  inp1.type = 'text';
  inp1.placeholder = 'e.g. Amazon 387.16';
  inp1.value = data?.merchant || '';
  td1.appendChild(inp1);

  // Enrollment Date
  const td2 = document.createElement('td');
  const dateWrapper = createDateInputWrapper(data?.enrollmentDate || '');
  td2.appendChild(dateWrapper);

  // Amount
  const td3 = document.createElement('td');
  const inp3 = document.createElement('input');
  inp3.type = 'number';
  inp3.step = '0.01';
  inp3.placeholder = '0.00';
  inp3.value = data?.amount || '';
  inp3.className = 'auto-recalc';
  td3.appendChild(inp3);

  // Total Installments
  const td4 = document.createElement('td');
  const inp4 = document.createElement('input');
  inp4.type = 'number';
  inp4.min = '1';
  inp4.placeholder = '12';
  inp4.value = data?.total || '';
  inp4.className = 'auto-recalc';
  td4.appendChild(inp4);

  // First Installment (calculated, read-only)
  const td5 = document.createElement('td');
  td5.style.textAlign = 'center';
  td5.style.color = '#9ca3af';
  td5.textContent = '';

  // Current Installment No. (calculated, read-only)
  const td6 = document.createElement('td');
  td6.style.textAlign = 'center';
  td6.style.color = '#9ca3af';
  td6.textContent = '';

  // Remaining (calculated, read-only)
  const td7 = document.createElement('td');
  td7.style.textAlign = 'center';
  td7.style.color = '#9ca3af';
  td7.textContent = '';

  // Actions
  const td8 = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑';
  delBtn.className = 'secondary';
  delBtn.onclick = function() { deleteRow(this); };
  td8.appendChild(delBtn);

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);
  tr.appendChild(td5);
  tr.appendChild(td6);
  tr.appendChild(td7);
  tr.appendChild(td8);
  tbody.appendChild(tr);

  // Add event listeners for auto-recalculation and auto-save
  const autoRecalcInputs = tr.querySelectorAll('.auto-recalc');
  autoRecalcInputs.forEach(input => {
    input.addEventListener('change', triggerRecalculation);
  });
  
  // Add auto-save listeners to all inputs
  const allInputs = tr.querySelectorAll('input');
  allInputs.forEach(input => {
    input.addEventListener('change', autoSaveToStorage);
  });
}

// Trigger recalculation
function triggerRecalculation() {
  const billingInput = document.getElementById('billingMonth');
  if (billingInput.value) {
    const billingDate = new Date(billingInput.value + '-01T00:00:00');
    recomputeRowsAndCollectTimeline(billingDate, false);
  }
}

// Sorting functionality
let currentSortColumn = null;
let currentSortDirection = 'asc';

function sortTable(column) {
  const tbody = document.querySelector('#installmentsTable tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  if (currentSortColumn === column) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = column;
    currentSortDirection = 'asc';
  }
  
  rows.sort((a, b) => {
    let aVal, bVal;
    
    const aCells = a.querySelectorAll('td');
    const bCells = b.querySelectorAll('td');
    
    switch(column) {
      case 'merchant':
        aVal = aCells[0].querySelector('input')?.value || '';
        bVal = bCells[0].querySelector('input')?.value || '';
        break;
      case 'enrollmentDate':
        aVal = getDateValue(aCells[1]) || '';
        bVal = getDateValue(bCells[1]) || '';
        break;
      case 'amount':
        aVal = parseFloat(aCells[2].querySelector('input')?.value) || 0;
        bVal = parseFloat(bCells[2].querySelector('input')?.value) || 0;
        break;
      case 'total':
        aVal = parseInt(aCells[3].querySelector('input')?.value) || 0;
        bVal = parseInt(bCells[3].querySelector('input')?.value) || 0;
        break;
      case 'currentInstallment':
        aVal = parseInt(aCells[5].textContent) || 0;
        bVal = parseInt(bCells[5].textContent) || 0;
        break;
    }
    
    if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  tbody.innerHTML = '';
  rows.forEach(row => tbody.appendChild(row));
  
  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  const activeHeader = document.querySelector(`th.sortable[data-column="${column}"]`);
  if (activeHeader) {
    activeHeader.classList.add(currentSortDirection);
  }
}

