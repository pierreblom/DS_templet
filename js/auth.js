
// Auth Functions
function openLoginModal(tab = 'signin') {
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

    const { data, error } = await supabaseClient.auth.signInWithPassword({
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
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const { data, error } = await supabaseClient.auth.signUp({
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

async function handleGoogleSignIn() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        alert("Error with Google Sign In: " + error.message);
    }
}

async function handleSignOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert("Error signing out: " + error.message);
    } else {
        // Close account popup
        const popup = document.getElementById('accountPopup');
        if (popup) popup.classList.remove('show');
        alert("Signed out!");
    }
}

// Override the global handleSignIn from front_page.html
window.handleSignIn = () => openLoginModal('signin');
window.handleSignUp = () => openLoginModal('signup');

window.handleOrdersClick = function () {
    window.location.href = '/orders.html';
}

window.handleProfileClick = function () {
    window.location.href = '/profile.html';
}

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

function closeModal(id) {
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
    if (typeof supabaseClient === 'undefined') {
        console.error('Supabase client not initialized');
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    updateAuthUI(session?.user);

    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session?.user);
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    });
});
