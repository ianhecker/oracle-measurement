import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("No private key provided");
}

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
if (!ALCHEMY_RPC_URL) {
  throw new Error("No api key provided");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arbitrumOne: {
      url: ALCHEMY_RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  }
};

export default config;
