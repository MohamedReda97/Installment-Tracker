// Storage Functions - Firebase Firestore

const JSON_FILENAME = 'installments-data.json';

// ---- Firebase Storage ----

async function saveToFirebase() {
  try {
    const userId = getUserId();
    const rowsData = readTableData();
    
    await db.collection('users').doc(userId).collection('installments').doc('data').set({
      data: rowsData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    updateAutoSaveStatus('cloud');
    console.log('✅ Data saved to Firebase');
  } catch (err) {
    console.error('Error saving to Firebase:', err);
    // Fallback to localStorage
    saveTableToStorage();
    updateAutoSaveStatus('local');
  }
}

async function loadFromFirebase() {
  try {
    const userId = getUserId();
    const doc = await db.collection('users').doc(userId).collection('installments').doc('data').get();
    
    if (doc.exists) {
      const data = doc.data().data;
      if (Array.isArray(data) && data.length > 0) {
        writeTableData(data);
        console.log('✅ Data loaded from Firebase');
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Error loading from Firebase:', err);
    // Fallback to localStorage
    return loadTableFromStorage();
  }
}

// ---- File Export/Import ----

function saveDataToFile() {
  if ('showSaveFilePicker' in window) {
    saveDataWithFilePicker();
  } else {
    saveDataWithDownload();
  }
}

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
    
    await saveToFirebase();
    
    alert('✅ Data saved successfully!\n💾 Also saved to cloud storage');
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Error with file picker:', err);
    saveDataWithDownload();
  }
}

function saveDataWithDownload() {
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
    
    saveToFirebase();
    
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
        saveToFirebase();
        
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

// ---- localStorage Fallback ----

const STORAGE_KEY = 'installmentsTableData_v5';

function saveTableToStorage() {
  try {
    const rowsData = readTableData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

function loadTableFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      writeTableData(data);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return false;
  }
}

// Auto-save function
function autoSaveToStorage() {
  saveToFirebase(); // Primary: Firebase
  saveTableToStorage(); // Backup: localStorage
}

function updateAutoSaveStatus(source = 'cloud') {
  const statusEl = document.getElementById('autoSaveStatus');
  if (statusEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const icon = source === 'cloud' ? '☁️' : '💾';
    statusEl.textContent = `${icon} Auto-saved at ${timeStr}`;
    statusEl.style.color = '#10b981'; // Green

    setTimeout(() => {
      statusEl.style.color = '#6b7280';
    }, 2000);
  }
}

// Prompt import if no data exists
function promptImportIfNeeded() {
  const hasLocalData = localStorage.getItem(STORAGE_KEY);
  const hasTableData = document.querySelectorAll('#installmentsTable tbody tr').length > 0;

  if (!hasLocalData && !hasTableData) {
    setTimeout(() => {
      const shouldImport = confirm(
        '📂 No saved data found.\n\n' +
        'Would you like to import data from a JSON file?\n\n' +
        '(Click "Cancel" to start with empty table)'
      );

      if (shouldImport) {
        importDataFromFile();
      }
    }, 500);
  }
}

