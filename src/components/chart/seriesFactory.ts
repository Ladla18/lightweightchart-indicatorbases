import {
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import type {
  IChartApi,
  CandlestickData,
  HistogramData,
  LineData,
} from "lightweight-charts";
import type { ChartTheme } from "./chartConfig";
import type { Candle, Volume } from "./types";

export const createCandlestickSeries = (
  chart: IChartApi,
  theme: ChartTheme,
  candles: Candle[],
  paneIndex: number = 0
) => {
  const candlestickSeries = chart.addSeries(
    CandlestickSeries,
    {
      upColor: theme.colors.bullish,
      downColor: theme.colors.bearish,
      borderUpColor: theme.colors.bullish,
      borderDownColor: theme.colors.bearish,
      wickUpColor: theme.colors.bullish,
      wickDownColor: theme.colors.bearish,
      borderVisible: false,
      wickVisible: true,
    },
    paneIndex
  );

  candlestickSeries.setData(candles as CandlestickData[]);
  return candlestickSeries;
};

export const createVolumeSeries = (
  chart: IChartApi,
  volumes: Volume[],
  paneIndex: number = 0
) => {
  const volumeSeries = chart.addSeries(
    HistogramSeries,
    {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "#26a69a40", // Semi-transparent volume bars
      base: 0,
    },
    paneIndex
  );

  // Create volume data with transparency
  const volumeData = volumes.map((vol) => ({
    ...vol,
    color: vol.color + "40", // Add transparency to volume colors
  }));

  volumeSeries.setData(volumeData as HistogramData[]);

  // Configure volume price scale
  chart.priceScale("volume").applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  return volumeSeries;
};

export const createOverlaySeries = (
  chart: IChartApi,
  theme: ChartTheme,
  type: "sma" | "ema",
  data: Array<{ time: number; value: number }>,
  paneIndex: number = 0
) => {
  const color = type === "sma" ? theme.colors.sma : theme.colors.ema;

  const series = chart.addSeries(
    LineSeries,
    {
      color,
      lineWidth: 2,
    },
    paneIndex
  );

  series.setData(data as LineData[]);
  return series;
};
