import { useState, useCallback, useEffect } from "react";
import type { MouseEventParams } from "lightweight-charts";
import type { TooltipData } from "./tooltipTypes";
import type { IndicatorData, Candle, Volume } from "./types";

export const useChartTooltip = (
  indicatorData: IndicatorData,
  candles: Candle[],
  volumes: Volume[]
) => {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Function to get latest data
  const getLatestData = useCallback(() => {
    if (candles.length === 0) return null;

    const latestCandle = candles[candles.length - 1];
    const latestVolume = volumes[volumes.length - 1];
    const latestTime = latestCandle.time;

    const findDataAtTime = (
      data: Array<{ time: number; value: number }>,
      targetTime: number
    ) => {
      return data.find((item) => item.time === targetTime)?.value;
    };

    const findMacdDataAtTime = (
      macdData: IndicatorData["macd"],
      targetTime: number
    ) => {
      if (!macdData) return undefined;

      const macd = macdData.macd.find(
        (item) => item.time === targetTime
      )?.value;
      const signal = macdData.signal.find(
        (item) => item.time === targetTime
      )?.value;
      const histogram = macdData.histogram.find(
        (item) => item.time === targetTime
      )?.value;

      if (
        macd !== undefined &&
        signal !== undefined &&
        histogram !== undefined
      ) {
        return { macd, signal, histogram };
      }
      return undefined;
    };

    return {
      time: new Date(latestTime * 1000).toISOString(),
      candle: {
        open: latestCandle.open,
        high: latestCandle.high,
        low: latestCandle.low,
        close: latestCandle.close,
      },
      volume: latestVolume?.value,
      sma: findDataAtTime(indicatorData.sma, latestTime),
      ema: findDataAtTime(indicatorData.ema, latestTime),
      rsi: findDataAtTime(indicatorData.rsi, latestTime),
      macd: findMacdDataAtTime(indicatorData.macd, latestTime),
    };
  }, [candles, volumes, indicatorData]);

  // Set initial data when component mounts or data changes
  useEffect(() => {
    if (!isHovering) {
      setTooltipData(getLatestData());
    }
  }, [getLatestData, isHovering]);

  const handleCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      setIsHovering(true);

      if (!param.time) {
        setTooltipData(getLatestData());
        return;
      }

      // Find data at the current time
      const time = param.time;
      const timeStr =
        typeof time === "number"
          ? new Date(time * 1000).toISOString()
          : time.toString();

      // Extract candlestick data
      const candleData = param.seriesData?.get(
        param.seriesData.keys().next().value
      );

      // Find indicator data at this time point
      const findDataAtTime = (
        data: Array<{ time: number; value: number }>,
        targetTime: any
      ) => {
        return data.find((item) => item.time === targetTime)?.value;
      };

      const findMacdDataAtTime = (
        macdData: IndicatorData["macd"],
        targetTime: any
      ) => {
        if (!macdData) return undefined;

        const macd = macdData.macd.find(
          (item) => item.time === targetTime
        )?.value;
        const signal = macdData.signal.find(
          (item) => item.time === targetTime
        )?.value;
        const histogram = macdData.histogram.find(
          (item) => item.time === targetTime
        )?.value;

        if (
          macd !== undefined &&
          signal !== undefined &&
          histogram !== undefined
        ) {
          return { macd, signal, histogram };
        }
        return undefined;
      };

      const tooltipData: TooltipData = {
        time: timeStr,
        candle:
          candleData && "open" in candleData
            ? {
                open: candleData.open,
                high: candleData.high,
                low: candleData.low,
                close: candleData.close,
              }
            : undefined,
        volume:
          candleData && "value" in candleData ? candleData.value : undefined,
        sma: findDataAtTime(indicatorData.sma, time),
        ema: findDataAtTime(indicatorData.ema, time),
        rsi: findDataAtTime(indicatorData.rsi, time),
        macd: findMacdDataAtTime(indicatorData.macd, time),
      };

      setTooltipData(tooltipData);
    },
    [indicatorData, getLatestData]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTooltipData(getLatestData());
  }, [getLatestData]);

  return {
    tooltipData,
    handleCrosshairMove,
    handleMouseLeave,
  };
};
