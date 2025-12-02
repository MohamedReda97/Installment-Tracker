// Medicine Storage - Firestore and localStorage integration

console.log('💾 Medicine Storage module loaded');

const MEDICINE_STORAGE_KEY = 'medicineTableData_v1';
const MEDICINE_JSON_FILENAME = 'medicine-data.json';

// Check if user is authenticated
function isMedicineUserAuthenticated() {
  return typeof auth !== 'undefined' && auth && auth.currentUser;
}

// Get current user ID
function getMedicineUserId() {
  return auth.currentUser ? auth.currentUser.uid : null;
}

// Save to Firestore (with localStorage backup)
async function saveMedicineToFirestore() {
  if (!isMedicineUserAuthenticated()) {
    console.log('⚠️ User not authenticated, skipping Firestore save');
    saveMedicineToLocalStorage();
    return;
  }

  try {
    const medicineData = readMedicineTableData();
    const userId = getMedicineUserId();

    // Get reference to user's document
    const userDocRef = db.collection('users').doc(userId);

    // Get existing data
    const doc = await userDocRef.get();
    const existingData = doc.exists ? doc.data() : {};

    // Update only the medicines field
    await userDocRef.set({
      ...existingData,
      medicines: medicineData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Also save to localStorage as backup
    localStorage.setItem(MEDICINE_STORAGE_KEY, JSON.stringify(medicineData));

    console.log('✅ Medicine data saved to Firestore');
  } catch (err) {
    console.error('❌ Error saving medicine data to Firestore:', err);
    // Fallback to localStorage
    saveMedicineToLocalStorage();
  }
}

// Save to localStorage only
function saveMedicineToLocalStorage() {
  try {
    const medicineData = readMedicineTableData();
    localStorage.setItem(MEDICINE_STORAGE_KEY, JSON.stringify(medicineData));
    console.log('💾 Medicine data saved to localStorage');
  } catch (err) {
    console.error('Error saving medicine data to localStorage:', err);
  }
}

// Load from Firestore
async function loadMedicineDataFromFirestore() {
  if (!isMedicineUserAuthenticated()) {
    console.log('⚠️ User not authenticated, trying localStorage');
    return loadMedicineFromLocalStorage();
  }

  try {
    const userId = getMedicineUserId();
    const userDocRef = db.collection('users').doc(userId);
    const doc = await userDocRef.get();

    if (doc.exists) {
      const data = doc.data();
      if (data.medicines && Array.isArray(data.medicines)) {
        writeMedicineTableData(data.medicines);
        console.log('✅ Medicine data loaded from Firestore');
        return true;
      }
    }

    // Try localStorage as fallback
    return loadMedicineFromLocalStorage();
  } catch (err) {
    console.error('❌ Error loading medicine data from Firestore:', err);
    return loadMedicineFromLocalStorage();
  }
}

// Load from localStorage
function loadMedicineFromLocalStorage() {
  try {
    const raw = localStorage.getItem(MEDICINE_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      writeMedicineTableData(data);
      console.log('💾 Medicine data loaded from localStorage');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error loading medicine data from localStorage:', err);
    return false;
  }
}

// Auto-save (uses Firestore if authenticated, localStorage otherwise)
async function autoSaveMedicineToStorage() {
  await saveMedicineToFirestore();
  updateMedicineAutoSaveStatus();
}

// Update auto-save status display
function updateMedicineAutoSaveStatus() {
  const statusEl = document.getElementById('medicineAutoSaveStatus');
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

// Save medicine data to file
function saveMedicineDataToFile() {
  if ('showSaveFilePicker' in window) {
    saveMedicineDataWithFilePicker();
  } else {
    saveMedicineDataWithDownload();
  }
}

// Modern approach: File System Access API
async function saveMedicineDataWithFilePicker() {
  try {
    const medicineData = readMedicineTableData();
    const jsonData = {
      version: 'v1',
      type: 'medicine',
      savedAt: new Date().toISOString(),
      data: medicineData
    };

    const fileHandle = await window.showSaveFilePicker({
      suggestedName: MEDICINE_JSON_FILENAME,
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(jsonData, null, 2));
    await writable.close();

    // Save to Firestore as well
    await saveMedicineToFirestore();
    updateMedicineAutoSaveStatus();

    alert('✅ Medicine data saved successfully!\n💾 Also saved to cloud storage');
  } catch (err) {
    if (err.name === 'AbortError') {
      return;
    }
    console.error('Error saving medicine data with file picker:', err);
    alert('❌ Error saving file: ' + err.message);
  }
}

// Fallback: Regular download
async function saveMedicineDataWithDownload() {
  try {
    const medicineData = readMedicineTableData();
    const jsonData = {
      version: 'v1',
      type: 'medicine',
      savedAt: new Date().toISOString(),
      data: medicineData
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = MEDICINE_JSON_FILENAME;
    a.click();

    URL.revokeObjectURL(url);

    // Save to Firestore as well
    await saveMedicineToFirestore();
    updateMedicineAutoSaveStatus();

    alert(
      '✅ Medicine data saved to file: ' + MEDICINE_JSON_FILENAME + '\n' +
      '💾 Also saved to cloud storage\n\n' +
      '📁 File saved to your Downloads folder.'
    );
  } catch (err) {
    console.error('Error saving medicine data with download:', err);
    alert('❌ Error saving file: ' + err.message);
  }
}

// Import medicine data from file
function importMedicineDataFromFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Handle different formats
        let data;
        if (Array.isArray(jsonData)) {
          data = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          data = jsonData.data;
        } else {
          throw new Error('Invalid data format');
        }

        writeMedicineTableData(data);

        // Save to Firestore and localStorage
        await saveMedicineToFirestore();

        alert('✅ Medicine data imported successfully!\n💾 Data saved to cloud storage');
      } catch (err) {
        console.error('Error importing medicine data:', err);
        alert('❌ Error importing file: ' + err.message);
      }
    };

    reader.readAsText(file);
  });

  input.click();
}

// Add test data for development
function addMedicineTestData() {
  const testData = [
    {
      id: 'med_test_1',
      name: 'Vitamin D',
      dose: '5000 IU',
      time: 'Morning',
      startDate: '2024-01-15',
      duration: 3,
      pause: 1,
      notes: 'Take with food',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'med_test_2',
      name: 'Omega-3',
      dose: '1000mg',
      time: 'Morning',
      startDate: '2024-02-01',
      duration: 6,
      pause: 0,
      notes: 'Fish oil supplement',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'med_test_3',
      name: 'Aspirin',
      dose: '81mg',
      time: 'Evening',
      startDate: '2024-01-01',
      duration: 2,
      pause: 2,
      notes: 'Low dose, daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'med_test_4',
      name: 'Multivitamin',
      dose: '1 tablet',
      time: 'Lunch',
      startDate: '2024-03-01',
      duration: 12,
      pause: 0,
      notes: 'With breakfast',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'med_test_5',
      name: 'Calcium',
      dose: '500mg',
      time: 'Lunch',
      startDate: '2024-01-10',
      duration: 4,
      pause: 0,
      notes: 'Take with vitamin D',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'med_test_6',
      name: 'Magnesium',
      dose: '400mg',
      time: 'Evening',
      startDate: '2024-02-15',
      duration: 3,
      pause: 1,
      notes: 'Before bed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  writeMedicineTableData(testData);
  autoSaveMedicineToStorage();
  console.log('✅ Test data added to medicine table (6 medicines with time values)');
}

