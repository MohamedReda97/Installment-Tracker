# 🧪 Testing Checklist for Installment Tracker

Complete this checklist before deploying to Netlify.

## 🌐 Local Testing

**Server is running at:** http://localhost:8080

### ✅ Page Load
- [ ] Page loads without errors
- [ ] No console errors (press F12 to check)
- [ ] Dark theme is applied
- [ ] All buttons are visible
- [ ] Table is visible
- [ ] Chart canvas is visible

### ✅ Initial State
- [ ] Billing month is set to current month
- [ ] Table is empty (or shows imported data)
- [ ] Auto-save status is empty
- [ ] Chart is empty (until Calculate is clicked)

### ✅ Add Row Functionality
- [ ] Click "＋ Add row" button
- [ ] New row appears at bottom of table
- [ ] Row has 8 columns
- [ ] Merchant input is editable
- [ ] Enrollment Date has calendar icon (📅)
- [ ] Amount input accepts numbers
- [ ] Total Installments input accepts numbers
- [ ] First Installment is empty (calculated later)
- [ ] Current Installment No. is empty (calculated later)
- [ ] Remaining is empty (calculated later)
- [ ] Delete button is visible

### ✅ Date Input
- [ ] Click calendar icon (📅)
- [ ] Date picker opens
- [ ] Select a date
- [ ] Date appears in dd/mm/yyyy format
- [ ] Date is saved correctly

### ✅ Data Entry
- [ ] Enter merchant name (e.g., "Amazon")
- [ ] Enter enrollment date (e.g., 09/11/2024)
- [ ] Enter amount (e.g., 500.50)
- [ ] Enter total installments (e.g., 12)
- [ ] Auto-save status shows "💾 Auto-saved at [time]"
- [ ] Status is green color

### ✅ Calculate Timeline
- [ ] Click "⚙️ Calculate Timeline" button
- [ ] Calculated columns populate:
  - First Installment shows date (dd/mm/yyyy)
  - Current Installment No. shows number
  - Remaining shows number
- [ ] Chart appears below
- [ ] Chart shows stacked bars
- [ ] Each merchant has a different color
- [ ] Amounts are labeled on bars
- [ ] X-axis shows months (e.g., "Jan 2025")
- [ ] Y-axis shows amounts

### ✅ Chart Interaction
- [ ] Hover over bar - tooltip shows
- [ ] Tooltip shows merchant names and amounts
- [ ] Tooltip shows total at bottom
- [ ] Click on a bar
- [ ] Detail card appears below chart
- [ ] Detail card shows month name
- [ ] Detail table shows all installments for that month
- [ ] Table shows: Merchant, Installment No., Amount
- [ ] Total is shown at bottom

### ✅ Sorting
- [ ] Click "Enrollment Date" header
- [ ] Table sorts by date (ascending)
- [ ] Click again - sorts descending
- [ ] Click "Monthly Amount" header
- [ ] Table sorts by amount
- [ ] Click "Current Installment No." header
- [ ] Table sorts by installment number

### ✅ Delete Row
- [ ] Click "Delete" button on any row
- [ ] Row is removed immediately
- [ ] Auto-save status updates
- [ ] Chart updates (if Calculate was clicked)

### ✅ Billing Month Navigation
- [ ] Click "▶" (next month) button
- [ ] Billing month increases by 1 month
- [ ] Calculated columns update
- [ ] Click "◀" (previous month) button
- [ ] Billing month decreases by 1 month
- [ ] Calculated columns update

### ✅ Export Data
- [ ] Add some test data (or import sample data)
- [ ] Click "💾 Save to File" button
- [ ] File save dialog appears (Chrome/Edge) OR file downloads (Firefox/Safari)
- [ ] File is named "installments-data.json"
- [ ] Open file in text editor
- [ ] JSON is valid and contains your data

### ✅ Import Data
- [ ] Click "📤 Import from File" button
- [ ] File picker opens
- [ ] Select "installments-data.json" from project folder
- [ ] Data loads into table
- [ ] 12 rows appear (sample data)
- [ ] All fields are populated
- [ ] Auto-save status updates

### ✅ Data Persistence
- [ ] Add or modify some data
- [ ] Wait for auto-save status
- [ ] Refresh the page (F5)
- [ ] Data is still there
- [ ] Billing month resets to current month (expected behavior)

### ✅ Enrollment Date Logic
Test with sample data:
- [ ] Enrollment: 09/11/2024 (day ≤ 22)
  - First Installment should be: 01/12/2024
  - Billing month Nov 2024 → Current Inst: 1
- [ ] Enrollment: 25/11/2024 (day > 22)
  - First Installment should be: 01/01/2025
  - Billing month Nov 2024 → Current Inst: 0
  - Billing month Dec 2024 → Current Inst: 1

### ✅ Responsive Design
- [ ] Resize browser window to mobile size (375px)
- [ ] Layout adjusts
- [ ] Buttons stack vertically
- [ ] Table is scrollable horizontally
- [ ] Chart is responsive

### ✅ Browser Compatibility
Test in multiple browsers:
- [ ] Chrome - all features work
- [ ] Edge - all features work
- [ ] Firefox - all features work (except file picker)
- [ ] Safari - all features work (except file picker)

## 🐛 Common Issues

### Issue: Console errors about missing files
**Solution:** Make sure all files are in correct folders:
- `css/styles.css`
- `js/app.js`, `js/utils.js`, `js/storage.js`, `js/table.js`, `js/calculations.js`, `js/chart.js`

### Issue: Chart not showing
**Solution:** Check internet connection (Chart.js loads from CDN)

### Issue: Date picker not working
**Solution:** Click the calendar icon (📅), not the text input

### Issue: Data not persisting
**Solution:** Check browser localStorage is enabled (not in private/incognito mode)

### Issue: Import not working
**Solution:** Make sure JSON file is valid and in correct format

## ✅ Final Checks

Before deploying:
- [ ] All tests above pass
- [ ] No console errors
- [ ] All features work as expected
- [ ] Sample data imports correctly
- [ ] Export/import cycle works (export → clear → import)
- [ ] Data persists after refresh

## 🚀 Ready to Deploy!

If all tests pass, you're ready to deploy to Netlify!

Follow the instructions in `DEPLOY_TO_NETLIFY.md`

---

**Testing completed on:** _______________  
**Tested by:** _______________  
**Browser(s) tested:** _______________  
**All tests passed:** ☐ Yes ☐ No  
**Issues found:** _______________

