import React from 'react';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Power, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendTelegramAlert, sendEmailAlert, sendWhatsAppAlert } from '@/utils/notifications';

interface CameraCardProps {
  camera: Camera;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const { toast } = useToast();
  const [isStreamError, setIsStreamError] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const lastNotificationRef = React.useRef<Date | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);

  const handleStreamError = async () => {
    setIsStreamError(true);
    setIsLoading(false);

    // Prevent notification spam by checking last notification time
    const now = new Date();
    if (!lastNotificationRef.current || 
        (now.getTime() - lastNotificationRef.current.getTime()) > 5 * 60 * 1000) {
      lastNotificationRef.current = now;
      
      const message = `⚠️ Camera Alert\n\nCamera: ${camera.name}\nStatus: Stream Unavailable\nTime: ${now.toLocaleString()}`;
      
      try {
        await Promise.all([
          sendTelegramAlert(message),
          sendEmailAlert(
            `Camera Alert - ${camera.name} Stream Error`,
            message
          ),
          sendWhatsAppAlert(message)
        ]);
      } catch (error) {
        console.error('Failed to send notifications:', error);
      }
    }

    toast({
      variant: "destructive",
      title: "Stream Error",
      description: `${camera.name} stream is unavailable`,
    });
  };

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }

      const serverAddress = 'http://192.168.31.37:8083'; // Your RTSPtoWeb server address
      console.log(`Connecting to stream ${camera.id}...`);
      
      const response = await fetch(`${serverAddress}/stream/${camera.id}/webrtc`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`WebRTC setup failed for camera ${camera.id}:`, errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log(`Received WebRTC offer for camera ${camera.id}:`, data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      pcRef.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302']
          }
        ]
      });

      pcRef.current.ontrack = (event) => {
        console.log(`Received track for camera ${camera.id}:`, event);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
          setIsStreamError(false);
        }
      };

      pcRef.current.oniceconnectionstatechange = () => {
        console.log(`ICE connection state changed for camera ${camera.id}:`, pcRef.current?.iceConnectionState);
        if (pcRef.current?.iceConnectionState === 'failed' || 
            pcRef.current?.iceConnectionState === 'disconnected') {
          handleStreamError();
        }
      };

      pcRef.current.onicecandidate = (event) => {
        console.log(`ICE candidate for camera ${camera.id}:`, event.candidate);
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      const result = await fetch(`${serverAddress}/stream/${camera.id}/webrtc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: answer,
        }),
      });

      if (!result.ok) {
        const errorText = await result.text();
        console.error(`Failed to send WebRTC answer for camera ${camera.id}:`, errorText);
        throw new Error(`Failed to establish WebRTC connection: ${errorText}`);
      }

      console.log(`WebRTC connection established for camera ${camera.id}`);
    } catch (error) {
      console.error(`Stream connection error for camera ${camera.id}:`, error);
      handleStreamError();
    }
  };

  React.useEffect(() => {
    if (camera.status === 'online') {
      connectStream();
    }

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
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