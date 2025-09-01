import { defineChain } from "thirdweb";

/**
 * All chains should be exported from this file
 */
export { avalancheFuji, sepolia, polygonAmoy } from "thirdweb/chains";
export const hederaMainnet = defineChain(295); // Hedera Mainnet
/**
 * Define any custom chain using `defineChain`
 */
export const example_customChain1 = defineChain(0.001); // don't actually use this
