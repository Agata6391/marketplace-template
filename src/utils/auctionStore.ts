// src/utils/auctionStore.ts
// Local auctions store (localStorage) with change notifications

export type AuctionStatus = "OPEN" | "CLOSED";

export type AuctionItem = {
  id: string;
  collection: string;
  tokenId: string;
  seller: string;
  name: string;
  image: string;
  startPrice: string;      // starting price (string)
  currency: string;        // e.g. HBAR, ETH, USDC
  currentBid?: string;     // top bid price (string)
  currentBidder?: string;  // address
  endTime: number;         // unix ms
  createdAt: number;
  status: AuctionStatus;
};

export const AUCTIONS_KEY = "market_auctions_v1";
export const AUCTIONS_EVENT = "auctions:changed";

function load(): AuctionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUCTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(data: AuctionItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUCTIONS_KEY, JSON.stringify(data));
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUCTIONS_EVENT));
  }
}

function now() {
  return Date.now();
}

function autoClose(expired: AuctionItem[]) {
  if (!expired.length) return;
  const all = load();
  const map = new Map(all.map((a) => [a.id, a]));
  for (const a of expired) {
    const ref = map.get(a.id);
    if (ref && ref.status === "OPEN" && ref.endTime <= now()) {
      ref.status = "CLOSED";
    }
  }
  save(Array.from(map.values()));
}

export const auctionStore = {
  all(): AuctionItem[] {
    const list = load();
    // autoclose any expired OPEN auctions
    const expired = list.filter((a) => a.status === "OPEN" && a.endTime <= now());
    autoClose(expired);
    return load();
  },

  active(): AuctionItem[] {
    return this.all().filter((a) => a.status === "OPEN")
      .sort((a, b) => a.endTime - b.endTime);
  },

  add(auction: Omit<AuctionItem, "id" | "createdAt" | "status">) {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const item: AuctionItem = { ...auction, id, createdAt: now(), status: "OPEN" };
    const all = load();
    all.unshift(item);
    save(all);
    notify();
    return item;
  },

  bid(auctionId: string, amount: string, bidder: string) {
    const all = load();
    const idx = all.findIndex((a) => a.id === auctionId);
    if (idx < 0) throw new Error("Auction not found");
    const a = all[idx];
    if (a.status !== "OPEN") throw new Error("Auction closed");
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) throw new Error("Invalid amount");
    const min = Math.max(
      parseFloat(a.currentBid || "0"),
      parseFloat(a.startPrice || "0")
    );
    if (amt <= min) throw new Error(`Bid must be greater than ${min}`);
    a.currentBid = amount;
    a.currentBidder = bidder;
    all[idx] = a;
    save(all);
    notify();
  },

  close(auctionId: string) {
    const all = load();
    const idx = all.findIndex((a) => a.id === auctionId);
    if (idx < 0) return;
    if (all[idx].status === "CLOSED") return;
    all[idx].status = "CLOSED";
    save(all);
    notify();
  },

  clear() {
    save([]);
    notify();
  },
};
