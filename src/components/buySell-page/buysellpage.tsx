"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, Signer } from "ethers";
import {
  Card, CardHeader, CardBody, Heading, Text, Flex, Box, Image,
} from "@chakra-ui/react";

// =================== CONFIG ===================
const NFT_CONTRACT_ADDRESS = "0xREPLACE_WITH_YOUR_CONTRACT"; // <-- your ERC-721 on the active network
const NFT_CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)", // requires ERC721Enumerable
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
];

type NftItem = { id: string; title: string; image: string };

// Simple IPFS -> HTTP gateway transform
function ipfsToHttp(uri: string) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
}

async function fetchMetadata(tokenURI: string) {
  try {
    const res = await fetch(ipfsToHttp(tokenURI));
    if (!res.ok) throw new Error("Metadata fetch failed");
    const json = await res.json();
    const img = ipfsToHttp(json.image || json.image_url || "");
    const name = json.name || "";
    return { image: img || "/images/default-nft.png", title: name || "" };
  } catch {
    return { image: "/images/default-nft.png", title: "" };
  }
}

export default function BuySellPage() {
  const [walletNFTs, setWalletNFTs] = useState<NftItem[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NftItem | null>(null);
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const connectWallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setStatus("MetaMask is not installed.");
      return;
    }
    try {
      const _provider = new BrowserProvider(eth);
      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const address = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(address);
      setStatus("Connected.");
      await loadOwnedNFTs(_provider, address);
    } catch (e: any) {
      setStatus(`Failed to connect: ${e?.message || e}`);
    }
  };

  const loadOwnedNFTs = async (_provider: BrowserProvider, owner: string) => {
    setStatus("Loading NFTs...");
    setWalletNFTs([]);
    try {
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, _provider);
      const balance: bigint = await contract.balanceOf(owner);
      const total = Number(balance);

      const items: NftItem[] = [];
      for (let i = 0; i < total; i++) {
        let tokenIdBig: bigint;
        try {
          // Requires ERC721Enumerable
          tokenIdBig = await contract.tokenOfOwnerByIndex(owner, i);
        } catch {
          setStatus(
            "This contract does not implement ERC721Enumerable (tokenOfOwnerByIndex). We need another strategy to list owned NFTs."
          );
          break;
        }

        const tokenId = tokenIdBig.toString();
        let tokenURI = "";
        try {
          tokenURI = await contract.tokenURI(tokenIdBig);
        } catch {
          // Some contracts are strict with param types; bigint is fine.
        }

        const meta = tokenURI
          ? await fetchMetadata(tokenURI)
          : { image: "/images/default-nft.png", title: "" };

        items.push({
          id: tokenId,
          title: meta.title || `NFT #${tokenId}`,
          image: meta.image,
        });
      }
      setWalletNFTs(items);
      setStatus(items.length ? "NFTs loaded." : "No NFTs found in this wallet.");
    } catch (e: any) {
      setStatus(`Error loading NFTs: ${e?.message || e}`);
    }
  };

  const handleSend = async () => {
    if (!selectedNFT || !signer || !account) return;
    try {
      const to = prompt("Destination address:");
      if (!to) return;

      setStatus(`Sending ${selectedNFT.title || `#${selectedNFT.id}`}...`);
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const tx = await contract.safeTransferFrom(account, to, BigInt(selectedNFT.id));
      await tx.wait();
      setStatus("NFT sent.");
      if (provider) await loadOwnedNFTs(provider, account);
    } catch (e: any) {
      setStatus(`Send failed: ${e?.message || e}`);
    }
  };

  const handleReceive = () => {
    setStatus(`Your address to receive: ${account || "(connect wallet first)"}`);
  };

  useEffect(() => {
    setWalletNFTs([]);
  }, []);

  return (
    <Card border="1px" maxW="90vw" mx="auto" mt="40px">
      <CardHeader>
        <Heading size="md">Buy & Sell your NFTs</Heading>
      </CardHeader>
      <CardBody>
        <Box mb="4">
          <Text>Your wallet NFTs:</Text>
          {!account ? (
            <Box
              as="button"
              px="4"
              py="2"
              bg="blue.400"
              color="white"
              rounded="md"
              mt="2"
              onClick={connectWallet}
            >
              Connect Wallet
            </Box>
          ) : (
            <Text fontSize="sm" mt="2">Connected: {account}</Text>
          )}
        </Box>

        <Flex gap="4" wrap="wrap">
          {walletNFTs.map((nft) => (
            <Box
              key={nft.id}
              border="1px"
              p="2"
              rounded="md"
              cursor="pointer"
              bg={selectedNFT?.id === nft.id ? "blue.50" : "white"}
              onClick={() => setSelectedNFT(nft)}
            >
              <Image src={nft.image} alt={nft.title} boxSize="96px" objectFit="cover" />
              <Text mt="2" noOfLines={1}>{nft.title}</Text>
            </Box>
          ))}
        </Flex>

        {selectedNFT && (
          <Box mt="6">
            <Text>Action:</Text>
            <Flex gap="4" mt="2">
              <Box as="button" px="4" py="2" bg="green.400" color="white" rounded="md" onClick={handleReceive}>
                Receive
              </Box>
              <Box as="button" px="4" py="2" bg="red.400" color="white" rounded="md" onClick={handleSend}>
                Send
              </Box>
            </Flex>
            {status && <Text mt="4">{status}</Text>}
          </Box>
        )}

        {!selectedNFT && status && <Text mt="4">{status}</Text>}
      </CardBody>
    </Card>
  );
}
