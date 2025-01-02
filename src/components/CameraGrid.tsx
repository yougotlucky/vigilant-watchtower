import React from 'react';
import { Camera } from '@/types/camera';
import CameraCard from './CameraCard';

interface CameraGridProps {
  cameras: Camera[];
  onToggleFullscreen?: (camera: Camera) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onToggleFullscreen }) => {
  // Determine grid columns based on number of cameras
  const getGridColumns = (count: number) => {
    if (count <= 4) return 'md:grid-cols-2';
    if (count <= 9) return 'md:grid-cols-3';
    return 'md:grid-cols-4';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 rounded-lg" />
      <div className={`grid grid-cols-1 ${getGridColumns(cameras.length)} gap-6 p-6 relative`}>
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="transform transition-all duration-300 hover:scale-[1.02] hover:z-10"
          >
            <CameraCard
              camera={camera}
              onToggleFullscreen={() => onToggleFullscreen?.(camera)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraGrid;