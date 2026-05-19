
# Pure Organic — E-commerce Web App Plan

A clean, warm-artisan storefront for your organic products. Customers browse, add to cart, and "checkout" by sending the order to your WhatsApp number; you confirm payment (GPay screenshot) and process the order from an admin dashboard.

---

## 1. Scope (v1)

**Customer-facing**
- Home, Shop (with category filter + search), Product Detail, Cart, Wishlist
- Checkout → opens WhatsApp with pre-formatted order (items, qty, price, total, address, coupon)
- User signup/login (email + Google)
- Order history ("My Orders" with status: Pending → Payment Verified → Shipped → Delivered)
- Product reviews + star ratings (only verified buyers)
- About, Contact pages

**Admin (you only)**
- Login-gated `/admin` dashboard
- Product CRUD (name, description, price, stock, category, images, organic certifications)
- Order management (view incoming WhatsApp orders, upload payment screenshot, update status)
- Coupon management (code, % or flat discount, expiry, usage limit)
- Customer list + basic sales overview

**Out of scope for v1** — automated payment gateway, shipping API, multi-vendor, blog.

---

## 2. Design Direction

- **Vibe:** Warm Artisan — earthy, handmade, trustworthy
- **Palette:** Cream `#faf8f5`, Sand `#f0ebe3`, Clay `#c9b99a`, Walnut `#8b7355`, deep brown for text
- **Typography:** Serif display (Cormorant / Fraunces) + clean sans body (Inter / Karla)
- **Feel:** Generous whitespace, soft shadows, rounded corners (xl), subtle grain texture, hand-drawn leaf accents, product photos front-and-center
- **Motion:** Restrained — gentle fade-ins, hover lift on product cards

---

## 3. Tech Architecture

- **Frontend:** TanStack Start (React 19) + Tailwind v4 + shadcn/ui + Motion
- **Backend:** Lovable Cloud (Postgres + Auth + Storage) with RLS
- **Server logic:** `createServerFn` for product/order/coupon operations
- **Auth:** Email/password + Google (managed by Lovable broker)
- **Admin gating:** `user_roles` table + `has_role()` security-definer function (never store role on profile)
- **WhatsApp checkout:** Client builds an order in DB (status=`pending`), then opens `https://wa.me/<YOUR_NUMBER>?text=<encoded order summary + order ID>`
- **Images:** Lovable Cloud Storage bucket `product-images`

### Database tables
- `profiles` (id → auth.users, full_name, phone, address)
- `user_roles` (user_id, role: 'admin' | 'customer')
- `categories` (id, name, slug)
- `products` (id, name, slug, description, price, stock, category_id, images[], is_active)
- `orders` (id, user_id, items jsonb, subtotal, discount, total, coupon_code, shipping_address, status, payment_proof_url, whatsapp_sent_at, created_at)
- `reviews` (id, product_id, user_id, rating, comment, created_at) — RLS: only verified buyers can insert
- `wishlist` (user_id, product_id)
- `coupons` (code, type, value, expires_at, max_uses, current_uses, is_active)

---

## 4. Routes

```text
/                       Home (hero + featured products + story)
/shop                   Product grid with filters
/product/$slug          Product detail + reviews
/cart                   Cart + coupon entry + "Order via WhatsApp"
/wishlist               Saved items
/login, /signup         Auth
/_authenticated/orders  Order history
/_authenticated/account Profile + addresses
/_admin/dashboard       Sales overview
/_admin/products        Product CRUD
/_admin/orders          Order management + payment verification
/_admin/coupons         Coupon CRUD
/about, /contact        Static
```

---

## 5. Build Phases

1. Enable Lovable Cloud, set up schema + RLS + admin role
2. Design system (tokens, fonts, base components)
3. Public storefront (Home, Shop, Product Detail) with seed data
4. Auth + Cart + Wishlist + Reviews
5. WhatsApp checkout flow + order creation
6. Admin dashboard (products, orders, coupons)
7. SEO meta per route, accessibility pass, mobile polish

---

## 6. Master Prompt (paste into your Antigravity agent)

```text
Build a full-stack e-commerce web app called "Pure Organic" for selling
pure organic products in India. Stack: React 19 + TanStack Start + Tailwind
v4 + shadcn/ui + Motion, with Postgres + Auth + Storage backend (RLS
enabled). Mobile-first, fully accessible (WCAG AA), SSR with per-route
SEO metadata.

DESIGN — Warm Artisan
- Palette: background #faf8f5, surface #f0ebe3, accent clay #c9b99a,
  primary walnut #8b7355, text deep brown #2a1f15.
- Fonts: Cormorant Garamond (display) + Karla (body). Generous whitespace,
  rounded-xl, soft shadows, subtle paper-grain texture, hand-drawn leaf
  motifs. Restrained motion: fade-in on scroll, gentle hover lift on cards.
- Define all colors as semantic tokens in styles.css (oklch). Never hard-
  code colors in components.

FEATURES (v1)
1. Customer storefront
   - Home: hero with brand story, featured products, categories, testimonials
   - Shop: grid with category filter, price sort, search, pagination
   - Product detail: gallery, description, organic certifications, stock,
     add-to-cart, add-to-wishlist, reviews with star ratings
   - Cart: line items, qty +/-, coupon code field, subtotal/discount/total
   - Wishlist
   - Auth: email/password + Google sign-in (via Lovable broker)
   - "My Orders" page: status timeline (Pending → Payment Verified →
     Shipped → Delivered)
   - About + Contact pages
2. WhatsApp checkout (NO payment gateway)
   - On "Place Order": validate cart + collect shipping address, create
     order row in DB with status='pending', then open
     https://wa.me/<OWNER_PHONE>?text=<urlencoded message> in a new tab.
   - Message format:
       *New Order #<order_id>*
       <Customer name, phone, address>
       --- Items ---
       1. <Product> × <qty> — ₹<line total>
       ...
       Subtotal: ₹<x>
       Discount (<coupon>): -₹<x>
       *Total: ₹<x>*
       Please share GPay payment screenshot to confirm.
   - Store OWNER_PHONE as an env var/secret.
3. Reviews — only users with a delivered order for that product can review
   (enforce in RLS + server fn).
4. Coupons — % or flat amount, expiry date, max-use cap. Validate server-side.
5. Admin dashboard (gated by 'admin' role in user_roles table — use a
   security-definer has_role() function; never store role on profiles)
   - Sales overview: revenue, orders by status, top products
   - Products CRUD with image upload to Storage bucket 'product-images'
   - Orders: list, view details, upload customer's payment screenshot,
     advance status, add tracking note
   - Coupons CRUD
   - Customers list

DATABASE (with RLS)
- profiles, user_roles, categories, products, orders, reviews, wishlist,
  coupons. Customers see only their own orders/wishlist; admin sees all.
  Products and reviews are public read.

ROUTING (TanStack file-based, separate route per page — NOT hash anchors)
- src/routes/index.tsx, shop.tsx, product.$slug.tsx, cart.tsx,
  wishlist.tsx, login.tsx, signup.tsx, about.tsx, contact.tsx
- src/routes/_authenticated/orders.tsx, account.tsx
- src/routes/_admin/dashboard.tsx, products.tsx, orders.tsx, coupons.tsx
- Each route exports its own head() with unique title, description, og:title,
  og:description. Add og:image where a product/hero image exists.

QUALITY BAR
- Use createServerFn for all DB writes and sensitive reads (never query
  the DB directly in loaders).
- Validate every input with zod on the server.
- Icon-only buttons need aria-label. Use semantic <main>, proper heading
  order, focus-visible rings, 44×44 tap targets, h-dvh not h-screen.
- Seed the DB with 8–10 sample organic products (honey, ghee, cold-pressed
  oils, herbal teas, spices) with placeholder images so the site looks
  alive immediately.
- Generate a real homepage — do not leave the placeholder index.

Build in this order: schema + auth + admin role → design system →
storefront with seed data → cart/wishlist/reviews → WhatsApp checkout →
admin dashboard → SEO/a11y pass.
```

---

## 7. What I need from you before I start building

1. **WhatsApp number** (with country code, e.g. `+9198xxxxxxxx`) — stored as a secret.
2. **Brand name** — is "Pure Organic" fine or do you have a chosen name + tagline?
3. **Initial product list** — even 5–6 with name, short description, price (₹), and category. I can use placeholders if you want to fill them in later from the admin panel.
4. **Your admin email** — the account that will be granted the `admin` role on first signup.

Once you approve this plan I'll enable Lovable Cloud, set up the schema, and start building phase by phase.
