# BRD Clarification — Consolidated Summary
**Re:** AI Image Generator for Sportsbook Promotions
**Date:** April 8, 2026
**Status:** Client responded — ready for alignment review

---

## Critical Discovery

**The client has NOT seen or tested the current Prompt Generator tool.** This means:
- They don't know what already exists
- Some of their requirements are already built
- Some of their requirements differ from what we built
- **We should demo the current tool to them before building anything new**

---

## What We Now Understand (From Client Responses)

### The Core Use Case
The client's team receives **high volumes of banner requests with short deadlines**. Designers can't keep up. They want a tool where a user types a prompt like:

> *"Create a Basketball banner for a versus match adding player images towards right end and left end of the banner so that I can add some content manually at the center."*

...and gets back banners in **multiple sizes at once**, ready to upload to their CMS.

**Banners have NO text on them.** All text/content is added manually through the CMS after download.

---

### Requirement-by-Requirement Summary

| # | Requirement | What Client Wants | What We Have Now | Gap |
|---|---|---|---|---|
| 1 | **Input method** | Free-text prompt (user describes what they want in plain English) | Structured wizard (sport, player, background, etc.) | We have both — wizard generates a narrative prompt. But client may prefer a simpler free-text box too |
| 2 | **Multiple dimensions** | Generate same image in multiple sizes at once (e.g., 2588x312, 1440x312, 1200x600, 720x600) | Single aspect ratio per generation | **NEW** — need multi-size batch generation |
| 3 | **Exact dimensions** | Pixel-perfect, strict compliance | Aspect ratio presets only | **NEW** — need exact pixel resize/crop post-processing |
| 4 | **File size** | Under 512KB (CMS requirement) | No file size control | **NEW** — need compression to target size |
| 5 | **Arabic version** | Mirror/flip the image (player on right → player on left). YES/NO toggle | Not built | **NEW** — horizontal flip of generated image + toggle in UI |
| 6 | **Brand consistency** | Color codes & themes (LuckyVibe = beach, Roosterbet = fire). Elena to provide full guidelines | Brand color-lock system with 9 brands | **Partial** — colors done, themes partially done, waiting on Elena for full guidelines |
| 7 | **Preview & regenerate** | Preview to verify, regenerate if wrong | Already have preview + regenerate | **DONE** |
| 8 | **Download** | PNG & JPEG formats. Batch download all sizes as separate files | No download feature | **NEW** — download button with format selection + batch |
| 9 | **Versioning** | Mix elements from different versions (e.g., "use player from v1 + background from v2 to generate new image") | Not built | **NEW & COMPLEX** — this is essentially image compositing, not simple version history |
| 10 | **Optimization** | Auto-compress to file size, enforce dimensions, upscale/sharpen, brand compliance check | Partial (generation at various resolutions) | **NEW** — post-processing pipeline needed |
| 11 | **Human review** | Review step before finalizing | Not built (user can just regenerate) | **NEEDS DISCUSSION** — is regenerate enough, or do they need a formal approval flow? |
| 12 | **Mobile + desktop** | Generate both at same time from one prompt | One at a time | Covered by #2 (multi-size batch) |
| 13 | **No text on banners** | Banners are image-only, text added via CMS | Our tool sometimes includes text direction in prompts | Minor adjustment to prompt logic |

---

## 3 Big Takeaways

### 1. The client wants SIMPLER input than what we built
Our Sports Wizard is a 5-step structured form. The client wants to **type a free-text prompt and get images**. The wizard is still valuable (it helps build better prompts), but we should also offer a simple free-text mode.

### 2. Multi-size batch generation is the killer feature they need
They want to type ONE prompt and get the SAME image in 4+ different dimensions (2588x312, 1440x312, 1200x600, 720x600) — all under 512KB, downloadable as a batch. This is the biggest new feature.

### 3. The "versioning" they want is actually image compositing
They don't want simple version history. They want to **mix and match elements from different generated images** — "take the player from generation 1 and the background from generation 2." This is significantly more complex than version tracking. It's essentially an image editing/compositing feature.

---

## Recommended Next Steps

1. **Demo the current tool to the client** — They haven't seen it. A 15-minute demo would save weeks of miscommunication. They may realize half their requirements are already met.

2. **Get brand guidelines from Elena** — This is a blocker for the brand consistency module.

3. **Clarify the versioning/compositing requirement** — Ask the client: "Mixing elements from different images (player from v1 + background from v2) is an advanced compositing feature. Would it be acceptable to start with simple regeneration and version history, then add element mixing in a later phase?"

4. **Confirm the human review flow** — Is the current regenerate button enough? Or do they need a formal approve/reject workflow with multiple reviewers?

---

## Priority Order (Suggested)

| Priority | Feature | Why |
|---|---|---|
| P0 | Demo current tool to client | Avoid building what already exists |
| P0 | Multi-size batch generation | Core need — their main pain point |
| P0 | Exact dimension + file size control (512KB) | CMS requirement, non-negotiable |
| P1 | Download (PNG/JPEG, batch) | Completes the workflow |
| P1 | Arabic mirror toggle (flip image) | Simple — just horizontal flip |
| P1 | Free-text prompt input option | Client's preferred input method |
| P2 | Post-processing pipeline (upscale, sharpen, compress) | Quality improvement |
| P2 | Human review step | Workflow enhancement |
| P3 | Version history with element compositing | Complex — phase 2 candidate |

---

## Dependencies / Blockers

| Blocker | Owner | Status |
|---|---|---|
| Brand guidelines document | Elena (Design Team) | Not yet shared |
| Client demo of current tool | Us | Not yet scheduled |
| Clarification on versioning scope | Client | Needs follow-up question |
| Clarification on human review flow | Client | Needs follow-up question |
