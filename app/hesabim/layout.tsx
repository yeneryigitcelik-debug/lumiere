import Link from "next/link";
import { User, Package, MapPin } from "lucide-react";

const navItems = [
  { href: "/hesabim", label: "Profil", icon: User },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: Package },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPin },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-4">
          <aside>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
              Hesap
            </p>
            <h2 className="mt-2 font-serif text-2xl font-medium text-charcoal">
              Hesabım
            </h2>
            <div className="mt-2 h-[0.5px] w-10 bg-gradient-to-r from-gold-400 to-transparent" />

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.1em] text-charcoal/50 transition-all duration-300 hover:bg-gold-50 hover:text-gold-700"
                >
                  <item.icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
