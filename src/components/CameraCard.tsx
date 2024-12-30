import React from 'react';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Power, Camera as CameraIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCardProps {
  camera: Camera;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const { toast } = useToast();
  const [isStreamError, setIsStreamError] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleStreamError = () => {
    setIsStreamError(true);
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "Stream Error",
      description: `${camera.name} stream is unavailable`,
    });
  };

  React.useEffect(() => {
    let pc: RTCPeerConnection | null = null;

    const connectStream = async () => {
      try {
        // Replace with your RTSPtoWeb server address
        const response = await fetch(`http://localhost:8083/stream/${camera.id}/webrtc`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: ['stun:stun.l.google.com:19302']
            }
          ]
        });

        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            setIsLoading(false);
            setIsStreamError(false);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') {
            handleStreamError();
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const result = await fetch(`http://localhost:8083/stream/${camera.id}/webrtc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdp: answer,
          }),
        });

        if (!result.ok) {
          throw new Error('Failed to establish WebRTC connection');
        }
      } catch (error) {
        console.error('Stream connection error:', error);
        handleStreamError();
      }
    };

    if (camera.status === 'online') {
      connectStream();
    }

    return () => {
      if (pc) {
        pc.close();
      }
    };
  }, [camera.id, camera.status]);

  return (
    <Card className="bg-primary p-4 text-primary-foreground">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{camera.name}</h3>
          <div className="flex gap-2 mt-2">
            <Badge 
              variant={camera.status === 'online' && !isStreamError ? 'default' : 'destructive'}
              className={camera.status === 'error' || isStreamError ? 'animate-pulse-warning' : ''}
            >
              {isStreamError ? 'STREAM ERROR' : camera.status.toUpperCase()}
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
        {(camera.status === 'error' || isStreamError) && (
          <AlertCircle className="w-6 h-6 text-destructive animate-pulse-warning" />
        )}
      </div>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {camera.status === 'online' ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
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