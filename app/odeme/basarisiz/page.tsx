import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 pt-24">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-charcoal">
          Ödeme Başarısız
        </h1>
        <p className="mt-3 text-sm text-charcoal/50">
          Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/sepet"
            className="bg-charcoal px-6 py-2.5 text-[12px] uppercase tracking-[0.15em] text-white transition-all hover:bg-gold-700"
          >
            Sepete Dön
          </Link>
          <Link
            href="/iletisim"
            className="border border-gold-200 px-6 py-2.5 text-[12px] uppercase tracking-[0.15em] text-charcoal/60 transition-all hover:border-gold-500 hover:text-gold-700"
          >
            Destek Al
          </Link>
        </div>
      </div>
    </div>
  );
}
