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

export interface IndicatorInstance {
  id: string;
  type: string;
  label: string;
  params: Record<string, number>;
}

export type ChartProps = {
  candles: Candle[];
  volumes: Volume[];
  indicators?: IndicatorInstance[];
};

export type IndicatorData = {
  sma: Array<{
    id: string;
    label: string;
    data: Array<{ time: number; value: number }>;
  }>;
  ema: Array<{
    id: string;
    label: string;
    data: Array<{ time: number; value: number }>;
  }>;
  rsi: Array<{
    id: string;
    label: string;
    data: Array<{ time: number; value: number }>;
  }>;
  macd: Array<{
    id: string;
    label: string;
    data: {
      macd: Array<{ time: number; value: number }>;
      signal: Array<{ time: number; value: number }>;
      histogram: Array<{ time: number; value: number }>;
    };
  }>;
};
