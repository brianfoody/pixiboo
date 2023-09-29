import React from "react";
import DraggableShape from "./DraggableShape";
import { isMobileDevice } from "./utils";
import { Layer, Stage } from "react-konva";

type ShapePanelProps = {
  onShapeDrop: (shape: string, color: string, x: number, y: number) => void;
};

const ShapePanel: React.FC<ShapePanelProps> = ({ onShapeDrop }) => {
  const shapes = [
    { shape: "circle", fill: "green" },
    { shape: "triangle", fill: "blue" },
    { shape: "square", fill: "yellow" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: isMobileDevice() ? 0 : "0px",
        right: isMobileDevice() ? "auto" : 0,
        overflow: isMobileDevice() ? "scroll" : "auto",
        flexDirection: isMobileDevice() ? "row" : "column",
        width: isMobileDevice() ? "100vw" : "200px",
        height: isMobileDevice() ? "80px" : "100vh",
        backgroundColor: "#f0f0f0", // Optional: a light background to distinguish the panel
      }}
    >
      {shapes.map((s, i) => (
        <Stage width={60} height={60} key={i}>
          <Layer>
            <DraggableShape
              {...s}
              onDragEnd={(x, y) => onShapeDrop(s.shape, s.fill, x, y)}
            />
          </Layer>
        </Stage>
      ))}
    </div>
  );
};

export default ShapePanel;
