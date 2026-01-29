# CLAUDE.md - Code Generation Guidelines

This document defines the standards and guidelines that all generated code must adhere to for the **Bra Shop** project.

---

## Technology Stack

*   **Runtime**: Node.js (Latest LTS)
*   **Framework**: Express.js
*   **Database**: PostgreSQL (via Supabase)
*   **ORM**: Sequelize
*   **Validation**: Joi
*   **Frontend**: EJS (Legacy), React (Admin Panel)
*   **Hosting**: Vercel (Serverless functions)

---

## Core Guidelines

### 1. Architecture & Structure
*   **Layered Architecture**: Follow `Routes` -> `Controllers` -> `Services` -> `Data Access`.
*   **Monorepo-ish Structure**:
    *   Root: API & Legacy Frontend
    *   `/admin`: Modern React Admin SPA
*   **Vercel Compatibility**: Code must run effectively in a serverless environment.
    *   **Stateless**: No in-memory state that persists between requests.
    *   **Cold Starts**: Minimize initialization logic outside the handler.
    *   **DB Connections**: Manage connection pooling strictly (low `max` pool count).

### 2. Code Style & Quality
*   **Linting**: Use ESLint and Prettier. Run `npm run lint` before committing.
*   **Modern JS**: Use `const`/`let`, async/await, arrow functions, and destructuring.
*   **Naming**:
    *   Variables/Functions: `camelCase`
    *   Classes/Models: `PascalCase`
    *   Constants: `UPPER_SNAKE_CASE`
    *   Files: `kebab-case.js` or `camelCase.js` (maintain consistency with existing).

### 3. Testing (TDD)
*   **Framework**: Jest + Supertest.
*   **Requirement**: All new logic must have associated unit or integration tests.
*   **Process**:
    1.  **Red**: Write a failing test for the new feature/fix.
    2.  **Green**: Write minimal code to pass the test.
    3.  **Refactor**: Improve structural quality without breaking validation.

### 4. Security
*   **Input Validation**: Validate **all** input using `Joi` schemas before processing.
*   **Authentication**: standard JWT or Session management (via Supabase or local).
*   **SQL Injection**: Always use Sequelize methods or bound parameters. Never string concatenation.
*   **Headers**: Ensure `helmet` is active.
*   **Rate Limiting**: Apply rate limits to all public endpoints.

---

## Database Guidelines (Supabase/Sequelize)

### Connection Pooling (Critical)
*   **Production**: Set `pool.max` to `1` or `2` to prevent exhausting Supabase connection limits in Vercel's serverless environment.
*   **Transaction Pooler**: Use the Supabase Transaction Pooler (port 6543) if possible.

### Models
*   Define specific types for all attributes.
*   Use migrations for all schema changes (`npx sequelize-cli db:migrate`).
*   Timestamps: Ensure `createdAt` and `updatedAt` are managed.

---

## Commands for Assistant

*   **Start Dev Server**: `npm run dev`
*   **Start Admin Dev**: `npm run admin:dev`
*   **Lint Code**: `npm run lint` (if available)
*   **Run Tests**: `npm test`

---

## Definition of Done
- [ ] Code follows specific linting/formatting rules.
- [ ] Unit/Integration tests written and passing.
- [ ] Input validation (Joi) implemented for new endpoints.
- [ ] Database migrations created (if schema changed).
- [ ] Verified locally with `npm run dev`.
- [ ] No extraneous console logs (use `logger`).
