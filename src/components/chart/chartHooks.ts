import { useMemo } from "react";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
} from "../../services/indicators";
import type { Candle, IndicatorData } from "./types";

export const useIndicatorData = (
  candles: Candle[],
  indicators: string[]
): IndicatorData => {
  return useMemo(() => {
    const sma = indicators.includes("sma") ? calculateSMA(candles, 14) : [];
    const ema = indicators.includes("ema") ? calculateEMA(candles, 14) : [];
    const rsi = indicators.includes("rsi") ? calculateRSI(candles, 14) : [];
    const macd = indicators.includes("macd") ? calculateMACD(candles) : null;

    return {
      sma,
      ema,
      rsi,
      macd,
    };
  }, [candles, indicators]);
};
