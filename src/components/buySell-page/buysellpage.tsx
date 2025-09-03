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
} from "@chakra-ui/react";
import { client } from "@/consts/client";
import type { Chain } from "thirdweb";
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
  useReadContract,
} from "thirdweb/react";
import {
  getContract,
  getNFT,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { getOwnedTokenIds } from "thirdweb/extensions/erc721";
import { hederaMainnet } from "@/consts/chains";
import { isApprovedForAll } from "thirdweb/extensions/erc721";
import { TransactionButton } from "thirdweb/react";

type Props = {
  address?: string; // may be invalid/empty -> demo mode
  chain?: Chain; // may be undefined -> fallback to hederaMainnet
};

type NftItem = { id: string; title: string; image: string };

function ipfsToHttp(uri?: string) {
  if (!uri) return "";
  return uri.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri;
}

function isValidAddress(addr?: string) {
  return !!addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

const DEMO_ITEMS: NftItem[] = [
  { id: "1", title: "Demo Sword #1", image: "/images/default-nft.png" },
  { id: "2", title: "Demo Shield #2", image: "/images/default-nft.png" },
  { id: "3", title: "Demo Helmet #3", image: "/images/default-nft.png" },
];
// ✅ MarketplaceV3 contract address (replace with your real one when ready)
const MARKETPLACE_ADDRESS = "0x000000000000000000000000000000000000dEaD"; // valid dummy for now

export default function BuySellPage({ address, chain }: Props) {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  // ✅ Always have a valid Chain (fallback to Hedera Mainnet)
  const effectiveChain: Chain = chain ?? hederaMainnet;

  const isDemo = !isValidAddress(address);

  // Only build a real contract if we have a valid address
  const realContract = useMemo(
    () =>
      isDemo
        ? null
        : getContract({ client, chain: effectiveChain, address: address! }),
    [isDemo, effectiveChain, address]
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

  const {
    data: ownedIds,
    isLoading,
    error,
  } = useReadContract(getOwnedTokenIds, {
    contract: isDemo ? dummyContract : (realContract as any),
    owner: account?.address,
    queryOptions: { enabled: !isDemo && !!realContract && !!account?.address },
  });
  const {
  data: isApproved,
  refetch: refetchApproval,
  isLoading: isLoadingApproval,
} = useReadContract(isApprovedForAll, {
  contract: (isDemo ? dummyContract : (realContract as any)),
  owner: account?.address,
  operator: MARKETPLACE_ADDRESS,
  queryOptions: {
    enabled:
      !isDemo &&
      !!realContract &&
      !!account?.address &&
      /^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS),
  },
});

  const [items, setItems] = useState<NftItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NftItem | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (isDemo) {
        setItems(DEMO_ITEMS);
        setStatus("Demo mode: using mock NFTs (no blockchain).");
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
            "/images/default-nft.png";
          return { id: id.toString(), title, image };
        })
      );
      if (!ignore) setItems(details);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [isDemo, ownedIds, realContract]);

  async function ensureChain() {
    if (isDemo) return;
    try {
      if (activeChain?.id !== effectiveChain.id) {
        await switchChain(effectiveChain);
      }
    } catch (e: any) {
      setStatus(`Chain switch failed: ${e?.message || e}`);
    }
  }

  async function handleSend() {
    if (isDemo) {
      setStatus("Demo mode: sending is disabled.");
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
      setSelectedNFT(null);
    } catch (e: any) {
      setStatus(`Send failed: ${e?.message || e}`);
    }
  }

  return (
    <Card border="1px" maxW="90vw" mx="auto" mt="40px">
      <CardHeader>
        <Heading size="md">
          Buy & Sell — {effectiveChain.name}
          {isDemo && (
            <Text as="span" color="orange.500">
              {" "}
              (Demo)
            </Text>
          )}
        </Heading>
        <Text fontSize="xs" color="gray.500">
          {address || "No contract address (demo mode)"}
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

        {!isDemo && isLoading && <Text>Loading NFTs...</Text>}
        {!isDemo && error && (
          <Text color="red.500">Error: {String(error)}</Text>
        )}

        <Flex gap="4" wrap="wrap">
          {items.map((nft) => (
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

       {selectedNFT && (
  <Box mt="6">
    <Text>Action:</Text>

    {/* --- APPROVAL SECTION --- */}
    {!isDemo && (
      <Box mt="2">
        {!/^0x[a-fA-F0-9]{40}$/.test(MARKETPLACE_ADDRESS) ? (
          <Text color="orange.500" fontSize="sm">
            Marketplace address not configured (approval disabled).
          </Text>
        ) : isLoadingApproval ? (
          <Text fontSize="sm">Checking approval…</Text>
        ) : isApproved ? (
          <Text fontSize="sm" color="green.500">
            Marketplace already approved for this collection.
          </Text>
        ) : (
          <TransactionButton
            transaction={async () => {
              await ensureChain(); // make sure wallet is on the right chain
              return prepareContractCall({
                contract: realContract!, // safe because not demo & realContract exists
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

    {/* --- SEND SECTION (demo-safe) --- */}
    <Flex gap="4" mt="4">
      <Tooltip label={isDemo ? "Demo mode: sending disabled" : ""}>
        <Box
          as="button"
          px="4"
          py="2"
          bg={isDemo ? "gray.400" : "red.400"}
          _hover={{ bg: isDemo ? "gray.400" : "red.500" }}
          cursor={isDemo ? "not-allowed" : "pointer"}
          color="white"
          rounded="md"
          onClick={handleSend}
        >
          Send
        </Box>
      </Tooltip>
    </Flex>
  </Box>
)}

        {status && <Text mt="4">{status}</Text>}
      </CardBody>
    </Card>
  );
}
