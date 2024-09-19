#!/bin/bash

set -e

IN=wscat.json
OUT=wscat.data

JSON=$(cat $IN | jq .)

STORK_PUB_KEY=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.public_key')
ID=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.encoded_asset_id')
RECV_TIME=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.timestamped_signature.timestamp')
QUANTIZED_VALUE=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.price')
PUBLISHER_MERKLE_ROOT=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.publisher_merkle_root')
VALUE_COMPUTE_ALG_HASH=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.calculation_alg.checksum')
R=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.timestamped_signature.signature.r')
S=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.timestamped_signature.signature.s')
V=$(echo "$JSON" | jq -r '.data.ETHUSD.stork_signed_price.timestamped_signature.signature.v')

echo "$STORK_PUB_KEY" > $OUT
echo "$ID" >> $OUT
echo "$RECV_TIME" >> $OUT
echo "$QUANTIZED_VALUE" >> $OUT
echo "$PUBLISHER_MERKLE_ROOT" >> $OUT
echo "$VALUE_COMPUTE_ALG_HASH" >> $OUT
echo "$R" >> $OUT
echo "$S" >> $OUT
echo "$V" >> $OUT
