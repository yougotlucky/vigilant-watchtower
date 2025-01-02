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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent">
      <header className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 sticky top-0 z-40 w-full border-b shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            CCTV Monitoring Dashboard
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative hover:bg-accent/50">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full max-w-md sm:max-w-xl border-l border-accent/20 backdrop-blur-xl bg-card/95"
            >
              <SheetHeader className="space-y-2">
                <SheetTitle className="text-2xl font-bold">Settings</SheetTitle>
                <SheetDescription>
                  Configure your cameras and notification preferences
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 h-[calc(100vh-10rem)] overflow-hidden">
                <Tabs defaultValue="cameras" className="h-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="cameras" className="text-sm sm:text-base">
                      Cameras
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="text-sm sm:text-base">
                      Notifications
                    </TabsTrigger>
                  </TabsList>
                  <div className="overflow-y-auto h-[calc(100%-3rem)] px-1">
                    <TabsContent value="cameras" className="mt-0">
                      <CameraSettings />
                    </TabsContent>
                    <TabsContent value="notifications" className="mt-0">
                      <NotificationSettings />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        {!isAuthenticated ? (
          <LoginForm onLogin={setIsAuthenticated} />
        ) : fullscreenCamera ? (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => setFullscreenCamera(null)}
            >
              <span className="sr-only">Close fullscreen</span>
              ×
            </Button>
            <div className="h-full max-h-[calc(100vh-2rem)] rounded-lg overflow-hidden">
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