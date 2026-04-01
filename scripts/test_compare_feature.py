"""
Test the Compare: OpenAI vs Imagen feature on the main page gallery modal.
"""
from playwright.sync_api import sync_playwright
import time
import os

SCREENSHOTS_DIR = "C:/Users/User/Prompt-Generator/screenshots/compare_test"
BASE_URL = "https://prompt-generator-eight-umber.vercel.app"

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def save(page, name):
    path = f"{SCREENSHOTS_DIR}/{name}.png"
    page.screenshot(path=path, full_page=False)
    print(f"  [screenshot] {path}")
    return path

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page = context.new_page()

        # Step 1: Go to homepage
        print("\n[1] Loading homepage...")
        page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        time.sleep(2)
        save(page, "01_homepage_initial")
        print(f"    Title: {page.title()}")
        print(f"    URL: {page.url}")

        # Step 2: Scroll down to find image gallery
        print("\n[2] Scrolling to find image gallery...")
        page.keyboard.press("End")
        time.sleep(1)
        save(page, "02_after_scroll_to_end")

        # Scroll back up slightly and look for image thumbnails
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # Scroll down gradually looking for gallery
        for scroll_pos in [300, 600, 900, 1200, 1500, 2000, 2500, 3000]:
            page.evaluate(f"window.scrollTo(0, {scroll_pos})")
            time.sleep(0.5)

        save(page, "03_scrolled_looking_for_gallery")

        # Step 3: Look for image thumbnails - try various selectors
        print("\n[3] Looking for image thumbnails in main gallery...")

        # Log what's on page
        all_images = page.query_selector_all("img")
        print(f"    Found {len(all_images)} img elements total")

        # Try to find gallery thumbnails (not logos/icons)
        gallery_selectors = [
            "img[src*='generated']",
            "img[src*='image']",
            "img[src*='upload']",
            "[class*='gallery'] img",
            "[class*='grid'] img",
            "[class*='thumbnail']",
            "[class*='thumb'] img",
            "[class*='card'] img",
            "[data-testid*='image']",
            "[class*='recent'] img",
            "[class*='generated'] img",
        ]

        thumbnail = None
        for sel in gallery_selectors:
            elements = page.query_selector_all(sel)
            if elements:
                print(f"    Found {len(elements)} elements with selector: {sel}")
                # Filter for images that look like gallery thumbnails (bigger than 50px)
                for el in elements:
                    try:
                        bbox = el.bounding_box()
                        if bbox and bbox['width'] > 50 and bbox['height'] > 50:
                            src = el.get_attribute('src') or ''
                            alt = el.get_attribute('alt') or ''
                            print(f"      -> {bbox['width']}x{bbox['height']} src={src[:60]} alt={alt[:40]}")
                            if thumbnail is None and bbox['width'] > 100:
                                thumbnail = el
                    except:
                        pass

        if thumbnail is None:
            print("    No suitable thumbnail found yet - trying broader search...")
            # Get all images with significant size
            for img in all_images:
                try:
                    bbox = img.bounding_box()
                    if bbox and bbox['width'] > 150 and bbox['height'] > 100:
                        src = img.get_attribute('src') or ''
                        alt = img.get_attribute('alt') or ''
                        print(f"      Large img: {bbox['width']}x{bbox['height']} src={src[:80]}")
                except:
                    pass

        # Also look for clickable containers that might hold images
        print("\n[4] Looking for clickable image containers...")
        click_containers = page.query_selector_all("[onclick], [role='button'], button:has(img), [class*='cursor-pointer']:has(img)")
        print(f"    Found {len(click_containers)} clickable containers with images")

        # Let's look at the page structure for gallery-like elements
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # Get page text to understand layout
        page_text = page.inner_text("body")
        lines = [l.strip() for l in page_text.split('\n') if l.strip()]
        print("\n    Page content (first 50 non-empty lines):")
        for line in lines[:50]:
            print(f"      {line}")

        save(page, "04_page_top")

        # Step 4: Scroll through page and take screenshots at key points
        print("\n[5] Taking screenshots at different scroll positions...")
        positions = [0, 500, 1000, 1500, 2000, 2500, 3000]
        for pos in positions:
            page.evaluate(f"window.scrollTo(0, {pos})")
            time.sleep(0.5)
            save(page, f"05_scroll_{pos}")

        # Step 5: Find and click a thumbnail
        print("\n[6] Attempting to find and click thumbnail...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # More targeted approach - look for the main generated images section
        # The images might be in a specific component

        # Try finding any image that isn't a logo (logos tend to be small)
        found_and_clicked = False

        # Look for images in the main content area
        main_images = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.offsetWidth,
                height: img.offsetHeight,
                x: img.getBoundingClientRect().x,
                y: img.getBoundingClientRect().y,
                visible: img.offsetParent !== null,
                className: img.className,
                parentClass: img.parentElement ? img.parentElement.className : '',
                grandParentClass: img.parentElement && img.parentElement.parentElement ? img.parentElement.parentElement.className : ''
            })).filter(img => img.width > 100 && img.height > 80 && img.visible);
        }""")

        print(f"\n    Visible images larger than 100x80px: {len(main_images)}")
        for img_info in main_images:
            print(f"      {img_info['width']}x{img_info['height']} at ({img_info['x']:.0f},{img_info['y']:.0f}) | src: {img_info['src'][:70]}")
            print(f"        class: {img_info['className'][:60]} | parentClass: {img_info['parentClass'][:60]}")

        # Try to scroll down to find the gallery and look for it
        # The gallery with soccer/trophy images is mentioned - it might load dynamically

        # Try waiting for images to load
        print("\n[7] Waiting for dynamic content to load...")
        time.sleep(3)
        page.evaluate("window.scrollTo(0, 0)")

        # Try the generated images section which should show after brand selection
        # First check if we need to select a brand
        brand_selector = page.query_selector("select, [class*='brand'], [class*='Brand']")
        if brand_selector:
            print("    Found brand selector element")

        # Check for tabs or navigation
        tabs = page.query_selector_all("[role='tab'], [class*='tab']")
        print(f"    Found {len(tabs)} tab elements")
        for tab in tabs:
            print(f"      Tab text: {tab.inner_text()[:50]}")

        # Try scrolling on the main page to find the "Recent Images" / generated gallery
        print("\n[8] Scrolling to find generated images gallery...")

        # Scroll very slowly looking for images
        scroll_y = 0
        found_gallery = False

        while scroll_y <= 5000 and not found_gallery:
            page.evaluate(f"window.scrollTo(0, {scroll_y})")
            time.sleep(0.3)

            # Check for new large images at current viewport
            viewport_images = page.evaluate("""() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                return imgs.filter(img => {
                    const rect = img.getBoundingClientRect();
                    return rect.top >= 0 && rect.top <= window.innerHeight
                        && img.offsetWidth > 100 && img.offsetHeight > 100;
                }).map(img => ({
                    src: img.src.substring(0, 80),
                    w: img.offsetWidth,
                    h: img.offsetHeight,
                    y: img.getBoundingClientRect().top
                }));
            }""")

            if viewport_images:
                print(f"    scroll={scroll_y}: {len(viewport_images)} large images in viewport")
                for vi in viewport_images:
                    print(f"      {vi['w']}x{vi['h']} {vi['src']}")

                if len(viewport_images) >= 1:
                    # Check if these are likely gallery images (not brand logos)
                    for vi in viewport_images:
                        src = vi['src'].lower()
                        if any(kw in src for kw in ['generated', 'upload', 'airtable', 'cloudinary', 'supabase', 'blob', 's3', 'image', 'photo']):
                            print(f"    GALLERY IMAGE FOUND at scroll={scroll_y}")
                            found_gallery = True
                            save(page, f"08_gallery_found_at_{scroll_y}")
                            break

            scroll_y += 200

        # Take a screenshot at current position
        save(page, "09_final_scroll_position")

        # Try clicking on the first large image we can find
        print("\n[9] Trying to click an image thumbnail...")

        # Get current state of images
        all_large_images = page.evaluate("""() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.filter(img => img.offsetWidth > 100 && img.offsetHeight > 100 && img.offsetParent !== null)
                       .map(img => ({
                           src: img.src.substring(0, 100),
                           w: img.offsetWidth,
                           h: img.offsetHeight,
                           x: img.getBoundingClientRect().x + img.offsetWidth/2,
                           y: img.getBoundingClientRect().y + img.offsetHeight/2,
                           className: img.className.substring(0, 80)
                       }));
        }""")

        print(f"    Total large images found: {len(all_large_images)}")

        # Scroll to top and try clicking images from top to bottom
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(1)

        # Try clicking images one by one until modal opens
        modal_opened = False

        for pos_y in range(0, 6000, 300):
            page.evaluate(f"window.scrollTo(0, {pos_y})")
            time.sleep(0.3)

            # Get images currently visible in viewport
            visible_imgs = page.query_selector_all("img")
            for img_el in visible_imgs:
                try:
                    bbox = img_el.bounding_box()
                    if bbox and bbox['width'] > 100 and bbox['height'] > 100:
                        src = img_el.get_attribute('src') or ''
                        # Skip SVG icons and tiny images
                        if '.svg' in src or 'logo' in src.lower() or 'icon' in src.lower():
                            continue

                        # Check if it's in the current viewport
                        if 0 <= bbox['y'] <= 1080:
                            print(f"    Trying to click image: {bbox['width']}x{bbox['height']} at ({bbox['x']:.0f},{bbox['y']:.0f}) src={src[:60]}")

                            # Click the image
                            img_el.click(timeout=3000)
                            time.sleep(2)

                            # Check if modal opened
                            modal = page.query_selector("[class*='modal'], [class*='Modal'], [role='dialog'], [class*='overlay'], [class*='Overlay']")
                            if modal:
                                print(f"    MODAL OPENED!")
                                modal_opened = True
                                save(page, "10_modal_opened")
                                break
                            else:
                                # Check if URL changed (navigation)
                                if page.url != BASE_URL and page.url != BASE_URL + '/':
                                    print(f"    URL changed to: {page.url}")
                                    page.go_back()
                                    time.sleep(2)
                except Exception as e:
                    pass

            if modal_opened:
                break

        if not modal_opened:
            print("\n    Modal not found after clicking images.")
            print("    Checking page for any overlay or dialog...")
            save(page, "10_no_modal_state")

            # Let's look at the full page HTML structure
            html_snippet = page.evaluate("""() => {
                // Find elements that look like they contain generated images
                const candidates = document.querySelectorAll('[class*="gallery"], [class*="Grid"], [class*="generated"], [class*="recent"], [class*="images"]');
                return Array.from(candidates).map(el => ({
                    tag: el.tagName,
                    class: el.className.substring(0, 100),
                    text: el.innerText.substring(0, 50),
                    childCount: el.children.length
                }));
            }""")
            print("\n    Gallery-like elements found:")
            for el in html_snippet:
                print(f"      <{el['tag']} class='{el['class']}'> children={el['childCount']} text='{el['text']}'")

            # Try looking at the full DOM for image-related sections
            full_dom = page.evaluate("""() => {
                const sections = document.querySelectorAll('section, main, [class*="content"], [class*="home"]');
                return Array.from(sections).map(s => ({
                    tag: s.tagName,
                    id: s.id,
                    class: s.className.substring(0, 80),
                    children: s.children.length,
                    hasImages: s.querySelectorAll('img').length
                }));
            }""")
            print("\n    Main content sections:")
            for s in full_dom:
                if s['hasImages'] > 0:
                    print(f"      <{s['tag']} id='{s['id']}' class='{s['class']}'> imgs={s['hasImages']}")

        # Step 6: If modal is open, find the Variations button
        if modal_opened:
            print("\n[10] Looking for Variations button in modal...")

            # Look for the Variations button
            variations_btn = None

            var_selectors = [
                "button:has-text('Variations')",
                "[class*='variation']",
                "button[aria-label*='variation']",
                "button:has([class*='shuffle'])",
                "button svg + *:has-text('Variation')",
            ]

            for sel in var_selectors:
                try:
                    btn = page.query_selector(sel)
                    if btn:
                        print(f"    Found variations button with selector: {sel}")
                        variations_btn = btn
                        break
                except:
                    pass

            if variations_btn:
                variations_btn.click()
                time.sleep(2)
                save(page, "11_variations_panel")

                # Find the Compare toggle
                print("\n[11] Looking for Compare toggle...")
                compare_toggle = page.query_selector("button:has-text('Compare'), [class*='toggle']:has-text('Compare'), input[type='checkbox']")

                if compare_toggle:
                    print("    Found compare toggle, clicking...")
                    compare_toggle.click()
                    time.sleep(1)
                    save(page, "12_compare_toggle_on")

                    # Select "Strong"
                    strong_btn = page.query_selector("button:has-text('Strong')")
                    if strong_btn:
                        strong_btn.click()
                        time.sleep(0.5)

                    # Type in guidance field
                    guidance_field = page.query_selector("input[placeholder*='guidance'], input[placeholder*='text'], textarea[placeholder*='guidance']")
                    if guidance_field:
                        guidance_field.fill("sunny stadium")
                        time.sleep(0.5)

                    # Click Compare button
                    compare_btn = page.query_selector("button:has-text('Compare')")
                    if compare_btn:
                        compare_btn.click()
                        time.sleep(2)
                        save(page, "13_after_compare_click")

                        # Wait up to 120 seconds
                        print("\n[12] Waiting up to 120 seconds for results...")
                        for i in range(24):
                            time.sleep(5)
                            save(page, f"14_poll_{(i+1)*5:03d}s")

                            # Check for results
                            img_badge = page.query_selector("[class*='IMG'], text='IMG', [class*='badge']")
                            error = page.query_selector("[class*='error'], [class*='Error']")

                            if img_badge:
                                print(f"    IMG badge found at {(i+1)*5}s!")
                                break
                            if error:
                                error_text = error.inner_text()
                                print(f"    Error found at {(i+1)*5}s: {error_text}")
                                break

                        save(page, "15_final_result")
                else:
                    print("    Compare toggle NOT found")
                    save(page, "12_no_compare_toggle")
            else:
                print("    Variations button NOT found")
                # Show what buttons are in the modal
                modal_buttons = page.query_selector_all("[role='dialog'] button, [class*='modal'] button, [class*='Modal'] button")
                print(f"    Modal buttons found: {len(modal_buttons)}")
                for btn in modal_buttons:
                    print(f"      Button: {btn.inner_text()[:50]}")

        print("\n[DONE] Screenshots saved to:", SCREENSHOTS_DIR)
        browser.close()

if __name__ == "__main__":
    run()
