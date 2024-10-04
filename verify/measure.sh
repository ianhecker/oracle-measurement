#!/bin/bash

echo "ID,Date UTC,Time (Sec),Ethereum,LINK,Ethereum in USD,LINK in USD" > stork-in.csv

for i in {1..40}
do
	start_time=$(date +%s)
	bun run index.ts >> stork-in.csv
	end_time=$(date +%s)

	duration=$(( end_time - start_time ))
	sleep_time=$(( 120 - duration ))

	if [ $sleep_time -gt 0 ]; then
		sleep $sleep_time
	fi
done
