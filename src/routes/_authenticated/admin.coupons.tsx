import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListCoupons, adminSaveCoupon, adminDeleteCoupon } from "@/lib/admin.functions";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: AdminCoupons,
});

const empty = {
  id: null as string | null,
  code: "",
  type: "percent" as "percent" | "flat",
  value: 10,
  max_uses: null as number | null,
  expires_at: null as string | null,
  is_active: true,
};

function AdminCoupons() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCoupons);
  const saveFn = useServerFn(adminSaveCoupon);
  const delFn = useServerFn(adminDeleteCoupon);
  const { data } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => listFn() });
  const [form, setForm] = useState<typeof empty | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      await saveFn({ data: form });
      toast.success("Saved");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl">Coupons</h2>
        <button onClick={() => setForm({ ...empty })} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
          <Plus className="size-4" /> New coupon
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Uses</th><th className="p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {data?.coupons.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3">{c.current_uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td className="p-3">{c.is_active ? <span className="text-xs px-2 py-1 rounded-full bg-leaf/15 text-leaf">Active</span> : <span className="text-xs px-2 py-1 rounded-full bg-secondary">Off</span>}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(c.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded" aria-label="Delete"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <form onSubmit={submit} className="bg-background rounded-2xl border border-border w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-2xl">New coupon</h3>
              <button type="button" onClick={() => setForm(null)} aria-label="Close"><X /></button>
            </div>
            <label className="block text-sm">Code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background font-mono" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">Type
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </label>
              <label className="block text-sm">Value<input type="number" required min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
            </div>
            <label className="block text-sm">Max uses (optional)
              <input type="number" min={0} value={form.max_uses ?? ""} onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
            </label>
            <label className="block text-sm">Expires (optional)
              <input type="datetime-local" value={form.expires_at ?? ""} onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-full border border-border text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
