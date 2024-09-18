import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const STORK_CONTRACT_ADDRESS = process.env.STORK_CONTRACT_ADDRESS;
if (!STORK_CONTRACT_ADDRESS) {
  throw new Error("Missing STORK_CONTRACT_ADDRESS");
}

export default buildModule("VerifyModule", (m) => {
  const verify = m.contract("Verify", [STORK_CONTRACT_ADDRESS]);

  return { verify };
});
