// src/components/buySell-page/MarketBoard.tsx
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
import {
  marketStore,
  type ListingItem,
  CHANGE_EVENT as LISTING_EVENT,
  STORAGE_KEY as LISTING_KEY,
} from "@/utils/marketStore";
import NftAttributesModal from "@/components/nft/NftAttributesModal";

// --- Config ---
const PAGE_SIZE = 5;                 // how many listings per page
const MAX_PAGE_BUTTONS = 5;          // how many numbered buttons to show
const REMOVE_MODE: "alert" | "mutate" = "mutate"; // "alert" -> only alerts; "mutate" -> updates store

// --- Helpers ---
function getPageWindow(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let finish = start + max - 1;
  if (finish > total) {
    finish = total;
    start = total - max + 1;
  }
  return Array.from({ length: finish - start + 1 }, (_, i) => start + i);
}
function fmtPrice(price?: string | number, currency?: string) {
  if (price === undefined || price === null || price === "") return "—";
  const p = Number(price);
  return `${Number.isFinite(p) ? p : price} ${currency || ""}`.trim();
}

export default function MarketBoard() {
  const account = useActiveAccount();

  // Attributes modal state
  const [attrOpen, setAttrOpen] = useState(false);
  const [attrItem, setAttrItem] = useState<ListingItem | null>(null);

  const [all, setAll] = useState<ListingItem[]>([]);
  const [page, setPage] = useState(1);

  // Load and subscribe to store changes
  useEffect(() => {
    const refresh = () => setAll(marketStore.all());
    refresh();

    const bump = () => refresh();
    window.addEventListener(LISTING_EVENT, bump);
    const onStorage = (e: StorageEvent) => {
      if (e.key === LISTING_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(LISTING_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Sort newest first
  const listings = useMemo(
    () => [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [all]
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = listings.slice(start, end);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // Actions
  const onBuy = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to buy.");
      return;
    }
    if (REMOVE_MODE === "mutate") {
      // Option A: if your store implements markSold
      // marketStore.markSold?.(id, account.address);
      // Option B: remove item from store
      marketStore.remove(id);
      setAll(marketStore.all());
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
      setAll(marketStore.all());
    }
    window.alert("Listing removed.");
  };

  const isOwner = (seller?: string) =>
    !!seller &&
    !!account?.address &&
    seller.toLowerCase() === account.address.toLowerCase();

  return (
    <>
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
                  <Box
                    key={l.id}
                    className="udb-market-card"
                    border="1px"
                    p="3"
                    rounded="md"
                    w="260px"
                  >
                    <Image
                      src={l.image || "/images/dummynfts/default-nft.png"}
                      alt={l.name || `#${l.tokenId}`}
                      w="100%"
                      h="200px"
                      objectFit="cover"
                      rounded="md"
                    />

                    <Box mt="2">
                      <Text fontWeight="bold" noOfLines={1}>
                        {l.name || `Token #${l.tokenId}`}
                      </Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {l.collection
                          ? `${l.collection.slice(0, 6)}…${l.collection.slice(-4)}`
                          : "—"}
                      </Text>
                      <Text className="udb-market-card__price" mt="1">
                        {fmtPrice(l.price, l.currency)}
                      </Text>

                      {/* Attributes button */}
                      <Flex mt="2" justify="flex-end">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setAttrItem(l as any); // supports optional attributes if you add them later
                            setAttrOpen(true);
                          }}
                        >
                          Attributes
                        </Button>
                      </Flex>
                    </Box>

                    {/* Actions */}
                    <Flex mt="3" gap="2">
                      {isOwner(l.seller) ? (
                        // OWNER: show Remove (handle Tooltip correctly)
                        !account?.address ? (
                          // Disabled button without Tooltip (Tooltip + disabled breaks)
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            isDisabled
                            className="udb-btn udb-btn--remove"
                            w="full"
                          >
                            Remove
                          </Button>
                        ) : (
                          // Tooltip must have exactly ONE child; wrap Button in a span
                          <Tooltip label="Remove">
                            <span>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => onRemove(l.id)}
                                className="udb-btn udb-btn--remove"
                                w="full"
                              >
                                Remove
                              </Button>
                            </span>
                          </Tooltip>
                        )
                      ) : (
                        // NOT OWNER: show Buy (same Tooltip rule)
                        !account?.address ? (
                          <Button
                            size="sm"
                            colorScheme="purple"
                            isDisabled
                            className="udb-btn udb-btn--buy"
                            w="full"
                          >
                            Buy
                          </Button>
                        ) : (
                          <Tooltip label="Buy">
                            <span>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                onClick={() => onBuy(l.id)}
                                className="udb-btn udb-btn--buy"
                                w="full"
                              >
                                Buy
                              </Button>
                            </span>
                          </Tooltip>
                        )
                      )}
                    </Flex>

                    {/* Meta seller */}
                    <Text mt="2" fontSize="xs" color="gray.500">
                      Seller:{" "}
                      {l.seller
                        ? `${l.seller.slice(0, 6)}…${l.seller.slice(-4)}`
                        : "—"}
                    </Text>
                  </Box>
                ))}
              </Flex>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <Flex
                  mt="16px"
                  align="center"
                  justify="center"
                  gap="2"
                  className="udb-pagination"
                >
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

      {/* Attributes Modal */}
      <NftAttributesModal
        isOpen={attrOpen}
        onClose={() => setAttrOpen(false)}
        name={(attrItem as any)?.name}
        image={(attrItem as any)?.image}
        tokenId={(attrItem as any)?.tokenId}
        collection={(attrItem as any)?.collection}
        attributes={(attrItem as any)?.attributes}
      />
    </>
  );
}
