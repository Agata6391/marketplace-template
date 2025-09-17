"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  useColorMode,
} from "@chakra-ui/react";
import { client } from "@/consts/client";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";
import { FiUser } from "react-icons/fi";
import { IoSunny } from "react-icons/io5";
import { FaRegMoon } from "react-icons/fa";

type Props = {
  backgroundImage?: string;      // full-width background image
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  hederaBadgeSrc?: string;       // small badge/logo shown at right
};

export default function HeroBanner({
  backgroundImage = "/images/hero/undeadblocks_hero.jpg",
  title,
  subtitle,
  ctaText = "Call to Action",
  onCtaClick,
  hederaBadgeSrc = "/images/hedera-badge.png",
}: Props) {
  const { colorMode, toggleColorMode } = useColorMode();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  return (
    <Box
      // bleed to full width even when page is centered
      w="100vw"
      ml="calc(50% - 50vw)"
      bgGradient="linear(to-r, blackAlpha.800, blackAlpha.700)"
      backgroundImage={`linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${backgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      borderBottomWidth="1px"
    >
      <Flex
        // this keeps content nicely centered
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={{ base: 6, md: 10 }}
        align="center"
        justify="space-between"
        gap={6}
      >
        {/* LEFT: title / subtitle / CTA (NO brand text here per your request) */}
        <Box color="white">
          {/* breadcrumb-like line */}
          <Text fontSize="xs" opacity={0.8} mb={2}>
            UNDEADBLOCKS | MARKETPLACE
          </Text>

          <Heading size="lg" lineHeight="short">
            {title}
          </Heading>

          {subtitle && (
            <Text mt={2} opacity={0.9}>
              {subtitle}
            </Text>
          )}

          {ctaText && (
            <Button
              size="sm"
              mt={4}
              colorScheme="red"
              onClick={onCtaClick}
              width="auto"
            >
              {ctaText}
            </Button>
          )}
        </Box>

        {/* RIGHT: Hedera badge + controls (theme + connect/profile) */}
        <Flex align="center" gap={3}>
          {/* Hedera badge */}
          <Image
            src={hederaBadgeSrc}
            alt="Hedera"
            h="32px"
            objectFit="contain"
            borderRadius="md"
            bg="whiteAlpha.100"
            px="8px"
            py="6px"
          />

          {/* Theme toggle */}
          <Button onClick={toggleColorMode} h="40px" w="40px" variant="ghost">
            {colorMode === "light" ? <FaRegMoon /> : <IoSunny />}
          </Button>

          {/* Connect/Profile in the hero (no more separate navbar) */}
          <ConnectButton
            client={client}
            theme={colorMode}
            connectButton={{ style: { height: "40px" } }}
            // optional: small avatar + icon to look like your top-right block
            detailsButton={{
              style: { height: "40px" },
              label: account?.address
                ? `${account.address.slice(0, 6)}…${account.address.slice(-4)}`
                : undefined,
              leading: <FiUser />,
            }}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
