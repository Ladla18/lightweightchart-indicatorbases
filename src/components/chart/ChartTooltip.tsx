import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import type { TooltipData } from "./tooltipTypes";

interface ChartTooltipProps {
  data: TooltipData | null;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ data }) => {
  const { theme } = useTheme();

  if (!data) {
    return null;
  }

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toFixed(0);
  };

  // const formatTime = (timeStr: string) => {
  //   const date = new Date(timeStr);
  //   return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  // };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        right: "60px",
        // Slightly more opaque

        padding: "8px 12px",
        fontSize: "12px",
        color: theme.colors.text,
        zIndex: 1000,

        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {/* Time */}
      {/* <div style={{ fontWeight: "bold", minWidth: "160px" }}>
        {formatTime(data.time)}
      </div> */}

      {/* Price Data */}
      {data.candle && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: theme.colors.bullish }}>
            O: {formatNumber(data.candle.open)}
          </span>
          <span style={{ color: theme.colors.bullish }}>
            H: {formatNumber(data.candle.high)}
          </span>
          <span style={{ color: theme.colors.bearish }}>
            L: {formatNumber(data.candle.low)}
          </span>
          <span
            style={{
              color:
                data.candle.close >= data.candle.open
                  ? theme.colors.bullish
                  : theme.colors.bearish,
            }}
          >
            C: {formatNumber(data.candle.close)}
          </span>
        </div>
      )}

      {/* Volume */}
      {data.volume !== undefined && (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span
            style={{
              color: theme.colors.accent || "#2962FF",
              fontWeight: "600",
            }}
          >
            Vol:
          </span>
          <span style={{ fontWeight: "500" }}>{formatVolume(data.volume)}</span>
        </div>
      )}

      {/* Moving Averages */}
      {(data.sma !== undefined || data.ema !== undefined) && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {data.sma !== undefined && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ color: theme.colors.sma, fontWeight: "500" }}>
                SMA:
              </span>
              <span>{formatNumber(data.sma)}</span>
            </div>
          )}
          {data.ema !== undefined && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ color: theme.colors.ema, fontWeight: "500" }}>
                EMA:
              </span>
              <span>{formatNumber(data.ema)}</span>
            </div>
          )}
        </div>
      )}

      {/* RSI */}
      {data.rsi !== undefined && (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ color: theme.colors.rsi, fontWeight: "500" }}>
            RSI:
          </span>
          <span>{formatNumber(data.rsi)}</span>
        </div>
      )}

      {/* MACD */}
      {data.macd && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span style={{ color: theme.colors.macdLine, fontWeight: "500" }}>
              MACD:
            </span>
            <span>{formatNumber(data.macd.macd, 4)}</span>
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span style={{ color: theme.colors.macdSignal, fontWeight: "500" }}>
              Signal:
            </span>
            <span>{formatNumber(data.macd.signal, 4)}</span>
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span
              style={{ color: theme.colors.macdHistogram, fontWeight: "500" }}
            >
              Hist:
            </span>
            <span>{formatNumber(data.macd.histogram, 4)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartTooltip;
