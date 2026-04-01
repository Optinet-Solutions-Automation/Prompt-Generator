from playwright.sync_api import sync_playwright
import time

SCREENSHOTS_DIR = "C:/Users/User/Prompt-Generator/screenshots"
BASE_URL = "https://prompt-generator-eight-umber.vercel.app"

def save(page, name):
    path = f"{SCREENSHOTS_DIR}/{name}.png"
    page.screenshot(path=path, full_page=False)
    print(f"[screenshot] {path}")
    return path

def log_buttons(page, label=""):
    btns = page.query_selector_all("button")
    print(f"\n--- Buttons on page {label} ---")
    for b in btns:
        try:
            txt = b.inner_text().strip()
            cls = b.get_attribute("class") or ""
            if txt or "icon" in cls.lower():
                print(f"  '{txt}' | class='{cls[:60]}'")
        except:
            pass
    print("---")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.set_default_timeout(15000)

        # ── 1. Load homepage ─────────────────────────────────────────────────
        print("[step 1] Loading homepage…")
        page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        # Wait for React to hydrate
        page.wait_for_selector("button", timeout=15000)
        time.sleep(2)
        save(page, "01_homepage")

        # ── 2. Click "Image Library" tab ─────────────────────────────────────
        print("[step 2] Looking for Image Library tab…")
        tab_selectors = [
            "button:has-text('Image Library')",
            "a:has-text('Image Library')",
            "[role='tab']:has-text('Image Library')",
            "text=Image Library",
        ]
        tab_clicked = False
        for sel in tab_selectors:
            try:
                tab = page.wait_for_selector(sel, timeout=5000)
                if tab:
                    tab.click()
                    print(f"  Clicked tab: {sel}")
                    tab_clicked = True
                    break
            except:
                pass

        if not tab_clicked:
            log_buttons(page, "— no Image Library tab found")
            save(page, "02_no_tab")
        else:
            time.sleep(3)
            save(page, "02_image_library_tab")
            print("[step 2] Image Library tab opened.")

        # ── 3. Find and click an image thumbnail ─────────────────────────────
        print("[step 3] Looking for image thumbnails…")
        page.wait_for_timeout(2000)

        # The gallery likely renders <img> tags after network calls settle
        thumbnail = None
        # Broad selectors in order of specificity
        for sel in [
            "[class*='gallery'] img",
            "[class*='library'] img",
            "[class*='card'] img",
            "[class*='grid'] img",
            "[class*='prompt'] img",
            "article img",
            "li img",
            "img[src*='airtable']",
            "img[src*='webp']",
            "img[src*='jpg']",
            "img[src*='png']",
            "img",
        ]:
            els = page.query_selector_all(sel)
            visible = []
            for el in els:
                try:
                    box = el.bounding_box()
                    if box and box["width"] > 30 and box["height"] > 30:
                        visible.append(el)
                except:
                    pass
            if visible:
                print(f"  Found {len(visible)} visible images with: {sel}")
                thumbnail = visible[0]
                break

        if not thumbnail:
            print("  No image thumbnails found. Page HTML snippet:")
            # Look for any clickable elements that might be gallery cards
            all_clickable = page.query_selector_all("a, button, [role='button'], [onclick], [class*='card'], [class*='item']")
            for el in all_clickable[:20]:
                try:
                    txt = el.inner_text().strip()[:80]
                    cls = (el.get_attribute("class") or "")[:60]
                    print(f"  clickable: '{txt}' | class='{cls}'")
                except:
                    pass
            save(page, "03_no_thumbnail")
            browser.close()
            return

        # Scroll into view and click
        thumbnail.scroll_into_view_if_needed()
        thumbnail.click()
        time.sleep(3)
        save(page, "03_after_click_thumbnail")
        print("[step 3] Clicked thumbnail.")

        # ── 4. Check if modal opened ──────────────────────────────────────────
        print("[step 4] Checking for modal…")
        modal_selectors = [
            "[role='dialog']",
            "[class*='modal']",
            "[class*='Modal']",
            "[class*='overlay']",
            "[class*='lightbox']",
        ]
        modal = None
        for sel in modal_selectors:
            try:
                modal = page.wait_for_selector(sel, timeout=5000)
                if modal:
                    print(f"  Modal found: {sel}")
                    break
            except:
                pass

        if not modal:
            print("  Modal not detected by class. Checking full page state…")
            log_buttons(page, "after thumbnail click")

        save(page, "04_modal_state")

        # ── 5. Find Variations button ─────────────────────────────────────────
        print("[step 5] Looking for Variations button…")
        var_btn = None
        for sel in [
            "button:has-text('Variations')",
            "button:has-text('variations')",
            "button:has-text('Generate Variations')",
            "[class*='variation']",
        ]:
            try:
                var_btn = page.wait_for_selector(sel, timeout=5000)
                if var_btn:
                    print(f"  Variations button found: {sel}")
                    break
            except:
                pass

        if not var_btn:
            log_buttons(page, "— no Variations button")
            save(page, "05_no_variations_btn")
            browser.close()
            return

        var_btn.scroll_into_view_if_needed()
        var_btn.click()
        time.sleep(2)
        save(page, "05_variations_panel")
        print("[step 5] Variations panel opened.")
        log_buttons(page, "after Variations click")

        # ── 6. Toggle Compare: OpenAI vs Imagen ──────────────────────────────
        print("[step 6] Looking for Compare toggle…")
        compare_toggle = None

        # The toggle might be a label wrapping a checkbox, or a button
        for sel in [
            "text=Compare: OpenAI vs Imagen",
            "label:has-text('Compare')",
            "button:has-text('Compare: OpenAI')",
            "input[type='checkbox']",
            "[class*='switch']",
            "[class*='toggle']",
            "[role='switch']",
        ]:
            try:
                compare_toggle = page.wait_for_selector(sel, timeout=4000)
                if compare_toggle:
                    txt = compare_toggle.inner_text().strip() if compare_toggle else ""
                    print(f"  Compare toggle candidate: '{txt}' via {sel}")
                    break
            except:
                pass

        if not compare_toggle:
            print("  Compare toggle not found — logging all labels and checkboxes:")
            els = page.query_selector_all("label, input, [role='switch'], [class*='toggle'], [class*='switch']")
            for el in els:
                try:
                    txt = el.inner_text().strip()
                    tp = el.get_attribute("type") or ""
                    cls = (el.get_attribute("class") or "")[:60]
                    print(f"  element: '{txt}' type='{tp}' class='{cls}'")
                except:
                    pass
            save(page, "06_no_compare_toggle")
        else:
            compare_toggle.scroll_into_view_if_needed()
            compare_toggle.click()
            time.sleep(1)
            save(page, "06_compare_toggled")
            print("[step 6] Toggled Compare ON.")

        # ── 7. Select Strong mode ─────────────────────────────────────────────
        print("[step 7] Looking for Strong mode…")
        strong_btn = None
        for sel in ["button:has-text('Strong')", "label:has-text('Strong')", "[class*='mode']:has-text('Strong')"]:
            try:
                strong_btn = page.wait_for_selector(sel, timeout=4000)
                if strong_btn:
                    print(f"  Strong button found: {sel}")
                    break
            except:
                pass

        if strong_btn:
            strong_btn.scroll_into_view_if_needed()
            strong_btn.click()
            time.sleep(1)
            save(page, "07_strong_selected")
            print("[step 7] Strong mode selected.")
        else:
            print("  Strong mode button not found — may already be default or absent.")
            save(page, "07_no_strong")

        # ── 8. Click Compare / Generate ───────────────────────────────────────
        print("[step 8] Clicking Compare button…")
        log_buttons(page, "before Compare click")

        gen_btn = None
        # Be precise — look for a submit/action button
        for sel in [
            "button:has-text('Compare')",
            "button:has-text('Generate Variations')",
            "button:has-text('Generate')",
        ]:
            candidates = page.query_selector_all(sel)
            for c in candidates:
                try:
                    txt = c.inner_text().strip().lower()
                    # Skip pure toggle-like things, prefer action buttons
                    cls = (c.get_attribute("class") or "").lower()
                    if txt in ("compare", "generate", "generate variations", "compare variations"):
                        gen_btn = c
                        print(f"  Selected generate button: '{txt}'")
                        break
                    # Accept any "compare" or "generate" button
                    if "compare" in txt or "generate" in txt:
                        gen_btn = c
                        print(f"  Fallback generate button: '{txt}'")
                        break
                except:
                    pass
            if gen_btn:
                break

        if not gen_btn:
            print("  No Compare/Generate button found.")
            save(page, "08_no_generate_btn")
            browser.close()
            return

        gen_btn.scroll_into_view_if_needed()
        gen_btn.click()
        save(page, "08_after_generate_click")
        print("[step 8] Clicked generate. Waiting up to 90 seconds…")

        # ── 9. Poll for results ────────────────────────────────────────────────
        for i in range(18):
            time.sleep(5)
            elapsed = (i + 1) * 5
            save(page, f"09_poll_{elapsed:03d}s")
            print(f"  Polling at {elapsed}s…")

            body_text = page.inner_text("body").lower()
            error_keywords = ["error", "failed", "unauthorized", "500", "400", "something went wrong"]
            has_error = any(kw in body_text for kw in error_keywords)

            # Check for result thumbnails in a strip
            result_imgs = page.query_selector_all(
                "[class*='result'] img, [class*='generated'] img, [class*='variation'] img, "
                "[class*='output'] img, [class*='thumb'] img, [class*='strip'] img"
            )

            if has_error:
                print(f"  ERROR keyword detected in page at {elapsed}s")
                break
            if result_imgs and len(result_imgs) >= 2:
                print(f"  {len(result_imgs)} result images detected at {elapsed}s — done!")
                break

        save(page, "10_final_result")
        print("\n[step 9] Final screenshot taken.")

        # ── 10. Final inspection ───────────────────────────────────────────────
        print("\n=== FINAL PAGE INSPECTION ===")
        body_text = page.inner_text("body")
        print("\n--- Visible text on page ---")
        for line in body_text.split("\n"):
            line = line.strip()
            if line and len(line) > 1:
                print(f"  {line}")

        # Badge search — OAI / IMG
        oai_badges = page.query_selector_all(
            "[class*='oai' i], [aria-label*='OAI' i], [class*='openai' i], span:has-text('OAI')"
        )
        img_badges = page.query_selector_all(
            "[class*='img-badge' i], [aria-label*='IMG' i], [class*='imagen' i], span:has-text('IMG')"
        )
        error_els = page.query_selector_all("[class*='error'], [role='alert'], [class*='alert'], [class*='toast']")

        print(f"\n  OAI badge elements: {len(oai_badges)}")
        print(f"  IMG badge elements: {len(img_badges)}")
        print(f"  Error/alert elements: {len(error_els)}")
        for el in error_els:
            try:
                txt = el.inner_text().strip()
                if txt:
                    print(f"    [ERROR/ALERT] '{txt}'")
            except:
                pass

        # Count all images visible on page now
        all_imgs = page.query_selector_all("img")
        visible_imgs = []
        for img in all_imgs:
            try:
                box = img.bounding_box()
                if box and box["width"] > 30 and box["height"] > 30:
                    src = img.get_attribute("src") or ""
                    visible_imgs.append(src[:80])
            except:
                pass
        print(f"\n  Visible images on page: {len(visible_imgs)}")
        for src in visible_imgs[:10]:
            print(f"    {src}")

        browser.close()
        print("\n[done] All screenshots saved to:", SCREENSHOTS_DIR)

if __name__ == "__main__":
    run()
