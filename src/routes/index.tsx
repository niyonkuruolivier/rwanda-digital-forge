import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/creators-logo.png.asset.json";
import {
  Globe, Server, Search, Share2, Megaphone, Sparkles, Briefcase, LineChart,
  Rocket, MessageCircle, Mail, Phone, ArrowRight, Check, Star, Menu, X
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creators Rwanda — Building Powerful Digital Brands" },
      { name: "description", content: "Professional websites, domain registration, hosting, business profiles, and social media management for modern businesses." },
    ],
  }),
  component: Landing,
});

const WHATSAPP = "https://wa.me/250784254890";
const PHONE = "+250 784 254 890";
const EMAIL = "Info@creatorsrwanda.com";

const services = [
  { icon: Globe, title: "Website Development", desc: "Fast, conversion-focused websites engineered for growth." },
  { icon: Search, title: "Domain Registration", desc: "Secure your brand with .com, .rw, .africa and more." },
  { icon: Server, title: "Web Hosting", desc: "Reliable, scalable hosting with SSL and daily backups." },
  { icon: Briefcase, title: "Business Profile Creation", desc: "Polished company profiles that win trust." },
  { icon: Sparkles, title: "Google Business Optimization", desc: "Rank higher and get found on Maps and Search." },
  { icon: Share2, title: "Social Media Management", desc: "Strategy, content, and growth — handled monthly." },
  { icon: Megaphone, title: "Social Media Branding", desc: "Cohesive visual identity across every platform." },
  { icon: LineChart, title: "Digital Marketing", desc: "Targeted ads and campaigns that deliver ROI." },
  { icon: Sparkles, title: "Content Creation Support", desc: "Photo, video, and copy that move your brand." },
  { icon: Rocket, title: "Digital Transformation", desc: "End-to-end digitization for modern businesses." },
];

const plans = [
  { name: "Starter", price: "$5", period: "/mo", features: ["10 GB SSD Storage", "100 GB Bandwidth", "Free SSL", "5 Email Accounts", "Email Support"] },
  { name: "Business", price: "$12", period: "/mo", featured: true, features: ["50 GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "25 Email Accounts", "Priority Support"] },
  { name: "Premium", price: "$29", period: "/mo", features: ["200 GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "Unlimited Email", "24/7 Dedicated Support"] },
];

const process = [
  { n: "01", t: "Consultation", d: "We listen to understand goals, audience, and constraints." },
  { n: "02", t: "Planning", d: "Roadmap, sitemap, and a clear scope you can sign off on." },
  { n: "03", t: "Design", d: "Brand-aligned interfaces designed to convert." },
  { n: "04", t: "Development", d: "Engineered with performance, SEO, and security baked in." },
  { n: "05", t: "Launch", d: "Smooth deployment with QA and analytics in place." },
  { n: "06", t: "Support", d: "Ongoing maintenance, monitoring, and growth." },
];

const testimonials = [
  { name: "Jean P.", role: "CEO, Kigali Logistics", quote: "Creators Rwanda transformed our online presence. Inquiries doubled within a month." },
  { name: "Aline U.", role: "Founder, Bloom Beauty", quote: "Beautiful website, flawless hosting, and social media that actually grows." },
  { name: "Eric M.", role: "Director, EastAfrica Tours", quote: "Truly international quality — fast, professional, and reliable." },
];

const portfolio = [
  { cat: "Website", title: "Logistics Platform", color: "from-zinc-900 to-zinc-700" },
  { cat: "Business Profile", title: "Corporate Profile Suite", color: "from-zinc-800 to-zinc-600" },
  { cat: "Social Media", title: "Beauty Brand Campaign", color: "from-zinc-900 to-zinc-700" },
  { cat: "Website", title: "Tourism Booking Site", color: "from-zinc-800 to-zinc-600" },
  { cat: "Social Media", title: "Restaurant Growth", color: "from-zinc-900 to-zinc-700" },
  { cat: "Business Profile", title: "NGO Brand Kit", color: "from-zinc-800 to-zinc-600" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <DomainChecker />
      <Hosting />
      <Portfolio />
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
    ["About", "#about"], ["Services", "#services"], ["Domains", "#domains"],
    ["Hosting", "#hosting"], ["Work", "#portfolio"], ["Contact", "#contact"],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo.url} alt="Creators Rwanda" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-semibold tracking-tight">Creators<span className="text-brand">.</span>Rwanda</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="text-sm text-muted-foreground transition hover:text-foreground">{l}</a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild className="rounded-full"><a href="#contact">Get Started <ArrowRight className="ml-1 h-4 w-4" /></a></Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-px mx-auto flex flex-col gap-4 py-4">
            {links.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="text-sm">{l}</a>
            ))}
            <Button asChild className="rounded-full"><a href="#contact">Get Started</a></Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--brand)_18%,transparent)_0%,transparent_70%)]" />
      <div className="container-px mx-auto max-w-7xl py-24 md:py-36">
        <Badge variant="outline" className="rounded-full border-border/80 bg-background px-3 py-1 text-xs">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand" /> Trusted digital partner
        </Badge>
        <h1 className="text-balance mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] md:text-7xl">
          Building Powerful <span className="italic text-brand">Digital Brands</span> for Modern Businesses
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Creators Rwanda helps businesses grow through professional websites, domain registration,
          business profiles, and strategic social media management.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full"><a href="#contact">Get Started <ArrowRight className="ml-1 h-4 w-4" /></a></Button>
          <Button asChild size="lg" variant="outline" className="rounded-full"><a href="#contact">Request Quote</a></Button>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
          {[["120+", "Projects shipped"], ["98%", "Client retention"], ["6yr", "Industry expertise"], ["24/7", "Support coverage"]].map(([k, v]) => (
            <div key={k}>
              <div className="font-display text-3xl font-semibold md:text-4xl">{k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Websites", "Domains", "Hosting", "SEO", "Branding", "Social Media", "Google Business", "Content", "Ads"];
  return (
    <div className="overflow-hidden border-b border-border bg-foreground py-5 text-background">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap">
        {[...items, ...items, ...items].map((i, idx) => (
          <span key={idx} className="font-display text-sm uppercase tracking-[0.3em] opacity-80">{i} <span className="text-brand">●</span></span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="container-px mx-auto max-w-7xl py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">About</p>
          <h2 className="mt-4 text-4xl font-semibold md:text-5xl">An agency built for the businesses shaping tomorrow.</h2>
        </div>
        <div className="space-y-6 text-lg text-muted-foreground">
          <p>
            We're a senior team of designers, engineers, and marketers who care about craft, results, and the people we work with.
            From the first conversation to long-term partnership, we build digital experiences that move the needle.
          </p>
          <p>
            Our mission is simple: give every modern business a digital presence as ambitious as their goals — beautifully designed,
            engineered to perform, and supported by a team that picks up the phone.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Strategic", "Senior team", "Outcome-driven", "Locally rooted", "Globally minded"].map(t => (
              <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="border-y border-border bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl py-24">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Services</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">Everything your brand needs, under one roof.</h2>
          </div>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative bg-background p-8 transition hover:bg-foreground hover:text-background">
              <Icon className="h-7 w-7 text-brand" />
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground group-hover:text-background/70">{desc}</p>
              <ArrowRight className="absolute right-6 top-6 h-4 w-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
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
      const out = exts.map(ext => ({
        domain: name + ext,
        available: Math.random() > 0.35,
        price: prices[ext],
      }));
      setResult(out);
      setLoading(false);
    }, 600);
  }

  return (
    <section id="domains" className="container-px mx-auto max-w-7xl py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Domains</p>
        <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Find Your Perfect Domain</h2>
        <p className="mt-4 text-muted-foreground">Search across .com, .net, .org, .rw, .co.rw, and .africa.</p>
      </div>
      <form onSubmit={check} className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="yourbusinessname"
          className="h-14 rounded-full border-border bg-background px-6 text-base"
        />
        <Button type="submit" size="lg" className="h-14 rounded-full px-8" disabled={loading}>
          {loading ? "Checking..." : "Check Availability"}
        </Button>
      </form>
      {result && (
        <div className="mx-auto mt-10 max-w-3xl space-y-2">
          {result.map(r => (
            <div key={r.domain} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${r.available ? "bg-brand" : "bg-muted-foreground/40"}`} />
                <span className="font-medium">{r.domain}</span>
                <Badge variant={r.available ? "default" : "secondary"} className="rounded-full">
                  {r.available ? "Available" : "Taken"}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{r.price}</span>
                {r.available && <Button asChild size="sm" className="rounded-full"><a href="#contact">Register</a></Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Hosting() {
  return (
    <section id="hosting" className="border-y border-border bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Hosting</p>
          <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Hosting plans that scale with you.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map(p => (
            <Card key={p.name} className={`relative flex flex-col gap-6 border-border p-8 ${p.featured ? "bg-foreground text-background" : "bg-background"}`}>
              {p.featured && <Badge className="absolute -top-3 right-6 rounded-full bg-brand text-brand-foreground">Most Popular</Badge>}
              <div>
                <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-semibold">{p.price}</span>
                  <span className={p.featured ? "text-background/60" : "text-muted-foreground"}>{p.period}</span>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className={`mt-auto rounded-full ${p.featured ? "bg-brand text-brand-foreground hover:bg-brand/90" : ""}`}>
                <a href="#contact">Choose {p.name}</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" className="container-px mx-auto max-w-7xl py-24">
      <div className="flex items-end justify-between gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Selected Work</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold md:text-5xl">Brands we've helped grow.</h2>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolio.map((p, i) => (
          <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} transition group-hover:scale-105`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge className="rounded-full bg-brand text-brand-foreground">{p.cat}</Badge>
              <h3 className="mt-3 text-xl font-semibold">{p.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="border-y border-border bg-foreground text-background">
      <div className="container-px mx-auto max-w-7xl py-24">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-background/60">Process</p>
          <h2 className="mt-4 text-4xl font-semibold md:text-5xl">A clear path from idea to launch.</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-background/10 md:grid-cols-2 lg:grid-cols-3">
          {process.map(s => (
            <div key={s.n} className="bg-foreground p-8">
              <div className="font-display text-5xl font-semibold text-brand">{s.n}</div>
              <h3 className="mt-4 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-background/70">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-px mx-auto max-w-7xl py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Testimonials</p>
        <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Loved by ambitious teams.</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map(t => (
          <Card key={t.name} className="border-border bg-background p-8">
            <div className="flex gap-1 text-brand">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-4 text-lg leading-relaxed">"{t.quote}"</p>
            <div className="mt-6">
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-muted-foreground">{t.role}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const services_list = ["Website Development", "Domain Registration", "Web Hosting", "Business Profile", "Google Business Optimization", "Social Media Management", "Digital Marketing", "Other"];
  return (
    <section id="contact" className="border-t border-border bg-secondary/40">
      <div className="container-px mx-auto max-w-7xl py-24">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Contact</p>
            <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Let's build something remarkable.</h2>
            <p className="mt-6 text-muted-foreground">Tell us about your business. We'll reply within one business day.</p>
            <div className="mt-10 space-y-4">
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-sm hover:text-brand"><Mail className="h-4 w-4" /> {EMAIL}</a>
              <a href={`tel:+250784254890`} className="flex items-center gap-3 text-sm hover:text-brand"><Phone className="h-4 w-4" /> {PHONE}</a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-brand"><MessageCircle className="h-4 w-4" /> WhatsApp Support</a>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 rounded-2xl border border-border bg-background p-8">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-brand/10 p-4"><Check className="h-8 w-8 text-brand" /></div>
                <h3 className="mt-4 text-2xl font-semibold">Message sent</h3>
                <p className="mt-2 text-muted-foreground">We'll get back to you shortly.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input required placeholder="Full name" />
                  <Input required type="email" placeholder="Email" />
                  <Input placeholder="Phone" />
                  <Input placeholder="Business name" />
                </div>
                <select required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Service needed</option>
                  {services_list.map(s => <option key={s}>{s}</option>)}
                </select>
                <Textarea required placeholder="Tell us about your project" rows={5} />
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" size="lg" className="rounded-full">Send Message</Button>
                  <Button type="submit" size="lg" variant="outline" className="rounded-full">Request Quote</Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo.url} alt="Creators Rwanda" className="h-9 w-9 object-contain" />
              <span className="font-display text-lg font-semibold">Creators<span className="text-brand">.</span>Rwanda</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-background/70">Building powerful digital brands for modern businesses across Rwanda and beyond.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">Services</h4>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li>Website Development</li><li>Domain Registration</li><li>Web Hosting</li>
              <li>Social Media Management</li><li>Digital Marketing</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-background/80">
              <li><a className="hover:text-brand" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
              <li><a className="hover:text-brand" href="tel:+250784254890">{PHONE}</a></li>
              <li><a className="hover:text-brand" href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-background/10 pt-8 text-xs text-background/60 md:flex-row md:items-center">
          <p>© 2026 Creators Rwanda. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand">Privacy</a>
            <a href="#" className="hover:text-brand">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  return (
    <a href={WHATSAPP} target="_blank" rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-elegant transition hover:scale-110"
      aria-label="WhatsApp">
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
