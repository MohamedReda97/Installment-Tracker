# 🧪 Testing Guide

Complete guide to test all functionality of the Installment Tracker app.

---

## ⚠️ Important: Database Setup Required

**The app does NOT create the Firestore database automatically.**

### Before Testing, You Must:

1. **Enable Firestore Database** in Firebase Console:
   - Go to: https://console.firebase.google.com/project/installment-tracker-3808-5be23/firestore
   - Click **"Create database"**
   - Choose **"Start in production mode"**
   - Select location (e.g., `us-central1`)
   - Click **"Enable"**
   - Wait ~1 minute for database to be created

2. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

**Without Firestore enabled, the app will:**
- ✅ Still work using localStorage (browser-only storage)
- ❌ NOT sync across devices/browsers
- ⚠️ Show console errors about Firestore

---

## 🚀 Testing Methods

### Method 1: Test Locally (Recommended)

#### Option A: Using Python HTTP Server
```bash
# Navigate to project directory
cd "c:\Users\Admin\Documents\Installment Tracker"

# Start server
python -m http.server 8000 --directory public

# Open browser
# Go to: http://localhost:8000
```

#### Option B: Using Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server public -p 8000

# Open browser
# Go to: http://localhost:8000
```

#### Option C: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `public/index.html`
3. Select "Open with Live Server"

### Method 2: Open File Directly (Limited)
```bash
# Open in default browser
start public/index.html
```
**Note:** Some features may not work due to CORS restrictions.

### Method 3: Deploy to Firebase (Full Testing)
```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Open live URL
# https://installment-tracker-3808-5be23.web.app
```

---

## ✅ Functionality Checklist

### 1. **Initial Load**
- [ ] App loads without errors
- [ ] Console shows: "✅ Firebase initialized successfully"
- [ ] Billing month defaults to current month
- [ ] Table is empty (first time) or shows saved data
- [ ] If no data, prompt asks to import JSON file

### 2. **Add Row Functionality**
- [ ] Click "＋ Add row" button
- [ ] New row appears in table
- [ ] All input fields are editable
- [ ] Date field shows calendar icon
- [ ] Can type date as dd/mm/yyyy
- [ ] Can click calendar icon to pick date
- [ ] Auto-save status shows after adding row

### 3. **Input Validation**
- [ ] Merchant field accepts text
- [ ] Date field accepts dd/mm/yyyy format
- [ ] Date field converts to yyyy-mm-dd internally
- [ ] Amount field accepts numbers
- [ ] Total installments field accepts numbers

### 4. **Delete Row**
- [ ] Click "🗑️" button on a row
- [ ] Row is removed immediately
- [ ] Auto-save status updates
- [ ] Data persists after page refresh

### 5. **Sorting**
- [ ] Click "Merchant / Item" header → sorts alphabetically
- [ ] Click again → reverses sort (desc)
- [ ] Click "Enrollment Date" header → sorts by date
- [ ] Click "Amount" header → sorts numerically
- [ ] Click "Total Installments" header → sorts numerically
- [ ] Sort indicator (▲/▼) appears on active column

### 6. **Billing Month Controls**
- [ ] Click "◀ Prev" → decrements month
- [ ] Click "Next ▶" → increments month
- [ ] Timeline recalculates automatically
- [ ] Chart updates with new data

### 7. **Calculate Timeline**
- [ ] Click "Calculate Timeline" button
- [ ] Chart appears with stacked bars
- [ ] Each merchant has consistent color
- [ ] Bars show payment amounts
- [ ] Amount labels appear on each stack
- [ ] Legend shows all merchants

### 8. **Chart Interaction**
- [ ] Hover over bar → tooltip shows breakdown
- [ ] Tooltip shows only non-zero amounts
- [ ] Tooltip shows total at bottom
- [ ] Click on bar → detail card appears below
- [ ] Detail card shows month title
- [ ] Detail table lists all payments for that month

### 9. **Auto-Save (localStorage)**
- [ ] Make any change → auto-save status appears
- [ ] Status shows: "💾 Auto-saved at [time]"
- [ ] Status turns green briefly, then gray
- [ ] Refresh page → data persists
- [ ] Open in new tab → data appears

### 10. **Auto-Save (Firebase - Requires Firestore Enabled)**
- [ ] Make any change → auto-save status appears
- [ ] Status shows: "☁️ Auto-saved at [time]"
- [ ] Check Firebase Console → data appears in Firestore
- [ ] Path: `/users/{userId}/installments/data`
- [ ] Open in different browser → data syncs
- [ ] Open on different device → data syncs

### 11. **Export to JSON**
- [ ] Click "💾 Save to File" button

**Chrome/Edge (Modern):**
- [ ] File picker dialog appears
- [ ] Can choose save location
- [ ] File saves to chosen location
- [ ] Alert shows: "✅ Data saved successfully!"

**Firefox/Safari (Fallback):**
- [ ] File downloads to Downloads folder
- [ ] Alert shows: "📁 File saved to your Downloads folder"

**Both:**
- [ ] File name is `installments-data.json`
- [ ] File contains valid JSON
- [ ] File has `version`, `savedAt`, and `data` fields

### 12. **Import from JSON**
- [ ] Click "📤 Import from File" button
- [ ] File picker appears
- [ ] Select `installments-data.json`
- [ ] Data loads into table
- [ ] Timeline recalculates automatically
- [ ] Alert shows: "✅ Data imported successfully"
- [ ] All rows appear correctly
- [ ] Dates display as dd/mm/yyyy

### 13. **Enrollment Date Logic**

**Test Case 1: Day ≤ 22**
- [ ] Add row: Merchant="Test1", Date="09/11/2024", Amount=100, Total=12
- [ ] Set billing month to Nov 2024
- [ ] Calculate timeline
- [ ] First payment should be Dec 2024 (1st of next month)

**Test Case 2: Day > 22**
- [ ] Add row: Merchant="Test2", Date="25/11/2024", Amount=100, Total=12
- [ ] Set billing month to Nov 2024
- [ ] Calculate timeline
- [ ] First payment should be Jan 2025 (1st of month after next)

### 14. **Cross-Browser Sync (Requires Firestore)**
- [ ] Add data in Chrome
- [ ] Open app in Firefox
- [ ] Data appears automatically
- [ ] Make change in Firefox
- [ ] Refresh Chrome → change appears

### 15. **Offline Mode (Requires Firestore Enabled)**
- [ ] Load app with internet
- [ ] Disconnect internet
- [ ] App still works (uses cached data)
- [ ] Make changes → saves to localStorage
- [ ] Reconnect internet
- [ ] Changes sync to Firestore

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase not defined" Error
**Cause:** Firebase SDK not loaded  
**Solution:** Check internet connection, CDN scripts should load

### Issue 2: "Permission denied" in Firestore
**Cause:** Firestore rules not deployed  
**Solution:**
```bash
firebase deploy --only firestore:rules
```

### Issue 3: Data not syncing across browsers
**Cause:** Firestore not enabled  
**Solution:** Enable Firestore in Firebase Console (see top of this document)

### Issue 4: Import not working
**Cause:** Invalid JSON file  
**Solution:** Check JSON file format matches:
```json
{
  "version": "v2",
  "savedAt": "2025-11-29T00:00:00.000Z",
  "data": [...]
}
```

### Issue 5: Chart not displaying
**Cause:** Chart.js not loaded  
**Solution:** Check internet connection, CDN should load Chart.js

### Issue 6: Date format issues
**Cause:** Browser locale settings  
**Solution:** App uses dd/mm/yyyy format, type dates in this format

---

## 📊 Test Data

Use the existing `installments-data.json` file in the project root for testing import functionality.

It contains 12 sample installments with various dates and amounts.

---

## ✅ Success Criteria

All functionality is working if:
- ✅ Can add, edit, delete rows
- ✅ Data persists after refresh (localStorage)
- ✅ Data syncs across browsers (Firestore - if enabled)
- ✅ Can export to JSON file
- ✅ Can import from JSON file
- ✅ Timeline chart displays correctly
- ✅ Enrollment date logic works correctly
- ✅ Auto-save shows status updates
- ✅ Sorting works on all columns
- ✅ Billing month controls work

---

## 🎯 Next Steps After Testing

1. If all tests pass → Deploy to Firebase
2. If Firestore tests fail → Enable Firestore database
3. If any functionality fails → Check console for errors
4. Report issues with console error messages

