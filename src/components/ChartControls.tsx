import {
  FaSlidersH,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaCheck,
  FaDrawPolygon,
  FaTrash,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const timeFrames = [
  { label: "5m", value: "5min" },
  { label: "15m", value: "15min" },
  { label: "1d", value: "daily" },
];

interface IndicatorInstance {
  id: string;
  type: string;
  label: string;
  params: Record<string, number>;
}

interface IndicatorOption {
  label: string;
  shortLabel: string;
  value: string;
  description: string;
  defaultParams: Record<string, number>;
  paramLabels: Record<string, string>;
}

const indicatorOptions: IndicatorOption[] = [
  {
    label: "Simple Moving Average",
    shortLabel: "SMA",
    value: "sma",
    description: "Period-based moving average",
    defaultParams: { period: 14 },
    paramLabels: { period: "Period" },
  },
  {
    label: "Exponential Moving Average",
    shortLabel: "EMA",
    value: "ema",
    description: "Period-based exponential average",
    defaultParams: { period: 14 },
    paramLabels: { period: "Period" },
  },
  {
    label: "Relative Strength Index",
    shortLabel: "RSI",
    value: "rsi",
    description: "Momentum oscillator",
    defaultParams: { period: 14 },
    paramLabels: { period: "Period" },
  },
  {
    label: "MACD",
    shortLabel: "MACD",
    value: "macd",
    description: "Moving Average Convergence Divergence",
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    paramLabels: {
      fastPeriod: "Fast",
      slowPeriod: "Slow",
      signalPeriod: "Signal",
    },
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
  indicators: IndicatorInstance[];
  onIndicatorsChange: (inds: IndicatorInstance[]) => void;
  trendlineMode?: boolean;
  onTrendlineModeChange?: (mode: boolean) => void;
  onClearAllTrendlines?: () => void;
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showIndicators, setShowIndicators] = useState(false);
  const [showTimeFrames, setShowTimeFrames] = useState(false);
  const [addingIndicator, setAddingIndicator] = useState<string | null>(null);
  const [indicatorParams, setIndicatorParams] = useState<
    Record<string, number>
  >({});

  const handleAddIndicator = (type: string) => {
    const option = indicatorOptions.find((opt) => opt.value === type);
    if (!option) return;

    setAddingIndicator(type);
    setIndicatorParams(option.defaultParams);
  };

  const handleConfirmAddIndicator = () => {
    if (!addingIndicator) return;

    const option = indicatorOptions.find(
      (opt) => opt.value === addingIndicator
    );
    if (!option) return;

    const newIndicator: IndicatorInstance = {
      id: `${addingIndicator}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 5)}`,
      type: addingIndicator,
      label: `${option.shortLabel}(${Object.values(indicatorParams).join(
        ","
      )})`,
      params: { ...indicatorParams },
    };

    onIndicatorsChange([...indicators, newIndicator]);
    setAddingIndicator(null);
    setIndicatorParams({});
  };

  const handleRemoveIndicator = (id: string) => {
    onIndicatorsChange(indicators.filter((ind) => ind.id !== id));
  };

  const handleParamChange = (paramKey: string, value: number) => {
    setIndicatorParams((prev) => ({
      ...prev,
      [paramKey]: value,
    }));
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
    <div
      className={`flex items-center justify-between w-full border-b border-gray-300 ${
        theme.mode === "dark" ? "border-gray-700" : ""
      }`}
    >
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
                className="absolute top-full left-0 mt-1 w-80 rounded border shadow-lg z-[10000] overflow-hidden"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: tvColors.border,
                  boxShadow:
                    theme.mode === "dark"
                      ? "0 4px 20px rgba(0, 0, 0, 0.4)"
                      : "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="p-3 max-h-96 overflow-y-auto">
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: tvColors.buttonText }}
                  >
                    Technical Indicators
                  </h3>

                  {/* Active Indicators */}
                  {indicators.length > 0 && (
                    <div className="mb-4">
                      <h4
                        className="text-xs font-medium mb-2"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Active ({indicators.length})
                      </h4>
                      <div className="space-y-1">
                        {indicators.map((indicator) => (
                          <div
                            key={indicator.id}
                            className="flex items-center justify-between p-2 rounded"
                            style={{
                              backgroundColor: tvColors.accent + "10",
                            }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: tvColors.buttonText }}
                            >
                              {indicator.label}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveIndicator(indicator.id)
                              }
                              className="text-xs p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                              style={{ color: tvColors.danger }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Indicator */}
                  {!addingIndicator ? (
                    <div className="space-y-1">
                      <h4
                        className="text-xs font-medium mb-2"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        Add Indicator
                      </h4>
                      {indicatorOptions.map((ind) => (
                        <button
                          key={ind.value}
                          className="w-full flex items-center gap-3 p-2 rounded cursor-pointer transition-all duration-150"
                          onClick={() => handleAddIndicator(ind.value)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              tvColors.buttonHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <FaPlus
                            className="text-xs"
                            style={{ color: tvColors.accent }}
                          />
                          <div className="flex-1 min-w-0 text-left">
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
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Parameter Input Form */
                    <div className="space-y-3">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: tvColors.buttonText }}
                      >
                        Configure{" "}
                        {
                          indicatorOptions.find(
                            (opt) => opt.value === addingIndicator
                          )?.shortLabel
                        }
                      </h4>
                      {Object.entries(indicatorParams).map(
                        ([paramKey, paramValue]) => {
                          const option = indicatorOptions.find(
                            (opt) => opt.value === addingIndicator
                          );
                          const paramLabel =
                            option?.paramLabels[paramKey] || paramKey;
                          return (
                            <div key={paramKey} className="space-y-1">
                              <label
                                className="text-xs font-medium"
                                style={{ color: theme.colors.textSecondary }}
                              >
                                {paramLabel}
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={paramValue}
                                onChange={(e) =>
                                  handleParamChange(
                                    paramKey,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full px-2 py-1 text-sm rounded border"
                                style={{
                                  backgroundColor: theme.colors.primary,
                                  borderColor: tvColors.border,
                                  color: tvColors.buttonText,
                                }}
                              />
                            </div>
                          );
                        }
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleConfirmAddIndicator}
                          className="flex-1 px-3 py-1.5 text-xs rounded font-medium transition-colors"
                          style={{
                            backgroundColor: tvColors.accent,
                            color: "#ffffff",
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingIndicator(null);
                            setIndicatorParams({});
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded font-medium transition-colors"
                          style={{
                            backgroundColor: tvColors.buttonBg,
                            color: tvColors.buttonText,
                            border: `1px solid ${tvColors.border}`,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
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
              title={
                trendlineMode
                  ? "Click to exit drawing mode (or complete a trendline to auto-exit)"
                  : "Click to start drawing trendlines"
              }
            >
              <FaDrawPolygon className="text-xs" />
              <span>{trendlineMode ? "Exit Drawing" : "Draw Trendline"}</span>
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
