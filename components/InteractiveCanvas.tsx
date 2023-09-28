import { useState, useEffect } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";

type Circle = {
  x: number;
  y: number;
  radius: number;
};

const FORCEFIELD_RADIUS = 75;

const InteractiveCanvas: React.FC = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 100;
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [circles, setCircles] = useState<Circle[]>(
    Array.from({ length: 500 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 20 + Math.random() * 5, // random radius between 20 to 50
    }))
  );

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

  return (
    <Stage
      width={width}
      height={height}
      onMouseMove={(e) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const mousePos = stage.getPointerPosition();
        setCursorPos(mousePos!);
      }}
      onMouseOut={() => setCursorPos({ x: 0, y: 0 })}
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
