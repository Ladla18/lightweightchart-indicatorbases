import { LineSeries, HistogramSeries } from "lightweight-charts";
import type { IChartApi, LineData, HistogramData } from "lightweight-charts";
import type { ChartTheme } from "./chartConfig";

export const renderRSIIndicator = (
  chart: IChartApi,
  theme: ChartTheme,
  rsiData: Array<{ time: number; value: number }>,
  paneIndex: number
) => {
  const rsiSeries = chart.addSeries(
    LineSeries,
    {
      color: theme.colors.rsi,
      lineWidth: 2,
    },
    paneIndex
  );

  rsiSeries.setData(rsiData as LineData[]);
  return rsiSeries;
};

export const renderMACDIndicator = (
  chart: IChartApi,
  theme: ChartTheme,
  macdData: {
    macd: Array<{ time: number; value: number }>;
    signal: Array<{ time: number; value: number }>;
    histogram: Array<{ time: number; value: number }>;
  },
  paneIndex: number
) => {
  // MACD Line
  const macdSeries = chart.addSeries(
    LineSeries,
    {
      color: theme.colors.macdLine,
      lineWidth: 2,
    },
    paneIndex
  );
  macdSeries.setData(macdData.macd as LineData[]);

  // Signal Line
  const signalSeries = chart.addSeries(
    LineSeries,
    {
      color: theme.colors.macdSignal,
      lineWidth: 2,
    },
    paneIndex
  );
  signalSeries.setData(macdData.signal as LineData[]);

  // Histogram
  const histogramSeries = chart.addSeries(
    HistogramSeries,
    {
      color: theme.colors.macdHistogram,
      priceFormat: { type: "volume" },
    },
    paneIndex
  );
  histogramSeries.setData(macdData.histogram as HistogramData[]);

  return {
    macdSeries,
    signalSeries,
    histogramSeries,
  };
};
