"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Card, CardBody, CardHeader, Flex, Heading, Image, Text, Button, Input } from "@chakra-ui/react";
import { auctionStore, type AuctionItem, AUCTIONS_KEY, AUCTIONS_EVENT } from "@/utils/auctionStore";
import { useActiveAccount } from "thirdweb/react";

type Props = { title?: string };

function formatRemaining(ms: number) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(ss)}`;
}

export default function AuctionsBoard({ title = "Auctions" }: Props) {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [bids, setBids] = useState<Record<string, string>>({});
  const account = useActiveAccount();
  const tickRef = useRef<number | null>(null);

  const refresh = () => setAuctions(auctionStore.all());

  useEffect(() => {
    // initial load
    refresh();

    // same-tab updates
    const handler = () => refresh();
    window.addEventListener(AUCTIONS_EVENT, handler);

    // cross-tab updates
    const storageHandler = (e: StorageEvent) => {
      if (e.key === AUCTIONS_KEY) refresh();
    };
    window.addEventListener("storage", storageHandler);

    // tick for countdowns + auto-closing
    tickRef.current = window.setInterval(refresh, 1000);

    return () => {
      window.removeEventListener(AUCTIONS_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const active = useMemo(() => auctions.filter(a => a.status === "OPEN").sort((a,b)=>a.endTime-b.endTime), [auctions]);
  const closed = useMemo(() => auctions.filter(a => a.status === "CLOSED"), [auctions]);

  function placeBid(a: AuctionItem) {
    try {
      const amount = (bids[a.id] || "").trim();
      if (!amount) return;
      if (!account?.address) {
        alert("Connect a wallet to place a bid.");
        return;
      }
      auctionStore.bid(a.id, amount, account.address);
      setBids((prev) => ({ ...prev, [a.id]: "" }));
    } catch (e: any) {
      alert(e?.message || String(e));
    }
  }

  function closeAuction(a: AuctionItem) {
    auctionStore.close(a.id);
  }

  function renderCard(a: AuctionItem) {
    const remaining = a.endTime - Date.now();

    return (
      <Box key={a.id} border="1px" borderColor="border" bg="cardBg" w="280px" rounded="md" overflow="hidden" p="10px">
        <Image src={a.image} alt={a.name} w="260px" h="260px" objectFit="cover" />
        <Text mt="10px" color="text" noOfLines={1}>{a.name}</Text>
        <Text fontSize="xs" color="muted">#{a.tokenId} • {a.collection.slice(0,6)}…{a.collection.slice(-4)}</Text>

        {a.status === "OPEN" ? (
          <>
            <Text fontSize="sm" color="text" mt="6px">
              Start: {a.startPrice} {a.currency}
            </Text>
            <Text fontSize="sm" color="text">
              Top bid: {a.currentBid ? `${a.currentBid} ${a.currency}` : "—"}
            </Text>
            <Text fontSize="sm" color="muted">Time left: {formatRemaining(remaining)}</Text>

            <Flex gap="2" mt="8px">
              <Input
                value={bids[a.id] || ""}
                onChange={(e) => setBids((prev) => ({ ...prev, [a.id]: e.target.value }))}
                placeholder={`Amount (${a.currency})`}
                size="sm"
              />
              <Button size="sm" colorScheme="blue" onClick={() => placeBid(a)}>Bid</Button>
            </Flex>

            {account?.address?.toLowerCase() === a.seller.toLowerCase() && (
              <Button size="sm" mt="8px" onClick={() => closeAuction(a)}>Close</Button>
            )}
          </>
        ) : (
          <>
            <Text fontSize="sm" color="muted" mt="6px">Status: Closed</Text>
            <Text fontSize="sm" color="text">
              Winner: {a.currentBidder ? `${a.currentBidder.slice(0,6)}…${a.currentBidder.slice(-4)}` : "—"}
            </Text>
            <Text fontSize="sm" color="text">
              Final: {a.currentBid ? `${a.currentBid} ${a.currency}` : "—"}
            </Text>
          </>
        )}
      </Box>
    );
  }

  return (
    <Card border="1px" borderColor="border" bg="cardBg" maxW="1200px" mx="auto" mt="24px">
      <CardHeader>
        <Heading size="md" color="text">{title}</Heading>
      </CardHeader>
      <CardBody>
        {active.length === 0 && closed.length === 0 && (
          <Text color="muted">No auctions yet.</Text>
        )}

        {active.length > 0 && (
          <>
            <Heading size="sm" mb="3" color="text">Active</Heading>
            <Flex wrap="wrap" gap="5">{active.map(renderCard)}</Flex>
          </>
        )}

        {closed.length > 0 && (
          <>
            <Heading size="sm" mt="8" mb="3" color="text">Closed</Heading>
            <Flex wrap="wrap" gap="5">{closed.map(renderCard)}</Flex>
          </>
        )}
      </CardBody>
    </Card>
  );
}
