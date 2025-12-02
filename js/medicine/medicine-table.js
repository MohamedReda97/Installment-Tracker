// Medicine Table - CRUD Operations

console.log('📋 Medicine Table module loaded');

// Generate unique ID for medicines
function generateMedicineId() {
  return 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Delete medicine row
function deleteMedicineRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    autoSaveMedicineToStorage();
  }
}

// Add medicine row to table
function addMedicineRow(data) {
  const tbody = document.querySelector('#medicineTable tbody');
  const tr = document.createElement('tr');

  // Generate ID if not provided
  const medicineId = (data && data.id) ? data.id : generateMedicineId();
  tr.setAttribute('data-medicine-id', medicineId);

  // Name
  const tdName = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Medicine name';
  nameInput.required = true;
  if (data && data.name) nameInput.value = data.name;
  tdName.appendChild(nameInput);

  // Dose
  const tdDose = document.createElement('td');
  const doseInput = document.createElement('input');
  doseInput.type = 'text';
  doseInput.placeholder = 'e.g., 5000 IU';
  if (data && data.dose) doseInput.value = data.dose;
  tdDose.appendChild(doseInput);

  // Time (dropdown)
  const tdTime = document.createElement('td');
  const timeSelect = document.createElement('select');
  timeSelect.required = true;

  // Add time options
  const timeOptions = ['', 'Morning', 'Breakfast', 'Lunch', 'Dinner', 'Evening'];
  timeOptions.forEach((option, index) => {
    const optionEl = document.createElement('option');
    optionEl.value = option;
    optionEl.textContent = option || 'Select time...';
    if (index === 0) optionEl.disabled = true; // Disable placeholder option
    timeSelect.appendChild(optionEl);
  });

  // Set selected value
  if (data && data.time) {
    timeSelect.value = data.time;
  } else {
    timeSelect.value = 'Morning'; // Default to Morning
  }

  tdTime.appendChild(timeSelect);

  // Start Date (using date wrapper like installments)
  const tdStartDate = document.createElement('td');
  const dateWrapper = createDateInputWrapper(data ? data.startDate : '');
  tdStartDate.appendChild(dateWrapper);

  // Duration (months)
  const tdDuration = document.createElement('td');
  const durationInput = document.createElement('input');
  durationInput.type = 'number';
  durationInput.min = '1';
  durationInput.placeholder = 'Months';
  durationInput.required = true;
  if (data && data.duration) durationInput.value = data.duration;
  tdDuration.appendChild(durationInput);

  // Pause (months)
  const tdPause = document.createElement('td');
  const pauseInput = document.createElement('input');
  pauseInput.type = 'number';
  pauseInput.min = '0';
  pauseInput.placeholder = 'Optional';
  if (data && data.pause) pauseInput.value = data.pause;
  tdPause.appendChild(pauseInput);

  // Notes
  const tdNotes = document.createElement('td');
  const notesInput = document.createElement('input');
  notesInput.type = 'text';
  notesInput.placeholder = 'Notes';
  if (data && data.notes) notesInput.value = data.notes;
  tdNotes.appendChild(notesInput);

  // Actions
  const tdActions = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'danger';
  deleteBtn.type = 'button';
  deleteBtn.textContent = '🗑';
  deleteBtn.onclick = function() { deleteMedicineRow(this); };
  tdActions.appendChild(deleteBtn);

  // Append all cells
  tr.appendChild(tdName);
  tr.appendChild(tdDose);
  tr.appendChild(tdTime);
  tr.appendChild(tdStartDate);
  tr.appendChild(tdDuration);
  tr.appendChild(tdPause);
  tr.appendChild(tdNotes);
  tr.appendChild(tdActions);

  tbody.appendChild(tr);

  // Add auto-save listeners to all inputs and select
  const allInputs = tr.querySelectorAll('input, select');
  allInputs.forEach(input => {
    input.addEventListener('change', autoSaveMedicineToStorage);
  });
}

// Get date value from date wrapper
function getMedicineDateValue(cell) {
  const wrapper = cell.querySelector('.date-wrapper');
  if (wrapper) {
    const dateInput = wrapper.querySelector('input[type="date"]');
    return dateInput ? dateInput.value : '';
  }
  return '';
}

// Read medicine table data
function readMedicineTableData() {
  const rows = document.querySelectorAll('#medicineTable tbody tr');
  const data = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 7) return;

    const nameInput = cells[0].querySelector('input');
    const doseInput = cells[1].querySelector('input');
    const timeSelect = cells[2].querySelector('select');
    const startDate = getMedicineDateValue(cells[3]);
    const durationInput = cells[4].querySelector('input');
    const pauseInput = cells[5].querySelector('input');
    const notesInput = cells[6].querySelector('input');

    const name = nameInput ? nameInput.value.trim() : '';
    const dose = doseInput ? doseInput.value.trim() : '';
    const time = timeSelect ? timeSelect.value : 'Morning';
    const duration = durationInput ? durationInput.value.trim() : '';
    const pause = pauseInput ? pauseInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';
    const id = row.getAttribute('data-medicine-id') || generateMedicineId();

    // Skip empty rows
    if (!name && !dose && !startDate && !duration) return;

    data.push({
      id,
      name,
      dose,
      time,
      startDate,
      duration: duration ? parseInt(duration) : 0,
      pause: pause ? parseInt(pause) : 0,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return data;
}

// Write medicine table data
function writeMedicineTableData(dataArray) {
  const tbody = document.querySelector('#medicineTable tbody');
  tbody.innerHTML = '';
  dataArray.forEach((medicine) => addMedicineRow(medicine));
}

