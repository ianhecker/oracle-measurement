import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from "viem/accounts";
// import { sepolia as chain } from "viem/chains";
import { base as chain } from "viem/chains";
// import { myNework as chain } from "viem/chains";

const account = privateKeyToAccount(process.env["PRIVATE_KEY"] as any);

export const publicClient = createPublicClient({
	chain: chain,
	transport: http(),
});

export const walletClient = createWalletClient({
	account,
	chain: chain,
	transport: http(),
});
