import { createChart } from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import { useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { ChartProps } from "./chart/index";
import {
  createChartOptions,
  createCandlestickSeries,
  createVolumeSeries,
  createOverlaySeries,
  renderRSIIndicator,
  renderMACDIndicator,
  useIndicatorData,
} from "./chart/index";

const Chart = ({ candles, volumes, indicators = [] }: ChartProps) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Calculate indicators using custom hook
  const indicatorData = useIndicatorData(candles, indicators);

  useEffect(() => {
    if (chartContainerRef.current && candles.length && volumes.length) {
      const width = chartContainerRef.current.clientWidth;
      const height = chartContainerRef.current.clientHeight;

      // Create chart with modular configuration
      const chartOptions = createChartOptions(theme, width, height);
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      // Pane 0 (Main) - Create main series
      createCandlestickSeries(chart, theme, candles, 0);
      createVolumeSeries(chart, volumes, 0);

      // Add overlay indicators on main pane
      if (indicatorData.sma.length) {
        createOverlaySeries(chart, theme, "sma", indicatorData.sma, 0);
      }

      if (indicatorData.ema.length) {
        createOverlaySeries(chart, theme, "ema", indicatorData.ema, 0);
      }

      // Track current pane index for subcharts
      let currentPaneIndex = 1;

      // RSI Pane
      if (indicators.includes("rsi") && indicatorData.rsi.length) {
        renderRSIIndicator(chart, theme, indicatorData.rsi, currentPaneIndex);
        currentPaneIndex++;
      }

      // MACD Pane
      if (indicators.includes("macd") && indicatorData.macd) {
        renderMACDIndicator(chart, theme, indicatorData.macd, currentPaneIndex);
        currentPaneIndex++;
      }

      chart.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, volumes, indicators, indicatorData, theme]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.chartBackground,
        border: "none",
        padding: 0,
        margin: 0,
      }}
    />
  );
};

export default Chart;
