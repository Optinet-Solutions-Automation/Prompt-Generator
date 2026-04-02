"""
Two-part visual test:
TEST 1 — Skeleton appearance in Image Library (capture immediately after click)
TEST 2 — Console state flow check (localStorage keys)
"""

from playwright.sync_api import sync_playwright
import time
import json

SCREENSHOTS_DIR = "C:/Users/User/Prompt-Generator/screenshots"
BASE_URL = "http://localhost:3000"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # ----------------------------------------------------------------
        # TEST 1 — Skeleton appearance in Image Library
        # ----------------------------------------------------------------
        print("=== TEST 1: Skeleton appearance ===")
        page.goto(BASE_URL, wait_until="networkidle")
        time.sleep(1)

        # Inject 8 test images into localStorage — wrapped in arrow function
        inject_js = """() => {
            const images = Array.from({length:8}, (_, i) => ({
              id: `img-slow-${i}`,
              created_at: new Date().toISOString(),
              filename: `test-${i}.png`,
              provider: i % 2 === 0 ? 'chatgpt' : 'gemini',
              aspect_ratio: '16:9', resolution: '1K', storage_path: '',
              public_url: `https://picsum.photos/seed/${i+100}/400/300?t=${Date.now()}`
            }));
            localStorage.setItem('pg_generated_images', JSON.stringify(images));
            console.log('Injected images:', images.length);
            return images.length;
        }"""
        result = page.evaluate(inject_js)
        print(f"Injected {result} images into localStorage")

        # Screenshot of main page before clicking Image Library
        page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_before_click.png", full_page=False)
        print("Screenshot: test1_before_click.png")

        # Find the Image Library button
        library_button = None
        selectors = [
            "button:has-text('Image Library')",
            "a:has-text('Image Library')",
            "[data-testid='image-library']",
            "button:has-text('Library')",
            "text=Image Library",
        ]

        for sel in selectors:
            try:
                btn = page.locator(sel).first
                if btn.count() > 0:
                    library_button = btn
                    print(f"Found Image Library button with selector: {sel}")
                    break
            except Exception as e:
                print(f"Selector {sel} failed: {e}")

        if library_button is None:
            print("ERROR: Could not find Image Library button")
            # Print all visible buttons to help debug
            buttons_text = page.evaluate("() => Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)")
            print(f"Visible buttons: {buttons_text}")
            links_text = page.evaluate("() => Array.from(document.querySelectorAll('a')).map(b => b.innerText.trim()).filter(Boolean)")
            print(f"Visible links: {links_text}")
            page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_no_button_found.png", full_page=False)
        else:
            # Click and IMMEDIATELY screenshot (< 200ms) to catch skeleton state
            library_button.click()
            page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_skeleton_immediate.png", full_page=False)
            print("Screenshot: test1_skeleton_immediate.png (immediate)")

            time.sleep(0.15)
            page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_skeleton_150ms.png", full_page=False)
            print("Screenshot: test1_skeleton_150ms.png (150ms)")

            time.sleep(0.35)
            page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_skeleton_500ms.png", full_page=False)
            print("Screenshot: test1_skeleton_500ms.png (500ms)")

            time.sleep(1.0)
            page.screenshot(path=f"{SCREENSHOTS_DIR}/test1_after_load.png", full_page=False)
            print("Screenshot: test1_after_load.png (1.5s — images loaded)")

        # ----------------------------------------------------------------
        # TEST 2 — Console state flow
        # ----------------------------------------------------------------
        print("\n=== TEST 2: Console state flow ===")

        # Go back to main page
        went_back = False
        back_selectors = [
            "button:has-text('Back')",
            "a:has-text('Back')",
            "[aria-label='back']",
            "text=Back",
            "button:has-text('← Back')",
        ]
        for sel in back_selectors:
            try:
                btn = page.locator(sel).first
                if btn.count() > 0:
                    btn.click()
                    time.sleep(0.5)
                    went_back = True
                    print(f"Clicked back with: {sel}")
                    break
            except Exception:
                pass

        if not went_back:
            page.goto(BASE_URL, wait_until="networkidle")
            print("Navigated back to root URL")

        time.sleep(0.5)

        # Run the localStorage check
        ls_result = page.evaluate("""() => {
            const variationsKey = localStorage.getItem('pg_current_variations');
            const imagesKey = localStorage.getItem('pg_generated_images');
            const imagesLen = (imagesKey || '').length;
            const allKeys = Object.keys(localStorage);
            console.log('variations key:', variationsKey);
            console.log('images key length:', imagesLen);
            return {
                variations: variationsKey,
                imagesLength: imagesLen,
                allKeys: allKeys
            };
        }""")
        print(f"localStorage result:\n{json.dumps(ls_result, indent=2)}")

        # Inject a visible overlay showing the console output
        overlay_js = """() => {
            const existing = document.getElementById('__test_overlay');
            if (existing) existing.remove();

            const div = document.createElement('div');
            div.id = '__test_overlay';
            div.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0,0,0,0.92);
                color: #00ff00;
                font-family: monospace;
                font-size: 13px;
                padding: 16px;
                z-index: 99999;
                max-height: 300px;
                overflow-y: auto;
                border-top: 2px solid #00ff00;
            `;

            const variationsVal = localStorage.getItem('pg_current_variations');
            const imagesVal = localStorage.getItem('pg_generated_images');
            const imagesLen = (imagesVal || '').length;
            let imagesCount = 0;
            try { imagesCount = imagesVal ? JSON.parse(imagesVal).length : 0; } catch(e) {}

            div.innerHTML = `
                <div style="color: #ffff00; font-weight: bold; margin-bottom: 8px;">
                    TEST 2 - Console State Flow Check
                </div>
                <div style="color:#aaa;">&gt; localStorage.getItem('pg_current_variations')</div>
                <div style="color: #ffffff; margin-left: 16px; margin-bottom: 8px;">
                    ${variationsVal === null ? 'null' : '"' + variationsVal.substring(0, 120) + (variationsVal.length > 120 ? '... (truncated)' : '"')}
                </div>
                <div style="color:#aaa;">&gt; localStorage.getItem('pg_generated_images') length</div>
                <div style="color: #ffffff; margin-left: 16px; margin-bottom: 8px;">
                    ${imagesLen} chars / ${imagesCount} images parsed
                </div>
                <div style="color: #888; margin-top: 8px; font-size: 11px;">
                    All localStorage keys: ${Object.keys(localStorage).join(', ') || '(none)'}
                </div>
            `;
            document.body.appendChild(div);
            return 'overlay injected';
        }"""
        overlay_result = page.evaluate(overlay_js)
        print(f"Overlay: {overlay_result}")

        time.sleep(0.3)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/test2_console_overlay.png", full_page=False)
        print("Screenshot: test2_console_overlay.png")

        browser.close()
        print("\nAll tests complete.")

if __name__ == "__main__":
    run_tests()
