import { CrossbarClient } from "@switchboard-xyz/on-demand";
import * as ethers from "ethers";
import * as fs from "fs";

const chainId = process.env.CHAIN_ID as string;
if (!chainId) {
  throw new Error("Missing CHAIN_ID");
}

const address = process.env.DEPLOYED_CONTRACT_ADDRESS as string;
if (!address) {
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

const provider = new ethers.JsonRpcProvider(rpcURL);

const signerWithProvider = new ethers.Wallet(privateKey, provider);

const ABI = [
  "function getFeedData(bytes[] calldata updates) public payable",
  "function aggregatorId() public view returns (bytes32)",
  "function latestPrice() public view returns (int256)",
];

const crossbar = new CrossbarClient(`https://crossbar.switchboard.xyz`);

const exampleContract = new ethers.Contract(address, ABI, signerWithProvider);

const { encoded } = await crossbar.fetchEVMResults({
  chainId: chainId,
  aggregatorIds: [await exampleContract.aggregatorId()],
});

const tx = await exampleContract.getFeedData(encoded);

console.log(tx);

console.log("Transaction completed!");

console.log("Value stored in contract: ", await exampleContract.latestPrice());
