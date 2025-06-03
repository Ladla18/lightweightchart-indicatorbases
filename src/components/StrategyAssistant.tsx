import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const StrategyAssistant: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: theme.colors.text }}
        >
          Strategy Assistant
        </h1>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Create and manage trading strategies
        </p>
      </div>

      {/* Technical Indicators Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.colors.text }}
          >
            Technical Indicators
          </h2>
          <button
            className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
            }}
          >
            <span className="text-lg">+</span>
            Add Indicator
          </button>
        </div>

        {/* Indicators Container */}
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.border,
          }}
        >
          <div className="mb-4">
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <span className="text-2xl">!</span>
            </div>
          </div>
          <p
            className="text-base mb-6"
            style={{ color: theme.colors.textSecondary }}
          >
            No indicators added yet.
          </p>
          <button
            className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
            }}
          >
            <span className="text-lg">+</span>
            Add Your First Indicator
          </button>
        </div>
      </div>

      {/* Signal Conditions Section */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.text }}
        >
          Signal Conditions
        </h2>

        <div className="space-y-4">
          {/* Entry Signal */}
          <div
            className="rounded-lg border p-4 flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.secondary,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#10b981" }}
              >
                <span className="text-white text-sm">→</span>
              </div>
              <div>
                <h3
                  className="font-medium text-base"
                  style={{ color: theme.colors.text }}
                >
                  Entry Signal
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Not configured
                </p>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: "transparent",
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }}
            >
              ✏️ Configure
            </button>
          </div>

          {/* Exit Signal */}
          <div
            className="rounded-lg border p-4 flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.secondary,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ef4444" }}
              >
                <span className="text-white text-sm">×</span>
              </div>
              <div>
                <h3
                  className="font-medium text-base"
                  style={{ color: theme.colors.text }}
                >
                  Exit Signal
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Not configured
                </p>
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: "transparent",
                borderColor: theme.colors.border,
                color: theme.colors.text,
              }}
            >
              ✏️ Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyAssistant;
