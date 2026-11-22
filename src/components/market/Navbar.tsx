import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Menu, ShoppingCart, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import logo from "@/assets/murandasi-logo.png.asset.json";
import { Notifications } from "@/components/market/Notifications";
import { SearchBox } from "@/components/market/SearchBox";

const badgeClass = "absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground";

export function Navbar() {
  const { cartCount, wishlist, setCartOpen, buyer } = useStore();
  const auth = useAuth(); const queryClient = useQueryClient();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const accountPage = ["/auth", "/account", "/dashboard", "/admin", "/orders", "/messages", "/become-vendor"].includes(pathname) || pathname.startsWith("/vendors/");
  const menu = (mobile = false) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size={mobile ? "default" : "icon"} aria-label={mobile ? "More options" : "Account menu"} className={mobile ? "h-14 flex-col gap-1 px-3 text-[11px]" : ""}>{mobile ? <Menu className="size-5" /> : buyer.photo ? <img src={buyer.photo} alt="" width={32} height={32} className="size-8 rounded-full border border-primary/30 object-cover" /> : <UserRound className="size-5" />}{mobile && "More"}</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={mobile ? "top" : "bottom"} className="w-56">
        <DropdownMenuItem asChild><Link to="/account"><UserRound />My account</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/orders">My orders</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/messages">Messages</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/become-vendor"><Store />Start selling</Link></DropdownMenuItem>
        {auth.role === "vendor" && <DropdownMenuItem asChild><Link to="/dashboard">Seller dashboard</Link></DropdownMenuItem>}
        {auth.role === "admin" && <DropdownMenuItem asChild><Link to="/admin">Administrator dashboard</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{auth.user ? "Your account" : "Account access"}</DropdownMenuLabel>
        {auth.user ? <DropdownMenuItem onSelect={async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await auth.refresh(); await nav({ to: "/auth", search: { next: "/account" }, replace: true }); }}>Sign out</DropdownMenuItem> : <DropdownMenuItem asChild><Link to="/auth" search={{ next: "/account" }}>Sign in</Link></DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const mobileClass = "h-14 flex-col gap-1 px-3 text-[11px]";
  const avatar = (mobile = false) => auth.user ? (
    <Button asChild variant={mobile ? "outline" : "ghost"} size="icon" className="shrink-0" title="My account">
      <Link to="/account" aria-label="My account">{buyer.photo ? <img src={buyer.photo} alt="" width={32} height={32} className="size-8 rounded-full border border-primary/30 object-cover object-[center_35%]" /> : <UserRound />}</Link>
    </Button>
  ) : <Button asChild variant={mobile ? "outline" : "ghost"} size="sm" className={mobile ? "h-9 px-4 text-sm" : ""}><Link to="/auth" search={{ next: "/account" }}>Sign in</Link></Button>;
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-card text-heading">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:gap-4">
          <Link to="/" aria-label="Murandasi home" className="block shrink-0"><img src={logo.url} alt="MURANDASI.COM" className="h-auto w-[150px] object-contain md:w-[200px]" width={1920} height={640} /></Link>
          {/* Mobile-only quick actions */}
          <span className="ml-auto md:hidden"><Notifications triggerVariant="outline" /></span>
          <span className="md:hidden">{avatar(true)}</span>
          {!accountPage && <SearchBox />}
          {/* Desktop action bar */}
          <div className="hidden items-center gap-1 md:ml-auto md:flex">
            <Button asChild variant="ghost"><Link to="/shop" search={{}}>Shop</Link></Button>
            <Notifications />
            <Button asChild variant="ghost" size="icon" className="relative" title="Saved products">
              <Link to="/wishlist" aria-label="Saved products"><Heart />{wishlist.length > 0 && <span className={badgeClass}>{wishlist.length}</span>}</Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)} aria-label="Cart" title="Cart">
              <ShoppingCart />{cartCount > 0 && <span className={badgeClass}>{cartCount}</span>}
            </Button>
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            {auth.user ? menu() : avatar()}
          </div>
        </div>
      </header>
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-card px-2 pb-[env(safe-area-inset-bottom)] pt-1 md:hidden">
        <Button asChild variant={pathname === "/" ? "secondary" : "ghost"} className={`${mobileClass} ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}><Link to="/" aria-current={pathname === "/" ? "page" : undefined}><Home />Home</Link></Button>
        <Button asChild variant={pathname === "/shop" ? "secondary" : "ghost"} className={`${mobileClass} ${pathname === "/shop" ? "text-primary" : "text-muted-foreground"}`}><Link to="/shop" search={{}}><LayoutGrid />Shop</Link></Button>
        <Button asChild variant={pathname === "/wishlist" ? "secondary" : "ghost"} className={`${mobileClass} text-muted-foreground`}><Link to="/wishlist"><Heart />Saved{wishlist.length > 0 ? ` (${wishlist.length})` : ""}</Link></Button>
        <Button asChild variant={pathname === "/cart" ? "secondary" : "ghost"} className={`${mobileClass} text-muted-foreground`}><Link to="/cart"><ShoppingCart />Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link></Button>
        {menu(true)}
      </nav>
    </>
  );
}
