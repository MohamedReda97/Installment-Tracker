// Main Application Initialization

(function init() {
  console.log('🚀 Initializing Installment Tracker...');

  // Set current month as default billing month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  document.getElementById('billingMonth').value = `${year}-${month}`;

  // Load data from localStorage
  console.log('📥 Loading data...');
  const dataLoaded = loadTableFromStorage();

  // Convert existing date inputs to wrappers
  convertExistingDateInputs();

  // Add event listeners to existing rows
  const existingAutoRecalcInputs = document.querySelectorAll('#installmentsTable .auto-recalc');
  existingAutoRecalcInputs.forEach(input => {
    input.addEventListener('change', triggerRecalculation);
  });

  const allExistingInputs = document.querySelectorAll('#installmentsTable input');
  allExistingInputs.forEach(input => {
    input.addEventListener('change', autoSaveToStorage);
  });

  // Event listeners for buttons
  document.getElementById('addRowBtn').addEventListener('click', () => addRow());
  document.getElementById('saveDataBtn').addEventListener('click', saveDataToFile);
  document.getElementById('importDataBtn').addEventListener('click', importDataFromFile);
  document.getElementById('calculateBtn').addEventListener('click', calculateTimeline);

  // Billing month change listener
  document.getElementById('billingMonth').addEventListener('change', () => {
    const val = document.getElementById('billingMonth').value;
    if (!val) return;
    const billingDate = new Date(val + '-01T00:00:00');
    recomputeRowsAndCollectTimeline(billingDate, false);
  });

  // Month navigation buttons
  document.getElementById('increaseMonthBtn').addEventListener('click', () => {
    const input = document.getElementById('billingMonth');
    if (!input.value) return;
    const currentDate = new Date(input.value + '-01T00:00:00');
    const newDate = addMonthsToDate(currentDate, 1);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    input.value = `${year}-${month}`;
    input.dispatchEvent(new Event('change'));
  });

  document.getElementById('decreaseMonthBtn').addEventListener('click', () => {
    const input = document.getElementById('billingMonth');
    if (!input.value) return;
    const currentDate = new Date(input.value + '-01T00:00:00');
    const newDate = addMonthsToDate(currentDate, -1);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    input.value = `${year}-${month}`;
    input.dispatchEvent(new Event('change'));
  });

  // Sortable headers
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.getAttribute('data-column');
      sortTable(column);
    });
  });

  // Initial calculation
  const billingDate = new Date(`${year}-${month}-01T00:00:00`);
  recomputeRowsAndCollectTimeline(billingDate, false);

  // Prompt for import if no data exists
  if (!dataLoaded) {
    promptImportIfNeeded();
  }

  console.log('✅ Installment Tracker initialized successfully!');
})();

