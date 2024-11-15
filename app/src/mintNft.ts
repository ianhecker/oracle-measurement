import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { getContract, parseEther } from "viem";
import { publicClient, walletClient } from "./client";

export const abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_pyth",
        type: "address",
        internalType: "address",
      },
      {
        name: "_ethUsdPriceId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "updateAndMint",
    inputs: [
      {
        name: "pythPriceUpdate",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "error",
    name: "InsufficientFee",
    inputs: [],
  },
] as const;

async function run() {
  const contract = getContract({
    address: process.env["DEPLOYMENT_ADDRESS"] as any,
    abi: abi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  );
  const priceIds = [process.env["ETH_USD_ID"] as string];
  const priceFeedUpdateData = await connection.getPriceFeedsUpdateData(
    priceIds
  );
  console.log("Retrieved Pyth price update:");
  console.log(priceFeedUpdateData);

  const hash = await contract.write.updateAndMint(
    [priceFeedUpdateData as any],
    { value: parseEther("0.0005") }
  );
  console.log("Transaction hash:");
  console.log(hash);
}

run();
