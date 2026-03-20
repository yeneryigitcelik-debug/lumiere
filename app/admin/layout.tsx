import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  FileText,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderOpen },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen pt-16">
      <aside className="hidden w-60 border-r border-gold-100 bg-gold-50/30 p-5 lg:block">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-500">Yönetim</p>
          <h2 className="mt-1 font-serif text-lg font-medium text-charcoal">
            Admin Panel
          </h2>
          <div className="mt-2 h-[0.5px] w-8 bg-gradient-to-r from-gold-400 to-transparent" />
        </div>
        <nav className="mt-6 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-[12px] uppercase tracking-[0.1em] text-charcoal/50 transition-all duration-300 hover:bg-gold-100/50 hover:text-gold-700"
            >
              <item.icon size={16} strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
