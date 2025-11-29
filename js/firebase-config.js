// Firebase Configuration and Initialization

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACFyT4Qw-BWoCKq-cJYMkEnK7aOfvj_Pg",
  authDomain: "installment-tracker-3808-5be23.firebaseapp.com",
  projectId: "installment-tracker-3808-5be23",
  storageBucket: "installment-tracker-3808-5be23.firebasestorage.app",
  messagingSenderId: "636251902486",
  appId: "1:636251902486:web:7657bc7828355c46b21b37"
};

// Initialize Firebase (will be done after SDK loads)
let app;
let auth;
let db;

// Initialize Firebase services
function initializeFirebase() {
  try {
    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize Auth
    auth = firebase.auth();
    
    // Initialize Firestore
    db = firebase.firestore();
    
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
}

// Get current user
function getCurrentUser() {
  return auth ? auth.currentUser : null;
}

// Check if user is authenticated
function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Get user ID
function getUserId() {
  const user = getCurrentUser();
  return user ? user.uid : null;
}

// Get user email
function getUserEmail() {
  const user = getCurrentUser();
  return user ? user.email : null;
}

