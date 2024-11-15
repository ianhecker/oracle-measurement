# Pyth

This folder covers the code from:
- https://docs.pyth.network/price-feeds/create-your-first-pyth-app/evm/part-1
- https://docs.pyth.network/price-feeds/create-your-first-pyth-app/evm/part-2

> Note - you do not have to deploy a smart contract. If you want to use a
contract that is already deployed, skip the H2 "Deploy Contract" and proceed
with the H2 "Price Feed" - and export an existing DEPLOYED_ADDRESS

## Setup

Install forge
```bash
curl -L https://foundry.paradigm.xyz | bash
```

```bash
cd contract/
```

Install dependencies
```bash
bun init
bun install @pythnetwork/pyth-sdk-solidity
```

```bash
echo '@pythnetwork/pyth-sdk-solidity/=node_modules/@pythnetwork/pyth-sdk-solidity' > remappings.txt
```

## Create Contract

Compile contract
```bash
forge build
```

Run contract test
```bash
forge test -vvv
```

## ENV Variables

Export your wallet address and private key

```bash
export ADDRESS=0x...
export PRIVATE_KEY=0x...
export ETH_USD_ID=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
```

### Choose Deployment Network

Ethereum Sepolia
```bash
export RPC_URL="https://sepolia.drpc.org"
export PYTH_CONTRACT_ADDRESS=0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
```

Base Mainnet
```bash
export RPC_URL="https://mainnet.base.org"
export PYTH_CONTRACT_ADDRESS=0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a
```

## Deploy Contract

This will deploy a smart contract, and output info
```bash
forge create src/MyFirstPythContract.sol:MyFirstPythContract \
--private-key $PRIVATE_KEY \
--rpc-url $RPC_URL \
--constructor-args $PYTH_CONTRACT_ADDRESS $ETH_USD_ID
```

Grab the deployment address:
```bash
Deployed to: 0x...
```

... And export it:
```bash
export DEPLOYMENT_ADDRESS=
```

## Price Feed

You can either use the address of a newly deployed contract, or export an
existing contract's address

### Deployed - Ethereum Sepolia

```bash
export RPC_URL="https://sepolia.drpc.org"
export DEPLOYMENT_ADDRESS=0xaD1d4B4f78c9398845aa9dA86be191954429E851
export PYTH_CONTRACT_ADDRESS=0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
```

### Deployed - Base Mainnet

```bash
export RPC_URL="https://mainnet.base.org"
export DEPLOYMENT_ADDRESS=
export PYTH_CONTRACT_ADDRESS=0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a
```

### Fetch Price Feed

Fetch a price feed
```bash
curl -s "https://hermes.pyth.network/v2/updates/price/latest?&ids[]=$ETH_USD_ID" |\
	jq -r ".binary.data[0]" > price_update.txt
```

Check the contents
```bash
cat price_update.txt
```

### Push Price Feed

Using the cast tool from Foundry, invoke the smart contract and send the price
```bash
cast send \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL \
  --json \
  --value 0.0005ether \
  $DEPLOYMENT_ADDRESS \
  "updateAndMint(bytes[])" \
  [0x`cat price_update.txt`] | jq .
```

You've now pushed the feed, and logged it to chain!

## Fetch Price Feed from Contract

An alternate way to interact with the smart contract

### Configure Chain

Edit the chain import in `/app/src/client.ts` to the correct chain
```typescript
// import { sepolia as chain } from "viem/chains";
import { base as chain } from "viem/chains";
// import { myNework as chain } from "viem/chains";
```

### Run App

```bash
cd .. && cd app/
bun run src/mintNft.ts
```

You've now pushed the feed, and logged it to chain!
