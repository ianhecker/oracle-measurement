# Verify

To run data feed:

1. Navigate into the folder

```bash
cd verify
```

2. Install dependencies

```bash
bun install
```

3. Setup the `.env` file inside of the `verify` directory, and add your
private key

```bash
cat << EOF > .env
CHAIN_ID = 17000
DEPLOYED_CONTRACT_ADDRESS =
PRIVATE_KEY = 0x!...YOUR_KEY_HERE...!
RPC_URL = "https://eth-holesky.g.alchemy.com/v2/!...API_KEY...!"
STORK_CONTRACT_ADDRESS = 0xacC0a0cF13571d30B4b8637996F5D6D774d4fd62
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
	npx hardhat ignition deploy ./ignition/modules/deployBlockyVerifier.ts --network holesky
	```

	* Add your new contract address to the `.env` file

6. To run

```bash
bun run index.ts
```
