"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        phone: "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await update({ name: form.name });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div>
        <div className="skeleton h-8 w-32" />
        <div className="mt-8 skeleton h-32 w-full" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-charcoal">Profil</h1>
      <div className="mt-1 h-[0.5px] w-10 bg-gradient-to-r from-gold-400 to-transparent" />

      <div className="mt-8 space-y-6">
        <div className="border border-gold-100 bg-gold-50/20 p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Ad</p>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Telefon</p>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="05XX XXX XX XX"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Ad</p>
                  <p className="mt-1 text-sm text-charcoal">{session.user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">E-posta</p>
                  <p className="mt-1 text-sm text-charcoal">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 text-[11px] uppercase tracking-[0.15em] text-gold-600 hover:text-gold-700"
              >
                Düzenle
              </button>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href="/hesabim/siparislerim" className="group border border-gold-100 p-5 transition-all hover:border-gold-300 hover:bg-gold-50/30">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gold-500">Siparişlerim</p>
            <p className="mt-1 text-sm text-charcoal/50">Sipariş geçmişinizi görüntüleyin</p>
          </a>
          <a href="/hesabim/adreslerim" className="group border border-gold-100 p-5 transition-all hover:border-gold-300 hover:bg-gold-50/30">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gold-500">Adreslerim</p>
            <p className="mt-1 text-sm text-charcoal/50">Kayıtlı adreslerinizi yönetin</p>
          </a>
        </div>
      </div>
    </div>
  );
}
