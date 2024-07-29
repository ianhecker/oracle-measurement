import { OracleMeasurement } from "./oracle-measurements";

import { CrossbarClient } from "@switchboard-xyz/on-demand";
import * as ethers from "ethers";
import * as fs from "fs";

const rpcURL = process.env.ALCHEMY_RPC_URL as string;
if (!rpcURL) {
  throw new Error("Missing ALCHEMY_RPC_URL");
}

const chainId = process.env.CHAIN_ID as string;
if (!chainId) {
  throw new Error("Missing CHAIN_ID");
}

const coinmarketcapAPIKey = process.env.COINMARKETCAP_API_KEY as string;
if (!coinmarketcapAPIKey) {
  throw new Error("Missing CHAIN_ID");
}

const contractAddress = process.env.BASIC_FEED_CONTRACT_ADDRESS as string;
if (!contractAddress) {
  throw new Error("Missing BASIC_FEED_CONTRACT_ADDRESS");
}

const privateKey = process.env.PRIVATE_KEY as string;
if (!privateKey) {
  throw new Error("Missing PRIVATE_KEY");
}

const measure = async () => {
  const provider = new ethers.JsonRpcProvider(rpcURL);

  const signerWithProvider = new ethers.Wallet(privateKey, provider);

  const ABI = [
    "function getFeedData(bytes[] calldata updates) public payable",
    "function aggregatorId() public view returns (bytes32)",
    "function latestPrice() public view returns (int256)",
  ];

  const crossbar = new CrossbarClient(`https://crossbar.switchboard.xyz`);

  const contract = new ethers.Contract(contractAddress, ABI, signerWithProvider);

  const { encoded } = await crossbar.fetchEVMResults({
    chainId: chainId,
    aggregatorIds: [await contract.aggregatorId()],
  });

  const tx = await contract.getFeedData(encoded);
  const latestPrice = await contract.latestPrice();

  return {
    transactionHash: tx.hash,
    latestUNIPriceInUSD: latestPrice,
  }
};

const displayMeasurements = async () => {
  const start = performance.now();

  const measurements = await measure().catch((e) => {
    console.error(e);
    process.exit(1);
  });

  const end = performance.now();

  let om = new OracleMeasurement();

  om.LogDateAndTime();
  om.LogDuration(start, end);
  console.log();

  const tx = await om.FetchEthTxnGasStats(rpcURL, measurements.transactionHash);

  om.LogTransactionHash(measurements.transactionHash);
  om.LogNetwork(chainId);
  om.LogEthGasStats(tx.gasUsed, tx.effectiveGasPrice, tx.ethUsed);
  console.log();

  const ethPriceInUSD = await om.FetchETHPriceInUSD(coinmarketcapAPIKey);

  om.LogTotalCostsInETH(tx.ethUsed, ethPriceInUSD);
  om.LogTotalCostsInUSD(tx.ethUsed, ethPriceInUSD);
};

displayMeasurements().catch((e) => {
  console.error(e);
  process.exit(1);
});
