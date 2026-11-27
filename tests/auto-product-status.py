"""Run with a temporary approved seller session and AUTO_STATUS_SHOP / AUTO_STATUS_PHOTO.
Creates one real test listing; caller removes its temporary shop after verification.
"""
import asyncio
import os
from playwright.async_api import async_playwright
from lovable_playwright_defaults import signed_in_context

async def main():
    shop = os.environ["AUTO_STATUS_SHOP"]
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        seller = await signed_in_context(browser)
        page = await seller.new_page()
        await page.goto("http://localhost:8080/dashboard", wait_until="domcontentloaded")
        await page.get_by_role("button", name="Post product", exact=True).click(timeout=30000)
        await page.get_by_label("Product title", exact=True).fill("Automatic Status Product")
        await page.get_by_label("Category *", exact=True).select_option("Electronics")
        await page.get_by_label("Price (RWF)", exact=True).fill("1000")
        await page.get_by_label("Stock", exact=True).fill("2")
        await page.get_by_label("Description", exact=True).fill("Temporary automatic status verification")
        await page.get_by_label("Add product photos", exact=True).set_input_files(os.environ["AUTO_STATUS_PHOTO"])
        await page.get_by_role("button", name="Publish product", exact=True).click()
        await page.get_by_role("dialog").wait_for(state="hidden", timeout=30000)
        await page.get_by_role("tab", name="Stories", exact=True).click()
        await page.get_by_role("heading", name="Automatic Status Product", exact=True).wait_for(timeout=30000)
        assert await page.get_by_role("heading", name="Automatic Status Product", exact=True).count() == 1
        await page.get_by_role("tab", name="Products (1)", exact=True).click()
        await page.get_by_role("button", name="Edit", exact=True).click()
        await page.get_by_label("Description", exact=True).fill("Edited automatic status verification")
        await page.get_by_role("button", name="Save changes", exact=True).click()
        await page.get_by_role("dialog").wait_for(state="hidden", timeout=30000)
        await page.get_by_role("tab", name="Stories", exact=True).click()
        assert await page.get_by_role("heading", name="Automatic Status Product", exact=True).count() == 1
        visitor = await browser.new_context()
        home = await visitor.new_page()
        await home.goto("http://localhost:8080/", wait_until="networkidle")
        await home.get_by_role("button", name=f"New statuses: {shop} — 1 updates", exact=True).click(timeout=30000)
        link = home.get_by_role("link", name="Shop this deal", exact=True)
        await link.wait_for()
        target = await link.get_attribute("href")
        assert target and target.startswith("/products/p")
        if os.environ.get("AUTO_STATUS_SCREENSHOT"):
            await home.get_by_role("dialog").screenshot(path=os.environ["AUTO_STATUS_SCREENSHOT"])
        await link.click()
        assert home.url.endswith(target)
        print("PASS: product automatically posted once to status, edits did not duplicate it, visitor opened the linked product")
        await browser.close()

asyncio.run(main())