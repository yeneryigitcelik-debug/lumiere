import Iyzipay from "iyzipay";

let _iyzipay: Iyzipay | null = null;

export function getIyzipay(): Iyzipay {
  if (!_iyzipay) {
    _iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    });
  }
  return _iyzipay;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: string;
  price: string;
}

export function createCheckoutFormRequest(params: {
  conversationId: string;
  price: string;
  paidPrice: string;
  basketItems: IyzicoBasketItem[];
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  callbackUrl: string;
}) {
  return {
    locale: "tr",
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: "TRY",
    basketItems: params.basketItems.map((item) => ({
      ...item,
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    })),
    buyer: {
      ...params.buyer,
      gsmNumber: "+905000000000",
      zipCode: "00000",
    },
    shippingAddress: params.shippingAddress,
    billingAddress: params.billingAddress,
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
  };
}
