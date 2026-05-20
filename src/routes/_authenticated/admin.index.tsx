import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminStats } from "@/lib/admin.functions";
import { formatINR } from "@/lib/cart";
import { Package, ShoppingBag, IndianRupee, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetch = useServerFn(adminStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetch() });

  const cards = [
    { label: "Total revenue", value: data ? formatINR(data.revenue) : "—", icon: IndianRupee },
    { label: "Total orders", value: data?.ordersCount ?? "—", icon: ShoppingBag },
    { label: "Pending orders", value: data?.pendingCount ?? "—", icon: Clock },
    { label: "Active products", value: data?.productsCount ?? "—", icon: Package },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="p-6 rounded-2xl bg-card border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</span>
            <c.icon className="size-5 text-leaf" />
          </div>
          <div className="mt-3 font-display text-3xl">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
