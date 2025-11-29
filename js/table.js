// Table Management Functions

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
  const tdMerchant = document.createElement('td');
  const merchantInput = document.createElement('input');
  merchantInput.type = 'text';
  merchantInput.placeholder = 'Merchant';
  if (data && data.merchant) merchantInput.value = data.merchant;
  tdMerchant.appendChild(merchantInput);

  // Date wrapper
  const tdDate = document.createElement('td');
  const dateWrapper = createDateInputWrapper(data ? data.enrollmentDate : '');
  tdDate.appendChild(dateWrapper);

  // Amount
  const tdAmount = document.createElement('td');
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.step = '0.01';
  amountInput.placeholder = 'Amount';
  if (data && data.amount) amountInput.value = data.amount;
  tdAmount.appendChild(amountInput);

  // Total installments
  const tdTotal = document.createElement('td');
  const totalInput = document.createElement('input');
  totalInput.type = 'number';
  totalInput.placeholder = 'Total';
  totalInput.className = 'auto-recalc';
  if (data && data.total) totalInput.value = data.total;
  tdTotal.appendChild(totalInput);

  // First Installment (calculated)
  const tdFirst = document.createElement('td');
  tdFirst.style.textAlign = 'center';
  tdFirst.style.color = '#9ca3af';

  // Current Installment No. (calculated)
  const tdCurrent = document.createElement('td');
  tdCurrent.style.textAlign = 'center';
  tdCurrent.style.color = '#9ca3af';

  // Remaining (calculated)
  const tdRemaining = document.createElement('td');
  tdRemaining.style.textAlign = 'center';
  tdRemaining.style.color = '#9ca3af';

  // Actions
  const tdActions = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'danger';
  deleteBtn.type = 'button';
  deleteBtn.textContent = '🗑';
  deleteBtn.onclick = function() { deleteRow(this); };
  tdActions.appendChild(deleteBtn);

  // Append all cells
  tr.appendChild(tdMerchant);
  tr.appendChild(tdDate);
  tr.appendChild(tdAmount);
  tr.appendChild(tdTotal);
  tr.appendChild(tdFirst);
  tr.appendChild(tdCurrent);
  tr.appendChild(tdRemaining);
  tr.appendChild(tdActions);

  tbody.appendChild(tr);

  // Add event listeners for auto-recalculation
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
  const val = document.getElementById('billingMonth').value;
  if (!val) return;
  const billingDate = new Date(val + '-01T00:00:00');
  recomputeRowsAndCollectTimeline(billingDate, false);
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

  rows.sort((rowA, rowB) => {
    let valA, valB;
    const cellsA = rowA.querySelectorAll('td');
    const cellsB = rowB.querySelectorAll('td');

    if (column === 'merchant') {
      const inputA = cellsA[0].querySelector('input');
      const inputB = cellsB[0].querySelector('input');
      valA = inputA ? inputA.value.toLowerCase() : '';
      valB = inputB ? inputB.value.toLowerCase() : '';
      if (currentSortDirection === 'asc') {
        return valA.localeCompare(valB);
      } else {
        return valB.localeCompare(valA);
      }
    } else if (column === 'enrollmentDate') {
      const dateA = getDateValue(cellsA[1]);
      const dateB = getDateValue(cellsB[1]);
      valA = dateA ? new Date(dateA + 'T00:00:00').getTime() : 0;
      valB = dateB ? new Date(dateB + 'T00:00:00').getTime() : 0;
    } else if (column === 'amount') {
      const inputA = cellsA[2].querySelector('input');
      const inputB = cellsB[2].querySelector('input');
      valA = parseFloat(inputA ? inputA.value : 0) || 0;
      valB = parseFloat(inputB ? inputB.value : 0) || 0;
    } else if (column === 'total') {
      const inputA = cellsA[3].querySelector('input');
      const inputB = cellsB[3].querySelector('input');
      valA = parseInt(inputA ? inputA.value : 0) || 0;
      valB = parseInt(inputB ? inputB.value : 0) || 0;
    } else if (column === 'currentInstallment') {
      valA = parseInt(cellsA[5].textContent) || 0;
      valB = parseInt(cellsB[5].textContent) || 0;
    }

    if (column !== 'merchant') {
      if (currentSortDirection === 'asc') {
        return valA - valB;
      } else {
        return valB - valA;
      }
    }
    return 0;
  });

  rows.forEach(row => tbody.appendChild(row));

  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  const activeHeader = document.querySelector(`th.sortable[data-column="${column}"]`);
  if (activeHeader) {
    activeHeader.classList.add(currentSortDirection);
  }
}


