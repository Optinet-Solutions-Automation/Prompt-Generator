from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 900})

        # Navigate
        page.goto('http://localhost:5173', wait_until='networkidle', timeout=30000)
        time.sleep(2)

        # Click Image Library
        page.locator('text=Library').first.click()
        time.sleep(3)

        # Click first visible image
        images = page.locator('img').all()
        for i, img in enumerate(images[:10]):
            try:
                if img.is_visible(timeout=1000):
                    img.click()
                    time.sleep(3)
                    break
            except:
                pass

        # Find and click Variations button/section
        try:
            var_btn = page.locator('button:has-text("Variations")').first
            if var_btn.is_visible(timeout=3000):
                var_btn.click()
                time.sleep(2)
                print("Clicked Variations button")
        except Exception as e:
            print(f"Variations button: {e}")

        # Scroll inside the right panel to show the Generate button
        # Try scrolling the right panel container
        try:
            # Scroll right panel to bottom
            page.evaluate('''
                const panels = document.querySelectorAll('[class*="panel"], [class*="sidebar"], [class*="right"]');
                panels.forEach(p => { p.scrollTop = p.scrollHeight; });
                // Also try scrolling the overflow containers
                const overflows = Array.from(document.querySelectorAll('*')).filter(el => {
                    const s = window.getComputedStyle(el);
                    return (s.overflow === 'auto' || s.overflow === 'scroll' || s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
                });
                console.log('Scrollable elements:', overflows.length);
                overflows.forEach(el => { el.scrollTop = el.scrollHeight; });
            ''')
            time.sleep(1)
        except Exception as e:
            print(f"Scroll error: {e}")

        # Take clip of right panel after scroll
        page.screenshot(
            path='C:/Users/User/Prompt-Generator/screenshots/var_after_scroll.png',
            clip={'x': 920, 'y': 0, 'width': 360, 'height': 900},
            full_page=False
        )
        print("After scroll screenshot saved")

        # Scroll the generate button into view
        try:
            gen_btn = page.locator('button:has-text("Generate 4 Variations")').first
            gen_btn.scroll_into_view_if_needed()
            time.sleep(1)

            # Get bounding box
            box = gen_btn.bounding_box()
            print(f"Generate button bounding box: {box}")

            # Take a clip around the generate button
            if box:
                y_start = max(0, box['y'] - 200)
                page.screenshot(
                    path='C:/Users/User/Prompt-Generator/screenshots/var_generate_btn.png',
                    clip={'x': box['x'] - 20, 'y': y_start, 'width': box['width'] + 40, 'height': 400},
                    full_page=False
                )
                print("Generate button clip saved")

        except Exception as e:
            print(f"Generate button error: {e}")

        # Get full inner text of the variations panel area
        print("\n--- Full variations area text ---")
        try:
            # Get text of the right sidebar area
            right_panel = page.evaluate('''
                () => {
                    // Find element containing "VARIATIONS"
                    const els = Array.from(document.querySelectorAll('*'));
                    const varEl = els.find(el => el.innerText && el.innerText.includes('VARIATIONS') && el.children.length > 2);
                    return varEl ? varEl.innerText : 'Not found';
                }
            ''')
            print(right_panel[:1000])
        except Exception as e:
            print(f"Error getting text: {e}")

        browser.close()
        print("\nDone!")

run()
