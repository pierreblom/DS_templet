// Update account popup state based on login status
async function updateAccountPopupState() {
    if (typeof supabaseClient === 'undefined') return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session?.user;

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
window.toggleAccountPopup = async function (event) {
    if (event) event.stopPropagation();
    const popup = document.getElementById('accountPopup');

    // Update popup content based on login status
    await updateAccountPopupState();

    popup.classList.toggle('show');
};

// Sign out handler
async function handleSignOut() {
    if (typeof supabaseClient === 'undefined') return;

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out: ' + error.message);
    } else {
        console.log('User signed out successfully');
        await updateAccountPopupState();
        // Close the popup
        const popup = document.getElementById('accountPopup');
        if (popup) popup.classList.remove('show');
        // Optionally reload the page
        window.location.reload();
    }
}

// Update state when auth state changes
if (typeof supabaseClient !== 'undefined') {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAccountPopupState();
    });
}
