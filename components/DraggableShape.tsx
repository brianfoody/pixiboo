import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Rect } from "react-konva";

type DraggableShapeProps = {
  fill: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onDragStart?: (x: number, y: number) => void;
  onDragMove?: (props: {
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
};

const DraggableShape: React.FC<DraggableShapeProps> = ({
  fill,
  x = 0,
  y = 0,
  width = 50,
  height = 70,
  onDragEnd,
  onDragStart,
  onDragMove,
}) => {
  return (
    <Rect
      draggable
      width={width}
      height={height}
      fill={fill}
      x={x}
      y={y}
      onDragStart={(e) => onDragStart?.(e.target.x(), e.target.y())}
      onDragEnd={(e) =>
        onDragEnd?.({
          x: e.target.x(),
          y: e.target.y(),
          shape: e.target as any,
        })
      }
      onDragMove={(e) => {
        onDragMove?.({
          x: e.target.x(),
          y: e.target.y(),
          w: e.target.width(),
          h: e.target.height(),
          shape: e.target as Shape<ShapeConfig>,
        });
      }}
    />
  );
};

export default DraggableShape;
