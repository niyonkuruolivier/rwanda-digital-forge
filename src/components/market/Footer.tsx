import { Link } from "@tanstack/react-router";
import logo from "@/assets/murandasi-logo.png.asset.json";
export function Footer() {
  return (
    <footer className="mt-12 border-t bg-card text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3 px-4 py-6 sm:gap-6 sm:py-8">
        <div><Link to="/" aria-label="Murandasi home"><img src={logo.url} alt="MURANDASI.COM" className="h-auto w-[110px] object-contain sm:w-[220px]" width={1920} height={640} /></Link></div>
        <div className="space-y-2 text-xs sm:text-sm"><p className="font-semibold">Shop</p><Link to="/shop" className="block opacity-70 hover:opacity-100">All products</Link><Link to="/wishlist" className="block opacity-70 hover:opacity-100">Wishlist</Link><Link to="/cart" className="block opacity-70 hover:opacity-100">Cart</Link></div>
        <div className="space-y-2 text-xs sm:text-sm"><p className="font-semibold">Sell</p><Link to="/become-vendor" className="block opacity-70 hover:opacity-100">Become a vendor</Link><Link to="/dashboard" className="block opacity-70 hover:opacity-100">Vendor dashboard</Link></div>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 Murandasi Market · Rwanda · <Link to="/privacy" className="underline hover:text-foreground">Privacy policy</Link></p>
    </footer>
  );
}
