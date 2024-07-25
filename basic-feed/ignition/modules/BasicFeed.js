import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SWITCHBOARD_CONTRACT_ADDRESS = process.env.SWITCHBOARD_CONTRACT_ADDRESS;
if (!SWITCHBOARD_CONTRACT_ADDRESS) {
  throw new Error("Missing SWITCHBOARD_CONTRACT_ADDRESS");
}

const AGGREGATOR_ID = process.env.AGGREGATOR_ID;
if (!AGGREGATOR_ID) {
  throw new Error("Missing AGGREGATOR_ID");
}

export default buildModule("BasicFeedModule", (m) => {
  const basicFeed = m.contract("BasicFeed", [SWITCHBOARD_CONTRACT_ADDRESS, AGGREGATOR_ID]);

  return { basicFeed };
});
