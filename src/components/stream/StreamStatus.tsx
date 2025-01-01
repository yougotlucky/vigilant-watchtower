import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Power, RefreshCw } from 'lucide-react';

interface StreamStatusProps {
  status: 'online' | 'offline' | 'error';
  powerStatus: boolean;
  isRecording: boolean;
  isStreamError: boolean;
  reconnectCount: number;
}

const StreamStatus: React.FC<StreamStatusProps> = ({
  status,
  powerStatus,
  isRecording,
  isStreamError,
  reconnectCount
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge 
        variant={status === 'online' && !isStreamError ? 'default' : 'destructive'}
        className={status === 'error' || isStreamError ? 'animate-pulse-warning' : ''}
      >
        {isStreamError ? 'STREAM ERROR' : status.toUpperCase()}
      </Badge>
      {powerStatus ? (
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
      {isRecording && (
        <Badge variant="secondary">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          Recording
        </Badge>
      )}
      {reconnectCount > 0 && (
        <Badge variant="outline">
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry {reconnectCount}
        </Badge>
      )}
    </div>
  );
};

export default StreamStatus;