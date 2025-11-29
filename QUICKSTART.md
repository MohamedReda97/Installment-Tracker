# ⚡ Quick Start Guide

Get your Installment Tracker live in 5 minutes!

## 🎯 Prerequisites

You already have:
- ✅ Firebase project: **installment-tracker-3808-5be23**
- ✅ Firebase config in code
- ✅ Web app structure ready

You need:
- [ ] Node.js installed
- [ ] Firebase CLI installed

---

## 🚀 5-Minute Deployment

### Step 1: Install Firebase CLI (1 min)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase (1 min)

```bash
firebase login
```

### Step 3: Enable Firestore (2 min)

1. Go to: https://console.firebase.google.com/project/installment-tracker-3808-5be23/firestore
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (e.g., `us-central1`)
5. Click **"Enable"**

### Step 4: Deploy! (1 min)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy web app
firebase deploy --only hosting
```

### Step 5: Open Your App! ✨

```
https://installment-tracker-3808-5be23.web.app
```

---

## 🎉 That's It!

Your app is now live with:
- ☁️ Cloud sync across all devices
- 💾 Auto-save on every change
- 📊 Visual timeline charts
- 📥 Export/Import functionality

---

## 🧪 Test It

1. Open the URL in your browser
2. Click **"＋ Add row"**
3. Fill in:
   - Merchant: "Test Item"
   - Enrollment Date: Today's date
   - Amount: 100
   - Total Installments: 12
4. Click **"Calculate Timeline"**
5. See your payment schedule!

---

## 📱 Access from Any Device

Your data syncs automatically:
1. Open the URL on your phone
2. Your data is already there!
3. Make changes on phone
4. See updates on desktop instantly

---

## 🔧 Local Development

Want to test changes locally?

```bash
# Test locally
firebase serve

# Open browser
http://localhost:5000

# Make changes to files in public/

# Deploy when ready
firebase deploy --only hosting
```

---

## 📚 Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
- Read [README.md](README.md) for full documentation
- Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for code structure

---

## 🐛 Troubleshooting

### "Permission denied" error?
```bash
firebase deploy --only firestore:rules
```

### Can't save data?
Check Firestore is enabled in Firebase Console

### Local testing not working?
```bash
firebase serve
```

---

## 💡 Tips

- **Bookmark the URL** on all your devices
- **Export data regularly** using the "💾 Save to File" button
- **Share the URL** with family/friends (each gets their own data)
- **Check Firebase Console** to see your data in Firestore

---

## 🎊 Enjoy!

You now have a fully functional, cloud-synced installment tracker!

**Your Live URL:**
```
https://installment-tracker-3808-5be23.web.app
```

Share it, use it, enjoy it! 🚀

