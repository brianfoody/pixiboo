import { Circle, Shape } from "react-konva";

type DraggableShapeProps = {
  shape: string;
  color: string;
  x?: number;
  y?: number;
  radius?: number;
  onDragEnd?: (x: number, y: number) => void;
};

const DraggableShape: React.FC<DraggableShapeProps> = ({
  shape,
  color,
  x = 0,
  y = 0,
  radius = 50,
  onDragEnd,
}) => {
  return (
    <Circle
      draggable
      radius={radius}
      fill={color}
      x={x}
      y={y}
      onDragEnd={(e) => onDragEnd?.(e.target.x(), e.target.y())}
    />
  );
};

export default DraggableShape;
