import axios from "axios";

export const getStockData = async (timeFrame: string = "15min") => {
  try {
    let functionType = "TIME_SERIES_INTRADAY";
    let intervalParam = `&interval=${timeFrame}`;
    if (timeFrame === "daily") {
      functionType = "TIME_SERIES_DAILY";
      intervalParam = "";
    }
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=${functionType}&symbol=IBM${intervalParam}&outputsize=full&apikey=demo`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
};

export const parseAlphaVantageIntraday = (data: any) => {
  const timeSeries =
    data["Time Series (15min)"] ||
    data["Time Series (5min)"] ||
    data["Time Series (1min)"] ||
    data["Time Series (30min)"] ||
    data["Time Series (60min)"] ||
    data["Time Series (Daily)"] ||
    data["Time Series (Daily)"];
  if (!timeSeries) return { candles: [], volumes: [] };

  const candles = [];
  const volumes = [];

  for (const [time, v] of Object.entries(timeSeries)) {
    const values = v as Record<string, string>;
    const unixTime = Math.floor(new Date(time).getTime() / 1000);
    candles.push({
      time: unixTime,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
    });
    volumes.push({
      time: unixTime,
      value: parseFloat(
        values["5. volume"] ||
          values["5. volume"] ||
          values["6. volume"] ||
          values["5. Volume"] ||
          values["volume"] ||
          "0"
      ),
      color:
        parseFloat(values["4. close"]) >= parseFloat(values["1. open"])
          ? "#26a69a"
          : "#ef5350",
    });
  }

  candles.sort((a, b) => (a.time > b.time ? 1 : -1));
  volumes.sort((a, b) => (a.time > b.time ? 1 : -1));

  return { candles, volumes };
};
