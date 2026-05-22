import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Heart, Sprout, Camera, Package, Truck, ShoppingBag } from "lucide-react";

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

      {/* LIVE TRACKING */}
      <div className="mt-12 p-8 rounded-3xl bg-leaf/5 border border-leaf/20">
        <h2 className="font-display text-3xl">Live updates on WhatsApp</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          To build real trust, we share timestamped photos of your order at every stage —
          so you always know exactly what's happening with your produce.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Camera, title: "Picked", body: "Fresh-from-the-farm photo the moment we harvest." },
            { icon: Package, title: "Packed", body: "Packing photo with date & time stamp." },
            { icon: Truck, title: "Sent", body: "Dispatch confirmation and courier details." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="p-5 rounded-2xl bg-card border border-border/60">
              <span className="grid place-items-center size-10 rounded-full bg-leaf/15 text-leaf"><Icon className="size-5" /></span>
              <h3 className="mt-3 font-display text-lg">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MARKETPLACES */}
      <div className="mt-12 p-8 rounded-3xl bg-card border border-border/60">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          <ShoppingBag className="size-3.5" /> Also available on
        </div>
        <h2 className="font-display text-3xl mt-3">Find us across India's marketplaces</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Beyond our own store, Jaya's Organic Products is reaching homes through trusted
          e-commerce platforms.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { name: "Amazon", status: "Available now" },
            { name: "Flipkart", status: "Coming soon" },
            { name: "Meesho", status: "Coming soon" },
          ].map((m) => (
            <div key={m.name} className="p-4 rounded-2xl bg-secondary/50 border border-border/60 text-center">
              <div className="font-display text-lg sm:text-xl">{m.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
