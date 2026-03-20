"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/stores/cart";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "glass border-b border-gold-100/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Left nav */}
        <div className="hidden items-center gap-8 lg:flex">
          <Link
            href="/urunler"
            className="text-[13px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors duration-300 hover:text-gold-600"
          >
            Tüm Ürünler
          </Link>
          <Link
            href="/hakkimizda"
            className="text-[13px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors duration-300 hover:text-gold-600"
          >
            Hakkımızda
          </Link>
        </div>

        {/* Logo */}
        <Link href="/" className="group relative">
          <span className="font-serif text-2xl font-medium tracking-wide text-charcoal transition-colors duration-300 group-hover:text-gold-700">
            LUMIERE
          </span>
          <span className="ml-1.5 font-serif text-lg font-light text-gold-500">
            &
          </span>
          <span className="ml-1.5 font-serif text-sm font-light uppercase tracking-[0.3em] text-charcoal/60">
            Co
          </span>
          <span className="absolute -bottom-1 left-0 h-[0.5px] w-0 bg-gradient-to-r from-gold-400 to-gold-200 transition-all duration-500 group-hover:w-full" />
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/blog"
              className="text-[13px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors duration-300 hover:text-gold-600"
            >
              Blog
            </Link>
            <Link
              href="/iletisim"
              className="text-[13px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors duration-300 hover:text-gold-600"
            >
              İletişim
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/hesabim"
              className="text-charcoal/60 transition-colors duration-300 hover:text-gold-600"
              aria-label="Hesabim"
            >
              <User size={19} strokeWidth={1.5} />
            </Link>
            <Link
              href="/sepet"
              className="group relative text-charcoal/60 transition-colors duration-300 hover:text-gold-600"
              aria-label="Sepet"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gold-500 text-[9px] font-medium text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="text-charcoal/60 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in glass absolute inset-x-0 top-full border-b border-gold-100/50 lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-6">
            {[
              { href: "/urunler", label: "Koleksiyon" },
              { href: "/hakkimizda", label: "Hakkimizda" },
              { href: "/blog", label: "Blog" },
              { href: "/iletisim", label: "Iletisim" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-[13px] uppercase tracking-[0.2em] text-charcoal/70 transition-colors hover:text-gold-600"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
