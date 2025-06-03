import type {
  IChartApi,
  ISeriesApi,
  Time,
  IPriceLine,
  LineWidth,
  LineStyle,
} from "lightweight-charts";

export interface TrendlinePoint {
  time: Time;
  price: number;
  x?: number;
  y?: number;
}

export interface Trendline {
  id: string;
  startPoint: TrendlinePoint;
  endPoint: TrendlinePoint;
  color: string;
  lineWidth: number;
  isSelected: boolean;
  isDragging: boolean;
  startPriceLine?: IPriceLine;
  endPriceLine?: IPriceLine;
}

export interface TrendlineState {
  trendlines: Trendline[];
  isDrawing: boolean;
  currentTrendline: Partial<Trendline> | null;
  previewEndPoint: TrendlinePoint | null;
  selectedTrendlineId: string | null;
  dragMode: "none" | "start" | "end" | "line";
  dragStartPos: { x: number; y: number } | null;
  dragOffset: { x: number; y: number } | null;
}

export class TrendlineManager {
  private chart: IChartApi;
  private candlestickSeries: ISeriesApi<"Candlestick">;
  private state: TrendlineState;
  private theme: any;
  private onStateChange: (state: TrendlineState) => void;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private eventContainer: HTMLElement | null = null;

  constructor(
    chart: IChartApi,
    candlestickSeries: ISeriesApi<"Candlestick">,
    theme: any,
    onStateChange: (state: TrendlineState) => void
  ) {
    this.chart = chart;
    this.candlestickSeries = candlestickSeries;
    this.theme = theme;
    this.onStateChange = onStateChange;
    this.state = {
      trendlines: [],
      isDrawing: false,
      currentTrendline: null,
      previewEndPoint: null,
      selectedTrendlineId: null,
      dragMode: "none",
      dragStartPos: null,
      dragOffset: null,
    };

    this.setupCanvas();
    this.bindEvents();
  }

  private setupCanvas() {
    const chartContainer = this.chart.chartElement();
    if (!chartContainer) return;

    console.log("Setting up canvas for chart container:", chartContainer); // Debug log

    // Create overlay canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none"; // Start disabled for chart interactions
    this.canvas.style.zIndex = "1000";

    chartContainer.style.position = "relative";
    chartContainer.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();

    // Add mouse move listener to chart container for hit testing
    chartContainer.addEventListener(
      "mousemove",
      this.handleContainerMouseMove.bind(this)
    );
  }

  private resizeCanvas() {
    if (!this.canvas || !this.ctx) return;

    const chartContainer = this.chart.chartElement();
    if (!chartContainer) return;

    const rect = chartContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    console.log("Resizing canvas:", {
      width: rect.width,
      height: rect.height,
      dpr,
    }); // Debug log

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.scale(dpr, dpr);
    this.redraw();
  }

  private bindEvents() {
    if (!this.canvas) return;

    this.eventContainer = this.canvas;

    // Mouse events for drawing and dragging
    this.eventContainer.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.eventContainer.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.eventContainer.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this)
    );
    this.eventContainer.addEventListener(
      "dblclick",
      this.handleDoubleClick.bind(this)
    );
    this.eventContainer.addEventListener(
      "contextmenu",
      this.handleRightClick.bind(this)
    );

    // Keyboard events for deletion
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    // Listen for clear all trendlines custom event
    window.addEventListener(
      "clearAllTrendlines",
      this.handleClearAllEvent.bind(this)
    );

    // Resize observer
    const chartContainer = this.chart.chartElement();
    if (chartContainer) {
      const resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      resizeObserver.observe(chartContainer);
    }
  }

  private handleContainerMouseMove(event: MouseEvent) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hitTest = this.hitTest(x, y);

    // Enable pointer events only when needed
    if (this.state.isDrawing || hitTest || this.state.dragMode !== "none") {
      this.canvas.style.pointerEvents = "auto";

      // Update cursor
      if (this.state.dragMode !== "none") {
        switch (this.state.dragMode) {
          case "start":
          case "end":
          case "line":
            this.canvas.style.cursor = "grabbing";
            break;
        }
      } else if (this.state.isDrawing) {
        this.canvas.style.cursor = "crosshair";
      } else if (hitTest) {
        switch (hitTest.dragMode) {
          case "start":
          case "end":
          case "line":
            this.canvas.style.cursor = "grab";
            break;
        }
      }
    } else {
      // Disable pointer events to allow normal chart interactions
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.cursor = "default";
    }
  }

  private handleMouseDown(event: MouseEvent) {
    console.log("Mouse down event - isDrawing:", this.state.isDrawing); // Debug log

    // Always handle events that reach the canvas (since we only enable pointer events when needed)
    event.preventDefault();
    event.stopPropagation();

    const point = this.getPointFromEvent(event);
    if (!point) {
      console.log("Failed to get point from event"); // Debug log
      return;
    }

    // Check if we should handle this event
    const pixelCoords = {
      x: event.clientX - this.canvas!.getBoundingClientRect().left,
      y: event.clientY - this.canvas!.getBoundingClientRect().top,
    };
    const hitTest = this.hitTest(pixelCoords.x, pixelCoords.y);

    // If in drawing mode, handle drawing
    if (this.state.isDrawing) {
      console.log("🖊️ Drawing mode - creating new trendline"); // Debug log
      this.handleDrawingMouseDown(point);
      return;
    }

    // If clicking on existing trendline, handle dragging
    if (hitTest) {
      console.log("🎯 Clicking on existing trendline, switching to drag mode"); // Debug log
      this.handleDragMouseDown(event, point);
      return;
    }

    // Clear selection if clicking on empty space
    console.log("🔘 Clicking on empty space, clearing selection"); // Debug log
    this.clearSelection();
    this.updateState();
    this.redraw();
  }

  private handleDrawingMouseDown(point: TrendlinePoint) {
    console.log("Drawing mode - Mouse down - point:", point); // Debug log
    console.log("Current trendline state:", this.state.currentTrendline); // Debug log

    if (!this.state.currentTrendline) {
      // Start drawing new trendline - first click
      this.state.currentTrendline = {
        id: this.generateId(),
        startPoint: point,
        color: this.theme.colors.accent || "#3b82f6",
        lineWidth: 2,
        isSelected: false,
        isDragging: false,
      };
      this.state.previewEndPoint = null; // Clear any preview
      console.log(
        "✅ Started new trendline with start point:",
        this.state.currentTrendline
      ); // Debug log
    } else if (
      this.state.currentTrendline.startPoint &&
      !this.state.currentTrendline.endPoint
    ) {
      // Finish drawing trendline - second click
      console.log("🎯 Setting end point..."); // Debug log
      this.state.currentTrendline.endPoint = point;

      // Complete the trendline with price lines
      const completedTrendline = this.state.currentTrendline as Trendline;
      this.createPriceLinesForTrendline(completedTrendline);

      this.state.trendlines.push(completedTrendline);
      console.log(
        "✅ Completed trendline and added to array:",
        completedTrendline
      ); // Debug log
      console.log("📊 Total trendlines:", this.state.trendlines.length); // Debug log

      // Reset for next trendline and AUTO-EXIT drawing mode
      this.state.currentTrendline = null;
      this.state.previewEndPoint = null;
      this.state.isDrawing = false; // Auto-exit drawing mode
      console.log("🔄 Auto-exited drawing mode after completing trendline"); // Debug log
    } else {
      console.log("⚠️ Unexpected state - resetting current trendline"); // Debug log
      this.state.currentTrendline = null;
      this.state.previewEndPoint = null;
    }

    this.updateState();
    this.redraw();
  }

  private handleDragMouseDown(event: MouseEvent, _point: TrendlinePoint) {
    const pixelCoords = {
      x: event.clientX - this.canvas!.getBoundingClientRect().left,
      y: event.clientY - this.canvas!.getBoundingClientRect().top,
    };

    // Check if clicking on existing trendline or endpoint
    const hitTest = this.hitTest(pixelCoords.x, pixelCoords.y);

    if (hitTest) {
      console.log("🎯 Hit test result:", hitTest); // Debug log

      this.state.selectedTrendlineId = hitTest.trendlineId;
      this.state.dragMode = hitTest.dragMode;
      this.state.dragStartPos = pixelCoords;

      // Calculate offset for smooth dragging
      if (hitTest.dragMode === "line") {
        const trendline = this.state.trendlines.find(
          (t) => t.id === hitTest.trendlineId
        );
        if (trendline) {
          const startCoords = this.getPixelCoordinates(trendline.startPoint);
          if (startCoords) {
            this.state.dragOffset = {
              x: pixelCoords.x - startCoords.x,
              y: pixelCoords.y - startCoords.y,
            };
          }
        }
      } else {
        this.state.dragOffset = { x: 0, y: 0 };
      }

      // Mark trendline as selected and dragging
      this.state.trendlines = this.state.trendlines.map((t) => ({
        ...t,
        isSelected: t.id === hitTest.trendlineId,
        isDragging: t.id === hitTest.trendlineId,
      }));

      this.updateState();
      this.redraw();

      console.log(
        "🖱️ Started dragging:",
        hitTest.dragMode,
        "- Trendline:",
        hitTest.trendlineId
      ); // Debug log
    } else {
      // Clear selection if clicking on empty space
      this.clearSelection();
      this.updateState();
      this.redraw();
    }
  }

  private handleMouseMove(event: MouseEvent) {
    const point = this.getPointFromEvent(event);
    if (!point) return;

    // Handle drawing preview
    if (this.state.isDrawing && this.state.currentTrendline?.startPoint) {
      this.state.previewEndPoint = point;
      this.redraw();
      return;
    }

    // Handle dragging
    if (
      this.state.dragMode !== "none" &&
      this.state.selectedTrendlineId &&
      this.state.dragStartPos
    ) {
      this.handleDragMove(point);
      return;
    }
  }

  private handleDragMove(point: TrendlinePoint) {
    const trendlineIndex = this.state.trendlines.findIndex(
      (t) => t.id === this.state.selectedTrendlineId
    );
    if (trendlineIndex === -1) return;

    const originalTrendline = this.state.trendlines[trendlineIndex];
    if (!originalTrendline) return; // Add null check

    const trendline = { ...originalTrendline };

    switch (this.state.dragMode) {
      case "start":
        console.log(
          "🔄 Extending trendline - dragging start point to:",
          point.price.toFixed(2)
        ); // Debug log
        trendline.startPoint = point;
        break;

      case "end":
        console.log(
          "🔄 Extending trendline - dragging end point to:",
          point.price.toFixed(2)
        ); // Debug log
        trendline.endPoint = point;
        break;

      case "line":
        console.log("🔄 Moving entire trendline to:", point.price.toFixed(2)); // Debug log
        // Calculate the offset from original start position to maintain relative positioning
        const originalStart = originalTrendline.startPoint;
        const originalEnd = originalTrendline.endPoint;

        if (!originalStart || !originalEnd) return; // Add null checks

        // Handle Time type properly - convert to numbers for arithmetic
        const pointTimeNum =
          typeof point.time === "string"
            ? parseInt(point.time)
            : Number(point.time);
        const startTimeNum =
          typeof originalStart.time === "string"
            ? parseInt(originalStart.time)
            : Number(originalStart.time);
        const endTimeNum =
          typeof originalEnd.time === "string"
            ? parseInt(originalEnd.time)
            : Number(originalEnd.time);

        // Apply offset to maintain relative position
        const deltaTime = pointTimeNum - startTimeNum;
        const deltaPrice = point.price - originalStart.price;

        // Convert back to Time type
        const newStartTime = startTimeNum + deltaTime;
        const newEndTime = endTimeNum + deltaTime;

        trendline.startPoint = {
          time: newStartTime as Time,
          price: originalStart.price + deltaPrice,
        };

        trendline.endPoint = {
          time: newEndTime as Time,
          price: originalEnd.price + deltaPrice,
        };
        break;
    }

    // Update the trendline in the array with proper type assertion
    this.state.trendlines[trendlineIndex] = trendline as Trendline;

    // Update price lines for the modified trendline - add null check
    const updatedTrendline = this.state.trendlines[trendlineIndex];
    if (updatedTrendline) {
      this.updatePriceLinesForTrendline(updatedTrendline);
    }

    this.updateState();
    this.redraw();
  }

  private handleMouseUp(_event: MouseEvent) {
    if (this.state.dragMode !== "none") {
      console.log(
        "🛑 Finished",
        this.state.dragMode === "line" ? "moving" : "extending",
        "trendline"
      ); // Debug log

      // End dragging
      this.state.dragMode = "none";
      this.state.dragStartPos = null;
      this.state.dragOffset = null;

      // Keep selection but stop dragging
      this.state.trendlines = this.state.trendlines.map((t) => ({
        ...t,
        isDragging: false,
      }));

      this.updateState();
      this.redraw();
    }
  }

  private handleDoubleClick(event: MouseEvent) {
    // Exit drawing mode on double click
    if (this.state.isDrawing) {
      event.preventDefault();
      event.stopPropagation();
      this.stopDrawing();
    }
  }

  private handleRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const point = this.getPointFromEvent(event);
    if (!point) return;

    const pixelCoords = {
      x: event.clientX - this.canvas!.getBoundingClientRect().left,
      y: event.clientY - this.canvas!.getBoundingClientRect().top,
    };
    const hitTest = this.hitTest(pixelCoords.x, pixelCoords.y);

    if (hitTest) {
      // Select the trendline first
      this.state.selectedTrendlineId = hitTest.trendlineId;
      this.state.trendlines = this.state.trendlines.map((t) => ({
        ...t,
        isSelected: t.id === hitTest.trendlineId,
      }));
      this.redraw();

      // Show context menu
      this.showContextMenu(event.clientX, event.clientY, hitTest.trendlineId);
      console.log("🖱️ Right-clicked on trendline:", hitTest.trendlineId); // Debug log
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Only handle Delete key when a trendline is selected
    if (event.key === "Delete" && this.state.selectedTrendlineId) {
      event.preventDefault();
      console.log("⌨️ Delete key pressed, removing selected trendline"); // Debug log
      this.removeTrendline(this.state.selectedTrendlineId);
    }
  }

  private showContextMenu(x: number, y: number, trendlineId: string) {
    // Remove any existing context menu
    this.removeContextMenu();

    const contextMenu = document.createElement("div");
    contextMenu.id = "trendline-context-menu";
    contextMenu.style.position = "fixed";
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.backgroundColor = this.theme.colors.primary;
    contextMenu.style.border = `1px solid ${this.theme.colors.border}`;
    contextMenu.style.borderRadius = "6px";
    contextMenu.style.padding = "4px 0";
    contextMenu.style.zIndex = "10000";
    contextMenu.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
    contextMenu.style.minWidth = "120px";

    // Delete option
    const deleteOption = document.createElement("div");
    deleteOption.textContent = "Delete Trendline";
    deleteOption.style.padding = "8px 16px";
    deleteOption.style.color = this.theme.colors.text;
    deleteOption.style.cursor = "pointer";
    deleteOption.style.fontSize = "14px";
    deleteOption.onmouseenter = () => {
      deleteOption.style.backgroundColor = this.theme.colors.accent;
      deleteOption.style.color = "#ffffff";
    };
    deleteOption.onmouseleave = () => {
      deleteOption.style.backgroundColor = "transparent";
      deleteOption.style.color = this.theme.colors.text;
    };
    deleteOption.onclick = () => {
      console.log("🗑️ Context menu delete clicked for:", trendlineId); // Debug log
      this.removeTrendline(trendlineId);
      this.removeContextMenu();
    };

    contextMenu.appendChild(deleteOption);
    document.body.appendChild(contextMenu);

    // Remove context menu when clicking elsewhere
    const removeOnClick = (e: MouseEvent) => {
      if (!contextMenu.contains(e.target as Node)) {
        this.removeContextMenu();
        document.removeEventListener("click", removeOnClick);
      }
    };
    setTimeout(() => {
      document.addEventListener("click", removeOnClick);
    }, 100);
  }

  private removeContextMenu() {
    const existingMenu = document.getElementById("trendline-context-menu");
    if (existingMenu) {
      existingMenu.remove();
    }
  }

  private getPointFromEvent(event: MouseEvent): TrendlinePoint | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log("Canvas coordinates:", { x, y }); // Debug log

    // Convert pixel coordinates to chart coordinates
    const timeScale = this.chart.timeScale();

    try {
      const time = timeScale.coordinateToTime(x);
      const price = this.candlestickSeries.coordinateToPrice(y);

      console.log("Chart coordinates:", { time, price }); // Debug log

      if (time === null || price === null) return null;

      return {
        time,
        price,
        x,
        y,
      };
    } catch (error) {
      console.warn("Error converting coordinates:", error);
      return null;
    }
  }

  private redraw() {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all completed trendlines
    this.state.trendlines.forEach((trendline) => {
      this.drawTrendline(trendline);
    });

    // Draw current trendline being drawn (with preview)
    if (this.state.currentTrendline?.startPoint && this.state.previewEndPoint) {
      const previewTrendline: Partial<Trendline> = {
        ...this.state.currentTrendline,
        endPoint: this.state.previewEndPoint,
      };
      this.drawTrendline(previewTrendline, true);
    }
  }

  private drawTrendline(trendline: Partial<Trendline>, isPreview = false) {
    if (!this.ctx || !trendline.startPoint) return;

    const startCoords = this.getPixelCoordinates(trendline.startPoint);
    const endCoords = trendline.endPoint
      ? this.getPixelCoordinates(trendline.endPoint)
      : null;

    if (!startCoords || !endCoords) return;

    this.ctx.save();

    // Enhanced styling for selected/dragging trendlines
    const isSelected = trendline.isSelected;
    const isDragging = trendline.isDragging;

    let strokeStyle = trendline.color || this.theme.colors.accent;
    let lineWidth = trendline.lineWidth || 2;

    if (isPreview) {
      strokeStyle = strokeStyle + "80";
    } else if (isDragging) {
      strokeStyle = strokeStyle + "DD"; // More opaque when dragging for better visibility
      lineWidth += 2; // Much thicker when dragging
    } else if (isSelected) {
      lineWidth += 1; // Slightly thicker when selected
    }

    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = "round";

    if (isPreview) {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(startCoords.x, startCoords.y);
    this.ctx.lineTo(endCoords.x, endCoords.y);
    this.ctx.stroke();

    // Draw end points with enhanced styling for selected/dragging
    if (!isPreview) {
      const pointColor = trendline.color || this.theme.colors.accent;
      let pointRadius = 4;

      if (isDragging) {
        pointRadius = 7; // Larger when dragging
      } else if (isSelected) {
        pointRadius = 6; // Larger when selected
      }

      this.drawPoint(startCoords.x, startCoords.y, pointColor, pointRadius);
      this.drawPoint(endCoords.x, endCoords.y, pointColor, pointRadius);

      // Add grab handles for better visual feedback
      if (isSelected && !isDragging) {
        this.drawGrabHandle(startCoords.x, startCoords.y);
        this.drawGrabHandle(endCoords.x, endCoords.y);
      }
    }

    this.ctx.restore();
  }

  private drawPoint(x: number, y: number, color: string, radius = 4) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawGrabHandle(x: number, y: number) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.fillStyle = this.theme.colors.accent;
    this.ctx.lineWidth = 2;

    // Draw outer circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.theme.colors.accent + "40";
    this.ctx.fill();
    this.ctx.stroke();

    // Draw inner circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.theme.colors.accent;
    this.ctx.fill();

    this.ctx.restore();
  }

  private getPixelCoordinates(
    point: TrendlinePoint
  ): { x: number; y: number } | null {
    try {
      const timeScale = this.chart.timeScale();

      const x = timeScale.timeToCoordinate(point.time);
      const y = this.candlestickSeries.priceToCoordinate(point.price);

      if (x === null || y === null) return null;

      return { x, y };
    } catch (error) {
      console.warn("Error getting pixel coordinates:", error);
      return null;
    }
  }

  private generateId(): string {
    return `trendline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateState() {
    console.log("📤 Updating state, calling onStateChange with:", this.state); // Debug log
    this.onStateChange({ ...this.state });
  }

  // Public methods
  public startDrawing() {
    this.state.isDrawing = true;
    this.state.currentTrendline = null;
    this.state.previewEndPoint = null;
    this.clearSelection(); // Clear any selections when entering drawing mode
    this.updateState();

    // Enable canvas pointer events when entering drawing mode
    if (this.canvas) {
      this.canvas.style.pointerEvents = "auto";
      this.canvas.style.cursor = "crosshair";
    }
    console.log("Started drawing mode"); // Debug log
  }

  public stopDrawing() {
    this.state.isDrawing = false;
    this.state.currentTrendline = null;
    this.state.previewEndPoint = null;
    this.updateState();
    this.redraw();

    // Don't disable pointer events - let hover detection manage them
    // This allows existing trendlines to still be dragged/extended
    console.log("Stopped drawing mode"); // Debug log
  }

  private clearSelection() {
    this.state.selectedTrendlineId = null;
    this.state.dragMode = "none";
    this.state.dragStartPos = null;
    this.state.dragOffset = null;
    this.state.trendlines = this.state.trendlines.map((t) => ({
      ...t,
      isSelected: false,
      isDragging: false,
    }));
  }

  public clearAll() {
    // Remove all price lines before clearing trendlines
    this.state.trendlines.forEach((trendline) => {
      this.removePriceLinesForTrendline(trendline);
    });

    this.state.trendlines = [];
    this.state.currentTrendline = null;
    this.state.previewEndPoint = null;
    this.state.isDrawing = false;
    this.clearSelection();
    this.updateState();
    this.redraw();

    console.log("🧹 Cleared all trendlines and price lines"); // Debug log
  }

  public removeTrendline(id: string) {
    const trendlineIndex = this.state.trendlines.findIndex((t) => t.id === id);
    if (trendlineIndex !== -1) {
      const trendline = this.state.trendlines[trendlineIndex];
      if (trendline) {
        this.removePriceLinesForTrendline(trendline);
        this.state.trendlines.splice(trendlineIndex, 1);
        this.updateState();
        this.redraw();

        console.log("🗑️ Removed trendline and its price lines:", id); // Debug log
      }
    }
  }

  public getState(): TrendlineState {
    return { ...this.state };
  }

  public destroy() {
    // Clean up all price lines before destroying
    this.state.trendlines.forEach((trendline) => {
      this.removePriceLinesForTrendline(trendline);
    });

    // Remove chart container event listener
    const chartContainer = this.chart.chartElement();
    if (chartContainer) {
      chartContainer.removeEventListener(
        "mousemove",
        this.handleContainerMouseMove.bind(this)
      );
    }

    // Remove keyboard event listener
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));

    // Remove custom event listener
    window.removeEventListener(
      "clearAllTrendlines",
      this.handleClearAllEvent.bind(this)
    );

    // Remove any existing context menu
    this.removeContextMenu();

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    console.log("🧹 TrendlineManager destroyed and cleaned up all listeners"); // Debug log
  }

  private hitTest(
    x: number,
    y: number
  ): { trendlineId: string; dragMode: "start" | "end" | "line" } | null {
    const POINT_RADIUS = 12; // Larger hit area for easier grabbing
    const LINE_THRESHOLD = 8; // Wider line threshold for easier selection

    // Test in reverse order (most recently drawn first)
    for (let i = this.state.trendlines.length - 1; i >= 0; i--) {
      const trendline = this.state.trendlines[i];

      if (!trendline) continue; // Add null check

      const startCoords = this.getPixelCoordinates(trendline.startPoint);
      const endCoords = this.getPixelCoordinates(trendline.endPoint);

      if (!startCoords || !endCoords) continue;

      // Test endpoints first (higher priority) - these allow extending
      const startDist = Math.sqrt(
        Math.pow(x - startCoords.x, 2) + Math.pow(y - startCoords.y, 2)
      );
      if (startDist <= POINT_RADIUS) {
        return { trendlineId: trendline.id, dragMode: "start" };
      }

      const endDist = Math.sqrt(
        Math.pow(x - endCoords.x, 2) + Math.pow(y - endCoords.y, 2)
      );
      if (endDist <= POINT_RADIUS) {
        return { trendlineId: trendline.id, dragMode: "end" };
      }

      // Test line - this allows moving the entire trendline
      const lineDistance = this.distanceToLine(
        x,
        y,
        startCoords.x,
        startCoords.y,
        endCoords.x,
        endCoords.y
      );
      if (lineDistance <= LINE_THRESHOLD) {
        return { trendlineId: trendline.id, dragMode: "line" };
      }
    }

    return null;
  }

  private distanceToLine(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0)
      return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));

    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length))
    );
    const projection = { x: x1 + t * dx, y: y1 + t * dy };

    return Math.sqrt(
      Math.pow(px - projection.x, 2) + Math.pow(py - projection.y, 2)
    );
  }

  private createPriceLinesForTrendline(trendline: Trendline) {
    console.log("📌 Creating price lines for trendline:", trendline.id); // Debug log

    // Create start point price line
    const startPriceLineOptions = {
      price: trendline.startPoint.price,
      color: trendline.color + "80", // Semi-transparent
      lineWidth: 1 as LineWidth,
      lineStyle: 1 as LineStyle, // Dotted
      axisLabelVisible: true,
      title: `T${trendline.id.slice(-4)} Start`,
      axisLabelColor: trendline.color + "40",
      axisLabelTextColor: this.theme.colors.text,
    };

    // Create end point price line
    const endPriceLineOptions = {
      price: trendline.endPoint.price,
      color: trendline.color + "80", // Semi-transparent
      lineWidth: 1 as LineWidth,
      lineStyle: 1 as LineStyle, // Dotted
      axisLabelVisible: true,
      title: `T${trendline.id.slice(-4)} End`,
      axisLabelColor: trendline.color + "40",
      axisLabelTextColor: this.theme.colors.text,
    };

    try {
      trendline.startPriceLine = this.candlestickSeries.createPriceLine(
        startPriceLineOptions
      );
      trendline.endPriceLine =
        this.candlestickSeries.createPriceLine(endPriceLineOptions);

      console.log(
        "✅ Price lines created successfully for trendline:",
        trendline.id
      ); // Debug log
    } catch (error) {
      console.warn("Failed to create price lines:", error);
    }
  }

  private updatePriceLinesForTrendline(trendline: Trendline) {
    if (trendline.startPriceLine) {
      trendline.startPriceLine.applyOptions({
        price: trendline.startPoint.price,
        title: `T${trendline.id.slice(-4)} Start`,
      });
    }

    if (trendline.endPriceLine) {
      trendline.endPriceLine.applyOptions({
        price: trendline.endPoint.price,
        title: `T${trendline.id.slice(-4)} End`,
      });
    }

    console.log("🔄 Updated price lines for trendline:", trendline.id); // Debug log
  }

  private removePriceLinesForTrendline(trendline: Trendline) {
    if (trendline.startPriceLine) {
      this.candlestickSeries.removePriceLine(trendline.startPriceLine);
      trendline.startPriceLine = undefined;
    }

    if (trendline.endPriceLine) {
      this.candlestickSeries.removePriceLine(trendline.endPriceLine);
      trendline.endPriceLine = undefined;
    }

    console.log("🗑️ Removed price lines for trendline:", trendline.id); // Debug log
  }

  private handleClearAllEvent() {
    console.log("🗑️ Received clear all trendlines event"); // Debug log
    this.clearAll();
  }
}
