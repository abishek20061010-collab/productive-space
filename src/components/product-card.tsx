import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatINR, addToCart, toggleWishlist, type Product } from "@/lib/cart";
import { useWishlistIds } from "@/hooks/use-auth";
import { resolveProductImage } from "@/lib/product-images";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const wish = useWishlistIds();
  const isWished = wish.includes(product.id);
  const img = resolveProductImage(product.slug, product.images);
  return (
    <article className="group relative flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block aspect-square overflow-hidden bg-secondary">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            width={600}
            height={600}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="size-full grid place-items-center text-muted-foreground text-xs">No image</div>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
          toast.success(isWished ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isWished}
        className="absolute top-3 right-3 grid place-items-center size-10 rounded-full bg-background/80 backdrop-blur hover:bg-background transition-colors"
      >
        <Heart className={`size-4 ${isWished ? "fill-leaf text-leaf" : ""}`} aria-hidden />
      </button>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="font-display text-lg leading-tight hover:text-leaf transition-colors">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-semibold text-base">{formatINR(Number(product.price))}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
              toast.success(`${product.name} added to cart`);
            }}
            disabled={product.stock === 0}
            className="text-xs font-medium px-3 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {product.stock === 0 ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
