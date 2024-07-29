# Basic Feed

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
AGGREGATOR_ID = 0x755c0da00f939b04266f3ba3619ad6498fb936a8bfbfac27c9ecd4ab4c5d4878
ALCHEMY_RPC_URL = "https://arb-sepolia.g.alchemy.com/v2/!...API_KEY_HERE...!"
BASIC_FEED_CONTRACT_ADDRESS = 0x42E12a6945ab87C3AEeE1601cE9c40da5D43D92A
CHAIN_ID = 421614
SWITCHBOARD_CONTRACT_ADDRESS = 0xa2a0425fa3c5669d384f4e6c8068dfcf64485b3b
PRIVATE_KEY = 0x!...YOUR_KEY_HERE...!
EOF
```

You can use the existing configuration - but if you wish to deploy a contract,
be sure to update `BASIC_FEED_CONTRACT_ADDRESS` with the new address you receive

4. To run

```bash
bun run index.ts
```
