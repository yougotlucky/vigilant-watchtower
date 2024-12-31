import React from 'react';
import { Camera } from '@/types/camera';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendTelegramAlert, sendEmailAlert, sendWhatsAppAlert } from '@/utils/notifications';
import WebRTCStream from './stream/WebRTCStream';
import StreamStatus from './stream/StreamStatus';

interface CameraCardProps {
  camera: Camera;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const { toast } = useToast();
  const [isStreamError, setIsStreamError] = React.useState(false);
  const lastNotificationRef = React.useRef<Date | null>(null);
  const serverAddress = 'http://192.168.31.37:8083';

  const handleStreamError = async () => {
    setIsStreamError(true);

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

  return (
    <Card className="bg-primary p-4 text-primary-foreground">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{camera.name}</h3>
          <StreamStatus
            status={camera.status}
            powerStatus={camera.powerStatus}
            isRecording={camera.isRecording}
            isStreamError={isStreamError}
          />
        </div>
        {(camera.status === 'error' || isStreamError) && (
          <AlertCircle className="w-6 h-6 text-destructive animate-pulse-warning" />
        )}
      </div>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {camera.status === 'online' ? (
          <WebRTCStream
            streamId={camera.id}
            onError={handleStreamError}
            serverAddress={serverAddress}
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