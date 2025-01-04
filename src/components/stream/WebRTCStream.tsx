import React from 'react';
import { useToast } from "@/hooks/use-toast";

interface WebRTCStreamProps {
  streamId: number;
  onError: () => void;
  serverAddress: string;
}

const WebRTCStream = ({ streamId, onError, serverAddress }: WebRTCStreamProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const errorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = React.useRef(0);

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }

      const wsUrl = `${serverAddress.replace('http', 'ws')}/stream/channel/${streamId}/webrtc`;
      wsRef.current = new WebSocket(wsUrl);

      pcRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ]
      });

      pcRef.current.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
          reconnectAttempts.current = 0; // Reset attempts on successful connection
        }
      };

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            data: event.candidate
          }));
        }
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'offer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(msg.data));
          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer);
          
          wsRef.current?.send(JSON.stringify({
            type: 'answer',
            data: answer
          }));
        } else if (msg.type === 'candidate') {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(msg.data));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Only show error notification if we haven't shown one recently
        if (!errorTimeoutRef.current) {
          onError();
          // Set a timeout to prevent showing another error for 30 seconds
          errorTimeoutRef.current = setTimeout(() => {
            errorTimeoutRef.current = null;
          }, 30000);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed, attempting to reconnect...');
        reconnectAttempts.current++;
        
        // Exponential backoff for reconnection attempts
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        setTimeout(connectStream, delay);
      };

    } catch (error) {
      console.error('Stream connection error:', error);
      if (!errorTimeoutRef.current) {
        onError();
      }
    }
  };

  React.useEffect(() => {
    connectStream();
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [streamId]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-900 to-blue-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-white font-medium animate-pulse">
              Connecting to stream...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCStream;