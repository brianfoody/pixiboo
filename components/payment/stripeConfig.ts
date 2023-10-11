import { loadStripe } from "@stripe/stripe-js";

export const testStripeConfig = {
  1: "price_1NzwsGCUXZGeicTa73yvjwnZ",
  2: "price_1NzwrfCUXZGeicTaTBYHBDTW",
  3: "price_1NzwrECUXZGeicTa1MFz6ace",
  4: "price_1NzwqvCUXZGeicTaUxwfEiEg",
  5: "price_1NzwsqCUXZGeicTaXJWPqctv",
};

export const purchase = async (props: {
  numberOfArtworks: number;
  redirectUrl: string;
}) => {
  const stripe = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  await stripe?.redirectToCheckout({
    lineItems: [
      {
        // @ts-ignore
        price: testStripeConfig[props.numberOfArtworks],
        quantity: 1,
      },
    ],
    successUrl: `https://pixiboo.ai/#ordersuccess`,
    cancelUrl: `https://pixiboo.ai/#orderfailure`,
    clientReferenceId: "<TODO Add artworks in here>",
    mode: "payment",
  });
};
