# Measure

To run a measurement:

1. Navigate into the folder

```bash
cd measure
```

2. Install dependencies

```bash
bun install
```

3. Setup the `.env` file inside of the `measure` directory, and add your
private key

```bash
cat << EOF > .env
CHAIN_ID = 421614
COINMARKETCAP_API_KEY = "!...API_KEY_HERE...!"
DEPLOYED_CONTRACT_ADDRESS = 0x42E12a6945ab87C3AEeE1601cE9c40da5D43D92A
PRIVATE_KEY = 0x!...YOUR_KEY_HERE...!
RPC_URL = "https://arb-sepolia.g.alchemy.com/v2/!...API_KEY_HERE...!"
EOF
```

Alternate RPC URLs to Alchemy:
- https://sepolia-rollup.arbitrum.io/rpc
- https://mainnet-rollup.arbitrum.io/rpc

You can use the existing configuration - but if you wish to deploy a contract,
be sure to update `BASIC_FEED_CONTRACT_ADDRESS` with the new address you receive

4. To run

```bash
bun run index.ts
```
