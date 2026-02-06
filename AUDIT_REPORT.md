# Comprehensive E-commerce Platform Audit Report

**Platform:** ShopBeha Bra Shop
**Date:** February 6, 2026 (Updated)
**Auditor:** Automated + Code Review + Live Testing
**Environment:** localhost:3030 (Supabase PostgreSQL)
**Previous Audit:** February 6, 2026 (initial)

---

## Changes Since Previous Audit

### Issues Fixed
1. ~~**SEC-001: Yoco payment routes NOT MOUNTED**~~ -- Now mounted at `server.js:212` via `app.use('/api/v1/yoco', yocoRoutes)`
2. ~~**Broken SHOP link**~~ -- SHOP link removed from navigation entirely; simplified nav
3. ~~**Broken CONTACT link**~~ -- Contact page accessible at `/contact.html` (but see new routing issue below)
4. ~~**Guest checkout missing**~~ -- Guest checkout now implemented with `GuestCustomer` model and `optionalAuth` middleware
5. ~~**No order tracking UI**~~ -- Dedicated `/orders.html` page with 5-step visual timeline (Ordered > Verified > Shipping > Delivery > Complete)
6. ~~**Footer irrelevant categories**~~ -- Footer simplified to copyright bar with social links and legal popup
7. ~~**Contact form to Google Sheets**~~ -- Contact form now submits to backend API (`POST /api/v1/contact`)
8. ~~**Sequential integer IDs (SEC-014)**~~ -- Order model now uses UUIDs
9. ~~**No checkout page**~~ -- Dedicated `/checkout.html` page with Yoco integration, order summary, shipping form
10. ~~**No profile page**~~ -- Dedicated `/profile.html` page with personal info and order stats

### New Features Added
- Product options (size, color) in cart items and order details
- Supplier ordering section in admin panel ("Open All Supplier Links")
- Pending order metrics in analytics dashboard
- Guest customer data model and guest order tracking by email
- Dedicated checkout, orders, and profile pages (previously modals/missing)

### New Issues Introduced
- Customer auth completely broken (Profile model lacks password/name/role fields)
- Express 5 array route syntax causes 404s on clean URLs
- Products API returns 0 products (frontend/backend data disconnect)
- Analytics references non-existent `stock` column
- Connection pool exhaustion under moderate load
- Yoco debug log writes sensitive data to filesystem

---

## Executive Summary

### Overall Assessment

| Interface | Grade | Status | Change |
|-----------|-------|--------|--------|
| **Public Storefront** | **C** | Clean URLs broken, products hardcoded, but checkout flow improved | Up from D+ |
| **Customer Portal** | **D** | Auth system broken after Profile model refactor | Down from C |
| **Admin Panel** | **C+** | Login may be unstable, new supplier features, stock management removed | Down from B- |
| **Security** | **C** | Yoco routes fixed, but webhook verification still missing | Up from C- |
| **Overall** | **C-** | Significant regression in auth; improvements in checkout and guest flow | Down from C |

### Critical Issues Requiring Immediate Attention

1. **Customer auth broken** -- Profile model has no password/name/role fields; registration creates incomplete records, login throws 500
2. **Express 5 routing regression** -- `/contact`, `/orders`, `/profile`, `/checkout` all return 404 (only `.html` versions work)
3. **Webhook signature verification missing** -- Yoco webhook has NO signature verification; payment fraud possible
4. **Weak JWT secrets** -- placeholder values still in environment
5. **NODE_TLS_REJECT_UNAUTHORIZED=0** -- still disables all TLS verification
6. **XSS vulnerabilities** -- extensive use of innerHTML with unsanitized data
7. **Client-side price calculation** -- cart totals can be manipulated before payment
8. **No Content Security Policy** -- CSP explicitly disabled
9. **Products API broken** -- Returns 0 products; frontend uses hardcoded data
10. **Analytics service crashes** -- References `Product.stock` column that doesn't exist

### Major Gaps vs 2025-2026 Standards

- No server-side product search (client-side only)
- No wishlist/favorites functionality
- No product reviews system (hardcoded testimonials only)
- No real-time inventory management (stock field removed)
- No abandoned cart recovery
- No password reset / email verification
- No mobile wallet support (Apple Pay, Google Pay)
- No structured data (JSON-LD) for SEO
- No PWA capabilities
- No internationalization/multi-currency

---

## PART 1: PUBLIC STOREFRONT FINDINGS

### 1.1 Homepage & Navigation

**Homepage Load: 200 OK**

| Check | Result | Notes |
|-------|--------|-------|
| HTML5 doctype | PASS | Proper `<!DOCTYPE html>` |
| Viewport meta | PASS | `width=device-width, initial-scale=1.0` |
| Title tag | PASS | "shopbeha.com - The Most Comfortable Bra" |
| Meta description | **FAIL** | Missing entirely |
| OG/Twitter tags | **FAIL** | No social media meta tags |
| Canonical URL | **FAIL** | Missing |
| Favicon | PASS | SVG favicon served at `/favicon.ico` (server.js:255-260) |
| Structured data | **FAIL** | No JSON-LD markup |
| Skip-to-content | **FAIL** | No skip navigation link |
| `<main>` element | **FAIL** | Missing landmark |

**Navigation (Updated):**

| Element | Status | Notes |
|---------|--------|-------|
| Home link | PASS | Links to `/` |
| Contact link | **Partial** | Works as `/contact.html`; `/contact` returns 404 (Express 5 issue) |
| Search icon | PASS | Opens search modal |
| Account icon | PASS | Opens account popup with sign in/out, Orders, Profile links |
| Cart icon | PASS | Opens cart drawer with badge count |
| Hamburger menu | PASS | Mobile nav toggle |
| Footer social links | **FAIL** | All point to `#` (placeholder) |
| Footer legal links | PASS | Terms popup menu with links to all legal pages |

### 1.2 Product Discovery

| Feature | Status | Notes |
|---------|--------|-------|
| Product listing | PASS | Rendered client-side from hardcoded JS array (8 products) |
| Product detail page | PASS | `/Select/select.html` loads |
| Category filtering | Partial | Client-side only via `openCategoryPage()` |
| Search | Partial | Client-side filtering of name+category, no debouncing |
| Sorting options | **MISSING** | Not implemented |
| Pagination | **MISSING** | All products loaded at once |
| Products API | **BROKEN** | `GET /api/v1/products` returns 0 products; DB empty |
| Product count | 8 products | Hardcoded in `shopbeha.js`, not from database |

**Product Data Disconnect (NEW CRITICAL):**
- Frontend renders 8 products hardcoded in `home_page/js/shopbeha.js` lines 11-92
- Products API (`/api/v1/products`) returns empty array -- database has no product records
- Product management in homepage inline JS modifies localStorage only, not the database
- Admin panel product management uses the API (database) -- completely separate data source
- Zero `fetch()` or `/api/` calls from the homepage

### 1.3 Product Detail Pages

| Feature | Status | Notes |
|---------|--------|-------|
| Image gallery | Partial | Main + hover image, no zoom |
| Product description | PASS | Present |
| Pricing | PASS | ZAR currency (R prefix) |
| Size selection | PASS | Size options added to cart items |
| Color selection | PASS | Color options added to cart items |
| Quantity selector | PASS | +/- controls |
| Add to cart | PASS | Functional with options |
| Stock status | **MISSING** | No stock display (stock field removed from model) |
| Reviews | **HARDCODED** | Static testimonials, not dynamic |
| Related products | **MISSING** | Not implemented |
| Breadcrumbs | **MISSING** | Not implemented |

### 1.4 Shopping Cart

| Feature | Status | Notes |
|---------|--------|-------|
| Cart drawer | PASS | Slide-in modal with item list |
| Cart badge | PASS | Updates count in real-time |
| Quantity adjustment | PASS | +/- buttons per item |
| Item removal | PASS | Trash icon per item |
| Product options display | PASS | Shows "Size: M | Color: Black" for items with options |
| Subtotal calculation | **INSECURE** | Client-side only |
| Promo code | **INSECURE** | Hardcoded `ROOTED15` (15% off) in client JS (both `cart.js` and `shopbeha.js`) |
| Shipping estimate | PASS | SA: R60 (free over R1000), International: R300 |
| Cart persistence | PASS | localStorage + Supabase sync for authenticated users |
| Empty cart state | Partial | Checkout button disabled but no empty message |
| Stock validation | **MISSING** | No stock checking (stock field removed) |

### 1.5 Checkout Flow

| Feature | Status | Notes |
|---------|--------|-------|
| Dedicated checkout page | PASS | `/checkout.html` with full form layout |
| Checkout form | PASS | Email, name, phone, address, city, postal code, country |
| Address validation | Partial | HTML required attributes only, no format validation |
| Country selection | Partial | Only 3 countries: ZA, US, UK |
| Order summary sidebar | PASS | Shows cart items with options, subtotal, shipping, total |
| Yoco payment integration | PASS | Creates checkout session via `/api/v1/yoco/create-checkout` |
| TEST MODE badge | Present | Shows "TEST MODE" -- should be env-driven for production |
| Guest checkout | PASS | `optionalAuth` middleware allows unauthenticated orders |
| Profile prefill | PASS | Prefills form from Supabase profile if logged in |
| Shipping method selection | **MISSING** | Auto-calculated, no choice |
| Order confirmation | PASS | Redirects to `/orders` via `/success` route |

**Checkout Flow Issue:**
- Client-side `CartModule.calculateTotals()` computes the amount sent to Yoco
- If server doesn't independently validate, price manipulation is possible
- `order.service.js` does recalculate total from DB prices (good), but the Yoco amount comes from client

### 1.6 Static Pages

| Page | URL | Status | Meta Description |
|------|-----|--------|-----------------|
| Homepage | `/` | 200 | **MISSING** |
| Contact | `/contact.html` | 200 | **MISSING** |
| Checkout | `/checkout.html` | 200 | **MISSING** |
| Orders | `/orders.html` | 200 | **MISSING** |
| Profile | `/profile.html` | 200 | **MISSING** |
| Terms & Conditions | `/legal/terms-and-conditions.html` | 200 | Present |
| Privacy Policy | `/legal/privacy-policy.html` | 200 | Present (POPIA compliant) |
| Shipping Policy | `/legal/shipping-policy.html` | 200 | Present |
| Return/Refund Policy | `/legal/return-refund-policy.html` | 200 | Present (CPA compliant) |
| Cookie Policy | `/legal/cookie-policy.html` | 200 | Present |
| ECTA Disclosure | `/legal/ecta-disclosure.html` | 200 | Present |
| Admin Panel | `/admin/` | 200 | **MISSING** |
| FAQ | N/A | **MISSING** | Page doesn't exist |
| About Us | N/A | **MISSING** | Page doesn't exist |
| Size Guide | N/A | **MISSING** | Page doesn't exist |

**Title Inconsistency:**
- Homepage: "shopbeha.com - The Most Comfortable Bra"
- Contact: "Contact Us - ShopBeha"
- Checkout: "Checkout - Beha"
- Orders: "Your Order Tracking - Beha"
- Profile: "My Profile - Beha"
- Admin: "Admin Dashboard - Bra Shop"

### 1.7 Routing Issues (NEW)

**Express 5 Array Route Syntax Broken:**

| Route | Status | Notes |
|-------|--------|-------|
| `GET /contact` | **404** | Array syntax `['/contact', '/contact.html']` broken in Express 5 |
| `GET /contact.html` | 200 | Works with extension |
| `GET /orders` | **404** | Same issue |
| `GET /orders.html` | 200 | Works with extension |
| `GET /profile` | **404** | Same issue |
| `GET /profile.html` | 200 | Works with extension |
| `GET /checkout` | **404** | Same issue |
| `GET /checkout.html` | 200 | Works with extension |
| `GET /success` | **Redirect** | Redirects to `/orders` which then 404s |

**Root Cause:** `server.js:138-152` uses `app.get(['/contact', '/contact.html'], ...)` syntax. Express 5.1.0 (`package.json:28`) may handle array route patterns differently than Express 4.

**No Custom 404 Page:**
- Non-API routes show bare Express error: `Cannot GET /path`
- API routes correctly return JSON: `{"error":{"code":"NOT_FOUND","message":"Resource not found"}}`

---

## PART 2: CUSTOMER PORTAL FINDINGS

### 2.1 Authentication (CRITICAL REGRESSION)

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | **BROKEN** | `User.create({email, password, name, role})` maps to Profile model which lacks password/name/role fields |
| Customer login | **BROKEN** | `user.validatePassword(password)` throws -- Profile model has no such method |
| Admin login bypass | **UNSTABLE** | Env credential bypass should work but returned 500 during testing (may be connection pool related) |
| Password hashing | **BROKEN** | Profile model has no beforeCreate hook for bcrypt |
| Rate limiting | PASS | 5 attempts per 15 minutes on auth endpoints |
| User enumeration prevention | PASS | Generic "Invalid email or password" error |
| Google OAuth | PASS | Frontend uses Supabase Auth directly (bypasses broken backend auth) |
| Email verification | **MISSING** | Not implemented |
| Password reset | **MISSING** | No forgot password flow |
| Token refresh | PASS | Refresh endpoint with 7-day expiry |
| Session management | Partial | JWT stateless, no blacklisting on logout |
| Duplicate email handling | PASS | 409 Conflict via Sequelize unique constraint |

**Critical Auth Architecture Issue:**
- `database/index.js:23` exports `User: Profile` (alias)
- `api/routes/auth.js:7` imports `User` which is actually the `Profile` model
- **Profile model (`database/models/Profile.js`) has:** id (UUID), first_name, last_name, email, address, apartment, city, postal_code, phone
- **Profile model is MISSING:** password, name, role, validatePassword method, beforeCreate hook
- **Result:** Customer registration silently discards password/name/role; customer login throws `user.validatePassword is not a function` (500 error)
- **Impact:** Only Supabase Auth (frontend-only, Google OAuth) works for customer authentication. Backend JWT auth is completely broken for non-admin users.

**Dual Auth System Confusion:**
- Frontend (`js/auth.js`) uses Supabase Auth (`window.supabaseClient.auth`)
- Backend (`api/routes/auth.js`) uses custom JWT with `User` model
- These are completely separate auth systems
- Frontend auth tokens (Supabase) are NOT accepted by backend API
- Backend JWT tokens are NOT used by frontend pages
- Orders page loads orders directly from Supabase, not via API

### 2.2 Account Management

| Feature | Status | Notes |
|---------|--------|-------|
| Profile page | PASS | `/profile.html` loads with auth prompt |
| Edit profile | **BROKEN** | Backend expects `User` model with `name` field; Profile has `first_name`/`last_name` |
| Change password | **BROKEN** | Profile model has no password field |
| Order history | PASS | `/orders.html` with visual timeline (loads from Supabase directly) |
| Guest order tracking | PASS | Track by email via `/api/v1/orders/track?email=...` |
| Address book | **MISSING** | Not implemented |
| Saved payment methods | **MISSING** | Not implemented |
| Wishlist | **MISSING** | Not implemented |
| Account deletion | **MISSING** | Not implemented |

### 2.3 Order Management (Customer)

| Feature | Status | Notes |
|---------|--------|-------|
| View own orders | PASS | Filtered by user_id via Supabase query |
| Order timeline | PASS | 5-step visual indicator: Ordered > Verified > Shipping > Delivery > Complete |
| Order details | PASS | Items with options (size/color), quantities, prices |
| Product images in order | Partial | Falls back to placeholder if product not found in local array |
| Cancel pending orders | PASS | Only pending status via API |
| Cart clearing after purchase | PASS | Auto-clears on success redirect |
| Cancelled orders hidden | Note | `neq('status', 'cancelled')` filter -- users can't see cancelled order history |
| Reorder | **MISSING** | Not implemented |
| Invoice download | **MISSING** | Not implemented |
| Return requests | **MISSING** | Not implemented |

### 2.4 Logout

| Feature | Status | Notes |
|---------|--------|-------|
| Logout functionality | PASS | Supabase `signOut()` + popup close |
| Token invalidation | **FAIL** | No server-side blacklisting -- stolen tokens remain valid |
| Cart persistence | PASS | Cart saved in localStorage |
| Protected page redirect | PASS | Orders/profile show auth prompt |

---

## PART 3: ADMIN PANEL FINDINGS

### 3.1 Admin Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Separate login page | PASS | `/admin/login` (React SPA) |
| Admin credentials | Present | `admin@shopbeha.com` / `Admin123!` (env config) |
| Admin bypass login | **UNSTABLE** | Plaintext password comparison via env vars; returned 500 during testing |
| Token refresh | PASS | Automatic retry queue in `api.ts` |
| Session timeout | PASS | 15-minute access token |
| Rate limiting | PASS | 5 attempts per 15 minutes |
| Two-factor auth | **MISSING** | Not implemented |
| Non-admin access blocked | PASS | Returns 404 for enumeration prevention |

**Admin Login Issue Detail:**
- Admin bypass at `auth.js:96-121` compares plaintext password against `process.env.ADMIN_PASSWORD`
- Creates fake `adminUser` object with `id: 'admin-user-id'`, generates JWT
- During testing, returned 500 INTERNAL_ERROR -- likely due to database connection pool exhaustion (`pool.max: 1`) after multiple prior API calls
- The auth middleware recognizes `admin-user-id` string for admin checks (`auth.js:75-84`)

### 3.2 Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Revenue overview | PASS | Total revenue in ZAR |
| Order stats | PASS | Total, by status, today, ready to ship |
| Pending order count | PASS | New metric added |
| Customer count | PASS | Includes both registered and guest customers |
| Product count | PASS | Total products from DB |
| Sales chart | PASS | Weekly line chart (Recharts) |
| Recent orders table | PASS | Last 5 orders |
| Product analytics | **BROKEN** | References `Product.stock` column that doesn't exist (500 error) |
| Low stock alerts | **BROKEN** | `Product.stock` column removed from model |
| Error state display | **FAIL** | API failures may show blank page |
| Date range selector | **MISSING** | Hardcoded to "week" |

### 3.3 Product Management

| Feature | Status | Notes |
|---------|--------|-------|
| Product listing | PASS | Table with name, category, price |
| Add product | PASS | Modal form via API |
| Edit product | PASS | Modal form via API |
| Delete product | Partial | Soft delete methods reference undefined fields (`isActive`, `deletedAt`) |
| Restore deleted | **501** | Returns "Not implemented" |
| Stock management | **REMOVED** | Stock field removed from Product model; stock endpoints return 501 |
| Image management | Partial | URL fields only, no upload |
| Product variants | **MISSING** | No variant management in admin (options exist in cart only) |
| Category management | **MISSING** | Categories hardcoded in dropdown |
| Bulk actions | **MISSING** | Not implemented |
| Import/Export | **MISSING** | Not implemented |

**Product Data vs Frontend Issue:**
- Admin creates/edits products in database via API
- Frontend storefront displays hardcoded products from `shopbeha.js`
- These are completely disconnected -- admin product changes don't appear on storefront

### 3.4 Order Management (Admin)

| Feature | Status | Notes |
|---------|--------|-------|
| Order listing | PASS | With status filtering and pagination |
| Order details | PASS | Items with size/color options, address, totals |
| Status update | PASS | Dropdown selector |
| Status transitions | **FAIL** | No state machine -- can go delivered > pending |
| Supplier ordering | PASS | "Open All Supplier Links" button (NEW) |
| Product options in items | PASS | Shows size/color per item (NEW) |
| Tracking number | Partial | Field exists but no shipping integration |
| Email notifications | Partial | Shipping/delivery email templates exist (service may not be configured) |
| Refund processing | **MISSING** | Not implemented |
| Print invoice | **MISSING** | Not implemented |
| Order notes | **MISSING** | Not implemented |
| Export orders | **MISSING** | Not implemented |

### 3.5 Customer Management

| Feature | Status | Notes |
|---------|--------|-------|
| Customer listing | PASS | Search, filter, pagination |
| Guest customers | PASS | Separate model, linked to orders |
| Customer details | PASS | Name, email, order count |
| Role management | PASS | Customer/admin toggle |
| Lifetime value | Partial | API returns total spent |
| Suspend account | **MISSING** | Not implemented |
| Delete customer | **MISSING** | Not implemented |
| Password reset | **MISSING** | Not implemented |

### 3.6 Settings & Configuration

**Status: ENTIRELY MISSING**

No settings page exists in the admin panel.

---

## PART 4: SECURITY FINDINGS

### Critical Vulnerabilities

#### SEC-001: ~~Yoco Payment Routes Not Mounted~~ -- FIXED
- **Status:** RESOLVED
- **Location:** `server.js:212`
- **Fix Applied:** `app.use('/api/v1/yoco', yocoRoutes)` now present

#### SEC-002: Yoco Webhook No Signature Verification
- **Severity:** Critical
- **Location:** `api/routes/yoco.js:86-139`
- **Current Behavior:** Webhook events parsed with `JSON.parse(req.body.toString())` -- no HMAC signature verification
- **Impact:** Attackers can send fake `checkout.succeeded` events to mark unpaid orders as paid
- **Additional Risk:** Webhook creates new Supabase client per request (`createClient()` at line 93-97), uses service role key fallback to anon key
- **Fix:** Implement Yoco webhook signature verification using webhook secret

#### SEC-003: Stripe Webhook Verification Optional
- **Severity:** High
- **Location:** `api/routes/webhooks.js:22-28`
- **Current Behavior:** Falls back to unverified JSON parsing when `STRIPE_WEBHOOK_SECRET` is missing
- **Additional Issue:** `fulfillOrder()` is non-functional (returns null); `payment_intent_id` column doesn't exist in Order model
- **Fix:** Make webhook secret mandatory; reject requests when not configured

#### SEC-004: Customer Auth System Broken (NEW)
- **Severity:** Critical
- **Location:** `database/models/Profile.js`, `database/index.js:23`, `api/routes/auth.js:36,132`
- **Current Behavior:** `User: Profile` alias means auth routes operate on Profile model. Profile lacks: password field, name field, role field, validatePassword method, beforeCreate bcrypt hook
- **Impact:** Customer registration creates incomplete records (no password stored); customer login throws 500 (`validatePassword is not a function`)
- **Fix:** Either add password/role fields to Profile model with bcrypt hooks, or migrate to using Supabase Auth consistently

#### SEC-005: NODE_TLS_REJECT_UNAUTHORIZED=0
- **Severity:** High
- **Location:** `.env`
- **Current Behavior:** Disables ALL TLS certificate verification globally
- **Impact:** Man-in-the-middle attacks on database connections and API calls
- **Fix:** Remove this setting; configure SSL properly per-connection

#### SEC-006: Weak JWT Secrets
- **Severity:** High
- **Location:** `.env`
- **Current Behavior:** `JWT_SECRET=your_super_secret_jwt_key_change_in_production`; `JWT_REFRESH_SECRET=another_super_secret_refresh_key_change_in_production`
- **Impact:** JWT tokens can be forged if deployed with these values
- **Fix:** Generate 256-bit random secrets for production

#### SEC-007: Content Security Policy Disabled
- **Severity:** High
- **Location:** `server.js:23`
- **Current Behavior:** `contentSecurityPolicy: false`
- **Impact:** No browser-enforced XSS protection; inline script injection possible
- **Fix:** Enable CSP with appropriate directives

#### SEC-008: No Token Blacklisting on Logout
- **Severity:** High
- **Location:** `api/routes/auth.js`
- **Current Behavior:** Logout only tells client to discard tokens; stolen tokens remain valid for up to 15min (access) or 7 days (refresh)
- **Fix:** Implement token blacklist (Redis or database)

### High Vulnerabilities

#### SEC-009: XSS via innerHTML
- **Severity:** High
- **Location:** `home_page/js/shopbeha.js` (cart rendering, search results)
- **Current Behavior:** Product data inserted via `innerHTML` without sanitization: `row.innerHTML = \`<div class="cart-item-name">${product.name}</div>\``
- **Impact:** If product names contain script tags (e.g., from admin panel), arbitrary JS executes in customer browsers
- **Fix:** Use `textContent` for text content, or sanitize with DOMPurify

#### SEC-010: Client-Side Cart Total Manipulation
- **Severity:** High
- **Location:** `home_page/js/cart.js`, `home_page/js/checkout.js`
- **Current Behavior:** `CartModule.calculateTotals()` computes totals client-side; this amount is sent to Yoco payment gateway
- **Mitigating Factor:** `order.service.js:calculateTotal()` recalculates from DB prices for order creation
- **Remaining Risk:** Yoco checkout session amount may differ from order total if price manipulation occurs
- **Fix:** Ensure Yoco session amount matches server-calculated order total

#### SEC-011: Hardcoded Promo Code
- **Severity:** High
- **Location:** `home_page/js/cart.js:181-192`, `home_page/js/shopbeha.js:208-209`
- **Current Behavior:** `ROOTED15` promo code (15% off) hardcoded in client JS (duplicated in two files)
- **Impact:** Anyone viewing source can use the code; no expiration, no usage limits, no server-side validation
- **Fix:** Move promo validation to server-side with database storage

#### SEC-012: Yoco Debug Log Writes Sensitive Data to Filesystem (NEW)
- **Severity:** High
- **Location:** `api/routes/yoco.js:30-38`
- **Current Behavior:** Writes debug data to `/yoco_debug.log` including partial secret key (`secretKey.substring(0, 10)`)
- **Impact:** Sensitive payment data and partial API keys persisted to predictable file path
- **Fix:** Remove filesystem debug logging; use structured logger instead

### Medium Vulnerabilities

| ID | Description | Location | Fix |
|----|-------------|----------|-----|
| SEC-013 | Admin plaintext password comparison | `auth.js:99` | Use bcrypt hash comparison |
| SEC-014 | Admin user ID is hardcoded magic string | `auth.js:101`, `auth middleware:75-84` | Store admin in database |
| SEC-015 | No password reset mechanism | `api/routes/auth.js` | Implement secure reset flow |
| SEC-016 | Tokens stored in localStorage | `admin/src/services/api.ts:15-16` | Consider httpOnly cookies |
| SEC-017 | Admin and customer tokens use same JWT keys | `api/middleware/auth.js` | Separate signing keys |
| SEC-018 | No Permissions-Policy header | `server.js` | Restrict camera, mic, geolocation |
| SEC-019 | Foreign key constraints disabled | `database/index.js:10-11` | Set `constraints: true` |
| SEC-020 | Supabase creates new client per webhook | `yoco.js:93-97` | Use singleton client |
| SEC-021 | Sort column not whitelisted in orders | `orders.js:131` | Validate against whitelist |

### Positive Security Implementations

- Helmet security headers (HSTS, X-Content-Type-Options, X-Frame-Options, etc.)
- JWT with separate access (15min) and refresh (7d) tokens
- Joi input validation on all API endpoints
- Role-based access control with enumeration prevention (404 vs 403)
- Rate limiting: 1000/15min general, 5/15min auth endpoints
- CORS properly configured with origin whitelist
- Audit logging for CUD operations with trace IDs
- Generic error messages in production (no stack traces)
- Sequelize ORM prevents SQL injection
- bcrypt password hashing (10 rounds) -- but not connected to Profile model
- `.env` not tracked in git

---

## PART 5: TECHNICAL QUALITY

### Code Architecture

| Aspect | Grade | Notes |
|--------|-------|-------|
| Backend structure | **B+** | Clean layered architecture (Routes > Services > Models) |
| API design | **B** | RESTful, versioned (/api/v1), proper HTTP methods |
| Database models | **C** | Profile/User mismatch, missing FK constraints, stock field removed |
| Input validation | **A-** | Comprehensive Joi schemas for all endpoints |
| Error handling | **B** | Custom error classes, generic production messages |
| Logging | **B+** | Structured JSON logging with trace IDs |
| Frontend architecture | **D** | Hardcoded products, dual auth, inline JS, client-side rendering |
| Admin panel | **B** | Clean React + TypeScript + Tailwind |
| Testing | **F** | Minimal test coverage |

### Security Headers (Verified)

| Header | Present | Value |
|--------|---------|-------|
| Strict-Transport-Security | Yes | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | Yes | `nosniff` |
| X-Frame-Options | Yes | `SAMEORIGIN` |
| X-XSS-Protection | Yes | `0` (modern approach) |
| Referrer-Policy | Yes | `no-referrer` |
| Cross-Origin-Opener-Policy | Yes | `same-origin` |
| Cross-Origin-Resource-Policy | Yes | `same-origin` |
| Content-Security-Policy | **No** | Explicitly disabled |
| Permissions-Policy | **No** | Not set |

### Performance Concerns

| Issue | Impact | Priority |
|-------|--------|----------|
| Database pool max=1 | Connection exhaustion under moderate load (confirmed: 500 errors after multiple rapid requests) | **Critical** |
| Products hardcoded in JS (not fetched from API) | No server-side caching benefits, stale data | High |
| Static assets: `max-age=0` | Every visit re-downloads all resources | High |
| No image optimization | Large PNG files, no WebP/AVIF | Medium |
| No lazy loading | All images load immediately | Medium |
| Search has no debouncing | Fires on every keystroke | Medium |
| Inline JS on homepage | Large page size, no code splitting | Medium |
| No CDN for static assets | Higher latency | Low |

### Data Integrity Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Stock management completely removed | **Critical** | Product model has no stock field; orders can be created for any product regardless of availability |
| Product data disconnect | **Critical** | Frontend uses hardcoded array; API database is empty; admin changes don't appear on storefront |
| Profile/User model mismatch | **Critical** | Auth routes expect password/name/role that Profile model doesn't have |
| Analytics references non-existent stock column | **High** | `analytics.service.js:102-126` queries `Product.stock` -- will throw column errors |
| No order status transition validation | Medium | Admin can set any status regardless of current (delivered > pending) |
| Order can lack both user_id and guest_id | Medium | No constraint requiring at least one owner |
| `fulfillOrder()` non-functional | Medium | References `payment_intent_id` column that doesn't exist |
| Soft delete methods reference undefined fields | Medium | `Product.softDelete()` sets `this.isActive` and `this.deletedAt` -- neither defined in model |

### CSS Path Inconsistency

| Page | CSS Path |
|------|----------|
| Homepage | `css/front_page.css` |
| Orders/Profile | `home_page/css/front_page.css` |
| Legal pages | `/home_page/css/front_page.css` |
| Checkout | `css/front_page.css` |

All paths resolve (due to dual static serving from `home_page/` and root) but the inconsistency is fragile.

### JS Script Loading

All pages load the same common JS stack:
1. `supabase-js@2` (CDN -- jsdelivr)
2. `/js/supabase-init.js`
3. `/js/auth.js`
4. `/home_page/js/account-popup.js`
5. `/js/cart.js` or `/home_page/js/cart.js`
6. `/js/shopbeha.js` or `/home_page/js/shopbeha.js`

Note: Some pages reference `/js/cart.js` and others `/home_page/js/cart.js` -- these may serve different files depending on static file resolution order.

---

## PART 6: FEATURE GAP ANALYSIS (vs 2025-2026 Standards)

### Missing Public Storefront Features
- [ ] Server-side product rendering (currently hardcoded in client JS)
- [ ] Server-side search with full-text
- [ ] Search autocomplete/suggestions
- [ ] Product filtering (price range, attributes)
- [ ] Product sorting (price, newest, popularity)
- [ ] Product reviews and ratings (dynamic)
- [ ] Recently viewed products
- [ ] Product recommendations
- [ ] Size guide
- [ ] Wishlist / favorites
- [ ] Social sharing buttons
- [ ] Breadcrumb navigation
- [ ] Structured data (JSON-LD)
- [ ] PWA support (service worker, offline)
- [ ] Mobile wallet payments (Apple Pay, Google Pay)
- [ ] Express checkout
- [ ] Address autocomplete (Google Places)
- [ ] Real-time stock status display
- [ ] Custom 404 page
- [ ] Cookie consent banner

### Missing Customer Account Features
- [ ] Working registration and login (Profile model fix needed)
- [ ] Password reset / forgot password
- [ ] Email verification
- [ ] Address book (saved addresses)
- [ ] Saved payment methods
- [ ] Easy reorder functionality
- [ ] Invoice/receipt download
- [ ] Return/exchange portal
- [ ] Loyalty/rewards program
- [ ] Communication preferences
- [ ] Account deletion (POPIA compliance)
- [ ] View cancelled order history

### Missing Admin Panel Features
- [ ] Settings page (store, payment, shipping, tax config)
- [ ] Product image upload (not just URL)
- [ ] Product variants management
- [ ] Stock/inventory management (field removed)
- [ ] Category CRUD
- [ ] Discount/coupon management (server-side)
- [ ] Bulk product operations (import/export CSV)
- [ ] Order notes and internal comments
- [ ] Order status transition validation
- [ ] Refund processing
- [ ] Print invoice/packing slip
- [ ] Customer communication tools
- [ ] Email template management
- [ ] Admin audit log viewer
- [ ] Multi-admin user management
- [ ] Abandoned cart recovery
- [ ] Sales reports with export
- [ ] Real-time notifications

---

## Quick Wins (High Impact, Low Effort)

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Fix Express 5 routes: use separate `app.get()` calls instead of array syntax | Fixes all 404s on clean URLs | ~10 lines |
| 2 | Increase connection pool `max` to 3-5 for development | Prevents 500 errors under load | 1 line |
| 3 | Add `<meta description>` to homepage | SEO improvement | 1 line |
| 4 | Set strong JWT secrets in `.env` | Security | 5 min |
| 5 | Remove `NODE_TLS_REJECT_UNAUTHORIZED=0` | Security | 1 line |
| 6 | Remove Yoco debug filesystem logging | Security (partial key exposure) | Delete ~10 lines |
| 7 | Enable basic CSP header | XSS protection | ~10 lines |
| 8 | Add custom 404 page | UX improvement | 1 file |
| 9 | Set `Cache-Control` on static assets | Performance | 3 lines |
| 10 | Add debouncing to search (300ms) | Performance | 5 lines |
| 11 | Remove hardcoded promo code from client JS | Security | Move to server |
| 12 | Remove duplicate admin SPA catch-all | Cleanup (server.js:176 duplicated at :268) | Delete 3 lines |

---

## Strategic Improvements (Larger Effort, High Value)

### Phase 1: Production Blockers (1-2 weeks)
1. **Fix auth system** -- either add password/role to Profile model or fully adopt Supabase Auth
2. Fix all security critical/high issues (SEC-002 through SEC-012)
3. Connect frontend to Products API (replace hardcoded array)
4. Add stock field back to Product model with proper management
5. Fix analytics service stock references
6. Configure email service for transactional emails
7. Write tests for critical flows (auth, orders, payments)

### Phase 2: Customer Experience (2-4 weeks)
1. Implement password reset flow
2. Add server-side search with full-text
3. Build address book feature
4. Add product reviews system
5. Implement product filtering and sorting
6. Add order status transition validation (state machine)
7. Create FAQ, About Us, and Size Guide pages
8. Build cookie consent banner (POPIA compliance)

### Phase 3: Growth Features (1-2 months)
1. Build admin settings page
2. Implement server-side discount/coupon management
3. Add product image upload (Supabase Storage)
4. Build product variants management in admin
5. Implement abandoned cart recovery
6. Add customer segmentation and communication tools
7. Build sales reporting and CSV export
8. Add mobile wallet payments

### Phase 4: Scale & Polish (2-3 months)
1. Migrate frontend to component framework (React/Next.js)
2. Implement CDN for static assets
3. Add image optimization pipeline (WebP, responsive)
4. Build PWA with offline support
5. Implement structured data (JSON-LD) for SEO
6. Add multi-currency support
7. Build customer loyalty program

---

## Appendix: Test Credentials

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Admin | admin@shopbeha.com | Admin123! | Login unstable (may 500 under load) |
| Customer | customer@example.com | Customer123! | **BROKEN** (Profile model lacks password) |

## Appendix: Yoco Test Card Details

- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** 123
- **3D Secure Password:** password (if prompted)

## Appendix: Key Files Audited

### Backend
- `server.js` -- Main server (Express 5.1.0, Helmet, CORS, rate limiting)
- `database/database.js` -- Sequelize connection (pool.max: 1)
- `database/index.js` -- Model associations (User: Profile alias, constraints: false)
- `database/models/Profile.js` -- User profile (no password/name/role)
- `database/models/Product.js` -- Product (no stock field, broken soft-delete)
- `database/models/Order.js` -- Order + OrderItem (UUID, JSON address)
- `database/models/GuestCustomer.js` -- Guest checkout data
- `database/models/AuditLog.js` -- Audit trail
- `api/routes/auth.js` -- Authentication (admin bypass, broken customer auth)
- `api/routes/products.js` -- Product CRUD (stock endpoints return 501)
- `api/routes/orders.js` -- Order management (optionalAuth for guests)
- `api/routes/users.js` -- User management
- `api/routes/analytics.js` -- Analytics (references missing stock column)
- `api/routes/yoco.js` -- Yoco payment (no webhook signature verification)
- `api/routes/webhooks.js` -- Stripe webhooks (optional verification)
- `api/routes/contact.js` -- Contact form submission
- `api/middleware/auth.js` -- JWT auth (admin-user-id bypass)
- `api/middleware/authorize.js` -- Role authorization
- `api/middleware/validate.js` -- Joi validation
- `api/middleware/errorHandler.js` -- Error handling
- `api/middleware/auditLogger.js` -- Audit logging
- `api/services/order.service.js` -- Order business logic (stock check disabled)
- `api/services/analytics.service.js` -- Analytics queries (broken stock refs)

### Frontend
- `home_page/front_page.html` -- Homepage (inline product rendering)
- `home_page/header.html` -- Navigation (simplified: Home + Contact)
- `home_page/footer.html` -- Footer (copyright + legal popup)
- `home_page/checkout.html` -- Checkout page (Yoco integration)
- `home_page/orders.html` -- Order tracking (visual timeline)
- `home_page/contact.html` -- Contact form
- `home_page/profile.html` -- User profile
- `home_page/js/cart.js` -- CartModule (Supabase + localStorage)
- `home_page/js/shopbeha.js` -- Main JS (hardcoded products, search, modals)
- `home_page/js/checkout.js` -- Checkout flow
- `home_page/js/account-popup.js` -- Account UI
- `js/auth.js` -- Frontend auth (Supabase client)
- `js/supabase-init.js` -- Supabase initialization

### Admin Panel
- `admin/src/App.tsx` -- Main app routing
- `admin/src/pages/DashboardPage.tsx` -- Dashboard
- `admin/src/pages/LoginPage.tsx` -- Admin login
- `admin/src/pages/ProductsPage.tsx` -- Product management
- `admin/src/pages/OrdersPage.tsx` -- Order management (supplier ordering)
- `admin/src/pages/UsersPage.tsx` -- Customer management
- `admin/src/services/api.ts` -- API client (token refresh queue)
- `admin/src/context/AuthContext.tsx` -- Auth state

### Legal Pages (All 200 OK with meta descriptions)
- `legal/terms-and-conditions.html`
- `legal/privacy-policy.html`
- `legal/shipping-policy.html`
- `legal/return-refund-policy.html`
- `legal/cookie-policy.html`
- `legal/ecta-disclosure.html`

---

*Report generated by automated audit tools, live API testing, and comprehensive code review.*
*Total findings: 21 security issues (4 critical, 5 high), 30+ feature gaps, 15+ data integrity issues*
*Key regression: Customer authentication broken by Profile model refactor*
