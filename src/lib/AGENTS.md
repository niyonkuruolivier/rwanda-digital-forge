# Store ratings
- Store ratings use owner-scoped Cloud rows and anonymous aggregate-only reads; shared store scores ignore catalog defaults, and homepage ranking uses average/count then paid units and last-30-day paid units (sales remain browser-demo data).
- Homepage product ordering sums completed-payment item quantities, excludes refunds, and uses posting date only for sales ties; shop rating never drives product order.
