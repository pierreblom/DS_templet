/**
 * Google OAuth Routes
 * Handles the full server-side Google OAuth 2.0 flow
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User } = require('../../database/index');
const { generateTokens } = require('../middleware/auth');
const { logger } = require('../../utils/logger');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * GET /auth/google
 * Redirects the user to Google's OAuth consent screen
 */
router.get('/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        logger.error('GOOGLE_CLIENT_ID not configured');
        return res.status(500).send('Google OAuth not configured');
    }

    // Save the page the user was on so we can redirect back after login
    const returnTo = req.query.returnTo || '/';

    const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email profile',
        access_type: 'offline',
        state: encodeURIComponent(returnTo),
        prompt: 'select_account'
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

/**
 * GET /auth/google/callback
 * Handles the callback from Google after user grants consent.
 * Exchanges code for tokens, fetches user info, creates/finds user in DB,
 * issues JWT tokens, and redirects to frontend with tokens in URL fragment.
 */
router.get('/google/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        const returnTo = state ? decodeURIComponent(state) : '/';

        if (!code) {
            logger.warn('Google OAuth callback received without code');
            return res.redirect(`/?auth_error=no_code`);
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${req.protocol}://${req.get('host')}/auth/google/callback`;

        // Exchange authorization code for tokens
        const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });

        const { access_token } = tokenResponse.data;

        // Fetch user info from Google
        const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const googleUser = userInfoResponse.data;
        // googleUser: { id, email, verified_email, name, given_name, family_name, picture }

        logger.info('Google OAuth user info received', {
            email: googleUser.email,
            googleId: googleUser.id
        });

        // Find or create user in our database
        let user = await User.findOne({ where: { google_id: googleUser.id } });

        if (!user) {
            // Check if a user with this email already exists (e.g. registered via email/password)
            user = await User.findOne({ where: { email: googleUser.email } });

            if (user) {
                // Link existing account with Google ID
                await user.update({
                    google_id: googleUser.id,
                    avatar_url: googleUser.picture || user.avatar_url
                });
            } else {
                // Create a new user
                user = await User.create({
                    email: googleUser.email,
                    name: googleUser.name,
                    first_name: googleUser.given_name || '',
                    last_name: googleUser.family_name || '',
                    google_id: googleUser.id,
                    avatar_url: googleUser.picture || null,
                    role: 'customer'
                    // password_hash is null for Google OAuth users
                });
            }
        } else {
            // Update avatar if changed
            if (googleUser.picture && googleUser.picture !== user.avatar_url) {
                await user.update({ avatar_url: googleUser.picture });
            }
        }

        // Generate JWT tokens
        const tokens = generateTokens(user);

        logger.info('Google OAuth login successful', {
            userId: user.id,
            email: user.email
        });

        // Redirect to frontend with tokens in the URL fragment (hash)
        // The fragment is never sent to the server, making it more secure
        const fragment = `access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
        res.redirect(`${returnTo}#${fragment}`);

    } catch (error) {
        logger.error('Google OAuth error', {
            error: error.message,
            stack: error.stack
        });
        res.redirect(`/?auth_error=oauth_failed`);
    }
});

module.exports = router;
