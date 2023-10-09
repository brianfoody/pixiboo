import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Fragment, useEffect, useRef } from "react";
import { Image, Rect, Transformer } from "react-konva";
import useImage from "use-image";

type ShapeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

const ResizableArtwork = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  image,
  onDragEnd,
  onDragStart,
  onDragMove,
}: {
  shapeProps: ShapeProps;
  isSelected: boolean;
  onSelect: () => void;
  image: string;
  onChange: (props: ShapeProps) => void;
  onDragStart?: (x: number, y: number) => void;
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
        onDragStart={(e) => onDragStart?.(e.target.x(), e.target.y())}
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
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Fragment>
  );
};

export default ResizableArtwork;
