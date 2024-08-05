import { OracleMeasurement } from "./oracle-measurements";

import { CrossbarClient } from "@switchboard-xyz/on-demand";
import * as ethers from "ethers";
import * as fs from "fs";

const chainId = process.env.CHAIN_ID as string;
if (!chainId) {
  throw new Error("Missing CHAIN_ID");
}

const coinmarketcapAPIKey = process.env.COINMARKETCAP_API_KEY as string;
if (!coinmarketcapAPIKey) {
  throw new Error("Missing CHAIN_ID");
}

const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS as string;
if (!contractAddress) {
  throw new Error("Missing DEPLOYED_CONTRACT_ADDRESS");
}

const privateKey = process.env.PRIVATE_KEY as string;
if (!privateKey) {
  throw new Error("Missing PRIVATE_KEY");
}

const rpcURL = process.env.RPC_URL as string;
if (!rpcURL) {
  throw new Error("Missing RPC_URL");
}

const measure = async () => {
  const provider = new ethers.JsonRpcProvider(rpcURL);

  const signerWithProvider = new ethers.Wallet(privateKey, provider);

  const ABI = [
    "function getFeedData(bytes[] calldata updates) public payable",
    "function aggregatorId() public view returns (bytes32)",
    "function latestTemperature() public view returns (int256)",
  ];

  const crossbar = new CrossbarClient(`https://crossbar.switchboard.xyz`);

  const contract = new ethers.Contract(contractAddress, ABI, signerWithProvider);

  const aggregatorId = await contract.aggregatorId()

  const { encoded } = await crossbar.fetchEVMResults({
    chainId: chainId,
    aggregatorIds: [aggregatorId],
  });

  const tx = await contract.getFeedData(encoded);
  const latestTemperature = await contract.latestTemperature();

  return {
    transactionHash: tx.hash,
    latestTemperature: latestTemperature,
    aggregatorId: aggregatorId
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

  om.Log(['Oracle:', 'Switchboard Data Feed logged On-Chain w/ Smart Contract']);
  om.Log(['Data Feed:', 'Current UNI/USD Price']);
  om.Log(['Contract Address:', contractAddress]);
  om.Log(['Aggregator Feed ID:', measurements.aggregatorId]);
  om.LogNetwork(chainId);
  console.log();

  om.LogDateAndTime();
  om.LogTxnDuration(start, end);
  console.log();

  const tx = await om.FetchEthTxnGasStats(rpcURL, measurements.transactionHash);

  om.LogTransactionHash(measurements.transactionHash);
  om.LogEthGasStats(tx.gasUsed, tx.gasFeeInGwei, tx.ethUsed);
  console.log();

  om.Log(['On-Chain data:', 'Latest Missoula, MT Temperature'])
  om.LogTemperature(measurements.latestTemperature);
  console.log();

  const ethPriceInUSD = await om.FetchETHPriceInUSD(coinmarketcapAPIKey);

  om.LogTotalCostsInETH(tx.ethUsed, ethPriceInUSD);
  om.LogTotalCostsInUSD(tx.ethUsed, ethPriceInUSD);
};

displayMeasurements().catch((e) => {
  console.error(e);
  process.exit(1);
});
