import React from 'react';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Power, Camera as CameraIcon, AlertCircle } from 'lucide-react';

interface CameraCardProps {
  camera: Camera;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  return (
    <Card className="bg-primary p-4 text-primary-foreground">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{camera.name}</h3>
          <div className="flex gap-2 mt-2">
            <Badge 
              variant={camera.status === 'online' ? 'default' : 'destructive'}
              className={camera.status === 'error' ? 'animate-pulse-warning' : ''}
            >
              {camera.status.toUpperCase()}
            </Badge>
            {camera.powerStatus ? (
              <Badge variant="secondary">
                <Power className="w-4 h-4 mr-1" />
                Power On
              </Badge>
            ) : (
              <Badge variant="destructive" className="animate-pulse-warning">
                <Power className="w-4 h-4 mr-1" />
                Power Off
              </Badge>
            )}
            {camera.isRecording && (
              <Badge variant="secondary">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                Recording
              </Badge>
            )}
          </div>
        </div>
        {camera.status === 'error' && (
          <AlertCircle className="w-6 h-6 text-destructive animate-pulse-warning" />
        )}
      </div>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {camera.status === 'online' ? (
          <div className="absolute inset-0 bg-black">
            {/* Stream component will be added here */}
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <CameraIcon className="w-8 h-8" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span>Stream Unavailable</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Last Updated: {new Date(camera.lastUpdate).toLocaleString()}
      </div>
    </Card>
  );
};

export default CameraCard;