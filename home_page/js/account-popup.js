// Update account popup state based on login status (in-house auth)
function updateAccountPopupState() {
    const user = window.AuthManager ? AuthManager.getUser() : null;

    const loggedOutState = document.getElementById('loggedOutState');
    const loggedInState = document.getElementById('loggedInState');
    const userEmailEl = document.getElementById('userEmail');

    if (user) {
        // User is logged in
        if (loggedOutState) loggedOutState.style.display = 'none';
        if (loggedInState) loggedInState.style.display = 'block';
        if (userEmailEl) userEmailEl.textContent = user.email;
    } else {
        // User is logged out
        if (loggedOutState) loggedOutState.style.display = 'block';
        if (loggedInState) loggedInState.style.display = 'none';
    }
}

// Override toggleAccountPopup to update state when opening
window.toggleAccountPopup = function (event) {
    if (event) event.stopPropagation();
    const popup = document.getElementById('accountPopup');

    // Update popup content based on login status
    updateAccountPopupState();

    popup.classList.toggle('show');
};

// Sign out handler
function handleSignOut() {
    if (window.AuthManager) {
        AuthManager.signOut();
    }
    updateAccountPopupState();
    // Close the popup
    const popup = document.getElementById('accountPopup');
    if (popup) popup.classList.remove('show');
    // Reload the page
    window.location.reload();
}

// Update state when auth state changes
if (typeof window.AuthManager !== 'undefined') {
    AuthManager.onAuthStateChange(() => {
        updateAccountPopupState();
    });
} else {
    // AuthManager might load after this script — listen for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (window.AuthManager) {
            AuthManager.onAuthStateChange(() => {
                updateAccountPopupState();
            });
        }
    });
}
