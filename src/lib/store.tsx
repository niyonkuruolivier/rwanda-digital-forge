import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_IMAGES, SEED_PRODUCTS, VENDORS, type Order, type OrderItem, type OrderStatus, type Product, type Vendor } from "./data";
import { SEED_STORIES, validateStory, type DealStory } from "./stories";
import { demoPaymentConfirmation, hasCompletedPayment } from "./orders";
import { prepareWithdrawal, vendorBalance, type Withdrawal, type WithdrawalRecipient } from "./withdrawals";
import { DEMO_BUYER, linkDemoBuyer, type BuyerProfile } from "./buyer";
import { retainPurchaseShops, samePurchase, submitPurchaseComplaint } from "./purchase-history";
import { canVendorTrade, vendorAccountRestricted, moderateVendor, reviewApplication, type VendorApplication, type AdminEvent } from "./admin";
import { validateAgreement, type VendorAgreement } from "./vendor-agreement";
import { useAuth } from "./auth";
import { hasSellerAccess } from "./account-access";
import { supabase } from "@/integrations/supabase/client";
import { moderateVendorAccount, reviewAccountApplication } from "./account.functions";
import { publishCatalog, removeCatalogPost, updateCategoryPicture } from "./catalog.functions";
import { useServerFn } from "@tanstack/react-start";
import { sharedCatalog } from "./catalog";
import { useQuery } from "@tanstack/react-query";
import { ratedVendors } from "./store-ratings";
import { createSharedOrder, listSharedOrders, saveDelivery, reviewSharedItem } from "./shared-orders.functions";
import type { Delivery } from "./delivery";
import { availableCartQuantity } from "./inventory";
import { verifiedVendors } from "./vendor-verification";
import { setVendorVerification } from "./vendor-verification.functions";

export type Role = "buyer" | "vendor" | "admin";
interface CartLine { productId: string; qty: number; options?: Record<string, string> | undefined }
const sameLine = (l: CartLine, productId: string, options?: Record<string, string>) =>
  l.productId === productId && JSON.stringify(l.options ?? {}) === JSON.stringify(options ?? {});
interface State { products: Product[]; vendors: Vendor[]; cart: CartLine[]; wishlist: string[]; orders: Order[]; role: Role; myVendorId: string; stories: DealStory[]; readNotificationIds: string[]; withdrawals: Withdrawal[]; buyer: BuyerProfile; applications: VendorApplication[]; adminEvents: AdminEvent[] }

// Demo pending-payment rows: paid a few hours ago so the two-day hold is still running.
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const initial: State = { products: SEED_PRODUCTS, vendors: VENDORS, cart: [], wishlist: [], orders: ([
  { id: "MM-1004", ...demoPaymentConfirmation("1004", hoursAgo(5)), date: hoursAgo(5).slice(0, 10), customer: "Diane Uwase", phone: "+250788000004", address: "KK 15 Rd, Kigali", payment: "Mobile Money", total: 70000, items: [
    { productId: "p10", vendorId: "nest-and-weave", title: "Hand-Glazed Ceramic Vase", price: 70000, qty: 1, image: SEED_PRODUCTS[9]!.images[0]!, status: "Delivered", options: { Color: "Teal" },
      claim: { message: "The vase arrived cracked on one side. I would like a replacement or a refund.", createdAt: hoursAgo(2), status: "open" } } ] },
  { id: "MM-1003", ...demoPaymentConfirmation("1003", hoursAgo(3)), date: hoursAgo(3).slice(0, 10), customer: "Jean Bosco", phone: "+250788000003", address: "KN 3 Rd, Kigali", payment: "Mobile Money", total: 76500, items: [
    { productId: "p6", vendorId: "urban-threads", title: "Classic Canvas Sneakers", price: 76500, qty: 1, image: SEED_PRODUCTS[5]!.images[0]!, status: "Shipped", options: { Size: "42", Color: "White" } } ] },
  { id: "MM-1005", ...demoPaymentConfirmation("1005", hoursAgo(6)), date: hoursAgo(6).slice(0, 10), customer: "Claudine Irakoze", phone: "+250788000005", address: "KG 7 Ave, Kigali", payment: "Mobile Money", total: 115500, items: [
    { productId: "p2", vendorId: "kigali-tech", title: "Smart Watch Series 5", price: 115500, qty: 1, image: SEED_PRODUCTS[1]!.images[0]!, status: "Processing", options: { Color: "Black", Size: "44mm" } } ] },
  { id: "MM-1001", ...demoPaymentConfirmation("1001", "2026-11-10T10:00:00Z"), date: "2026-11-10", customer: "Aline Mukamana", phone: "+250788000001", address: "KG 11 Ave, Kigali", payment: "Mobile Money", total: 227850, items: [
    { productId: "p1", vendorId: "kigali-tech", title: "Wireless Noise-Cancelling Headphones", price: 167500, qty: 1, image: SEED_PRODUCTS[0]!.images[0]!, status: "Pending" },
    { productId: "p9", vendorId: "nest-and-weave", title: "Agaseke Woven Basket", price: 49500, qty: 1, image: SEED_PRODUCTS[8]!.images[0]!, status: "Shipped" } ] },
  { id: "MM-1002", ...demoPaymentConfirmation("1002", "2026-11-12T10:00:00Z"), date: "2026-11-12", customer: "Eric Niyonzima", phone: "+250788000002", address: "Huye Main Rd", payment: "Credit Card", total: 121275, items: [
    { productId: "p2", vendorId: "kigali-tech", title: "Smart Watch Series 5", price: 115500, qty: 1, image: SEED_PRODUCTS[1]!.images[0]!, status: "Processing" } ] },
] satisfies Order[]).map(linkDemoBuyer), buyer: DEMO_BUYER, role: "buyer", myVendorId: "kigali-tech", stories: SEED_STORIES, readNotificationIds: [], withdrawals: [
  { id: "WD-1001", vendorId: "kigali-tech", amount: 150750, requestedAt: hoursAgo(30), status: "Paid", paidAt: hoursAgo(26) },
  { id: "WD-1002", vendorId: "kigali-tech", amount: 103950, requestedAt: hoursAgo(4), status: "Requested" },
] , applications: [{ id: "APP-DEMO-1", buyerId: "demo-applicant", applicant: "Demo applicant", email: "", submittedAt: hoursAgo(2), status: "Pending", vendor: { id: "demo-new-store", name: "Demo Kigali Crafts", bio: "Handmade gifts and home accessories.", location: "Kigali", phone: "", logo: VENDORS[1]?.logo ?? "", banner: VENDORS[1]?.banner ?? "", rating: 0, joined: "2026" } }], adminEvents: [] };

const KEY = "murandasi-market-v5";

function useStoreValue() {
  const auth = useAuth();
  const verification = useQuery({ queryKey: ["vendor-verification"], queryFn: async () => { const result = await supabase.from("vendor_verification").select("vendor_id,verified"); if (result.error) throw result.error; return result.data; }, refetchInterval: 15000, refetchOnWindowFocus: true });
  const saveVerification = useServerFn(setVendorVerification);
  const ratings = useQuery({ queryKey: ["store-ratings"], queryFn: async () => { const result = await supabase.rpc("public_store_ratings"); if (result.error) throw result.error; return result.data; }, refetchInterval: 30000, refetchOnWindowFocus: true });
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(CATEGORY_IMAGES);
  const removePost = useServerFn(removeCatalogPost);
  const savePicture = useServerFn(updateCategoryPicture);
  const createOrder = useServerFn(createSharedOrder);
  const fetchOrders = useServerFn(listSharedOrders);
  const updateDelivery = useServerFn(saveDelivery);
  const reviewPurchase = useServerFn(reviewSharedItem);
  const sharedOrders = useQuery({ queryKey: ["shared-orders", auth.user?.id], queryFn: () => fetchOrders(), enabled: !!auth.user, refetchInterval: 15000, refetchOnWindowFocus: true });
  useEffect(() => {
    if (!auth.user) return;
    const channel = supabase.channel(`orders-${auth.user.id}-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "shared_order_items" }, () => { void sharedOrders.refetch(); }).on("postgres_changes", { event: "*", schema: "public", table: "shared_orders" }, () => { void sharedOrders.refetch(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [auth.user?.id, sharedOrders.refetch]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("product_categories").select("name,image").order("created_at");
      if (active && !error && data) {
        setCategories([...new Set([...CATEGORIES, ...data.map((category) => category.name)])]);
        setCategoryImages({ ...CATEGORY_IMAGES, ...Object.fromEntries(data.filter((row) => row.image).map((row) => [row.name, row.image])) });
      }
    };
    void load();
    const channel = supabase.channel(`categories-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "product_categories" }, () => { void load(); }).subscribe();
    window.addEventListener("focus", load);
    const timer = window.setInterval(() => { void load(); }, 15000);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", load); void supabase.removeChannel(channel); };
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        // Shared catalog loads separately; browser copies cannot overwrite public seller posts.
        setS({ ...initial, ...saved, vendors: initial.vendors, buyer: { ...DEMO_BUYER, ...saved.buyer }, orders: (saved.orders ?? initial.orders).map(linkDemoBuyer).map((order) => retainPurchaseShops(order, saved.vendors ?? initial.vendors)), products: initial.products, stories: initial.stories, withdrawals: saved.withdrawals ?? [] });
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { const { buyer, applications, role, myVendorId, ...demo } = s; localStorage.setItem(KEY, JSON.stringify(demo)); } catch { /* Browser demo persistence is best-effort. */ } } }, [s, ready]);
  const [moderation, setModeration] = useState<Record<string, { status: "Active" | "Blocked" | "Suspended"; reason: string; suspendedUntil?: string | undefined }>>({});
  const [moderationIdentity, setModerationIdentity] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("marketplace_content").select("kind,id,vendor_id,record,deleted,created_at").order("updated_at");
      if (!active || error || !data) return;
      setS((previous) => ({ ...previous, ...sharedCatalog(data, initial) }));
    };
    void load();
    const channel = supabase.channel(`catalog-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "marketplace_content" }, () => { void load(); }).subscribe();
    const timer = window.setInterval(() => { void load(); }, 15000);
    window.addEventListener("focus", load);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", load); void supabase.removeChannel(channel); };
  }, []);
  useEffect(() => {
    setCartOpen(false);
    setS((p) => ({ ...p, cart: [], wishlist: [], readNotificationIds: [], applications: [] }));
  }, [auth.user?.id]);
  useEffect(() => {
    setS((p) => ({ ...p, buyer: auth.profile ?? { id: "guest", name: "", email: "", phone: "", city: "", address: "", photo: "", cover: "" }, role: auth.role, myVendorId: auth.vendorId }));
    if (!auth.user || !auth.profile) return;
    let active = true;
    const loadApplications = () => { void supabase.from("vendor_applications").select("record,status").order("submitted_at", { ascending: false }).then(({ data }) => {
      if (!active || !data) return;
      const applications = data.map((row) => ({ ...(row.record as unknown as VendorApplication), status: row.status as VendorApplication["status"] }));
      setS((p) => ({ ...p, applications }));
    }); };
    loadApplications();
    const channel = supabase.channel(`vendor-applications-${auth.user.id}-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vendor_applications" }, () => { loadApplications(); void auth.refresh(); })
      .subscribe();
    const onFocus = () => { loadApplications(); };
    window.addEventListener("focus", onFocus);
    return () => { active = false; void supabase.removeChannel(channel); window.removeEventListener("focus", onFocus); };
  }, [auth.user?.id, auth.profile, auth.role, auth.vendorId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [publicRows, privateRows] = await Promise.all([
        supabase.rpc("vendor_trading_statuses"),
        auth.user ? supabase.from("vendor_moderation").select("vendor_id,status,reason,suspended_until") : Promise.resolve({ data: [] }),
      ]);
      if (!active) return;
      if (publicRows.error || ("error" in privateRows && privateRows.error)) { setModerationError(true); return; }
      setModerationError(false);
      setModerationIdentity(auth.user?.id ?? "guest");
      const next: Record<string, { status: "Active" | "Blocked" | "Suspended"; reason: string; suspendedUntil?: string | undefined }> = {};
      for (const row of publicRows.data ?? []) {
        if (row.status === "Active" || row.status === "Blocked" || row.status === "Suspended") next[row.vendor_id] = { status: row.status, reason: "" };
      }
      for (const row of privateRows.data ?? []) {
        if (row.status === "Active" || row.status === "Blocked" || row.status === "Suspended") next[row.vendor_id] = { status: row.status === "Suspended" && row.suspended_until && Date.parse(row.suspended_until) <= Date.now() ? "Active" : row.status, reason: row.reason, suspendedUntil: row.suspended_until ?? undefined };
      }
      setModeration(next);
    };
    void load();
    const channel = supabase.channel(`moderation-${auth.user?.id ?? "guest"}-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "vendor_moderation" }, () => { void load(); }).subscribe();
    const timer = setInterval(() => { void load(); }, 30000);
    const onFocus = () => { void load(); };
    window.addEventListener("focus", onFocus);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", onFocus); void supabase.removeChannel(channel); };
  }, [auth.user?.id, auth.role]);

  return useMemo(() => {
    const vendors = verifiedVendors(ratedVendors(s.vendors, ratings.data ?? []), verification.data ?? []).map((v) => moderation[v.id] ? { ...v, status: moderation[v.id]?.status ?? "Active", blockedReason: moderation[v.id]?.reason ?? "", suspendedUntil: moderation[v.id]?.suspendedUntil } : v);
    const accountAccessPending = auth.role === "vendor" && moderationIdentity !== auth.user?.id;
    const restriction = moderation[auth.vendorId];
    const accountRestriction = restriction ? { id: auth.vendorId, status: restriction.status, blockedReason: restriction.reason, suspendedUntil: restriction.suspendedUntil } as Vendor : undefined;
    const accountRestricted = vendorAccountRestricted(auth.role, accountRestriction);
    const denyActivity = accountAccessPending || (auth.role === "vendor" && moderationError) || accountRestricted;
    const mutate = (update: (previous: State) => State) => { if (!denyActivity) setS(update); };
    const product = (id: string) => s.products.find((p) => p.id === id);
    const vendor = (id: string) => vendors.find((v) => v.id === id);
    const cartLines = s.cart.flatMap((l) => { const item = product(l.productId); return item ? [{ ...l, product: item }] : []; });
    // Legacy browser demonstrations remain saved but are never shared as account records.
    const allOrders = auth.user ? sharedOrders.data ?? [] : [];
    return {
      ordersPending: !!auth.user && sharedOrders.isPending, ordersError: sharedOrders.isError,
      ratingsPending: ratings.isPending, ratingsError: ratings.isError,
      verificationPending: verification.isPending, verificationError: verification.isError,
      setVendorVerified: async (vendorId: string, verified: boolean) => {
        await saveVerification({ data: { vendorId, verified } });
        await verification.refetch();
      },
      ...s, vendors, categories, categoryImages, role: auth.role, myVendorId: auth.vendorId, buyer: auth.profile ?? { id: "guest", name: "", email: "", phone: "", city: "", address: "", photo: "", cover: "" }, product, vendor, cartLines, accountRestricted, accountRestriction, accountAccessPending, accountAccessError: auth.role === "vendor" && moderationError, cartOpen: denyActivity ? false : cartOpen, setCartOpen: (open: boolean) => { if (!denyActivity) setCartOpen(open); },
      saveCategoryPicture: async (name: string, image: string) => {
        const result = await savePicture({ data: { name, image } });
        setCategoryImages((previous) => ({ ...previous, [result.name]: result.image }));
      },
      orders: allOrders, withdrawals: [] as Withdrawal[],
      placeSharedOrder: async (input: { customer: string; phone: string; address: string; payment: "Mobile Money" | "Credit Card"; items: { productId: string; qty: number; options?: Record<string, string> | undefined }[] }) => {
        if (denyActivity) throw new Error("Your account is blocked or suspended.");
        const id = await createOrder({ data: input });
        const result = await sharedOrders.refetch();
        mutate(p => ({ ...p, cart: [] }));
        return result.data?.find(o => o.id === id) ?? { id, paymentReference: "" };
      },
      saveOrderDelivery: async (item: OrderItem, status: OrderStatus, delivery: Delivery) => {
        if (denyActivity || !item.lineId) throw new Error("Delivery updates are available for shared orders only.");
        await updateDelivery({ data: { id: item.lineId, status, delivery } });
        await sharedOrders.refetch();
      },
      reviewOrderItem: async (item: OrderItem, action: "confirm" | "complaint" | "released" | "refunded", message = "", photo = "") => {
        if (!item.lineId) throw new Error("Shared order required.");
        await reviewPurchase({ data: { id: item.lineId, action, message, photo } });
        await sharedOrders.refetch();
      },
      removeUserPost: async (kind: "product" | "story", id: string) => {
        await removePost({ data: { kind, id } });
        setS((previous) => ({ ...previous, products: kind === "product" ? previous.products.filter((p) => p.id !== id) : previous.products, stories: kind === "story" ? previous.stories.filter((p) => p.id !== id) : previous.stories, cart: kind === "product" ? previous.cart.filter((line) => line.productId !== id) : previous.cart }));
      },
      cartCount: s.cart.reduce((n, l) => n + l.qty, 0),
      addToCart: (productId: string, qty = 1, options?: Record<string, string>) => mutate((p) => {
        const item = p.products.find((x) => x.id === productId);
        if (!item || !canVendorTrade(vendor(item.vendorId))) return p;
        const ex = p.cart.find((l) => sameLine(l, productId, options));
        const others = p.cart.filter(l => l.productId === productId && !sameLine(l, productId, options)).reduce((n, l) => n + l.qty, 0);
        const nextQty = availableCartQuantity(item.stock, (ex?.qty ?? 0) + qty, others);
        if (!nextQty) return p;
        return { ...p, cart: ex ? p.cart.map((l) => sameLine(l, productId, options) ? { ...l, qty: nextQty } : l) : [...p.cart, { productId, qty: nextQty, options }] };
      }),
      setQty: (productId: string, qty: number, options?: Record<string, string>) => mutate((p) => {
        const item = p.products.find(x => x.id === productId);
        const others = p.cart.filter(l => l.productId === productId && !sameLine(l, productId, options)).reduce((n,l) => n + l.qty, 0);
        const nextQty = availableCartQuantity(item?.stock ?? 0, qty, others);
        return { ...p, cart: nextQty <= 0 ? p.cart.filter(l => !sameLine(l, productId, options)) : p.cart.map(l => sameLine(l, productId, options) ? { ...l, qty: nextQty } : l) };
      }),
      clearCart: () => mutate((p) => ({ ...p, cart: [] })),
      toggleWish: (id: string) => mutate((p) => ({ ...p, wishlist: p.wishlist.includes(id) ? p.wishlist.filter((w) => w !== id) : [...p.wishlist, id] })),
      setRole: (_role: Role) => { /* Account roles are assigned only by the server. */ },
      updateBuyer: async (profile: Omit<BuyerProfile, "id">) => {
        if (denyActivity) throw new Error("Your account is blocked or suspended.");
        if (!auth.user) throw new Error("Sign in first.");
        const { name, photo, cover, phone, city, address } = profile;
        const { error } = await supabase.from("profiles").update({ name, photo, cover, phone, city, address }).eq("id", auth.user.id);
        if (error) throw new Error("Could not save your profile.");
        await auth.refresh();
      },
      markNotificationsRead: (ids: string[]) => mutate((p) => ({ ...p, readNotificationIds: [...new Set([...p.readNotificationIds, ...ids])] })),
      saveStory: async (story: DealStory) => {
        if (denyActivity) return "Your account is blocked or suspended.";
        if (!hasSellerAccess(auth.role, auth.vendorId)) return "Approved seller access required.";
        if (!canVendorTrade(vendor(s.myVendorId))) return "Your store is blocked or suspended. Contact the administrator.";
        const error = validateStory(story, s.myVendorId, s.products);
        if (error) return error;
        if (s.stories.some((x) => x.id === story.id && x.vendorId !== s.myVendorId)) return "Choose a story from your store.";
        try { await publishCatalog({ data: { kind: "story", record: story, deleted: false } }); } catch (error) { return error instanceof Error ? error.message : "Could not publish story."; }
        mutate((p) => ({ ...p, stories: [story, ...p.stories.filter((x) => x.id !== story.id)] }));
        return undefined;
      },
      deleteStory: async (id: string) => {
        const story = s.stories.find((item) => item.id === id);
        if (denyActivity || !story) throw new Error("Story unavailable.");
        await publishCatalog({ data: { kind: "story", record: story, deleted: true } });
        mutate((p) => ({ ...p, stories: p.stories.filter((x) => x.id !== id) }));
      },
      upsertProduct: async (prod: Product) => {
        if (denyActivity) throw new Error("Your account is blocked or suspended.");
        await publishCatalog({ data: { kind: "product", record: prod, deleted: false } });
        mutate((p) => ({ ...p, products: p.products.some((x) => x.id === prod.id) ? p.products.map((x) => x.id === prod.id ? prod : x) : [prod, ...p.products] }));
      },
      deleteProduct: async (id: string) => {
        const prod = product(id);
        if (denyActivity || !prod) throw new Error("Product unavailable.");
        await publishCatalog({ data: { kind: "product", record: prod, deleted: true } });
        mutate((p) => ({ ...p, products: p.products.filter((x) => x.id !== id), cart: p.cart.filter((l) => l.productId !== id) }));
      },
      placeOrder: (o: Order) => {
        if (denyActivity || !hasCompletedPayment(o) || o.items.some((i) => !canVendorTrade(vendor(i.vendorId)))) return false;
        mutate((p) => p.orders.some((order) => order.id === o.id) ? p : ({ ...p, orders: [retainPurchaseShops(o, p.vendors), ...p.orders], cart: [], products: p.products.map((x) => { const qty = o.items.filter((i) => i.productId === x.id).reduce((sum, item) => sum + item.qty, 0); return qty ? { ...x, stock: Math.max(0, x.stock - qty) } : x; }) }));
        return true;
      },
      setItemStatus: (orderId: string, productId: string, status: OrderStatus) => mutate((p) => ({ ...p, orders: p.orders.map((o) => o.id !== orderId ? o : { ...o, items: o.items.map((i) => i.productId === productId ? { ...i, status } : i) }) })),
      registerVendor: async (v: Vendor, agreement: VendorAgreement, id: string) => {
        if (denyActivity) return "Your account is blocked or suspended.";
        if (!auth.user) return "Sign in first.";
        const error = validateAgreement(agreement);
        if (error) return error;
        if (!agreement.documentBase64) return "The Word agreement could not be prepared. Try again.";
        if (s.applications.some((a) => a.buyerId === s.buyer.id && a.status === "Pending")) return "Your application is already waiting for admin review.";
        const application: VendorApplication = { id, buyerId: s.buyer.id, applicant: agreement.signedName, email: s.buyer.email, vendor: { ...v }, submittedAt: agreement.submittedAt, status: "Pending", agreement: structuredClone(agreement) };
        const { error: saveError } = await supabase.from("vendor_applications").insert({ id, buyer_id: auth.user.id, record: JSON.parse(JSON.stringify(application)) });
        if (saveError) return "Could not submit your application. Check whether one is already pending and try again.";
        mutate((p) => ({ ...p, applications: [application, ...p.applications] }));
        return undefined;
      },
      reviewVendorApplication: async (id: string, status: "Approved" | "Rejected", reason = "") => {
        await reviewAccountApplication({ data: { id, status, reason } });
        mutate((p) => {
        const application = p.applications.find((a) => a.id === id);
        if (!application || application.status !== "Pending") return p;
        const at = new Date().toISOString();
        const reviewed = reviewApplication(application, status, at, reason);
        return { ...p, applications: p.applications.map((a) => a.id === id ? reviewed : a), vendors: status === "Approved" ? [...p.vendors, { ...application.vendor, status: "Active" }] : p.vendors, myVendorId: status === "Approved" && application.buyerId === p.buyer.id ? application.vendor.id : p.myVendorId, adminEvents: [{ id: crypto.randomUUID(), at, message: `${status} application · ${application.vendor.name}` }, ...p.adminEvents] };
        });
      },
      setVendorStatus: async (id: string, status: "Active" | "Blocked" | "Suspended", reason = "", days = 1) => {
        const current = vendor(id);
        if (!current) throw new Error("Store not found.");
        const updated = moderateVendor(current, status, reason, days);
        const result = await moderateVendorAccount({ data: { id, status, reason, days } });
        setModeration((p) => ({ ...p, [id]: { status, reason: updated.blockedReason ?? "", suspendedUntil: result.suspendedUntil ?? undefined } }));
        mutate((p) => ({ ...p, adminEvents: [{ id: crypto.randomUUID(), at: new Date().toISOString(), message: `${status === "Active" ? current.status === "Suspended" ? "Unsuspended" : "Unblocked" : status} store · ${current.name}${reason ? ` · ${reason}` : ""}` }, ...p.adminEvents] }));
      },
      updateVendorProfile: async (details: Pick<Vendor, "name" | "location" | "bio" | "logo" | "banner" | "phone">) => {
        const current = vendor(auth.vendorId);
        if (denyActivity || !current) throw new Error("Store unavailable.");
        await publishCatalog({ data: { kind: "store", record: { ...current, ...details }, deleted: false } });
        mutate((p) => ({ ...p, vendors: p.vendors.map((v) => v.id === auth.vendorId ? { ...v, ...details } : v) }));
      },
      requestWithdrawal: (amount: number, recipient: WithdrawalRecipient) => {
        if (denyActivity || auth.role !== "vendor") throw new Error("Vendor access required.");
        throw new Error("Withdrawals are unavailable until real payment verification and payouts are connected. Demo payments cannot be withdrawn.");
      },
      markWithdrawalPaid: (id: string) => mutate((p) => p.role !== "admin" ? p : ({ ...p, withdrawals: p.withdrawals.map((w) => w.id === id ? { ...w, status: "Paid", paidAt: new Date().toISOString() } : w) })),
      submitComplaint: (orderId: string, productId: string, options: Record<string, string> | undefined, message: string, photo: string) => mutate((p) => ({ ...p, orders: p.orders.map((order) => order.id === orderId ? submitPurchaseComplaint(order, productId, options, p.buyer.id, message, photo) : order) })),
      updateItem: (orderId: string, productId: string, patch: Partial<OrderItem>, options?: Record<string, string>) => mutate((p) => ({ ...p, orders: p.orders.map((o) => o.id !== orderId ? o : { ...o, items: o.items.map((i) => samePurchase(i, productId, options) ? { ...i, ...patch } : i) }) })),
    };
  }, [s, categories, categoryImages, removePost, savePicture, cartOpen, auth, moderation, moderationIdentity, moderationError, ratings.data, ratings.isPending, ratings.isError, verification.data, verification.isPending, verification.isError, verification.refetch, saveVerification, sharedOrders.data, sharedOrders.isPending, sharedOrders.isError, sharedOrders.refetch, createOrder, updateDelivery, reviewPurchase]);
}

type Store = ReturnType<typeof useStoreValue>;
// Reuse one context across hot reloads so an edited store module never orphans the provider.
const g = globalThis as unknown as { __mmStoreCtx?: React.Context<Store | null> };
const Ctx = (g.__mmStoreCtx ??= createContext<Store | null>(null));
export function StoreProvider({ children }: { children: ReactNode }) { const v = useStoreValue(); return <Ctx.Provider value={v}>{children}</Ctx.Provider>; }
export function useStore() { const c = useContext(Ctx); if (!c) throw new Error("StoreProvider missing"); return c; }
