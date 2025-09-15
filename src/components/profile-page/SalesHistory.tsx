"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useActiveAccount } from "thirdweb/react";
import { userProfileStore } from "@/utils/userProfileStore";
import { CHANGE_EVENT as LISTING_EVENT, STORAGE_KEY as LISTING_KEY } from "@/utils/marketStore";

function fmt(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZoneName: "short",
  });
}

export default function SalesHistory({ address, title = "Sales history" }: { address?: string; title?: string }) {
  const account = useActiveAccount();
  const addr = (address || account?.address || "").toLowerCase();

  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(LISTING_EVENT, bump);
    const onStorage = (e: StorageEvent) => { if (e.key === LISTING_KEY) bump(); };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LISTING_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const profile = useMemo(() => (addr ? userProfileStore.get(addr) : null), [addr, version]);
  const sold = useMemo(
    () => (profile ? profile.listings.filter((l) => l.status === "SOLD").sort((a,b) => (b.updatedAt||0)-(a.updatedAt||0)) : []),
    [profile]
  );

  return (
    <Card border="1px">
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        {!addr ? (
          <Text color="orange.500">Connect a wallet to see your sales.</Text>
        ) : sold.length === 0 ? (
          <Text>No sales yet.</Text>
        ) : (
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>When</Th>
                <Th>Item</Th>
                <Th>Token</Th>
                <Th isNumeric>Price</Th>
                <Th>Buyer</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sold.map((s) => (
                <Tr key={s.id}>
                  <Td>{fmt(s.updatedAt)}</Td>
                  <Td>{s.name}</Td>
                  <Td>#{s.tokenId}</Td>
                  <Td isNumeric>{s.price ?? "—"} {s.currency ?? ""}</Td>
                  <Td>{s.buyer ? `${s.buyer.slice(0,6)}…${s.buyer.slice(-4)}` : "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
}
