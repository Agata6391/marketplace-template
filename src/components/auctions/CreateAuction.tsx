// src/components/auctions/CreateAuction.tsx
"use client";

import { useState } from "react";
import { Box, Flex, Input, Select, Button } from "@chakra-ui/react";
import { auctionStore } from "@/utils/auctionStore";

// Keep this type in sync with your store (optional duplicate for props)
type Trait = { trait_type?: string; value?: any; display_type?: string };

type Props = {
  seller: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  attributes?: Trait[];     // <-- accept attributes so the board can show them later
  onCreated?: () => void;   // optional callback after creation
};

export default function CreateAuction({
  seller,
  collection,
  tokenId,
  name,
  image,
  attributes,
  onCreated,
}: Props) {
  // simple local form state
  const [startPrice, setStartPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("HBAR");
  const [durationMinutes, setDurationMinutes] = useState<string>("60");

  function onCreate() {
    // robust unique id so remove/close affects only this auction
    const id =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${collection}-${tokenId}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    // parse duration safely
    const minutes = Math.max(1, parseInt(durationMinutes || "60", 10) || 60);
    const endTime = Date.now() + minutes * 60_000;

    auctionStore.add({
      id,
      seller,
      collection,
      tokenId,
      name,
      image,
      startPrice: (startPrice || "0").trim(),
      currency: (currency || "HBAR").trim(),
      endTime,
      createdAt: Date.now(),
      attributes, // <-- store attributes alongside the auction item
    });

    window.alert("Auction created.");
    onCreated?.();
  }

  return (
    <Box>
      {/* Basic inline form */}
      <Flex gap="2" wrap="wrap">
        <Input
          placeholder="Start price"
          value={startPrice}
          onChange={(e) => setStartPrice(e.target.value)}
          w="140px"
        />
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          w="120px"
        >
          <option value="HBAR">HBAR</option>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
        </Select>
        <Input
          placeholder="Duration (minutes)"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          w="180px"
        />
        <Button colorScheme="purple" onClick={onCreate}>
          Create auction
        </Button>
      </Flex>
    </Box>
  );
}
