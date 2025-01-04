import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Save, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStreamSettings } from '@/hooks/useStreamSettings';

const CameraSettings = () => {
  const { toast } = useToast();
  const { 
    serverUrl,
    setServerUrl,
    streams,
    addStream,
    removeStream,
    updateStream,
    saveSettings
  } = useStreamSettings();

  return (
    <Card className="border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <LayoutGrid className="h-5 w-5" />
          Camera Settings ({streams.length} streams)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">RTSPtoWeb Server URL</Label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8083"
            className="bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 border-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={addStream}
            className="hover:bg-purple-500/20 text-white border-purple-500/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={removeStream}
            disabled={streams.length === 0}
            className="hover:bg-purple-500/20 text-white border-purple-500/20"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-white">
            {streams.length} stream{streams.length !== 1 ? 's' : ''} configured
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {streams.map((stream, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border-purple-500/20">
              <Input
                value={stream.name}
                onChange={(e) => updateStream(index, { ...stream, name: e.target.value })}
                placeholder="Stream Name"
                className="bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 border-purple-500/20"
              />
              <Input
                value={stream.url}
                onChange={(e) => updateStream(index, { ...stream, url: e.target.value })}
                placeholder="RTSP URL (e.g., rtsp://user:pass@ip:port/stream)"
                className="bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 border-purple-500/20"
              />
            </div>
          ))}
        </div>

        <Button 
          onClick={saveSettings} 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraSettings;