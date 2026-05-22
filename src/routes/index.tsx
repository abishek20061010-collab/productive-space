import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { listProducts, listCategories } from "@/lib/shop.functions";
import { ProductCard } from "@/components/product-card";
import { FadeSection } from "@/components/fade-section";
import hero from "@/assets/hero.jpg";
import {
  ArrowRight,
  Leaf,
  Sprout,
  Heart,
  Camera,
  Package,
  Truck,
  ShieldCheck,
  ShoppingBag,
  MessageCircle,
  Mail,
  MapPin,
} from "lucide-react";

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

  // Enable scroll-snap + smooth-scroll only while on the home page.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("snap-page");
    return () => html.classList.remove("snap-page");
  }, []);

  return (
    <div className="-mt-16">{/* offset sticky header height so first section fills viewport */}
      {/* ============ HOME ============ */}
      <FadeSection id="home" className="pt-20 sm:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
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
              <a href="#shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Shop the harvest <ArrowRight className="size-4" aria-hidden />
              </a>
              <a href="#about" className="inline-flex items-center px-6 py-3 rounded-full border border-border hover:bg-secondary transition-colors">
                Our story
              </a>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <div className="absolute -inset-3 sm:-inset-4 bg-clay/30 rounded-3xl -rotate-2" aria-hidden />
            <img src={hero} alt="Hands holding fresh organic leaves on a farm table" width={1600} height={1000} className="relative rounded-2xl shadow-warm aspect-[4/3] object-cover w-full" />
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground pb-6 animate-bounce">↓ Scroll to explore</div>
      </FadeSection>

      {/* ============ SHOP ============ */}
      <FadeSection id="shop" className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-sm tracking-[0.25em] uppercase text-leaf">Our shop</p>
              <h2 className="font-display text-4xl sm:text-5xl mt-2">This week's harvest</h2>
              <p className="mt-2 text-muted-foreground">Freshly picked, ready to ship.</p>
            </div>
            <Link to="/shop" className="text-sm font-medium hover:text-leaf inline-flex items-center gap-1">
              View full shop <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          {cats.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {cats.categories.slice(0, 6).map((c) => (
                <Link key={c.id} to="/shop" search={{ category: c.slug }} className="px-4 py-2 rounded-full text-sm border border-border hover:bg-secondary transition-colors">
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.products.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </FadeSection>

      {/* ============ ABOUT ============ */}
      <FadeSection id="about">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 w-full">
          <p className="text-sm tracking-[0.25em] uppercase text-leaf">Our story</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3">From our farm, with care.</h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Jaya's Organic Products began in a small family garden — a quiet promise to grow food
            the way our grandmothers did. No chemicals. No shortcuts. Just sunlight, monsoon rain,
            and patient hands.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Leaf, title: "100% Organic", body: "No pesticides, no synthetic fertilizers." },
              { icon: Sprout, title: "Hand-picked", body: "Harvested by our family, never machine-processed." },
              { icon: Heart, title: "Made with love", body: "Small batches, honest pricing, real people." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-5 sm:p-6 rounded-2xl bg-card border border-border/60">
                <span className="grid place-items-center size-10 rounded-full bg-leaf/15 text-leaf"><Icon className="size-5" /></span>
                <h3 className="mt-4 font-display text-xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Live tracking */}
          <div className="mt-10 rounded-3xl bg-leaf/5 border border-leaf/20 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf/15 text-leaf text-xs font-medium uppercase tracking-wider">
              <ShieldCheck className="size-3.5" aria-hidden /> Trust & transparency
            </span>
            <h3 className="font-display text-2xl sm:text-3xl mt-3">
              Watch your order travel — <span className="italic text-leaf">live on WhatsApp.</span>
            </h3>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: Camera, title: "Picked", body: "Fresh-from-the-farm photo." },
                { icon: Package, title: "Packed", body: "Packing photo with timestamp." },
                { icon: Truck, title: "Sent", body: "Courier dispatch confirmation." },
              ].map((s) => (
                <div key={s.title} className="p-4 rounded-2xl bg-card border border-border/60">
                  <span className="grid place-items-center size-9 rounded-full bg-leaf/15 text-leaf"><s.icon className="size-5" /></span>
                  <h4 className="mt-2 font-display text-lg">{s.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Marketplaces */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              <ShoppingBag className="size-3.5" /> Also available on
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
              {[
                { name: "Amazon", status: "Available now" },
                { name: "Flipkart", status: "Coming soon" },
                { name: "Meesho", status: "Coming soon" },
              ].map((m) => (
                <div key={m.name} className="p-4 rounded-2xl bg-card border border-border/60 text-center">
                  <div className="font-display text-lg sm:text-xl">{m.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ============ CONTACT ============ */}
      <FadeSection id="contact" className="bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 w-full">
          <p className="text-sm tracking-[0.25em] uppercase text-leaf">Get in touch</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3">We'd love to hear from you.</h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Questions about products, bulk orders, or wholesale pricing? Reach us directly — we reply personally.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/919600068751"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-5 rounded-2xl bg-leaf text-leaf-foreground hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="size-6" />
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm opacity-90">+91 96000 68751</div>
              </div>
            </a>
            <a
              href="mailto:abishek20061010@gmail.com"
              className="flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60 hover:bg-secondary transition-colors"
            >
              <Mail className="size-6 text-leaf" />
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground break-all">abishek20061010@gmail.com</div>
              </div>
            </a>
          </div>

          <div className="mt-4 flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60">
            <MapPin className="size-6 text-leaf" />
            <div className="text-sm text-muted-foreground">Shipping across India · WhatsApp orders only</div>
          </div>
        </div>
      </FadeSection>
    </div>
  );
}
