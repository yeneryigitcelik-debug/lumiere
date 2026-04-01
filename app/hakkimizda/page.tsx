import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkimizda",
  description: "by collection hikayesi, vizyonu ve değerler.",
};

export default function AboutPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="noise-overlay relative overflow-hidden bg-charcoal py-24">
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold-400">
            Hikayemiz
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium text-white sm:text-5xl">
            Isik ve <span className="italic text-gold-400">Zarafet</span>
          </h1>
          <div className="mx-auto mt-6 h-[0.5px] w-12 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="space-y-8 text-sm leading-[2] text-charcoal/50">
          <p>
            by collection, ışık ve zarafeti bir araya getiren el yapımı takı
            koleksiyonları ile 2024 yılında kurulmuştur. Her bir parçamız, usta
            zanaatkârların ellerinde özenle şekillendirilmiştir.
          </p>
          <p>
            Markamizin temelinde, benzersizlik ve kalite anlayisi yatmaktadir.
            Kullandigimiz malzemeler, en yuksek standartlarda secilmis olup,
            her bir taki sizin icin ozel olarak uretilmektedir.
          </p>
          <p>
            Vizyonumuz, takinin sadece bir aksesuar degil, bir ifade araci
            olduguna inanmaktir. Her parcamiz, tasiyan kisinin hikayesini
            anlatir. Isik gibi parlayan, zamanin otesinde kalan tasarimlar
            yaratiyoruz.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-gold-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 sm:grid-cols-3">
            {[
              {
                value: "100%",
                title: "El Yapimi",
                desc: "Her parca usta eller tarafindan ozenle uretilir.",
              },
              {
                value: "500+",
                title: "Mutlu Musteri",
                desc: "Guven ve memnuniyetle buyuyen bir topluluk.",
              },
              {
                value: "50+",
                title: "Benzersiz Tasarim",
                desc: "Her biri benzersiz, tekrarlanmayan parcalar.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <p className="font-serif text-4xl font-medium text-gold-500">
                  {item.value}
                </p>
                <h3 className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-charcoal">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-charcoal/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
