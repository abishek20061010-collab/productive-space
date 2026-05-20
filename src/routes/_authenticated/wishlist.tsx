import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useWishlistIds } from "@/hooks/use-auth";
import { listProducts } from "@/lib/shop.functions";
import { ProductCard } from "@/components/product-card";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({ meta: [{ title: "Your Wishlist — Jaya's Organic" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlistIds();
  const { data } = useQuery({ queryKey: ["all-products"], queryFn: () => listProducts() });
  const items = (data?.products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-5xl">Your wishlist</h1>
      <p className="text-muted-foreground mt-2">{items.length} saved item{items.length === 1 ? "" : "s"}</p>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="size-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No favourites yet.</p>
          <Link to="/shop" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground">Browse the harvest</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
