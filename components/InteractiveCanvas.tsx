// Act as a react.js expert with extensive knowledge of react-konva.

// We want to enhance an existing react-konva canvas app. The present functionality is to move items out of the way as the mouse pans across the canvas.

// We would like to enhances it with these pieces of functionality.

// 1. When the user has finished first drag let's draw another green arrow to the artShape and display "Tap your character to resize it." instruction text in the same place as the other instruction.

// Code:
import { useRef, useState } from "react";
import { Stage, Layer, Circle, Rect, Arrow, Text } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";
import DraggableShape from "./DraggableShape";
import { isMobileDevice } from "./utils";
import ResizableCircle from "./ResizableCircle";

type Circle = {
  x: number;
  y: number;
  radius: number;
};

const ART_CIRCLE_WIDTH = 75;
const ART_CIRCLE_HEIGHT = 100;
const ART_CIRCLE_START_Y = ART_CIRCLE_HEIGHT + 25;
const ART_CIRCLE_START_X = ART_CIRCLE_WIDTH + 25;

const instructionText = "Drag your character to hide it within the artwork";
const resize_instructionText = "Tap your character to resize it.";

const InteractiveCanvas: React.FC = () => {
  const width = typeof window !== "undefined" ? window.innerWidth : 100;
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  // When we lift the cursor from a drag we also kick off a cursor event.
  // This adds a timed lock so that things snap back nicely
  const lockedMouseMove = useRef(false);

  const circleCount = isMobileDevice() ? 100 : 500;

  const [hasDragged, setHasDragged] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const [dragStarted, setDragStarted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [circles] = useState<Circle[]>(
    Array.from({ length: circleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 20 + Math.random() * 5, // random radius between 20 to 50
    }))
  );

  const stageRef = useRef(null);

  const [isSeleced, setIsSelected] = useState(false);

  const textSize = width * 0.03; // This will adjust the text size based on the screen width, adjust the multiplier as needed
  const padding = 10; // space around the text inside the background

  const [artShape, setArtShape] = useState({
    shape: "circle",
    fill: "green",
    x: ART_CIRCLE_START_X,
    y: ART_CIRCLE_START_Y,
    width: ART_CIRCLE_WIDTH,
    height: ART_CIRCLE_HEIGHT,
  });

  const handlePrint = () => {
    if (!stageRef.current) return;

    // Convert stage to a data URL (image format)
    // @ts-ignore
    const dataUrl = stageRef.current.toDataURL();

    // Create a new anchor element
    const link = document.createElement("a");
    link.href = dataUrl;

    // Specify the desired file name for the download
    link.download = "artwork.png";

    // Append the anchor to the body (it won't be visible)
    document.body.appendChild(link);

    // Trigger a click event on the anchor to start the download
    link.click();

    // Remove the anchor from the DOM
    document.body.removeChild(link);
  };
  const calculateSpring = (pos: { x: number; y: number }) => {
    const dx = cursorPos.x - pos.x;
    const dy = cursorPos.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const FORCEFIELD_RADIUS = Math.max(artShape.width, artShape.height);

    if (distance < FORCEFIELD_RADIUS) {
      let moveAway = FORCEFIELD_RADIUS * 0.9;
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
          position: "relative",
          flexDirection: "row",
        }}
      >
        <a href="https://pixiboo.ai">
          <p>Pre-order your artwork now!</p>
        </a>

        <button
          onClick={handlePrint}
          style={{
            marginRight: "10px",
          }}
        >
          Print
        </button>
      </div>

      {/* <ShapePanel onShapeDrop={handleShapeDrop} /> */}
      <Stage
        ref={stageRef}
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
          <Rect
            width={width}
            height={height}
            fill="white"
            onClick={() => setIsSelected(false)}
            onTap={() => setIsSelected(false)}
          />

          {hasDragged && (
            <ResizableCircle
              shapeProps={artShape}
              isSelected={isSeleced}
              onSelect={() => {
                setIsSelected(!isSeleced);
                setHasSelected(true);
              }}
              onChange={(newAttrs) => {
                setArtShape({
                  ...artShape,
                  ...newAttrs,
                });
              }}
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

          {!hasDragged && (
            <DraggableShape
              {...artShape}
              onDragStart={() => setDragStarted(true)}
              onDragEnd={(x, y) => {
                setHasDragged(true);
                setArtShape({
                  ...artShape,
                  x,
                  y,
                });
              }}
            />
          )}

          {dragStarted === false && (
            <>
              <Arrow
                points={[
                  width / 2,
                  height * 0.8,
                  artShape.x + artShape.width * 1.05,
                  artShape.y + artShape.height * 1.05,
                ]}
                pointerLength={20}
                pointerWidth={20}
                fill="white"
                stroke="green"
                strokeWidth={6}
              />
              <Rect
                x={width / 2 - (textSize * instructionText.length) / 4}
                y={height * 0.8}
                width={(textSize * instructionText.length) / 2 + padding * 2}
                height={textSize + padding * 2}
                fill="green"
                cornerRadius={5}
              />

              <Text
                x={
                  width / 2 - (textSize * instructionText.length) / 4 + padding
                }
                y={height * 0.8 + padding}
                text={instructionText}
                fontSize={textSize}
                fill="white"
                width={(textSize * instructionText.length) / 2}
                align="center"
                wrap="word"
              />
            </>
          )}

          {hasDragged && !hasSelected && (
            <>
              <Arrow
                points={[
                  width / 2,
                  height * 0.8,
                  artShape.x + artShape.width * 0.5,
                  artShape.y + artShape.height * 1.1,
                ]}
                pointerLength={20}
                pointerWidth={20}
                fill="white"
                stroke="green"
                strokeWidth={6}
              />
              <Rect
                x={width / 2 - (textSize * resize_instructionText.length) / 4}
                y={height * 0.8}
                width={
                  (textSize * resize_instructionText.length) / 2 + padding * 2
                }
                height={textSize + padding * 2}
                fill="green"
                cornerRadius={5}
              />

              <Text
                x={
                  width / 2 -
                  (textSize * resize_instructionText.length) / 4 +
                  padding
                }
                y={height * 0.8 + padding}
                text={resize_instructionText}
                fontSize={textSize}
                fill="white"
                width={(textSize * resize_instructionText.length) / 2}
                align="center"
                wrap="word"
              />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default InteractiveCanvas;
