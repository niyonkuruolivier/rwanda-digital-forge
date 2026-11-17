# Separate authenticated accounts
- [x] Connect new orders across buyer/vendor accounts with private driver contacts, destination and shipment updates; verified buyer checkout, seller shipping details, live buyer updates, reload persistence and buyer confirmation. Payments remain demo; legacy browser orders are not imported.
- [x] Add quick discounts on existing seller products, a homepage discount section and a shop discount filter; verified seller saving/removing 20%, separate visitor visibility and restored price. Discount, product form and homepage tests pass.
- [x] Rank homepage products by completed sold quantities independently of store stars; tested unpaid/refunded exclusions and verified best-seller first in the browser.
- [x] Add deliberate visitor store ratings and average/count display; verify saved and changed ratings across visitors and homepage ordering by ratings, completed sales, then last-30-day sales.
- [x] Restore the photo gallery with a video thumbnail beside the ordered photos; tapping switches between photos and the official video player.
- [x] Show ordered photos followed immediately by video; one link field detects YouTube, Instagram posts/Reels and full TikTok video links. Verified the actual two-photo product followed by playing YouTube video on mobile without overflow; Instagram/TikTok official players render but sample playback was unavailable externally.
- [x] Let administrators change category cover pictures and remove seller products/stories with protected Cloud actions; verified a saved compressed category picture and temporary product deletion in a separate visitor session, then removed test records. Permission/schema tests pass.
- [x] Add multiple ordered product photos and an optional final YouTube video; form submission/editing tests pass, visitor photo browsing and visible YouTube embed verified on desktop, phone layout has no overflow.
- [ ] Verify publishing the new media from a real seller account and reading it in a separate visitor session; blocked because the current signed-in account has no seller access.
- [x] Require exactly one recognized category per product and add administrator-created shared categories across seller forms and browsing; verified administrator-added Furniture, missing-category blocking and seller publishing into its public filter.
- [x] Share seller products, stories and store edits through Cloud with verified ownership and live updates; verified seller publishing to a separate visitor, profile updates and deletion.
- [x] Add approval congratulations, mandatory rejection reasons, and correction/reapplication; verify saved review outcomes.
- [x] Show pending vendor status and automatically activate approved seller accounts without another login.
- [x] Add Google customer/seller login and administrator email login with server-verified roles.
- [x] Keep profiles and seller applications separate, remove demo role switching, and verify administrator login, profile saving and sign-out.

# Marketplace simplification

- [x] Simplify the home page, navigation, product cards and store page using the supplied shopping references.
- [x] Keep search, saved products, cart, seller tools and demo checkout accessible.
- [x] Verify shopping on phone and desktop and preserve RWF pricing.

# Demo client account
- [x] Add a photo/cover client profile with shopping details, saved items and purchases.
- [x] Make the account visible in navigation and link Become a vendor.
- [x] Verify profile editing, client purchases and mobile/desktop layouts.

# Seller profile editing
- [x] Match the dashboard profile to the public storefront and edit name, location, bio and photos.
- [x] Verify saved details and compressed photos appear in both views on phone and desktop.

# Site-wide return navigation
- [x] Add missing Back controls and retain cover-photo placement on profiles.
- [x] Verify all page types and returning to previous shopping results.

# Buyer purchase and complaint records
- [x] Show complete purchase history, release reasons, and retained complaint photos/messages.
- [x] Save purchased shop details and add seller phone/contact access.
- [x] Require complaint evidence, hold only the affected purchase, and verify buyer/seller/admin flow.

# Deal stories and live links
- [x] Add a photo-story strip and viewer to home and shop.
- [x] Add seller story publishing, live-link updates, and story removal to the mock marketplace.
- [x] Verify publishing, live badges, links, and mobile/desktop viewing.

# Manual photo uploads
- [x] Share compression across product, story, and store photo selection; remove automatic photos for newly created content.
- [x] Verify uploaded photos are under 30 KB and remain visible after saving on phones.

# Completed demo payments
- [x] Record payment confirmation only after demo checkout finishes.
- [x] Show paid purchases and demo payment references in the matching vendor dashboard and notifications.
- [x] Verify unpaid filtering and the checkout-to-vendor flow.

# Complete demo admin dashboard
- [x] Add vendor appeals and administrator decisions; add customer product/shop feedback with account name/photo and up to three compressed photos; verify appeal submission/response and product/shop feedback persistence.
- [x] Require bank/Mobile Money recipient details and registered name on withdrawals; retain and display details in both histories; validation tests pass (full vendor submission not verified because the available vendor is blocked).
- [x] Lock blocked/suspended vendor accounts across the platform, show reasons/end dates, and verify blocked page access, Cloud write denial, sign-out, and timed restoration rules.
- [x] Add suspension days and end dates to both dashboards; verify timed release and manual unblock/unsuspend.
- [x] Add reason-required block/suspend controls, restore actions, and matching vendor notices; verify persistence and selling restrictions.
- [x] Add money overview, per-vendor balances, buyers, products, orders and activity.
- [x] Add vendor application review and reversible vendor blocking in the demo.
- [x] Bring complaints and withdrawals together and verify admin actions on desktop/mobile.

# Vendor qualification and agreement
- [x] Add a professional pre-submission preview and company signature/stamp to new vendor agreements; verify preview, submission and Word export.
- [x] Require business registration, TIN, RDB certificate and individual policy acknowledgements with signed name/date.
- [x] Retain the submitted agreement and certificate for vendor/admin; add Word download and printing without deletion.
- [x] Verify required conditions, submission, review, retention and document layout on mobile/desktop.