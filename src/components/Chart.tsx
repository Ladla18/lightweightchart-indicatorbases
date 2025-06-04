import { createChart } from "lightweight-charts";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { useRef, useEffect, useCallback, useState } from "react";
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
  useChartTooltip,
  ChartTooltip,
} from "./chart/index";
import { TrendlineManager, type TrendlineState } from "./chart/trendlines";

interface ChartPropsWithTrendline extends ChartProps {
  trendlineMode?: boolean;
  onTrendlineModeChange?: (mode: boolean) => void;
}

const Chart = ({
  candles,
  volumes,
  indicators = [],
  trendlineMode = false,
  onTrendlineModeChange,
}: ChartPropsWithTrendline) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const trendlineManagerRef = useRef<TrendlineManager | null>(null);
  const [trendlineState, setTrendlineState] = useState<TrendlineState | null>(
    null
  );

  // Calculate indicators using custom hook
  const indicatorData = useIndicatorData(candles, indicators);

  // Tooltip functionality
  const { tooltipData, handleCrosshairMove, handleMouseLeave } =
    useChartTooltip(indicatorData, candles, volumes);

  // Resize handler
  const handleResize = useCallback(() => {
    if (chartRef.current && chartContainerRef.current) {
      const { clientWidth, clientHeight } = chartContainerRef.current;
      chartRef.current.applyOptions({
        width: clientWidth,
        height: clientHeight,
      });
    }
  }, []);

  // Trendline state change handler
  const handleTrendlineStateChange = useCallback(
    (state: TrendlineState) => {
      console.log("📊 Trendline state changed:", state); // Debug log
      setTrendlineState(state);

      // Auto-exit drawing mode when trendline drawing is completed
      if (!state.isDrawing && trendlineMode && onTrendlineModeChange) {
        console.log(
          "🔄 Auto-exiting trendline mode after completing trendline"
        ); // Debug log
        onTrendlineModeChange(false);
      }
    },
    [trendlineMode, onTrendlineModeChange]
  );

  // Effect for trendline mode changes
  useEffect(() => {
    console.log("Trendline mode changed:", trendlineMode); // Debug log
    if (trendlineManagerRef.current) {
      if (trendlineMode) {
        console.log("Starting trendline drawing..."); // Debug log
        trendlineManagerRef.current.startDrawing();
      } else {
        console.log("Stopping trendline drawing..."); // Debug log
        trendlineManagerRef.current.stopDrawing();
      }
    } else {
      console.log("TrendlineManager not initialized yet"); // Debug log
    }
  }, [trendlineMode]);

  // Resize observer effect
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  useEffect(() => {
    console.log("🔄 Chart effect running...", {
      candles: candles.length,
      volumes: volumes.length,
    }); // Debug log

    if (chartContainerRef.current && candles.length && volumes.length) {
      console.log("📈 Creating new chart instance..."); // Debug log

      const width = chartContainerRef.current.clientWidth;
      const height = chartContainerRef.current.clientHeight;

      // Create chart with modular configuration
      const chartOptions = createChartOptions(theme, width, height);
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      // Subscribe to crosshair events for tooltip
      chart.subscribeCrosshairMove(handleCrosshairMove);

      // Pane 0 (Main) - Create main series
      const candlestickSeries = createCandlestickSeries(
        chart,
        theme,
        candles,
        0
      );
      candlestickSeriesRef.current = candlestickSeries;
      createVolumeSeries(chart, volumes, 0);

      // Initialize trendline manager
      console.log("🎨 Initializing TrendlineManager..."); // Debug log
      trendlineManagerRef.current = new TrendlineManager(
        chart,
        candlestickSeries,
        theme,
        handleTrendlineStateChange
      );
      console.log(
        "✅ TrendlineManager initialized:",
        trendlineManagerRef.current
      ); // Debug log

      // If already in trendline mode, start drawing
      if (trendlineMode) {
        console.log("🎯 Already in trendline mode, starting drawing..."); // Debug log
        trendlineManagerRef.current.startDrawing();
      }

      // Add overlay indicators on main pane
      indicatorData.sma.forEach((smaInstance) => {
        createOverlaySeries(chart, theme, "sma", smaInstance.data, 0);
      });

      indicatorData.ema.forEach((emaInstance) => {
        createOverlaySeries(chart, theme, "ema", emaInstance.data, 0);
      });

      // Track current pane index for subcharts
      let currentPaneIndex = 1;

      // RSI Pane - render each RSI instance
      indicatorData.rsi.forEach((rsiInstance) => {
        renderRSIIndicator(chart, theme, rsiInstance.data, currentPaneIndex);
        currentPaneIndex++;
      });

      // MACD Pane - render each MACD instance
      indicatorData.macd.forEach((macdInstance) => {
        renderMACDIndicator(chart, theme, macdInstance.data, currentPaneIndex);
        currentPaneIndex++;
      });

      chart.timeScale().fitContent();
    }

    return () => {
      console.log("🧹 Chart cleanup..."); // Debug log
      if (trendlineManagerRef.current) {
        console.log("🧹 Destroying TrendlineManager..."); // Debug log
        trendlineManagerRef.current.destroy();
        trendlineManagerRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
    };
  }, [candles, volumes, indicators, indicatorData, theme, handleCrosshairMove]);

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
        position: "relative",
        cursor: trendlineMode ? "crosshair" : "default",
      }}
      onMouseLeave={handleMouseLeave}
    >
      <ChartTooltip data={tooltipData} />

      {/* Trendline mode indicator */}
      {trendlineMode && (
        <div
          className="absolute top-10 left-2 px-3 py-1 rounded-sm text-xs font-medium z-[1001]"
          style={{
            backgroundColor: theme.colors.accent + "20",
            color: theme.colors.accent,
            border: `1px solid ${theme.colors.accent}`,
          }}
        >
          Click to place trendline points
        </div>
      )}

      {/* Trendline count indicator */}
      {trendlineState && trendlineState.trendlines.length > 0 && 2 > 3 && (
        <div
          className="absolute top-2 right-2 px-3 py-1 rounded-md text-sm font-medium z-[1001]"
          style={{
            backgroundColor: theme.colors.secondary,
            color: theme.colors.text,
            border: `3px solid ${theme.colors.border}`,
          }}
        >
          {trendlineState.trendlines.length} trendline
          {trendlineState.trendlines.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default Chart;
