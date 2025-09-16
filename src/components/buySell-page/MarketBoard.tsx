"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Flex,
  Box,
  Image,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { useActiveAccount } from "thirdweb/react";
import { marketStore, type ListingItem, CHANGE_EVENT as LISTING_EVENT, STORAGE_KEY as LISTING_KEY } from "@/utils/marketStore";

// --- Config ---
const PAGE_SIZE = 5;                 // 
const MAX_PAGE_BUTTONS =5;           // how many page buttons to display

const REMOVE_MODE: "alert" | "mutate" = "mutate"; // was "alert"
// "alert": just alert the user that the item would be removed (no change to store)
// "mutate": actually remove the item from the store (if you want that behavior)


// --- Helpers ---
function getPageWindow(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let finish = start + max - 1;
  if (finish > total) { finish = total; start = total - max + 1; }
  return Array.from({ length: finish - start + 1 }, (_, i) => start + i);
}
function fmtPrice(price?: string | number, currency?: string) {
  if (price === undefined || price === null || price === "") return "—";
  const p = Number(price);
  return `${Number.isFinite(p) ? p : price} ${currency || ""}`.trim();
}

export default function MarketBoard() {
  const account = useActiveAccount();

  const [all, setAll] = useState<ListingItem[]>([]);
  const [page, setPage] = useState(1);

  // load/update store
  useEffect(() => {
    const refresh = () => setAll(marketStore.all()); // use the store's 'all()' method
    refresh();

    const bump = () => refresh();
    window.addEventListener(LISTING_EVENT, bump);
    const onStorage = (e: StorageEvent) => { if (e.key === LISTING_KEY) refresh(); };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(LISTING_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // most recients first
  const listings = useMemo(
    () => [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [all]
  );

  // pagination
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = listings.slice(start, end);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // acciones
  const onBuy = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to buy.");
      return;
    }
    if (REMOVE_MODE === "mutate") {
      marketStore.markSold?.(id, account.address); // si tu store expone markSold
      // o: marketStore.remove(id);
    }
    window.alert("Purchase completed.");
  };

  const onRemove = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to remove a listing.");
      return;
    }
    if (REMOVE_MODE === "mutate") {
      marketStore.remove(id);
    }
    window.alert("Listing removed.");
  };

  const isOwner = (seller?: string) =>
    !!seller &&
    !!account?.address &&
    seller.toLowerCase() === account.address.toLowerCase();

  return (
    <Card className="udb-market" border="1px">
      <CardHeader>
        <Heading size="md">Marketplace</Heading>
      </CardHeader>

      <CardBody>
        {listings.length === 0 ? (
          <Text>No listings yet.</Text>
        ) : (
          <>
            {/* GRID */}
            <Flex className="udb-market__grid" gap="4" wrap="wrap">
              {pageItems.map((l) => (
                <Box key={l.id} className="udb-market-card" border="1px" p="3" rounded="md" w="260px">
                  <Image
                    src={l.image || "/images/dummynts/default-nft.png"}
                    alt={l.name || `#${l.tokenId}`}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                    rounded="md"
                  />
                  <Box mt="2">
                    <Text fontWeight="bold" noOfLines={1}>{l.name || `Token #${l.tokenId}`}</Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {l.collection ? `${l.collection.slice(0, 6)}…${l.collection.slice(-4)}` : "—"}
                    </Text>
                    <Text className="udb-market-card__price" mt="1">
                      {fmtPrice(l.price, l.currency)}
                    </Text>
                  </Box>

                  <Flex mt="3" gap="2">
                    {isOwner(l.seller) ? (
                      <Tooltip label={!account?.address ? "Connect a wallet to remove." : ""}>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => onRemove(l.id)}
                          isDisabled={!account?.address}
                          className="udb-btn udb-btn--remove"
                          w="full"
                        >
                          Remove
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip label={!account?.address ? "Connect a wallet to buy." : ""}>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          onClick={() => onBuy(l.id)}
                          isDisabled={!account?.address}
                          className="udb-btn udb-btn--buy"
                          w="full"
                        >
                          Buy
                        </Button>
                      </Tooltip>
                    )}
                  </Flex>

                  {/* Meta seller */}
                  <Text mt="2" fontSize="xs" color="gray.500">
                    Seller: {l.seller ? `${l.seller.slice(0, 6)}…${l.seller.slice(-4)}` : "—"}
                  </Text>
                </Box>
              ))}
            </Flex>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <Flex mt="16px" align="center" justify="center" gap="2" className="udb-pagination">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={page === 1}
                >
                  &lt; PREVIOUS
                </Button>

                {getPageWindow(page, totalPages, MAX_PAGE_BUTTONS).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "solid" : "ghost"}
                    onClick={() => setPage(p)}
                    className={p === page ? "udb-pagination__page--active" : undefined}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={page === totalPages}
                >
                  NEXT &gt;
                </Button>
              </Flex>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
