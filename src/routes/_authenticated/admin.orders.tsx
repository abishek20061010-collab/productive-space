import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListOrders, adminUpdateOrder } from "@/lib/admin.functions";
import { formatINR } from "@/lib/cart";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

const statuses = ["pending", "payment_verified", "shipped", "delivered", "cancelled"] as const;
const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  payment_verified: "bg-blue-100 text-blue-900",
  shipped: "bg-indigo-100 text-indigo-900",
  delivered: "bg-leaf/15 text-leaf",
  cancelled: "bg-red-100 text-red-900",
};

function AdminOrders() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListOrders);
  const updateFn = useServerFn(adminUpdateOrder);
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn() });
  const [open, setOpen] = useState<string | null>(null);

  async function changeStatus(id: string, status: (typeof statuses)[number]) {
    try {
      await updateFn({ data: { id, status } });
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl mb-4">Orders</h2>
      {data?.orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      {data?.orders.map((o) => {
        const items = o.items as Array<{ name: string; quantity: number; unit: string; price: number; line_total: number }>;
        const isOpen = open === o.id;
        return (
          <div key={o.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : o.id)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 text-left">
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg">#{o.order_number}</div>
                <div className="text-xs text-muted-foreground">{o.customer_name} · {o.customer_phone} · {new Date(o.created_at).toLocaleString()}</div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[o.status] ?? "bg-secondary"}`}>{o.status}</span>
              <span className="font-semibold">{formatINR(Number(o.total))}</span>
              {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {isOpen && (
              <div className="p-4 border-t border-border/60 space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Delivery</h4>
                  <p className="text-sm whitespace-pre-line">{o.shipping_address}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Items</h4>
                  <ul className="text-sm space-y-1">
                    {items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{it.name} × {it.quantity} {it.unit}</span>
                        <span>{formatINR(it.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 pt-2 border-t border-border/60 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(Number(o.subtotal))}</span></div>
                    {Number(o.discount) > 0 && <div className="flex justify-between text-leaf"><span>Discount ({o.coupon_code})</span><span>−{formatINR(Number(o.discount))}</span></div>}
                    <div className="flex justify-between font-semibold mt-1"><span>Total</span><span>{formatINR(Number(o.total))}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Set status:</span>
                  {statuses.map((s) => (
                    <button key={s} onClick={() => changeStatus(o.id, s)} disabled={o.status === s} className={`text-xs px-3 py-1.5 rounded-full border ${o.status === s ? "bg-leaf text-leaf-foreground border-leaf" : "border-border hover:bg-secondary"}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <a
                  href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-leaf hover:underline"
                >
                  Message customer on WhatsApp →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
