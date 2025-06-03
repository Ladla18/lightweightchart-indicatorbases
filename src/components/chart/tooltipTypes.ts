export interface TooltipData {
  time: string;
  candle?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume?: number;
  sma?: number;
  ema?: number;
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
}

export interface TooltipPosition {
  x: number;
  y: number;
  visible: boolean;
}
