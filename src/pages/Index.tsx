import React from 'react';
import CameraGrid from '@/components/CameraGrid';
import NotificationSettings from '@/components/settings/NotificationSettings';
import CameraSettings from '@/components/settings/CameraSettings';
import LoginForm from '@/components/auth/LoginForm';
import { Camera } from '@/types/camera';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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
import CameraCard from '@/components/CameraCard';

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => 
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [fullscreenCamera, setFullscreenCamera] = React.useState<Camera | null>(null);
  const [cameras, setCameras] = React.useState<Camera[]>(() => {
    const savedCameras = localStorage.getItem('cameras');
    if (savedCameras) {
      return JSON.parse(savedCameras);
    }
    return Array(4).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Camera ${i + 1}`,
      status: 'online',
      streamUrl: `rtsp://admin:Aleem%401125@192.168.31.49:554/cam/realmonitor?channel=${i + 1}&subtype=0`,
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    }));
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const savedCameras = localStorage.getItem('cameras');
      if (savedCameras) {
        setCameras(JSON.parse(savedCameras));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={setIsAuthenticated} />;
  }

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
                  <TabsContent value="notifications" className="h-[calc(100vh-12rem)] overflow-y-auto">
                    <NotificationSettings />
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="container mx-auto py-6">
        {fullscreenCamera ? (
          <div className="fixed inset-0 z-50 bg-background p-6">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setFullscreenCamera(null)}
            >
              <span className="sr-only">Close fullscreen</span>
              ×
            </Button>
            <div className="h-full">
              <CameraCard
                camera={fullscreenCamera}
                isFullscreen={true}
                onToggleFullscreen={() => setFullscreenCamera(null)}
              />
            </div>
          </div>
        ) : (
          <CameraGrid
            cameras={cameras}
            onToggleFullscreen={setFullscreenCamera}
          />
        )}
      </main>
    </div>
  );
};

export default Index;