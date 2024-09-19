import * as ethers from "ethers";
import * as fs from "fs";
import { OracleMeasurement } from "./oracle-measurements";

const chainId = process.env.CHAIN_ID as string;
if (!chainId) {
  throw new Error("Missing CHAIN_ID");
}

const coinmarketcapAPIKey = process.env.COINMARKETCAP_API_KEY as string;
if (!coinmarketcapAPIKey) {
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

const transact = async () => {

  const provider = new ethers.JsonRpcProvider(rpcURL);

  const signerWithProvider = new ethers.Wallet(privateKey, provider);

  const ABI = [
    "function verifyStorkSignatureV1(address storkPubKey, bytes32 id, uint256 recvTime, int256 quantizedValue, bytes32 publisherMerkleRoot, bytes32 valueComputeAlgHash, bytes32 r, bytes32 s, uint8 v) public returns (bool)",
    "event Verified(bool verified)",
  ];

  const contract = new ethers.Contract(address, ABI, signerWithProvider);

  const data = fs.readFileSync('wscat.data', 'utf8');

  const line = data.split('\n');

  const STORK_PUB_KEY = line[0];
  const ID = line[1];
  const RECV_TIME = line[2];
  const QUANTIZED_VALUE = line[3];
  const PUBLISHER_MERKLE_ROOT = line[4];
  const VALUE_COMPUTE_ALG_HASH = "0x" + line[5];
  const R = line[6];
  const S = line[7];
  const V = line[8];

  let om = new OracleMeasurement();
  const ethPriceInUSD = await om.FetchETHPriceInUSD(coinmarketcapAPIKey);

  const tx = await contract.verifyStorkSignatureV1(
    STORK_PUB_KEY,
    ID,
    RECV_TIME,
    QUANTIZED_VALUE,
    PUBLISHER_MERKLE_ROOT,
    VALUE_COMPUTE_ALG_HASH,
    R,
    S,
    V,
  );

  return {
    transactionHash: tx.hash,
    ethPriceInUSD: ethPriceInUSD,
  }
}

const displayMeasurements = async () => {
  const start = performance.now();

  const results = await transact().catch((e) => {
    console.error(e);
    process.exit(1);
  });

  const end = performance.now();

  let om = new OracleMeasurement();

  const receipt = await om.PollForReceipt(rpcURL, results.transactionHash);

  if (!receipt) {
    console.error("Transaction receipt not found.");
    return;
  }

  om.Log(['Oracle:', 'Stork Verifier Contract - logged On-Chain w/ Custom Smart Contract']);
  om.Log(['Contract Address:', address]);
  om.LogNetwork(chainId);
  console.log();

  om.LogDateAndTime();
  om.LogTxnDuration(start, end);
  console.log();

  om.LogTransactionHash(results.transactionHash);
  om.LogEthGasStats(receipt.gasUsed, receipt.gasPrice, results.ethPriceInUSD);
};

displayMeasurements().catch((e) => {
  console.error(e);
  process.exit(1);
});
