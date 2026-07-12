# Visitor Counter IP Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Count a visitor once per IP address within a 12-hour window.

**Architecture:** Keep the existing total counter table and add a second table that stores the last counted timestamp for each IP. On each `POST /api/counter` request, read the client IP, compare it against the stored timestamp, and only increment the total when the previous count is older than 12 hours.

**Tech Stack:** Cloudflare Pages Functions, D1, vanilla JavaScript, SQLite-compatible SQL

## Global Constraints

- Preserve the existing visitor counter display and API response shape for the frontend.
- Count the same IP at most once per 12-hour window.
- Keep the change limited to the counter function unless a helper is needed for clarity.

---

### Task 1: Add IP window dedupe to the counter API

**Files:**
- Modify: `functions/api/counter.js`

**Interfaces:**
- Consumes: `Request`, `env` with a D1 binding, `visitor_counter` table
- Produces: `GET` still returns `{ count }`; `POST` returns `{ count, counted }`

- [ ] **Step 1: Update the failing behavior in code**

```javascript
// POST should only increment when the same IP has not been counted in the last 12 hours.
```

- [ ] **Step 2: Implement the 12-hour IP window**

```javascript
const WINDOW_MS = 12 * 60 * 60 * 1000;
```

- [ ] **Step 3: Verify the endpoint still returns the total count**

Run: `node --check functions/api/counter.js`
Expected: No syntax errors.

- [ ] **Step 4: Confirm the frontend does not need changes**

```javascript
// The existing frontend already reads the `count` field and can ignore `counted`.
```

