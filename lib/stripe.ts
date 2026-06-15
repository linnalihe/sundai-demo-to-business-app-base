import Stripe from "stripe";
import { env } from "@/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("[Stripe] No API key configured");
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}
