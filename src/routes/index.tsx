import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/creators-logo.png.asset.json";
import {
  Globe, Server, Search, Share2, Megaphone, Sparkles, Briefcase, LineChart,
  Rocket, MessageCircle, Mail, Phone, ArrowUpRight, Plus, Menu, X, Terminal
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creators Rwanda — Digital Studio for Bold Brands" },
      { name: "description", content: "An independent digital studio crafting websites, brands, hosting, and social systems for ambitious businesses across Africa." },
    ],
  }),
  component: Landing,
});

const WHATSAPP = "https://wa.me/250784254890";
const PHONE = "+250 784 254 890";
const EMAIL = "Info@creatorsrwanda.com";

const services = [
  { n: "01", icon: Globe, title: "Website Development", desc: "Fast, conversion-engineered sites built on modern stacks." },
  { n: "02", icon: Search, title: "Domain Registration", desc: "Secure .com, .rw, .africa and more in minutes." },
  { n: "03", icon: Server, title: "Web Hosting", desc: "Reliable, SSD-backed hosting with SSL & daily backups." },
  { n: "04", icon: Briefcase, title: "Business Profiles", desc: "Editorial company profiles that earn trust." },
  { n: "05", icon: Sparkles, title: "Google Business", desc: "Maps optimization, reviews, and local search wins." },
  { n: "06", icon: Share2, title: "Social Media Management", desc: "Strategy, content, and growth — handled monthly." },
  { n: "07", icon: Megaphone, title: "Brand Identity", desc: "Cohesive visual systems across every platform." },
  { n: "08", icon: LineChart, title: "Digital Marketing", desc: "Targeted ads and campaigns that ship ROI." },
  { n: "09", icon: Sparkles, title: "Content Production", desc: "Photo, video, and copy that move your brand." },
  { n: "10", icon: Rocket, title: "Digital Transformation", desc: "End-to-end digitization for serious businesses." },
];

const plans = [
  { name: "Starter", price: "5", features: ["10 GB SSD Storage", "100 GB Bandwidth", "Free SSL", "5 Email Accounts", "Email Support"] },
  { name: "Business", price: "12", featured: true, features: ["50 GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "25 Email Accounts", "Priority Support"] },
  { name: "Premium", price: "29", features: ["200 GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "Unlimited Email", "24/7 Dedicated"] },
];

const process = [
  { n: "01", t: "Listen", d: "We start with your business — goals, audience, constraints." },
  { n: "02", t: "Plan", d: "A roadmap, scope, and timeline you can sign off on." },
  { n: "03", t: "Design", d: "Brand-aligned interfaces designed to convert." },
  { n: "04", t: "Build", d: "Engineered with performance, SEO, and security baked in." },
  { n: "05", t: "Launch", d: "Smooth deployment with QA and analytics in place." },
  { n: "06", t: "Grow", d: "Ongoing partnership, monitoring, and iteration." },
];

const testimonials = [
  { name: "Jean P.", role: "CEO — Kigali Logistics", quote: "Creators Rwanda transformed our online presence. Inquiries doubled within a month." },
  { name: "Aline U.", role: "Founder — Bloom Beauty", quote: "Beautiful website, flawless hosting, and social media that actually grows." },
  { name: "Eric M.", role: "Director — EastAfrica Tours", quote: "Truly international quality — fast, professional, and reliable." },
];

const work = [
  { y: "2025", cat: "Website", title: "Logistics Platform" },
  { y: "2025", cat: "Brand", title: "Corporate Profile Suite" },
  { y: "2024", cat: "Social", title: "Beauty Brand Campaign" },
  { y: "2024", cat: "Website", title: "Tourism Booking Site" },
  { y: "2024", cat: "Social", title: "Restaurant Growth" },
  { y: "2023", cat: "Brand", title: "NGO Brand Kit" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand selection:text-brand-foreground">
      <Nav />
      <Hero />
      <Ticker />
      <Manifesto />
      <Services />
      <DomainChecker />
      <Hosting />
      <Work />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppFab />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Studio", "#manifesto"], ["Services", "#services"], ["Domains", "#domains"],
    ["Hosting", "#hosting"], ["Work", "#work"], ["Contact", "#contact"],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="container-px mx-auto flex h-16 max-w-[1400px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={logo.url} alt="Creators Rwanda" className="h-8 w-8 object-contain invert" />
          <span className="font-mono text-xs uppercase tracking-[0.25em]">Creators / Rwanda</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition hover:text-brand">{l}</a>
          ))}
        </nav>
        <a href="#contact" className="hidden md:inline-flex items-center gap-2 border border-brand bg-brand px-4 py-2 font-mono text-xs uppercase tracking-widest text-brand-foreground transition hover:bg-transparent hover:text-brand">
          Start a project <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-px mx-auto flex flex-col gap-4 py-4">
            {links.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="font-mono text-xs uppercase tracking-widest">{l}</a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="bg-brand px-4 py-2 text-center font-mono text-xs uppercase tracking-widest text-brand-foreground">Start a project</a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="container-px mx-auto max-w-[1400px] py-20 md:py-32">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>[ EST. 2019 — KIGALI, RW ]</span>
            <span className="hidden sm:inline">N° 001 / DIGITAL STUDIO</span>
          </div>

          <h1 className="col-span-12 mt-10 font-display text-[14vw] leading-[0.92] tracking-tight md:text-[10rem]">
            <span className="block">Bold brands.</span>
            <span className="block italic text-brand">Built with care.</span>
          </h1>

          <div className="col-span-12 mt-10 grid grid-cols-12 gap-6 border-t border-border pt-10">
            <p className="col-span-12 md:col-span-5 font-display text-2xl italic text-muted-foreground md:text-3xl">
              An independent digital studio for ambitious businesses — websites, hosting, brand systems, and social growth.
            </p>
            <div className="col-span-12 md:col-span-4 md:col-start-9 flex flex-col gap-4">
              <a href="#contact" className="group flex items-center justify-between border border-brand bg-brand px-6 py-5 font-mono text-sm uppercase tracking-widest text-brand-foreground transition hover:bg-transparent hover:text-brand">
                Book a call <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" />
              </a>
              <a href="#services" className="group flex items-center justify-between border border-border px-6 py-5 font-mono text-sm uppercase tracking-widest transition hover:border-foreground">
                Explore services <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              </a>
            </div>
          </div>

          <div className="col-span-12 mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-10 md:grid-cols-4">
            {[["120+", "Projects shipped"], ["98%", "Client retention"], ["6yr", "Studio expertise"], ["24/7", "Support coverage"]].map(([k, v]) => (
              <div key={k}>
                <div className="font-display text-5xl md:text-6xl">{k}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = ["Websites", "Domains", "Hosting", "SEO", "Branding", "Social Media", "Google Business", "Content", "Ads"];
  return (
    <div className="overflow-hidden border-b border-border bg-brand py-4 text-brand-foreground">
      <div className="flex animate-[marquee_35s_linear_infinite] gap-10 whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((i, idx) => (
          <span key={idx} className="font-display text-2xl italic">{i} <span className="mx-2">✺</span></span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

function Manifesto() {
  return (
    <section id="manifesto" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 01 ) — The Studio
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="font-display text-3xl leading-[1.15] md:text-5xl">
              We are a senior team of designers, engineers, and marketers who care about <span className="italic text-brand">craft, results,</span> and the people we work with. From the first conversation to long-term partnership, we build digital experiences <span className="italic">that move the needle.</span>
            </p>
            <div className="mt-12 flex flex-wrap gap-2">
              {["Strategic", "Senior team", "Outcome-driven", "Locally rooted", "Globally minded"].map(t => (
                <span key={t} className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 02 ) — Services
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            Everything your brand <br /><span className="italic text-brand">needs</span>, under one roof.
          </h2>
        </div>
        <ul className="border-t border-border">
          {services.map(({ n, icon: Icon, title, desc }) => (
            <li key={title} className="group grid grid-cols-12 items-center gap-6 border-b border-border py-8 transition hover:bg-brand hover:text-brand-foreground">
              <div className="col-span-2 md:col-span-1 font-mono text-xs tracking-widest text-muted-foreground group-hover:text-brand-foreground/70">{n}</div>
              <div className="col-span-10 md:col-span-4 flex items-center gap-4">
                <Icon className="h-5 w-5" />
                <span className="font-display text-2xl md:text-3xl">{title}</span>
              </div>
              <div className="col-span-12 md:col-span-6 text-sm text-muted-foreground group-hover:text-brand-foreground/80 md:pl-8">{desc}</div>
              <div className="hidden md:flex md:col-span-1 justify-end">
                <ArrowUpRight className="h-5 w-5 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DomainChecker() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<null | { domain: string; available: boolean; price: string }[]>(null);
  const [loading, setLoading] = useState(false);
  const exts = [".com", ".net", ".org", ".rw", ".co.rw", ".africa"];
  const prices: Record<string, string> = { ".com": "$12/yr", ".net": "$14/yr", ".org": "$13/yr", ".rw": "$25/yr", ".co.rw": "$20/yr", ".africa": "$18/yr" };

  function check(e: React.FormEvent) {
    e.preventDefault();
    const name = q.trim().toLowerCase().replace(/\s+/g, "-").replace(/\.[a-z.]+$/, "");
    if (!name) return;
    setLoading(true);
    setTimeout(() => {
      setResult(exts.map(ext => ({ domain: name + ext, available: Math.random() > 0.35, price: prices[ext] })));
      setLoading(false);
    }, 600);
  }

  return (
    <section id="domains" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 03 ) — Domains
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            Claim your <span className="italic text-brand">name</span>.
          </h2>
        </div>

        <div className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> domain-lookup.sh</span>
            <span className="hidden sm:inline">.com · .net · .org · .rw · .co.rw · .africa</span>
          </div>
          <form onSubmit={check} className="flex flex-col gap-0 sm:flex-row">
            <span className="border-b sm:border-b-0 sm:border-r border-border px-5 py-5 font-mono text-sm text-brand">~ $</span>
            <Input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="yourbusinessname"
              className="h-auto flex-1 rounded-none border-0 border-b sm:border-b-0 border-border bg-transparent px-5 py-5 font-mono text-base focus-visible:ring-0"
            />
            <Button type="submit" className="h-auto rounded-none bg-brand px-8 py-5 font-mono text-xs uppercase tracking-widest text-brand-foreground hover:bg-brand/90" disabled={loading}>
              {loading ? "Searching…" : "Run lookup"}
            </Button>
          </form>
        </div>

        {result && (
          <div className="mt-6 border border-border">
            {result.map((r, i) => (
              <div key={r.domain} className={`grid grid-cols-12 items-center gap-4 px-5 py-4 ${i !== result.length - 1 ? "border-b border-border" : ""}`}>
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${r.available ? "bg-brand" : "bg-muted-foreground/40"}`} />
                  <span className="font-mono">{r.domain}</span>
                </div>
                <div className="col-span-6 sm:col-span-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {r.available ? "Available" : "Taken"}
                </div>
                <div className="col-span-3 sm:col-span-2 font-mono text-sm">{r.price}</div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  {r.available && <a href="#contact" className="font-mono text-xs uppercase tracking-widest text-brand hover:underline">Register →</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Hosting() {
  return (
    <section id="hosting" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 04 ) — Hosting
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            Plans that <span className="italic text-brand">scale</span> with you.
          </h2>
        </div>
        <div className="grid grid-cols-1 border border-border md:grid-cols-3">
          {plans.map((p, i) => (
            <div key={p.name} className={`flex flex-col gap-8 p-8 md:p-10 ${i !== plans.length - 1 ? "border-b md:border-b-0 md:border-r border-border" : ""} ${p.featured ? "bg-brand text-brand-foreground" : ""}`}>
              <div className="flex items-start justify-between">
                <h3 className="font-display text-3xl">{p.name}</h3>
                {p.featured && <span className="border border-brand-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-widest">Popular</span>}
              </div>
              <div className="font-display text-7xl leading-none">
                ${p.price}<span className={`font-sans text-base ${p.featured ? "text-brand-foreground/70" : "text-muted-foreground"}`}>/mo</span>
              </div>
              <ul className="space-y-2.5 font-mono text-xs uppercase tracking-wider">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <span className={p.featured ? "text-brand-foreground" : "text-brand"}>+</span> {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`mt-auto flex items-center justify-between border px-5 py-4 font-mono text-xs uppercase tracking-widest transition ${p.featured ? "border-brand-foreground bg-brand-foreground text-brand hover:bg-transparent hover:text-brand-foreground" : "border-border hover:border-brand hover:text-brand"}`}>
                Choose {p.name} <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 05 ) — Selected Work
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            Brands we've helped <span className="italic text-brand">grow</span>.
          </h2>
        </div>
        <ul className="border-t border-border">
          {work.map((p, i) => (
            <li key={i} className="group grid grid-cols-12 items-center gap-4 border-b border-border py-6 transition hover:pl-4">
              <div className="col-span-2 font-mono text-xs text-muted-foreground">{p.y}</div>
              <div className="col-span-6 font-display text-2xl md:text-4xl">
                {p.title}
              </div>
              <div className="col-span-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{p.cat}</div>
              <div className="col-span-1 flex justify-end">
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-brand" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 06 ) — Process
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            A clear path from <span className="italic text-brand">idea</span> to launch.
          </h2>
        </div>
        <div className="grid grid-cols-1 border border-border md:grid-cols-3">
          {process.map((s, i) => (
            <div key={s.n} className={`p-8 md:p-10 ${i < 3 ? "md:border-b" : ""} ${i % 3 !== 2 ? "md:border-r" : ""} ${i !== process.length - 1 ? "border-b md:border-b-inherit" : ""} border-border`}>
              <div className="font-display text-6xl text-brand">{s.n}</div>
              <h3 className="mt-6 font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 md:col-span-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            ( 07 ) — Words
          </div>
          <h2 className="col-span-12 md:col-span-9 font-display text-5xl md:text-7xl leading-[0.95]">
            Loved by <span className="italic text-brand">ambitious</span> teams.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
          {testimonials.map(t => (
            <figure key={t.name} className="flex flex-col justify-between gap-8 bg-background p-8 md:p-10">
              <blockquote className="font-display text-2xl italic leading-snug">
                <span className="text-brand">"</span>{t.quote}<span className="text-brand">"</span>
              </blockquote>
              <figcaption className="font-mono text-[11px] uppercase tracking-widest">
                <div>{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const services_list = ["Website Development", "Domain Registration", "Web Hosting", "Business Profile", "Google Business", "Social Media", "Digital Marketing", "Other"];
  return (
    <section id="contact" className="border-b border-border">
      <div className="container-px mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">( 08 ) — Contact</div>
            <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95]">
              Let's build something <span className="italic text-brand">remarkable</span>.
            </h2>
            <p className="mt-6 text-muted-foreground">Tell us about your business. We'll reply within one business day.</p>
            <div className="mt-12 space-y-4 font-mono text-sm">
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 hover:text-brand"><Mail className="h-4 w-4" /> {EMAIL}</a>
              <a href="tel:+250784254890" className="flex items-center gap-3 hover:text-brand"><Phone className="h-4 w-4" /> {PHONE}</a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-brand"><MessageCircle className="h-4 w-4" /> WhatsApp Support</a>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 4000); }}
            className="col-span-12 md:col-span-7 space-y-6 border border-border p-8 md:p-10"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name"><Input required className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0" /></Field>
              <Field label="Email"><Input type="email" required className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0" /></Field>
              <Field label="Company"><Input className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0" /></Field>
              <Field label="Phone"><Input className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0" /></Field>
            </div>
            <Field label="Service">
              <select required className="w-full rounded-none border-0 border-b border-border bg-transparent py-2 font-sans text-sm focus:outline-none">
                <option value="" className="bg-background">Select a service</option>
                {services_list.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
              </select>
            </Field>
            <Field label="Project details">
              <Textarea required rows={5} className="rounded-none border border-border bg-transparent focus-visible:ring-0" />
            </Field>
            <button type="submit" className="group flex w-full items-center justify-between border border-brand bg-brand px-6 py-5 font-mono text-sm uppercase tracking-widest text-brand-foreground transition hover:bg-transparent hover:text-brand">
              {sent ? "Message sent — thank you" : "Send message"} <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="container-px mx-auto max-w-[1400px] py-16">
        <div className="font-display text-[18vw] leading-none md:text-[14rem]">
          Creators<span className="italic text-brand">.</span>
        </div>
        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Creators Rwanda — Kigali, RW
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-widest">
            <a href={`mailto:${EMAIL}`} className="hover:text-brand">{EMAIL}</a>
            <a href="tel:+250784254890" className="hover:text-brand">{PHONE}</a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-brand">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_10px_40px_-10px_var(--brand)] transition hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
