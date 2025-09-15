// src/components/buySell-page/CreateListingLocal.tsx
"use client";

import { Button, Flex, Input, Select } from "@chakra-ui/react";
import { useState } from "react";
import { marketStore } from "@/utils/marketStore";

type Props = {
  seller: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  onListed?: () => void;
};

export default function CreateListingLocal({
  seller,
  collection,
  tokenId,
  name,
  image,
  onListed,
}: Props) {
  const [price, setPrice] = useState("0.1");
  const [currency, setCurrency] = useState("HBAR");

  function onCreate() {
    const p = (price || "").trim();
    const c = (currency || "HBAR").trim();

    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    marketStore.add({
      id,
      seller,
      collection,
      tokenId,
      name,
      image,
      price: p || "0",   // 👈 siempre algo visible
      currency: c || "HBAR",
      createdAt: Date.now(),
    });

    if (onListed) onListed();

    
  }

  return (
    <Flex gap={2} align="center" wrap="wrap">
      <Input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        width="120px"
        size="sm"
      />
      <Select value={currency} onChange={(e) => setCurrency(e.target.value)} width="120px" size="sm">
        <option value="HBAR">HBAR</option>
        <option value="ETH">ETH</option>
        <option value="USDC">USDC</option>
      </Select>
      <Button size="sm" colorScheme="green" onClick={onCreate}>
        List
      </Button>
    </Flex>
  );
}
