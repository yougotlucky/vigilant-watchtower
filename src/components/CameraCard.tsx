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
          title: "Notifications Sent",
          description: "Alert notifications have been sent to all configured channels.",
        });
      } catch (error) {
        console.error('Failed to send notifications:', error);
        toast({
          variant: "destructive",
          title: "Notification Error",
          description: "Failed to send notifications. Check your notification settings.",
        });
      }
    }
  };

  const cardClassName = isFullscreen 
    ? "fixed inset-4 z-50 bg-primary p-4 text-primary-foreground rounded-lg shadow-xl" 
    : "bg-primary p-4 text-primary-foreground";

  return (
    <Card className={cardClassName}>
      <div className="flex justify-between items-start mb-4">
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
            <AlertCircle className="w-6 h-6 text-destructive animate-pulse-warning" />
          )}
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="hover:bg-primary-foreground/10"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
      <div className={`relative ${isFullscreen ? 'h-[calc(100%-6rem)]' : 'aspect-video'} bg-black rounded-lg overflow-hidden`}>
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
      <div className="mt-2 text-sm text-muted-foreground">
        Last Updated: {new Date(camera.lastUpdate).toLocaleString()}
      </div>
    </Card>
  );
};

export default CameraCard;