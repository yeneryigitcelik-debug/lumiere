declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  class Iyzipay {
    constructor(config: IyzipayConfig);

    static BASKET_ITEM_TYPE: {
      PHYSICAL: string;
      VIRTUAL: string;
    };

    static PAYMENT_GROUP: {
      PRODUCT: string;
      LISTING: string;
      SUBSCRIPTION: string;
    };

    checkoutFormInitialize: {
      create: (
        request: Record<string, unknown>,
        callback: (err: unknown, result: Record<string, unknown>) => void
      ) => void;
    };

    checkoutForm: {
      retrieve: (
        request: Record<string, unknown>,
        callback: (err: unknown, result: Record<string, unknown>) => void
      ) => void;
    };
  }

  export = Iyzipay;
}
