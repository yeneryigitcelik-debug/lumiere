export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-charcoal">Profil</h1>
      <div className="mt-1 h-[0.5px] w-10 bg-gradient-to-r from-gold-400 to-transparent" />

      <div className="mt-8 space-y-6">
        <div className="border border-gold-100 bg-gold-50/20 p-6">
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
