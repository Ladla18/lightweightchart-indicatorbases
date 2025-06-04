// src/App.tsx
import { useEffect, useState } from "react";
import Chart from "./components/Chart";
import ChartControls from "./components/ChartControls";
import StrategyAssistant from "./components/StrategyAssistant";
import ResizableDivider from "./components/ResizableDivider";
import { getStockData, parseAlphaVantageIntraday } from "./services/stockdata";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import type { IndicatorInstance } from "./components/chart/types";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};
type Volume = {
  time: number;
  value: number;
  color: string;
};

const AppContent = () => {
  const { theme } = useTheme();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [timeFrame, setTimeFrame] = useState<string>("15min");
  const [indicators, setIndicators] = useState<IndicatorInstance[]>([]);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(80); // 80% default
  const [trendlineMode, setTrendlineMode] = useState<boolean>(false);

  useEffect(() => {
    getStockData(timeFrame).then((data) => {
      const { candles, volumes } = parseAlphaVantageIntraday(data);
      setCandles(candles);
      setVolumes(volumes);
    });
  }, [timeFrame]);

  const handleResize = (newWidth: number) => {
    setLeftPanelWidth(newWidth);
  };

  const handleClearAllTrendlines = () => {
    console.log("🗑️ Clear all trendlines requested from App"); // Debug log
    // The Chart component will handle this through its trendline manager
    // when the Clear All button is clicked, it will trigger the manager directly
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <div
        className="h-full flex flex-col flex-shrink-0"
        style={{ width: `${leftPanelWidth}%`, minWidth: `${leftPanelWidth}%` }}
      >
        <div className="h-[7%] w-full flex-shrink-0">
          <ChartControls
            timeFrame={timeFrame}
            onTimeFrameChange={setTimeFrame}
            indicators={indicators}
            onIndicatorsChange={setIndicators}
            trendlineMode={trendlineMode}
            onTrendlineModeChange={setTrendlineMode}
            onClearAllTrendlines={handleClearAllTrendlines}
          />
        </div>
        <div className="h-[93%] w-full flex-shrink-0">
          <Chart
            candles={candles}
            volumes={volumes}
            indicators={indicators}
            trendlineMode={trendlineMode}
            onTrendlineModeChange={setTrendlineMode}
          />
        </div>
      </div>

      <ResizableDivider onResize={handleResize} />

      <div
        className="h-full flex-1"
        style={{
          backgroundColor: theme.colors.secondary,
        }}
      >
        {/* Strategy Assistant */}
        <StrategyAssistant />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
