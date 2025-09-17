import { defineChain } from "thirdweb";

/**
 * Export all chains used in your app
 */
export { avalancheFuji, sepolia, polygonAmoy } from "thirdweb/chains";

// Hedera Mainnet (chainId 295)
export const hederaMainnet = defineChain(295);

/**
 * Example of how to define a custom chain (replace with a real chainId if needed)
 */
// export const customChain = defineChain(12345); // replace 12345 with a valid chainId
