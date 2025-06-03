import React, { useState, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ResizableDividerProps {
  onResize: (leftWidth: number) => void;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({ onResize }) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const handleMouseMove = (e: MouseEvent) => {
        const windowWidth = window.innerWidth;
        const newLeftWidth = (e.clientX / windowWidth) * 100;

        // Constrain between 60% and 85%
        const constrainedWidth = Math.min(Math.max(newLeftWidth, 60), 85);
        onResize(constrainedWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onResize]
  );

  return (
    <div
      className="relative flex items-center justify-center group cursor-col-resize"
      style={{
        width: "4px",
        backgroundColor: isDragging ? theme.colors.primary : "transparent",
        borderLeft: `1px solid ${theme.colors.border}`,
        borderRight: `1px solid ${theme.colors.border}`,
        transition: isDragging ? "none" : "background-color 0.2s ease",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Hover indicator */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          backgroundColor: theme.colors.primary + "40",
        }}
      />

      {/* Drag handle dots */}
      <div className="absolute flex flex-col gap-1 opacity-0 group-hover:opacity-60 transition-opacity duration-200">
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: theme.colors.text }}
        />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: theme.colors.text }}
        />
        <div
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: theme.colors.text }}
        />
      </div>
    </div>
  );
};

export default ResizableDivider;
