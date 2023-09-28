import { useState } from "react";
import { Stage, Layer, Circle, Rect, Image } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";
import useImage from "use-image";

const InteractiveCanvas: React.FC = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [img1] = useImage("/img1.png");
  const [img2] = useImage("/img2.png");
  const [img3] = useImage("/img3.png");

  const width = typeof window !== "undefined" ? window.innerWidth : 100;
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  const calculateSpring = (pos: { x: number; y: number }) => {
    const distance = Math.sqrt(
      Math.pow(cursorPos.x - pos.x, 2) + Math.pow(cursorPos.y - pos.y, 2)
    );

    if (distance < 100) {
      let moveAway = 150;
      if (pos.y < cursorPos.y) {
        moveAway = -150;
      }
      return { y: pos.y + moveAway };
    }

    return pos;
  };

  const circleProps = useSpring({
    ...calculateSpring({ x: 100, y: 100 }),
    config: { tension: 170, friction: 20 },
  });
  const rectProps = useSpring({
    ...calculateSpring({ x: 300, y: 200 }),
    config: { tension: 170, friction: 20 },
  });
  const img1Props = useSpring({
    ...calculateSpring({ x: 500, y: 300 }),
    config: { tension: 170, friction: 20 },
  });
  const img2Props = useSpring({
    ...calculateSpring({ x: 600, y: 400 }),
    config: { tension: 170, friction: 20 },
  });
  const img3Props = useSpring({
    ...calculateSpring({ x: 700, y: 500 }),
    config: { tension: 170, friction: 20 },
  });

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
        {/* @ts-ignore */}
        <animated.Circle radius={50} fill="red" {...circleProps} />
        <animated.Rect width={100} height={100} fill="blue" {...rectProps} />
        <animated.Image image={img1} {...img1Props} width={100} height={100} />
        <animated.Image image={img2} {...img2Props} width={100} height={100} />
        <animated.Image image={img3} {...img3Props} width={100} height={100} />
      </Layer>
    </Stage>
  );
};

export default InteractiveCanvas;
