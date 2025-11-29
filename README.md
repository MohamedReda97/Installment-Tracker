# 💳 Installment Tracker

A modern web application for tracking credit card installment payments with visual timeline and cloud sync.

## ✨ Features

- 📊 **Visual Timeline** - Stacked bar charts showing payment schedules by merchant
- ☁️ **Cloud Sync** - Data syncs across all devices via Firebase Firestore
- 💾 **Auto-Save** - Automatic saving to cloud and local storage
- 📥 **Export/Import** - Backup data to JSON files
- 📅 **Smart Date Logic** - Automatic calculation based on enrollment date
- 🎨 **Dark Theme** - Modern, eye-friendly interface
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Firebase CLI

### Installation

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firebase** (already configured):
```bash
# The project is already configured with:
# - Project ID: installment-tracker-3808-5be23
# - Firestore database
# - Firebase Hosting
```

### Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **installment-tracker-3808-5be23**
3. Navigate to **Build → Firestore Database**
4. Click **"Create database"**
5. Choose **"Start in production mode"**
6. Select your preferred location (e.g., `us-central1`)
7. Click **"Enable"**

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at:
```
https://installment-tracker-3808-5be23.web.app
```

Or the custom domain (if configured):
```
https://installment-tracker-3808-5be23.firebaseapp.com
```

## 📁 Project Structure

```
installment-tracker/
├── public/
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── styles.css          # All styles
│   └── js/
│       ├── firebase-config.js  # Firebase initialization
│       ├── utils.js            # Utility functions
│       ├── storage.js          # Firebase & localStorage
│       ├── table.js            # Table management
│       ├── calculations.js     # Payment calculations
│       ├── chart.js            # Chart.js integration
│       └── app.js              # Main app initialization
├── firebase.json               # Firebase hosting config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── .firebaserc                 # Firebase project config
└── README.md                   # This file
```

## 🔧 Development

### Local Testing

```bash
firebase serve
```

Then open: `http://localhost:5000`

### Deploy Changes

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

## 💾 Data Storage

### Cloud Storage (Firebase Firestore)
- **Primary storage** for cross-device sync
- Data structure: `/users/{userId}/installments/data`
- Auto-generated user ID stored in localStorage

### Local Storage (Browser)
- **Backup storage** for offline access
- Syncs with Firestore automatically
- Persists across sessions

### Export/Import
- Export data to JSON file for backup
- Import from JSON file to restore data
- Compatible with old single-file version

## 🔒 Security

Current security rules allow anyone to read/write their own data based on userId.

**For production**, consider adding Firebase Authentication:

1. Enable Firebase Authentication in console
2. Update `firestore.rules`:
```javascript
match /users/{userId}/installments/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

3. Add authentication to `firebase-config.js`

## 📊 How It Works

### Enrollment Date Logic
- **Day ≤ 22**: First billing month = same month, payment on 1st of next month
- **Day > 22**: First billing month = next month, payment on 1st of month after that

### Example
- Enrollment: Nov 9, 2024 (day ≤ 22)
- First billing: Nov 2024
- First payment: Dec 1, 2024

## 🎨 Customization

### Change Theme Colors
Edit `public/css/styles.css`:
```css
:root {
  --primary-color: #3b82f6;
  --background: #111827;
  --card-bg: #1f2933;
}
```

### Modify Firebase Config
Edit `public/js/firebase-config.js` with your project credentials.

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

