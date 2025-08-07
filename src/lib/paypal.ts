import { loadScript } from "@paypal/paypal-js";

export const initializePayPal = async () => {
  return loadScript({
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "USD",
  });
}