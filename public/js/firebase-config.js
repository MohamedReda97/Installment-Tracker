// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACFyT4Qw-BWoCKq-cJYMkEnK7aOfvj_Pg",
  authDomain: "installment-tracker-3808-5be23.firebaseapp.com",
  projectId: "installment-tracker-3808-5be23",
  storageBucket: "installment-tracker-3808-5be23.firebasestorage.app",
  messagingSenderId: "636251902486",
  appId: "1:636251902486:web:03823e33973a154cb21b37"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support offline persistence');
    }
  });

console.log('✅ Firebase initialized successfully');

