"use client";

import { useMemo, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Text, Flex, Box, Image, Input,
} from "@chakra-ui/react";
import type { Chain } from "thirdweb";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain;
  isWalletConnected?: boolean;     // NEW: connection state
  name?: string;
  image?: string;
  tokenId?: string;
  collection: string;
  onConfirm?: (to: string) => void; // optional live hook

  // NEW: force the confirm button to stay disabled (demo mode)
  forceDisableConfirm?: boolean;
  forceDisableReason?: string;
};

export default function SendNftModal({
  isOpen,
  onClose,
  chain,
  isWalletConnected,
  name,
  image,
  tokenId,
  collection,
  onConfirm,
  forceDisableConfirm,
  forceDisableReason,
}: Props) {
  const [to, setTo] = useState("");

  // If forceDisableConfirm is true, the confirm button is always disabled.
  const canConfirm = useMemo(() => {
    if (forceDisableConfirm) return false;
    return !!isWalletConnected && !!to;
  }, [forceDisableConfirm, isWalletConnected, to]);

  // Helper text explaining why the confirm is disabled
  const disableHint =
    forceDisableConfirm
      ? (forceDisableReason || "Sending is disabled.")
      : !isWalletConnected
        ? "Connect a wallet to confirm the transfer."
        : !to
          ? "Enter a destination address to continue."
          : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send NFT</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap="3">
            <Image
              src={image || "/images/dummynfts/default-nft.png"}
              alt={name || `#${tokenId}`}
              boxSize="96px"
              objectFit="cover"
              rounded="md"
            />
            <Box flex="1">
              <Text fontWeight="bold" noOfLines={1}>
                {name || `Token #${tokenId}`}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                {collection ? `${collection.slice(0, 6)}…${collection.slice(-4)}` : "—"}
              </Text>
              <Text fontSize="xs" color="gray.600" mt="1">
                Chain: {chain.name}
              </Text>
            </Box>
          </Flex>

          <Box mt="4">
            <Text fontSize="sm" mb="1">Destination address</Text>
            <Input
              placeholder="0x..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {disableHint && (
              <Text mt="2" fontSize="sm" color="orange.500">
                {disableHint}
              </Text>
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={() => {
              if (onConfirm && canConfirm) onConfirm(to);
            }}
            isDisabled={!canConfirm}
          >
            Confirm send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
