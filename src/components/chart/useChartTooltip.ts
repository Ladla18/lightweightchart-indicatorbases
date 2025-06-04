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
  const getLatestData = useCallback((): TooltipData | null => {
    if (candles.length === 0) return null;

    const latestCandle = candles[candles.length - 1];
    const latestVolume = volumes[volumes.length - 1];
    const latestTime = latestCandle?.time;

    // Early return if essential data is missing
    if (!latestCandle || latestTime === undefined) return null;

    // const findDataAtTime = (
    //   data: Array<{ time: number; value: number }>,
    //   targetTime: number
    // ) => {
    //   return data.find((item) => item.time === targetTime)?.value;
    // };

    const findMacdDataAtTime = (
      macdInstances: IndicatorData["macd"],
      targetTime: number
    ) => {
      if (!macdInstances || macdInstances.length === 0) return undefined;

      // Use first MACD instance for tooltip
      const macdData = macdInstances[0]?.data;
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

    // Helper function to find data from multiple instances (use first instance for tooltip)
    const findIndicatorDataAtTime = (
      instances: Array<{ data: Array<{ time: number; value: number }> }>,
      targetTime: number
    ) => {
      if (instances.length === 0) return undefined;
      return instances[0]?.data.find((item) => item.time === targetTime)?.value;
    };

    return {
      time: new Date(latestTime * 1000).toISOString(),
      candle: {
        open: latestCandle.open ?? 0,
        high: latestCandle.high ?? 0,
        low: latestCandle.low ?? 0,
        close: latestCandle.close ?? 0,
      },
      volume: latestVolume?.value,
      sma: findIndicatorDataAtTime(indicatorData.sma, latestTime),
      ema: findIndicatorDataAtTime(indicatorData.ema, latestTime),
      rsi: findIndicatorDataAtTime(indicatorData.rsi, latestTime),
      macd: findMacdDataAtTime(indicatorData.macd, latestTime),
    };
  }, [candles, volumes, indicatorData]);

  // Set initial data when component mounts or data changes
  useEffect(() => {
    if (!isHovering) {
      const latestData = getLatestData();
      if (latestData) {
        setTooltipData(latestData);
      }
    }
  }, [getLatestData, isHovering]);

  const handleCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      setIsHovering(true);

      if (!param.time) {
        const latestData = getLatestData();
        if (latestData) {
          setTooltipData(latestData);
        }
        return;
      }

      // Find data at the current time
      const time = param.time;
      const timeStr =
        typeof time === "number"
          ? new Date(time * 1000).toISOString()
          : time.toString();

      // Extract candlestick data with proper null checks
      let candleData;
      if (param.seriesData && param.seriesData.size > 0) {
        const firstSeries = param.seriesData.keys().next().value;
        if (firstSeries) {
          candleData = param.seriesData.get(firstSeries);
        }
      }

      // Find volume data at this time point from volumes array
      const findVolumeAtTime = (targetTime: any) => {
        return volumes.find((vol) => vol.time === targetTime)?.value;
      };

      // Find indicator data at this time point
      const findIndicatorDataAtTime = (
        instances: Array<{ data: Array<{ time: number; value: number }> }>,
        targetTime: any
      ) => {
        if (instances.length === 0) return undefined;
        return instances[0]?.data.find((item) => item.time === targetTime)
          ?.value;
      };

      const findMacdDataAtTime = (
        macdInstances: IndicatorData["macd"],
        targetTime: any
      ) => {
        if (!macdInstances || macdInstances.length === 0) return undefined;

        // Use first MACD instance for tooltip
        const macdData = macdInstances[0]?.data;
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
          candleData &&
          "open" in candleData &&
          "high" in candleData &&
          "low" in candleData &&
          "close" in candleData
            ? {
                open: typeof candleData.open === "number" ? candleData.open : 0,
                high: typeof candleData.high === "number" ? candleData.high : 0,
                low: typeof candleData.low === "number" ? candleData.low : 0,
                close:
                  typeof candleData.close === "number" ? candleData.close : 0,
              }
            : undefined,
        volume: findVolumeAtTime(time),
        sma: findIndicatorDataAtTime(indicatorData.sma, time),
        ema: findIndicatorDataAtTime(indicatorData.ema, time),
        rsi: findIndicatorDataAtTime(indicatorData.rsi, time),
        macd: findMacdDataAtTime(indicatorData.macd, time),
      };

      setTooltipData(tooltipData);
    },
    [indicatorData, getLatestData, volumes]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    const latestData = getLatestData();
    if (latestData) {
      setTooltipData(latestData);
    }
  }, [getLatestData]);

  return {
    tooltipData,
    handleCrosshairMove,
    handleMouseLeave,
  };
};
