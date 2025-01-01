import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera } from '@/types/camera';
import { Plus, Minus, Save, Grid3x3, Grid4x4 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CameraSettings = () => {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = React.useState(localStorage.getItem('serverUrl') || 'http://192.168.31.37:8083');
  const [numCameras, setNumCameras] = React.useState(Number(localStorage.getItem('numCameras')) || 4);
  const [gridSize, setGridSize] = React.useState(Number(localStorage.getItem('gridSize')) || 2);
  const [cameras, setCameras] = React.useState<Camera[]>(() => {
    const savedCameras = localStorage.getItem('cameras');
    return savedCameras ? JSON.parse(savedCameras) : Array(4).fill(null).map((_, i) => ({
      id: i + 1,
      name: `Camera ${i + 1}`,
      status: 'online',
      streamUrl: "",
      powerStatus: true,
      isRecording: true,
      lastUpdate: new Date(),
    }));
  });

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
      setNumCameras(prev => prev + 1);
    }
  };

  const handleRemoveCamera = () => {
    if (cameras.length > 1) {
      setCameras(cameras.slice(0, -1));
      setNumCameras(prev => prev - 1);
    }
  };

  const handleSave = () => {
    localStorage.setItem('serverUrl', serverUrl);
    localStorage.setItem('numCameras', numCameras.toString());
    localStorage.setItem('gridSize', gridSize.toString());
    localStorage.setItem('cameras', JSON.stringify(cameras));
    
    toast({
      title: "Settings Saved",
      description: "Camera settings have been saved successfully.",
    });
  };

  const updateCamera = (index: number, field: keyof Camera, value: any) => {
    const newCameras = [...cameras];
    newCameras[index] = { ...newCameras[index], [field]: value };
    setCameras(newCameras);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {gridSize <= 3 ? <Grid3x3 className="h-5 w-5" /> : <Grid4x4 className="h-5 w-5" />}
          Camera Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>RTSPtoWeb Server URL</Label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://192.168.31.37:8083"
          />
        </div>

        <div className="space-y-2">
          <Label>Grid Layout</Label>
          <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number(value))}>
            <SelectTrigger>
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
            className="hover:bg-secondary/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRemoveCamera} 
            disabled={cameras.length <= 1}
            className="hover:bg-secondary/10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {cameras.length} camera{cameras.length !== 1 ? 's' : ''} configured (max 16)
          </span>
        </div>

        <div className="space-y-4">
          {cameras.map((camera, index) => (
            <div key={camera.id} className="space-y-2 p-4 border rounded-lg bg-accent/5">
              <div className="flex items-center gap-4">
                <Input
                  value={camera.name}
                  onChange={(e) => updateCamera(index, 'name', e.target.value)}
                  placeholder="Camera Name"
                  className="bg-background"
                />
              </div>
              <Input
                value={camera.streamUrl}
                onChange={(e) => updateCamera(index, 'streamUrl', e.target.value)}
                placeholder="RTSP URL (e.g., rtsp://username:password@ip:port/stream)"
                className="bg-background"
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraSettings;