// src/components/modals/ListNftModal.tsx
"use client";

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Text, Flex, Image, Box
} from "@chakra-ui/react";
import CreateListingLocal from "@/components/buySell-page/CreateListingLocal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  seller: string;
  collection: string;
  tokenId: string;
  name: string;
  image: string;
  onListed?: () => void;
};

export default function ListNftModal({
  isOpen,
  onClose,
  seller,
  collection,
  tokenId,
  name,
  image,
  onListed,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sell NFT</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex gap="4" align="center">
            <Image
              src={image || "/images/dummynfts/default-nft.png"}
              alt={name}
              w="120px"
              h="120px"
              objectFit="cover"
              rounded="md"
            />
            <Box>
              <Text fontWeight="bold">{name}</Text>
              <Text fontSize="sm" color="gray.500">Token ID: {tokenId}</Text>
            </Box>
          </Flex>

          <Box mt="4">
            <CreateListingLocal
              seller={seller}
              collection={collection}
              tokenId={tokenId}
              name={name}
              image={image}
              onListed={() => {
                onListed?.();
                onClose();
              }}
            />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
// --- IGNORE ---