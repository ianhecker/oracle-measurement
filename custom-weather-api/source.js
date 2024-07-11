const location = args[0];
const units = args[1];

if (!secrets.apiKey) {
  throw Error(
    "TOMORROW_IO_API_KEY environment variable not set"
  );
}

const url = "https://api.tomorrow.io/v4/weather/realtime";
console.log(`HTTP GET Request to ${url}?location=${location}&units=${units}`);

const tomorrowIORequest = Functions.makeHttpRequest({
  url: `https://api.tomorrow.io/v4/weather/realtime`,
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    location: location,
    units: units,
    apikey: secrets.apiKey,
  },
});

const tomorrowIOResponse = await tomorrowIORequest;
if (tomorrowIOResponse.error) {
  console.error(tomorrowIOResponse.error);
  throw new Error("TomorrowIO Error");
}

const data = tomorrowIOResponse["data"];
if (data.Response === "Error") {
  console.error(data.Message);
  throw Error(`Functional error. Read message: ${data.Message}`);
}

const {
  temperature: temperature,
  windSpeed: windSpeed,
  humidity: humidity,
} = data["data"]["values"];

const result = {
  location: location,
  units: units,
  temperature: temperature,
  windSpeed: windSpeed.toFixed(2),
  humidity: humidity,
};

return Functions.encodeString(JSON.stringify(result));
