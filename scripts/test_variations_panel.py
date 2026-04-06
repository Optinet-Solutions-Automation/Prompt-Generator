from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # Step 1: Navigate to main page and take screenshot
        print("Step 1: Loading main page...")
        page.goto('http://localhost:5173', wait_until='networkidle', timeout=30000)
        time.sleep(2)
        page.screenshot(path='C:/Users/User/Prompt-Generator/test-after-library.png', full_page=False)
        print("Screenshot saved: test-after-library.png")

        # Step 2: Look for image library link or thumbnail
        print("Step 2: Looking for library link or image thumbnails...")

        # Try to find library-related buttons/links
        library_selectors = [
            'text=Library',
            'text=Image Library',
            'text=library',
            '[href*="library"]',
            'button:has-text("Library")',
            'a:has-text("Library")',
        ]

        found_library = False
        for selector in library_selectors:
            try:
                element = page.locator(selector).first
                if element.is_visible(timeout=2000):
                    print(f"Found library element with selector: {selector}")
                    element.click()
                    time.sleep(2)
                    found_library = True
                    break
            except Exception as e:
                print(f"Selector {selector} not found: {e}")

        if not found_library:
            print("No library link found, looking for image thumbnails...")
            # Look for image thumbnails
            img_selectors = [
                'img[src*="thumb"]',
                'img[src*="image"]',
                '.thumbnail',
                '.image-card',
                '[class*="thumbnail"]',
                '[class*="image-card"]',
                '[class*="gallery"]',
            ]
            for selector in img_selectors:
                try:
                    element = page.locator(selector).first
                    if element.is_visible(timeout=2000):
                        print(f"Found image element with selector: {selector}")
                        element.click()
                        time.sleep(2)
                        found_library = True
                        break
                except Exception as e:
                    print(f"Selector {selector} not found: {e}")

        # Take screenshot after trying to navigate
        page.screenshot(path='C:/Users/User/Prompt-Generator/screenshots/step2_after_library_click.png', full_page=False)
        print("Screenshot saved: step2_after_library_click.png")

        # Step 3: Look for modal or image to click
        print("Step 3: Looking for modal or image elements...")
        modal_selectors = [
            '[class*="modal"]',
            '[role="dialog"]',
            '.modal',
        ]

        modal_found = False
        for selector in modal_selectors:
            try:
                element = page.locator(selector).first
                if element.is_visible(timeout=2000):
                    print(f"Found modal with selector: {selector}")
                    modal_found = True
                    break
            except:
                pass

        if not modal_found:
            print("No modal found, looking for clickable images...")
            try:
                # Try clicking any image
                images = page.locator('img').all()
                print(f"Found {len(images)} images")
                for i, img in enumerate(images[:5]):
                    try:
                        if img.is_visible(timeout=1000):
                            print(f"Clicking image {i+1}...")
                            img.click()
                            time.sleep(2)
                            break
                    except:
                        pass
            except Exception as e:
                print(f"Error clicking images: {e}")

        page.screenshot(path='C:/Users/User/Prompt-Generator/screenshots/step3_after_modal.png', full_page=False)
        print("Screenshot saved: step3_after_modal.png")

        # Step 4: Look for Variations button
        print("Step 4: Looking for Variations button...")
        variation_selectors = [
            'button:has-text("Variations")',
            'button:has-text("variations")',
            'button:has-text("Generate")',
            '[class*="variation"]',
            'text=Variations',
            # Shuffle icon button
            'button svg',
        ]

        for selector in variation_selectors:
            try:
                element = page.locator(selector).first
                if element.is_visible(timeout=2000):
                    print(f"Found variations element with selector: {selector}")
                    element.click()
                    time.sleep(2)
                    break
            except Exception as e:
                print(f"Selector {selector} not found: {e}")

        page.screenshot(path='C:/Users/User/Prompt-Generator/screenshots/step4_variations_panel.png', full_page=False)
        print("Screenshot saved: step4_variations_panel.png")

        # Check for specific text content
        print("\n--- Checking for specific text ---")
        text_checks = [
            "Generate 4 Variations",
            "Generate 2 Variations",
            "Generates 4 variations",
            "4 total",
            "2 total",
            "different level of change",
        ]

        for text in text_checks:
            try:
                element = page.locator(f'text={text}').first
                if element.is_visible(timeout=1000):
                    print(f"FOUND: '{text}'")
                else:
                    print(f"NOT VISIBLE: '{text}'")
            except:
                print(f"NOT FOUND: '{text}'")

        # Get page text content for analysis
        print("\n--- Page body text (first 3000 chars) ---")
        body_text = page.inner_text('body')
        print(body_text[:3000])

        browser.close()
        print("\nDone!")

run()
