import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, ShoppingBag, Ticket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/login", search: { redirect: location.href } });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl">Admin</h1>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-border/60 pb-1">
        {tabs.map((t) => {
          const active = t.exact ? path === t.to : path.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors ${
                active ? "bg-leaf/10 text-leaf border-b-2 border-leaf -mb-px" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
