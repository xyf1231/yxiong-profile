# Mobile Pinch Zoom Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep mobile pinch zoom available for zooming out while blocking zoom-in behavior on iOS across the public site.

**Architecture:** Add a tiny iOS-specific gesture guard directly into the shared HTML head templates so the behavior is active on every page as soon as the document loads. Keep the existing viewport meta tag unchanged so normal mobile layout sizing still works, and apply the same guard to generated news pages so exported content matches the live site.

**Tech Stack:** Static HTML, vanilla JavaScript, existing site templates, `docx-converter.html` HTML string templates.

## Global Constraints

- Preserve the existing `meta name="viewport"` value: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Do not disable zoom globally; block zoom-in gestures only.
- Keep the change compatible with iOS Safari and harmless on other browsers.
- Keep the behavior consistent between authored pages and generated news pages.

---

### Task 1: Add the iOS zoom guard to the shared page heads

**Files:**
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/index.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/profile.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/results.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/honors.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/activities.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/admin.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/page-editor.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/docx-converter.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/letter.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/letters-build/letter.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/glow-lab.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/resources/news/nature-electronics-光纤端面集成-原位读懂纤内光-指纹.html`
- Modify: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站/resources/news/光纤-铌酸锂集成-亚微秒宽带可调谐光纤集成滤波器和扫频光源.html`

**Interfaces:**
- Consumes: the existing viewport meta tag and iOS gesture events.
- Produces: a small inline guard that prevents zoom-in gestures while allowing zoom-out gestures.

- [ ] **Step 1: Add the guard snippet immediately after the viewport meta tag**

```html
<script>
  (function () {
    if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    document.addEventListener(
      "gesturechange",
      function (event) {
        var scale = typeof event.scale === "number" ? event.scale : 1;
        if (scale > 1) event.preventDefault();
      },
      { passive: false }
    );
  })();
</script>
```

- [ ] **Step 2: Verify the head markup still keeps the existing viewport meta untouched**

Run: `rg -n "meta name=\"viewport\"|gesturechange" index.html profile.html results.html honors.html activities.html admin.html page-editor.html docx-converter.html letter.html letters-build/letter.html glow-lab.html resources/news/*.html`

Expected: each page still has the same viewport meta line, and each page now contains `gesturechange`.

- [ ] **Step 3: Update the generated news-page template in `docx-converter.html`**

Run: confirm the generated string includes the same guard before the closing `</head>`.

Expected: future generated pages match the authored pages.

