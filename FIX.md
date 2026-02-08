# ShopBeha Master Audit Fix Plan

This document outlines the comprehensive plan to resolve critical stability, security, and functionality issues identified in the February 2026 Audit Report. It is organized by priority.

## 🚨 Phase 1: Critical Production Blockers (Immediate Action)

These issues currently define the platform as "broken" for end-users.

### 1.1 Fix Express 5 Routing Regression
**Issue:** Clean URLs (`/contact`, `/orders`) return 404. Express 5 no longer supports array routes `app.get(['/a', '/b'], ...)` in the same way.
**File:** `server.js`
**Action:**
- Replace array route definitions (lines 138-152) with individual `app.get()` calls or regex paths.
- **Verification:** Visiting `/contact` and `/contact.html` should both work.

### 1.2 Fix Customer Authentication Model
**Issue:** "User" is aliased to "Profile", but the `Profile` model represents a shipping profile, not a user credential. It lacks `password`, `name`, and `role`.
**File:** `database/models/Profile.js`
**Action:**
- Add column: `password_hash` (String, nullable for Google auth users).
- Add column: `role` (String, default 'customer').
- Add column: `name` (String) - acts as a display name.
- Add instance method: `validatePassword(plainText)`.
- Add hooks: `beforeCreate` and `beforeUpdate` to hash passwords with `bcrypt`.
- **Verification:** Registration should succeed; Login should issue a JWT token.

### 1.3 Stabilize Database Connection
**Issue:** connection pool `max: 1` causes 500 errors (ConnectionTerminated) under moderate load.
**File:** `.env` or `database/database.js`
**Action:**
- Set `DB_POOL_MAX=5` or hardcode `max: 5` in Sequelize config.

---

## 🛡️ Phase 2: Security & Payment Integrity (PRIORITY: HIGH)
**Goal:** Prevent price manipulation and secure the checkout flow.

1.  **Secure Promos & Pricing** (Completed)
    *   [x] Create separate API endpoint for promo code validation (`/api/v1/promos/validate`).
    *   [x] Move promo logic (expiry, limits) to server-side.
    *   [x] Update `cart.js` to call API instead of hardcoded check.
    *   [x] **CRITICAL:** Update Yoco backend (`api/routes/yoco.js`) to:
        *   Recalculate total from DB prices (ignoring client-sent prices).
        *   Apply promo discount server-side.
        *   Calculate shipping server-side.
        *   Only trust `product_id` and `qty` from client.

2.  **Environment Security**
    *   [x] Verified `.env` variables are secure (JWT secrets are strong).
    *   [x] `NODE_TLS_REJECT_UNAUTHORIZED` is removed (good).

### Phase 3: Data Integrity & Storefront Dynamic Features
**Goal:** Fix broken admin analytics and make the storefront actually use the database.

1.  **Restore Stock Management** (Completed)
    *   **Issue:** field `stock` was removed from Product model. Admin analytics crash because they query it.
    *   **Action:**
        *   [x] Add `stock_quantity` (Integer, default 0) to `Product` model.
        *   [x] Update `api/routes/products.js` to allow editing stock.
        *   [x] Update `analytics.service.js` to query `stock_quantity`.

2.  **Dynamic Product Data** (Completed)
    *   **Issue:** Homepage displays 8 hardcoded products. Database products are ignored.
    *   **Action:**
        *   [x] Delete existing `var products = [...]` array in `shopbeha.js`.
        *   [x] Create function `fetchProducts()` calling `/api/v1/products`.
        *   [x] Render products dynamically from API response.
- **Benefit:** Price changes in Admin Panel will finally reflect on the Storefront.

---

## 🛠️ Phase 4: Customer Experience & SEO

### 4.1 Fix SEO Meta Tags
**Issue:** No meta description, Open Graph tags, or canonical URLs.
**Files:** `home_page/*.html`
**Action:**
- Add `<meta name="description" content="...">` to all pages.
- Add Open Graph (`og:title`, `og:image`) tags.

### 4.2 Content Security Policy (CSP)
**Issue:** CSP is explicitly disabled.
**File:** `server.js`
**Action:**
- Enable `helmet.contentSecurityPolicy`.
- Configure directives to allow Supabase, Yoco, and local assets.

### 4.3 XSS Sanitization
**Issue:** `innerHTML` used with product names.
**File:** `home_page/js/shopbeha.js`
**Action:**
- Use `textContent` instead of `innerHTML` where possible.
- Or use `DOMPurify` if HTML is truly needed.

---

## Execution Order

1.  **Fix Routes (`server.js`)** - *Immediate Stability*
2.  **Fix Auth (`Profile.js`)** - *Immediate Usage*
3.  **Fix DB Pool** - *Stability*
4.  **Secure Yoco (`yoco.js`)** - *Financial Security*
5.  **Restore Stock** - *Admin Stability*
6.  **Dynamic Products** - *Data Integrity*
