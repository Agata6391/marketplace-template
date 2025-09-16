
"use client";

import { useState } from "react";
import { Box, Flex, Input, Select, Button } from "@chakra-ui/react";
import { auctionStore } from "@/utils/auctionStore";

type Props = {
  seller: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  onCreated?: () => void; // optional callback after creation
};

export default function CreateAuction({
  seller,
  collection,
  tokenId,
  name,
  image,
  onCreated,
}: Props) {
  // simple local form state
  const [startPrice, setStartPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("HBAR");
  const [durationMinutes, setDurationMinutes] = useState<string>("60");

  function onCreate() {
    // generate a strong unique id so remove() deletes only one auction
    const id =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${collection}-${tokenId}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const minutes = parseInt(durationMinutes || "60", 10);
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
    });

    window.alert("Auction created.");
    if (onCreated) onCreated();
  }

  return (
    <Box>
      {/* basic inline form */}
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
