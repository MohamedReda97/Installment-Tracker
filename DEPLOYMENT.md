# 🚀 Deployment Guide

Complete step-by-step guide to deploy your Installment Tracker to Firebase.

## 📋 Prerequisites

- [x] Firebase project created: **installment-tracker-3808-5be23**
- [ ] Node.js installed (v14+)
- [ ] Firebase CLI installed
- [ ] Firestore database enabled

---

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to authenticate with Google.

---

## Step 3: Enable Firestore Database

### Via Firebase Console:

1. Go to: https://console.firebase.google.com/
2. Select project: **installment-tracker-3808-5be23**
3. Click **Build** → **Firestore Database**
4. Click **"Create database"**
5. Select **"Start in production mode"**
6. Choose location (recommended: closest to your users)
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
7. Click **"Enable"**
8. Wait for database to be created (~1 minute)

---

## Step 4: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

Expected output:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/installment-tracker-3808-5be23/overview
```

---

## Step 5: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Expected output:
```
✔ Deploy complete!

Hosting URL: https://installment-tracker-3808-5be23.web.app
```

---

## Step 6: Test Your Deployment

1. Open the hosting URL in your browser
2. You should see the Installment Tracker app
3. Try adding a row and saving data
4. Check Firebase Console → Firestore Database to see your data

---

## 🔄 Making Updates

### Update Code

1. Edit files in `public/` directory
2. Test locally:
   ```bash
   firebase serve
   ```
3. Open: http://localhost:5000
4. Deploy changes:
   ```bash
   firebase deploy --only hosting
   ```

### Update Firestore Rules

1. Edit `firestore.rules`
2. Deploy:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🌐 Your Live URLs

After deployment, your app will be available at:

**Primary URL:**
```
https://installment-tracker-3808-5be23.web.app
```

**Alternative URL:**
```
https://installment-tracker-3808-5be23.firebaseapp.com
```

---

## 📊 Monitoring

### View Logs
```bash
firebase functions:log
```

### View Firestore Data
1. Go to Firebase Console
2. **Build** → **Firestore Database**
3. Browse collections: `users/{userId}/installments/data`

### View Hosting Analytics
1. Go to Firebase Console
2. **Build** → **Hosting**
3. View traffic and performance metrics

---

## 🔒 Security (Optional)

### Add Firebase Authentication

1. **Enable Authentication:**
   - Firebase Console → **Build** → **Authentication**
   - Click **"Get started"**
   - Enable **"Anonymous"** or **"Email/Password"**

2. **Update Firestore Rules** (`firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/installments/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Update Code** (`public/js/firebase-config.js`):
   ```javascript
   // Add after firebase.initializeApp()
   firebase.auth().signInAnonymously()
     .then((userCredential) => {
       console.log('Signed in anonymously:', userCredential.user.uid);
     })
     .catch((error) => {
       console.error('Auth error:', error);
     });
   ```

4. **Deploy:**
   ```bash
   firebase deploy
   ```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" when saving data

**Solution:** Check Firestore rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### Issue: "Firebase not defined"

**Solution:** Check that Firebase SDK scripts are loaded in `index.html`

### Issue: "Cannot read property 'firestore' of undefined"

**Solution:** Ensure Firebase is initialized before other scripts

### Issue: Local testing not working

**Solution:** Use Firebase emulator:
```bash
firebase serve
```

---

## 📝 Quick Commands Reference

```bash
# Install dependencies
npm install

# Test locally
firebase serve

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log

# Check project info
firebase projects:list
```

---

## ✅ Deployment Checklist

- [ ] Firebase CLI installed
- [ ] Logged in to Firebase
- [ ] Firestore database enabled
- [ ] Firestore rules deployed
- [ ] App deployed to hosting
- [ ] Tested live URL
- [ ] Data saving works
- [ ] Data loading works
- [ ] Export/Import works

---

## 🎉 Success!

Your Installment Tracker is now live and accessible from anywhere!

Share your URL:
```
https://installment-tracker-3808-5be23.web.app
```

---

## 📧 Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- Firebase Support: https://firebase.google.com/support

