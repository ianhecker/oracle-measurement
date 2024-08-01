# Temperature Feed

To run data feed:

1. Navigate into the folder

```bash
cd temperature-feed
```

2. Install dependencies

```bash
bun install
```

3. Setup the `.env` file inside of the `temperature-feed` directory, and add your
private key

```bash
cat << EOF > .env
AGGREGATOR_ID = 0x4c31f917ff41cbaad0b018771df374e665982505d3ff9b55b21529aedff5cefe
ALCHEMY_RPC_URL = "https://arb-sepolia.g.alchemy.com/v2/!...API_KEY_HERE...!"
DEPLOYED_CONTRACT_ADDRESS = 0xf07DcdD1f116B2f317EE91a36a540F976ECd4515
CHAIN_ID = 42161
SWITCHBOARD_CONTRACT_ADDRESS = 0xad9b8604b6b97187cde9e826cdeb7033c8c37198
PRIVATE_KEY = 0x!...YOUR_KEY_HERE...!
EOF
```

You can use the existing configuration - but if you wish to deploy a contract,
be sure to update `DEPLOYED_CONTRACT_ADDRESS` with the new address you receive

4. Contract Deployment (OPTIONAL)

	* Hardhat is already configured, and a contract is deployed. To deploy a new
	contract, first, compile the contract

	```bash
	npx hardhat compile
	```

	* To deploy a contract

	```bash
	npx hardhat ignition deploy ./ignition/modules/TemperatureFeed.ts --network arbitrumOne
	```

	* Add your new contract address to the `.env` file

6. To run

```bash
bun run index.ts
```
