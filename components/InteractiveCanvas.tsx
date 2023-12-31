// Act as a react.js expert with extensive knowledge of react-konva.

// We want to enhance an existing react-konva canvas app. The present functionality is to move items out of the way as the mouse pans across the canvas.

// We would like to enhances it with these pieces of functionality.

// 1. When the user has finished first drag let's draw another green arrow to the artShape and display "Tap your character to resize it." instruction text in the same place as the other instruction.

// Code:
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle, Rect, Arrow, Text, Image } from "react-konva";
import { useSpring, animated } from "@react-spring/konva";
import { isMobileDevice } from "./utils";
import ResizableArtwork from "./ResizableArtwork";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { carnivalImages } from "./carnivalArtwork";
import useImage from "use-image";
import useSound from "use-sound";

type CanvasImage = {
  w: number;
  h: number;
  top: number;
  left: number;
  url: string;
  zIndex: number;
};
type CanvasItem = {
  id: string;
  userGenerated: boolean;
  shape: string;
  img?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  zIndex: number;
};

// Base artworks that you can't hide behind are zIndex to 1
const MIN_Z_INDEX = 2;

export const convertAssetToImage = ({
  img,
  xScale,
  yScale,
}: {
  img: string;
  xScale: number;
  yScale: number;
}): CanvasImage => {
  const zMatch = img.match(/z(\d+)_/);
  const heightMatch = img.match(/h(\d+)_/);
  const widthMatch = img.match(/w(\d+)_/);
  const leftMatch = img.match(/l(\d+)_/);
  const topMatch = img.match(/t(\d+)_/);

  const zIndex = zMatch ? parseInt(zMatch[1], 10) : 1;
  const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
  const width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
  const left = leftMatch ? parseInt(leftMatch[1], 10) : 0;
  const top = topMatch ? parseInt(topMatch[1], 10) : 0;

  return {
    w: width * xScale,
    h: height * yScale,
    top: top * xScale,
    left: left * yScale,
    url: img,
    zIndex,
  };
};

const ART_CIRCLE_WIDTH = 40;
const ART_CIRCLE_HEIGHT = 70;
const ART_CIRCLE_START_Y = ART_CIRCLE_HEIGHT + 25;
const ART_CIRCLE_START_X = ART_CIRCLE_WIDTH + 25;

const instructionText = "Drag your character to hide it within the artwork";
const resize_instructionText = "Tap your character to resize it.";

const overlapRectRect = (r1: CanvasItem, r2: CanvasItem): boolean => {
  return (
    r1.x < r2.x + r2.width! &&
    r1.x + r1.width! > r2.x &&
    r1.y < r2.y + r2.height! &&
    r1.y + r1.height! > r2.y
  );
};

const InteractiveCanvas: React.FC = () => {
  const soundUrl = "/sounds/drums.mp3";

  const [play] = useSound(soundUrl, {
    sprite: {
      kick: [0, 350],
      hihat: [374, 160],
      snare: [666, 290],
      cowbell: [968, 200],
    },
    volume: 0.9,
  });

  const pRef = useRef<HTMLParagraphElement | null | undefined>();
  const height = typeof window !== "undefined" ? window.innerHeight : 100;

  const canvasActualWidth = 2160;
  const canvasActualHeight = 3840;

  const canvasRenderHeight = height;
  const canvasRenderWidth =
    canvasRenderHeight * (canvasActualWidth / canvasActualHeight);

  const xScale = canvasRenderWidth / canvasActualWidth;
  const yScale = canvasRenderHeight / canvasActualHeight;

  const carnivalAssets = carnivalImages
    .map((c, i) => {
      const img = convertAssetToImage({
        img: c,
        xScale,
        yScale,
      });
      return {
        userGenerated: false,
        shape: "rectangle",
        x: img.left,
        y: img.top,
        width: img.w,
        height: img.h,
        zIndex: img.zIndex,
        img: img.url,
        id: `circle${i + 2}`,
      } as CanvasItem;
    })
    .sort((a, b) => {
      return a.zIndex - b.zIndex;
    });

  const [artShape, setArtShape] = useState<CanvasItem>({
    id: "avatar",
    userGenerated: true,
    shape: "rectangle",
    img: "carnival/avatar.png",
    x: ART_CIRCLE_START_X,
    y: ART_CIRCLE_START_Y,
    width: ART_CIRCLE_WIDTH,
    height: ART_CIRCLE_HEIGHT,
    zIndex: carnivalAssets.length + 2,
  });

  const shapes = [...carnivalAssets, artShape].sort(
    (a, b) => a.zIndex - b.zIndex
  );

  // When we lift the cursor from a drag we also kick off a cursor event.
  // This adds a timed lock so that things snap back nicely
  const lockedMouseMove = useRef(false);

  const [hasDragged, setHasDragged] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const [dragStarted, setDragStarted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const stageRef = useRef(null);

  const [isSelected, setIsSelected] = useState(true);

  const textSize = canvasRenderWidth * 0.035; // This will adjust the text size based on the screen width, adjust the multiplier as needed
  const padding = canvasRenderWidth * 0.03; // space around the text inside the background

  const handlePrint = () => {
    if (!stageRef.current) return;

    setIsSelected(false);
    setTimeout(() => {
      // Convert stage to a data URL (image format)
      // @ts-ignore
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 1 / (canvasRenderHeight / canvasActualHeight),
      });

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
    }, 10);
  };

  useEffect(() => {
    if (!hasDragged) return;

    if (typeof window === "undefined") return;

    window.localStorage.setItem("hasDragged", "true");
  }, [hasDragged]);

  useEffect(() => {
    if (!hasSelected) return;

    if (typeof window === "undefined") return;

    window.localStorage.setItem("hasSelected", "true");
  }, [hasSelected]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasSelected(window.localStorage.getItem("hasSelected") == "true");
    setHasDragged(window.localStorage.getItem("hasDragged") == "true");
  }, []);

  // const calculateSpring = (pos: { x: number; y: number }) => {
  //   const dx = cursorPos.x - pos.x;
  //   const dy = cursorPos.y - pos.y;
  //   const distance = Math.sqrt(dx * dx + dy * dy);

  //   const FORCEFIELD_RADIUS = Math.max(artShape.width!, artShape.height!);

  //   if (distance < FORCEFIELD_RADIUS) {
  //     let moveAway = FORCEFIELD_RADIUS * 0;
  //     // Direction based on dx and dy
  //     const angle = Math.atan2(dy, dx);
  //     return {
  //       x: pos.x - Math.cos(angle) * moveAway,
  //       y: pos.y - Math.sin(angle) * moveAway,
  //     };
  //   }
  //   return pos;
  // };

  const handlePinchStart = (e: any) => {
    if (e.evt.touches.length !== 2) return;
  };

  const handleEvent = (e: any) => {
    // Not used now - it was used for shapes inteactively avoiding the cursor
    // const stage = e.target.getStage();
    // if (!stage) return;
    // // Check if event is a touch event
    // const touchEvent = e.evt.touches && e.evt.touches.length > 0;
    // // Use the first touch point if it's a touch event, else use mouse position
    // const pos = touchEvent
    //   ? { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY }
    //   : stage.getPointerPosition();
    // setCursorPos(pos);
  };

  /**
   * Calculates which shapes the character is overlapping with to dynamically update it's z inded
   * We might improve the smarts, right now setting a zIndex of 2 statically would basically be the
   * same thing I think.
   * @param props
   */
  const onDragMove = (props: {
    x: number;
    y: number;
    w: number;
    h: number;
    shape: Shape<ShapeConfig>;
  }) => {
    const { x, y, w, h } = props;
    const draggingItem: CanvasItem = {
      ...artShape,
      x,
      y,
      width: w,
      height: h,
    };

    const itemsIntersecting: CanvasItem[] = shapes.filter((item) => {
      return overlapRectRect(draggingItem, item) && item.zIndex !== 1;
    });

    // console.log(
    //   `itemsIntersecting = ${JSON.stringify(
    //     itemsIntersecting.map((i) => i.zIndex)
    //   )}`
    // );

    const yCutoff = y + h;

    // console.log(`yCutoff = ${yCutoff}`);

    const itemsBelow = itemsIntersecting.filter(
      (s) => s.height! + s.y > yCutoff
    );

    // console.log(
    //   `itemsBelow = ${JSON.stringify(itemsBelow.map((i) => i.zIndex))}`
    // );

    const lowestZIndexInBound = Math.min(...itemsBelow.map((i) => i.zIndex));

    const newZIndex = lowestZIndexInBound - 1;

    const currentZIndex = props.shape.getZIndex();
    if (lowestZIndexInBound && currentZIndex !== newZIndex && newZIndex > 1) {
      play({ id: "cowbell" });
      props.shape.setZIndex(newZIndex);
      props.shape.getLayer()?.batchDraw();
    }
  };

  return (
    <div
      style={{
        width: canvasRenderWidth,
        height: canvasRenderHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* @ts-ignore */}
      <p ref={pRef}></p>
      <Stage
        ref={stageRef}
        width={canvasRenderWidth}
        height={canvasRenderHeight}
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
        style={{
          borderWidth: 1,
          borderColor: "green",
        }}
      >
        <Layer>
          <Rect
            width={canvasRenderWidth}
            height={canvasRenderHeight}
            fill="#9EC517"
            onClick={() => setIsSelected(false)}
            onTap={() => setIsSelected(false)}
          />

          {shapes.map((shape, index) => {
            if (shape.userGenerated) {
              return (
                <ResizableArtwork
                  key={index}
                  shapeProps={{
                    height: shape.height!,
                    width: shape.width!,
                    x: shape.x,
                    y: shape.y,
                  }}
                  resizable={hasDragged}
                  image={shape.img!}
                  isSelected={isSelected}
                  onMouseOver={() => {
                    if (!hasDragged) {
                      setIsSelected(false);
                    }
                  }}
                  onSelect={() => {
                    if (hasDragged) {
                      setHasSelected(true);
                    }
                    setIsSelected(true);
                  }}
                  onChange={(newAttrs) => {
                    setArtShape({
                      ...artShape,
                      ...newAttrs,
                    });
                  }}
                  onDragStart={({ shape }) => {
                    setDragStarted(true);
                  }}
                  onDragMove={onDragMove}
                  onDragEnd={({ x, y, shape: dragShape }) => {
                    setHasDragged(true);

                    setArtShape({
                      ...shape,
                      x,
                      y,
                      zIndex: Math.max(dragShape.getZIndex(), MIN_Z_INDEX) || 1,
                    });
                  }}
                />
              );
            } else {
              const [image] = useImage(shape.img!);
              return (
                <Image
                  image={image}
                  // stroke={"lightgray"}
                  // strokeWidth={0.5}
                  key={shape.id}
                  width={shape.width}
                  height={shape.height}
                  x={shape.x}
                  y={shape.y}
                  listening={false}
                  // onClick={(evt) => {
                  //   console.log(`Clicked ${shape.img}`);
                  //   evt.target.setAttrs({
                  //     stroke:
                  //       evt.target.getAttr("stroke") === "red"
                  //         ? "lightgray"
                  //         : "red",
                  //   });
                  // }}
                  // onMouseDown={(evt) => {
                  //   console.log(`onMouseDown ${shape.img}`);
                  // }}
                />
              );
              // const springProps = useSpring({
              //   ...calculateSpring(shape),
              //   config: { tension: 170, friction: 20 },
              // });

              // return (
              //   // @ts-ignore
              //   <animated.Circle
              //     key={index}
              //     radius={shape.radius}
              //     fill="black"
              //     stroke="blue"
              //     strokeWidth={4}
              //     // x={shape.x}
              //     // y={shape.y}
              //     name={shape.id}
              //     zIndex={shape.zIndex}
              //     {...springProps}
              //   />
              // );
            }
          })}

          {/* {shapes.map((shape, index) => {
            return (
              <>
                <Rect
                  x={shape.width! * 0.5 + shape.x - 7.5}
                  y={shape.height! * 0.5 + shape.y - 5}
                  text={shape.zIndex + ""}
                  fontSize={10}
                  fill="white"
                  width={15}
                  height={15}
                  stroke={"purple"}
                  strokeWidth={0.5}
                  align="center"
                  wrap="word"
                />
                <Text
                  x={shape.width! * 0.5 + shape.x - 20}
                  y={shape.height! * 0.5 + shape.y}
                  text={shape.zIndex + ""}
                  fontSize={10}
                  fill="black"
                  width={40}
                  align="center"
                  wrap="word"
                />
              </>
            );
          })} */}

          {/* Add back for instructions using local storage to only show once */}
          {hasDragged === false && dragStarted === false && artShape.width && (
            <>
              <Arrow
                points={[
                  canvasRenderWidth / 2,
                  canvasRenderHeight * 0.8,
                  artShape.x + artShape.width! * 1.05,
                  artShape.y + artShape.height! * 1.05,
                ]}
                pointerLength={20}
                pointerWidth={20}
                fill="black"
                stroke="black"
                strokeWidth={6}
              />
              <Rect
                x={
                  canvasRenderWidth / 2 -
                  (textSize * instructionText.length) / 4
                }
                y={canvasRenderHeight * 0.8}
                width={(textSize * instructionText.length) / 2 + padding * 2}
                height={textSize + padding * 2}
                fill="black"
                cornerRadius={5}
              />

              <Text
                x={
                  canvasRenderWidth / 2 -
                  (textSize * instructionText.length) / 4 +
                  padding
                }
                y={canvasRenderHeight * 0.8 + padding}
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
                  canvasRenderWidth / 2,
                  canvasRenderHeight * 0.8,
                  artShape.x + artShape.width! * 0.5,
                  artShape.y + artShape.height! * 1.1,
                ]}
                pointerLength={20}
                pointerWidth={20}
                fill="black"
                stroke="blck"
                strokeWidth={6}
              />
              <Rect
                x={
                  canvasRenderWidth / 2 -
                  (textSize * resize_instructionText.length) / 4
                }
                y={canvasRenderHeight * 0.8}
                width={
                  (textSize * resize_instructionText.length) / 2 + padding * 2
                }
                height={textSize + padding * 2}
                fill="blck"
                cornerRadius={5}
              />

              <Text
                x={
                  canvasRenderWidth / 2 -
                  (textSize * resize_instructionText.length) / 4 +
                  padding
                }
                y={canvasRenderHeight * 0.8 + padding}
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
