import {
  FaSlidersH,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaCheck,
  FaDrawPolygon,
  FaTrash,
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
  trendlineMode,
  onTrendlineModeChange,
  onClearAllTrendlines,
}: {
  timeFrame: string;
  onTimeFrameChange: (tf: string) => void;
  indicators: string[];
  onIndicatorsChange: (inds: string[]) => void;
  trendlineMode?: boolean;
  onTrendlineModeChange?: (mode: boolean) => void;
  onClearAllTrendlines?: () => void;
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showIndicators, setShowIndicators] = useState(false);
  const [showTimeFrames, setShowTimeFrames] = useState(false);

  const handleIndicatorChange = (value: string) => {
    if (indicators.includes(value)) {
      onIndicatorsChange(indicators.filter((i) => i !== value));
    } else {
      onIndicatorsChange([...indicators, value]);
    }
  };

  const handleTimeFrameChange = (value: string) => {
    onTimeFrameChange(value);
    setShowTimeFrames(false); // Close dropdown after selection
  };

  // Get current timeframe label
  const currentTimeFrame = timeFrames.find((tf) => tf.value === timeFrame);

  // TradingView-inspired color scheme
  const tvColors = {
    buttonBg: theme.mode === "dark" ? "#1E222D" : "#F0F3FA",
    buttonHover: theme.mode === "dark" ? "#2A2E39" : "#E0E8F3",
    buttonActive: "#2962FF",
    buttonText: theme.mode === "dark" ? "#D1D4DC" : "#131722",
    buttonTextActive: "#FFFFFF",
    border: theme.mode === "dark" ? "#2A2E39" : "#E0E3EB",
    accent: "#2962FF",
    danger: "#F23645",
    success: "#089981",
   
  };

  return (
    <div className={`flex items-center justify-between w-full border-b border-gray-300 ${theme.mode === "dark" ? "border-gray-700" : ""}`}>
      <div
        className="flex items-centers justify-start gap-2 px-4 py-2 h-full border-b"
        style={{
      
          borderColor: tvColors.border,
          color: tvColors.buttonText,
        }}
      >
        {/* Left Section - Tool Controls */}
        <div className="flex items-center gap-2">
          {/* Indicators Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: showIndicators
                  ? tvColors.buttonActive
                  : tvColors.buttonBg,
                color: showIndicators
                  ? tvColors.buttonTextActive
                  : tvColors.buttonText,
                border: `1px solid ${tvColors.border}`,
              }}
              onClick={() => setShowIndicators(!showIndicators)}
              onMouseEnter={(e) => {
                if (!showIndicators) {
                  e.currentTarget.style.backgroundColor = tvColors.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!showIndicators) {
                  e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                }
              }}
            >
              <FaSlidersH className="text-xs" />
              <span>Indicators</span>
              {indicators.length > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: tvColors.accent + "20",
                    color: tvColors.accent,
                  }}
                >
                  {indicators.length}
                </span>
              )}
              <FaChevronDown
                className={`text-xs transition-transform duration-150 ${
                  showIndicators ? "rotate-180" : ""
                }`}
              />
            </button>

            {showIndicators && (
              <div
                className="absolute top-full left-0 mt-1 w-72 rounded border shadow-lg z-[10000] overflow-hidden"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: tvColors.border,
                  boxShadow:
                    theme.mode === "dark"
                      ? "0 4px 20px rgba(0, 0, 0, 0.4)"
                      : "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="p-3">
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: tvColors.buttonText }}
                  >
                    Technical Indicators
                  </h3>
                  <div className="space-y-1">
                    {indicatorOptions.map((ind) => (
                      <label
                        key={ind.value}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-150"
                        style={{
                          backgroundColor: indicators.includes(ind.value)
                            ? tvColors.accent + "10"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!indicators.includes(ind.value)) {
                            e.currentTarget.style.backgroundColor =
                              tvColors.buttonHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!indicators.includes(ind.value)) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
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
                            className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150"
                            style={{
                              borderColor: indicators.includes(ind.value)
                                ? tvColors.accent
                                : tvColors.border,
                              backgroundColor: indicators.includes(ind.value)
                                ? tvColors.accent
                                : "transparent",
                            }}
                          >
                            {indicators.includes(ind.value) && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-sm"
                              style={{ color: tvColors.buttonText }}
                            >
                              {ind.shortLabel}
                            </span>
                            <span
                              className="text-xs truncate"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {ind.label}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawing Tools */}
          <div className="flex items-center gap-1">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: trendlineMode
                  ? tvColors.buttonActive
                  : tvColors.buttonBg,
                color: trendlineMode
                  ? tvColors.buttonTextActive
                  : tvColors.buttonText,
                border: `1px solid ${
                  trendlineMode ? tvColors.buttonActive : tvColors.border
                }`,
              }}
              onClick={() => onTrendlineModeChange?.(!trendlineMode)}
              onMouseEnter={(e) => {
                if (!trendlineMode) {
                  e.currentTarget.style.backgroundColor = tvColors.buttonHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!trendlineMode) {
                  e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                }
              }}
            >
              <FaDrawPolygon className="text-xs" />
              <span>{trendlineMode ? "Drawing" : "Trendline"}</span>
            </button>

            <button
              className="flex items-center justify-center p-2.5 rounded text-sm transition-all duration-150"
              style={{
                backgroundColor: tvColors.buttonBg,
                color: tvColors.buttonText,
                border: `1px solid ${tvColors.border}`,
              }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("clearAllTrendlines"));
                onClearAllTrendlines?.();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tvColors.danger;
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = tvColors.danger;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                e.currentTarget.style.color = tvColors.buttonText;
                e.currentTarget.style.borderColor = tvColors.border;
              }}
              title="Clear All Trendlines"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>

        {/* Center Section - Time Frames Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: showTimeFrames
                ? tvColors.buttonActive
                : tvColors.buttonBg,
              color: showTimeFrames
                ? tvColors.buttonTextActive
                : tvColors.buttonText,
              border: `1px solid ${tvColors.border}`,
            }}
            onClick={() => setShowTimeFrames(!showTimeFrames)}
            onMouseEnter={(e) => {
              if (!showTimeFrames) {
                e.currentTarget.style.backgroundColor = tvColors.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!showTimeFrames) {
                e.currentTarget.style.backgroundColor = tvColors.buttonBg;
              }
            }}
          >
            <span>{currentTimeFrame?.label || timeFrame}</span>
            <FaChevronDown
              className={`text-xs transition-transform duration-150 ${
                showTimeFrames ? "rotate-180" : ""
              }`}
            />
          </button>

          {showTimeFrames && (
            <div
              className="absolute top-full left-0 mt-1 w-40 rounded border shadow-lg z-[10000] overflow-hidden"
              style={{
                backgroundColor: theme.colors.primary,
                borderColor: tvColors.border,
                boxShadow:
                  theme.mode === "dark"
                    ? "0 4px 20px rgba(0, 0, 0, 0.4)"
                    : "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="p-2">
                <h3
                  className="text-sm font-semibold mb-2 px-2"
                  style={{ color: tvColors.buttonText }}
                >
                  Time Frame
                </h3>
                <div className="space-y-1">
                  {timeFrames.map((tf) => (
                    <button
                      key={tf.value}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-all duration-150"
                      style={{
                        backgroundColor:
                          timeFrame === tf.value
                            ? tvColors.accent + "10"
                            : "transparent",
                        color: tvColors.buttonText,
                      }}
                      onClick={() => handleTimeFrameChange(tf.value)}
                      onMouseEnter={(e) => {
                        if (timeFrame !== tf.value) {
                          e.currentTarget.style.backgroundColor =
                            tvColors.buttonHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (timeFrame !== tf.value) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span className="font-medium">{tf.label}</span>
                      {timeFrame === tf.value && (
                        <FaCheck
                          className="text-xs"
                          style={{ color: tvColors.accent }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Right Section - Theme Toggle */}
      <div className="flex items-center justify-end pe-5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150"
          style={{
            backgroundColor: tvColors.buttonBg,
            color: tvColors.buttonText,
            border: `1px solid ${tvColors.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tvColors.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tvColors.buttonBg;
          }}
        >
          {theme.mode === "dark" ? (
            <>
              <FaSun className="text-xs" />
              <span>Light</span>
            </>
          ) : (
            <>
              <FaMoon className="text-xs" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChartControls;
