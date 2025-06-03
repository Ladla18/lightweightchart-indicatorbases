export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Volume = {
  time: number;
  value: number;
  color: string;
};

export type ChartProps = {
  candles: Candle[];
  volumes: Volume[];
  indicators?: string[];
};

export type IndicatorData = {
  sma: Array<{ time: number; value: number }>;
  ema: Array<{ time: number; value: number }>;
  rsi: Array<{ time: number; value: number }>;
  macd: {
    macd: Array<{ time: number; value: number }>;
    signal: Array<{ time: number; value: number }>;
    histogram: Array<{ time: number; value: number }>;
  } | null;
};
