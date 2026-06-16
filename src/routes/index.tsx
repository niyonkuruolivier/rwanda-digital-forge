import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe, Server, Search, Share2, Megaphone, Sparkles, Briefcase, LineChart,
  Rocket, MessageCircle, Mail, Phone, MapPin, Menu, X, Headphones, Languages,
  ShieldCheck, Zap, ChevronRight, Check, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creators Rwanda — Digital Agency | Web, Hosting & Brand" },
      { name: "description", content: "Creators Rwanda is a Kigali-based digital agency delivering web development, domains, hosting, business profiles and social media management across Africa." },
    ],
  }),
  component: Landing,
});

const WHATSAPP = "https://wa.me/250784254890";
const PHONE = "+250 784 254 890";
const EMAIL = "Info@creatorsrwanda.com";

const features = [
  { icon: Headphones, t: "24/7 Online Support", d: "Real humans on call any hour." },
  { icon: Languages, t: "Multi Lingual", d: "English, Kinyarwanda, French." },
  { icon: ShieldCheck, t: "Secure", d: "SSL, backups, hardened stack." },
  { icon: Zap, t: "Self Reliant", d: "Owned infrastructure & uptime." },
];

const services = [
  { icon: Globe, title: "Website Development", desc: "Conversion-engineered sites on modern stacks." },
  { icon: Search, title: "Domain Registration", desc: "Secure .com, .rw, .africa and more in minutes." },
  { icon: Server, title: "Web Hosting", desc: "SSD-backed hosting with SSL & daily backups." },
  { icon: Briefcase, title: "Business Profiles", desc: "Editorial company profiles that earn trust." },
  { icon: Sparkles, title: "Google Business", desc: "Maps, reviews and local search wins." },
  { icon: Share2, title: "Social Media Management", desc: "Strategy, content and growth — handled monthly." },
  { icon: Megaphone, title: "Brand Identity", desc: "Cohesive visual systems across every platform." },
  { icon: LineChart, title: "Digital Marketing", desc: "Targeted campaigns that ship measurable ROI." },
  { icon: Rocket, title: "Digital Transformation", desc: "End-to-end digitization for serious businesses." },
];


const stats = [
  { n: "120+", l: "Projects" },
  { n: "80+", l: "Clients" },
  { n: "15+", l: "Partners" },
  { n: "12+", l: "Team" },
];

const tlds = [".com", ".rw", ".africa", ".org", ".net", ".co"];

function Landing() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ tld: string; available: boolean; price: number }[] | null>(null);
  const [sent, setSent] = useState(false);

  const lookup = () => {
    const base = q.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!base) return;
    setResults(tlds.map((tld, i) => ({ tld, available: (base.length + i) % 3 !== 0, price: 12 + i * 3 })));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Promo bar */}
      <div className="bg-[var(--navy)] text-white text-xs md:text-sm">
        <div className="container-px mx-auto flex items-center justify-between py-2">
          <span className="truncate">Save up to 40% on Web & Hosting bundles — starting from RWF 12,150/year</span>
          <a href="#contact" className="ml-4 shrink-0 bg-[var(--sky)] text-[var(--navy)] font-semibold px-3 py-1 rounded-md hover:brightness-110 transition">Get Started</a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
        <div className="container-px mx-auto flex items-center justify-between py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-hero grid place-items-center text-white font-display font-bold">C</div>
            <div className="leading-tight">
              <div className="font-display font-bold text-[var(--navy)]">Creators<span className="text-[var(--sky)]">.</span></div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Rwanda</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#about" className="hover:text-[var(--sky)]">About</a>
            <a href="#services" className="hover:text-[var(--sky)]">Services</a>
            <a href="#domains" className="hover:text-[var(--sky)]">Domains</a>
            <a href="#contact" className="hover:text-[var(--sky)]">Contact</a>
          </nav>
          <div className="hidden md:block">
            <a href={WHATSAPP} className="inline-flex items-center gap-2 bg-[var(--navy)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110">
              <MessageCircle className="w-4 h-4" /> Chat
            </a>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t bg-background">
            <div className="container-px py-4 flex flex-col gap-3 text-sm">
              {["About","Services","Domains","Contact"].map(x => (
                <a key={x} href={`#${x.toLowerCase()}`} onClick={() => setOpen(false)} className="py-1">{x}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-hero text-white">
        <div className="container-px mx-auto py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs tracking-[0.25em] uppercase bg-white/10 border border-white/20 px-3 py-1 rounded-full">Digital Agency • Kigali</span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-[1.05] text-balance">
              Transforming ICT & digital brands across <span className="text-[var(--sky)]">Africa</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-xl">
              Creators Rwanda builds powerful digital systems — websites, hosting, domains and brand experiences — for ambitious businesses ready to scale.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#services" className="inline-flex items-center gap-2 bg-[var(--sky)] text-[var(--navy)] font-semibold px-5 py-3 rounded-md hover:brightness-110">
                Explore Services <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 rounded-md hover:bg-white/10">
                Talk to us
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 grid grid-cols-2 gap-4 shadow-elegant">
              {[Globe, Server, Share2, Rocket].map((Ic, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col justify-between">
                  <Ic className="w-7 h-7 text-[var(--sky)]" />
                  <div className="text-sm font-medium">{["Web", "Hosting", "Social", "Growth"][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y bg-[var(--secondary)]">
        <div className="container-px mx-auto grid grid-cols-2 md:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="flex items-start gap-3 p-5 md:p-7 border-r last:border-r-0 border-b md:border-b-0">
              <div className="w-10 h-10 rounded-lg bg-[var(--sky)]/20 text-[var(--navy)] grid place-items-center shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-semibold text-[var(--navy)]">{f.t}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="container-px mx-auto py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs tracking-[0.25em] uppercase text-[var(--sky)] font-semibold">About Us</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--navy)] text-balance">
            A Rwanda-based digital studio building Africa's modern web
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Creators Rwanda is a full-service digital agency operating from Kigali. We help businesses launch, grow and operate online — from registering the right domain to designing the brand, building the website, hosting it reliably and running the social channels that bring it to life.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {[
              { t: "Our Mission", d: "Empowering African businesses with world-class digital tools and design." },
              { t: "Our Vision", d: "To be the most trusted digital partner for ambitious brands across the continent." },
            ].map((b) => (
              <div key={b.t} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="font-display font-semibold text-[var(--navy)]">{b.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl border bg-card p-8 text-center shadow-card">
              <div className="text-4xl md:text-5xl font-display font-bold text-[var(--sky)]">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[var(--secondary)] py-20 md:py-28">
        <div className="container-px mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--sky)] font-semibold">Our Services</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--navy)] text-balance">Everything you need to run a modern digital business</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.title} className="group rounded-xl bg-card border p-7 hover:shadow-elegant hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-lg bg-[var(--navy)] text-white grid place-items-center group-hover:bg-[var(--sky)] group-hover:text-[var(--navy)] transition">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-[var(--navy)]">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <a href="#contact" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--sky)]">
                  Learn more <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="container-px mx-auto py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="text-xs tracking-[0.25em] uppercase text-[var(--sky)] font-semibold">Domains</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--navy)]">Find the perfect domain</h2>
          <p className="mt-3 text-muted-foreground">Check availability across .com, .rw, .africa and more.</p>
        </div>
        <div className="mt-8 rounded-2xl border bg-card p-6 md:p-8 shadow-card">
          <div className="flex flex-col md:flex-row gap-3">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="yourbusiness" className="h-12 text-base" />
            <Button onClick={lookup} className="h-12 px-7 bg-[var(--navy)] hover:brightness-110">Search</Button>
          </div>
          {results && (
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((r) => (
                <div key={r.tld} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-mono font-semibold">{q.toLowerCase()}{r.tld}</div>
                    <div className={`text-xs mt-0.5 ${r.available ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {r.available ? "Available" : "Taken"}
                    </div>
                  </div>
                  {r.available && <div className="text-sm font-semibold text-[var(--navy)]">${r.price}/yr</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Contact */}
      <section id="contact" className="container-px mx-auto py-20 md:py-28 grid md:grid-cols-2 gap-12">
        <div>
          <span className="text-xs tracking-[0.25em] uppercase text-[var(--sky)] font-semibold">Contact</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--navy)]">Let's build something remarkable</h2>
          <p className="mt-3 text-muted-foreground">Reach us directly — we respond within a few hours.</p>
          <div className="mt-8 space-y-4 text-sm">
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 hover:text-[var(--sky)]">
              <span className="w-10 h-10 rounded-lg bg-[var(--secondary)] grid place-items-center"><Mail className="w-4 h-4 text-[var(--navy)]" /></span>{EMAIL}
            </a>
            <a href={`tel:+250784254890`} className="flex items-center gap-3 hover:text-[var(--sky)]">
              <span className="w-10 h-10 rounded-lg bg-[var(--secondary)] grid place-items-center"><Phone className="w-4 h-4 text-[var(--navy)]" /></span>{PHONE}
            </a>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-[var(--secondary)] grid place-items-center"><MapPin className="w-4 h-4 text-[var(--navy)]" /></span>Kigali, Rwanda
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-2xl border bg-card p-7 shadow-card space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input required placeholder="Full name" />
            <Input required type="email" placeholder="Email address" />
          </div>
          <Input placeholder="Phone (optional)" />
          <Textarea required placeholder="Tell us about your project" rows={5} />
          <Button type="submit" className="w-full h-12 bg-[var(--navy)] hover:brightness-110">
            {sent ? "Message sent ✓" : "Send message"}
          </Button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--navy)] text-white/80">
        <div className="container-px mx-auto py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[var(--sky)] grid place-items-center text-[var(--navy)] font-display font-bold">C</div>
              <div className="text-white font-display font-bold">Creators Rwanda</div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">Digital agency building powerful brands and infrastructure for Africa's next generation.</p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-[var(--sky)]">About</a></li>
              <li><a href="#services" className="hover:text-[var(--sky)]">Services</a></li>
              <li><a href="#contact" className="hover:text-[var(--sky)]">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Market Place</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#domains" className="hover:text-[var(--sky)]">Domain Name</a></li>
              <li><a href="#hosting" className="hover:text-[var(--sky)]">Web Hosting</a></li>
              <li><a href="#hosting" className="hover:text-[var(--sky)]">SSL Certificates</a></li>
              <li><a href="#services" className="hover:text-[var(--sky)]">Email Hosting</a></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-sm">
              <li>{PHONE}</li>
              <li>{EMAIL}</li>
              <li>Kigali, Rwanda</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-px mx-auto py-5 text-xs flex flex-col md:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} Creators Rwanda. All rights reserved.</span>
            <span>Built with care in Kigali.</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={WHATSAPP} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-emerald-500 text-white grid place-items-center shadow-elegant hover:scale-105 transition">
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
