import {
  createChart,
  ColorType,
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
import { useRef, useEffect } from "react";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
} from "../services/indicators";
import { useTheme } from "../contexts/ThemeContext";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
type Volume = {
  time: number;
  value: number;
  color: string;
};

type ChartProps = {
  candles: Candle[];
  volumes: Volume[];
  indicators?: string[];
};

const Chart = ({ candles, volumes, indicators = [] }: ChartProps) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const subchartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const subchartRef = useRef<IChartApi | null>(null);
  const syncingRef = useRef<boolean>(false); // Prevent infinite sync loops

  // Calculate overlays and subchart data
  const sma = indicators.includes("sma") ? calculateSMA(candles, 14) : [];
  const ema = indicators.includes("ema") ? calculateEMA(candles, 14) : [];
  const rsi = indicators.includes("rsi") ? calculateRSI(candles, 14) : [];
  const macdObj = indicators.includes("macd") ? calculateMACD(candles) : null;

  // Synchronization function to sync time scales
  const syncTimeScales = (sourceChart: IChartApi, targetChart: IChartApi) => {
    if (syncingRef.current) return; // Prevent infinite loops

    syncingRef.current = true;
    try {
      const sourceTimeScale = sourceChart.timeScale();
      const targetTimeScale = targetChart.timeScale();
      const visibleRange = sourceTimeScale.getVisibleRange();

      if (visibleRange) {
        targetTimeScale.setVisibleRange(visibleRange);
      }
    } catch (error) {
      console.warn("Time scale sync error:", error);
    } finally {
      // Reset the syncing flag after a brief delay
      setTimeout(() => {
        syncingRef.current = false;
      }, 50);
    }
  };

  useEffect(() => {
    if (chartContainerRef.current && candles.length && volumes.length) {
      const width = chartContainerRef.current.clientWidth;
      const height = chartContainerRef.current.clientHeight;

      // Check if subcharts will be shown
      const hasSubcharts = indicators.some((i) => i === "rsi" || i === "macd");

      const chartOptions = {
        width,
        height,
        layout: {
          background: {
            type: ColorType.Solid,
            color: theme.colors.chartBackground,
          },
          textColor: theme.colors.text,
        },
        grid: {
          vertLines: {
            color: theme.colors.chartGrid,
            style: 0,
            visible: true,
          },
          horzLines: {
            color: theme.colors.chartGrid,
            style: 0,
            visible: true,
          },
        },
        crosshair: {
          mode: 0, // Normal
          vertLine: {
            color: theme.colors.chartCrosshair,
            style: 0,
            visible: true,
            labelVisible: true,
          },
          horzLine: {
            color: theme.colors.chartCrosshair,
            style: 0,
            visible: true,
            labelVisible: true,
          },
        },
        rightPriceScale: {
          borderColor: theme.colors.chartBorder,
        },
        timeScale: {
          borderColor: theme.colors.chartBorder,
          visible: !hasSubcharts,
          timeVisible: !hasSubcharts,
          secondsVisible: false,
        },
        watermark: {
          visible: false,
        },
      };

      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: theme.colors.bullish,
        downColor: theme.colors.bearish,
        borderUpColor: theme.colors.bullish,
        borderDownColor: theme.colors.bearish,
        wickUpColor: theme.colors.bullish,
        wickDownColor: theme.colors.bearish,
        borderVisible: false,
        wickVisible: true,
      });
      candlestickSeries.setData(candles as CandlestickData[]);

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      volumeSeries.setData(volumes as HistogramData[]);

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      // Overlays
      if (sma.length) {
        const smaSeries = chart.addSeries(LineSeries, {
          color: theme.colors.sma,
          lineWidth: 2,
        });
        smaSeries.setData(sma as LineData[]);
      }
      if (ema.length) {
        const emaSeries = chart.addSeries(LineSeries, {
          color: theme.colors.ema,
          lineWidth: 2,
        });
        emaSeries.setData(ema as LineData[]);
      }

      // Subscribe to main chart time scale changes for synchronization
      chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        if (subchartRef.current && chartRef.current) {
          syncTimeScales(chartRef.current, subchartRef.current);
        }
      });

      chart.timeScale().fitContent();
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, volumes, indicators, theme]);

  // Subchart for RSI or MACD
  useEffect(() => {
    if (
      subchartContainerRef.current &&
      (rsi.length || (macdObj && macdObj.macd.length))
    ) {
      const width = subchartContainerRef.current.clientWidth;
      const height = subchartContainerRef.current.clientHeight;
      const chart = createChart(subchartContainerRef.current, {
        width,
        height,
        layout: {
          background: { type: ColorType.Solid, color: theme.colors.secondary },
          textColor: theme.colors.text,
        },
        grid: {
          vertLines: { color: theme.colors.chartGrid, style: 0, visible: true },
          horzLines: { color: theme.colors.chartGrid, style: 0, visible: true },
        },
        crosshair: {
          mode: 0,
          vertLine: {
            color: theme.colors.chartCrosshair,
            style: 0,
            visible: true,
            labelVisible: true,
          },
          horzLine: {
            color: theme.colors.chartCrosshair,
            style: 0,
            visible: true,
            labelVisible: true,
          },
        },
        rightPriceScale: { borderColor: theme.colors.chartBorder },
        timeScale: {
          borderColor: theme.colors.chartBorder,
          visible: true,
          timeVisible: true,
          secondsVisible: false,
        },
      });
      subchartRef.current = chart;

      if (rsi.length) {
        const rsiSeries = chart.addSeries(LineSeries, {
          color: theme.colors.rsi,
          lineWidth: 2,
        });
        rsiSeries.setData(rsi as LineData[]);
      }
      if (macdObj && macdObj.macd.length) {
        const macdSeries = chart.addSeries(LineSeries, {
          color: theme.colors.macdLine,
          lineWidth: 2,
        });
        macdSeries.setData(macdObj.macd as LineData[]);
        const signalSeries = chart.addSeries(LineSeries, {
          color: theme.colors.macdSignal,
          lineWidth: 2,
        });
        signalSeries.setData(macdObj.signal as LineData[]);
        const histogramSeries = chart.addSeries(HistogramSeries, {
          color: theme.colors.macdHistogram,
          priceFormat: { type: "volume" },
        });
        histogramSeries.setData(macdObj.histogram as HistogramData[]);
      }

      // Subscribe to subchart time scale changes for synchronization
      chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        if (chartRef.current && subchartRef.current) {
          syncTimeScales(subchartRef.current, chartRef.current);
        }
      });

      chart.timeScale().fitContent();
    }
    return () => {
      if (subchartRef.current) {
        subchartRef.current.remove();
        subchartRef.current = null;
      }
    };
  }, [rsi, macdObj, theme]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: indicators.some((i) => i === "rsi" || i === "macd")
            ? "70%"
            : "100%",
          background: theme.colors.chartBackground,
          border: "none",
          padding: 0,
          margin: 0,
        }}
      />
      {(indicators.includes("rsi") || indicators.includes("macd")) && (
        <div
          ref={subchartContainerRef}
          style={{
            width: "100%",
            height: "30%",
            background: theme.colors.secondary,
            border: "none",
            padding: 0,
            margin: 0,
          }}
        />
      )}
    </div>
  );
};

export default Chart;
