# Store ratings
- New checkout orders and delivery updates use private participant-scoped Cloud order/item rows; server-derived catalog snapshots and transactional RPCs prevent buyer price edits and seller access to other sellers’ items. Payments and withdrawals remain demonstrations; legacy browser orders are not imported.
- Discount browsing derives from catalog price/compareAt; quick discount edits preserve the whole product and original price, using the existing owner-verified catalog save path.
- Store ratings use owner-scoped Cloud rows and anonymous aggregate-only reads; shared store scores ignore catalog defaults, and homepage ranking uses average/count then paid units and last-30-day paid units (sales remain browser-demo data).
- Homepage product ordering sums completed-payment item quantities, excludes refunds, and uses posting date only for sales ties; shop rating never drives product order.
- Agreement Word exports decode company assets and encode PNG bytes in the browser because asset delivery can return WebP regardless of the uploaded filename.
- Admin account lists come from an admin-verified server function reading auth users with roles/profiles, so emails never reach non-admins.
