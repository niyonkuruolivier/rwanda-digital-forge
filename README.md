# Murandasi Marketplace

Create a fully responsive, modern multi-vendor e-commerce marketplace web application named "Murandasi Market". The app should allow independent sellers/vendors to register, create their own store profiles, and post products, while shoppers can browse items from multiple vendors, add them to a single cart, and check out.

### Design & Aesthetic Guidelines:
- Match the clean, modern aesthetic of https://murandasi.lovable.app.
- Color Palette:
  - Primary (Brand): Deep Trust Blue / Rich Teal (#0F172A / #0D9488) for navigation headers, main CTAs, and key brand elements.
  - Secondary (Accent): Vibrant Coral / Warm Orange (#F97316) for sale badges, discount tags, and highlight buttons.
  - Background: Clean Off-White (#F8FAFC) for page background.
  - Cards & Surfaces: Crisp White (#FFFFFF) for product cards, vendor boxes, and modal containers.
  - Text: Dark Slate (#334155) for high-readability body text.
- Typography: Clean sans-serif font family, clear heading hierarchy, subtle shadows (shadow-sm, shadow-md) for cards.

### Core User Roles & Navigation:
1. Shoppers / Buyers: Can browse, search, filter by category/vendor, add items from multiple vendors to one cart, and view individual vendor store pages.
2. Vendors / Sellers: Can register for a vendor account, access a dedicated "Vendor Dashboard" to manage inventory, add new products, edit pricing/stock, and view incoming orders.
3. Administrator: Platform oversight access.

### Key Pages & Features to Build:

1. Homepage:
   - Sticky Header with Logo ("Murandasi Market"), Global Search bar with category dropdown, "Become a Vendor" button, Wishlist icon, and Cart icon with live item badge.
   - Hero Banner showcasing trending marketplace collections with a prominent "Shop Now" and "Start Selling" CTA.
   - Featured Categories grid (e.g., Electronics, Fashion, Home Decor, Art, Services).
   - Trending Products grid with product cards showing Image, Title, Price, Vendor Name, Rating, and "Add to Cart" button.
   - Top-Rated Vendors section highlighting individual stores.

2. Vendor Storefront Page:
   - Dedicated public page for each vendor showing their Store Banner, Logo, Bio, Vendor Rating, and a filtered product grid showing only items belonging to that specific vendor.

3. Product Detail Page:
   - High-resolution image gallery (main image + thumbnails).
   - Product Title, Price, Stock Status, and Vendor attribution link (clicking takes user to the vendor's store).
   - "Add to Cart" and "Buy Now" buttons, plus customer reviews and ratings section.

4. Vendor Dashboard (Protected View for Sellers):
   - Overview metrics cards: Total Sales, Total Revenue, Active Listings, Pending Orders.
   - "Add New Product" modal/form: Input fields for Product Title, Category, Price, Stock Quantity, Image URL/Upload mock, and Description.
   - Product Management Table: List of current products with options to edit or delete.
   - Orders Management Tab: View orders placed by customers for their specific items, with status dropdown (Pending, Processing, Shipped, Delivered).

5. Unified Cart & Checkout Flow:
   - Slide-over or dedicated Cart Page grouping items clearly by Vendor.
   - Subtotal calculation, platform service fee, and total amount.
   - Mock Checkout form collecting shipping address and payment method (e.g., Mobile Money / Credit Card simulation) with a successful order confirmation screen.

### Technical Implementation Details:
- Use React, Tailwind CSS, and Lucide React icons.
- Build clean, modular components for Product Cards, Navbar, Footer, Vendor Dashboard tables, and Cart drawers.
- Implement robust mock state management (using React Context or local storage state) so users can realistically add/remove items from the cart, toggle between buyer view and vendor dashboard, and dynamically add new products to the marketplace feed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://murandasi-marketplace.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10c03105-591d-4d3c-8271-3d16c3c3df66).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
