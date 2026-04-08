# BRD Clarification Questions
**Re:** AI Image Generator for Sportsbook Promotions
**Date:** April 8, 2026

---

Hi team,

Thanks for sharing the BRD — the direction looks solid. Before we move forward, I have a few clarification questions to make sure we're aligned on scope:

---

### 1. "Automate image creation"
Can you clarify what "automate" means here? Are we talking about:
- **On-demand generation** — a user clicks a button and gets an image (this is how it works now)?
- **Scheduled/batch generation** — images are auto-generated on a schedule (e.g., every 5 minutes, or daily for upcoming promotions)?
- **Triggered automation** — images are generated automatically when a new promotion is created in the system?

This changes the architecture significantly, so we want to understand the intent.

---

### 2. "Ensure brand consistency"
We already have a brand color-lock system that enforces brand palettes in generated images. Has there been a specific case where the output didn't match the brand? For example:
- Wrong colors coming through?
- Brand character/mascot looking different each time?
- Missing logos or typography?

Knowing what "inconsistency" you've experienced will help us target the right fix.

---

### 3. "Reduce turnaround time"
Is this referring to:
- **The AI generation speed** (currently takes ~10-30 seconds per image)?
- **The overall workflow time** from brief to final banner (the manual back-and-forth between teams)?
- **Both?**

If it's the workflow time, the current tool already cuts that down significantly. If it's generation speed, there are trade-offs between speed and quality we should discuss.

---

### 4. "Support mobile & desktop formats"
This is clear and we already support multiple aspect ratios (Portrait, Square, Landscape) with various resolutions. Just to confirm:
- Do you have specific dimension requirements for mobile and desktop? (e.g., 1080x1920 for mobile stories, 1920x1080 for desktop banners)
- Are there exact file size limits we need to hit?

---

### 5. "Build same image for Arabic version"
This one we need the most detail on. A few scenarios:
- **Same image, Arabic text overlay?** — e.g., generate the base image, then add Arabic promotional text on top? (Note: AI models can't render Arabic text reliably, so we'd add text as a separate layer)
- **Mirrored layout for RTL?** — flip the composition so it reads right-to-left visually?
- **Separate Arabic-themed image?** — generate a culturally tailored version using Arabic-language prompts?
- **All of the above?**

Also — who provides the Arabic copy? Does the user type it in, or do we auto-translate from English?

---

Looking forward to your responses so we can scope this properly and move to planning.
