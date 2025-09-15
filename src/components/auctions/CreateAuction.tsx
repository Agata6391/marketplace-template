"use client";

import { useState } from "react";
import { Flex, Input, Select, Button } from "@chakra-ui/react";
import { auctionStore } from "@/utils/auctionStore";

type Props = {
  seller: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  onCreated?: () => void;
};

export default function CreateAuction({
  seller,
  collection,
  tokenId,
  name,
  image,
  onCreated,
}: Props) {
  const [startPrice, setStartPrice] = useState("0.1");
  const [currency, setCurrency] = useState("HBAR");
  const [durationMinutes, setDurationMinutes] = useState("60"); // 1h

  function onCreate() {
    const p = (startPrice || "").trim();
    const c = (currency || "HBAR").trim();
    const minutes = parseInt(durationMinutes || "60", 10);
    const endTime = Date.now() + minutes * 60_000;

    auctionStore.add({
      seller,
      collection,
      tokenId,
      name,
      image,
      startPrice: p || "0",
      currency: c,
      endTime,
    });
      window.alert("Auction created.");

    if (onCreated) onCreated();
  }

  return (
    <Flex gap={2} align="center" wrap="wrap">
      <Input
        value={startPrice}
        onChange={(e) => setStartPrice(e.target.value)}
        placeholder="Start price"
        width="140px"
        size="sm"
      />
      <Select value={currency} onChange={(e) => setCurrency(e.target.value)} width="120px" size="sm">
        <option value="HBAR">HBAR</option>
        <option value="ETH">ETH</option>
        <option value="USDC">USDC</option>
      </Select>
      <Input
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(e.target.value)}
        placeholder="Duration (min)"
        width="160px"
        size="sm"
      />
      <Button size="sm" colorScheme="green" onClick={onCreate}>
        Create auction
      </Button>
    </Flex>
  );
}
