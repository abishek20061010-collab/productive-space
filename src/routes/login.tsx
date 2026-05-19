import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const search = z.object({ mode: z.enum(["signin", "signup"]).optional(), redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — Jaya's Organic" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const s = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"signin" | "signup">(s.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome to Jaya's Organic!");
        nav({ to: s.redirect ?? "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        nav({ to: s.redirect ?? "/" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) { toast.error("Google sign-in failed"); return; }
      if (result.redirected) return;
      nav({ to: s.redirect ?? "/" });
    } catch {
      toast.error("Google sign-in failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl text-center">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "Sign in to track your orders and save favourites." : "Join Jaya's Organic family."}
      </p>

      <button onClick={google} className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-full border border-border hover:bg-secondary">
        <svg className="size-5" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.5c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.46 2.1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.43 9.14 5.5 12 5.5z"/></svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <label className="block text-sm">Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
          </label>
        )}
        <label className="block text-sm">Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </label>
        <label className="block text-sm">Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </label>
        <button type="submit" disabled={busy} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="underline text-foreground">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/">← Back to shop</Link>
      </p>
    </div>
  );
}
