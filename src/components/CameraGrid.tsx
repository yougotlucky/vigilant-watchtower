import React from 'react';
import { Camera } from '@/types/camera';
import CameraCard from './CameraCard';

interface CameraGridProps {
  cameras: Camera[];
  onCameraClick?: (camera: Camera) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onCameraClick }) => {
  const gridSize = Math.ceil(Math.sqrt(cameras.length));
  const gridClass = `grid grid-cols-1 md:grid-cols-${gridSize} lg:grid-cols-${gridSize} gap-4 p-4`;

  return (
    <div className={gridClass}>
      {cameras.map((camera) => (
        <div
          key={camera.id}
          className="cursor-pointer"
          onClick={() => onCameraClick?.(camera)}
        >
          <CameraCard camera={camera} />
        </div>
      ))}
    </div>
  );
};

export default CameraGrid;