import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendOrderConfirmation(params: {
  to: string;
  orderNumber: string;
  total: string;
  items: { name: string; quantity: number; price: string }[];
}) {
  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td></tr>`
    )
    .join("");

  await getResend().emails.send({
    from: "by collection <siparis@bycollection.com>",
    to: params.to,
    subject: `Siparis Onayi - ${params.orderNumber}`,
    html: `
      <h1>Siparisininiz Alindi!</h1>
      <p>Siparis numaraniz: <strong>${params.orderNumber}</strong></p>
      <table>
        <thead><tr><th>Urun</th><th>Adet</th><th>Fiyat</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Toplam: ${params.total}</strong></p>
      <p>Tesekkur ederiz!</p>
    `,
  });
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}) {
  await getResend().emails.send({
    from: "by collection <iletisim@bycollection.com>",
    to: "info@bycollection.com",
    subject: `Iletisim Formu - ${params.name}`,
    replyTo: params.email,
    html: `
      <h2>Yeni Iletisim Mesaji</h2>
      <p><strong>Isim:</strong> ${params.name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p><strong>Mesaj:</strong></p>
      <p>${params.message}</p>
    `,
  });
}
