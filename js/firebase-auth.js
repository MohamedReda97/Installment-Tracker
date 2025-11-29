// Firebase Authentication Functions

// Sign up with email and password
async function signUp(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('✅ User created:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with email and password
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ User signed in:', userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
    console.log('✅ User signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

// Show login modal
function showLoginModal() {
  console.log('🔓 Opening login modal');
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('authForm').reset();
  document.getElementById('authError').textContent = '';
  document.getElementById('authTitle').textContent = 'Sign In';
  document.getElementById('authSubmitBtn').textContent = 'Sign In';
  document.getElementById('authToggleText').innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink" onclick="event.preventDefault(); toggleAuthMode();">Sign Up</a>';
  document.getElementById('authForm').dataset.mode = 'signin';
}

// Hide login modal
function hideLoginModal() {
  document.getElementById('authModal').style.display = 'none';
}

// Toggle between sign in and sign up
function toggleAuthMode() {
  const form = document.getElementById('authForm');
  const mode = form.dataset.mode;

  if (mode === 'signin') {
    document.getElementById('authTitle').textContent = 'Sign Up';
    document.getElementById('authSubmitBtn').textContent = 'Sign Up';
    document.getElementById('authToggleText').innerHTML = 'Already have an account? <a href="#" id="authToggleLink" onclick="event.preventDefault(); toggleAuthMode();">Sign In</a>';
    form.dataset.mode = 'signup';
  } else {
    document.getElementById('authTitle').textContent = 'Sign In';
    document.getElementById('authSubmitBtn').textContent = 'Sign In';
    document.getElementById('authToggleText').innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink" onclick="event.preventDefault(); toggleAuthMode();">Sign Up</a>';
    form.dataset.mode = 'signin';
  }

  document.getElementById('authError').textContent = '';
}

// Handle auth form submission
async function handleAuthSubmit(event) {
  event.preventDefault();
  console.log('🔐 Form submitted');

  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const mode = document.getElementById('authForm').dataset.mode;
  const errorEl = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmitBtn');

  console.log('📧 Email:', email);
  console.log('🔑 Password length:', password.length);
  console.log('📝 Mode:', mode);

  // Validate
  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters';
    return;
  }

  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = mode === 'signin' ? 'Signing in...' : 'Signing up...';
  errorEl.textContent = '';

  // Perform auth
  let result;
  if (mode === 'signin') {
    console.log('🔓 Attempting sign in...');
    result = await signIn(email, password);
  } else {
    console.log('📝 Attempting sign up...');
    result = await signUp(email, password);
  }

  // Re-enable button
  submitBtn.disabled = false;
  submitBtn.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';

  if (result.success) {
    console.log('✅ Auth successful, hiding modal');
    hideLoginModal();
    // Data will be loaded by the auth state listener in app.js
  } else {
    console.error('❌ Auth failed:', result.error);
    errorEl.textContent = result.error;
  }
}

// Update UI based on auth state
function updateAuthUI(user) {
  const authSection = document.getElementById('authSection');
  const userSection = document.getElementById('userSection');
  const userEmailSpan = document.getElementById('userEmail');
  const appContent = document.getElementById('appContent');
  
  if (user) {
    // User is signed in
    authSection.style.display = 'none';
    userSection.style.display = 'flex';
    userEmailSpan.textContent = user.email;
    appContent.style.display = 'block';
  } else {
    // User is signed out
    authSection.style.display = 'flex';
    userSection.style.display = 'none';
    appContent.style.display = 'none';
  }
}

