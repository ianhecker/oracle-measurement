import * as ethers from "ethers";

export class OracleMeasurement {

  Log(keyValuePairs: string[]) {

    const GREEN = "\u001b[32m";
    const RESET = "\u001b[0m";

    let str = '';
    for (let i = 0; i < keyValuePairs.length; i += 2) {
      let key = keyValuePairs[i]
      let value = keyValuePairs[i + 1]

      str += GREEN + key + " " + RESET + value + " ";
    }
    console.log(str)
  }

  LogDateAndTime() {
    const now = new Date();
    const mst = now.toLocaleString('en-US', { timeZone: 'America/Denver' })

    this.Log(['Date & Time:', mst + ' MST']);
  }

  computeGasStats(gasUsed: bigint, gasPriceInWei: bigint, ethPriceInUSD: number) {
    const gasPriceInGwei = ethers.formatUnits(gasPriceInWei, "gwei");

    const gasFeeInWei = gasUsed * gasPriceInWei;
    const gasFeeInEther = ethers.formatEther(gasFeeInWei);
    const ethCostInUSD = Number(gasFeeInEther) * ethPriceInUSD;

    return { gasPriceInGwei, gasFeeInEther, ethCostInUSD };
  }

  LogEthGasStats(gasUsed: bigint, gasPriceInWei: bigint, ethPriceInUSD: number) {
    const {
      gasPriceInGwei,
      gasFeeInEther,
      ethCostInUSD,
    } = this.computeGasStats(gasUsed, gasPriceInWei, ethPriceInUSD,);

    const gasFeeInWei = gasUsed * gasPriceInWei;

    this.Log(['Gas Used:', gasUsed.toString()]);
    this.Log(['Gas Price in Gwei:', gasPriceInGwei]);
    this.Log(['Total Gas Fee (Gas * Gas Price) in Gwei:', ethers.formatUnits(gasFeeInWei, "gwei")]);
    this.Log(['Total Gas Fee in Ether:', gasFeeInEther]);
    this.Log(['Current ETH/USD Price:', "$" + ethPriceInUSD]);
    this.Log(['Total Cost in USD:', "$" + ethCostInUSD]);
  }

  computeTxnDuration(start: number, end: number) {
    let ms = end - start;

    const minutes = Math.floor(ms / 60000);
    ms %= 60000;

    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return minutes + "m" + seconds + "." + milliseconds + 's';
  }

  LogTxnDuration(start: number, end: number) {
    const time = this.computeTxnDuration(start, end)

    this.Log(['Txn Duration:', time]);
  }

  LogTransactionHash(hash: string) {
    this.Log(['Transaction Hash:', hash]);
  }

  LogNetwork(chainId: string) {
    this.Log(['Network:', this.getNetwork(chainId)])
  }

  Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  LogCSV(hash: string, date: Date, elapsed: string, gasFeeInEther: string, ethPriceInUSD: number) {
    console.log(`${hash},"${date.toUTCString()}",${elapsed},${gasFeeInEther},0,${ethPriceInUSD},0`);
  }

  async PollForReceipt(url: string, hash: string, retryInterval: number = 500) {
    let receipt = null;
    const provider = new ethers.JsonRpcProvider(url);

    process.stdout.write(`Polling for tx: ${hash}`);
    process.stdout.write("\n");

    while (!receipt) {
      try {
        receipt = await provider.getTransactionReceipt(hash);

        if (!receipt) {
          process.stdout.write(".");
          await this.Sleep(retryInterval);

        } else {
          console.log("\nTransaction mined!\n");
          return receipt
        }
      } catch (error) {
        console.error("\nError fetching transaction receipt:", error);
        await this.Sleep(retryInterval);
      }
    }

    return receipt;
  }

  async FetchETHPriceInUSD(apiKey: string): Promise<number> {
    const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';
    const symbol = 'ETH';
    const convert = 'USD';
    const fullUrl = `${url}?CMC_PRO_API_KEY=${apiKey}&symbol=${symbol}&convert=${convert}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.data.ETH[0].quote.USD.price;

    } catch (error) {
      console.error('Error fetching data:', error);
      return -1;
    }
  }

  getNetwork(chainId: string): string {
    switch (chainId) {
      case "17000": {
        return "Ethereum Holesky"
      }
      default: {
        return "unknown chain id";
      }
    }
  }
}
