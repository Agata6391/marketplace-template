// src/utils/userProfileStore.ts
export type ListingSnapshot = {
  id: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  price?: string;
  currency?: string;
  createdAt: number;
};

export type PurchaseRecord = ListingSnapshot & {
  purchasedAt: number;
  seller: string;
  buyer: string;
};

export type ListingRecord = ListingSnapshot & {
  status: "LISTED" | "REMOVED" | "SOLD";
  updatedAt: number;
  seller: string;
  buyer?: string;
};

export type AuctionSnapshot = {
  id: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  startPrice: string;
  currency: string;
  endTime: number;
  createdAt: number;
  status: "OPEN" | "CLOSED";
  winner?: string;
  finalBid?: string;
  seller: string;
};

export type BidRecord = {
  auctionId: string;
  amount: string;
  time: number;
  bidder: string;
  // opcional: snapshot de contexto
  name?: string;
  currency?: string;
};

export type UserProfile = {
  address: string;
  listings: ListingRecord[];   // lo que publiqué (y su estado)
  purchases: PurchaseRecord[]; // lo que compré/gané
  auctions: AuctionSnapshot[]; // mis subastas creadas (y cierre)
  bids: BidRecord[];           // mis pujas
};

const KEY = "market_user_profiles_v1";

function loadAll(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(db: Record<string, UserProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(db));
}

function get(address: string): UserProfile {
  const addr = address.toLowerCase();
  const db = loadAll();
  if (!db[addr]) {
    db[addr] = { address: addr, listings: [], purchases: [], auctions: [], bids: [] };
    saveAll(db);
  }
  return db[addr];
}

function put(profile: UserProfile) {
  const db = loadAll();
  db[profile.address.toLowerCase()] = profile;
  saveAll(db);
}

export const userProfileStore = {
  get,

  addListing(seller: string, rec: ListingRecord) {
    const p = get(seller);
    p.listings.unshift(rec);
    put(p);
  },

  markListingRemoved(seller: string, listingId: string, when: number) {
    const p = get(seller);
    const item = p.listings.find((x) => x.id === listingId);
    if (item) {
      item.status = "REMOVED";
      item.updatedAt = when;
      put(p);
    }
  },

  markListingSold(seller: string, listingId: string, buyer: string, when: number) {
    const p = get(seller);
    const item = p.listings.find((x) => x.id === listingId);
    if (item) {
      item.status = "SOLD";
      item.updatedAt = when;
      item.buyer = buyer.toLowerCase();
      put(p);
    }
  },

  addPurchase(buyer: string, rec: PurchaseRecord) {
    const p = get(buyer);
    p.purchases.unshift(rec);
    put(p);
  },

  addAuction(seller: string, a: AuctionSnapshot) {
    const p = get(seller);
    p.auctions.unshift(a);
    put(p);
  },

  closeAuction(seller: string, auctionId: string, closed: Partial<AuctionSnapshot>) {
    const p = get(seller);
    const a = p.auctions.find((x) => x.id === auctionId);
    if (a) {
      Object.assign(a, closed, { status: "CLOSED" });
      put(p);
    }
  },

  addBid(bidder: string, b: BidRecord) {
    const p = get(bidder);
    p.bids.unshift(b);
    put(p);
  },
};
