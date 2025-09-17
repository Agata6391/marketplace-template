// "use client";

// import { Link } from "@chakra-ui/next-js";
// import { Box, Card, CardBody, CardHeader, Flex, Heading, Image, Stack, StackDivider, Text } from "@chakra-ui/react";
// import BuySellPage from "@/components/buySell-page/buysellpage";
// import { NFT_CONTRACTS } from "@/consts/nft_contracts";
// import { hederaMainnet } from "@/consts/chains";
// import MarketBoard from "@/components/buySell-page/MarketBoard";
// import AuctionsBoard from "@/components/auctions/AuctionsBoard"
// export default function Page() {
//   return (
//     <>
//       {/* Bloque 1 */}
//       <Flex>
//         <Box mt="24px" m="auto">
//           <Flex direction="column" gap="4">
//             {/* Intro card */}
//             <Card border="1px" maxW="90vw" mx="auto">
//               <CardHeader>
//                 <Heading size="md">Marketplace UndeadBlocks</Heading>
//               </CardHeader>
                


//               {/* <CardBody>
//                 <Stack divider={<StackDivider />} spacing="4">
//                   {_latestUpdates.map((item) => (
//                     <Box key={item.title}>
//                       <Heading size="xs" textTransform="uppercase">
//                         {item.title}
//                       </Heading>
//                       {item.bullet_points.map((pt) => (
//                         <Text pt="2" fontSize="sm" key={pt}>
//                           {pt}
//                         </Text>
//                       ))}
//                     </Box>
//                   ))} 
//                 </Stack>
//               </CardBody> */}
//             </Card>

//             {/* Buy/Sell panel
//             <Heading ml="20px" mt="40px">
//               Trending collections
//             </Heading>
//             <BuySellPage address="" chain={hederaMainnet} /> */}

//             {/* Collections grid */}
//             <Flex
//               direction="row"
//               wrap="wrap"
//               mt="20px"
//               gap="5"
//               justifyContent="space-evenly"
//             >
//               {NFT_CONTRACTS.map((item) => (
//                 <Link
//                   _hover={{ textDecoration: "none" }}
//                   w={300}
//                   h={400}
//                   key={`${item.chain.id}-${item.address}`}
//                   href={`/collection/${item.chain.id.toString()}/${item.address}`}
//                 >
//                   <Image
//                     src={item.thumbnailUrl}
//                     alt={item.title}
//                     w="300px"
//                     h="300px"
//                     objectFit="cover"
//                     borderRadius="md"
//                   />
//                   <Text fontSize="lg" mt="10px">
//                     {item.title}
//                   </Text>
//                 </Link>
//               ))}
//             </Flex>
//           </Flex>
//         </Box>
//       </Flex>

//       {/* Marketplace */}
//       <Flex direction="column" gap="8" mt="24px" mx="auto" maxW="1200px">
//         <Box>
//           <Heading size="lg" mb="4">My NFTs</Heading>
//           <BuySellPage address="" chain={hederaMainnet} />
//         </Box>

//         <Box>
//           <Heading size="lg" mb="4">Marketplace</Heading>
//           <MarketBoard />
//             <Box mt="40px">
//                   <Heading size="lg" mb="4">Auctions</Heading>
//                   <AuctionsBoard />
//             </Box>
//         </Box>
//       </Flex>
//     </>
//   );
// };



// // const _latestUpdates: Array<{ title: string; bullet_points: string[] }> = [
// //   {
// //     title: "Weapons",
// //     bullet_points: [
// //       "Shipped with the latest thirdweb SDK (v5) and Next.js 14 (App router)",
// //     ],
// //   },
// //   {
// //     title: "Last News",
// //     bullet_points: [
// //       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
// //       "Support for Hedera Mainnet",
// //     ],
// //   },
// //   {
// //     title: "Multiple collections supported",
// //     bullet_points: [
// //       "The new template now supports multiple collections, you can view your owned NFTs and your listings",
// //     ],
// //   },
// //   {
// //     title: "Upcoming features in game and marketplace",
// //     bullet_points: [
// //       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
// //       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
// //     ],
// //   },
// //   {
// //     title: "Contribute",
// //     bullet_points: [
// //       "We welcome all contributions from the community.",
// //       "Found a bug or have some suggestions? Send an email to support@undeadblocks.com",
// //     ],
// //   },
// // ];
// src/app/page.tsx
"use client";

import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import HeroBanner from "@/components/hero/Herobanner";
import BuySellPage from "@/components/buySell-page/buysellpage";
import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { hederaMainnet } from "@/consts/chains";
import MarketBoard from "@/components/buySell-page/MarketBoard";
import AuctionsBoard from "@/components/auctions/AuctionsBoard";

export default function Page() {
  return (
    <>
      {/* HERO CABECERA (full-width, integra login + theme + Hedera) */}
      <HeroBanner
        title="title placeholder"
        subtitle="subtitle placeholder"
        ctaText="Call to Action"
        // opcional: puedes pasar onCtaClick si quieres navegación
        // onCtaClick={() => router.push("/collection/hedera")}
        backgroundImage="/images/hero/undeadblocks_hero.jpg"
        hederaBadgeSrc="/images/hedera-badge.png"
      />

      {/* CONTENIDO */}
      <Flex direction="column" gap="8" mt="24px" mx="auto" maxW="1200px">
        {/* Grid de colecciones */}
        {/* <Flex direction="row" wrap="wrap" mt="20px" gap="5" justifyContent="space-evenly">
          {NFT_CONTRACTS.map((item) => (
            <Link
              _hover={{ textDecoration: "none" }}
              w={300}
              h={400}
              key={`${item.chain.id}-${item.address}`}
              href={`/collection/${item.chain.id.toString()}/${item.address}`}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                w="300px"
                h="300px"
                objectFit="cover"
                borderRadius="md"
              />
              <Text fontSize="lg" mt="10px">
                {item.title}
              </Text>
            </Link>
          ))}
        </Flex> */}

        {/* Bloques Marketplace existentes */}
        <Box>
          <Heading size="lg" mb="4">My NFTs</Heading>
          <BuySellPage address="" chain={hederaMainnet} />
        </Box>

        <Box>
          <Heading size="lg" mb="4">Marketplace</Heading>
          <MarketBoard />
          <Box mt="40px">
            <Heading size="lg" mb="4">Auctions</Heading>
            <AuctionsBoard />
          </Box>
        </Box>
      </Flex>
    </>
  );
}
