import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProductBySlug, submitReview } from "@/lib/shop.functions";
import { addToCart, toggleWishlist, formatINR } from "@/lib/cart";
import { resolveProductImage } from "@/lib/product-images";
import { useAuth, useWishlistIds } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Star, Leaf, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Jaya's Organic` },
      { property: "og:title", content: params.slug.replace(/-/g, " ") },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["product", params.slug],
      queryFn: () => getProductBySlug({ data: { slug: params.slug } }),
    });
    if (!data.product) throw notFound();
    return { slug: params.slug };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const { data } = useSuspenseQuery({ queryKey: ["product", slug], queryFn: () => getProductBySlug({ data: { slug } }) });
  const { user } = useAuth();
  const wish = useWishlistIds();
  const submit = useServerFn(submitReview);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const p = data.product!;
  const img = resolveProductImage(p.slug, p.images);
  const isWished = wish.includes(p.id);
  const avg = data.reviews.length > 0 ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length : 0;

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submit({ data: { product_id: p.id, rating, comment: comment || null } });
      toast.success("Thanks for your review!");
      setComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "You can only review products you've received.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">← Back to shop</Link>
      <div className="mt-6 grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16">
        <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border/60">
          {img && <img src={img} alt={p.name} width={1024} height={1024} className="size-full object-cover" />}
        </div>
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">{p.name}</h1>


          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-border rounded-full overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="px-4 py-3 hover:bg-secondary">−</button>
              <span className="px-4 text-sm font-medium min-w-10 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase quantity" className="px-4 py-3 hover:bg-secondary">+</button>
            </div>
            <button
              onClick={() => { addToCart(p, qty); toast.success("Added to cart"); }}
              disabled={p.stock === 0}
              className="flex-1 min-w-[160px] px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {p.stock === 0 ? "Sold out" : "Add to cart"}
            </button>
            <button
              onClick={() => { toggleWishlist(p.id); toast.success(isWished ? "Removed from wishlist" : "Saved to wishlist"); }}
              aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWished}
              className="grid place-items-center size-12 rounded-full border border-border hover:bg-secondary shrink-0"
            >
              <Heart className={`size-5 ${isWished ? "fill-leaf text-leaf" : ""}`} aria-hidden />
            </button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            {p.stock > 0 ? `In stock · ${p.stock} available` : "Currently sold out"}
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="size-4 text-leaf" aria-hidden /> Picked & shipped within 24 hours</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-leaf" aria-hidden /> Payment via WhatsApp & GPay</li>
          </ul>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl mb-6">Reviews</h2>
        {data.reviews.length === 0 && <p className="text-muted-foreground text-sm">No reviews yet.</p>}
        <ul className="space-y-5">
          {data.reviews.map((r) => (
            <li key={r.id} className="p-5 rounded-xl bg-card border border-border/60">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < r.rating ? "fill-clay text-clay" : ""}`} aria-hidden />
                ))}
              </div>
              {r.comment && <p className="text-sm">{r.comment}</p>}
              <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>

        {user ? (
          <form onSubmit={handleReview} className="mt-8 p-6 rounded-2xl bg-secondary/40 border border-border/60 space-y-4">
            <h3 className="font-display text-xl">Leave a review</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
                  <Star className={`size-6 ${i < rating ? "fill-clay text-clay" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={800} rows={3} placeholder="Share your experience…" className="w-full p-3 rounded-lg border border-border bg-background" />
            <button type="submit" className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm">Submit review</button>
            <p className="text-xs text-muted-foreground">Only customers with a delivered order for this product can leave a review.</p>
          </form>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            <Link to="/login" className="underline">Sign in</Link> to leave a review.
          </p>
        )}
      </section>
    </div>
  );
}
