const firebaseConfig = {
  apiKey:            "AIzaSyBuBpkDzmIXwHTg88gwSE48ZW8Hr2ZaFBM",
  authDomain:        "it-325--perez.firebaseapp.com",
  projectId:         "it-325--perez",
  storageBucket:     "it-325--perez.firebasestorage.app",
  messagingSenderId: "848518798296",
  appId:             "1:848518798296:web:c22162160172741089f0ad"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();


auth.onAuthStateChanged((user) => {
  const loadingScreen   = document.getElementById('loading-screen');
  const authScreen      = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (user) {
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        const data      = doc.exists ? doc.data() : {};
        const firstName = data.firstName || (user.displayName ? user.displayName.split(' ')[0] : '');
        const lastName  = data.lastName  || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '');

        loadingScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');

        document.getElementById('dash-name').textContent = firstName + ' ' + lastName;
        document.getElementById('dash-msg').textContent  = 'Welcome back! You are already logged in. ✅';
      })
      .catch(() => {
        const nameParts = (user.displayName || '').split(' ');
        loadingScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        document.getElementById('dash-name').textContent = user.displayName || user.email;
        document.getElementById('dash-msg').textContent  = 'Welcome back! You are already logged in. ✅';
      });
  } else {
    loadingScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
  }
});

let selectedGender = '';

function selectGender(btn) {
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedGender = btn.textContent.replace(/[♂♀⚧]/g, '').trim();
}

function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs[0].classList.toggle('active', tab === 'login');
  tabs[1].classList.toggle('active', tab === 'signup');
  document.getElementById('login-panel').classList.toggle('active', tab === 'login');
  document.getElementById('signup-panel').classList.toggle('active', tab === 'signup');
  showError('login-error', '');
  showError('signup-error', '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('show', !!msg);
}

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="spinner"></span>${label}`
    : label;
}

function handleSignup(btn) {
  const firstName = document.getElementById('signup-firstname').value.trim();
  const lastName  = document.getElementById('signup-lastname').value.trim();
  const email     = document.getElementById('signup-email').value.trim();
  const dob       = document.getElementById('signup-dob').value;
  const password  = document.getElementById('signup-pw').value;

  if (!firstName || !lastName) {
    showError('signup-error', '⚠️ Please enter your first and last name.');
    return;
  }
  if (!email) {
    showError('signup-error', '⚠️ Please enter your email.');
    return;
  }
  if (!dob) {
    showError('signup-error', '⚠️ Please enter your date of birth.');
    return;
  }
  if (!selectedGender) {
    showError('signup-error', '⚠️ Please select your gender.');
    return;
  }
  if (password.length < 6) {
    showError('signup-error', '⚠️ Password must be at least 6 characters.');
    return;
  }

  showError('signup-error', '');
  setLoading(btn, true, 'Creating your account…');

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return user.updateProfile({
        displayName: firstName + ' ' + lastName
      }).then(() => {
        return db.collection('users').doc(user.uid).set({
          firstName:  firstName,
          lastName:   lastName,
          email:      email,
          dob:        dob,
          gender:     selectedGender,
          createdAt:  firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    })
    .then(() => {
      setLoading(btn, false, 'Create Account');
      showSignupSuccess();
    })
    .catch((error) => {
      setLoading(btn, false, 'Create Account');
      showError('signup-error', '⚠️ ' + getFirebaseError(error.code));
    });
}

function showSignupSuccess() {
  const panel = document.getElementById('signup-panel');
  panel.innerHTML = `
    <div style="text-align:center; padding:16px 0 8px;">
      <div style="font-size:54px; margin-bottom:16px; display:inline-block; animation:bounce2 1s ease infinite alternate;">✅</div>
      <div style="font-family:'Nunito',sans-serif; font-size:23px; font-weight:900; color:#F0EDFF; margin-bottom:10px;">
        Account Created!
      </div>
      <div style="font-size:14px; color:#8880AA; line-height:1.75; margin-bottom:26px;">
        Your account has been successfully created.<br>
        You can now log in with your email and password.
      </div>
      <button class="btn-primary" onclick="goToLogin()" style="max-width:200px; margin:0 auto; display:block;">
        Go to Login →
      </button>
    </div>
  `;
}

function goToLogin() {
  const panel = document.getElementById('signup-panel');
  panel.innerHTML = `
    <div class="form-title">Create account 🚀</div>
    <div class="form-subtitle">It's quick and easy to join</div>
    <div class="scroll-form">
      <div class="input-row">
        <div class="input-group">
          <label>First Name</label>
          <input type="text" id="signup-firstname" autocomplete="given-name" placeholder="Juan">
        </div>
        <div class="input-group">
          <label>Last Name</label>
          <input type="text" id="signup-lastname" autocomplete="family-name" placeholder="Dela Cruz">
        </div>
      </div>
      <div class="input-group">
        <label>Email</label>
        <input type="email" id="signup-email" inputmode="email" autocomplete="username" placeholder="you@example.com">
      </div>
      <div class="input-group">
        <label>Date of Birth</label>
        <input type="date" id="signup-dob" autocomplete="bday">
      </div>
      <div class="input-group">
        <label>Gender</label>
        <div class="gender-group">
          <button class="gender-btn" onclick="selectGender(this)" type="button">♂ Male</button>
          <button class="gender-btn" onclick="selectGender(this)" type="button">♀ Female</button>
          <button class="gender-btn" onclick="selectGender(this)" type="button">⚧ Other</button>
        </div>
      </div>
      <div class="input-group">
        <label>Password</label>
        <div class="password-wrapper">
          <input type="password" id="signup-pw" autocomplete="new-password" placeholder="At least 6 characters">
          <button class="toggle-pw" onclick="togglePw('signup-pw', this)" type="button">👁️</button>
        </div>
      </div>
      <div class="error-msg" id="signup-error"></div>
      <button class="btn-primary" onclick="handleSignup(this)">Create Account</button>
      <p class="terms">
        By clicking Create Account, you agree to our
        <a href="#">Terms</a>, <a href="#">Privacy Policy</a>, and <a href="#">Cookies Policy</a>.
      </p>
    </div>
  `;
  selectedGender = '';
  switchTab('login');
}

function handleLogin(btn) {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pw').value;

  if (!email) {
    showError('login-error', '⚠️ Please enter your email.');
    return;
  }
  if (!password) {
    showError('login-error', '⚠️ Please enter your password.');
    return;
  }

  showError('login-error', '');
  setLoading(btn, true, 'Logging in…');

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection('users').doc(user.uid).get()
        .then((doc) => {
          setLoading(btn, false, 'Log In');
          const data      = doc.exists ? doc.data() : {};
          const firstName = data.firstName || (user.displayName ? user.displayName.split(' ')[0] : '');
          const lastName  = data.lastName  || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '');
          showDashboard(firstName, lastName);
        });
    })
    .catch((error) => {
      setLoading(btn, false, 'Log In');
      showError('login-error', '⚠️ ' + getFirebaseError(error.code));
    });
}

function handleGoogle(btn) {
  const provider = new firebase.auth.GoogleAuthProvider();
  setLoading(btn, true, 'Connecting…');

  auth.signInWithPopup(provider)
    .then((result) => {
      const user      = result.user;
      const nameParts = (user.displayName || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName  = nameParts.slice(1).join(' ') || '';

      return db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (!doc.exists) {
            return db.collection('users').doc(user.uid).set({
              firstName:  firstName,
              lastName:   lastName,
              email:      user.email,
              dob:        '',
              gender:     '',
              createdAt:  firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        })
        .then(() => {
          setLoading(btn, false, 'Continue with Google');
          showDashboard(firstName, lastName);
        });
    })
    .catch((error) => {
      setLoading(btn, false, 'Continue with Google');
      if (error.code !== 'auth/popup-closed-by-user') {
        showError('login-error', '⚠️ ' + getFirebaseError(error.code));
      }
    });
}

function showDashboard(firstName, lastName) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.remove('hidden');
  document.getElementById('dash-name').textContent = firstName + ' ' + lastName;
  document.getElementById('dash-msg').textContent  = 'You\'ve successfully logged in. Welcome! ✅';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLogout() {
  auth.signOut().then(() => {
    document.getElementById('login-email').value = '';
    document.getElementById('login-pw').value    = '';
    document.getElementById('login-pw').type     = 'password';
    document.querySelectorAll('.toggle-pw').forEach(b => b.textContent = '👁️');
    showError('login-error', '');
    switchTab('login');
    document.getElementById('dashboard-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function getFirebaseError(code) {
  const errors = {
    'auth/email-already-in-use':    'That email is already registered. Try logging in.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-credential':      'Incorrect email or password. Please try again.',
    'auth/too-many-requests':       'Too many attempts. Please try again later.',
    'auth/network-request-failed':  'Network error. Please check your connection.',
    'auth/popup-blocked':           'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  };
  return errors[code] || 'Something went wrong. Please try again.';

}
