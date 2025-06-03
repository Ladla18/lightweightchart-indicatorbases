// Utility functions for calculating indicators from candle data

type Candle = { time: number; close: number };

export function calculateSMA(candles: Candle[], period = 14) {
  const result: { time: number; value: number }[] = [];
  if (candles.length < period) return result;

  // Create result array with same length as candles, filled with null initially
  const values: (number | null)[] = new Array(candles.length).fill(null);

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc: number, c: Candle) => acc + c.close, 0);
    const value = sum / period;
    if (!isNaN(value) && isFinite(value)) {
      values[i] = value;
    }
  }

  // Convert to result format, only including non-null values
  for (let i = 0; i < candles.length; i++) {
    if (values[i] !== null) {
      result.push({ time: candles[i].time, value: values[i]! });
    }
  }

  return result;
}

export function calculateEMA(candles: Candle[], period = 14) {
  const result: { time: number; value: number }[] = [];
  if (candles.length < period) return result;

  const values: (number | null)[] = new Array(candles.length).fill(null);
  let emaPrev = candles[0]?.close;
  const k = 2 / (period + 1);

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;
    if (i === 0) {
      emaPrev = close;
      continue;
    }
    emaPrev = close * k + emaPrev * (1 - k);
    if (i >= period - 1 && !isNaN(emaPrev) && isFinite(emaPrev)) {
      values[i] = emaPrev;
    }
  }

  // Convert to result format, only including non-null values
  for (let i = 0; i < candles.length; i++) {
    if (values[i] !== null) {
      result.push({ time: candles[i].time, value: values[i]! });
    }
  }

  return result;
}

export function calculateRSI(candles: Candle[], period = 14) {
  const result: {
    time: number;
    value: number;
    avgGain?: number;
    avgLoss?: number;
  }[] = [];
  if (candles.length < period + 1) return result;

  const values: (number | null)[] = new Array(candles.length).fill(null);
  let gains = 0;
  let losses = 0;
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;

    if (i <= period) {
      if (change > 0) gains += change;
      else losses -= change;
      if (i === period) {
        avgGain = gains / period;
        avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
        if (!isNaN(rsi) && isFinite(rsi)) {
          values[i] = Math.max(0, Math.min(100, rsi));
        }
      }
      continue;
    }

    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    if (!isNaN(rsi) && isFinite(rsi)) {
      values[i] = Math.max(0, Math.min(100, rsi));
    }
  }

  // Convert to result format, only including non-null values
  for (let i = 0; i < candles.length; i++) {
    if (values[i] !== null) {
      result.push({ time: candles[i].time, value: values[i]! });
    }
  }

  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  if (candles.length < slowPeriod)
    return { macd: [], signal: [], histogram: [] };

  const emaFast = calculateEMA(candles, fastPeriod);
  const emaSlow = calculateEMA(candles, slowPeriod);

  // Create time-aligned MACD values
  const macdValues: (number | null)[] = new Array(candles.length).fill(null);

  // Create lookup maps for fast EMA and slow EMA by time
  const emaFastMap = new Map(emaFast.map((item) => [item.time, item.value]));
  const emaSlowMap = new Map(emaSlow.map((item) => [item.time, item.value]));

  // Calculate MACD aligned with original candle times
  for (let i = 0; i < candles.length; i++) {
    const time = candles[i].time;
    const fastValue = emaFastMap.get(time);
    const slowValue = emaSlowMap.get(time);

    if (fastValue !== undefined && slowValue !== undefined) {
      const macdValue = fastValue - slowValue;
      if (!isNaN(macdValue) && isFinite(macdValue)) {
        macdValues[i] = macdValue;
      }
    }
  }

  // Convert MACD values to format suitable for EMA calculation
  const macdForSignal = candles
    .map((candle, i) => ({
      time: candle.time,
      close: macdValues[i] ?? 0,
    }))
    .filter((_, i) => macdValues[i] !== null);

  const signal = calculateEMA(macdForSignal, signalPeriod);
  const signalMap = new Map(signal.map((item) => [item.time, item.value]));

  // Create final aligned results
  const macd: { time: number; value: number }[] = [];
  const signalResult: { time: number; value: number }[] = [];
  const histogram: { time: number; value: number }[] = [];

  for (let i = 0; i < candles.length; i++) {
    const time = candles[i].time;
    const macdValue = macdValues[i];
    const signalValue = signalMap.get(time);

    if (macdValue !== null) {
      macd.push({ time, value: macdValue });

      if (signalValue !== undefined) {
        signalResult.push({ time, value: signalValue });
        const histValue = macdValue - signalValue;
        if (!isNaN(histValue) && isFinite(histValue)) {
          histogram.push({ time, value: histValue });
        }
      }
    }
  }

  return {
    macd: macd.filter((m) => !isNaN(m.value) && isFinite(m.value)),
    signal: signalResult.filter((s) => !isNaN(s.value) && isFinite(s.value)),
    histogram: histogram.filter((h) => !isNaN(h.value) && isFinite(h.value)),
  };
}
