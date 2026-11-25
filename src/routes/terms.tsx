import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Terms of use — Murandasi Market";
const DESC = "Rules for buying and selling on Murandasi Market: payments, delivery, returns, buyer protection and prohibited items.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: [string, string][] = [
  ["Using the marketplace", "Murandasi Market connects buyers with independent shops in Rwanda. Each shop sells its own products and is responsible for them. You must give true details when you create an account and keep your sign-in private."],
  ["Paying", "Pay only through the website. Never send money to a seller by phone or outside the platform — we cannot protect payments made outside Murandasi. Prices shown are the prices you pay, with no extra platform fee."],
  ["Buyer protection", "After you pay, the seller's money is held for two days. If your item is damaged, wrong, fake or not delivered, open a complaint with a photo and explanation during that time and the money stays held until our team decides."],
  ["Delivery", "Sellers arrange delivery and share the driver's details in your order page. Delivery times depend on the seller and your location."],
  ["Returns and refunds", "You can get a refund or return when an item is damaged, wrong, fake or very different from its listing. Items that were used, broken by the buyer or reported after the protection time may not qualify."],
  ["Prohibited items", "Counterfeit or copied brands, stolen goods, weapons, drugs, unauthorised medicines, adult content and anything banned by Rwandan law are not allowed. We remove such listings and may close the shop."],
  ["Respectful conduct", "No fake reviews, fake ratings, harassment, scams, or sharing phone numbers and outside links in chat. Accounts that break these rules can be blocked."],
  ["Fees for sellers", "Murandasi Market keeps 10% of each completed payment and the seller receives 90%, as set out in the seller agreement."],
  ["Liability", "We work to keep the marketplace safe, but each seller is responsible for their products and delivery. Our responsibility is limited to the help described in these terms."],
  ["Law and changes", "These terms follow the laws of the Republic of Rwanda. We may update them; the date below shows the latest version."],
];

function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-extrabold text-heading md:text-3xl">Terms of use</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: November 2026</p>
      {SECTIONS.map(([h, t]) => (
        <section key={h} className="mt-6 space-y-2">
          <h2 className="text-lg font-bold text-heading">{h}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t}</p>
        </section>
      ))}
      <p className="mt-8 text-sm text-muted-foreground">See also our <Link to="/privacy" className="text-primary underline">Privacy policy</Link>.</p>
    </div>
  );
}
