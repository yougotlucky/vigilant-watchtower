import React from 'react';

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
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }

      console.log(`Connecting to stream ${streamId} at ${serverAddress}...`);

      // Initialize WebSocket connection
      const wsUrl = `${serverAddress.replace('http', 'ws')}/stream/channel/${streamId}/webrtc/ws`;
      wsRef.current = new WebSocket(wsUrl);

      // Initialize WebRTC connection with STUN/TURN servers
      pcRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
          {
            urls: 'turn:turn.example.com:3478',
            username: 'webrtc',
            credential: 'turnserver'
          }
        ],
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      // Set up media handlers
      pcRef.current.ontrack = (event) => {
        console.log(`Received track for stream ${streamId}:`, event.streams[0]);
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
        }
      };

      pcRef.current.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for stream ${streamId}:`, pcRef.current?.iceConnectionState);
        if (pcRef.current?.iceConnectionState === 'failed' || 
            pcRef.current?.iceConnectionState === 'disconnected') {
          handleStreamError();
        }
      };

      // WebSocket message handling
      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'offer') {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pcRef.current?.createAnswer();
          await pcRef.current?.setLocalDescription(answer);
          
          wsRef.current?.send(JSON.stringify({
            type: 'answer',
            sdp: answer?.sdp
          }));
        } else if (data.type === 'candidate') {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error(`WebSocket error for stream ${streamId}:`, error);
        handleStreamError();
      };

      wsRef.current.onclose = () => {
        console.log(`WebSocket closed for stream ${streamId}`);
        handleStreamError();
      };

      // Handle ICE candidates
      pcRef.current.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            candidate: event.candidate
          }));
        }
      };

      console.log(`WebRTC connection established for stream ${streamId}`);
      setRetryCount(0);
    } catch (error) {
      console.error(`Stream ${streamId} connection error:`, error);
      handleStreamError();
    }
  };

  const handleStreamError = () => {
    if (retryCount < maxRetries) {
      console.log(`Retrying stream ${streamId} connection in 5 seconds...`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        connectStream();
      }, 5000);
    } else {
      console.error(`Stream ${streamId} failed after ${maxRetries} attempts`);
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
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-950">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-300 font-medium">
              {retryCount > 0 ? `Connecting... (Attempt ${retryCount}/${maxRetries})` : 'Connecting...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCStream;