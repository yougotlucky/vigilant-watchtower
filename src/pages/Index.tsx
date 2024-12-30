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
    // Simulate status changes for demo
    const interval = setInterval(() => {
      setCameras(prev => {
        const newCameras = [...prev];
        const randomCamera = Math.floor(Math.random() * 4);
        if (newCameras[randomCamera].status === 'online') {
          newCameras[randomCamera] = {
            ...newCameras[randomCamera],
            status: 'error',
            lastUpdate: new Date(),
          };
          toast({
            title: "Camera Alert",
            description: `${newCameras[randomCamera].name} is experiencing issues`,
            variant: "destructive",
          });
        }
        return newCameras;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [toast]);

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