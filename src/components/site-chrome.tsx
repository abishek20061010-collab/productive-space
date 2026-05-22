import { Link, useRouter } from "@tanstack/react-router";
import { Leaf, ShoppingBag, Heart, User as UserIcon, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, useCartCount } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SiteHeader() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const cartCount = useCartCount();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "backdrop-blur-md bg-background/85 border-b border-border/60 shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center size-9 rounded-full bg-leaf/15 text-leaf group-hover:scale-105 transition-transform">
            <Leaf className="size-5" aria-hidden />
          </span>
          <span className="font-display text-xl tracking-tight">
            Jaya's <span className="text-leaf">Organic</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="/#home" className="hover:text-leaf transition-colors">Home</a>
          <a href="/#shop" className="hover:text-leaf transition-colors">Shop</a>
          <a href="/#about" className="hover:text-leaf transition-colors">About</a>
          <a href="/#contact" className="hover:text-leaf transition-colors">Contact</a>
        </nav>


        <div className="flex items-center gap-1">
          <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:grid place-items-center size-11 rounded-full hover:bg-secondary transition-colors">
            <Heart className="size-5" aria-hidden />
          </Link>
          <Link to="/cart" aria-label={`Cart with ${cartCount} items`} className="relative grid place-items-center size-11 rounded-full hover:bg-secondary transition-colors">
            <ShoppingBag className="size-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center size-5 rounded-full bg-leaf text-leaf-foreground text-[10px] font-semibold">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <Link to="/admin" aria-label="Admin dashboard" className="grid place-items-center size-11 rounded-full hover:bg-secondary transition-colors">
                  <LayoutDashboard className="size-5" aria-hidden />
                </Link>
              )}
              <Link to="/account" aria-label="My account" className="grid place-items-center size-11 rounded-full hover:bg-secondary transition-colors">
                <UserIcon className="size-5" aria-hidden />
              </Link>
              <button onClick={logout} aria-label="Sign out" className="grid place-items-center size-11 rounded-full hover:bg-secondary transition-colors">
                <LogOut className="size-5" aria-hidden />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden grid place-items-center size-11 rounded-full hover:bg-secondary"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <nav className="px-4 py-4 flex flex-col gap-1 text-sm">
            {[
              { to: "/#home", label: "Home" },
              { to: "/#shop", label: "Shop" },
              { to: "/#about", label: "About" },
              { to: "/#contact", label: "Contact" },
              { to: "/wishlist", label: "Wishlist" },
            ].map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-secondary">
                {l.label}
              </a>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-secondary">Admin</Link>}
                <Link to="/account" onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-secondary">My Account</Link>
                <button onClick={() => { setOpen(false); logout(); }} className="text-left py-3 px-2 rounded hover:bg-secondary">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-secondary">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 sm:mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid gap-8 sm:gap-10 grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-2 max-w-md">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-9 rounded-full bg-leaf/15 text-leaf">
              <Leaf className="size-5" aria-hidden />
            </span>
            <span className="font-display text-xl">Jaya's Organic</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Pure organic products from our family farm to your home. Hand-picked, naturally grown, and delivered with care.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-foreground">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Jaya's Organic Products. All rights reserved.</span>
          <span>Crafted with care · WhatsApp orders only</span>
        </div>
      </div>
    </footer>
  );
}
