import { CrossbarClient } from "@switchboard-xyz/on-demand";
import * as ethers from "ethers";

import * as envEnc from "@chainlink/env-enc";
envEnc.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
	throw new Error("Missing PRIVATE_KEY");
}

const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");

const signerWithProvider = new ethers.Wallet(privateKey, provider);

const exampleAddress = "0x4ED8171dB9eC85ee785e34AFBeFcAB539dbE2790";

const abi = [
	"function getFeedData(bytes[] calldata updates) public payable",
	"function aggregatorId() public view returns (bytes32)",
];

const crossbar = new CrossbarClient(`https://crossbar.switchboard.xyz`);

const exampleContract = new ethers.Contract(
	exampleAddress,
	abi,
	signerWithProvider
);

const { encoded } = await crossbar.fetchEVMResults({
	chainId: 421614,
	aggregatorIds: [await exampleContract.aggregatorId()],
});

const tx = await exampleContract.getFeedData(encoded);

console.log(tx);

console.log("Transaction completed!");
