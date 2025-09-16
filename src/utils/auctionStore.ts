
// Local auctions store backed by localStorage with change notifications

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
};

export const STORAGE_KEY = "auction_items_v1";
export const CHANGE_EVENT = "auction:items-changed";

function load(): AuctionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

export const auctionStore = {
  all(): AuctionItem[] {
    return load();
  },

  add(item: AuctionItem) {
    const all = load();
    all.unshift(item); // newest first
    save(all);
    notifyChange();
  },

  remove(id: string) {
    // guard: do nothing if id is falsy
    if (!id) return;
    const all = load().filter((a) => a.id !== id); // remove just that id
    save(all);
    notifyChange();
  },

  close(id: string) {
    const all = load();
    const i = all.findIndex((a) => a.id === id);
    if (i >= 0) {
      all[i] = { ...all[i], closed: true };
      save(all);
      notifyChange();
    }
  },

  clear() {
    save([]);
    notifyChange();
  },
};
