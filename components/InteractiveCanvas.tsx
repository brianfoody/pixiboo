// Act as a react.js expert with extensive knowledge of react-konva.

// We want to enhance an existing react-konva canvas app. The present functionality is to move items out of the way as the mouse pans across the canvas.

// We would like to enhances it with these pieces of functionality.

// 1. Please make the canvas zoomable through a swipe gesture on mobile

// Code:
import { useRef, useState } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";
import DraggableShape from "./DraggableShape";
import { isMobileDevice } from "./utils";

type Circle = {
  x: number;
  y: number;
  radius: number;
};

type DroppedShape = {
  id: string;
  shape: string;
  color: string;
  x: number;
  y: number;
};

const ART_CIRCLE_RADIUS = 75;
const ART_CIRCLE_START_Y = ART_CIRCLE_RADIUS + 25;
const ART_CIRCLE_START_X = ART_CIRCLE_RADIUS + 25;
const FORCEFIELD_RADIUS = ART_CIRCLE_RADIUS * 1.25;

const InteractiveCanvas: React.FC = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 100;
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  // When we lift the cursor from a drag we also kick off a cursor event.
  // This adds a timed lock so that things snap back nicely
  const lockedMouseMove = useRef(false);

  const circleCount = isMobileDevice() ? 100 : 500;

  const [hasDragged, setHasDragged] = useState<
    { x: number; y: number } | undefined
  >(undefined);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [circles] = useState<Circle[]>(
    Array.from({ length: circleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 20 + Math.random() * 5, // random radius between 20 to 50
    }))
  );
  const artShape = {
    shape: "circle",
    color: "green",
    x: ART_CIRCLE_START_X,
    y: ART_CIRCLE_START_Y,
    radius: ART_CIRCLE_RADIUS,
  };

  const calculateSpring = (pos: { x: number; y: number }) => {
    const dx = cursorPos.x - pos.x;
    const dy = cursorPos.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < FORCEFIELD_RADIUS) {
      let moveAway = 150;
      // Direction based on dx and dy
      const angle = Math.atan2(dy, dx);
      return {
        x: pos.x - Math.cos(angle) * moveAway,
        y: pos.y - Math.sin(angle) * moveAway,
      };
    }
    return pos;
  };

  const handlePinchStart = (e: any) => {
    if (e.evt.touches.length !== 2) return;

    const dx = e.evt.touches[0].clientX - e.evt.touches[1].clientX;
    const dy = e.evt.touches[0].clientY - e.evt.touches[1].clientY;
  };

  const handleEvent = (e: any) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Check if event is a touch event
    const touchEvent = e.evt.touches && e.evt.touches.length > 0;

    // Use the first touch point if it's a touch event, else use mouse position
    const pos = touchEvent
      ? { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY }
      : stage.getPointerPosition();

    setCursorPos(pos);
  };

  console.log("hasDragged");
  console.log(hasDragged);
  return (
    <div
      style={{
        width,
        height,
      }}
    >
      <div
        style={{
          width,
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <a href="https://pixiboo.ai">
          <p>Pre-order your artwork now!</p>
        </a>
      </div>

      {/* <ShapePanel onShapeDrop={handleShapeDrop} /> */}
      <Stage
        width={width}
        height={height - 40}
        onMouseMove={(e) => {
          if (lockedMouseMove.current) return;
          handleEvent(e);
        }}
        onTouchEnd={() => setCursorPos({ x: 0, y: 0 })}
        onMouseOut={() => setCursorPos({ x: 0, y: 0 })}
        onDragStart={() => (lockedMouseMove.current = true)}
        onDragMove={(e) => handleEvent(e)}
        onDragEnd={() => {
          setCursorPos({ x: 0, y: 0 });
          setTimeout(() => (lockedMouseMove.current = false), 5);
        }}
        onTouchStart={(e) => {
          handleEvent(e);
          handlePinchStart(e);
        }}
        onTouchMove={(e) => {
          handleEvent(e);
        }}
      >
        <Layer>
          <Rect width={width} height={height} fill="white" />

          {/* {droppedShapes.map((ds) => (
            <DraggableShape
              key={ds.id}
              shape={ds.shape}
              color={ds.color}
              x={ds.x}
              y={ds.y}
              onDragEnd={(x, y) =>
                setDroppedShapes((prev) =>
                  prev.map((item) =>
                    item.id === ds.id ? { ...item, x, y } : item
                  )
                )
              }
            />
          ))} */}

          {hasDragged?.x && (
            <DraggableShape
              {...artShape}
              x={hasDragged.x}
              y={hasDragged.y}
              // onDragEnd={(x, y) => onShapeDrop(s.shape, s.color, x, y)}
            />
          )}

          {circles.map((circle, index) => {
            const springProps = useSpring({
              ...calculateSpring(circle),
              config: { tension: 170, friction: 20 },
            });

            return (
              // @ts-ignore
              <animated.Circle
                key={index}
                radius={circle.radius}
                fill="black"
                {...springProps}
              />
            );
          })}

          {hasDragged === undefined && (
            <DraggableShape
              {...artShape}
              onDragEnd={(x, y) => {
                setHasDragged({ x, y });
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default InteractiveCanvas;
