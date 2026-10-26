// =====================================================
// Firebase Authentication — Google Sign-In Only
// Handles Google Sign-In, Session Management & Dashboard Guard
// =====================================================

import { firebaseConfig, adminEmail } from './firebase-config.js';

let fbApp = null;
let fbAuth = null;
let signInWithPopupFn = null;
let GoogleAuthProviderClass = null;
let signOutFn = null;
let onAuthStateChangedFn = null;
let isFirebaseReady = false;

// Attempt Firebase SDK Initialization
try {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const authModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

        fbApp = initializeApp(firebaseConfig);
        fbAuth = authModule.getAuth(fbApp);
        signInWithPopupFn = authModule.signInWithPopup;
        GoogleAuthProviderClass = authModule.GoogleAuthProvider;
        signOutFn = authModule.signOut;
        onAuthStateChangedFn = authModule.onAuthStateChanged;
        isFirebaseReady = true;
    }
} catch (error) {
    console.warn('Firebase not configured. Using local admin auth mode:', error);
}

// Auth Wrapper Object
const auth = {
    get currentUser() {
        if (isFirebaseReady && fbAuth && fbAuth.currentUser) {
            return fbAuth.currentUser;
        }
        const local = localStorage.getItem('portfolioAdminUser');
        if (local) {
            try { return JSON.parse(local); } catch (e) { return null; }
        }
        return null;
    },
    isFirebase: isFirebaseReady
};

// Sign Out Handler
export async function signOut(authInstance) {
    if (isFirebaseReady && fbAuth && signOutFn) {
        try {
            await signOutFn(fbAuth);
        } catch (e) {
            console.warn('Firebase signOut error:', e);
        }
    }
    localStorage.removeItem('portfolioAdminUser');
    window.location.href = 'login.html';
}

// Auth State Changed Observer
export function onAuthStateChanged(authInstance, callback) {
    if (isFirebaseReady && fbAuth && onAuthStateChangedFn) {
        return onAuthStateChangedFn(fbAuth, (user) => {
            if (user) {
                localStorage.setItem('portfolioAdminUser', JSON.stringify({
                    email: user.email,
                    displayName: user.displayName || 'Shanmukha BS',
                    uid: user.uid
                }));
                callback(user);
            } else {
                const local = localStorage.getItem('portfolioAdminUser');
                if (local) {
                    try { callback(JSON.parse(local)); } catch (e) { callback(null); }
                } else {
                    callback(null);
                }
            }
        });
    }

    // Local / Offline Observer
    const local = localStorage.getItem('portfolioAdminUser');
    if (local) {
        try { callback(JSON.parse(local)); } catch (e) { callback(null); }
    } else {
        callback(null);
    }

    return () => {};
}

// Display UI Status Message on Login Page
function showLoginMessage(message, type = 'info') {
    const msgEl = document.getElementById('loginMessage');
    if (!msgEl) return;
    msgEl.className = `login-status-msg show ${type}`;
    msgEl.textContent = message;
}

// =====================================================
// LOGIN PAGE LOGIC — Google Sign-In Only
// =====================================================
function initLoginPage() {
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    // Auto-redirect if already logged in as admin
    onAuthStateChanged(auth, (user) => {
        if (user && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
            window.location.replace('dashboard.html');
        }
    });

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            googleLoginBtn.disabled = true;
            showLoginMessage('Connecting to Google…', 'info');

            if (isFirebaseReady && fbAuth && signInWithPopupFn && GoogleAuthProviderClass) {
                try {
                    const provider = new GoogleAuthProviderClass();
                    const result = await signInWithPopupFn(fbAuth, provider);
                    const user = result.user;

                    if (user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
                        localStorage.setItem('portfolioAdminUser', JSON.stringify({
                            email: user.email,
                            displayName: user.displayName || 'Shanmukha BS',
                            uid: user.uid
                        }));
                        showLoginMessage('Sign-in successful! Redirecting…', 'success');
                        setTimeout(() => window.location.replace('dashboard.html'), 500);
                    } else {
                        if (signOutFn) await signOutFn(fbAuth);
                        localStorage.removeItem('portfolioAdminUser');
                        showLoginMessage(`Access denied: ${user.email} is not authorised.`, 'error');
                        googleLoginBtn.disabled = false;
                    }
                } catch (err) {
                    console.error('Google Sign-in error:', err);
                    showLoginMessage(err.message || 'Google sign-in was cancelled or failed.', 'error');
                    googleLoginBtn.disabled = false;
                }
            } else {
                // Local / Demo Mode — accept admin email directly
                setTimeout(() => {
                    localStorage.setItem('portfolioAdminUser', JSON.stringify({
                        email: adminEmail,
                        displayName: 'Shanmukha BS',
                        provider: 'google'
                    }));
                    showLoginMessage('Sign-in successful! Redirecting…', 'success');
                    setTimeout(() => window.location.replace('dashboard.html'), 500);
                }, 400);
            }
        });
    }
}

// Auto-initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname.split('/').pop() || 'index.html';
    const page = pathname.replace(/\.[^/.]+$/, '') || 'index';

    if (page === 'login') {
        initLoginPage();
    }
});

// Expose Global Logout (used by dashboard.html and profile.html logout buttons)
window.logout = () => signOut(auth);

export { auth, adminEmail };
