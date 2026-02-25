
// Auth Functions - Using in-house JWT auth (no Supabase)

window.openLoginModal = function (tab = 'signin') {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (typeof switchAuthTab === 'function') {
            switchAuthTab(tab);
        }
    }
    // Close account popup if open
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');
}

async function handleEmailSignIn(e) {
    e.preventDefault();

    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            const msg = data.error?.message || data.message || 'Invalid login credentials';
            alert(msg);
            return;
        }

        // Store tokens
        localStorage.setItem(AuthManager.TOKEN_KEY, data.accessToken);
        localStorage.setItem(AuthManager.REFRESH_KEY, data.refreshToken);
        localStorage.setItem(AuthManager.USER_KEY, JSON.stringify(data.user));

        // Notify listeners
        AuthManager._notifyListeners('SIGNED_IN', data.user);

        closeModal('loginModal');
        alert("Signed in successfully!");
    } catch (err) {
        console.error('Sign in error:', err);
        alert("Error signing in: " + err.message);
    }
}

async function handleEmailSignUp(e) {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            const msg = data.error?.message || data.message || 'Error signing up';
            alert(msg);
            return;
        }

        // Store tokens — user is immediately signed in after registration
        localStorage.setItem(AuthManager.TOKEN_KEY, data.accessToken);
        localStorage.setItem(AuthManager.REFRESH_KEY, data.refreshToken);
        localStorage.setItem(AuthManager.USER_KEY, JSON.stringify(data.user));

        // Notify listeners
        AuthManager._notifyListeners('SIGNED_IN', data.user);

        closeModal('loginModal');
        alert("Sign up successful! You are now logged in.");
    } catch (err) {
        console.error('Sign up error:', err);
        alert("Error signing up: " + err.message);
    }
}

window.handleGoogleSignIn = function () {
    // Redirect to server-side Google OAuth flow
    // Pass current page as returnTo so user comes back here after login
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/google?returnTo=${returnTo}`;
}

function handleSignOut() {
    if (window.AuthManager) {
        AuthManager.signOut();
    }
    // Close account popup
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');
    alert("Signed out!");
    window.location.reload();
}

// Export functions to window for global access
window.handleEmailSignIn = handleEmailSignIn;
window.handleEmailSignUp = handleEmailSignUp;
window.handleSignOut = handleSignOut;
window.handleSignUp = () => openLoginModal('signup');
window.handleSignIn = () => openLoginModal('signin');

window.handleOrdersClick = function () {
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');
    window.location.href = '/orders.html';
}

window.handleProfileClick = function () {
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');
    window.location.href = '/profile.html';
}

// Aliases for HTML onclick handlers
window.handleOrders = window.handleOrdersClick;
window.handleProfile = window.handleProfileClick;


function updateAuthUI(user) {
    const signinBtn = document.querySelector('.signin-btn');
    const accountTitle = document.querySelector('.account-popup h2');

    if (!signinBtn || !accountTitle) return;

    if (user) {
        accountTitle.textContent = `Hi, ${user.email}`;
        signinBtn.textContent = "Sign out";
        signinBtn.onclick = handleSignOut;

        // Hide Sign Up button if it exists
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) signupBtn.style.display = 'none';
    } else {
        accountTitle.textContent = "Account";
        signinBtn.textContent = "Sign in";
        signinBtn.onclick = () => openLoginModal('signin');

        // Show existing Sign Up button if it exists
        const signupBtn = document.querySelector('.signup-btn');
        if (signupBtn) {
            signupBtn.style.display = 'block';
            signupBtn.onclick = () => openLoginModal('signup');
        }
    }
}

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function switchAuthTab(tab) {
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');

    if (!signinForm || !signupForm) return;

    if (tab === 'signin') {
        signinForm.style.display = 'flex';
        signupForm.style.display = 'none';
        if (tabs[0]) {
            tabs[0].style.color = '#A0522D';
            tabs[0].style.borderBottom = '2px solid #A0522D';
        }
        if (tabs[1]) {
            tabs[1].style.color = '#999';
            tabs[1].style.borderBottom = 'none';
        }
    } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'flex';
        if (tabs[1]) {
            tabs[1].style.color = '#A0522D';
            tabs[1].style.borderBottom = '2px solid #A0522D';
        }
        if (tabs[0]) {
            tabs[0].style.color = '#999';
            tabs[0].style.borderBottom = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for AuthManager to be available
    if (typeof window.AuthManager === 'undefined') {
        console.error('AuthManager not initialized');
        return;
    }

    // Update UI based on current auth state
    const user = AuthManager.getUser();
    updateAuthUI(user);

    // Listen for auth state changes
    AuthManager.onAuthStateChange((event, user) => {
        updateAuthUI(user);
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    });
});
