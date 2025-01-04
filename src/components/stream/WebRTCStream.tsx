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

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Initialize WebSocket connection to RTSPtoWeb
      const wsUrl = `${serverAddress.replace('http', 'ws')}/stream/channel/${streamId}/webrtc`;
      wsRef.current = new WebSocket(wsUrl);

      // Initialize WebRTC peer connection
      pcRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ]
      });

      // Handle incoming tracks
      pcRef.current.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
        }
      };

      // Handle ICE candidates
      pcRef.current.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            data: event.candidate
          }));
        }
      };

      // Handle WebSocket messages
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
        onError();
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed, attempting to reconnect...');
        setTimeout(connectStream, 5000);
      };

    } catch (error) {
      console.error('Stream connection error:', error);
      onError();
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
            <p className="text-sm text-white font-medium">
              Connecting to stream...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCStream;