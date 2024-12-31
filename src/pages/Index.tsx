import React from 'react';
import CameraGrid from '@/components/CameraGrid';
import { Camera } from '@/types/camera';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = React.useState<Camera[]>([
    {
      id: 1,
      name: "Camera 1",
      status: 'online',
      streamUrl: "rtsp://admin:Aleem%401125@192.168.31.49:554/cam/realmonitor?channel=1&subtype=0",
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    },
    {
      id: 2,
      name: "Camera 2",
      status: 'online',
      streamUrl: "rtsp://admin:Aleem%401125@192.168.31.49:554/cam/realmonitor?channel=2&subtype=0",
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    },
    {
      id: 3,
      name: "Camera 3",
      status: 'online',
      streamUrl: "rtsp://admin:Aleem%401125@192.168.31.49:554/cam/realmonitor?channel=3&subtype=0",
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    },
    {
      id: 4,
      name: "Camera 4",
      status: 'online',
      streamUrl: "rtsp://admin:Aleem%401125@192.168.31.49:554/cam/realmonitor?channel=4&subtype=0",
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    },
  ]);

  React.useEffect(() => {
    const setupRTSPtoWeb = async () => {
      try {
        const serverAddress = 'http://192.168.31.37:8083'; // Your RTSPtoWeb server address
        console.log('Setting up streams for RTSPtoWeb...');
        
        // Add streams to RTSPtoWeb
        for (const camera of cameras) {
          console.log(`Adding stream for camera ${camera.id}:`, camera.streamUrl);
          const response = await fetch(`${serverAddress}/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: camera.id.toString(),
              uri: camera.streamUrl,
              on_demand: true,
              debug: true, // Enable debug mode
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to add stream ${camera.id}:`, errorText);
            throw new Error(`Failed to add stream ${camera.id}: ${errorText}`);
          }

          const result = await response.json();
          console.log(`Stream ${camera.id} setup response:`, result);
        }
      } catch (error) {
        console.error('Failed to setup RTSPtoWeb:', error);
        toast({
          variant: "destructive",
          title: "Setup Error",
          description: "Failed to initialize camera streams. Check console for details.",
        });
      }
    };

    setupRTSPtoWeb();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-accent p-4">
        <h1 className="text-2xl font-bold text-primary-foreground">CCTV Monitoring Dashboard</h1>
      </header>
      <main className="container mx-auto py-6">
        <CameraGrid cameras={cameras} />
      </main>
    </div>
  );
};

export default Index;