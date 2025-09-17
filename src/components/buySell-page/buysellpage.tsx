// src/components/buySell-page/buysellpage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card, CardHeader, CardBody, Heading, Text, Flex, Box, Image, Button,
} from "@chakra-ui/react";

import { client } from "@/consts/client";
import type { Chain } from "thirdweb";
import {
  useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain,
  useReadContract, TransactionButton,
} from "thirdweb/react";
import {
  getContract, getNFT, prepareContractCall, sendAndConfirmTransaction,
} from "thirdweb";
import { getOwnedTokenIds, isApprovedForAll } from "thirdweb/extensions/erc721";
import { hederaMainnet } from "@/consts/chains";

// Optional modules already used by the modals
import NftAttributesModal from "@/components/nft/NftAttributesModal";

// New modals
import SendNftModal from "@/components/modals/SendNftModal";
import ListNftModal from "@/components/modals/ListNftModal";
import AuctionNftModal from "@/components/modals/AuctionNftModal";

type Props = {
  address?: string;
  chain?: Chain;
};

type Trait = { trait_type?: string; value?: any; display_type?: string };
type NftItem = { id: string; title: string; image: string; attributes?: Trait[] };

// Helpers
function ipfsToHttp(uri?: string) {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;
}
function isValidAddress(addr?: string) {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}
function getPageWindow(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let finish = start + max - 1;
  if (finish > total) { finish = total; start = total - max + 1; }
  return Array.from({ length: finish - start + 1 }, (_, i) => start + i);
}

// Dummy items when no contract is configured
const DEFAULT_ITEMS: NftItem[] = [
  {
    id: "1",
    title: "Sword #1",
    image: "/images/dummynfts/default-nft.png",
    attributes: [
      { trait_type: "Type", value: "Sword" },
      { trait_type: "Stock", value: 244 },
    ],
  },
  {
    id: "2",
    title: "Helm #1",
    image: "/images/dummynfts/default-nft0.png",
    attributes: [
      { trait_type: "Type", value: "Helm" },
      { trait_type: "Stock", value: 244 },
    ],
  },
    {
    id: "3",
    title: "Weapon #1",
    image: "/images/dummynfts/default-nft1.png",
    attributes: [
      { trait_type: "Type", value: "Weapon" },
      { trait_type: "Stock", value: 244 },
    ],
  },
   {
    id: "4",
    title: "weapon #2",
    image: "/images/dummynfts/default-nft0.png",
    attributes: [
      { trait_type: "Type", value: "Weapon" },
      { trait_type: "Stock", value: 244 },
    ],
  },
  {
    id: "5",
    title: "Weapon #3",
    image: "/images/dummynfts/default-nft.png",
    attributes: [
      { trait_type: "Type", value: "Weapon" },
      { trait_type: "Stock", value: 244 },
    ],
  },
  {
    id: "6",
    title: "Helm #2",
    image: "/images/dummynfts/default-nft1.png",
    attributes: [
      { trait_type: "Type", value: "Helm" },
      { trait_type: "Stock", value: 244 },
    ],
  },
];

const MARKETPLACE_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const PAGE_SIZE = 5;

export default function BuySellPage({ address, chain }: Props) {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const effectiveChain: Chain = chain ?? hederaMainnet;
  const useLocalFallback = !isValidAddress(address);

  const realContract = useMemo(
    () => (useLocalFallback ? null : getContract({ client, chain: effectiveChain, address: address! })),
    [useLocalFallback, effectiveChain, address]
  );

  const dummyContract = useMemo(
    () => getContract({ client, chain: effectiveChain, address: "0x0000000000000000000000000000000000000001" }),
    [effectiveChain]
  );

  const { data: ownedIds, isLoading, error } = useReadContract(getOwnedTokenIds, {
    contract: useLocalFallback ? dummyContract : (realContract as any),
    owner: account?.address,
    queryOptions: { enabled: !useLocalFallback && !!realContract && !!account?.address },
  });

  const { data: isApproved, refetch: refetchApproval, isLoading: isLoadingApproval } = useReadContract(isApprovedForAll, {
    contract: useLocalFallback ? dummyContract : (realContract as any),
    owner: account?.address,
    operator: MARKETPLACE_ADDRESS,
    queryOptions: {
      enabled: !useLocalFallback && !!realContract && !!account?.address && /^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS),
    },
  });

  const [items, setItems] = useState<NftItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NftItem | null>(null);
  const [status, setStatus] = useState("");

  // Attributes modal
  const [attrOpen, setAttrOpen] = useState(false);
  const [attrItem, setAttrItem] = useState<NftItem | null>(null);

  // Action modals
  const [sendOpen, setSendOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [auctionOpen, setAuctionOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = items.slice(start, end);

  useEffect(() => {
    if (page > totalPages) setPage(1);
    if (selectedNFT && !pageItems.find((i) => i.id === selectedNFT.id)) {
      setSelectedNFT(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, page, totalPages]);

  // Load NFTs
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
          const image = ipfsToHttp(nft.metadata?.image || nft.metadata?.image_url) || "/images/dummynfts/default-nft.png";
          const attributes = Array.isArray(nft.metadata?.attributes) ? nft.metadata?.attributes : [];
          return { id: id.toString(), title, image, attributes };
        })
      );
      if (!ignore) setItems(details);
    }
    load();
    return () => { ignore = true; };
  }, [useLocalFallback, ownedIds, realContract]);

  // Ensure correct chain before real send
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

  // Confirm send (called from Send modal)
  async function onConfirmSend(toAddress: string) {
    if (useLocalFallback) return;
    if (!account || !selectedNFT || !realContract) return;

    try {
      await ensureChain();
      setStatus(`Sending ${selectedNFT.title || `#${selectedNFT.id}`}...`);

      const tx = prepareContractCall({
        contract: realContract,
        method: "safeTransferFrom",
        params: [account.address, toAddress, BigInt(selectedNFT.id)],
      });

      await sendAndConfirmTransaction({ account, transaction: tx });
      setStatus("NFT sent.");
      window.alert("NFT sent successfully.");
      setSelectedNFT(null);
      setSendOpen(false);
    } catch (e: any) {
      setStatus(`Send failed: ${e?.message || e}`);
    }
  }

  return (
    <Card borderWidth="1px" borderColor="chakra-border-color" bg="chakra-body-bg" maxW="90vw" mx="auto" mt="40px">
      <CardHeader>
        <Heading size="md" color="chakra-body-text">Buy & Sell — {effectiveChain.name}</Heading>
        <Text fontSize="xs" color="chakra-subtle-text">{address || "No contract address configured"}</Text>
      </CardHeader>

      <CardBody>
        <Box mb="4">
          <Text color="chakra-body-text">Your wallet NFTs for this collection:</Text>
          {!account?.address ? (
            <Text fontSize="sm" mt="2">Connect a wallet using the header button.</Text>
          ) : (
            <Text fontSize="sm" mt="2">Connected: {account.address}</Text>
          )}
        </Box>

        {!useLocalFallback && isLoading && <Text color="chakra-subtle-text">Loading NFTs...</Text>}
        {!useLocalFallback && error && <Text color="red.500">Error: {String(error)}</Text>}

        {/* GRID */}
        <Flex gap="4" wrap="wrap">
          {pageItems.map((nft) => (
            <Box
              key={nft.id}
              borderWidth="1px"
              borderColor="chakra-border-color"
              p="2"
              rounded="md"
              cursor="pointer"
              bg={selectedNFT?.id === nft.id ? "chakra-subtle-bg" : "chakra-body-bg"}
              onClick={() => setSelectedNFT(nft)}
            >
              <Image src={nft.image} alt={nft.title} boxSize="96px" objectFit="cover" />
              <Text mt="2" noOfLines={1} color="chakra-body-text">{nft.title}</Text>

              {/* Attributes button */}
              <Flex mt="2" justify="flex-end">
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAttrItem(nft);
                    setAttrOpen(true);
                  }}
                >
                  Attributes
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>

        {/* Pagination */}
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

        {/* Actions */}
        {selectedNFT && (
          <Box mt="6">
            <Text>Action:</Text>

            {/* Approval (only for real contract) */}
            {!useLocalFallback && (
              <Box mt="2">
                {!/^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS) ? (
                  <Text color="orange.500" fontSize="sm">Marketplace address not configured.</Text>
                ) : isLoadingApproval ? (
                  <Text fontSize="sm">Checking approval…</Text>
                ) : isApproved ? (
                  <Text fontSize="sm" color="green.500">Marketplace approved for this collection.</Text>
                ) : (
                  <TransactionButton
                    transaction={async () => {
                      await ensureChain();
                      return prepareContractCall({
                        contract: realContract!,
                        method: "setApprovalForAll",
                        params: [MARKETPLACE_ADDRESS, true],
                      });
                    }}
                    onTransactionConfirmed={() => { refetchApproval(); }}
                    style={{ marginTop: 8 }}
                  >
                    Approve Marketplace
                  </TransactionButton>
                )}
              </Box>
            )}

            {/* Open modals */}
            <Flex gap="3" mt="4" wrap="wrap">
              <Button colorScheme="red" onClick={() => setSendOpen(true)}>
                Send
              </Button>
              {account?.address && (
                <>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => setSellOpen(true)}
                  >
                    Sell
                  </Button>
                  <Button colorScheme="purple" onClick={() => setAuctionOpen(true)}>
                    Auction
                  </Button>
                </>
              )}
            </Flex>
          </Box>
        )}

        {status && <Text mt="4">{status}</Text>}

        {/* Attributes Modal */}
        <NftAttributesModal
          isOpen={attrOpen}
          onClose={() => setAttrOpen(false)}
          name={attrItem?.title}
          image={attrItem?.image}
          tokenId={attrItem?.id}
          collection={address}
          attributes={attrItem?.attributes}
          chain={hederaMainnet}
        />

        {/* Action Modals (open only when an NFT is selected) */}
        {selectedNFT && (
          <>
            <SendNftModal
              isOpen={sendOpen}
              onClose={() => setSendOpen(false)}
              disabled={useLocalFallback}
              from={account?.address || null}
              name={selectedNFT.title}
              image={selectedNFT.image}
              tokenId={selectedNFT.id}
              onConfirm={onConfirmSend}
            />

            {account?.address && (
              <ListNftModal
                isOpen={sellOpen}
                onClose={() => setSellOpen(false)}
                seller={account.address}
                collection={address || "0x000000000000000000000000000000000000dEaD"}
                tokenId={selectedNFT.id}
                name={selectedNFT.title}
                image={selectedNFT.image}
                onListed={() => setStatus("Listing created.")}
              />
            )}

            {account?.address && (
              <AuctionNftModal
                isOpen={auctionOpen}
                onClose={() => setAuctionOpen(false)}
                seller={account.address}
                collection={address || "0x000000000000000000000000000000000000dEaD"}
                tokenId={selectedNFT.id}
                name={selectedNFT.title}
                image={selectedNFT.image}
                onCreated={() => setStatus("Auction created.")}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
