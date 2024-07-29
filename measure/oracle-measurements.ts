interface TxnGasStats {
  gasUsed: number
  effectiveGasPrice: number
  ethUsed: number
}

interface TxnGeneralStats {
  network: string
}

export class OracleMeasurement {

  log(keyValuePairs: string[]) {

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

    this.log(['Date & Time:', mst + ' MST']);
  }

  LogDuration(start: number, end: number) {
    let ms = end - start;

    const minutes = Math.floor(ms / 60000);
    ms %= 60000;

    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor(ms % 1000);

    const time = minutes + "m" + seconds + "." + milliseconds + 's';

    this.log(['Time Elapsed:', time]);
  }

  LogTotalCostsInETH(ethUsed: number, ethPriceInUSD: number) {
    const ethCostInUSD = ethUsed * ethPriceInUSD;

    this.log([
      'Current Mainnet ETH/USD Price:', '$' + ethPriceInUSD.toFixed(2),
      '* ETH Used:', ethUsed.toFixed(10),
      '=', "$" + ethCostInUSD.toFixed(2),
    ]);
  }

  LogTotalCostsInUSD(ethUsed: number, ethPriceInUSD: number) {
    const ethCostInUSD = ethUsed * ethPriceInUSD;

    this.log(['Total Cost in USD:', '$' + ethCostInUSD.toFixed(2)]);
  }

  LogEthGasStats(gasUsed: number, effectiveGasPrice: number, ethUsed: number) {
    this.log(['Gas Used:', gasUsed + ""]);
    this.log(['Gas Price:', effectiveGasPrice + ' Gwei']);
    this.log(['ETH Used:', ethUsed.toFixed(10)]);
  }

  LogTransactionHash(hash: string) {
    this.log(['Transaction Hash:', hash]);
  }

  LogNetwork(chainId: string) {
    this.log(['Network:', this.getNetwork(chainId)])
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
      const effectiveGasPrice = parseInt(effectiveGasPriceHex, 16) / 1000000000;
      const ethUsed = (gasUsed * (effectiveGasPrice / 1000000000));

      return { gasUsed, effectiveGasPrice, ethUsed };

    } catch (error) {
      console.error('Error fetching data:', error);
      return { gasUsed: 0, effectiveGasPrice: 0, ethUsed: 0 };
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
      default: {
        return "unknown chain id";
      }
    }
  }

}
