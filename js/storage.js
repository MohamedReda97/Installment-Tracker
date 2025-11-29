// Storage Functions

const STORAGE_KEY = 'installmentsTableData_v5';
const JSON_FILENAME = 'installments-data.json';

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

// Save to localStorage
function saveTableToStorage() {
  try {
    const rowsData = readTableData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Load from localStorage
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

// Auto-save to localStorage
function autoSaveToStorage() {
  saveTableToStorage();
  updateAutoSaveStatus();
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
    updateAutoSaveStatus();

    alert('✅ Data saved successfully!\n💾 Also saved to browser storage');
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Error with file picker:', err);
    saveDataWithDownload();
  }
}

// Fallback: Regular download
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rowsData));
    updateAutoSaveStatus();

    alert(
      '✅ Data saved to file: ' + JSON_FILENAME + '\n' +
      '💾 Also saved to browser storage\n\n' +
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

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

// Show import prompt if no data exists
function promptImportIfNeeded() {
  const hasLocalData = localStorage.getItem(STORAGE_KEY);
  const hasTableData = document.querySelectorAll('#installmentsTable tbody tr').length > 0;

  if (!hasLocalData && !hasTableData) {
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


