// Main Application Initialization

// Handle sign out
async function handleSignOut() {
  const result = await signOut();
  if (result.success) {
    // Clear table
    document.querySelector('#installmentsTable tbody').innerHTML = '';
    // Reload page to reset state
    window.location.reload();
  }
}

(function init() {
  console.log('🚀 Initializing Installment Tracker...');

  // Initialize Firebase
  const firebaseInitialized = initializeFirebase();
  if (!firebaseInitialized) {
    alert('❌ Failed to initialize Firebase. Please check your internet connection.');
    return;
  }

  // Set current month as default billing month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  document.getElementById('billingMonth').value = `${year}-${month}`;

  // Listen for auth state changes
  onAuthStateChanged(async (user) => {
    console.log('🔐 Auth state changed:', user ? user.email : 'No user');
    updateAuthUI(user);

    if (user) {
      // User is signed in, load their data
      console.log('📥 Loading user data...');
      let dataLoaded = false;

      if (typeof loadUserDataFromFirestore === 'function') {
        dataLoaded = await loadUserDataFromFirestore();
      }

      // Convert existing date inputs to wrappers
      if (typeof convertExistingDateInputs === 'function') {
        convertExistingDateInputs();
      }

      // Add event listeners to existing rows
      const existingAutoRecalcInputs = document.querySelectorAll('#installmentsTable .auto-recalc');
      existingAutoRecalcInputs.forEach(input => {
        if (typeof triggerRecalculation === 'function') {
          input.addEventListener('change', triggerRecalculation);
        }
      });

      const allExistingInputs = document.querySelectorAll('#installmentsTable input');
      allExistingInputs.forEach(input => {
        if (typeof autoSaveToStorage === 'function') {
          input.addEventListener('change', autoSaveToStorage);
        }
      });

      // Initial calculation
      const billingDate = new Date(`${year}-${month}-01T00:00:00`);
      if (typeof recomputeRowsAndCollectTimeline === 'function') {
        recomputeRowsAndCollectTimeline(billingDate, false);
      }

      // Prompt for import/migration if no data exists
      if (!dataLoaded && typeof promptImportIfNeeded === 'function') {
        await promptImportIfNeeded();
      }

      console.log('✅ User data loaded successfully!');
    } else {
      // User is signed out
      console.log('👤 No user signed in');
    }
  });

  // Event listeners for buttons
  document.getElementById('addRowBtn').addEventListener('click', () => {
    addRow();
    if (typeof autoSaveToStorage === 'function') {
      autoSaveToStorage();
    }
  });
  document.getElementById('saveDataBtn').addEventListener('click', () => {
    if (typeof saveDataToFile === 'function') {
      saveDataToFile();
    }
  });
  document.getElementById('importDataBtn').addEventListener('click', () => {
    if (typeof importDataFromFile === 'function') {
      importDataFromFile();
    }
  });
  document.getElementById('calculateBtn').addEventListener('click', () => {
    if (typeof calculateTimeline === 'function') {
      calculateTimeline();
    }
  });

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

  console.log('✅ Installment Tracker initialized successfully!');
})();

