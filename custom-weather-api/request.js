const fs = require("fs");
const path = require("path");
const {
  SubscriptionManager,
  SecretsManager,
  ResponseListener,
  ReturnType,
  decodeResult,
  FulfillmentCode,
} = require("@chainlink/functions-toolkit");
const functionsConsumerAbi = require("../abi/functionsClient.json");
const ethers = require("ethers");
const { trace } = require("console");
require("@chainlink/env-enc").config();

const GREEN = "\u001b[32m";
const RESET = "\u001b[0m";

function colorKeyValuePairs(prefixes, values) {
  let printString = '';
  for (let i = 0; i < prefixes.length; i++) {
    printString += GREEN + prefixes[i] + " " + RESET + values[i] + " ";
  }
  return printString;
}

const fmt = colorKeyValuePairs

const consumerAddress = "0x08D51E9C1d854a2c0d793C6e507d5F85b8950040";
const subscriptionId = 3176;
const makeRequestSepolia = async () => {

  console.log('');
  console.log(`This is a modified Chainlink Functions Tutorial that requests from the weather API Tomorrow.io`);
  console.log('');
  console.log('The current weather forecast for Missoula, MT will be fetched');
  console.log('Data will include:\n  + Temperature\n  + Wind Speed\n  + Humidity');
  console.log('');
  console.log(fmt(['Chainlink Functions Tutorial:'], ['\'Using User-hosted Secrets in Requests\'']))
  console.log(fmt(['URL:'], ['https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-offchain']))
  console.log('');

  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const linkTokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
  const donId = "fun-ethereum-sepolia-1";
  const explorerUrl = "https://sepolia.etherscan.io";

  const source = fs
    .readFileSync(path.resolve(__dirname, "source.js"))
    .toString();

  const args = ["Missoula", "imperial"];
  const secrets = { apiKey: process.env.TOMORROW_IO_API_KEY };
  const secretsUrls = [
    "https://chainlink-functions-offchain.s3.amazonaws.com/tomorrow-io.json",
  ]; const gasLimit = 300000;

  const privateKey = process.env.PRIVATE_KEY; if (!privateKey)
    throw new Error(
      "private key not provided - check your environment variables"
    );

  const rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL;
  if (!rpcUrl)
    throw new Error(`rpcUrl not provided  - check your environment variables`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);
  console.log("Estimate request costs...");
  const subscriptionManager = new SubscriptionManager({
    signer: signer,
    linkTokenAddress: linkTokenAddress,
    functionsRouterAddress: routerAddress,
  });
  await subscriptionManager.initialize();


  const gasPriceWei = await signer.getGasPrice();
  const estimatedCostInJuels =
    await subscriptionManager.estimateFunctionsRequestCost({
      donId: donId, subscriptionId: subscriptionId, callbackGasLimit: gasLimit, gasPriceWei: BigInt(gasPriceWei),
    });

  console.log(`Fulfillment cost estimated to ${ethers.utils.formatEther(estimatedCostInJuels)} LINK`);
  console.log('');
  console.log("Making request...");
  console.log('');

  const secretsManager = new SecretsManager({
    signer: signer,
    functionsRouterAddress: routerAddress,
    donId: donId,
  });
  await secretsManager.initialize();


  console.log(`Encrypt the URLs..`);
  console.log('');
  const encryptedSecretsUrls = await secretsManager.encryptSecretsUrls(secretsUrls);

  const functionsConsumer = new ethers.Contract(
    consumerAddress,
    functionsConsumerAbi,
    signer
  );

  const transaction = await functionsConsumer.sendRequest(
    source, encryptedSecretsUrls, 0, 0, args,
    [], subscriptionId,
    gasLimit,
    ethers.utils.formatBytes32String(donId));

  console.log(`Functions request sent! Transaction hash ${transaction.hash}. Waiting for a response...`);
  console.log(`See your request in the explorer ${explorerUrl}/tx/${transaction.hash}`);
  console.log('');

  let linkCost = 0;
  let response;

  const responseListener = new ResponseListener({
    provider: provider,
    functionsRouterAddress: routerAddress,
  }); try {
    response = await new Promise((resolve, reject) => {
      responseListener
        .listenForResponseFromTransaction(transaction.hash)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });

    const fulfillmentCode = response.fulfillmentCode;

    if (fulfillmentCode === FulfillmentCode.FULFILLED) {
      console.log(`Request ${response.requestId} successfully fulfilled`);
      console.log(`Cost is ${ethers.utils.formatEther(response.totalCostInJuels)} LINK`);
      console.log(`Complete reponse: ${response}`);
      console.log('');

    } else if (fulfillmentCode === FulfillmentCode.USER_CALLBACK_ERROR) {
      console.log(`Request ${response.requestId} fulfilled. However, the consumer contract callback failed. Cost is ${ethers.utils.formatEther(response.totalCostInJuels)} LINK.Complete reponse: `, response);

    } else {
      console.log(`Request ${response.requestId} not fulfilled. Code: ${fulfillmentCode}. Cost is ${ethers.utils.formatEther(response.totalCostInJuels)} LINK.Complete reponse: `, response);
    }

    const errorString = response.errorString;
    if (errorString) {
      console.log(`\nError during the execution: `, errorString);

    } else {

      const responseBytesHexstring = response.responseBytesHexstring;
      if (ethers.utils.arrayify(responseBytesHexstring).length > 0) {

        const decodedResponse = decodeResult(response.responseBytesHexstring, ReturnType.string);
        console.log(fmt(['Decoded response from Weather API:'], [decodedResponse]));
        console.log('');
      }
    }
  } catch (error) {
    console.error("Error listening for response:", error);
  }

  return {
    transactionHash: transaction.hash,
    linkCost: ethers.utils.formatEther(response.totalCostInJuels)
  }
};

const makeRequestAndOutput = async () => {
  const start = performance.now();

  const results = await makeRequestSepolia().catch((e) => {
    console.error(e);
    process.exit(1);
  });

  const end = performance.now();

  let ms = end - start;
  const minutes = Math.floor(ms / 60000);
  ms %= 60000;
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor(ms % 1000);

  const now = new Date();
  console.log(fmt(['Time:'], [now.toLocaleString('en-US', { timeZone: 'America/Denver' }) + ' MST']))
  console.log(fmt(['Chainlink Functions Time Elapsed:'], [minutes + "m" + seconds + "." + milliseconds + 's']));
  console.log('');

  console.log(fmt(['Fetching Ethereum Transaction via:', '&'], ['https://eth-sepolia.g.alchemy.com/v2', 'eth_getTransactionReceipt']));
  const txResponse = await fetchEthereumTransaction(results.transactionHash);
  const gasUsed = txResponse.gasUsed;
  const effectiveGasPrice = txResponse.effectiveGasPrice;
  const ethUsed = txResponse.ethUsed;

  console.log(fmt(['Fetching the latest ETH/USD Price Quote via'], ['https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest']));
  const ethPriceInUSD = await fetchETHPriceInUSD();
  const ethCostInUSD = ethPriceInUSD * ethUsed;

  console.log(fmt(['Fetching the latest LINK/USD Price Quote via'], ['https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest']));
  console.log('');
  const linkPriceInUSD = await fetchLINKPriceInUSD();
  const linkUsed = results.linkCost;
  const linkCostInUSD = linkUsed * linkPriceInUSD;

  const totalCostInUSD = ethCostInUSD + linkCostInUSD;

  console.log(fmt(['Ethereum Txn Hash:'], ['0xb8e790fb809ebf0f22941eda1a67728f1f9ee5dc843bd87db03f3d7ba60833f6']))
  console.log(fmt(['Ethereum Network:'], ["Sepolia"]))
  console.log(fmt(['Gas Used:'], [gasUsed]))
  console.log(fmt(['Gas Price:'], [effectiveGasPrice + ' Gwei']))
  console.log(fmt(['ETH Used:'], [ethUsed.toFixed(10)]))
  console.log(fmt(['LINK Used:'], [linkUsed]))
  console.log('')

  console.log(fmt(['Current Mainnet ETH/USD Price:', '* ETH Used:', '='], ['$' + ethPriceInUSD.toFixed(2), ethUsed.toFixed(10), "$" + ethCostInUSD.toFixed(2)]))
  console.log(fmt(['Current LINK/USD Price:', '* LINK Used:', '='], ['$' + linkPriceInUSD.toFixed(2), linkUsed, '$' + linkCostInUSD.toFixed(2)]))
  console.log('')

  console.log(fmt(['Total Cost in USD:', '+', '='], ['$' + ethCostInUSD.toFixed(2), '$' + linkCostInUSD.toFixed(2), '$' + totalCostInUSD.toFixed(2)]))
  console.log('')
}

makeRequestAndOutput().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function fetchEthereumTransaction(hash) {
  const url = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const gasUsedHex = data.result.gasUsed;
    const effectiveGasPriceHex = data.result.effectiveGasPrice;

    const gasUsed = parseInt(gasUsedHex, 16);
    const effectiveGasPrice = parseInt(effectiveGasPriceHex, 16) / 1000000000;
    const ethUsed = (gasUsed * (effectiveGasPrice / 1000000000));

    const results = {
      gasUsed: gasUsed,
      effectiveGasPrice: effectiveGasPrice,
      ethUsed: ethUsed
    };

    return results;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchETHPriceInUSD() {
  const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';
  const symbol = 'ETH';
  const convert = 'USD';
  const apiKey = process.env.COINMARKETCAP_API_KEY;
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

    const ethPriceInUsd = data.data.ETH[0].quote.USD.price;
    return ethPriceInUsd;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function fetchLINKPriceInUSD() {
  const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';
  const symbol = 'LINK';
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  const fullUrl = `${url}?CMC_PRO_API_KEY=${apiKey}&symbol=${symbol}`;

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

    const ethPriceInUsd = data.data.LINK[0].quote.USD.price;
    return ethPriceInUsd;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
