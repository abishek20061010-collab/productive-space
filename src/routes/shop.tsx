import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { listProducts, listCategories } from "@/lib/shop.functions";
import { ProductCard } from "@/components/product-card";

const search = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop — Jaya's Organic Products" },
      { name: "description", content: "Browse pure organic leaves, herbs, and natural produce from our family farm." },
      { property: "og:title", content: "Shop Organic Products" },
    ],
  }),
  loaderDeps: ({ search: s }) => ({ category: s.category, q: s.q }),
  loader: async ({ context, deps }) => {
    const params = { categorySlug: deps.category, search: deps.q };
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["products", params], queryFn: () => listProducts({ data: params }) }),
      context.queryClient.ensureQueryData({ queryKey: ["categories"], queryFn: () => listCategories() }),
    ]);
    return params;
  },
  component: Shop,
});

function Shop() {
  const params = Route.useLoaderData();
  const nav = Route.useNavigate();
  const { data } = useSuspenseQuery({ queryKey: ["products", params], queryFn: () => listProducts({ data: params }) });
  const { data: cats } = useSuspenseQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <h1 className="font-display text-4xl sm:text-5xl">Our shop</h1>
        <p className="mt-2 text-muted-foreground">Hand-picked, naturally grown, freshly delivered.</p>
      </header>

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-8">
        <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0">
          <button
            onClick={() => nav({ search: {} })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm border ${!params.categorySlug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
          >
            All
          </button>
          {cats.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => nav({ search: { category: c.slug } })}
              className={`shrink-0 px-4 py-2 rounded-full text-sm border ${params.categorySlug === c.slug ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <input
          type="search"
          defaultValue={params.search ?? ""}
          placeholder="Search products…"
          onKeyDown={(e) => { if (e.key === "Enter") nav({ search: { category: params.categorySlug, q: (e.target as HTMLInputElement).value || undefined } }); }}
          className="sm:ml-auto px-4 py-2 rounded-full border border-border bg-background text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search products"
        />
      </div>

      {data.products.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
