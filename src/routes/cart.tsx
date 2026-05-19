import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadCart, saveCart, setQty, removeFromCart, cartTotal, formatINR, clearCart, type CartItem } from "@/lib/cart";
import { resolveProductImage } from "@/lib/product-images";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { createOrder, validateCoupon, getMyProfile } from "@/lib/shop.functions";
import { Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Jaya's Organic" }, { name: "description", content: "Review your items and order via WhatsApp." }] }),
  component: Cart,
});

function Cart() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const validate = useServerFn(validateCoupon);
  const place = useServerFn(createOrder);
  const fetchProfile = useServerFn(getMyProfile);

  useEffect(() => {
    setItems(loadCart());
    const refresh = () => setItems(loadCart());
    window.addEventListener("cart-changed", refresh);
    return () => window.removeEventListener("cart-changed", refresh);
  }, []);

  useEffect(() => {
    if (user) fetchProfile().then(({ profile }) => {
      if (profile) {
        setName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
      }
    }).catch(() => {});
  }, [user, fetchProfile]);

  const subtotal = cartTotal(items);
  const total = Math.max(0, subtotal - discount);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    if (!user) { toast.error("Sign in to apply a coupon"); return; }
    try {
      const res = await validate({ data: { code: coupon, subtotal } });
      if (res.valid) {
        setDiscount(res.discount);
        setAppliedCode(res.code);
        toast.success(`Coupon applied: −${formatINR(res.discount)}`);
      } else {
        setDiscount(0); setAppliedCode(null);
        toast.error(res.message);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not apply coupon");
    }
  }

  async function placeOrder() {
    if (!user) { toast.error("Please sign in to place your order"); nav({ to: "/login" }); return; }
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    if (!name.trim() || !phone.trim() || address.trim().length < 10) {
      toast.error("Please fill in your name, phone, and a complete delivery address.");
      return;
    }
    setPlacing(true);
    try {
      const { order, ownerNumber } = await place({
        data: {
          items: items.map((i) => ({
            product_id: i.product_id, name: i.name, quantity: i.quantity, price: i.price, unit: i.unit,
          })),
          customer_name: name, customer_phone: phone, shipping_address: address,
          coupon_code: appliedCode,
        },
      });

      const lines = (order.items as Array<{ name: string; quantity: number; unit: string; line_total: number }>).map(
        (it, idx) => `${idx + 1}. ${it.name} × ${it.quantity} ${it.unit} — ${formatINR(it.line_total)}`,
      ).join("\n");

      const msg =
        `*New Order #${order.order_number}*\n\n` +
        `👤 ${order.customer_name}\n📞 ${order.customer_phone}\n📍 ${order.shipping_address}\n\n` +
        `*Items*\n${lines}\n\n` +
        `Subtotal: ${formatINR(Number(order.subtotal))}\n` +
        (Number(order.discount) > 0 ? `Discount (${order.coupon_code}): −${formatINR(Number(order.discount))}\n` : "") +
        `*Total: ${formatINR(Number(order.total))}*\n\n` +
        `Please share GPay payment screenshot to confirm. 🙏`;

      const wa = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(msg)}`;
      clearCart();
      window.open(wa, "_blank", "noopener");
      toast.success("Order created — complete payment on WhatsApp");
      nav({ to: "/orders" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-5xl mb-8">Your cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground">Browse the harvest</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <ul className="lg:col-span-2 space-y-4">
            {items.map((i) => {
              const img = resolveProductImage(i.slug, i.image ? [i.image] : []);
              return (
                <li key={i.product_id} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/60">
                  <Link to="/product/$slug" params={{ slug: i.slug }} className="shrink-0 size-24 rounded-xl overflow-hidden bg-secondary">
                    {img && <img src={img} alt={i.name} width={200} height={200} className="size-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to="/product/$slug" params={{ slug: i.slug }} className="font-display text-lg hover:text-leaf">{i.name}</Link>
                    <p className="text-xs text-muted-foreground">{i.unit}</p>
                    <p className="mt-1 font-medium">{formatINR(i.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-full overflow-hidden text-sm">
                        <button aria-label="Decrease" onClick={() => { setQty(i.product_id, i.quantity - 1); setItems(loadCart()); }} className="px-3 py-1 hover:bg-secondary">−</button>
                        <span className="px-3">{i.quantity}</span>
                        <button aria-label="Increase" onClick={() => { setQty(i.product_id, i.quantity + 1); setItems(loadCart()); }} className="px-3 py-1 hover:bg-secondary">+</button>
                      </div>
                      <button aria-label="Remove" onClick={() => { removeFromCart(i.product_id); setItems(loadCart()); }} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">{formatINR(i.price * i.quantity)}</div>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-5 p-6 rounded-2xl bg-secondary/40 border border-border/60 h-fit">
            <h2 className="font-display text-2xl">Order details</h2>

            <div className="space-y-3">
              <label className="block text-sm">Full name
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" required />
              </label>
              <label className="block text-sm">Phone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" required />
              </label>
              <label className="block text-sm">Delivery address
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" required />
              </label>
            </div>

            <div className="flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" aria-label="Coupon code" />
              <button onClick={applyCoupon} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">Apply</button>
            </div>

            <dl className="space-y-2 text-sm border-t border-border/60 pt-4">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-leaf"><dt>Discount ({appliedCode})</dt><dd>−{formatINR(discount)}</dd></div>}
              <div className="flex justify-between font-semibold text-base border-t border-border/60 pt-2"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
            </dl>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-leaf text-leaf-foreground font-medium hover:opacity-90 disabled:opacity-50"
            >
              <MessageCircle className="size-5" aria-hidden /> {placing ? "Placing…" : "Order via WhatsApp"}
            </button>
            <p className="text-xs text-muted-foreground text-center">You'll be taken to WhatsApp to confirm your order and send a GPay payment screenshot.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
