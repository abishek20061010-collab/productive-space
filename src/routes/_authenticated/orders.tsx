import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/shop.functions";
import { formatINR } from "@/lib/cart";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — Jaya's Organic" }] }),
  component: OrdersPage,
});

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  paid: "bg-blue-100 text-blue-900",
  shipped: "bg-indigo-100 text-indigo-900",
  delivered: "bg-leaf/15 text-leaf",
  cancelled: "bg-red-100 text-red-900",
};

function OrdersPage() {
  const fetch = useServerFn(listMyOrders);
  const { data, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetch() });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-5xl">My orders</h1>

      {isLoading && <p className="mt-8 text-muted-foreground text-sm">Loading…</p>}
      {!isLoading && (data?.orders.length ?? 0) === 0 && (
        <div className="text-center py-20">
          <Package className="size-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet.</p>
          <Link to="/shop" className="inline-block mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground">Start shopping</Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {data?.orders.map((o) => {
          const items = o.items as Array<{ name: string; quantity: number; unit: string }>;
          return (
            <li key={o.id} className="p-5 rounded-2xl bg-card border border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-display text-lg">#{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[o.status] ?? "bg-secondary"}`}>{o.status}</span>
              </div>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                {items.map((it, idx) => (
                  <li key={idx}>{it.name} × {it.quantity} {it.unit}</li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between items-center border-t border-border/60 pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{formatINR(Number(o.total))}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
