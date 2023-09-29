import { Circle, Shape } from "react-konva";

type DraggableShapeProps = {
  shape: string;
  color: string;
  x?: number;
  y?: number;
  radius?: number;
  onDragStart?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
};

const DraggableShape: React.FC<DraggableShapeProps> = ({
  shape,
  color,
  x = 0,
  y = 0,
  radius = 50,
  onDragEnd,
  onDragStart,
}) => {
  return (
    <Circle
      draggable
      radius={radius}
      fill={color}
      x={x}
      y={y}
      onDragStart={(e) => onDragStart?.(e.target.x(), e.target.y())}
      onDragEnd={(e) => onDragEnd?.(e.target.x(), e.target.y())}
    />
  );
};

export default DraggableShape;
