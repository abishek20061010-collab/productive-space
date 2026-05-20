import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, updateMyProfile } from "@/lib/shop.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — Jaya's Organic" }] }),
  component: AccountPage,
});

function AccountPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(updateMyProfile);
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchProfile().then(({ profile }) => {
      if (profile) {
        setName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
        setEmail(profile.email ?? "");
      }
    });
  }, [fetchProfile]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({ data: { full_name, phone, address } });
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-5xl">My account</h1>
      <p className="text-sm text-muted-foreground mt-2">{email}</p>

      <form onSubmit={submit} className="mt-8 space-y-4 p-6 rounded-2xl bg-card border border-border/60">
        <label className="block text-sm">Full name
          <input value={full_name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </label>
        <label className="block text-sm">Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </label>
        <label className="block text-sm">Default delivery address
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background" />
        </label>
        <button type="submit" disabled={busy} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="mt-6">
        <Link to="/orders" className="text-leaf hover:underline">View my orders →</Link>
      </div>
    </div>
  );
}
