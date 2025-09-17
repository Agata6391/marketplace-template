"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import BuySellPage from "@/components/buySell-page/buysellpage";
import MarketBoard from "@/components/buySell-page/MarketBoard";
import { hederaMainnet } from "@/consts/chains";


export default function MarketPage() {
  return (
    <Flex direction="column" gap="8" mt="24px" mx="auto" maxW="1200px">
      <Box>
        <Heading size="lg" mb="4">My NFTs</Heading>
        <BuySellPage address="" chain={hederaMainnet} />
      </Box>

      <Box>
        <Heading size="lg" mb="4">Marketplace</Heading>
        <MarketBoard />
      </Box>
    </Flex>
  );
}
