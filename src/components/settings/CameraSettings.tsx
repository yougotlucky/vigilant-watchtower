import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from '@/types/camera';
import { Plus, Minus, Save, Grid2x2, Grid3x3, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Stream {
  name: string;
  channels: {
    [key: string]: {
      on: boolean;
      url: string;
    };
  };
}

const CameraSettings = () => {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = React.useState(localStorage.getItem('serverUrl') || 'http://localhost:8083');
  const [gridSize, setGridSize] = React.useState(Number(localStorage.getItem('gridSize')) || 2);
  const [cameras, setCameras] = React.useState<Camera[]>(() => {
    const savedCameras = localStorage.getItem('cameras');
    return savedCameras ? JSON.parse(savedCameras) : [];
  });

  const fetchStreams = async () => {
    try {
      const response = await fetch(`${serverUrl}/streams`);
      if (!response.ok) throw new Error('Failed to fetch streams');
      const data = await response.json();
      
      // Convert RTSPtoWeb streams to our camera format
      const newCameras: Camera[] = Object.entries(data.streams).map(([name, stream]: [string, Stream], index) => ({
        id: index + 1,
        name: name,
        status: 'online',
        streamUrl: Object.values(stream.channels)[0]?.url || '',
        powerStatus: Object.values(stream.channels)[0]?.on || false,
        isRecording: true,
        lastUpdate: new Date(),
      }));

      setCameras(newCameras);
      localStorage.setItem('cameras', JSON.stringify(newCameras));
      
      toast({
        title: "Streams Loaded",
        description: `Successfully loaded ${newCameras.length} cameras.`,
      });
    } catch (error) {
      console.error('Failed to fetch streams:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to fetch streams from RTSPtoWeb server.",
      });
    }
  };

  const handleAddCamera = () => {
    if (cameras.length < 16) {
      setCameras([...cameras, {
        id: cameras.length + 1,
        name: `Camera ${cameras.length + 1}`,
        status: 'online',
        streamUrl: "",
        powerStatus: true,
        isRecording: true,
        lastUpdate: new Date(),
      }]);
    }
  };

  const handleRemoveCamera = () => {
    if (cameras.length > 1) {
      setCameras(cameras.slice(0, -1));
    }
  };

  const handleSave = async () => {
    try {
      // Test RTSPtoWeb server connection
      const response = await fetch(`${serverUrl}/streams`);
      if (!response.ok) {
        throw new Error('Failed to connect to RTSPtoWeb server');
      }

      localStorage.setItem('serverUrl', serverUrl);
      localStorage.setItem('gridSize', gridSize.toString());
      localStorage.setItem('cameras', JSON.stringify(cameras));
      
      await fetchStreams();

      toast({
        title: "Settings Saved",
        description: "Camera settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to RTSPtoWeb server. Please check the server URL.",
      });
    }
  };

  const updateCamera = (index: number, field: keyof Camera, value: any) => {
    const newCameras = [...cameras];
    newCameras[index] = { ...newCameras[index], [field]: value };
    setCameras(newCameras);
  };

  React.useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <Card className="border border-accent/20 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary-foreground">
          <LayoutGrid className="h-5 w-5" />
          Camera Settings ({cameras.length}/16 cameras)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-primary-foreground">RTSPtoWeb Server URL</Label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8083"
            className="bg-background/50 backdrop-blur-sm text-primary-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-primary-foreground">Grid Layout</Label>
          <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number(value))}>
            <SelectTrigger className="bg-background/50 backdrop-blur-sm text-primary-foreground">
              <SelectValue placeholder="Select grid size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2x2 (4 cameras)</SelectItem>
              <SelectItem value="3">3x3 (9 cameras)</SelectItem>
              <SelectItem value="4">4x4 (16 cameras)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleAddCamera}
            disabled={cameras.length >= 16}
            className="hover:bg-secondary/10 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRemoveCamera}
            disabled={cameras.length <= 1}
            className="hover:bg-secondary/10 text-primary-foreground"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-primary-foreground">
            {cameras.length} camera{cameras.length !== 1 ? 's' : ''} configured
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {cameras.map((camera, index) => (
            <div key={camera.id} className="space-y-2 p-4 border rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 backdrop-blur-sm">
              <Input
                value={camera.name}
                onChange={(e) => updateCamera(index, 'name', e.target.value)}
                placeholder="Camera Name"
                className="bg-background/50 backdrop-blur-sm text-primary-foreground"
              />
              <Input
                value={camera.streamUrl}
                onChange={(e) => updateCamera(index, 'streamUrl', e.target.value)}
                placeholder="RTSP URL (e.g., rtsp://user:pass@ip:port/stream)"
                className="bg-background/50 backdrop-blur-sm text-primary-foreground"
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraSettings;