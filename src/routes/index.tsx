import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listProducts, listCategories } from "@/lib/shop.functions";
import { ProductCard } from "@/components/product-card";
import hero from "@/assets/hero.jpg";
import { ArrowRight, Leaf, Sprout, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaya's Organic Products — Pure, hand-picked, farm-fresh" },
      { name: "description", content: "Shop pure organic leaves and herbs from Jaya's family farm. Hand-picked, pesticide-free, delivered fresh across India." },
      { property: "og:title", content: "Jaya's Organic Products" },
      { property: "og:description", content: "Pure organic products from our farm to your home." },
    ],
  }),
  loader: async ({ context }) => {
    const [{ products }, { categories }] = await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["products", "featured"], queryFn: () => listProducts({ data: { featured: true } }) }),
      context.queryClient.ensureQueryData({ queryKey: ["categories"], queryFn: () => listCategories() }),
    ]);
    return { products, categories };
  },
  component: Home,
});

function Home() {
  const { data: featured } = useSuspenseQuery({ queryKey: ["products", "featured"], queryFn: () => listProducts({ data: { featured: true } }) });
  const { data: cats } = useSuspenseQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5 sm:space-y-7 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-leaf/10 text-leaf text-xs font-medium tracking-wide uppercase">
              <Sprout className="size-3.5" aria-hidden /> Family farm · Tamil Nadu
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
              From our farm,<br />
              <span className="italic text-leaf">picked fresh</span><br />
              for your home.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
              Pure organic leaves, herbs, and natural produce — grown without pesticides and delivered with care.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Shop the harvest <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/about" className="inline-flex items-center px-6 py-3 rounded-full border border-border hover:bg-secondary transition-colors">
                Our story
              </Link>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <div className="absolute -inset-3 sm:-inset-4 bg-clay/30 rounded-3xl -rotate-2" aria-hidden />
            <img src={hero} alt="Hands holding fresh organic leaves on a farm table" width={1600} height={1000} className="relative rounded-2xl shadow-warm aspect-[4/3] object-cover w-full" />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-3 gap-6">
        {[
          { icon: Leaf, title: "100% Organic", body: "Grown without synthetic pesticides or chemicals." },
          { icon: Sprout, title: "Hand-picked daily", body: "Harvested the morning of dispatch for peak freshness." },
          { icon: Heart, title: "Made with care", body: "A small family farm — every order matters to us." },
        ].map((v) => (
          <div key={v.title} className="p-6 rounded-2xl bg-card border border-border/60">
            <span className="grid place-items-center size-10 rounded-full bg-leaf/15 text-leaf"><v.icon className="size-5" aria-hidden /></span>
            <h3 className="mt-4 font-display text-xl">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-4xl">This week's harvest</h2>
            <p className="mt-2 text-muted-foreground">Freshly picked, ready to ship.</p>
          </div>
          <Link to="/shop" className="text-sm font-medium hover:text-leaf inline-flex items-center gap-1">
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      {cats.categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display text-3xl mb-6">Browse by category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cats.categories.map((c) => (
              <Link key={c.id} to="/shop" search={{ category: c.slug }} className="p-6 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors border border-border/60">
                <h3 className="font-display text-xl">{c.name}</h3>
                {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
