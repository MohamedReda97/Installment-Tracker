// Storage Functions (Firestore + localStorage backup)

const STORAGE_KEY = 'installmentsTableData_v5';
const JSON_FILENAME = 'installments-data.json';
const FIRESTORE_COLLECTION = 'installments';

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

// Save to Firestore (with localStorage backup)
async function saveTableToFirestore() {
  if (!isAuthenticated()) {
    console.log('⚠️ User not authenticated, skipping Firestore save');
    saveTableToLocalStorage();
    return;
  }

  try {
    const rowsData = readTableData();
    const userId = getUserId();

    // Get reference to user's document
    const userDocRef = db.collection('users').doc(userId);

    // Save all installments in one document
    await userDocRef.set({
      installments: rowsData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Also save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));

    console.log('✅ Data saved to Firestore');
  } catch (err) {
    console.error('❌ Error saving to Firestore:', err);
    // Fallback to localStorage
    saveTableToLocalStorage();
  }
}

// Save to localStorage only
function saveTableToLocalStorage() {
  try {
    const rowsData = readTableData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
    console.log('💾 Data saved to localStorage');
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Load from Firestore
async function loadUserDataFromFirestore() {
  if (!isAuthenticated()) {
    console.log('⚠️ User not authenticated, loading from localStorage');
    return loadTableFromLocalStorage();
  }

  try {
    const userId = getUserId();
    const userDocRef = db.collection('users').doc(userId);
    const doc = await userDocRef.get();

    if (doc.exists) {
      const data = doc.data();
      if (data.installments && Array.isArray(data.installments)) {
        writeTableData(data.installments);
        // Also save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.installments));
        console.log('✅ Data loaded from Firestore');
        return true;
      }
    }

    // No data in Firestore, try localStorage
    console.log('📂 No data in Firestore, checking localStorage');
    return loadTableFromLocalStorage();
  } catch (err) {
    console.error('❌ Error loading from Firestore:', err);
    // Fallback to localStorage
    return loadTableFromLocalStorage();
  }
}

// Load from localStorage
function loadTableFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      writeTableData(data);
      console.log('💾 Data loaded from localStorage');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return false;
  }
}

// Auto-save (uses Firestore if authenticated, localStorage otherwise)
async function autoSaveToStorage() {
  await saveTableToFirestore();
  updateAutoSaveStatus();
}

// Migrate localStorage data to Firestore
async function migrateLocalStorageToFirestore() {
  if (!isAuthenticated()) {
    console.log('⚠️ Cannot migrate: user not authenticated');
    return false;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('📂 No localStorage data to migrate');
      return false;
    }

    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) {
      console.log('📂 No valid data to migrate');
      return false;
    }

    const userId = getUserId();
    const userDocRef = db.collection('users').doc(userId);

    await userDocRef.set({
      installments: data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      migratedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Migrated ${data.length} installments to Firestore`);
    return true;
  } catch (err) {
    console.error('❌ Error migrating data:', err);
    return false;
  }
}

// Update auto-save status display
function updateAutoSaveStatus() {
  const statusEl = document.getElementById('autoSaveStatus');
  if (statusEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    statusEl.textContent = `💾 Auto-saved at ${timeStr}`;
    statusEl.style.color = '#10b981';

    setTimeout(() => {
      statusEl.style.color = '#6b7280';
    }, 2000);
  }
}

// Save data to file (hybrid approach)
function saveDataToFile() {
  if ('showSaveFilePicker' in window) {
    saveDataWithFilePicker();
  } else {
    saveDataWithDownload();
  }
}

// Modern approach: File System Access API
async function saveDataWithFilePicker() {
  try {
    const rowsData = readTableData();
    const jsonData = {
      version: 'v2',
      savedAt: new Date().toISOString(),
      data: rowsData
    };

    const fileHandle = await window.showSaveFilePicker({
      suggestedName: JSON_FILENAME,
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(jsonData, null, 2));
    await writable.close();

    // Save to Firestore as well
    await saveTableToFirestore();
    updateAutoSaveStatus();

    alert('✅ Data saved successfully!\n💾 Also saved to cloud storage');
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Error with file picker:', err);
    saveDataWithDownload();
  }
}

// Fallback: Regular download
async function saveDataWithDownload() {
  try {
    const rowsData = readTableData();
    const jsonData = {
      version: 'v2',
      savedAt: new Date().toISOString(),
      data: rowsData
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = JSON_FILENAME;
    a.click();

    URL.revokeObjectURL(url);

    // Save to Firestore as well
    await saveTableToFirestore();
    updateAutoSaveStatus();

    alert(
      '✅ Data saved to file: ' + JSON_FILENAME + '\n' +
      '💾 Also saved to cloud storage\n\n' +
      '📁 File saved to your Downloads folder.'
    );
  } catch (err) {
    console.error('Error saving data:', err);
    alert('❌ Error saving data: ' + err.message);
  }
}

// Import data from file
function importDataFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);

        let data;
        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          data = jsonData.data;
        } else {
          throw new Error('Invalid data format');
        }

        writeTableData(data);

        // Save to Firestore
        saveTableToFirestore();

        const billingInput = document.getElementById('billingMonth');
        if (billingInput.value) {
          const billingDate = new Date(billingInput.value + '-01T00:00:00');
          recomputeRowsAndCollectTimeline(billingDate, false);
        }

        alert('✅ Data imported successfully from: ' + file.name);
      } catch (err) {
        console.error('Error importing data:', err);
        alert('❌ Error importing file: ' + err.message);
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
    };

    reader.readAsText(file);
  };

  input.click();
}

// Show import prompt or migration prompt
async function promptImportIfNeeded() {
  const hasLocalData = localStorage.getItem(STORAGE_KEY);
  const hasTableData = document.querySelectorAll('#installmentsTable tbody tr').length > 0;

  // If user is authenticated and has localStorage data but no table data, offer migration
  if (isAuthenticated() && hasLocalData && !hasTableData) {
    setTimeout(async () => {
      const shouldMigrate = confirm(
        '📦 Local data found!\n\n' +
        'Would you like to migrate your existing data to the cloud?\n\n' +
        'This will sync your data across all devices.'
      );

      if (shouldMigrate) {
        const success = await migrateLocalStorageToFirestore();
        if (success) {
          await loadUserDataFromFirestore();
          alert('✅ Data migrated successfully!\n☁️ Your data is now synced to the cloud.');
        }
      } else {
        loadTableFromLocalStorage();
      }
    }, 500);
  } else if (!hasLocalData && !hasTableData) {
    // No data at all, offer to import from file
    setTimeout(() => {
      const shouldImport = confirm(
        '📂 No saved data found.\n\n' +
        'Would you like to import data from a JSON file?\n\n' +
        '(Click "Cancel" to start with an empty table)'
      );

      if (shouldImport) {
        importDataFromFile();
      }
    }, 500);
  }
}


