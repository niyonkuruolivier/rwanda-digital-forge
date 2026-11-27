import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Murandasi Market" },
      { name: "description", content: "What Murandasi Market collects, how it is used, and how visitor analytics works." },
      { property: "og:title", content: "Privacy policy — Murandasi Market" },
      { property: "og:description", content: "What Murandasi Market collects, how it is used, and how visitor analytics works." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-extrabold text-heading md:text-3xl">Privacy policy</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: November 2026</p>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">What we collect</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When you create an account we store your name, email and phone number. When you buy or sell, we keep your orders,
          messages, reviews and the photos you upload, so the marketplace can work.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">How we use it</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use this information to run your orders, connect buyers and sellers, handle support requests and keep the
          platform safe. We do not sell your personal information.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">Visitor analytics</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This site uses Lovable's visitor analytics. It uses no cookies, stores nothing on your device, does not keep
          IP addresses and does not identify you. For every visitor it records the pages visited, where visitors came
          from, their country, browser, operating system and device type, how long they stay, how fast pages load,
          errors, and which buttons and links are clicked. Detailed data is kept for 90 days and daily summaries for a
          year. Lovable collects this data for us.{" "}
          <a href="https://lovable.dev/privacy" target="_blank" rel="noreferrer" className="text-primary underline">
            Lovable's privacy policy
          </a>{" "}
          explains how it handles it.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">Other services</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign-in is provided by our secure authentication service, including optional Google sign-in. Some older product videos are embedded from YouTube, Instagram or TikTok; when you play one, that service may set its own cookies. Fonts are loaded from Google Fonts.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">Who can see your details</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A seller sees only the name, phone and delivery address needed for the order you placed with them. Our team sees
          account details only to run the platform and resolve complaints. We share data with authorities only when Rwandan law requires it.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">How long we keep it and your rights</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Order and payment records are kept as long as needed for buyer protection, accounting and the law. You can ask to see,
          correct or delete your personal data, in line with Rwanda's law on the protection of personal data and privacy.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">Security and children</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your data is protected with secure sign-in and access rules. Murandasi Market is not meant for children under 16.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-bold text-heading">Questions</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For any privacy question, open a support ticket from your account and we will help you.
        </p>
      </section>
    </div>
  );
}
