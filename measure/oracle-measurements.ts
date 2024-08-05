interface TxnGasStats {
  gasUsed: number
  gasFeeInGwei: number
  ethUsed: number
}

interface TxnGeneralStats {
  network: string
}

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

  LogTxnDuration(start: number, end: number) {
    let ms = end - start;

    const minutes = Math.floor(ms / 60000);
    ms %= 60000;

    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);

    const time = minutes + "m" + seconds + "." + milliseconds + 's';

    this.Log(['Txn Duration:', time]);
  }

  LogTotalCostsInETH(ethUsed: number, ethPriceInUSD: number) {
    const ethCostInUSD = ethUsed * ethPriceInUSD;

    this.Log([
      'Current Mainnet ETH/USD Price:', '$' + ethPriceInUSD.toFixed(2),
      '* ETH Used:', ethUsed.toFixed(10),
      '=', "$" + ethCostInUSD.toFixed(4),
    ]);
  }

  LogTotalCostsInUSD(ethUsed: number, ethPriceInUSD: number) {
    const ethCostInUSD = ethUsed * ethPriceInUSD;

    this.Log(['Total Cost in USD:', '$' + ethCostInUSD.toFixed(4)]);
  }

  LogEthGasStats(gasUsed: number, gasFeeInGwei: number, ethUsed: number) {
    this.Log(['Gas Used:', gasUsed + ""]);
    this.Log(['Gas Price:', gasFeeInGwei + ' Gwei']);
    this.Log(['ETH Used:', ethUsed.toFixed(10)]);
  }

  LogTransactionHash(hash: string) {
    this.Log(['Transaction Hash:', hash]);
  }

  LogNetwork(chainId: string) {
    this.Log(['Network:', this.getNetwork(chainId)])
  }

  LogUNIPriceInUSD(n: bigint) {
    const divisor = BigInt(1000000000000000000)
    const USD = Number(n * 100n / divisor) / 100
    this.Log(['UNI/USD Price:', "$" + USD])
  }

  LogTemperature(n: bigint) {
    const divisor = BigInt(1000000000000000000)
    const temperature = Number(n * 100n / divisor) / 100
    this.Log(['Temperature', temperature + " Farenheit"])
  }

  async FetchEthTxnGasStats(url: string, hash: string): Promise<TxnGasStats> {
    const body = {
      id: 1,
      jsonrpc: '2.0',
      method: `eth_getTransactionReceipt`,
      params: [hash]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} `);
      }

      const data = await response.json();

      const gasUsedHex = data.result.gasUsed;
      const effectiveGasPriceHex = data.result.effectiveGasPrice;

      const gasUsed = parseInt(gasUsedHex, 16);
      const gasFeeInGwei = parseInt(effectiveGasPriceHex, 16) / 1000000000;
      const ethUsed = (gasUsed * (gasFeeInGwei / 1000000000));

      return { gasUsed, gasFeeInGwei, ethUsed };

    } catch (error) {
      console.error('Error fetching data:', error);
      return { gasUsed: 0, gasFeeInGwei: 0, ethUsed: 0 };
    }
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
      case "421614": {
        return "Arbitrum Sepolia"
      }
      case "42161": {
        return "Arbitrum One"
      }
      default: {
        return "unknown chain id";
      }
    }
  }
}
