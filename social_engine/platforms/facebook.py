"""
Facebook Platform Module - Browser Automation
Posts via browser automation (no API permissions needed!)
"""

import os
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from dotenv import load_dotenv

# Load credentials
root_env = Path(__file__).parent.parent.parent / '.env'
load_dotenv(root_env)

META_PAGE_ID = os.getenv('META_PAGE_ID', '107369105309965')
FACEBOOK_EMAIL = os.getenv('FACEBOOK_EMAIL', '')
FACEBOOK_PASSWORD = os.getenv('FACEBOOK_PASSWORD', '')

async def post_to_facebook_browser(content: str) -> dict:
    """Post to Facebook via browser automation"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # Navigate directly to page (if logged in, will work)
            page_url = f"https://www.facebook.com/{META_PAGE_ID}"
            await page.goto(page_url, timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Look for "Create post" button
            try:
                create_button = page.locator('[aria-label*="Create"]').first
                await create_button.click()
                await page.wait_for_timeout(2000)
                
                # Type content
                text_box = page.locator('[contenteditable="true"]').first
                await text_box.fill(content)
                await page.wait_for_timeout(1000)
                
                # Click Post
                post_button = page.locator('[aria-label="Post"]').first
                await post_button.click()
                await page.wait_for_timeout(3000)
                
                await browser.close()
                return {
                    'success': True,
                    'message': 'Posted via browser automation'
                }
                
            except Exception as e:
                await browser.close()
                return {
                    'success': False,
                    'message': f'Browser automation failed: {str(e)}'
                }
                
        except Exception as e:
            await browser.close()
            return {
                'success': False,
                'message': f'Failed to navigate: {str(e)}'
            }

def post_to_facebook(content: str) -> dict:
    """Synchronous wrapper for async function"""
    try:
        return asyncio.run(post_to_facebook_browser(content))
    except Exception as e:
        return {
            'success': False,
            'message': f'Automation error: {str(e)}'
        }

if __name__ == '__main__':
    test_content = "🚀 AMD Social Engine - Automated Facebook posting via browser! #Automation"
    result = post_to_facebook(test_content)
    print(result)
