#!/usr/bin/env python3
"""
AUTONOMOUS Facebook Poster - Uses YOUR Chrome profile to post
No API tokens needed - just uses your logged-in session!
"""
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

CHROME_USER_DATA = str(Path.home() / "Library/Application Support/Google/Chrome")

async def post_to_facebook_autonomous(message: str, page_name: str = "AMD Media Solutions"):
    """
    Post to Facebook using your logged-in Chrome session
    """
    async with async_playwright() as p:
        # Launch browser with YOUR Chrome profile
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=CHROME_USER_DATA,
            headless=False,  # Show browser so you can see it working
            args=['--no-sandbox']
        )
        
        page = await browser.new_page()
        
        try:
            # Go to Facebook Pages
            await page.goto('https://www.facebook.com/pages/?category=your_pages', timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Find and click the page
            print(f"Looking for page: {page_name}")
            page_link = page.locator(f'text="{page_name}"').first
            await page_link.click()
            await page.wait_for_timeout(2000)
            
            # Click "Create post" or "What's on your mind?"
            create_post = page.locator('[aria-label="Create a post"]').first
            await create_post.click()
            await page.wait_for_timeout(1000)
            
            # Type the message
            text_area = page.locator('[contenteditable="true"]').first
            await text_area.fill(message)
            await page.wait_for_timeout(1000)
            
            # Click "Post" button
            post_button = page.locator('[aria-label="Post"]').first
            await post_button.click()
            
            print("✅ Posted successfully!")
            await page.wait_for_timeout(3000)
            
            return {"success": True, "message": "Posted via browser automation"}
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return {"success": False, "message": str(e)}
        finally:
            await browser.close()

if __name__ == '__main__':
    test_message = "🚀 AMD Social Engine Test - Automated Facebook posting is LIVE! #Automation #AMD"
    result = asyncio.run(post_to_facebook_autonomous(test_message))
    print(result)
