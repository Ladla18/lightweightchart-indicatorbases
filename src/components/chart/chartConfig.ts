import { ColorType } from "lightweight-charts";

export interface ChartTheme {
  colors: {
    chartBackground: string;
    text: string;
    chartGrid: string;
    chartCrosshair: string;
    chartBorder: string;
    bullish: string;
    bearish: string;
    sma: string;
    ema: string;
    rsi: string;
    macdLine: string;
    macdSignal: string;
    macdHistogram: string;
  };
}

export const createChartOptions = (
  theme: ChartTheme,
  width: number,
  height: number
) => ({
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
      color: theme.colors.chartGrid + "70", // Semi-transparent grid
      style: 0,
      visible: true,
    },
    horzLines: {
      color: theme.colors.chartGrid + "70", // Semi-transparent grid
      style: 0,
      visible: true,
    },
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
  rightPriceScale: {
    borderColor: theme.colors.chartBorder,
  },
  timeScale: {
    borderColor: theme.colors.chartBorder,
    visible: true,
    timeVisible: true,
    secondsVisible: false,
  },
  watermark: {
    visible: false,
  },
});
