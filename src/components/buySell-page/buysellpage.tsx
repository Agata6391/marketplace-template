// src/components/buySell-page/buysellpage.tsx
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
  Tooltip,
  Button, // 👈 NEW
} from "@chakra-ui/react";
import { client } from "@/consts/client";
import type { Chain } from "thirdweb";
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
  useReadContract,
  TransactionButton,
} from "thirdweb/react";
import {
  getContract,
  getNFT,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { getOwnedTokenIds, isApprovedForAll } from "thirdweb/extensions/erc721";
import { hederaMainnet } from "@/consts/chains";

// Optional: local listing button (keeps neutral wording)
import CreateListingLocal from "@/components/buySell-page/CreateListingLocal";
// Optional: auctions module
import CreateAuction from "@/components/auctions/CreateAuction";

type Props = {
  address?: string; // may be empty/invalid; component will fall back to a neutral view
  chain?: Chain;    // may be undefined -> fallback to hederaMainnet
};

type NftItem = { id: string; title: string; image: string };

// --- Helpers ---
function ipfsToHttp(uri?: string) {
  if (!uri) return "";
  return uri.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri;
}
function isValidAddress(addr?: string) {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}
// ventana de páginas (máx n botones visibles)
function getPageWindow(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let finish = start + max - 1;
  if (finish > total) { finish = total; start = total - max + 1; }
  return Array.from({ length: finish - start + 1 }, (_, i) => start + i);
}

// Neutral local items used when no contract address is configured or invalid
const DEFAULT_ITEMS: NftItem[] = [
  { id: "1", title: "Sword #1", image: "/images/dummynfts/default-nft.png" },
  { id: "2", title: "Shield #2", image: "/images/dummynfts/default-nft0.png" },
  { id: "3", title: "Helmet #3", image: "/images/dummynfts/default-nft1.png" },
  { id: "5", title: "Helmet #5", image: "/images/dummynfts/default-nft.png" },
  { id: "6", title: "Helmet #6", image: "/images/dummynfts/default-nft.png" },
  { id: "7", title: "Helmet #7", image: "/images/dummynfts/default-nft.png" },
  { id: "8", title: "Sword #2", image: "/images/dummynfts/default-nft1.png" },
  { id: "9", title: "Helmet #9", image: "/images/dummynfts/default-nft.png" },
  { id: "10", title: "Helmet #10", image: "/images/dummynfts/default-nft.png" },
  { id: "11", title: "Helmet #11", image: "/images/dummynfts/default-nft.png" },
  { id: "12", title: "Helmet #12", image: "/images/dummynfts/default-nft.png" },
];

// MarketplaceV3 address (replace with a real one when ready)
const MARKETPLACE_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Tamaño por página de “My NFTs”
const PAGE_SIZE = 5; // 👈 ajust #nft show

export default function BuySellPage({ address, chain }: Props) {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  // Always have a valid Chain (fallback to Hedera Mainnet)
  const effectiveChain: Chain = chain ?? hederaMainnet;

  // Neutral flag for fallback behavior (no address or invalid address)
  const useLocalFallback = !isValidAddress(address);

  // Only build a real contract if we have a valid address
  const realContract = useMemo(
    () =>
      useLocalFallback
        ? null
        : getContract({ client, chain: effectiveChain, address: address! }),
    [useLocalFallback, effectiveChain, address]
  );

  // Always provide a non-null contract to the hook (dummy + enabled: false)
  const dummyContract = useMemo(
    () =>
      getContract({
        client,
        chain: effectiveChain,
        address: "0x0000000000000000000000000000000000000001",
      }),
    [effectiveChain]
  );

  const { data: ownedIds, isLoading, error } = useReadContract(getOwnedTokenIds, {
    contract: useLocalFallback ? dummyContract : (realContract as any),
    owner: account?.address,
    queryOptions: { enabled: !useLocalFallback && !!realContract && !!account?.address },
  });

  // Approval state (only meaningful when working with a real contract)
  const {
    data: isApproved,
    refetch: refetchApproval,
    isLoading: isLoadingApproval,
  } = useReadContract(isApprovedForAll, {
    contract: (useLocalFallback ? dummyContract : (realContract as any)),
    owner: account?.address,
    operator: MARKETPLACE_ADDRESS,
    queryOptions: {
      enabled:
        !useLocalFallback &&
        !!realContract &&
        !!account?.address &&
        /^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS),
    },
  });

  const [items, setItems] = useState<NftItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NftItem | null>(null);
  const [status, setStatus] = useState("");

  // --- PAG---
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = items.slice(start, end);

  // A página válida
  useEffect(() => {
    if (page > totalPages) setPage(1);
    // 
    if (selectedNFT && !pageItems.find((i) => i.id === selectedNFT.id)) {
      setSelectedNFT(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, page, totalPages]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (useLocalFallback) {
        setItems(DEFAULT_ITEMS);
        setStatus("");
        return;
      }
      if (!ownedIds || !ownedIds.length || !realContract) {
        setItems([]);
        return;
      }
      const details = await Promise.all(
        ownedIds.map(async (id) => {
          const nft = await getNFT({ contract: realContract, tokenId: id });
          const title = nft.metadata?.name || `NFT #${id}`;
          const image =
            ipfsToHttp(nft.metadata?.image || nft.metadata?.image_url) ||
            "/images/dummynfts/default-nft.png";
          return { id: id.toString(), title, image };
        })
      );
      if (!ignore) setItems(details);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [useLocalFallback, ownedIds, realContract]);

  async function ensureChain() {
    if (useLocalFallback) return;
    try {
      if (activeChain?.id !== effectiveChain.id) {
        await switchChain(effectiveChain);
      }
    } catch (e: any) {
      setStatus(`Network switch failed: ${e?.message || e}`);
    }
  }

  async function handleSend() {
    if (useLocalFallback) {
      setStatus("Sending is not available in this view.");
      return;
    }
    if (!account || !selectedNFT || !realContract) return;
    try {
      await ensureChain();
      const to = prompt("Destination address:");
      if (!to) return;

      setStatus(`Sending ${selectedNFT.title || `#${selectedNFT.id}`}...`);

      const tx = prepareContractCall({
        contract: realContract,
        method: "safeTransferFrom",
        params: [account.address, to, BigInt(selectedNFT.id)],
      });

      await sendAndConfirmTransaction({ account, transaction: tx });
      setStatus("NFT sent.");
      window.alert("NFT sent successfully.");
      setSelectedNFT(null);
    } catch (e: any) {
      setStatus(`Send failed: ${e?.message || e}`);
    }
  }

  return (
    <Card border="1px" maxW="90vw" mx="auto" mt="40px">
      <CardHeader>
        <Heading size="md">Buy & Sell — {effectiveChain.name}</Heading>
        <Text fontSize="xs" color="gray.500">
          {address || "No contract address configured"}
        </Text>
      </CardHeader>

      <CardBody>
        <Box mb="4">
          <Text>Your wallet NFTs for this collection:</Text>
          {!account?.address ? (
            <Text fontSize="sm" mt="2">
              Connect a wallet using the header button.
            </Text>
          ) : (
            <Text fontSize="sm" mt="2">
              Connected: {account.address}
            </Text>
          )}
        </Box>

        {!useLocalFallback && isLoading && <Text>Loading NFTs...</Text>}
        {!useLocalFallback && error && (
          <Text color="red.500">Error: {String(error)}</Text>
        )}

        {/* GRID (usa pageItems) */}
        <Flex gap="4" wrap="wrap">
          {pageItems.map((nft) => (
            <Box
              key={nft.id}
              border="1px"
              p="2"
              rounded="md"
              cursor="pointer"
              bg={selectedNFT?.id === nft.id ? "blue.50" : "white"}
              onClick={() => setSelectedNFT(nft)}
            >
              <Image
                src={nft.image}
                alt={nft.title}
                boxSize="96px"
                objectFit="cover"
              />
              <Text mt="2" noOfLines={1}>
                {nft.title}
              </Text>
            </Box>
          ))}
        </Flex>

        {/* PAG*/}
        {totalPages > 1 && (
          <Flex mt="16px" align="center" justify="center" gap="2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelectedNFT(null); }}
              isDisabled={page === 1}
            >
              &lt; PREVIOUS
            </Button>

            {getPageWindow(page, totalPages, 5).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === page ? "solid" : "ghost"}
                onClick={() => { setPage(p); setSelectedNFT(null); }}
              >
                {p}
              </Button>
            ))}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelectedNFT(null); }}
              isDisabled={page === totalPages}
            >
              NEXT &gt;
            </Button>
          </Flex>
        )}

        {/* ACTIONS */}
        {selectedNFT && (
          <Box mt="6">
            <Text>Action:</Text>

            {/* Approval (only when working with a real contract) */}
            {!useLocalFallback && (
              <Box mt="2">
                {!/^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS) ? (
                  <Text color="orange.500" fontSize="sm">
                    Marketplace address not configured.
                  </Text>
                ) : isLoadingApproval ? (
                  <Text fontSize="sm">Checking approval…</Text>
                ) : isApproved ? (
                  <Text fontSize="sm" color="green.500">
                    Marketplace approved for this collection.
                  </Text>
                ) : (
                  <TransactionButton
                    transaction={async () => {
                      await ensureChain(); // ensure correct network
                      return prepareContractCall({
                        contract: realContract!, // safe because not in fallback & exists
                        method: "setApprovalForAll",
                        params: [MARKETPLACE_ADDRESS, true],
                      });
                    }}
                    onTransactionConfirmed={() => {
                      refetchApproval();
                    }}
                    style={{ marginTop: 8 }}
                  >
                    Approve Marketplace
                  </TransactionButton>
                )}
              </Box>
            )}

            {/* Send (disabled in fallback) */}
            <Flex gap="4" mt="4">
              <Tooltip label={useLocalFallback ? "" : undefined}>
                <Box
                  as="button"
                  px="4"
                  py="2"
                  bg={useLocalFallback ? "gray.400" : "red.400"}
                  _hover={{ bg: useLocalFallback ? "gray.400" : "red.500" }}
                  cursor={useLocalFallback ? "not-allowed" : "pointer"}
                  color="white"
                  rounded="md"
                  onClick={handleSend}
                >
                  Send
                </Box>
              </Tooltip>
            </Flex>

            {/* Create listing (local) */}
            {account?.address && (
              <Box mt="4">
                <Text mb="2" fontWeight="semibold">Create listing</Text>
                <CreateListingLocal
                  seller={account.address}
                  collection={address || "0x000000000000000000000000000000000000dEaD"}
                  tokenId={selectedNFT.id}
                  name={selectedNFT.title}
                  image={selectedNFT.image}
                  onListed={() => setStatus("Listing created.")}
                />
              </Box>
            )}

            {/* Create auction (local) */}
            {account?.address && (
              <Box mt="4">
                <Text mb="2" fontWeight="semibold">Create auction</Text>
                <CreateAuction
                  seller={account.address}
                  collection={address || "0x000000000000000000000000000000000000dEaD"}
                  tokenId={selectedNFT.id}
                  name={selectedNFT.title}
                  image={selectedNFT.image}
                  onCreated={() => setStatus("Auction created.")}
                />
              </Box>
            )}
          </Box>
        )}

        {status && <Text mt="4">{status}</Text>}
      </CardBody>
    </Card>
  );
}
