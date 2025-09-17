// src/components/modals/SendNftModal.tsx
"use client";

import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, FormControl, FormLabel, Input,
  Flex, Box, Image, Text
} from "@chakra-ui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;         // true in dummy/fallback
  from?: string | null;       // connected wallet
  name: string;
  image: string;
  tokenId: string;
  onConfirm: (toAddress: string) => Promise<void> | void; // executes real send in live
};

export default function SendNftModal({
  isOpen,
  onClose,
  disabled,
  from,
  name,
  image,
  tokenId,
  onConfirm,
}: Props) {
  const [to, setTo] = useState("");

  async function handleConfirm() {
    if (disabled) return;
    if (!to) {
      window.alert("Enter destination address.");
      return;
    }
    await onConfirm(to);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send NFT</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap="4" align="flex-start" wrap="wrap">
            <Box>
              <Image
                src={image || "/images/dummynfts/default-nft.png"}
                alt={name}
                w="160px"
                h="160px"
                objectFit="cover"
                rounded="md"
              />
            </Box>

            <Box flex="1" minW="240px">
              <Text fontWeight="bold">{name}</Text>
              <Text fontSize="sm" color="gray.500">Token ID: {tokenId}</Text>

              <FormControl mt="4">
                <FormLabel>From</FormLabel>
                <Input value={from || ""} isReadOnly placeholder="Not connected" />
              </FormControl>

              <FormControl mt="3" isDisabled={!!disabled}>
                <FormLabel>To</FormLabel>
                <Input
                  placeholder="0x..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </FormControl>

              {disabled && (
                <Text mt="3" fontSize="sm" color="orange.500">
                  Send is disabled in local/dummy mode.
                </Text>
              )}
            </Box>
          </Flex>
        </ModalBody>

        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="red" onClick={handleConfirm} isDisabled={!!disabled}>
            Confirm send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
