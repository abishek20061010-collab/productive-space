import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  adminListProducts,
  adminSaveProduct,
  adminDeleteProduct,
  adminListCategories,
} from "@/lib/admin.functions";
import type { Tables } from "@/integrations/supabase/types";
import { formatINR } from "@/lib/cart";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type ProductRow = Tables<"products">;

const empty = {
  id: null as string | null,
  name: "",
  slug: "",
  description: "",
  price: 0,
  unit: "piece",
  stock: 0,
  category_id: null as string | null,
  is_active: true,
  is_featured: false,
  images: [] as string[],
  certifications: [] as string[],
};

function AdminProducts() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProducts);
  const catsFn = useServerFn(adminListCategories);
  const saveFn = useServerFn(adminSaveProduct);
  const delFn = useServerFn(adminDeleteProduct);
  const { data: list } = useQuery({ queryKey: ["admin-products"], queryFn: () => listFn() });
  const { data: cats } = useQuery({ queryKey: ["admin-categories"], queryFn: () => catsFn() });

  const [form, setForm] = useState<typeof empty | null>(null);

  function edit(p: ProductRow) {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      unit: p.unit,
      stock: p.stock,
      category_id: p.category_id,
      is_active: p.is_active,
      is_featured: p.is_featured,
      images: p.images ?? [],
      certifications: p.certifications ?? [],
    });
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
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
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl">Products</h2>
        <button onClick={() => setForm({ ...empty })} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
          <Plus className="size-4" /> New product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list?.products.map((p) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="p-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.slug}</div>
                </td>
                <td className="p-3">{formatINR(Number(p.price))}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  {p.is_active ? <span className="text-xs px-2 py-1 rounded-full bg-leaf/15 text-leaf">Active</span> : <span className="text-xs px-2 py-1 rounded-full bg-secondary">Hidden</span>}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => edit(p)} className="p-2 hover:bg-secondary rounded" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded" aria-label="Delete"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4 overflow-y-auto">
          <form onSubmit={submit} className="bg-background rounded-2xl border border-border w-full max-w-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-2xl">{form.id ? "Edit product" : "New product"}</h3>
              <button type="button" onClick={() => setForm(null)} aria-label="Close"><X /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm block">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
              <label className="text-sm block">Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
              <label className="text-sm block">Price (₹)<input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
              <label className="text-sm block">Unit<input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
              <label className="text-sm block">Stock<input required type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
              <label className="text-sm block">Category
                <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background">
                  <option value="">— None —</option>
                  {cats?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label className="text-sm block">Description<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" /></label>
            <label className="text-sm block">Image URLs (one per line)
              <textarea rows={2} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs" />
            </label>
            <label className="text-sm block">Certifications (comma separated)
              <input value={form.certifications.join(", ")} onChange={(e) => setForm({ ...form, certifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background" />
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-full border border-border text-sm">Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
