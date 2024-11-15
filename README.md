# Oracle Measurement

```bash
export ADDRESS=0x...
export PRIVATE_KEY=0x...
export RPC_URL="https://eth-sepolia.g.alchemy.com/v2/xuUD3HEU2pd1ZRYqZ_9gVMN3WxukmJR5"
export PYTH_ETH_SEPOLIA_ADDRESS=0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
export ETH_USD_ID=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
```

```bash
forge create src/MyFirstPythContract.sol:MyFirstPythContract \
--private-key $PRIVATE_KEY \
--rpc-url $RPC_URL \
--constructor-args $PYTH_ETH_SEPOLIA_ADDRESS $ETH_USD_ID
```

```bash
export DEPLOYMENT_ADDRESS=0x...
```

```bash
curl -s "https://hermes.pyth.network/v2/updates/price/latest?&ids[]=$ETH_USD_ID" | jq -r ".binary.data[0]" > price_update.txt
```

```bash
cast send \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL \
  --json \
  --value 0.0005ether \
  $DEPLOYMENT_ADDRESS \
  "updateAndMint(bytes[])" \
  [0x`cat price_update.txt`]
```
