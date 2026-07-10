# Cloudflare Pages Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the public site and its visit counter from Vercel-oriented setup to Cloudflare Pages, while keeping the local admin workflow intact.

**Architecture:** The public site remains a static HTML/CSS/JS application. Cloudflare Pages serves the static files and owns the custom domain, while `/api/counter` becomes a Cloudflare Pages Function backed by Cloudflare D1 so the visible visitor count still works. The local admin app stays a local tool, but its labels, links, and deployment notes will all refer to Cloudflare Pages instead of Vercel.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Cloudflare Pages, Cloudflare Pages Functions, Cloudflare D1, Node.js for local validation.

## Global Constraints

- Keep the public site as a static HTML/CSS/JavaScript app.
- Preserve the `/api/counter` endpoint path used by the homepage visitor counter.
- Keep the local admin server at `http://localhost:8787/admin.html`.
- Keep all user-facing copy in Chinese and English aligned where both already exist.
- Do not introduce framework migration work; only switch hosting and counter plumbing.

---

### Task 1: Remove Vercel-oriented site configuration and replace it with Cloudflare Pages guidance

**Files:**
- Modify: `README.md`
- Modify: `admin.html`
- Modify: `scripts/admin-server.mjs`
- Modify: `启动后台.command`
- Modify: `docs/CHANGELOG.md`
- Create: `_redirects`
- Delete: `vercel.json`

**Interfaces:**
- Consumes: current deployment and admin workflow copy
- Produces: Cloudflare Pages-oriented deployment instructions and dashboard links

- [ ] **Step 1: Update the written guidance**

Replace Vercel deployment language in `README.md` with Cloudflare Pages language, including the publish flow and the project summary at the top.

- [ ] **Step 2: Update the admin entry points**

Replace Vercel dashboard links and Vercel-specific labels in `admin.html` and `scripts/admin-server.mjs` with Cloudflare Pages wording.

- [ ] **Step 3: Update the local launcher text**

Change `启动后台.command` so the startup banner describes Cloudflare Pages as the publishing target rather than Vercel.

- [ ] **Step 4: Remove the obsolete Vercel config file**

Create `_redirects` with the existing site rewrites and delete `vercel.json` so the repository no longer advertises Vercel routing rules.

- [ ] **Step 5: Add the changelog note**

Add a changelog entry that states the site has been switched from Vercel wording/configuration to Cloudflare Pages wording/configuration.

- [ ] **Step 6: Validate the text-only changes**

Run `git diff --check` and inspect the modified files for leftover `Vercel` references outside the archive folder.

### Task 2: Move the visitor counter to a Cloudflare Pages Function

**Files:**
- Create: `functions/api/counter.js`
- Modify: `api/counter.js`
- Modify: `js/script.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: the homepage `fetch('/api/counter', { method: 'POST' })` call
- Produces: a Cloudflare Pages Function response at `/api/counter` with `{ count }`

- [ ] **Step 1: Write the Cloudflare function**

Create `functions/api/counter.js` as a Pages Function that accepts `GET`, `POST`, and `OPTIONS`, returns JSON, and reads/writes the stored counter through a Cloudflare D1 binding named `VISITOR_COUNTER_DB`.

- [ ] **Step 2: Keep the front-end API stable**

Leave the homepage fetch path in `js/script.js` unchanged so the visible visitor counter still points to `/api/counter`.

- [ ] **Step 3: Deprecate the old Node handler**

Update `api/counter.js` to be clearly deprecated or remove it if the Cloudflare function fully replaces it, so the repository no longer presents the Node/Upstash version as the active implementation.

- [ ] **Step 4: Document the Cloudflare setup**

Add a short section in `README.md` explaining that the counter now needs a Cloudflare D1 binding and that the public site no longer depends on Upstash Redis.

- [ ] **Step 5: Validate the function code**

Run `node --check` on any JavaScript files changed in this task and confirm the visitor counter fetch path still exists in `js/script.js`.

### Task 3: Rename asset-source labels from Vercel to Cloudflare

**Files:**
- Modify: `data/global.js`
- Modify: `js/data.js`
- Modify: `js/admin.js`
- Modify: `js/global.js`
- Modify: `js/script.js`
- Modify: `admin.html`

**Interfaces:**
- Consumes: the `assetSource` setting already persisted in site data
- Produces: Cloudflare-aligned labels and defaults for same-origin asset loading

- [ ] **Step 1: Change the default value**

Switch the persisted default `assetSource` from `vercel` to `cloudflare` in both default data files.

- [ ] **Step 2: Update the UI copy**

Replace “Vercel / 同域” wording in the admin UI and diagnostics with Cloudflare wording while keeping the CDN option intact.

- [ ] **Step 3: Update the runtime label logic**

Update `js/admin.js`, `js/global.js`, and `js/script.js` so the same-origin asset branch uses the `cloudflare` token and still falls back to relative resources when no CDN is selected.

- [ ] **Step 4: Validate the UI strings**

Run a repository search for `Vercel` and confirm that only archive/history references remain.
