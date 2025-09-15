"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody, Heading, Text, Flex, Box, Tag } from "@chakra-ui/react";
import { useActiveAccount } from "thirdweb/react";
import { computeSalesKpis, getUserProfile } from "@/utils/profileKpis";
import { CHANGE_EVENT as LISTING_EVENT, STORAGE_KEY as LISTING_KEY } from "@/utils/marketStore";
import { AUCTIONS_EVENT, AUCTIONS_KEY } from "@/utils/auctionStore";

type Props = {
  address?: string; // use wallet conected if not provided
  title?: string;
};

export default function ProfileEarnings({ address, title = "Sales KPIs" }: Props) {
  const account = useActiveAccount();
  const addr = (address || account?.address || "").toLowerCase();

  const [version, setVersion] = useState(0);

  // refreesh  Listings o auctions (storage/local events)
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(LISTING_EVENT, bump);
    window.addEventListener(AUCTIONS_EVENT, bump);
    const onStorage = (e: StorageEvent) => {
      if (e.key === LISTING_KEY || e.key === AUCTIONS_KEY) bump();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LISTING_EVENT, bump);
      window.removeEventListener(AUCTIONS_EVENT, bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const profile = useMemo(() => (addr ? getUserProfile(addr) : null), [addr, version]);
  const kpis = useMemo(() => (profile ? computeSalesKpis(profile) : null), [profile]);

  return (
    <Card border="1px">
      <CardHeader>
        <Heading size="md">{title}</Heading>
        {addr ? (
          <Text fontSize="xs" color="gray.500">Address: {addr}</Text>
        ) : (
          <Text fontSize="xs" color="orange.500">Connect a wallet to see KPIs</Text>
        )}
      </CardHeader>
      <CardBody>
        {!profile ? (
          <Text>No data.</Text>
        ) : (
          <Flex wrap="wrap" gap="4">
            <KpiCard label="Total sales" value={kpis?.totalSalesCount ?? 0} />
            <KpiCard label="Unique buyers" value={kpis?.uniqueBuyers ?? 0} />
            <Box border="1px" rounded="md" p="12px" minW="220px">
              <Text fontSize="sm" color="gray.500" mb="2">Revenue by currency</Text>
              {kpis?.totalsByCurrency?.length ? (
                <Flex gap="2" wrap="wrap">
                  {kpis!.totalsByCurrency.map((t) => (
                    <Tag key={t.currency} size="md" variant="subtle">
                      {`${t.total.toLocaleString()} ${t.currency}`}
                    </Tag>
                  ))}
                </Flex>
              ) : (
                <Text fontSize="sm">—</Text>
              )}
            </Box>
            <KpiCard
              label="Top collection"
              value={kpis?.topCollection ? `${kpis.topCollection.slice(0,6)}…${kpis.topCollection.slice(-4)}` : "—"}
            />
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Box border="1px" rounded="md" p="12px" minW="160px">
      <Text fontSize="sm" color="gray.500">{label}</Text>
      <Text fontSize="xl" fontWeight="bold">{String(value)}</Text>
    </Box>
  );
}
