// src/components/buySell-page/MarketBoard.tsx
"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardBody, CardHeader, Flex, Heading, Image, Text, Button } from "@chakra-ui/react";
import { marketStore, type ListingItem, CHANGE_EVENT, STORAGE_KEY } from "@/utils/marketStore";
import { useActiveAccount } from "thirdweb/react";

type Props = { title?: string };

export default function MarketBoard({ title = "Marketplace" }: Props) {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const account = useActiveAccount();

  const refresh = () => setListings(marketStore.all());

  useEffect(() => {
    // initial load
    refresh();

    // same-tab notifications
    const handler = () => refresh();
    window.addEventListener(CHANGE_EVENT, handler);

    // cross-tab (other windows) via localStorage
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

const onBuy = (id: string) => {
  window.alert("Purchase completed.");
};

const onRemove = (id: string) => {
  marketStore.remove(id);      // remove from...>
  window.alert("Listing removed.");
};


  return (
    <Card border="1px" maxW="1200px" mx="auto" mt="24px">
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        {listings.length === 0 && <Text>No listings yet.</Text>}

        <Flex wrap="wrap" gap="5" justifyContent="flex-start">
          {listings.map((l) => (
            <Box key={l.id} border="1px" w="280px" rounded="md" overflow="hidden" p="10px">
              <Image src={l.image} alt={l.name} w="260px" h="260px" objectFit="cover" />
              <Text mt="10px" noOfLines={1}>{l.name}</Text>
              <Text fontSize="xs" color="gray.500">
                #{l.tokenId} • {l.collection.slice(0, 6)}…{l.collection.slice(-4)}
              </Text>
              <Text fontSize="sm" color="gray.700" mt="6px">
                {l.price} {l.currency}
              </Text>

              <Flex gap="2" mt="10px">
                {account?.address?.toLowerCase() === l.seller.toLowerCase() ? (
                  <Button size="sm" onClick={() => onRemove(l.id)}>Remove</Button>
                ) : (
                  <Button size="sm" colorScheme="blue" onClick={() => onBuy(l.id)}>Buy</Button>
                )}
              </Flex>
            </Box>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
}
