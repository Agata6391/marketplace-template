// src/components/nft/NftAttributesModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Image, Text, Box, Flex } from "@chakra-ui/react";
import { getContract, getNFT } from "thirdweb";
import type { Chain } from "thirdweb";
import { client } from "@/consts/client";
import { hederaMainnet } from "@/consts/chains";

type Trait = { trait_type?: string; value?: any; display_type?: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  image?: string;
  tokenId?: string;
  collection?: string;
  attributes?: Trait[];     // optional: if not provided, we will fetch
  chain?: Chain;            // optional: fallback to hederaMainnet
};

export default function NftAttributesModal({
  isOpen,
  onClose,
  name,
  image,
  tokenId,
  collection,
  attributes,
  chain,
}: Props) {
  const [resolvedAttrs, setResolvedAttrs] = useState<Trait[] | undefined>(attributes);

  useEffect(() => {
    setResolvedAttrs(attributes); // refresh when props change
  }, [attributes]);

  useEffect(() => {
    // If no attributes in props, try to fetch from the collection/tokenId
    async function resolve() {
      if (resolvedAttrs?.length) return;
      if (!collection || !tokenId) return;

      try {
        const c = getContract({
          client,
          chain: chain ?? hederaMainnet,
          address: collection,
        });
        const nft = await getNFT({ contract: c, tokenId });
        const attrs = Array.isArray(nft?.metadata?.attributes) ? nft.metadata.attributes as Trait[] : [];
        setResolvedAttrs(attrs);
      } catch {
        // ignore errors; show empty attrs
        setResolvedAttrs([]);
      }
    }
    if (isOpen) resolve();
  }, [isOpen, collection, tokenId, chain, resolvedAttrs]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>NFT Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap="4" wrap="wrap">
            <Box>
              {image ? (
                <Image src={image} alt={name || "NFT"} maxW="220px" borderRadius="md" />
              ) : (
                <Box w="220px" h="220px" bg="gray.100" borderRadius="md" />
              )}
              <Text mt="2" fontWeight="bold">{name || `Token #${tokenId ?? ""}`}</Text>
              {collection && (
                <Text fontSize="sm" color="gray.500">
                  {collection.slice(0, 6)}…{collection.slice(-4)}{tokenId ? ` • #${tokenId}` : ""}
                </Text>
              )}
            </Box>

            <Box flex="1" minW="220px">
              <Text fontWeight="semibold" mb="2">Attributes</Text>
              {resolvedAttrs && resolvedAttrs.length > 0 ? (
                <Flex gap="2" wrap="wrap">
                  {resolvedAttrs.map((t, idx) => (
                    <Box key={idx} border="1px" p="2" borderRadius="md" minW="120px">
                      <Text fontSize="xs" color="gray.500">{t.trait_type || "Trait"}</Text>
                      <Text fontWeight="bold">{String(t.value ?? "—")}</Text>
                      {t.display_type && (
                        <Text fontSize="xs" color="gray.400">{t.display_type}</Text>
                      )}
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Text fontSize="sm" color="gray.500">No attributes found.</Text>
              )}
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
