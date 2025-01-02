import React from 'react';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { AlertCircle, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendTelegramAlert, sendEmailAlert, sendWhatsAppAlert } from '@/utils/notifications';
import WebRTCStream from './stream/WebRTCStream';
import StreamStatus from './stream/StreamStatus';
import { Button } from './ui/button';

interface CameraCardProps {
  camera: Camera;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const CameraCard: React.FC<CameraCardProps> = ({ 
  camera, 
  isFullscreen = false,
  onToggleFullscreen 
}) => {
  const { toast } = useToast();
  const [isStreamError, setIsStreamError] = React.useState(false);
  const [reconnectCount, setReconnectCount] = React.useState(0);
  const lastNotificationRef = React.useRef<Date | null>(null);

  const handleStreamError = async () => {
    setIsStreamError(true);
    setReconnectCount(prev => prev + 1);

    const now = new Date();
    if (!lastNotificationRef.current || 
        (now.getTime() - lastNotificationRef.current.getTime()) > 5 * 60 * 1000) {
      lastNotificationRef.current = now;
      
      const message = `⚠️ Camera Alert\n\nCamera: ${camera.name}\nStatus: Stream Unavailable\nReconnection Attempts: ${reconnectCount}\nTime: ${now.toLocaleString()}`;
      
      try {
        await Promise.all([
          sendTelegramAlert(message),
          sendEmailAlert(
            `Camera Alert - ${camera.name} Stream Error`,
            message
          ),
          sendWhatsAppAlert(message)
        ]);

        toast({
          title: "Alert Sent",
          description: "Notification alerts have been sent to all configured channels.",
          variant: "default"
        });
      } catch (error) {
        console.error('Failed to send notifications:', error);
        toast({
          variant: "destructive",
          title: "Notification Error",
          description: "Failed to send alerts. Please check your notification settings.",
        });
      }
    }
  };

  const containerClassName = isFullscreen 
    ? "fixed inset-0 z-50 bg-background p-6" 
    : "relative w-full h-full";

  const cardClassName = isFullscreen 
    ? "h-full bg-card" 
    : "bg-card";

  return (
    <Card className={cardClassName}>
      <div className="flex justify-between items-start p-4">
        <div>
          <h3 className="text-lg font-semibold">{camera.name}</h3>
          <StreamStatus
            status={camera.status}
            powerStatus={camera.powerStatus}
            isRecording={camera.isRecording}
            isStreamError={isStreamError}
            reconnectCount={reconnectCount}
          />
        </div>
        <div className="flex items-center gap-2">
          {(camera.status === 'error' || isStreamError) && (
            <AlertCircle className="w-6 h-6 text-destructive animate-pulse" />
          )}
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="hover:bg-accent"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      <div className={`relative ${isFullscreen ? 'h-[calc(100%-8rem)]' : 'aspect-video'} bg-black rounded-lg overflow-hidden mx-4 mb-4`}>
        {camera.status === 'online' ? (
          <WebRTCStream
            streamId={camera.id}
            onError={handleStreamError}
            serverAddress={localStorage.getItem('serverUrl') || 'http://localhost:8083'}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span>Stream Unavailable</span>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        Last Updated: {new Date(camera.lastUpdate).toLocaleString()}
      </div>
    </Card>
  );
};

export default CameraCard;