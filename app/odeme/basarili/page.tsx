import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ siparis?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.siparis;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 pt-24">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-6 font-serif text-3xl font-medium text-charcoal">
          Ödeme Başarılı!
        </h1>
        <p className="mt-3 text-sm text-charcoal/50">
          Siparişiniz başarıyla alındı. Teşekkür ederiz!
        </p>
        {orderNumber && (
          <p className="mt-2 text-[12px] text-charcoal/40">
            Sipariş numaranız: <strong className="text-charcoal/70">{orderNumber}</strong>
          </p>
        )}
        <p className="mt-4 text-[11px] text-charcoal/30">
          Tüm siparişler 7 iş gününde kargoya verilir.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/hesabim/siparislerim"
            className="bg-charcoal px-6 py-2.5 text-[12px] uppercase tracking-[0.15em] text-white transition-all hover:bg-gold-700"
          >
            Siparişlerim
          </Link>
          <Link
            href="/urunler"
            className="border border-gold-200 px-6 py-2.5 text-[12px] uppercase tracking-[0.15em] text-charcoal/60 transition-all hover:border-gold-500 hover:text-gold-700"
          >
            Alışverişe Devam
          </Link>
        </div>
      </div>
    </div>
  );
}
