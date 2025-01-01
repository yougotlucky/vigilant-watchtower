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

  // RTSPtoWeb credentials
  const username = 'admin';
  const password = 'Aleem@1125';

  const connectStream = async () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
      }

      console.log(`Connecting to stream ${streamId} at ${serverAddress}... (Attempt ${retryCount + 1}/${maxRetries})`);
      
      // Create Basic Auth header
      const authHeader = 'Basic ' + btoa(`${username}:${password}`);
      
      // First check if the stream exists and is running
      const checkResponse = await fetch(`${serverAddress}/streams`, {
        headers: {
          'Authorization': authHeader,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!checkResponse.ok) {
        throw new Error(`Failed to check streams: ${checkResponse.status} - ${await checkResponse.text()}`);
      }
      const streams = await checkResponse.json();
      console.log('Available streams:', streams);

      // Initialize WebRTC connection
      const response = await fetch(`${serverAddress}/stream/${streamId}/webrtc`, {
        headers: {
          'Authorization': authHeader,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`WebRTC setup failed: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      console.log(`Received WebRTC offer for stream ${streamId}:`, data);
      
      if (data.error) {
        throw new Error(`Server error: ${data.error}`);
      }

      pcRef.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302']
          }
        ]
      });

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

      pcRef.current.onicecandidate = ({ candidate }) => {
        console.log(`ICE candidate for stream ${streamId}:`, candidate);
      };

      await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      const result = await fetch(`${serverAddress}/stream/${streamId}/webrtc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          sdp: answer,
        }),
      });

      if (!result.ok) {
        throw new Error(`Failed to establish WebRTC connection: ${result.status} - ${await result.text()}`);
      }

      console.log(`WebRTC connection established for stream ${streamId}`);
      setRetryCount(0); // Reset retry count on successful connection
    } catch (error) {
      console.error(`Stream ${streamId} connection error:`, error);
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.error('CORS or network connectivity issue detected');
      }
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
        console.log(`Cleaning up WebRTC connection for stream ${streamId}`);
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
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Connecting... (Attempt ${retryCount}/${maxRetries})` : 'Connecting...'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WebRTCStream;