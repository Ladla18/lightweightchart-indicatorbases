import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  FaPlus,
  FaCog,
  FaPlay,

  FaChartLine,
  FaSignal,
} from "react-icons/fa";

const StrategyAssistant: React.FC = () => {
  const { theme } = useTheme();

  // TradingView-inspired color scheme
  const tvColors = {
    cardBg: theme.mode === "dark" ? "#1E222D" : "#FFFFFF",
    cardBorder: theme.mode === "dark" ? "#2A2E39" : "#E0E3EB",
    buttonBg: theme.mode === "dark" ? "#2A2E39" : "#F0F3FA",
    buttonHover: theme.mode === "dark" ? "#363A45" : "#E0E8F3",
    primaryText: theme.mode === "dark" ? "#D1D4DC" : "#131722",
    secondaryText: theme.mode === "dark" ? "#787B86" : "#6A6D78",
    accent: "#2962FF",
    success: "#089981",
    danger: "#F23645",
    warning: "#FF9500",
  };

  return (
    <div
      className="h-full w-full flex flex-col min-h-0 max-w-full overflow-hidden"
      style={{ backgroundColor: theme.colors.primary }}
    >
      {/* Header */}
      <div
        className="px-3 py-3 border-b flex-shrink-0"
        style={{ borderColor: tvColors.cardBorder }}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="min-w-0">
            <h1
              className="text-lg font-semibold truncate"
              style={{ color: tvColors.primaryText }}
            >
              Strategy Assistant
            </h1>
            <p
              className="text-xs mt-1 text-wrap"
              style={{ color: tvColors.secondaryText }}
            >
              Build and backtest trading strategies
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 w-full justify-center"
              style={{
                backgroundColor: tvColors.success,
                color: "#ffffff",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <FaPlay className="text-xs" />
              <span>Run Strategy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 p-3 overflow-y-auto min-h-0 max-w-full strategy-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: `${
            theme.mode === "dark" ? "#404040" : "#C0C0C0"
          } transparent`,
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .strategy-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .strategy-scrollbar::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 3px;
            }
            
            .strategy-scrollbar::-webkit-scrollbar-thumb {
              background: ${theme.mode === "dark" ? "#404040" : "#C0C0C0"};
              border-radius: 3px;
              transition: background-color 0.2s ease;
            }
            
            .strategy-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${theme.mode === "dark" ? "#606060" : "#A0A0A0"};
            }
            
            .strategy-scrollbar::-webkit-scrollbar-thumb:active {
              background: ${theme.mode === "dark" ? "#707070" : "#909090"};
            }
            
            .strategy-scrollbar::-webkit-scrollbar-corner {
              background: transparent;
            }
            
            /* Firefox fallback */
            .strategy-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: ${
                theme.mode === "dark" ? "#404040" : "#C0C0C0"
              } transparent;
            }
          `,
          }}
        />
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: tvColors.cardBg,
              borderColor: tvColors.cardBorder,
            }}
          >
            <div className="flex items-center justify-between min-w-0">
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-medium uppercase tracking-wide truncate"
                  style={{ color: tvColors.secondaryText }}
                >
                  Active Signals
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: tvColors.primaryText }}
                >
                  0
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tvColors.accent + "20" }}
              >
                <FaSignal
                  className="text-sm"
                  style={{ color: tvColors.accent }}
                />
              </div>
            </div>
          </div>

          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: tvColors.cardBg,
              borderColor: tvColors.cardBorder,
            }}
          >
            <div className="flex items-center justify-between min-w-0">
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-medium uppercase tracking-wide truncate"
                  style={{ color: tvColors.secondaryText }}
                >
                  Win Rate
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: tvColors.primaryText }}
                >
                  --
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tvColors.success + "20" }}
              >
                <FaChartLine
                  className="text-sm"
                  style={{ color: tvColors.success }}
                />
              </div>
            </div>
          </div>

          <div
            className="p-3 rounded border"
            style={{
              backgroundColor: tvColors.cardBg,
              borderColor: tvColors.cardBorder,
            }}
          >
            <div className="flex items-center justify-between min-w-0">
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs font-medium uppercase tracking-wide truncate"
                  style={{ color: tvColors.secondaryText }}
                >
                  P&L
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: tvColors.primaryText }}
                >
                  $0.00
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: tvColors.warning + "20" }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: tvColors.warning }}
                >
                  $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators Section */}
        <div className="mb-4">
          <div className="flex flex-col gap-3 mb-3">
            <h2
              className="text-base font-semibold truncate"
              style={{ color: tvColors.primaryText }}
            >
              Technical Indicators
            </h2>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all duration-150 justify-center"
              style={{
                backgroundColor: tvColors.accent,
                color: "#ffffff",
                border: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <FaPlus className="text-xs" />
              <span>Add Indicator</span>
            </button>
          </div>

          <div
            className="rounded border p-4 text-center"
            style={{
              backgroundColor: tvColors.cardBg,
              borderColor: tvColors.cardBorder,
              borderStyle: "dashed",
            }}
          >
            <div
              className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{
                backgroundColor: tvColors.buttonBg,
                border: `2px dashed ${tvColors.cardBorder}`,
              }}
            >
              <FaChartLine
                className="text-base"
                style={{ color: tvColors.secondaryText }}
              />
            </div>
            <h3
              className="text-sm font-medium mb-2"
              style={{ color: tvColors.primaryText }}
            >
              No indicators configured
            </h3>
            <p
              className="text-xs mb-4 break-words"
              style={{ color: tvColors.secondaryText }}
            >
              Add technical indicators to start building your strategy
            </p>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium mx-auto transition-all duration-150"
              style={{
                backgroundColor: tvColors.buttonBg,
                color: tvColors.primaryText,
                border: `1px solid ${tvColors.cardBorder}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tvColors.buttonHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tvColors.buttonBg;
              }}
            >
              <FaPlus className="text-xs" />
              <span className="whitespace-nowrap">
                Add Your First Indicator
              </span>
            </button>
          </div>
        </div>

        {/* Strategy Rules Section */}
        <div className="min-w-0">
          <h2
            className="text-base font-semibold mb-3 truncate"
            style={{ color: tvColors.primaryText }}
          >
            Strategy Rules
          </h2>

          <div className="space-y-3">
            {/* Entry Conditions */}
            <div
              className="rounded border p-3"
              style={{
                backgroundColor: tvColors.cardBg,
                borderColor: tvColors.cardBorder,
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.success + "20",
                      color: tvColors.success,
                    }}
                  >
                    BUY
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-sm truncate"
                      style={{ color: tvColors.primaryText }}
                    >
                      Entry Conditions
                    </h3>
                    <p
                      className="text-xs mt-0.5 break-words"
                      style={{ color: tvColors.secondaryText }}
                    >
                      Define when to enter long positions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.secondaryText,
                    }}
                  >
                    Not configured
                  </span>
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all duration-150 flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.primaryText,
                      border: `1px solid ${tvColors.cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        tvColors.buttonHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                    }}
                  >
                    <FaCog className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            {/* Exit Conditions */}
            <div
              className="rounded border p-3"
              style={{
                backgroundColor: tvColors.cardBg,
                borderColor: tvColors.cardBorder,
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.danger + "20",
                      color: tvColors.danger,
                    }}
                  >
                    SELL
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-sm truncate"
                      style={{ color: tvColors.primaryText }}
                    >
                      Exit Conditions
                    </h3>
                    <p
                      className="text-xs mt-0.5 break-words"
                      style={{ color: tvColors.secondaryText }}
                    >
                      Define when to close positions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.secondaryText,
                    }}
                  >
                    Not configured
                  </span>
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all duration-150 flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.primaryText,
                      border: `1px solid ${tvColors.cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        tvColors.buttonHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                    }}
                  >
                    <FaCog className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div
              className="rounded border p-3"
              style={{
                backgroundColor: tvColors.cardBg,
                borderColor: tvColors.cardBorder,
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.warning + "20",
                      color: tvColors.warning,
                    }}
                  >
                    RM
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-sm truncate"
                      style={{ color: tvColors.primaryText }}
                    >
                      Risk Management
                    </h3>
                    <p
                      className="text-xs mt-0.5 break-words"
                      style={{ color: tvColors.secondaryText }}
                    >
                      Set stop loss and position sizing rules
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.secondaryText,
                    }}
                  >
                    Not configured
                  </span>
                  <button
                    className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-all duration-150 flex-shrink-0"
                    style={{
                      backgroundColor: tvColors.buttonBg,
                      color: tvColors.primaryText,
                      border: `1px solid ${tvColors.cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        tvColors.buttonHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tvColors.buttonBg;
                    }}
                  >
                    <FaCog className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyAssistant;
