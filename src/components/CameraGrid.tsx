import React from 'react';
import { Camera } from '@/types/camera';
import CameraCard from './CameraCard';

interface CameraGridProps {
  cameras: Camera[];
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras }) => {
  const [fullscreenCamera, setFullscreenCamera] = React.useState<Camera | null>(null);

  // Determine grid columns based on number of cameras
  const getGridColumns = (count: number) => {
    if (count <= 4) return 'md:grid-cols-2';
    if (count <= 9) return 'md:grid-cols-3';
    return 'md:grid-cols-4';
  };

  if (fullscreenCamera) {
    return (
      <CameraCard
        camera={fullscreenCamera}
        isFullscreen={true}
        onToggleFullscreen={() => setFullscreenCamera(null)}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 ${getGridColumns(cameras.length)} gap-4 p-4`}>
      {cameras.map((camera) => (
        <div
          key={camera.id}
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <CameraCard
            camera={camera}
            onToggleFullscreen={() => setFullscreenCamera(camera)}
          />
        </div>
      ))}
    </div>
  );
};

export default CameraGrid;