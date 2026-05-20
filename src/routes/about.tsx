import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Heart, Sprout } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Jaya's Organic Products" },
      { name: "description", content: "From our family farm to your kitchen — pure, organic, hand-picked produce grown with care." },
      { property: "og:title", content: "Our Story — Jaya's Organic" },
      { property: "og:description", content: "Family-grown organic produce, hand-picked with care." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm tracking-[0.25em] uppercase text-leaf">Our story</p>
      <h1 className="font-display text-5xl sm:text-6xl mt-3">From our farm, with care.</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        Jaya's Organic Products began in a small family garden — a quiet promise to grow food the
        way our grandmothers did. No chemicals. No shortcuts. Just sunlight, monsoon rain, and
        patient hands. Every leaf, herb, and bottle you receive is picked at peak freshness and
        sent the same day.
      </p>

      <div className="mt-14 grid sm:grid-cols-3 gap-6">
        {[
          { icon: Leaf, title: "100% Organic", body: "Grown without pesticides or synthetic fertilizers." },
          { icon: Sprout, title: "Hand-picked", body: "Harvested by our family — never machine-processed." },
          { icon: Heart, title: "Made with love", body: "Small batches, honest pricing, real people behind every order." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="p-6 rounded-2xl bg-card border border-border/60">
            <span className="grid place-items-center size-11 rounded-full bg-leaf/15 text-leaf"><Icon className="size-5" /></span>
            <h2 className="mt-4 font-display text-xl">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-3xl bg-secondary/50 border border-border/60">
        <h2 className="font-display text-3xl">How your order works</h2>
        <ol className="mt-5 space-y-3 text-sm text-muted-foreground list-decimal pl-5">
          <li>Add what you love to the cart and tap <em>Order via WhatsApp</em>.</li>
          <li>We'll receive your order details and share GPay details to confirm.</li>
          <li>Send your payment screenshot — we pack and ship the same day.</li>
        </ol>
      </div>
    </div>
  );
}
