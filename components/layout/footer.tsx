import Link from "next/link";

export function Footer() {
  return (
    <footer className="noise-overlay border-t border-gold-100 bg-charcoal text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-medium tracking-wide text-white">
                LUMIERE
              </span>
              <span className="ml-1 font-serif text-lg text-gold-400">&</span>
              <span className="ml-1 font-serif text-sm uppercase tracking-[0.3em] text-white/50">
                Co
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Fransızca&apos;da &quot;ışık&quot; anlamına gelen Lumière, benzersiz ve zarif
              takılarla lüks bir deneyim sunar.
            </p>
            <div className="mt-6 h-[0.5px] w-12 bg-gradient-to-r from-gold-500 to-transparent" />
          </div>

          {/* Koleksiyon */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-400">
              Koleksiyon
            </h4>
            <ul className="mt-5 space-y-3">
              {[
                { href: "/urunler/kolyeler", label: "Kolyeler" },
                { href: "/urunler/kupeler", label: "Küpeler" },
                { href: "/urunler/bileklikler", label: "Bileklikler" },
                { href: "/urunler/yuzukler", label: "Yüzükler" },
                { href: "/urunler/sahmeran", label: "Şahmeran" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/40 transition-colors duration-300 hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bilgi */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-400">
              Bilgi
            </h4>
            <ul className="mt-5 space-y-3">
              {[
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/iletisim", label: "İletişim" },
                { href: "#", label: "Gizlilik Politikası" },
                { href: "#", label: "Mesafeli Satış Sözleşmesi" },
                { href: "#", label: "İptal - İade Politikası" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/40 transition-colors duration-300 hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Iletisim */}
          <div>
            <h4 className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-400">
              İletişim
            </h4>
            <div className="mt-5 space-y-3 text-sm text-white/40">
              <p>+90 531 961 42 54</p>
              <p>info@lumiereand.com</p>
              <p className="pt-2 text-[11px] text-white/25">
                @lumiere.andco
              </p>
              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/25">
                  Güvenli Alışveriş
                </p>
                <p className="mt-1 text-xs text-white/30">
                  256 Bit SSL ile güvende alışveriş
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Tüm siparişler 7 iş gününde kargoda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} Lumière &amp; Co. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-white/25">
              Hijyen gereği değişim ve iade yoktur.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
