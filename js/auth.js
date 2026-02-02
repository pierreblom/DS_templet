

// Auth Functions
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

    if (!window.supabaseClient) {
        alert("Authentication system not ready. Please refresh the page.");
        return;
    }

    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Sign in error:', error);
        if (error.status === 400) {
            alert("Invalid login credentials. Please check your email and password, or sign up if you don't have an account.");
        } else {
            alert("Error signing in: " + error.message);
        }
    } else {
        closeModal('loginModal');
        // The onAuthStateChange in account-popup.js will handle UI updates
        alert("Signed in successfully!");
    }
}

async function handleEmailSignUp(e) {
    e.preventDefault();

    if (!window.supabaseClient) {
        alert("Authentication system not ready. Please refresh the page.");
        return;
    }

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error('Sign up error:', error);
        alert("Error signing up: " + error.message);
    } else {
        closeModal('loginModal');
        alert("Sign up successful! Please check your email for a verification link to complete your registration.");
    }
}

window.handleGoogleSignIn = async function () {
    try {
        if (!window.supabaseClient) {
            alert("Supabase client not authenticated. Please refresh the page.");
            return;
        }

        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error("Google Sign In Error:", error);
            alert("Error with Google Sign In: " + error.message);
        }
    } catch (err) {
        console.error("Unexpected error during Google Sign In:", err);
        alert("An unexpected error occurred: " + err.message);
    }
}

async function handleSignOut() {
    if (!window.supabaseClient) {
        alert("Authentication system not ready. Please refresh the page.");
        return;
    }

    const { error } = await window.supabaseClient.auth.signOut();
    if (error) {
        alert("Error signing out: " + error.message);
    } else {
        // Close account popup
        const popup = document.getElementById('accountPopup');
        if (popup) popup.classList.remove('show');
        alert("Signed out!");
    }
}

// Export functions to window for global access
window.handleEmailSignIn = handleEmailSignIn;
window.handleEmailSignUp = handleEmailSignUp;
window.handleSignOut = handleSignOut;
window.handleSignUp = () => openLoginModal('signup');
window.handleSignIn = () => openLoginModal('signin');

window.handleOrdersClick = function () {
    // Close the account popup
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');

    // Navigate to orders page
    window.location.href = '/orders.html';
}

window.handleProfileClick = function () {
    // Close the account popup
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');

    // Navigate to profile page
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

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for supabaseClient to be available
    if (typeof window.supabaseClient === 'undefined') {
        console.error('Supabase client not initialized');
        return;
    }

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    updateAuthUI(session?.user);

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    });
});
