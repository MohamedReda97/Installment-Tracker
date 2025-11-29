# 📁 Project Structure

Complete overview of the Installment Tracker web app structure.

## 🌳 Directory Tree

```
installment-tracker/
│
├── public/                          # Web app files (deployed to Firebase Hosting)
│   ├── index.html                   # Main HTML page
│   │
│   ├── css/
│   │   └── styles.css               # All CSS styles (dark theme)
│   │
│   └── js/
│       ├── firebase-config.js       # Firebase initialization & config
│       ├── utils.js                 # Utility functions (dates, user ID, etc.)
│       ├── storage.js               # Firebase Firestore & localStorage
│       ├── table.js                 # Table CRUD operations
│       ├── calculations.js          # Payment calculations & logic
│       ├── chart.js                 # Chart.js integration & visualization
│       └── app.js                   # Main app initialization
│
├── firebase.json                    # Firebase hosting configuration
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore database indexes
├── .firebaserc                      # Firebase project configuration
├── .gitignore                       # Git ignore rules
├── package.json                     # NPM package configuration
├── README.md                        # Project documentation
├── DEPLOYMENT.md                    # Deployment guide
└── PROJECT_STRUCTURE.md             # This file
```

---

## 📄 File Descriptions

### **public/index.html**
- Main HTML structure
- Includes all CDN scripts (Chart.js, Firebase SDK)
- Contains table, chart canvas, and detail sections
- Links to CSS and JS modules

### **public/css/styles.css**
- Dark theme styling
- Responsive design
- Table styles with sorting indicators
- Button styles (primary, secondary, danger)
- Date wrapper custom styling
- Mobile-responsive media queries

### **public/js/firebase-config.js**
- Firebase initialization with your project config
- Firestore database connection
- Offline persistence enabled
- Console logging for debugging

### **public/js/utils.js**
- `getUserId()` - Generate/retrieve unique user ID
- `formatDateDMY()` - Format dates as dd/mm/yyyy
- `ymdToDMY()` - Convert yyyy-mm-dd to dd/mm/yyyy
- `dmyToYMD()` - Convert dd/mm/yyyy to yyyy-mm-dd
- `addMonthsToDate()` - Add months to date
- `createDateInputWrapper()` - Create dual-input date picker
- `getDateValue()` - Extract date from wrapper
- `convertExistingDateInputs()` - Convert old date inputs

### **public/js/storage.js**
- `saveToFirebase()` - Save data to Firestore
- `loadFromFirebase()` - Load data from Firestore
- `saveDataToFile()` - Export to JSON (hybrid approach)
- `saveDataWithFilePicker()` - Modern file picker API
- `saveDataWithDownload()` - Fallback download
- `importDataFromFile()` - Import from JSON
- `saveTableToStorage()` - localStorage backup
- `loadTableFromStorage()` - Load from localStorage
- `autoSaveToStorage()` - Auto-save on changes
- `updateAutoSaveStatus()` - Update UI status indicator
- `promptImportIfNeeded()` - Prompt for import on first load

### **public/js/table.js**
- `readTableData()` - Extract data from table rows
- `writeTableData()` - Populate table with data array
- `deleteRow()` - Remove row and auto-save
- `addRow()` - Add new row with event listeners
- `triggerRecalculation()` - Recalculate on input change
- `sortTable()` - Sort table by column
- Sorting state management (column, direction)

### **public/js/calculations.js**
- `formatDateYMD()` - Format date as YYYY-MM
- `addMonthsToDate()` - Add months to date object
- `formatMonthLabel()` - Format for chart labels
- `recomputeRowsAndCollectTimeline()` - Main calculation engine
  - Calculates first billing month based on enrollment date
  - Determines current installment and remaining
  - Collects timeline data for chart
  - Groups by merchant for stacked visualization
- `calculateTimeline()` - Button handler for timeline generation

### **public/js/chart.js**
- `getMerchantColor()` - Consistent color assignment
- `updateChart()` - Create/update Chart.js instance
  - Stacked bar chart configuration
  - Tooltip with non-zero filtering
  - Data labels on stacks
  - Click handler for detail view
- `showMonthDetail()` - Display payment breakdown
- `hideMonthDetail()` - Hide detail section
- Chart state management (timelineChart, details, merchants)

### **public/js/app.js**
- `incrementMonth()` - Next month button
- `decrementMonth()` - Previous month button
- `init()` - Main initialization function
  - Set default billing month
  - Load data from Firebase/localStorage
  - Convert date inputs
  - Attach event listeners
  - Initial calculation
- Event listener setup for all buttons

---

## 🔧 Configuration Files

### **firebase.json**
```json
{
  "hosting": {
    "public": "public",
    "ignore": [...],
    "rewrites": [...]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### **firestore.rules**
Security rules allowing users to read/write their own data:
```javascript
match /users/{userId}/installments/{document=**} {
  allow read, write: if true;
}
```

### **.firebaserc**
```json
{
  "projects": {
    "default": "installment-tracker-3808-5be23"
  }
}
```

---

## 🔄 Data Flow

### **Saving Data:**
```
User Input → Table → readTableData()
    ↓
autoSaveToStorage()
    ↓
├─→ saveToFirebase() → Firestore Cloud
└─→ saveTableToStorage() → localStorage (backup)
    ↓
updateAutoSaveStatus() → UI Feedback
```

### **Loading Data:**
```
App Init → loadFromFirebase() → Firestore Cloud
    ↓ (if no data)
loadTableFromStorage() → localStorage
    ↓ (if no data)
promptImportIfNeeded() → User Import
    ↓
writeTableData() → Populate Table
```

### **Calculation Flow:**
```
User Changes Input → triggerRecalculation()
    ↓
recomputeRowsAndCollectTimeline()
    ↓
├─→ Calculate first billing month (day ≤22 or >22)
├─→ Calculate current installment
├─→ Calculate remaining installments
└─→ Collect timeline data by month & merchant
    ↓
updateChart() → Chart.js Visualization
```

---

## 🎨 Key Features Implementation

### **Cloud Sync**
- Firebase Firestore for cross-device data
- Offline persistence enabled
- Auto-sync on every change
- localStorage as backup

### **Date Input**
- Dual-input approach (text + hidden date picker)
- dd/mm/yyyy display format
- yyyy-mm-dd internal format
- Auto-formatting as user types
- Calendar icon for date picker

### **Stacked Chart**
- Chart.js with datalabels plugin
- Consistent merchant colors
- Tooltips show only non-zero values
- Click to see detailed breakdown
- Amount labels on each stack

### **Auto-Save**
- Saves on every input change
- Visual feedback with timestamp
- Green flash then fade to gray
- Dual save (Firebase + localStorage)

### **Export/Import**
- Hybrid approach (File System Access API + fallback)
- Chrome/Edge: Choose save location
- Firefox/Safari: Downloads folder
- JSON format with metadata
- Backward compatible

---

## 📊 Database Structure

### Firestore Collection Path:
```
/users/{userId}/installments/data
```

### Document Structure:
```json
{
  "data": [
    {
      "merchant": "NOON 511.60",
      "enrollmentDate": "2024-11-09",
      "amount": "511.60",
      "total": "15"
    }
  ],
  "updatedAt": "2024-11-29T10:30:00.000Z"
}
```

---

## 🚀 Deployment

### Commands:
```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Test locally
firebase serve
```

### URLs:
- **Primary:** https://installment-tracker-3808-5be23.web.app
- **Alternative:** https://installment-tracker-3808-5be23.firebaseapp.com

---

## 📝 Notes

- All JavaScript is vanilla (no frameworks)
- Uses ES6+ features (async/await, arrow functions, etc.)
- Firebase SDK v10 (compat mode for easier migration)
- Chart.js v4 with datalabels plugin
- Mobile-responsive design
- Dark theme optimized for readability

