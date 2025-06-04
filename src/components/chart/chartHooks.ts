import { useMemo } from "react";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
} from "../../services/indicators";
import type { Candle, IndicatorData, IndicatorInstance } from "./types";

export const useIndicatorData = (
  candles: Candle[],
  indicators: IndicatorInstance[]
): IndicatorData => {
  return useMemo(() => {
    // Process all SMA instances
    const smaInstances = indicators.filter((ind) => ind.type === "sma");
    const sma = smaInstances.map((inst) => ({
      id: inst.id,
      label: inst.label,
      data: calculateSMA(candles, inst.params.period || 14),
    }));

    // Process all EMA instances
    const emaInstances = indicators.filter((ind) => ind.type === "ema");
    const ema = emaInstances.map((inst) => ({
      id: inst.id,
      label: inst.label,
      data: calculateEMA(candles, inst.params.period || 14),
    }));

    // Process all RSI instances
    const rsiInstances = indicators.filter((ind) => ind.type === "rsi");
    const rsi = rsiInstances.map((inst) => ({
      id: inst.id,
      label: inst.label,
      data: calculateRSI(candles, inst.params.period || 14),
    }));

    // Process all MACD instances
    const macdInstances = indicators.filter((ind) => ind.type === "macd");
    const macd = macdInstances.map((inst) => ({
      id: inst.id,
      label: inst.label,
      data: calculateMACD(
        candles,
        inst.params.fastPeriod || 12,
        inst.params.slowPeriod || 26,
        inst.params.signalPeriod || 9
      ),
    }));

    return {
      sma,
      ema,
      rsi,
      macd,
    };
  }, [candles, indicators]);
};
