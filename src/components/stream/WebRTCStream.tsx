import React from 'react';

interface WebRTCStreamProps {
  streamId: number;
  onError: () => void;
  serverAddress: string;
}

const WebRTCStream = ({ streamId, onError, serverAddress }: WebRTCStreamProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }

      console.log(`Connecting to stream ${streamId} at ${serverAddress}...`);

      // Initialize WebRTC connection with more ICE servers
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
        if (videoRef.current) {
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

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`New ICE candidate for stream ${streamId}:`, event.candidate);
        }
      };

      // Create and send offer
      const offer = await pcRef.current.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });
      
      await pcRef.current.setLocalDescription(offer);

      const response = await fetch(`${serverAddress}/stream/${streamId}/webrtc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type
        }),
      });

      if (!response.ok) {
        throw new Error(`WebRTC setup failed: ${response.status}`);
      }

      const answer = await response.json();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));

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