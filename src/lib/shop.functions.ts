import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============ PUBLIC PRODUCTS ============
export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { categorySlug?: string; search?: string; featured?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("products").select("*, categories(name, slug)").eq("is_active", true).order("created_at", { ascending: false });
    if (data.featured) q = q.eq("is_featured", true);
    if (data.search && data.search.trim()) q = q.ilike("name", `%${data.search.trim()}%`);
    const { data: products, error } = await q;
    if (error) throw new Error(error.message);
    let filtered = products ?? [];
    if (data.categorySlug) {
      filtered = filtered.filter((p) => (p.categories as { slug?: string } | null)?.slug === data.categorySlug);
    }
    return { products: filtered };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(name, slug)")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return { product: null, reviews: [] };
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });
    return { product, reviews: reviews ?? [] };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return { categories: data ?? [] };
});

// ============ COUPON ============
export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(1).max(40), subtotal: z.number().min(0) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!coupon) return { valid: false as const, message: "Coupon not found" };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return { valid: false as const, message: "Coupon expired" };
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses)
      return { valid: false as const, message: "Coupon usage limit reached" };
    const discount =
      coupon.type === "percent"
        ? Math.round(data.subtotal * (Number(coupon.value) / 100))
        : Math.min(Number(coupon.value), data.subtotal);
    return { valid: true as const, code: coupon.code, discount, type: coupon.type, value: Number(coupon.value) };
  });

// ============ ORDERS ============
const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().max(200),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0),
  unit: z.string().max(80),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      items: z.array(orderItemSchema).min(1).max(50),
      customer_name: z.string().trim().min(1).max(120),
      customer_phone: z.string().trim().min(7).max(20),
      shipping_address: z.string().trim().min(10).max(800),
      coupon_code: z.string().trim().max(40).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Re-fetch product prices/stock server-side to avoid tampering
    const ids = data.items.map((i) => i.product_id);
    const { data: dbProducts, error: pErr } = await supabase
      .from("products")
      .select("id, name, price, stock, unit, is_active")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    const verifiedItems = data.items.map((i) => {
      const p = dbProducts?.find((x) => x.id === i.product_id);
      if (!p || !p.is_active) throw new Error(`Product unavailable: ${i.name}`);
      if (p.stock < i.quantity) throw new Error(`Insufficient stock for ${p.name}`);
      return {
        product_id: p.id,
        name: p.name,
        quantity: i.quantity,
        unit: p.unit,
        price: Number(p.price),
        line_total: Number(p.price) * i.quantity,
      };
    });

    const subtotal = verifiedItems.reduce((s, i) => s + i.line_total, 0);

    let discount = 0;
    let coupon_code: string | null = null;
    if (data.coupon_code && data.coupon_code.trim()) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (coupon) {
        const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        const maxedOut = coupon.max_uses && coupon.current_uses >= coupon.max_uses;
        if (!expired && !maxedOut) {
          discount = coupon.type === "percent"
            ? Math.round(subtotal * (Number(coupon.value) / 100))
            : Math.min(Number(coupon.value), subtotal);
          coupon_code = coupon.code;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: verifiedItems,
        subtotal,
        discount,
        total,
        coupon_code,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        shipping_address: data.shipping_address,
        status: "pending",
        whatsapp_sent_at: new Date().toISOString(),
      })
      .select("id, order_number, total, items, subtotal, discount, coupon_code, customer_name, customer_phone, shipping_address")
      .single();
    if (oErr) throw new Error(oErr.message);

    // Increment coupon usage (best-effort, admin)
    if (coupon_code) {
      await supabaseAdmin.rpc as unknown;
      const { data: c } = await supabaseAdmin.from("coupons").select("current_uses").eq("code", coupon_code).maybeSingle();
      if (c) {
        await supabaseAdmin.from("coupons").update({ current_uses: (c.current_uses ?? 0) + 1 }).eq("code", coupon_code);
      }
    }

    const ownerNumber = (process.env.OWNER_WHATSAPP_NUMBER ?? "").replace(/[^0-9]/g, "");

    return { order, ownerNumber };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, items, created_at, customer_name, shipping_address")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });

// ============ REVIEWS ============
export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      product_id: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().max(800).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("reviews").upsert(
      { product_id: data.product_id, user_id: userId, rating: data.rating, comment: data.comment ?? null },
      { onConflict: "product_id,user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ WISHLIST (server-side, for logged-in users) ============
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      full_name: z.string().trim().max(120),
      phone: z.string().trim().max(20),
      address: z.string().trim().max(800),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
