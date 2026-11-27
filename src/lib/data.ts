import type { Delivery } from "./delivery";
export type Category = string;
export const CATEGORIES: Category[] = ["Electronics", "Fashion", "Home Decor", "Art", "Services"];

export interface Vendor {
  verified?: boolean;
  createdAt?: string;
  id: string; name: string; bio: string; logo: string; banner: string; rating: number; location: string; joined: string; phone?: string | undefined;
  status?: "Active" | "Blocked" | "Suspended"; blockedReason?: string; suspendedUntil?: string | undefined;
}
export interface Review { author: string; rating: number; text: string; date: string }
export interface ProductOption { name: string; values: string[] }
export interface Product {
  id: string; vendorId: string; title: string; category: Category; price: number; compareAt?: number | undefined;
  stock: number; images: string[]; description: string; rating: number; reviews: Review[];
  options?: ProductOption[];
  videoUrl?: string;
}
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";
export interface Claim { message: string; photo?: string | undefined; createdAt: string; status: "open" | "released" | "refunded" }
export interface OrderItem { lineId?: string; delivery?: Delivery; productId: string; vendorId: string; shop?: { name: string; location: string; phone?: string | undefined }; title: string; price: number; qty: number; image: string; status: OrderStatus; options?: Record<string, string> | undefined; buyerConfirmedAt?: string | undefined; claim?: Claim | undefined }
export interface Order { shared?: boolean; id: string; buyerId?: string | undefined; date: string; customer: string; phone?: string | undefined; address: string; payment: string; items: OrderItem[]; total: number; paymentStatus?: "Pending" | "Paid" | "Failed"; paymentReference?: string; paidAt?: string; paymentMode?: "demo" }

const u = (id: string, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const VENDORS: Vendor[] = [
  { id: "kigali-tech", name: "Kigali Tech Hub", bio: "Trusted gadgets, audio gear and accessories, tested and shipped within 48 hours.", logo: u("photo-1518770660439-4636190af475", 200), banner: u("photo-1498049794561-7780e7231661", 1600), rating: 4.8, location: "Kigali", joined: "2023" },
  { id: "imigongo-studio", name: "Imigongo Studio", bio: "Contemporary African art and prints inspired by traditional Imigongo geometry.", logo: u("photo-1513364776144-60967b0f800f", 200), banner: u("photo-1460661419201-fd4cecdf8a8b", 1600), rating: 4.9, location: "Musanze", joined: "2022" },
  { id: "urban-threads", name: "Urban Threads", bio: "Streetwear and everyday essentials made from sustainable fabrics.", logo: u("photo-1441986300917-64674bd600d8", 200), banner: u("photo-1490481651871-ab68de25d43d", 1600), rating: 4.6, location: "Huye", joined: "2024" },
  { id: "nest-and-weave", name: "Nest & Weave", bio: "Handwoven baskets, ceramics and decor pieces from local cooperatives.", logo: u("photo-1493663284031-b7e3aefcae8e", 200), banner: u("photo-1484101403633-562f891dc89a", 1600), rating: 4.7, location: "Rubavu", joined: "2023" },
];

const r = (a: string, n: number, t: string): Review => ({ author: a, rating: n, text: t, date: "2026-10-02" });

export const SEED_PRODUCTS: Product[] = [
  { id: "p1", vendorId: "kigali-tech", title: "Wireless Noise-Cancelling Headphones", category: "Electronics", price: 167500, compareAt: 219500, stock: 24, images: [u("photo-1505740420928-5e560c06d30e"), u("photo-1484704849700-f032a568e944"), u("photo-1583394838336-acd977736f90")], description: "40-hour battery, adaptive noise cancelling and plush memory-foam ear cushions.", options: [{ name: "Color", values: ["Black", "White", "Silver"] }], rating: 4.7, reviews: [r("Aline M.", 5, "Amazing sound and super comfy."), r("Eric N.", 4, "Great battery life, case could be sturdier.")] },
  { id: "p2", vendorId: "kigali-tech", title: "Smart Watch Series 5", category: "Electronics", price: 115500, stock: 12, images: [u("photo-1523275335684-37898b6baf30"), u("photo-1508685096489-7aacd43bd3b1")], description: "Heart-rate tracking, sleep insights and 7-day battery in a slim aluminium case.", options: [{ name: "Color", values: ["Black", "Silver", "Rose Gold"] }, { name: "Size", values: ["40mm", "44mm"] }], rating: 4.5, reviews: [r("Grace U.", 5, "Love the sleep tracking.")] },
  { id: "p3", vendorId: "kigali-tech", title: "Portable Bluetooth Speaker", category: "Electronics", price: 58500, compareAt: 76500, stock: 0, images: [u("photo-1608043152269-423dbba4e7e1")], description: "Waterproof, 12-hour playtime and deep bass in a pocketable size.", rating: 4.3, reviews: [] },
  { id: "p4", vendorId: "imigongo-studio", title: "Imigongo Geometric Wall Panel", category: "Art", price: 273000, stock: 5, images: [u("photo-1541961017774-22349e4a1262"), u("photo-1547891654-e66ed7ebb968")], description: "Hand-painted panel using traditional cow-dung relief technique, 60×60 cm.", rating: 4.9, reviews: [r("Jean P.", 5, "A true statement piece.")] },
  { id: "p5", vendorId: "imigongo-studio", title: "Abstract Sunset Print", category: "Art", price: 45500, stock: 40, images: [u("photo-1579783902614-a3fb3927b6a5")], description: "Giclée print on archival matte paper, A3.", rating: 4.8, reviews: [] },
  { id: "p6", vendorId: "urban-threads", title: "Classic Canvas Sneakers", category: "Fashion", price: 76500, compareAt: 97500, stock: 30, images: [u("photo-1525966222134-fcfa99b8ae77"), u("photo-1549298916-b41d501d3772")], description: "Breathable organic canvas with natural rubber sole.", options: [{ name: "Size", values: ["39", "40", "41", "42", "43", "44", "45"] }, { name: "Color", values: ["White", "Black", "Beige"] }], rating: 4.6, reviews: [r("Diane K.", 4, "Runs slightly large.")] },
  { id: "p7", vendorId: "urban-threads", title: "Oversized Linen Shirt", category: "Fashion", price: 54500, stock: 18, images: [u("photo-1596755094514-f87e34085b2c")], description: "Relaxed fit linen shirt, perfect for warm days.", options: [{ name: "Size", values: ["S", "M", "L", "XL"] }, { name: "Color", values: ["White", "Sand", "Olive"] }], rating: 4.4, reviews: [] },
  { id: "p8", vendorId: "urban-threads", title: "Leather Crossbody Bag", category: "Fashion", price: 101500, stock: 9, images: [u("photo-1548036328-c9fa89d128fa")], description: "Full-grain leather with adjustable strap.", options: [{ name: "Color", values: ["Tan", "Black"] }], rating: 4.7, reviews: [] },
  { id: "p9", vendorId: "nest-and-weave", title: "Agaseke Woven Basket", category: "Home Decor", price: 49500, stock: 22, images: [u("photo-1519710164239-da123dc03ef4"), u("photo-1616046229478-9901c5536a45")], description: "Traditional Rwandan peace basket handwoven from sisal and sweetgrass.", options: [{ name: "Size", values: ["Small", "Medium", "Large"] }], rating: 4.9, reviews: [r("Olivier N.", 5, "Beautiful craftsmanship.")] },
  { id: "p10", vendorId: "nest-and-weave", title: "Hand-Glazed Ceramic Vase", category: "Home Decor", price: 70000, compareAt: 84500, stock: 11, images: [u("photo-1578500494198-246f612d3b3d")], description: "Wheel-thrown stoneware with a reactive teal glaze.", options: [{ name: "Color", values: ["Teal", "Sand"] }], rating: 4.6, reviews: [] },
  { id: "p11", vendorId: "nest-and-weave", title: "Interior Styling Consultation", category: "Services", price: 156000, stock: 99, images: [u("photo-1586023492125-27b2c045efd7")], description: "One-hour virtual session with our interior stylist, including a mood board.", rating: 4.8, reviews: [] },
  { id: "p12", vendorId: "imigongo-studio", title: "Custom Portrait Commission", category: "Services", price: 234000, stock: 99, images: [u("photo-1513364776144-60967b0f800f")], description: "Hand-painted portrait from your photo, delivered in 3 weeks.", rating: 5, reviews: [] },
];

export const CATEGORY_IMAGES: Record<Category, string> = {
  Electronics: u("photo-1498049794561-7780e7231661", 600),
  Fashion: u("photo-1445205170230-053b83016050", 600),
  "Home Decor": u("photo-1484101403633-562f891dc89a", 600),
  Art: u("photo-1460661419201-fd4cecdf8a8b", 600),
  Services: u("photo-1586023492125-27b2c045efd7", 600),
};

export const COMMISSION_RATE = 0.13;
export const money = (n: number) => `RWF ${Math.round(n).toLocaleString("en-US")}`;
