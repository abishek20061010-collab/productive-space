import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "customer";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer role fetch
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setRole(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRole(uid: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    if (data?.some((r) => r.role === "admin")) setRole("admin");
    else setRole("customer");
  }

  return { session, user, role, loading, isAdmin: role === "admin" };
}

export function useCartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("jaya_cart_v1") || "[]");
        setCount(cart.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
      } catch {
        setCount(0);
      }
    };
    read();
    window.addEventListener("cart-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("cart-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return count;
}

export function useWishlistIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const read = () => {
      try {
        setIds(JSON.parse(localStorage.getItem("jaya_wish_v1") || "[]"));
      } catch {
        setIds([]);
      }
    };
    read();
    window.addEventListener("wishlist-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("wishlist-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return ids;
}
