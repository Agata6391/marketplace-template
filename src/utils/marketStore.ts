// src/utils/marketStore.ts
// Local listings store backed by localStorage with change notifications

export type ListingItem = {
  id: string;          // unique id
  collection: string;  // ERC-721 address (string)
  tokenId: string;     // token id (string)
  seller: string;      // owner address
  name: string;        // display name
  image: string;       // url
  price: string;       // "0.1", etc.
  currency: string;    // "HBAR" | "ETH" | "USDC" | ...
  createdAt: number;   // timestamp
};

// Export these so MarketBoard can reference the same names (optional but nice)
export const STORAGE_KEY = "market_listings_v1";
export const CHANGE_EVENT = "market:listings-changed";

function load(): ListingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(data: ListingItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export const marketStore = {
  all(): ListingItem[] {
    return load();
  },

  add(listing: ListingItem) {
    const all = load();
    all.unshift(listing); // newest first
    save(all);
    notifyChange();
  },

  remove(listingId: string) {
    const all = load().filter((l) => l.id !== listingId);
    save(all);
    notifyChange();
  },

  clear() {
    save([]);
    notifyChange();
  },
};
