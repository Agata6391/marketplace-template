// src/components/auctions/AuctionsBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody, Heading, Text, Flex, Box, Image, Button, Tooltip, ButtonGroup,
} from "@chakra-ui/react";
import { useActiveAccount } from "thirdweb/react";
import {
  auctionStore, type AuctionItem,
  CHANGE_EVENT as AUCTION_EVENT,
  STORAGE_KEY as AUCTION_KEY,
} from "@/utils/auctionStore";
import NftAttributesModal from "@/components/nft/NftAttributesModal";

// Pagination config
const PAGE_SIZE = 5;                 // how many auctions per page
const MAX_PAGE_BUTTONS = 5;          // how many page buttons to display

type Filter = "open" | "closed";

// Helpers
function getPageWindow(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let finish = start + max - 1;
  if (finish > total) { finish = total; start = total - max + 1; }
  return Array.from({ length: finish - start + 1 }, (_, i) => start + i);
}
function isClosed(a: AuctionItem) {
  // treat as closed if explicit flag set OR time elapsed
  return !!a.closed || Date.now() >= a.endTime;
}
function fmtPrice(p?: string | number, c?: string) {
  if (p === undefined || p === null || p === "") return "—";
  const n = Number(p);
  return `${Number.isFinite(n) ? n : p} ${c || ""}`.trim();
}
function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";
}

export default function AuctionsBoard() {
  const account = useActiveAccount();

  const [all, setAll] = useState<AuctionItem[]>([]);
  const [filter, setFilter] = useState<Filter>("open");
  const [page, setPage] = useState(1);

  // State for the attributes modal (hooks MUST be inside the component)
  const [attrOpen, setAttrOpen] = useState(false);
  const [attrItem, setAttrItem] = useState<AuctionItem | null>(null);

  // Load/listen store
  useEffect(() => {
    const refresh = () => setAll(auctionStore.all());
    refresh();

    const bump = () => refresh();
    window.addEventListener(AUCTION_EVENT, bump);
    const onStorage = (e: StorageEvent) => { if (e.key === AUCTION_KEY) refresh(); };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(AUCTION_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Apply filter and sort by endTime ascending (soonest first)
  const filtered = useMemo(() => {
    const fx = filter === "open"
      ? (a: AuctionItem) => !isClosed(a)
      : (a: AuctionItem) => isClosed(a);
    return [...all].filter(fx).sort((a, b) => (a.endTime || 0) - (b.endTime || 0));
  }, [all, filter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filtered.slice(start, end);

  useEffect(() => {
    // keep page consistent when filter/data changes
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // Actions
  const onBid = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to place a bid.");
      return;
    }
    window.alert("Bid placed (local demo).");
  };

  const onClose = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to close an auction.");
      return;
    }
    auctionStore.close(id);                 // mutate: mark closed
    setAll(auctionStore.all());            // immediate refresh
    window.alert("Auction closed.");
  };

  const onRemove = (id: string) => {
    if (!account?.address) {
      window.alert("Connect a wallet to remove an auction.");
      return;
    }
    auctionStore.remove(id);               // mutate: remove just that id
    setAll(auctionStore.all());            // immediate refresh
    window.alert("Auction removed.");
  };

  const isOwner = (seller?: string) =>
    !!seller && !!account?.address &&
    seller.toLowerCase() === account.address.toLowerCase();

  return (
    <>
      <Card border="1px">
        <CardHeader>
          <Flex align="center" justify="space-between">
            <Heading size="md">Auctions</Heading>
            {/* Simple filter buttons */}
            <ButtonGroup size="sm" isAttached>
              <Button
                variant={filter === "open" ? "solid" : "outline"}
                onClick={() => { setFilter("open"); setPage(1); }}
              >
                Open
              </Button>
              <Button
                variant={filter === "closed" ? "solid" : "outline"}
                onClick={() => { setFilter("closed"); setPage(1); }}
              >
                Closed
              </Button>
            </ButtonGroup>
          </Flex>
        </CardHeader>

        <CardBody>
          {filtered.length === 0 ? (
            <Text>No auctions.</Text>
          ) : (
            <>
              {/* Grid */}
              <Flex gap="4" wrap="wrap">
                {pageItems.map((a) => {
                  const closed = isClosed(a);
                  return (
                    <Box key={a.id} border="1px" p="3" rounded="md" w="260px" opacity={closed ? 0.7 : 1}>
                      <Image
                        src={a.image || "/images/dummynfts/default-nft.png"}
                        alt={a.name || `#${a.tokenId}`}
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        rounded="md"
                      />

                      <Box mt="2">
                        <Text fontWeight="bold" noOfLines={1}>
                          {a.name || `Token #${a.tokenId}`}
                        </Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>
                          {short(a.collection)}
                        </Text>

                        <Flex mt="1" justify="space-between" fontSize="sm">
                          <Text>Start</Text>
                          <Text>{fmtPrice(a.startPrice, a.currency)}</Text>
                        </Flex>

                        <Flex mt="1" justify="space-between" fontSize="xs" color="gray.600">
                          <Text>Ends</Text>
                          <Text>{new Date(a.endTime).toLocaleString()}</Text>
                        </Flex>

                        <Text mt="1" fontSize="xs" color={closed ? "red.500" : "green.500"}>
                          {closed ? "Closed" : "Open"}
                        </Text>

                        {/* Attributes button */}
                        <Flex mt="2" justify="flex-end">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttrItem(a);
                              setAttrOpen(true);
                            }}
                          >
                            Attributes
                          </Button>
                        </Flex>
                      </Box>

                      {/* Actions */}
                      <Flex mt="3" gap="2">
                        {isOwner(a.seller) ? (
                          <>
                            <Tooltip label={!account?.address ? "Connect a wallet." : ""}>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => onRemove(a.id)}
                                isDisabled={!account?.address}
                                w="full"
                              >
                                Remove
                              </Button>
                            </Tooltip>
                            <Tooltip label={!account?.address ? "Connect a wallet." : ""}>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="orange"
                                onClick={() => onClose(a.id)}
                                isDisabled={!account?.address || closed}
                                w="full"
                              >
                                Close
                              </Button>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip label={!account?.address ? "Connect a wallet." : ""}>
                            <Button
                              size="sm"
                              colorScheme="purple"
                              onClick={() => onBid(a.id)}
                              isDisabled={!account?.address || closed}
                              w="full"
                            >
                              Bid
                            </Button>
                          </Tooltip>
                        )}
                      </Flex>

                      <Text mt="2" fontSize="xs" color="gray.500">
                        Seller: {short(a.seller)}
                      </Text>
                    </Box>
                  );
                })}
              </Flex>

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex mt="16px" align="center" justify="center" gap="2">
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

      {/* Attributes modal */}
      <NftAttributesModal
        isOpen={attrOpen}
        onClose={() => setAttrOpen(false)}
        name={attrItem?.name}
        image={attrItem?.image}
        tokenId={attrItem?.tokenId}
        collection={attrItem?.collection}
        // If your AuctionItem does not have attributes in store,
        // the modal will attempt to resolve them from tokenURI.
        attributes={(attrItem as any)?.attributes}
      />
    </>
  );
}
