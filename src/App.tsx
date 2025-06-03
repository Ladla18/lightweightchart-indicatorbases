// src/App.tsx
import { useEffect, useState } from "react";
import Chart from "./components/Chart";
import ChartControls from "./components/ChartControls";
import { getStockData, parseAlphaVantageIntraday } from "./services/stockdata";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

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
  const [indicators, setIndicators] = useState<string[]>([]);

  useEffect(() => {
    getStockData(timeFrame).then((data) => {
      const { candles, volumes } = parseAlphaVantageIntraday(data);
      setCandles(candles);
      setVolumes(volumes);
    });
  }, [timeFrame]);

  return (
    <div
      className="flex h-screen w-screen"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <div className="h-full w-4/5">
        <div className="h-[10%] w-full">
          <ChartControls
            timeFrame={timeFrame}
            onTimeFrameChange={setTimeFrame}
            indicators={indicators}
            onIndicatorsChange={setIndicators}
          />
        </div>
        <div className="h-[90%] w-full">
          <Chart candles={candles} volumes={volumes} indicators={indicators} />
        </div>
      </div>
      <div
        className="h-full w-1/5 flex items-center justify-center border-l"
        style={{
          backgroundColor: theme.colors.secondary,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }}
      >
        <div className="text-center p-6">
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            AI Assistant
          </h3>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Trading insights and analysis coming soon...
          </p>
        </div>
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
