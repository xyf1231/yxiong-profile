# Admin Workbench UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the desktop admin page into a clearer workbench-style layout with stronger sections, calmer spacing, and a more deliberate visual hierarchy.

**Architecture:** Keep the current backend logic intact and change only the presentation layer. Use the existing `admin.html` structure as the source of truth, then refine it with a unified visual system in `css/admin.css` so the sidebar, hero, editor, list, deployment console, and backup areas read as separate but related work zones.

**Tech Stack:** HTML, CSS, vanilla JavaScript.

## Global Constraints

- Desktop-first only; no mobile-specific layout work is required for this change.
- Preserve all existing admin features and DOM ids used by `js/admin.js`.
- Keep the dark admin theme, but increase contrast between sections and improve spacing consistency.
- Avoid changing content copy unless it is needed for layout clarity.

---

### Task 1: Establish the workbench visual system

**Files:**
- Modify: `admin.html`
- Modify: `css/admin.css`

**Interfaces:**
- Consumes: existing admin section wrappers, sidebar tabs, hero blocks, panels, and button classes.
- Produces: a tighter desktop layout with clearer section boundaries, updated spacing, and consistent card treatment.

- [ ] **Step 1: Define the visual direction in code**

Use the existing admin structure and make the following presentation changes:

```css
:root {
  --admin-surface: rgba(9, 12, 20, 0.72);
  --admin-surface-strong: rgba(255, 255, 255, 0.06);
  --admin-surface-soft: rgba(255, 255, 255, 0.03);
  --admin-border: rgba(255, 255, 255, 0.08);
  --admin-border-strong: rgba(255, 255, 255, 0.14);
  --admin-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
}

.admin-body {
  background:
    radial-gradient(circle at top left, rgba(41, 151, 255, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(48, 209, 88, 0.08), transparent 24%),
    linear-gradient(180deg, #05070d 0%, #090d16 100%);
  color: #fff;
}

.admin-layout {
  min-height: 100vh;
  grid-template-columns: 248px minmax(0, 1fr);
}

.admin-sidebar,
.editor-panel,
.json-panel,
.admin-sync-panel,
.deploy-console,
.deploy-console-pane,
.deploy-side-panel,
.deploy-log-panel,
.deploy-backup-panel {
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  backdrop-filter: blur(20px) saturate(1.2);
}
```

- [ ] **Step 2: Rework the first-screen hierarchy**

Update the hero, coverage area, and action cluster so the top of the page feels like a dashboard rather than a stack of unrelated blocks:

```css
.admin-main {
  padding: 28px;
}

.admin-shell {
  display: grid;
  gap: 24px;
}

.admin-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid var(--admin-border);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
    var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.coverage-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.coverage-item {
  min-height: 118px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface-soft);
}
```

- [ ] **Step 3: Make the content workspace read as two distinct columns**

Strengthen the editor/list split and unify the supporting panels so the content area reads like a workbench:

```css
.cms-primary {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.9fr);
  gap: 20px;
}

.cms-editor-col,
.cms-list-col {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.cms-list-col .item-list {
  max-height: 72vh;
  border: 1px solid var(--admin-border);
  border-radius: 18px;
  overflow-y: auto;
}
```

- [ ] **Step 4: Make the admin controls feel intentional**

Update buttons, inputs, tabs, status pills, and list rows so they share the same sizing and hover language:

```css
.admin-button,
.deploy-btn,
.deploy-link-btn,
.tab-button,
.lang-tab {
  border-radius: 12px;
}

.tab-button[aria-selected="true"] {
  background: rgba(255, 255, 255, 0.96);
  color: #05070d;
}

.managed-item,
.backup-item,
.deploy-mini-item,
.deploy-status-chip {
  border-radius: 16px;
}
```

### Task 2: Refine the version console and backup workspace

**Files:**
- Modify: `css/admin.css`

**Interfaces:**
- Consumes: deployment and backup sections in `admin.html`.
- Produces: clearer console-style panels with stronger separation between action groups and status readouts.

- [ ] **Step 1: Keep the deploy cards and buttons on the same dark glass palette as the rest of the workbench**

```css
.deploy-console,
.deploy-console-pane,
.deploy-side-panel,
.deploy-log-panel,
.deploy-backup-panel {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
}
```

- [ ] **Step 2: Keep backup history readable and visually separated from the action row**

```css
.backup-item,
.backup-empty,
.deploy-mini-item,
.deploy-log {
  border-radius: 16px;
}
```

- [ ] **Step 3: Leave all ids used by `js/admin.js` untouched**

Run a quick sanity check after editing:

```bash
node scripts/check-site.mjs
```

### Task 3: Verify the desktop layout visually and clean up edge cases

**Files:**
- Modify: `admin.html`
- Modify: `css/admin.css`

**Interfaces:**
- Consumes: the finished desktop-only admin layout.
- Produces: a checked visual pass with no broken ids, no layout regressions, and no unexpected overflow.

- [ ] **Step 1: Review the final desktop spacing and section alignment in Chrome at 1600 px wide**

Open:

```text
file:///Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/admin.html
```

- [ ] **Step 2: Confirm the site checker passes**

Run:

```bash
node scripts/check-site.mjs
```

- [ ] **Step 3: Save the final state**

Verify there are no accidental edits outside the admin UI files before finishing.
