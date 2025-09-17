
// Local auctions store backed by localStorage with change notifications

// --- Types ---
export type Trait = { trait_type?: string; value?: any; display_type?: string }; // attributes support

export type Bid = {
  bidder: string;     // wallet address
  amount: string;     // "1.25", etc.
  currency: string;   // "HBAR", "ETH", etc.
  time: number;       // timestamp (ms)
};

export type AuctionItem = {
  id: string;           // unique id
  collection: string;   // ERC-721 address
  tokenId: string;      // token id
  seller: string;       // owner address
  name: string;         // display name
  image: string;        // image url
  startPrice: string;   // e.g. "0.1"
  currency: string;     // e.g. "HBAR"
  endTime: number;      // timestamp (ms)
  createdAt: number;    // timestamp (ms)
  closed?: boolean;     // closed flag

  // Optional fields (won't break existing UIs):
  attributes?: Trait[]; // for attributes modal
  bids?: Bid[];         // optional: to show who bid
};

// --- Constants ---
export const STORAGE_KEY = "auction_items_v1";
export const CHANGE_EVENT = "auction:items-changed";

// --- Storage helpers ---
function load(): AuctionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as AuctionItem[] : [];
  } catch {
    return [];
  }
}

function save(data: AuctionItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

// --- Store API ---
export const auctionStore = {
  all(): AuctionItem[] {
    return load();
  },

  get(id: string): AuctionItem | undefined {
    return load().find(a => a.id === id);
  },

  add(item: AuctionItem) {
    const all = load();
    all.unshift(item); // newest first
    save(all);
    notifyChange();
  },

  // remove only the specific id (no clear-all)
  remove(id: string) {
    if (!id) return;
    const all = load().filter(a => a.id !== id);
    save(all);
    notifyChange();
  },

  close(id: string) {
    const all = load();
    const i = all.findIndex(a => a.id === id);
    if (i >= 0) {
      all[i] = { ...all[i], closed: true };
      save(all);
      notifyChange();
    }
  },

  // generic patch helper (optional, useful for small updates)
  update(id: string, patch: Partial<AuctionItem>) {
    const all = load();
    const i = all.findIndex(a => a.id === id);
    if (i >= 0) {
      all[i] = { ...all[i], ...patch };
      save(all);
      notifyChange();
    }
  },

  // optional: append a bid entry so you can show "who bid"
  addBid(id: string, bid: Bid) {
    const all = load();
    const i = all.findIndex(a => a.id === id);
    if (i >= 0) {
      const cur = all[i];
      const bids = Array.isArray(cur.bids) ? cur.bids : [];
      all[i] = { ...cur, bids: [{ ...bid }, ...bids] }; // newest first
      save(all);
      notifyChange();
    }
  },

  clear() {
    save([]);
    notifyChange();
  },
};
// --- Utility ---