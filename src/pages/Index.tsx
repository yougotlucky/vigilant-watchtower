import React from 'react';
import CameraGrid from '@/components/CameraGrid';
import NotificationSettings from '@/components/settings/NotificationSettings';
import CameraSettings from '@/components/settings/CameraSettings';
import LoginForm from '@/components/auth/LoginForm';
import { Camera } from '@/types/camera';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Settings, Maximize2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => 
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [selectedCamera, setSelectedCamera] = React.useState<Camera | null>(null);
  const [cameras, setCameras] = React.useState<Camera[]>(() => {
    const savedCameras = localStorage.getItem('cameras');
    return savedCameras ? JSON.parse(savedCameras) : [
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
    ];
  });

  React.useEffect(() => {
    const setupRTSPtoWeb = async () => {
      try {
        const serverAddress = localStorage.getItem('serverUrl') || 'http://192.168.31.37:8083';
        const username = 'admin';
        const password = 'Aleem@1125';
        const authHeader = 'Basic ' + btoa(`${username}:${password}`);

        console.log('Setting up streams for RTSPtoWeb...');
        
        const checkResponse = await fetch(`${serverAddress}/streams`, {
          headers: {
            'Authorization': authHeader
          }
        });
        
        if (!checkResponse.ok) {
          throw new Error('RTSPtoWeb server is not accessible');
        }
        
        for (const camera of cameras) {
          if (!camera.streamUrl) continue;
          
          console.log(`Adding stream for camera ${camera.id}:`, camera.streamUrl);
          const response = await fetch(`${serverAddress}/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify({
              name: camera.id.toString(),
              uri: camera.streamUrl,
              on_demand: true,
              debug: true,
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

    if (isAuthenticated) {
      setupRTSPtoWeb();
    }
  }, [cameras, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={setIsAuthenticated} />;
  }

  const gridSize = Number(localStorage.getItem('gridSize')) || 2;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CCTV Monitoring Dashboard</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Configure your cameras and notification preferences
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <Tabs defaultValue="cameras">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cameras">Cameras</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cameras">
                    <CameraSettings />
                  </TabsContent>
                  <TabsContent value="notifications">
                    <NotificationSettings />
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="container mx-auto py-6">
        {selectedCamera ? (
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setSelectedCamera(null)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="aspect-video">
              <CameraGrid
                cameras={[selectedCamera]}
                onCameraClick={setSelectedCamera}
              />
            </div>
          </div>
        ) : (
          <CameraGrid
            cameras={cameras.slice(0, gridSize * gridSize)}
            onCameraClick={setSelectedCamera}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
