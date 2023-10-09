import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Fragment, useEffect, useRef } from "react";
import { Image, Rect, Transformer } from "react-konva";
import useImage from "use-image";

type ShapeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const ResizableArtwork = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  resizable,
  image,
  onDragEnd,
  onDragStart,
  onDragMove,
  onMouseOver,
}: {
  shapeProps: ShapeProps;
  isSelected: boolean;
  onSelect: () => void;
  image: string;
  onChange: (props: ShapeProps) => void;
  resizable: boolean;
  onMouseOver: () => void;
  onDragStart?: (props: {
    x: number;
    y: number;
    w: number;
    h: number;
    shape: Shape<ShapeConfig>;
  }) => void;
  onDragEnd?: (props: {
    x: number;
    y: number;
    shape: Shape<ShapeConfig>;
  }) => void;
  onDragMove?: (props: {
    x: number;
    y: number;
    w: number;
    h: number;
    shape: Shape<ShapeConfig>;
  }) => void;
}) => {
  const [usedImage] = useImage(image);
  const shapeRef = useRef<any | undefined>();
  const trRef = useRef<any | undefined>();

  useEffect(() => {
    if (!trRef.current) return;
    if (!isSelected) return;
    // we need to attach transformer manually
    // @ts-ignore
    trRef.current.nodes([shapeRef.current]);
    // @ts-ignore
    trRef.current.getLayer().batchDraw();
  }, [isSelected]);

  return (
    <Fragment>
      <Image
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onMouseEnter={onMouseOver}
        onDragStart={(e) =>
          onDragStart?.({
            x: e.target.x(),
            y: e.target.y(),
            w: e.target.width(),
            h: e.target.height(),
            shape: e.target as Shape<ShapeConfig>,
          })
        }
        onDragMove={(e) =>
          onDragMove?.({
            x: e.target.x(),
            y: e.target.y(),
            w: e.target.width(),
            h: e.target.height(),
            shape: e.target as Shape<ShapeConfig>,
          })
        }
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });

          onDragEnd?.({
            x: e.target.x(),
            y: e.target.y(),
            shape: e.target as any,
          });
        }}
        onMouseOver={() => console.log("mouse over")}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        image={usedImage}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          centeredScaling
          boundBoxFunc={(oldBox, newBox) => {
            if (!resizable) {
              return oldBox;
            }
            // limit resize
            if (newBox.width < 15 || newBox.height < 15) {
              return oldBox;
            }

            const widthDiff = newBox.width - oldBox.width;
            const heightDiff = newBox.height - oldBox.height;

            if (widthDiff === 0 && heightDiff !== 0) {
              return {
                ...newBox,
                width: oldBox.width * (newBox.height / oldBox.height),
              };
            } else if (widthDiff !== 0 && heightDiff === 0) {
              return {
                ...newBox,
                height: oldBox.height * (newBox.width / oldBox.width),
              };
            } else {
              return newBox;
            }
          }}
        />
      )}
    </Fragment>
  );
};

export default ResizableArtwork;
