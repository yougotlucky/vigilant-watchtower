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
        className={`${status === 'error' || isStreamError ? 'animate-pulse-warning bg-red-500/20 text-red-400 border-red-500/30' : 
          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} backdrop-blur-sm`}
      >
        {isStreamError ? 'STREAM ERROR' : status.toUpperCase()}
      </Badge>
      {powerStatus ? (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm">
          <Power className="w-4 h-4 mr-1" />
          Power On
        </Badge>
      ) : (
        <Badge variant="destructive" className="animate-pulse-warning bg-amber-500/20 text-amber-400 border-amber-500/30 backdrop-blur-sm">
          <Power className="w-4 h-4 mr-1" />
          Power Off
        </Badge>
      )}
      {isRecording && (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30 backdrop-blur-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          Recording
        </Badge>
      )}
      {reconnectCount > 0 && (
        <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30 backdrop-blur-sm">
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          Retry {reconnectCount}
        </Badge>
      )}
    </div>
  );
};

export default StreamStatus;