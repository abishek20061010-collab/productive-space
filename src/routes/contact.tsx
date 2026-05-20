import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jaya's Organic Products" },
      { name: "description", content: "Reach out via WhatsApp or email for orders, bulk pricing, or questions." },
      { property: "og:title", content: "Contact Jaya's Organic" },
      { property: "og:description", content: "Get in touch for orders or bulk inquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm tracking-[0.25em] uppercase text-leaf">Get in touch</p>
      <h1 className="font-display text-5xl mt-3">We'd love to hear from you.</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Questions about products, bulk orders, or wholesale pricing? Reach us directly — we reply personally.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <a
          href="https://wa.me/919600068751"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-5 rounded-2xl bg-leaf text-leaf-foreground hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="size-6" />
          <div>
            <div className="font-medium">WhatsApp</div>
            <div className="text-sm opacity-90">+91 96000 68751</div>
          </div>
        </a>
        <a
          href="mailto:abishek20061010@gmail.com"
          className="flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60 hover:bg-secondary transition-colors"
        >
          <Mail className="size-6 text-leaf" />
          <div>
            <div className="font-medium">Email</div>
            <div className="text-sm text-muted-foreground">abishek20061010@gmail.com</div>
          </div>
        </a>
      </div>

      <div className="mt-6 flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60">
        <MapPin className="size-6 text-leaf" />
        <div className="text-sm text-muted-foreground">Shipping across India · WhatsApp orders only</div>
      </div>
    </div>
  );
}
