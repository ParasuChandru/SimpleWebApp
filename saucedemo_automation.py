from playwright.sync_api import sync_playwright
import os

# Create screenshots directory
os.makedirs("screenshots", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Step 1: Go to saucedemo.com
    print("Step 1: Navigating to saucedemo.com...")
    page.goto("https://www.saucedemo.com/")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshots/01_login_page.png", full_page=True)
    print("Screenshot saved: 01_login_page.png")
    
    # Step 2: Login with standard_user / secret_sauce
    print("Step 2: Logging in...")
    page.fill("#user-name", "standard_user")
    page.fill("#password", "secret_sauce")
    page.screenshot(path="screenshots/02_login_filled.png", full_page=True)
    print("Screenshot saved: 02_login_filled.png")
    
    page.click("#login-button")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshots/03_inventory_page.png", full_page=True)
    print("Screenshot saved: 03_inventory_page.png")
    
    # Step 3: Add Sauce Labs Backpack to cart
    print("Step 3: Adding Sauce Labs Backpack to cart...")
    page.click('[data-test="add-to-cart-sauce-labs-backpack"]')
    page.screenshot(path="screenshots/04_backpack_added.png", full_page=True)
    print("Screenshot saved: 04_backpack_added.png")
    
    # Step 4: Add Sauce Labs Onesie to cart
    print("Step 4: Adding Sauce Labs Onesie to cart...")
    page.click('[data-test="add-to-cart-sauce-labs-onesie"]')
    page.screenshot(path="screenshots/05_onesie_added.png", full_page=True)
    print("Screenshot saved: 05_onesie_added.png")
    
    # Step 5: Click on cart icon to go to cart
    print("Step 5: Opening cart...")
    page.click(".shopping_cart_link")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshots/06_cart_page.png", full_page=True)
    print("Screenshot saved: 06_cart_page.png")
    
    # Step 6: Click on Checkout
    print("Step 6: Clicking checkout...")
    page.click('[data-test="checkout"]')
    page.wait_for_load_state("networkidle")
    page.screenshot(path="screenshots/07_checkout_page.png", full_page=True)
    print("Screenshot saved: 07_checkout_page.png")
    
    browser.close()
    print("\nAll screenshots saved successfully in the 'screenshots' folder!")
