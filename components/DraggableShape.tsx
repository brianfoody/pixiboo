import { Rect } from "react-konva";

type DraggableShapeProps = {
  fill: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  onDragStart?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
};

const DraggableShape: React.FC<DraggableShapeProps> = ({
  fill,
  x = 0,
  y = 0,
  width = 50,
  height = 70,
  onDragEnd,
  onDragStart,
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
      onDragEnd={(e) => onDragEnd?.(e.target.x(), e.target.y())}
    />
  );
};

export default DraggableShape;
