# Pyth - Contract

This folder covers the code from:
- https://docs.pyth.network/price-feeds/create-your-first-pyth-app/evm/part-1

## Setup

Install dependencies
```bash
bun init
bun install @pythnetwork/pyth-sdk-solidity
```

```bash
echo '@pythnetwork/pyth-sdk-solidity/=node_modules/@pythnetwork/pyth-sdk-solidity' > remappings.txt
```

Compile contract
```bash
forge build
```

Run contract test
```bash
forge test -vvv
```
