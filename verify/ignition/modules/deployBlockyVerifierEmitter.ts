import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const STORK_CONTRACT_ADDRESS = process.env.STORK_CONTRACT_ADDRESS;
if (!STORK_CONTRACT_ADDRESS) {
  throw new Error("Missing STORK_CONTRACT_ADDRESS");
}

export default buildModule("BlockyVerifierModule", (m) => {
  const out = m.contract("BlockyVerifierEmitter", [STORK_CONTRACT_ADDRESS]);

  return { out };
});
