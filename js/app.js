// Main Application Initialization

// Handle sign out
async function handleSignOut() {
  const result = await signOut();
  if (result.success) {
    // Clear tables
    document.querySelector('#installmentsTable tbody').innerHTML = '';
    if (document.querySelector('#medicineTable tbody')) {
      document.querySelector('#medicineTable tbody').innerHTML = '';
    }
    // Reload page to reset state
    window.location.reload();
  }
}

// Initialize Installment Tracker Tab
function initInstallmentsTab() {
  console.log('📊 Initializing Installment Tracker tab...');

  // Set current month as default billing month if not set
  const billingMonthInput = document.getElementById('billingMonth');
  if (!billingMonthInput.value) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    billingMonthInput.value = `${year}-${month}`;
  }

  // Recalculate if there's data
  const val = billingMonthInput.value;
  if (val && typeof recomputeRowsAndCollectTimeline === 'function') {
    const billingDate = new Date(val + '-01T00:00:00');
    recomputeRowsAndCollectTimeline(billingDate, false);
  }
}

// Initialize Medicine Tracker Tab
async function initMedicineTab() {
  console.log('💊 Initializing Medicine Tracker tab...');

  // Load medicine data if function exists
  if (typeof loadMedicineDataFromFirestore === 'function') {
    const dataLoaded = await loadMedicineDataFromFirestore();

    // If no data exists, add test data for development
    if (!dataLoaded && typeof addMedicineTestData === 'function') {
      console.log('📝 No medicine data found, adding test data...');
      addMedicineTestData();
    }
  }

  // Recalculate timeline if function exists
  if (typeof calculateMedicineTimeline === 'function') {
    calculateMedicineTimeline();
  }
}

(function init() {
  console.log('🚀 Initializing Personal Finance & Health Tracker...');

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

  // Register tabs with tab manager
  tabManager.registerTab('installments', initInstallmentsTab, null);
  tabManager.registerTab('medicine', initMedicineTab, null);

  // Listen for auth state changes
  onAuthStateChanged(async (user) => {
    console.log('🔐 Auth state changed:', user ? user.email : 'No user');
    updateAuthUI(user);

    if (user) {
      // User is signed in, show tabs and load their data
      console.log('📥 Loading user data...');

      // Show tab navigation
      const tabNav = document.getElementById('tabNavigation');
      if (tabNav) {
        tabNav.style.display = 'flex';
      }

      // Initialize tab manager
      tabManager.init();

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
      // User is signed out, hide tabs
      console.log('👤 No user signed in');
      const tabNav = document.getElementById('tabNavigation');
      if (tabNav) {
        tabNav.style.display = 'none';
      }
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

  // Sortable headers for installments table
  document.querySelectorAll('#installmentsTable th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.getAttribute('data-column');
      sortTable(column);
    });
  });

  // Medicine Tracker Event Listeners (will be functional once medicine files are created)
  const addMedicineBtn = document.getElementById('addMedicineRowBtn');
  if (addMedicineBtn) {
    addMedicineBtn.addEventListener('click', () => {
      if (typeof addMedicineRow === 'function') {
        addMedicineRow();
        if (typeof autoSaveMedicineToStorage === 'function') {
          autoSaveMedicineToStorage();
        }
      }
    });
  }

  const saveMedicineBtn = document.getElementById('saveMedicineDataBtn');
  if (saveMedicineBtn) {
    saveMedicineBtn.addEventListener('click', () => {
      if (typeof saveMedicineDataToFile === 'function') {
        saveMedicineDataToFile();
      }
    });
  }

  const importMedicineBtn = document.getElementById('importMedicineDataBtn');
  if (importMedicineBtn) {
    importMedicineBtn.addEventListener('click', () => {
      if (typeof importMedicineDataFromFile === 'function') {
        importMedicineDataFromFile();
      }
    });
  }

  const calculateMedicineBtn = document.getElementById('calculateMedicineTimelineBtn');
  if (calculateMedicineBtn) {
    calculateMedicineBtn.addEventListener('click', () => {
      // PHASE 1: Use hardcoded test data for card-based timeline
      if (typeof initializeTimelineCards === 'function') {
        initializeTimelineCards();
      }
      // PHASE 2: Will use real data from calculateMedicineTimeline()
      // if (typeof calculateMedicineTimeline === 'function') {
      //   calculateMedicineTimeline();
      // }
    });
  }

  const applyMedicineChangesBtn = document.getElementById('applyMedicineChangesBtn');
  if (applyMedicineChangesBtn) {
    applyMedicineChangesBtn.addEventListener('click', () => {
      if (typeof applyMedicineChartChanges === 'function') {
        applyMedicineChartChanges();
      }
    });
  }

  const revertMedicineChangesBtn = document.getElementById('revertMedicineChangesBtn');
  if (revertMedicineChangesBtn) {
    revertMedicineChangesBtn.addEventListener('click', () => {
      if (typeof revertMedicineChartChanges === 'function') {
        revertMedicineChartChanges();
      }
    });
  }

  console.log('✅ Personal Finance & Health Tracker initialized successfully!');
})();

