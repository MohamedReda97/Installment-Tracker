// Main Application Initialization

// Month increment/decrement functions
function incrementMonth() {
  const input = document.getElementById('billingMonth');
  if (!input.value) return;
  input.value = addMonthsToDate(input.value, 1);
  const billingDate = new Date(input.value + '-01T00:00:00');
  recomputeRowsAndCollectTimeline(billingDate, false);
}

function decrementMonth() {
  const input = document.getElementById('billingMonth');
  if (!input.value) return;
  input.value = addMonthsToDate(input.value, -1);
  const billingDate = new Date(input.value + '-01T00:00:00');
  recomputeRowsAndCollectTimeline(billingDate, false);
}

// Initialize application
(async function init() {
  console.log('🚀 Initializing Installment Tracker...');
  
  // Set current month as default billing month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  document.getElementById('billingMonth').value = `${year}-${month}`;

  // Try to load data from Firebase first, then localStorage
  console.log('📥 Loading data...');
  const dataLoaded = await loadFromFirebase();
  
  if (!dataLoaded) {
    console.log('No Firebase data found, checking localStorage...');
    const localLoaded = loadTableFromStorage();
    
    if (!localLoaded) {
      console.log('No data found, prompting for import...');
      promptImportIfNeeded();
    }
  }

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

  // Initial calculation
  const billingDate = new Date(`${year}-${month}-01T00:00:00`);
  recomputeRowsAndCollectTimeline(billingDate, false);
  
  // Event listeners for buttons
  document.getElementById('addRowBtn').addEventListener('click', () => {
    addRow();
  });
  
  document.getElementById('saveDataBtn').addEventListener('click', saveDataToFile);
  document.getElementById('importDataBtn').addEventListener('click', importDataFromFile);
  document.getElementById('calculateBtn').addEventListener('click', calculateTimeline);
  document.getElementById('incrementMonth').addEventListener('click', incrementMonth);
  document.getElementById('decrementMonth').addEventListener('click', decrementMonth);
  
  // Add click listeners to sortable headers
  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.getAttribute('data-column');
      sortTable(column);
    });
  });
  
  console.log('✅ Installment Tracker initialized successfully!');
})();

