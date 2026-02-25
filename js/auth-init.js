/**
 * AuthManager - In-house authentication manager
 * Replaces Supabase client-side auth with JWT-based auth using localStorage
 */
const AuthManager = {
    TOKEN_KEY: 'beha_access_token',
    REFRESH_KEY: 'beha_refresh_token',
    USER_KEY: 'beha_user',
    _listeners: [],

    /**
     * Initialize: check URL fragment for tokens from Google OAuth callback
     */
    init() {
        // Check if we got tokens from Google OAuth redirect
        const hash = window.location.hash.substring(1);
        if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken) {
                localStorage.setItem(this.TOKEN_KEY, accessToken);
                if (refreshToken) {
                    localStorage.setItem(this.REFRESH_KEY, refreshToken);
                }
                // Remove tokens from URL for security
                history.replaceState(null, '', window.location.pathname + window.location.search);

                // Fetch user info with the new token
                this._fetchAndStoreUser(accessToken);
            }
        } else {
            // Try to restore session from stored tokens
            this._restoreSession();
        }
    },

    /**
     * Fetch user info from the server and store it
     */
    async _fetchAndStoreUser(token) {
        try {
            const response = await fetch('/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                this._notifyListeners('SIGNED_IN', data.user);
            } else {
                // Token might be expired, try refresh
                await this._tryRefresh();
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    },

    /**
     * Restore session from stored tokens
     */
    async _restoreSession() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const storedUser = localStorage.getItem(this.USER_KEY);

        if (!token) {
            this._notifyListeners('SIGNED_OUT', null);
            return;
        }

        // Check if token is still valid by calling /me
        try {
            const response = await fetch('/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                this._notifyListeners('SIGNED_IN', data.user);
            } else if (response.status === 401) {
                // Try to refresh the token
                const refreshed = await this._tryRefresh();
                if (!refreshed) {
                    this.signOut();
                }
            }
        } catch (error) {
            // Offline or server down — use cached user if available
            if (storedUser) {
                this._notifyListeners('SIGNED_IN', JSON.parse(storedUser));
            }
        }
    },

    /**
     * Try to refresh the access token
     */
    async _tryRefresh() {
        const refreshToken = localStorage.getItem(this.REFRESH_KEY);
        if (!refreshToken) return false;

        try {
            const response = await fetch('/api/v1/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.TOKEN_KEY, data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem(this.REFRESH_KEY, data.refreshToken);
                }
                // Fetch user info with new token
                await this._fetchAndStoreUser(data.accessToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    },

    /**
     * Get the current access token
     */
    getAccessToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /**
     * Get the current user (from cache)
     */
    getUser() {
        const stored = localStorage.getItem(this.USER_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!localStorage.getItem(this.TOKEN_KEY) && !!localStorage.getItem(this.USER_KEY);
    },

    /**
     * Get session-like object for backward compatibility
     */
    getSession() {
        const token = this.getAccessToken();
        const user = this.getUser();
        if (token && user) {
            return { user, accessToken: token };
        }
        return null;
    },

    /**
     * Sign out — clear all stored auth data
     */
    signOut() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
        this._notifyListeners('SIGNED_OUT', null);
    },

    /**
     * Register a callback for auth state changes
     */
    onAuthStateChange(callback) {
        this._listeners.push(callback);
        // Immediately fire with current state
        const user = this.getUser();
        if (user) {
            callback('SIGNED_IN', user);
        } else {
            callback('SIGNED_OUT', null);
        }
        // Return unsubscribe function
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    },

    /**
     * Notify all listeners of auth state change
     */
    _notifyListeners(event, user) {
        this._listeners.forEach(cb => {
            try {
                cb(event, user);
            } catch (e) {
                console.error('Auth listener error:', e);
            }
        });
    },

    /**
     * Make an authenticated fetch request
     */
    async fetchWithAuth(url, options = {}) {
        const token = this.getAccessToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        let response = await fetch(url, { ...options, headers });

        // If 401, try refreshing the token and retry once
        if (response.status === 401) {
            const refreshed = await this._tryRefresh();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
                response = await fetch(url, { ...options, headers });
            }
        }

        return response;
    }
};

// Initialize on load
window.AuthManager = AuthManager;
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
});
