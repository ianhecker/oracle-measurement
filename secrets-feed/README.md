# Secrets Feed

To run data feed:

1. Navigate into the folder

```bash
cd secrets-feed
```

2. Install dependencies

```bash
bun install
```

3. Setup the `.env` file inside of the `secrets-feed` directory, and add your
private key

```bash
cat << EOF > .env
CHAIN_ID = 42161
PRIVATE_KEY = 0x!...YOUR_KEY_HERE...!
RPC_URL = "https://arb-sepolia.g.alchemy.com/v2/!...API_KEY_HERE...!"
EOF
```

Alternate RPC URLs to Alchemy:
- https://sepolia-rollup.arbitrum.io/rpc
- https://mainnet-rollup.arbitrum.io/rpc

4. To run

```bash
bun run index.ts
```
