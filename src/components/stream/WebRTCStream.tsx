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

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }

      console.log(`Connecting to stream ${streamId} at ${serverAddress}...`);
      
      // First check if the stream exists and is running
      const checkResponse = await fetch(`${serverAddress}/streams`);
      if (!checkResponse.ok) {
        throw new Error(`Failed to check streams: ${await checkResponse.text()}`);
      }
      const streams = await checkResponse.json();
      console.log('Available streams:', streams);

      // Initialize WebRTC connection
      const response = await fetch(`${serverAddress}/stream/${streamId}/webrtc`);
      if (!response.ok) {
        throw new Error(`WebRTC setup failed: ${await response.text()}`);
      }

      const data = await response.json();
      console.log(`Received WebRTC offer:`, data);
      
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
        console.log(`Received track:`, event.streams[0]);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setIsLoading(false);
        }
      };

      pcRef.current.oniceconnectionstatechange = () => {
        console.log(`ICE connection state:`, pcRef.current?.iceConnectionState);
        if (pcRef.current?.iceConnectionState === 'failed' || 
            pcRef.current?.iceConnectionState === 'disconnected') {
          onError();
        }
      };

      pcRef.current.onicecandidate = ({ candidate }) => {
        console.log(`ICE candidate:`, candidate);
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      const result = await fetch(`${serverAddress}/stream/${streamId}/webrtc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: answer,
        }),
      });

      if (!result.ok) {
        throw new Error(`Failed to establish WebRTC connection: ${await result.text()}`);
      }

      console.log(`WebRTC connection established for stream ${streamId}`);
    } catch (error) {
      console.error(`Stream connection error:`, error);
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
  );
};

export default WebRTCStream;