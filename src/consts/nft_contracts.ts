import type { Chain } from "thirdweb";
import { avalancheFuji, hederaMainnet, polygonAmoy } from "./chains";

export type NftContract = {
  address: string;
  chain: Chain;
  type: "ERC1155" | "ERC721";

  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
};

/**
 * Below is a list of all NFT contracts supported by your marketplace(s)
 * This is of course hard-coded for demo purpose
 *
 * In reality, the list should be dynamically fetched from your own data source
 */
export const NFT_CONTRACTS: NftContract[] = [
  // {
  //   address: "0x6b869a0cF84147f05a447636c42b8E53De65714E",
  //   chain: avalancheFuji,
  //   title: "Steakhouse: Liberatorz",
  //   thumbnailUrl:
  //     "https://258c828e8cc853bf5e0efd001055fb39.ipfscdn.io/ipfs/bafybeigonh3hde5suwcb3qvkh6ljtvxv7ubfmcqbwfvi3ihoi3igd27jwe/SteakhouseLogo.svg",
  //   type: "ERC721",
  // },
  
  {
    address: "",
    chain: hederaMainnet,
    title: "Hedera Miannet ",
    thumbnailUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFa1gyWxfROX7k_hpwQiPI6fXLMTKdjKGSZA&s",
    type: "ERC1155",
  },
];
