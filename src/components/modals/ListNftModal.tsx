"use client";

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Text, Flex, Box, Image,
} from "@chakra-ui/react";
import CreateListingLocal from "@/components/buySell-page/CreateListingLocal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isWalletConnected?: boolean;
  name?: string;
  image?: string;
  tokenId?: string;
  collection: string;
  seller: string;
};

export default function ListNftModal({
  isOpen, onClose, isWalletConnected, name, image, tokenId, collection, seller,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sell NFT</ModalHeader>
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
              {!isWalletConnected && (
                <Text mt="2" fontSize="sm" color="orange.500">
                  Connect a wallet to create a listing.
                </Text>
              )}
            </Box>
          </Flex>

          <Box mt="4">
            {/* Reuse your local listing component inside the modal */}
            <CreateListingLocal
              seller={seller || ""}
              collection={collection}
              tokenId={tokenId || ""}
              name={name || ""}
              image={image || "/images/dummynfts/default-nft.png"}
              onListed={onClose}
            />
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
