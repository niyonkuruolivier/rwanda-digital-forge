# Murandasi Market launch audit — 18 November 2026

## Verdict: not ready for real-money public launch

This pass inspected account access, catalog saves, buyer/vendor order paths, inventory, dashboard finances, route metadata, database policies and dependencies. It is not a certification or a claim that every requested feature is complete.

## Fixed and verified
- New Cloud orders atomically reserve catalog inventory; concurrent purchases of the final unit accept exactly one request and reject the other. Entire rejected orders roll back.
- Inventory history stores before/after quantities with seller-only/admin reads; seller dashboard exposes history and low-stock notices.
- Cart quantity limits sum all variations of the same product; seller order totals count orders rather than purchased rows.
- Commission labels now match 13% platform / 87% vendor. Ledger rounding matches individual item balances.
- Account order displays no longer merge legacy device-local demonstration customer records. Those original local records are preserved, not deleted.
- Demo withdrawals are disabled, not promoted into real payouts. Card number/expiry/CVC collection was removed from demo checkout.
- Dependency fixes: Zod 4.6.7, Seroval 1.8.1, source-map-js 1.2.2 and js-yaml 4.3.2. Existing 24-hour package-age safeguard preserved.
- Restricted sellers cannot retrieve customer orders/items via direct authenticated requests. Buyers retain their own orders; admin access remains.
- Delivery status updates cannot move backwards. Complaint resolution requires an existing open complaint.
- Added private-order lookup indexes and restricted unnecessary public function execution.

## Evidence
- Full regression suite: 27 test files, 136 tests passed before final ledger rounding test; final rerun recorded in completion checks.
- Browser: buyer checkout saved an actual Cloud record; buyer read it on My orders after navigation; separate seller saw inventory decrease 2 → 1 and its history; seller shipped with courier phone; buyer saw those details after reload.
- Concurrency: two simultaneous requests for remaining stock 1 produced one saved order and one Quantity unavailable response; total recorded reservations 2.
- Direct access: unrelated buyer inventory history returned zero rows; guest order reads returned zero rows; blocked seller orders/items returned zero rows.
- Desktop 1280×1800 and mobile 394×634: public pages loaded without page errors or horizontal overflow; account denied buyer entry to admin.
- Temporary store/product/orders/inventory/moderation/role records were removed; existing records were not modified.
- Each content route has app-specific head metadata. Latest preview build logs report build OK.
- Deep scan completed; its blocked-seller customer-access finding was fixed and marked resolved. Prior intentionally-public catalog/category warnings were left untouched.

## Remaining launch gaps and limitations
1. **Payment verification and payouts:** no merchant gateway. Checkout still creates explicitly marked DEMO payments; no bank or Mobile Money charge or refund is performed. Requires merchant/provider configuration and secure payment callbacks before enabling real sales or withdrawals. Current stock reservation is for saved demo orders, not verified real payment.
2. **Payment lifecycle:** pending reservations, expiration, idempotency keys, gateway reconciliation, real refunds, cancellation/restocking and durable payout requests still need a real payment contract. Do not launch real-money checkout as-is.
3. **Product lifecycle:** products support creation/edit/delete, images, descriptions, categories, stock, discounts and options; separate publish/unpublish, subcategories, product approval workflow and per-variation inventory are not implemented. Existing store approval is not product approval.
4. **Order lifecycle:** current statuses are Pending, Processing, Shipped and Delivered. Acceptance/rejection/cancellation are absent, and their refund/restock effects require agreed rules.
5. **Account recovery:** Google broker path exists; email/password signup UI can disagree with hosted disabled-signup policy. Password-reset/change flow and hosted recovery email delivery are not verified. Google account consent was not completed in this audit.
6. **Admin completeness:** account list and existing application/moderation code were inspected, but no real administrator session was used for full application approval/rejection and account-list completeness checks. Large account lists can exceed default database row limits.
7. **Analytics integrity:** private participant-scoped orders cannot supply global best-seller totals to public visitors. Global verified sales ranking/analytics needs a safe aggregate derived from real completed payments. Seed catalog/stories/reviews remain illustrative; they must not be represented as genuine merchant inventory or reviews at launch.
8. **Persistence:** saved products, cart and notification reads remain per-device. Notification delivery/email/WhatsApp automation is not integrated.
9. **Dependency advisory:** picomatch 4.0.7 remains flagged through build tooling; registry latest is 4.0.7, while scan requires >4.0.7. No published fixed version was available; not suppressed or marked fixed.
10. **Performance/operations:** browser smoke tests and lookup indexes are not load testing. Backup restore, monitoring/alerts, transactional emails, retention policy, upload abuse controls, realistic catalog pagination and published-runtime stress tests are not certified.

The submitted master prompt stops at “Cancelled” in vendor analytics. Remaining admin/buyer-specific checklist sections were not provided. Existing branding and layout were preserved throughout.