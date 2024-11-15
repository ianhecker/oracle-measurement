import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const account = privateKeyToAccount(process.env["PRIVATE_KEY"] as any);

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(),
});

export const walletClient = createWalletClient({
	account,
	chain: sepolia,
	transport: http(),
});
