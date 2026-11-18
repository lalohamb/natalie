import { giving } from "@/content/site";
import { getPaymentLinkUrl } from "./stripe-settings";

export async function getGiving() {
  const storedUrl = await getPaymentLinkUrl();
  return { ...giving, stripeUrl: storedUrl ?? giving.stripeUrl };
}
