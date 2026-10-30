"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SessionUser = Session["user"];
type UpdateSession = ReturnType<typeof useSession>["update"];

function ownerKeyOf(user: SessionUser): string | null {
  if (typeof user.id === "string" && user.id) return `id:${user.id}`;
  if (typeof user.email === "string" && user.email) return `email:${user.email}`;
  return null;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/giris");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div>
        <div className="skeleton h-8 w-32" />
        <div className="mt-8 skeleton h-32 w-full" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const ownerKey = ownerKeyOf(user);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-charcoal">Profil</h1>
      <div className="mt-1 h-[0.5px] w-10 bg-gradient-to-r from-gold-400 to-transparent" />

      <div className="mt-8 space-y-6">
        <ProfileCard
          key={ownerKey ?? "unknown-owner"}
          user={user}
          canEdit={ownerKey !== null}
          update={update}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/hesabim/siparislerim" className="group border border-gold-100 p-5 transition-all hover:border-gold-300 hover:bg-gold-50/30">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gold-500">Siparişlerim</p>
            <p className="mt-1 text-sm text-charcoal/50">Sipariş geçmişinizi görüntüleyin</p>
          </Link>
          <Link href="/hesabim/adreslerim" className="group border border-gold-100 p-5 transition-all hover:border-gold-300 hover:bg-gold-50/30">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gold-500">Adreslerim</p>
            <p className="mt-1 text-sm text-charcoal/50">Kayıtlı adreslerinizi yönetin</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  user: SessionUser;
  canEdit: boolean;
  update: UpdateSession;
}

// Keyed by stable owner identity: an owner change unmounts this card,
// discarding the draft and aborting any pending save for the old owner.
function ProfileCard({ user, canEdit, update }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });

  const mountedRef = useRef(false);
  const attemptRef = useRef(0);
  const lockRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      attemptRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  const startEditing = () => {
    if (!canEdit) return;
    setForm({ name: user.name || "", phone: "" });
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    // Discard any pending attempt; the server may already have applied it.
    attemptRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    lockRef.current = false;
    setSaving(false);
    setError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!canEdit || lockRef.current) return;
    lockRef.current = true;
    const attempt = ++attemptRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    const payload = { name: form.name, phone: form.phone };
    const isCurrent = () => mountedRef.current && attemptRef.current === attempt;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!isCurrent()) return;
      if (!res.ok) {
        setError("Profil kaydedilemedi. Lütfen tekrar deneyin.");
        return;
      }
      await update({ name: payload.name });
      if (!isCurrent()) return;
      setEditing(false);
    } catch {
      if (controller.signal.aborted || !isCurrent()) return;
      setError("Bağlantı sorunu nedeniyle profil kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      if (isCurrent()) {
        lockRef.current = false;
        setSaving(false);
      }
    }
  };

  return (
    <div className="border border-gold-100 bg-gold-50/20 p-6">
      {editing && canEdit ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="block text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Ad</label>
              <Input
                id="profile-name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Telefon</label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="05XX XXX XX XX"
                className="mt-1"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">{error}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing}>
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Ad</p>
              <p className="mt-1 text-sm text-charcoal">{user.name || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40">E-posta</p>
              <p className="mt-1 text-sm text-charcoal">{user.email}</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={startEditing}
              className="mt-4 text-[11px] uppercase tracking-[0.15em] text-gold-600 hover:text-gold-700"
            >
              Düzenle
            </button>
          )}
        </>
      )}
    </div>
  );
}
