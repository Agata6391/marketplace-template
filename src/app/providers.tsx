// src/app/providers.tsx
// "use client";

// import * as React from "react";
// import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
// import UndeadBlocks from "@/themes/UndeadBlocks"; // si no tenés alias "@", usa "../themes/UndeadBlocks"

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <>
//       <ColorModeScript initialColorMode={UndeadBlocks.config.initialColorMode} />
//       <ChakraProvider theme={UndeadBlocks}>{children}</ChakraProvider>
//     </>
//   );
// }
// src/app/providers.tsx
"use client";

import * as React from "react";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import UndeadBlocks from "@/themes/UndeadBlocks";

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/consts/client";
import { hederaMainnet } from "@/consts/chains"; // o la chain que uses

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider client={client} activeChain={hederaMainnet}>
      <CacheProvider>
        <ColorModeScript initialColorMode={UndeadBlocks.config.initialColorMode} />
        <ChakraProvider theme={UndeadBlocks}>{children}</ChakraProvider>
      </CacheProvider>
    </ThirdwebProvider>
  );
}

