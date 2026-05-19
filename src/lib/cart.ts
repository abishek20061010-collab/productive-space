import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export type CartItem = {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  image: string | null;
  quantity: number;
};

const CART_KEY = "jaya_cart_v1";
const WISH_KEY = "jaya_wish_v1";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-changed"));
}
export function loadWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISH_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("wishlist-changed"));
}

export function addToCart(p: Product, qty = 1) {
  const cart = loadCart();
  const existing = cart.find((i) => i.product_id === p.id);
  if (existing) existing.quantity += qty;
  else
    cart.push({
      product_id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      unit: p.unit,
      image: p.images?.[0] ?? null,
      quantity: qty,
    });
  saveCart(cart);
}
export function setQty(productId: string, qty: number) {
  const cart = loadCart().map((i) =>
    i.product_id === productId ? { ...i, quantity: Math.max(1, qty) } : i,
  );
  saveCart(cart);
}
export function removeFromCart(productId: string) {
  saveCart(loadCart().filter((i) => i.product_id !== productId));
}
export function clearCart() {
  saveCart([]);
}
export function toggleWishlist(productId: string) {
  const ids = loadWishlist();
  const next = ids.includes(productId)
    ? ids.filter((i) => i !== productId)
    : [...ids, productId];
  saveWishlist(next);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}
export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
