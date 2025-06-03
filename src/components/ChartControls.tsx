import {
  FaChartBar,
  FaSlidersH,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const timeFrames = [
 
  { label: "5m", value: "5min" },
  { label: "15m", value: "15min" },

  { label: "1d", value: "daily" },
];

const indicatorOptions = [
  {
    label: "Simple Moving Average",
    shortLabel: "SMA",
    value: "sma",
    description: "14-period moving average",
  },
  {
    label: "Exponential Moving Average",
    shortLabel: "EMA",
    value: "ema",
    description: "14-period exponential average",
  },
  {
    label: "Relative Strength Index",
    shortLabel: "RSI",
    value: "rsi",
    description: "14-period momentum oscillator",
  },
  {
    label: "MACD",
    shortLabel: "MACD",
    value: "macd",
    description: "Moving Average Convergence Divergence",
  },
];

const ChartControls = ({
  timeFrame,
  onTimeFrameChange,
  indicators,
  onIndicatorsChange,
}: {
  timeFrame: string;
  onTimeFrameChange: (tf: string) => void;
  indicators: string[];
  onIndicatorsChange: (inds: string[]) => void;
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showIndicators, setShowIndicators] = useState(false);

  const handleIndicatorChange = (value: string) => {
    if (indicators.includes(value)) {
      onIndicatorsChange(indicators.filter((i) => i !== value));
    } else {
      onIndicatorsChange([...indicators, value]);
    }
  };

  return (
    <div
      className="flex items-center justify-between px-6 py-3 h-full border-b"
      style={{
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
    >
      {/* Left Section - Controls */}
      <div className="flex items-center gap-4">
        {/* Indicators Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.tertiary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={() => setShowIndicators(!showIndicators)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.accent;
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.tertiary;
              e.currentTarget.style.color = theme.colors.text;
            }}
          >
            <FaSlidersH
              className="text-lg"
              style={{ color: theme.colors.accent }}
            />
            <span className="font-medium">
              Indicators ({indicators.length})
            </span>
            <FaChevronDown
              className={`text-sm transition-transform duration-200 ${
                showIndicators ? "rotate-180" : ""
              }`}
            />
          </button>

          {showIndicators && (
            <div
              className="absolute top-full left-0 mt-2 min-w-80 rounded-lg shadow-2xl z-50 border overflow-hidden"
              style={{
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              }}
            >
              <div className="p-4">
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: theme.colors.text }}
                >
                  Technical Indicators
                </h3>
                <div className="space-y-3">
                  {indicatorOptions.map((ind) => (
                    <label
                      key={ind.value}
                      className="flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: indicators.includes(ind.value)
                          ? `${theme.colors.accent}20`
                          : theme.colors.secondary,
                      }}
                      onMouseEnter={(e) => {
                        if (!indicators.includes(ind.value)) {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.tertiary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!indicators.includes(ind.value)) {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.secondary;
                        }
                      }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={indicators.includes(ind.value)}
                          onChange={() => handleIndicatorChange(ind.value)}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            borderColor: indicators.includes(ind.value)
                              ? theme.colors.accent
                              : theme.colors.border,
                            backgroundColor: indicators.includes(ind.value)
                              ? theme.colors.accent
                              : "transparent",
                          }}
                        >
                          {indicators.includes(ind.value) && (
                            <FaCheck className="text-white text-xs" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold"
                            style={{ color: theme.colors.text }}
                          >
                            {ind.shortLabel}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {ind.label}
                          </span>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {ind.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Type Button */}
        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.tertiary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.accent;
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.tertiary;
            e.currentTarget.style.color = theme.colors.text;
          }}
        >
          <FaChartBar
            className="text-lg"
            style={{ color: theme.colors.accent }}
          />
          <span className="font-medium">Candlestick</span>
        </button>
      </div>

      {/* Center Section - Time Frames */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-medium mr-3"
          style={{ color: theme.colors.textSecondary }}
        >
          Time Frame:
        </span>
        {timeFrames.map((tf) => (
          <button
            key={tf.value}
            className="px-3 py-2 rounded-md font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor:
                timeFrame === tf.value
                  ? theme.colors.accent
                  : theme.colors.tertiary,
              color: timeFrame === tf.value ? "#ffffff" : theme.colors.text,
              border: `1px solid ${
                timeFrame === tf.value
                  ? theme.colors.accent
                  : theme.colors.border
              }`,
            }}
            onClick={() => onTimeFrameChange(tf.value)}
            onMouseEnter={(e) => {
              if (timeFrame !== tf.value) {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (timeFrame !== tf.value) {
                e.currentTarget.style.backgroundColor = theme.colors.tertiary;
                e.currentTarget.style.color = theme.colors.text;
              }
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Right Section - Theme Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.tertiary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.accent;
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.tertiary;
            e.currentTarget.style.color = theme.colors.text;
          }}
        >
          {theme.mode === "dark" ? (
            <>
              <FaSun
                className="text-lg"
                style={{ color: theme.colors.accent }}
              />
              <span className="font-medium">Light</span>
            </>
          ) : (
            <>
              <FaMoon
                className="text-lg"
                style={{ color: theme.colors.accent }}
              />
              <span className="font-medium">Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChartControls;
