// Act as a react.js expert with extensive knowledge of react-konva.

// We want to enhance an existing react-konva canvas app. The present functionality is to move items out of the way as the mouse pans across the canvas.

// We would like to enhances it with these pieces of functionality.

// 1. Please make the canvas zoomable through a swipe gesture on mobile

// Code:
import { useState } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";

type Circle = {
  x: number;
  y: number;
  radius: number;
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const FORCEFIELD_RADIUS = 75;

const InteractiveCanvas: React.FC = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 100;
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  const circleCount = isMobileDevice() ? 100 : 500;

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [circles, setCircles] = useState<Circle[]>(
    Array.from({ length: circleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 20 + Math.random() * 5, // random radius between 20 to 50
    }))
  );
  const [scale, setScale] = useState<number>(1);
  const [initialPinchDistance, setInitialPinchDistance] = useState<
    number | null
  >(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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

    setInitialPinchDistance(Math.sqrt(dx * dx + dy * dy));
  };

  const handlePinchMove = (e: any) => {
    if (e.evt.touches.length !== 2 || initialPinchDistance === null) return;

    const x1 = e.evt.touches[0].clientX;
    const y1 = e.evt.touches[0].clientY;
    const x2 = e.evt.touches[1].clientX;
    const y2 = e.evt.touches[1].clientY;

    const midpoint = {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };

    const dx = x1 - x2;
    const dy = y1 - y2;
    const newDistance = Math.sqrt(dx * dx + dy * dy);

    const scaleFactor = newDistance / initialPinchDistance;

    const newScale = scale * scaleFactor;

    const newOffsetX = (midpoint.x - width / 2) * (newScale - scale);
    const newOffsetY = (midpoint.y - height / 2) * (newScale - scale);

    setScale(newScale);
    setOffset((prevOffset) => ({
      x: prevOffset.x - newOffsetX,
      y: prevOffset.y - newOffsetY,
    }));
    setInitialPinchDistance(newDistance);
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

  return (
    <Stage
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      offsetX={offset.x}
      offsetY={offset.y}
      onMouseMove={(e) => handleEvent(e)}
      onMouseOut={() => setCursorPos({ x: 0, y: 0 })}
      onTouchEnd={() => setCursorPos({ x: 0, y: 0 })}
      onTouchStart={(e) => {
        handleEvent(e);
        handlePinchStart(e);
      }}
      onTouchMove={(e) => {
        handleEvent(e);
        handlePinchMove(e);
      }}
    >
      <Layer>
        <Rect width={width} height={height} fill="white" />

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
      </Layer>
    </Stage>
  );
};

export default InteractiveCanvas;
