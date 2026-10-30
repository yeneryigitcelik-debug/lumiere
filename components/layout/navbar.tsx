"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { CART_STORAGE_KEY, useCartStore } from "@/stores/cart";

const MENU_ID = "mobile-nav-menu";

const LEFT_LINKS = [
  { href: "/urunler", label: "Tüm Ürünler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];
const RIGHT_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];
const MOBILE_LINKS = [
  { href: "/urunler", label: "Koleksiyon" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 rounded-sm";
const textLink = `inline-flex min-h-11 items-center text-[13px] uppercase tracking-[0.2em] text-charcoal/80 transition-colors duration-300 hover:text-gold-700 motion-reduce:transition-none ${focusRing}`;
const iconLink = `relative inline-flex h-11 w-11 items-center justify-center text-charcoal/75 transition-colors duration-300 hover:text-gold-700 motion-reduce:transition-none ${focusRing}`;

function isModifiedClick(e: MouseEvent<HTMLAnchorElement>) {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  const hydrated = useCartStore((s) => s.hasHydrated);
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  );
  const showCount = hydrated && totalItems > 0;

  // Mount: hydrate cart once, sync across tabs, read initial scroll.
  useEffect(() => {
    void useCartStore.persist.rehydrate();

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY || e.key === null)
        void useCartStore.persist.rehydrate();
    };
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("storage", onStorage);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close on route change.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Escape / outside / resize-to-desktop close while open.
  useEffect(() => {
    if (!mobileOpen) return;

    const ownsFocus = (node: Element | null) =>
      !!node &&
      (node === toggleRef.current ||
        !!document.getElementById(MENU_ID)?.contains(node));
    // Track whether the toggle or menu owns focus. CSS lg:hidden can blur the
    // focused element before the media query change event fires.
    let focusOwned = ownsFocus(document.activeElement);
    const onFocusIn = (e: FocusEvent) => {
      focusOwned = ownsFocus(e.target as Element | null);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      if (!mq.matches) return;
      const focusWasInMenu = ownsFocus(document.activeElement) || focusOwned;
      focusOwned = false;
      setMobileOpen(false);
      if (focusWasInMenu) logoRef.current?.focus();
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mq.addEventListener("change", onMq);
    return () => {
      focusOwned = false;
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      mq.removeEventListener("change", onMq);
    };
  }, [mobileOpen]);

  const closeOnPlainClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isModifiedClick(e)) setMobileOpen(false);
  };

  const cartLabel = showCount ? `Sepet, ${totalItems} ürün` : "Sepet";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 z-50 h-[72px] w-full border-b bg-cream/95 transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none supports-[backdrop-filter]:backdrop-blur-sm ${
        scrolled ? "border-gold-100/70 shadow-sm" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Ana menü"
        className="mx-auto flex h-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-6"
      >
        <div className="hidden items-center gap-8 lg:flex">
          {LEFT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={textLink}>
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          ref={logoRef}
          href="/"
          onClick={closeOnPlainClick}
          className={`group relative inline-flex min-h-11 min-w-0 shrink items-center whitespace-nowrap ${focusRing}`}
        >
          <span className="font-serif text-xs font-light lowercase tracking-[0.3em] text-gold-700 transition-colors duration-300 motion-reduce:transition-none sm:text-sm">
            by
          </span>
          <span className="ml-1.5 font-serif text-xl font-medium tracking-wide text-charcoal transition-colors duration-300 group-hover:text-gold-700 motion-reduce:transition-none sm:text-2xl">
            collection
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-0 h-px w-0 bg-gradient-to-r from-gold-400 to-gold-200 transition-all duration-500 group-hover:w-full motion-reduce:transition-none"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-6">
          <div className="hidden items-center gap-8 lg:flex">
            {RIGHT_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={textLink}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/hesabim"
              onClick={closeOnPlainClick}
              className={iconLink}
              aria-label="Hesabım"
            >
              <User size={20} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link
              href="/sepet"
              onClick={closeOnPlainClick}
              className={iconLink}
              aria-label={cartLabel}
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {showCount && (
                <span
                  aria-hidden="true"
                  className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-700 px-1 text-[10px] font-medium leading-none text-white"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={`inline-flex h-11 w-11 items-center justify-center text-charcoal/75 hover:text-gold-700 lg:hidden ${focusRing}`}
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls={MENU_ID}
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {mobileOpen ? (
                <X size={22} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        id={MENU_ID}
        role="navigation"
        aria-label="Mobil menü"
        hidden={!mobileOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-b border-gold-100/70 bg-cream shadow-sm lg:hidden"
      >
        {mobileOpen && (
          <ul className="flex flex-col px-6 py-4 motion-safe:animate-fade-in">
            {MOBILE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeOnPlainClick}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`${textLink} w-full py-2`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
