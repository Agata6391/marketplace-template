
import { userProfileStore, type UserProfile } from "@/utils/userProfileStore";

export type CurrencyTotal = { currency: string; total: number };
export type SalesKpis = {
  totalSalesCount: number;
  totalsByCurrency: CurrencyTotal[];
  uniqueBuyers: number;
  topCollection?: string;
};

export function computeSalesKpis(profile: UserProfile): SalesKpis {
  const sold = profile.listings.filter((l) => l.status === "SOLD");
  const buyers = new Set<string>();
  const perCurrency = new Map<string, number>();
  const perCollection = new Map<string, number>();

  for (const s of sold) {
    if (s.buyer) buyers.add(s.buyer.toLowerCase());

    const cur = (s.currency || "").toUpperCase();
    const price = Number(s.price || 0);
    perCurrency.set(cur, (perCurrency.get(cur) || 0) + (Number.isFinite(price) ? price : 0));

    const key = s.collection.toLowerCase();
    perCollection.set(key, (perCollection.get(key) || 0) + (Number.isFinite(price) ? price : 0));
  }

  let topCollection: string | undefined;
  let max = -Infinity;
  for (const [col, sum] of perCollection.entries()) {
    if (sum > max) {
      max = sum;
      topCollection = col;
    }
  }

  return {
    totalSalesCount: sold.length,
    totalsByCurrency: Array.from(perCurrency.entries())
      .filter(([c]) => !!c)
      .map(([currency, total]) => ({ currency, total })),
    uniqueBuyers: buyers.size,
    topCollection,
  };
}

export function getUserProfile(address?: string) {
  if (!address) return null;
  return userProfileStore.get(address.toLowerCase());
}
